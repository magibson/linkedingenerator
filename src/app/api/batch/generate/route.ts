import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendDigestEmail, isEmailConfigured, PostForEmail } from "@/lib/email";

const SYSTEM_PROMPT = `You are an expert LinkedIn content creator. You write engaging, authentic posts that resonate with professional audiences.

Your posts:
- Start with a strong hook that stops the scroll
- Use short paragraphs and line breaks for readability
- Include relevant insights and value
- End with a call to action or thought-provoking question
- Feel genuine, not salesy or generic
- Use appropriate emojis sparingly (1-3 max)

Never use hashtags unless specifically asked. Focus on substance over fluff.`;

const getToneInstructions = (tone: string) => {
  switch (tone) {
    case "professional":
      return "Write in a polished, business-focused tone. Be clear, confident, and credible.";
    case "thought-leader":
      return "Write with authority and insight. Share a unique perspective or contrarian take.";
    case "storytelling":
      return "Use a personal narrative style. Make it relatable and emotionally engaging.";
    case "casual":
      return "Write in a friendly, conversational tone. Be approachable and authentic.";
    default:
      return "";
  }
};

const getLengthInstructions = (length: string) => {
  switch (length) {
    case "short":
      return "Keep it concise, around 100 words.";
    case "long":
      return "Make it comprehensive, around 300 words.";
    default:
      return "Aim for around 200 words.";
  }
};

// Topics for auto-generation when no specific topic is provided
const AUTO_TOPICS = [
  "Building trust with clients through transparency",
  "The power of long-term financial planning",
  "Lessons learned from helping families with life insurance",
  "Why protection planning matters more than ever",
  "The difference between selling and serving in financial services",
  "How to have difficult conversations about money",
  "Building a referral-based practice",
  "The importance of continuous learning in financial services",
  "Balancing work and family as a financial professional",
  "What clients really want from their advisor",
];

const TONES = ["professional", "thought-leader", "storytelling", "casual"];

async function generateSinglePost(
  topic: string,
  tone: string,
  postLength: string,
  writingStyle: string
): Promise<{ topic: string; tone: string; content: string } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const styleNote = writingStyle
    ? `\n\nMatch this writing style:\n${writingStyle}`
    : "";

  const userPrompt = `${getToneInstructions(tone)}

Write a complete LinkedIn post (150-300 words). Include a hook, body, and conclusion.

${getLengthInstructions(postLength)}

Target audience: New York Life financial advisors
${styleNote}

Topic: ${topic}`;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gemini-2.0-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.8,
          max_tokens: 1000,
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) return null;

    return { topic, tone, content };
  } catch (err) {
    console.error("Generation error:", err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { 
      topics, // Optional array of specific topics
      count, // Optional override for number of posts
      sendEmail = true, // Whether to send email after generation
      baseUrl = "", // Base URL for email links
    } = body;

    // Get user settings
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      return NextResponse.json(
        { error: "Please configure your settings first" },
        { status: 400 }
      );
    }

    // Get writing style from examples
    const writingExamples = await prisma.writingExample.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    const writingStyle = writingExamples.map((e) => e.content).join("\n\n---\n\n");

    const postsToGenerate = count || settings.postsPerBatch;
    const postLength = settings.postLength;

    // Create a batch record
    const batch = await prisma.batch.create({
      data: {
        userId,
        scheduledFor: new Date(),
        status: "generating",
      },
    });

    // Determine topics
    let topicsToUse: string[];
    if (topics && Array.isArray(topics) && topics.length > 0) {
      topicsToUse = topics.slice(0, postsToGenerate);
    } else {
      // Randomly select topics from auto topics
      const shuffled = [...AUTO_TOPICS].sort(() => Math.random() - 0.5);
      topicsToUse = shuffled.slice(0, postsToGenerate);
    }

    // Generate posts
    const generatedPosts: { topic: string; tone: string; content: string }[] = [];
    
    for (let i = 0; i < topicsToUse.length; i++) {
      const topic = topicsToUse[i];
      const tone = TONES[i % TONES.length]; // Rotate through tones
      
      const result = await generateSinglePost(topic, tone, postLength, writingStyle);
      if (result) {
        generatedPosts.push(result);
      }
    }

    if (generatedPosts.length === 0) {
      await prisma.batch.update({
        where: { id: batch.id },
        data: { status: "complete" },
      });
      return NextResponse.json(
        { error: "Failed to generate any posts" },
        { status: 500 }
      );
    }

    // Save posts to database
    const savedPosts = await Promise.all(
      generatedPosts.map((post) =>
        prisma.post.create({
          data: {
            userId,
            batchId: batch.id,
            topic: post.topic,
            tone: post.tone,
            contentType: "post",
            content: post.content,
            status: "draft",
          },
        })
      )
    );

    // Update batch status
    await prisma.batch.update({
      where: { id: batch.id },
      data: {
        status: "complete",
        generatedAt: new Date(),
      },
    });

    // Send email if configured and requested
    let emailResult = null;
    if (sendEmail && settings.emailAddress && isEmailConfigured()) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true },
      });

      const postsForEmail: PostForEmail[] = savedPosts.map((post) => ({
        id: post.id,
        topic: post.topic,
        content: post.content,
        tone: post.tone,
        contentType: post.contentType,
      }));

      emailResult = await sendDigestEmail({
        to: settings.emailAddress,
        userName: user?.username || "there",
        posts: postsForEmail,
        batchId: batch.id,
        baseUrl,
      });

      if (emailResult.success) {
        await prisma.batch.update({
          where: { id: batch.id },
          data: {
            sentAt: new Date(),
            status: "sent",
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      batch: {
        id: batch.id,
        status: emailResult?.success ? "sent" : "complete",
      },
      posts: savedPosts.map((p) => ({
        id: p.id,
        topic: p.topic,
        tone: p.tone,
        preview: p.content.substring(0, 100) + "...",
      })),
      email: emailResult
        ? {
            sent: emailResult.success,
            error: emailResult.error,
          }
        : {
            sent: false,
            reason: !settings.emailAddress
              ? "No email address configured"
              : !isEmailConfigured()
              ? "RESEND_API_KEY not set"
              : "Email not requested",
          },
    });
  } catch (error) {
    console.error("Batch generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate batch" },
      { status: 500 }
    );
  }
}
