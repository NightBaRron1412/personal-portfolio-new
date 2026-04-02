"use client";

import { useEffect } from "react";
import { Command } from "cmdk";
import { Mail, Github, Linkedin, Home, GraduationCap, Briefcase, Layers, User, Code } from "lucide-react";
import { scrollToId } from "@/lib/utils";
import { profile } from "@/data/profile";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sections = [
  { id: "home", label: "Home", icon: Home },
  { id: "about", label: "About", icon: User },
  { id: "skills", label: "Skills", icon: Code },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "projects", label: "Projects", icon: Layers },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "contact", label: "Contact", icon: Mail }
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        onOpenChange(true);
      }
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0" aria-label="Command Palette">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search and run navigation commands.
        </DialogDescription>
        <Command label="Quick navigation" className="rounded-2xl bg-bg-secondary text-text-primary">
          <div className="flex items-center border-b border-border-subtle px-4">
            <Command.Input className="flex h-12 w-full bg-transparent px-2 text-sm outline-none placeholder:text-text-secondary" placeholder="Type a command or search" />
          </div>
          <Command.List className="max-h-80 overflow-y-auto">
            <Command.Empty className="px-4 py-3 text-sm text-text-secondary">No results found.</Command.Empty>
            <Command.Group heading="Navigate">
              {sections.map((section) => (
                <Command.Item
                  key={section.id}
                  value={section.id}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm hover:bg-bg-elevated"
                  onSelect={() => {
                    scrollToId(section.id);
                    onOpenChange(false);
                  }}
                >
                  {section.icon ? <section.icon className="h-4 w-4 text-text-secondary" /> : null}
                  <span>{section.label}</span>
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Links">
              <Command.Item
                value="github"
                onSelect={() => window.open(profile.social.github, "_blank")}
                className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm hover:bg-bg-elevated"
              >
                <Github className="h-4 w-4 text-text-secondary" />
                GitHub
              </Command.Item>
              <Command.Item
                value="linkedin"
                onSelect={() => window.open(profile.social.linkedin, "_blank")}
                className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm hover:bg-bg-elevated"
              >
                <Linkedin className="h-4 w-4 text-text-secondary" />
                LinkedIn
              </Command.Item>
              <Command.Item
                value="email"
                onSelect={() => (window.location.href = profile.social.email)}
                className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm hover:bg-bg-elevated"
              >
                <Mail className="h-4 w-4 text-text-secondary" />
                Email Amir
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
