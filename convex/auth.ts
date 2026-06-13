import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { internal } from "./_generated/api";
import { Resend } from "resend";

declare const process: { env: Record<string, string | undefined> };

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      validatePasswordRequirements: (password: string) => {
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters long");
        }
        if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
          throw new Error("Password must contain both letters and numbers");
        }
      },
      reset: {
        id: "resend",
        type: "email",
        name: "Resend",
        sendVerificationRequest: (async (
          { identifier: email, token }: { identifier: string; token: string },
          ctx: any
        ) => {
          // 1. Enforce rate limiting: maximum 3 requests per 10 minutes per email
          const rateLimitResult = await ctx.runMutation(internal.rateLimit.checkRateLimitMutation, {
            key: `reset_password:${email}`,
            limit: 3,
            windowMs: 10 * 60 * 1000,
          });

          if (!rateLimitResult.ok) {
            throw new Error(`Too many password reset requests. Please try again in ${rateLimitResult.retryAfterSec} seconds.`);
          }

          // 2. Deliver OTP via Resend or mock to console for local testing
          const apiKey = process.env.AUTH_RESEND_KEY || process.env.RESEND_API_KEY;
          if (apiKey) {
            const resend = new Resend(apiKey);
            const { error } = await resend.emails.send({
              from: "Study Calendar <onboarding@resend.dev>",
              to: [email],
              subject: "Reset your Study Calendar password",
              html: `<p>Your password reset code is <strong>${token}</strong>. It will expire in 2 hours.</p>`,
            });
            if (error) {
              console.error("Resend API Error details:", error);
              throw new Error("Failed to send password reset email via Resend.");
            }
          } else {
            console.log("\n-----------------------------------------");
            console.log(`[LOCAL DEV RESET CODE] Email: ${email}`);
            console.log(`Reset Code: ${token}`);
            console.log("-----------------------------------------\n");
          }
        }) as any,
      },
    }),
  ],
});
