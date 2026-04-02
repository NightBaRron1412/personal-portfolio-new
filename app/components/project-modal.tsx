"use client";

import Image from "next/image";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProjectModalProps {
  project: any | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [index, setIndex] = useState(0);
  if (!project) return null;
  const images = project.images || [];

  const next = () => setIndex((prev) => (prev + 1) % images.length);
  const prev = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <Dialog open={!!project} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="top-0 left-0 right-0 max-h-[90vh] w-full max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-none border-0 p-4 sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-[calc(100%-1.5rem)] sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-border-subtle sm:p-6"
      >
        <DialogHeader>
          <DialogTitle>{project.title}</DialogTitle>
          <DialogDescription>{project.outcomes}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border border-border-subtle bg-bg-main/80">
            <div className="relative aspect-video w-full">
              <Image
                src={images[index]}
                alt={`${project.title} screenshot`}
                fill
                sizes="(min-width: 1024px) 70vw, 100vw"
                className="object-cover"
                priority={index === 0}
              />
            </div>
            {images.length > 1 ? (
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <Button variant="subtle" size="icon" onClick={prev} aria-label="Previous image">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button variant="subtle" size="icon" onClick={next} aria-label="Next image">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            ) : null}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2 rounded-2xl border border-border-subtle bg-bg-elevated p-3">
              <h4 className="font-semibold">Problem</h4>
              <p className="text-sm text-text-secondary">{project.details.problem}</p>
            </div>
            <div className="space-y-2 rounded-2xl border border-border-subtle bg-bg-elevated p-3">
              <h4 className="font-semibold">Approach</h4>
              <p className="text-sm text-text-secondary">{project.details.approach}</p>
            </div>
            <div className="space-y-2 rounded-2xl border border-border-subtle bg-bg-elevated p-3">
              <h4 className="font-semibold">Results</h4>
              <p className="text-sm text-text-secondary">{project.details.results}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.tech.map((tech: string) => (
              <Badge key={tech} className="text-xs">{tech}</Badge>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
