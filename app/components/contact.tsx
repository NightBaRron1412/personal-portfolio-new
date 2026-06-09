"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Copy, Github, Linkedin, Mail, Send } from "lucide-react";
import { profile } from "@/data/profile";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Reveal } from "./reveal";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Globe } from "@/components/ui/globe";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  website: z.string().optional(), // honeypot
});

type FormValues = z.infer<typeof schema>;

const email = profile.contact.email;

export function Contact() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.status === 429) {
        toast.error("Too many requests — try again in a minute.");
        return;
      }
      if (!res.ok) throw new Error("Failed");
      toast.success("Message sent — I’ll get back to you soon.");
      reset();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Email copied");
    } catch {
      toast.error("Couldn’t copy");
    }
  };

  const links = [
    { icon: Mail, label: email, href: `mailto:${email}` },
    { icon: Github, label: "github.com/NightBaRron1412", href: profile.social.github },
    { icon: Linkedin, label: "linkedin.com/in/ashetaia", href: profile.social.linkedin },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      {/* Left — invitation + direct */}
      <Reveal className="lg:col-span-5">
        <div className="panel ticks relative flex h-full flex-col overflow-hidden p-6">
          <p className="font-display text-2xl leading-tight text-text-primary">
            Have a hard systems problem?
          </p>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            Drivers, performance, reproducibility, verification — or just want to
            compare notes. I read every message and reply within a day or two.
          </p>

          <div className="mt-6 space-y-2">
            {links.map((l) => {
              const Icon = l.icon;
              const external = l.href.startsWith("http");
              return (
                <div key={l.label} className="flex items-center gap-3">
                  <a
                    href={l.href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-border-subtle bg-surface px-3 py-2.5 transition-colors hover:border-accent"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-text-secondary transition-colors group-hover:text-accent" />
                    <span className="mono truncate text-xs text-text-secondary group-hover:text-text-primary">
                      {l.label}
                    </span>
                  </a>
                  {l.icon === Mail ? (
                    <button
                      onClick={copyEmail}
                      aria-label="Copy email"
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border-subtle text-text-secondary transition-colors hover:border-accent hover:text-accent"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mono mt-5 flex items-center gap-2 text-xs text-text-faint">
            <span className="pulse-dot relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            based in Ontario, Canada · open to interesting work
          </div>

          {/* globe — own region below the text, no overlap */}
          <div className="relative mt-4 min-h-[150px] flex-1">
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-14 left-1/2 w-[230px] max-w-[78%] -translate-x-1/2 opacity-90"
              style={{
                WebkitMaskImage: "radial-gradient(circle at 50% 42%, #000 50%, transparent 75%)",
                maskImage: "radial-gradient(circle at 50% 42%, #000 50%, transparent 75%)",
              }}
            >
              <Globe />
            </div>
          </div>
        </div>
      </Reveal>

      {/* Right — form */}
      <Reveal delay={90} className="lg:col-span-7">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="panel space-y-4 p-6"
          suppressHydrationWarning
        >
          {/* honeypot */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="hidden"
            {...register("website")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" error={errors.name?.message}>
              <Input placeholder="Your name" {...register("name")} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <Input type="email" placeholder="you@example.com" {...register("email")} />
            </Field>
          </div>
          <Field label="Message" error={errors.message?.message}>
            <Textarea
              rows={6}
              placeholder="What are you working on?"
              {...register("message")}
            />
          </Field>

          <ShinyButton
            type="submit"
            disabled={loading}
            className="h-11 w-full disabled:opacity-60"
          >
            <span className="inline-flex items-center gap-2">
              {loading ? "Sending…" : "Send message"}
              {!loading ? <Send className="h-4 w-4" /> : null}
            </span>
          </ShinyButton>
        </form>
      </Reveal>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="eyebrow block">{label}</label>
      {children}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
