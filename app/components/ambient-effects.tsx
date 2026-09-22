"use client";

import dynamic from "next/dynamic";
import { useDetailedEffects } from "@/hooks/use-detailed-effects";

const Field = dynamic(() => import("./instrument-field").then((module) => module.InstrumentField), { ssr: false });

export function AmbientEffects() {
  const enabled = useDetailedEffects();
  return enabled ? <Field /> : null;
}
