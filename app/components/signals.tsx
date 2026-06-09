"use client";

import { GitHubPanel } from "./github-panel";
import { Reveal } from "./reveal";

export function Signals() {
  return (
    <Reveal>
      <GitHubPanel />
    </Reveal>
  );
}
