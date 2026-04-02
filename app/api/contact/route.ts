import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(10).max(5000),
  // Honeypot field (bots often fill this). The client does not need to send it.
  website: z.string().trim().max(200).optional().or(z.literal("")),
});

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const siteUrl = process.env.SITE_URL;
  if (!siteUrl) return true;

  try {
    const originHost = new URL(origin).host;
    const siteHost = new URL(siteUrl).host;
    return originHost === siteHost;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    // Basic CSRF mitigation for browser requests.
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ip = getClientIp(request);
    const limitKey = `contact:${ip}`;
    const rl = rateLimit(limitKey, 60_000, 5); // 5 req/min per IP (best-effort in-memory)
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
      );
    }

    const raw = await request.json().catch(() => null);
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { name, email, message, website } = parsed.data;

    // Honeypot: silently accept to avoid signaling to bots.
    if (website && website.length > 0) {
      return NextResponse.json({ ok: true });
    }

    // Check if API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured; dropping contact submission");
      return NextResponse.json({ ok: true });
    }

    // Send email via Resend
    // Note: In test mode, Resend only sends to the verified email address (amoor22009@gmail.com)
    // To send to ashetaia01@gmail.com, verify a domain at resend.com/domains
    const result = await getResend().emails.send({
      from: "onboarding@resend.dev",
      to: "amoor22009@gmail.com",
      replyTo: email,
      subject: `New message from ${name.replace(/[\r\n]+/g, " ").slice(0, 80)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
          <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
          <h3>Message:</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(message)}</p>
        </div>
      `
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    console.log("Email sent successfully:", result.data?.id);
    return NextResponse.json({ ok: true, messageId: result.data?.id });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
