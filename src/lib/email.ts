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
 * Generate HTML for post digest email
 */
export function generateDigestEmailHtml(options: DigestEmailOptions): string {
  const { userName = "there", posts, baseUrl = "" } = options;

  const postsHtml = posts
    .map(
      (post, index) => `
      <div style="margin-bottom: 32px; padding: 24px; background-color: #f8fafc; border-radius: 12px; border-left: 4px solid #3b82f6;">
        <div style="margin-bottom: 12px;">
          <span style="display: inline-block; padding: 4px 12px; background-color: #e0e7ff; color: #4338ca; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
            Post ${index + 1}
          </span>
          ${post.topic ? `<span style="margin-left: 8px; color: #64748b; font-size: 14px;">Topic: ${escapeHtml(post.topic)}</span>` : ""}
        </div>
        <div style="white-space: pre-wrap; line-height: 1.6; color: #1e293b; font-size: 15px; margin-bottom: 16px;">
${escapeHtml(truncateContent(post.content, 500))}
        </div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <a href="${baseUrl}/posts/${post.id}/edit" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px;">
            ✏️ Edit in App
          </a>
          <span style="display: inline-flex; align-items: center; padding: 10px 16px; background-color: #e2e8f0; color: #475569; border-radius: 8px; font-size: 14px;">
            📋 Copy from app
          </span>
        </div>
      </div>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your LinkedIn Posts Are Ready!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border-radius: 12px;">
        <span style="color: white; font-size: 24px; font-weight: bold;">LinkedIn Content Generator</span>
      </div>
    </div>

    <!-- Main Card -->
    <div style="background-color: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <h1 style="margin: 0 0 8px 0; color: #0f172a; font-size: 28px; font-weight: 700;">
        Hey ${escapeHtml(userName)}! 👋
      </h1>
      <p style="margin: 0 0 24px 0; color: #64748b; font-size: 16px; line-height: 1.5;">
        Your ${posts.length} LinkedIn post${posts.length !== 1 ? "s are" : " is"} ready for review. 
        Each one is crafted to engage your audience and establish your expertise.
      </p>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
        ${postsHtml}
      </div>

      <!-- CTA -->
      <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
        <a href="${baseUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">
          View All Posts in App →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; padding: 0 20px;">
      <p style="color: #94a3b8; font-size: 14px; margin: 0 0 8px 0;">
        You're receiving this because you enabled email notifications.
      </p>
      <a href="${baseUrl}/settings" style="color: #64748b; font-size: 14px;">
        Manage email preferences
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

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your LinkedIn Post Is Ready!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border-radius: 12px;">
        <span style="color: white; font-size: 24px; font-weight: bold;">LinkedIn Content Generator</span>
      </div>
    </div>

    <!-- Main Card -->
    <div style="background-color: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <h1 style="margin: 0 0 8px 0; color: #0f172a; font-size: 28px; font-weight: 700;">
        Your Post is Ready! ✨
      </h1>
      <p style="margin: 0 0 24px 0; color: #64748b; font-size: 16px; line-height: 1.5;">
        Hey ${escapeHtml(userName)}, here's your freshly generated LinkedIn post.
      </p>

      <!-- Post -->
      <div style="padding: 24px; background-color: #f8fafc; border-radius: 12px; border-left: 4px solid #3b82f6;">
        ${post.topic ? `<div style="margin-bottom: 12px; color: #64748b; font-size: 14px;">Topic: ${escapeHtml(post.topic)}</div>` : ""}
        <div style="white-space: pre-wrap; line-height: 1.6; color: #1e293b; font-size: 15px; margin-bottom: 20px;">
${escapeHtml(post.content)}
        </div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <a href="${baseUrl}/posts/${post.id}/edit" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px;">
            ✏️ Edit Post
          </a>
          <span style="display: inline-flex; align-items: center; padding: 10px 16px; background-color: #e2e8f0; color: #475569; border-radius: 8px; font-size: 14px;">
            📋 Copy from app
          </span>
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
        <a href="${baseUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">
          Open in App →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; padding: 0 20px;">
      <p style="color: #94a3b8; font-size: 14px; margin: 0 0 8px 0;">
        You're receiving this because you enabled email notifications.
      </p>
      <a href="${baseUrl}/settings" style="color: #64748b; font-size: 14px;">
        Manage email preferences
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
