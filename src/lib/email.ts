import { Resend } from "resend";

// Initialize Resend client (will be null if no API key)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface PostForEmail {
  id: string;
  topic: string;
  content: string;
  tone?: string;
  contentType?: string;
}

export interface DigestEmailOptions {
  userName?: string;
  posts: PostForEmail[];
  batchId?: string;
  baseUrl?: string; // Optional base URL for edit links
}

export interface SendDigestOptions extends DigestEmailOptions {
  to: string;
}

export interface SinglePostEmailOptions {
  userName?: string;
  post: PostForEmail;
  baseUrl?: string;
}

export interface SendSinglePostOptions extends SinglePostEmailOptions {
  to: string;
}

/**
 * Check if email sending is configured
 */
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

/**
 * Capitalize first letter of name
 */
function capitalizeName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/**
 * Generate a short punchy greeting for financial advisors
 */
function generateGreeting(userName: string): string {
  const name = capitalizeName(userName);
  const greetings = [
    `${name}, your "authentic thought leadership" is ready.`,
    `Fresh content for the LinkedIn grind, ${name}.`,
    `${name}! Time to out-post your competition.`,
    `Your ghost-written genius awaits, ${name}.`,
    `${name}, prospects are scrolling. Let's hook 'em.`,
    `Content's hot, ${name}. Your future clients will love it.`,
    `${name}! More posts to build that book of business.`,
    `${name}, the algorithm demands content. We delivered.`,
    `Your LinkedIn presence called, ${name}. It wants more posts.`,
    `${name}! Ready to look like a thought leader again?`,
    `Fresh posts, ${name}. Time to impress some prospects.`,
    `${name}, your AI ghostwriter has finished. You're welcome.`,
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

/**
 * Generate HTML for post digest email
 */
export function generateDigestEmailHtml(options: DigestEmailOptions): string {
  const { userName = "there", posts, batchId, baseUrl = "" } = options;

  const greeting = generateGreeting(userName);
  const viewUrl = batchId ? `${baseUrl}/posts?batch=${batchId}` : `${baseUrl}/posts`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your LinkedIn Posts Are Ready!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 480px; margin: 0 auto; padding: 48px 24px;">
    
    <!-- Logo/Brand -->
    <div style="text-align: center; margin-bottom: 32px;">
      <span style="color: #3b82f6; font-size: 14px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">LinkedIn Content Generator</span>
    </div>

    <!-- Main Card -->
    <div style="background: linear-gradient(145deg, #1e293b 0%, #334155 100%); border-radius: 20px; padding: 48px 32px; text-align: center; border: 1px solid #475569;">
      
      <!-- Post Count Badge -->
      <div style="margin-bottom: 24px;">
        <span style="display: inline-block; padding: 8px 20px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; border-radius: 24px; font-size: 14px; font-weight: 600;">
          ${posts.length} New Post${posts.length !== 1 ? "s" : ""}
        </span>
      </div>

      <!-- Greeting -->
      <h1 style="margin: 0 0 12px 0; color: #f8fafc; font-size: 24px; font-weight: 700; line-height: 1.3;">
        ${escapeHtml(greeting)}
      </h1>

      <!-- Subtext -->
      <p style="margin: 0 0 32px 0; color: #94a3b8; font-size: 15px; line-height: 1.5;">
        Your content is ready for review.
      </p>

      <!-- CTA Button -->
      <a href="${viewUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);">
        View Posts →
      </a>

    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px;">
      <a href="${baseUrl}/settings" style="color: #64748b; font-size: 13px; text-decoration: none;">
        Manage notifications
      </a>
    </div>

  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate HTML for single post notification email
 */
export function generateSinglePostEmailHtml(options: SinglePostEmailOptions): string {
  const { userName = "there", post, baseUrl = "" } = options;

  const greeting = generateGreeting(userName);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your LinkedIn Post Is Ready!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 480px; margin: 0 auto; padding: 48px 24px;">
    
    <!-- Logo/Brand -->
    <div style="text-align: center; margin-bottom: 32px;">
      <span style="color: #3b82f6; font-size: 14px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">LinkedIn Content Generator</span>
    </div>

    <!-- Main Card -->
    <div style="background: linear-gradient(145deg, #1e293b 0%, #334155 100%); border-radius: 20px; padding: 48px 32px; text-align: center; border: 1px solid #475569;">
      
      <!-- Post Count Badge -->
      <div style="margin-bottom: 24px;">
        <span style="display: inline-block; padding: 8px 20px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; border-radius: 24px; font-size: 14px; font-weight: 600;">
          New Post
        </span>
      </div>

      <!-- Greeting -->
      <h1 style="margin: 0 0 12px 0; color: #f8fafc; font-size: 24px; font-weight: 700; line-height: 1.3;">
        ${escapeHtml(greeting)}
      </h1>

      <!-- Subtext -->
      <p style="margin: 0 0 32px 0; color: #94a3b8; font-size: 15px; line-height: 1.5;">
        Your content is ready for review.
      </p>

      <!-- CTA Button -->
      <a href="${baseUrl}/posts/${post.id}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);">
        View Post →
      </a>

    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px;">
      <a href="${baseUrl}/settings" style="color: #64748b; font-size: 13px; text-decoration: none;">
        Manage notifications
      </a>
    </div>

  </div>
</body>
</html>
  `.trim();
}

/**
 * Send post digest email
 */
export async function sendDigestEmail(
  options: SendDigestOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!resend) {
    return {
      success: false,
      error: "Email not configured. Set RESEND_API_KEY in environment.",
    };
  }

  try {
    const html = generateDigestEmailHtml(options);

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "LinkedIn Generator <noreply@resend.dev>",
      to: options.to,
      subject: `📝 ${options.posts.length} LinkedIn Post${options.posts.length !== 1 ? "s" : ""} Ready for Review`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Send digest email error:", message);
    return { success: false, error: message };
  }
}

/**
 * Send single post notification email
 */
export async function sendSinglePostEmail(
  options: SendSinglePostOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!resend) {
    return {
      success: false,
      error: "Email not configured. Set RESEND_API_KEY in environment.",
    };
  }

  try {
    const html = generateSinglePostEmailHtml(options);

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "LinkedIn Generator <noreply@resend.dev>",
      to: options.to,
      subject: `✨ Your LinkedIn Post is Ready: ${truncateContent(options.post.topic || "New Post", 50)}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Send single post email error:", message);
    return { success: false, error: message };
  }
}

// Helper functions
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + "...";
}
