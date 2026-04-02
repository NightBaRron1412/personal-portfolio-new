"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { profile } from "@/data/profile";
import { Section } from "./section";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Mail, Copy } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters")
});

type FormValues = z.infer<typeof schema>;

export function Contact() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      if (!res.ok) throw new Error("Failed to submit");
      toast.success("Message sent! I’ll get back soon.");
      reset();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyEmail = async () => {
    // Extract email from mailto: link if present
    const emailToCopy = profile.contact.email.replace("mailto:", "");
    await navigator.clipboard.writeText(emailToCopy);
    toast.success("Email copied");
  };

  return (
    <Section id="contact" className="space-y-6">
      <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-text-secondary">Contact</p>
        <h2>Let’s build something</h2>
          <p className="max-w-2xl text-text-secondary">Prefer email? Reach me at {profile.contact.email.replace("mailto:", "")}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 md:items-start">
          <form suppressHydrationWarning onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border border-border-subtle bg-bg-elevated p-6 shadow-soft">
          <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Name</label>
            <Input placeholder="Your name" {...register("name")} />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Email</label>
            <Input placeholder="you@example.com" {...register("email")} />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Message</label>
            <Textarea placeholder="Tell me about your project" {...register("message")} />
            {errors.message && <p className="text-xs text-red-400">{errors.message.message}</p>}
          </div>
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Sending..." : "Send Message"}</Button>
        </form>
        <div className="space-y-4 rounded-2xl border border-border-subtle bg-bg-elevated p-6 shadow-soft">
          <h3 className="text-lg font-semibold">Direct</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Mail suppressHydrationWarning className="h-5 w-5 text-text-secondary" />
            <div>
              <p className="font-medium">{profile.contact.email.replace("mailto:", "")}</p>
                <p className="text-sm text-text-secondary">Response within 1-2 business days</p>
            </div>
            <Button variant="subtle" size="icon" onClick={copyEmail} aria-label="Copy email">
              <Copy suppressHydrationWarning className="h-4 w-4" />
            </Button>
          </div>
            <div className="rounded-xl border border-border-subtle bg-bg-elevated p-4 text-sm text-text-secondary">
            I read every message. Share enough context so I can prep useful next steps.
          </div>
        </div>
      </div>
    </Section>
  );
}
