"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { prefersReducedMotion, onMotionPreferenceChange } from "@/lib/motion";

/**
 * WebGL animated plasma-grid background (adapted from the 21st.dev
 * "@thanh/shader-background"). Theme is driven by a `uLight` UNIFORM (0 = dark,
 * 1 = light) computed per-fragment, so toggling the theme is a cheap uniform
 * update — NOT a shader recompile / context re-init (that caused a ~1s hang on
 * every theme switch). The program is built once.
 */
const VERT = `
  attribute vec4 aVertexPosition;
  void main() { gl_Position = aVertexPosition; }
`;

const FRAG = `
  precision highp float;
  uniform vec2 iResolution;
  uniform float iTime;
  uniform float uLight; // 0 = dark, 1 = light

  const float overallSpeed = 0.2;
  const float gridSmoothWidth = 0.015;
  const float scale = 5.0;
  const vec4 lineColor = vec4(0.18, 0.83, 0.75, 1.0);
  const float minLineWidth = 0.01;
  const float maxLineWidth = 0.2;
  const float lineSpeed = 1.0 * overallSpeed;
  const float lineAmplitude = 1.0;
  const float lineFrequency = 0.2;
  const float warpSpeed = 0.2 * overallSpeed;
  const float warpFrequency = 0.5;
  const float warpAmplitude = 1.0;
  const float offsetFrequency = 0.5;
  const float offsetSpeed = 1.33 * overallSpeed;
  const float minOffsetSpread = 0.6;
  const float maxOffsetSpread = 2.0;
  const int linesPerGroup = 16;

  #define drawCircle(pos, radius, coord) smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))
  #define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))
  #define drawCrispLine(pos, halfWidth, t) smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))

  float random(float t) {
    return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;
  }
  float getPlasmaY(float x, float horizontalFade, float offset) {
    return random(x * lineFrequency + iTime * lineSpeed) * horizontalFade * lineAmplitude + offset;
  }

  void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uv = fragCoord.xy / iResolution.xy;
    vec2 space = (fragCoord - iResolution.xy / 2.0) / iResolution.x * 2.0 * scale;

    float horizontalFade = 1.0 - (cos(uv.x * 6.28) * 0.5 + 0.5);
    float verticalFade = 1.0 - (cos(uv.y * 6.28) * 0.5 + 0.5);

    space.y += random(space.x * warpFrequency + iTime * warpSpeed) * warpAmplitude * (0.5 + horizontalFade);
    space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * warpAmplitude * horizontalFade;

    vec4 lines = vec4(0.0); // colored accumulation (dark blend)
    float amt = 0.0; // scalar accumulation (light blend)

    for (int l = 0; l < linesPerGroup; l++) {
      float normalizedLineIndex = float(l) / float(linesPerGroup);
      float offsetTime = iTime * offsetSpeed;
      float offsetPosition = float(l) + space.x * offsetFrequency;
      float rand = random(offsetPosition + offsetTime) * 0.5 + 0.5;
      float halfWidth = mix(minLineWidth, maxLineWidth, rand * horizontalFade) / 2.0;
      float offset = random(offsetPosition + offsetTime * (1.0 + normalizedLineIndex)) * mix(minOffsetSpread, maxOffsetSpread, horizontalFade);
      float linePosition = getPlasmaY(space.x, horizontalFade, offset);
      float line = drawSmoothLine(linePosition, halfWidth, space.y) / 2.0 + drawCrispLine(linePosition, halfWidth * 0.15, space.y);

      float circleX = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
      vec2 circlePosition = vec2(circleX, getPlasmaY(circleX, horizontalFade, offset));
      float circle = drawCircle(circlePosition, 0.01, space) * 4.0;

      line = line + circle;
      lines += line * lineColor * rand;
      amt += line * rand;
    }

    // dark = additive teal/violet glow on a dark gradient
    vec4 darkCol = mix(vec4(0.02, 0.12, 0.13, 1.0), vec4(0.16, 0.06, 0.32, 1.0), uv.x);
    darkCol *= verticalFade;
    darkCol.a = 1.0;
    darkCol += lines;

    // light = teal lines mixed onto a light background (additive washes out on white)
    vec4 lightBg = mix(vec4(0.90, 0.95, 0.96, 1.0), vec4(0.93, 0.93, 0.99, 1.0), uv.x);
    vec4 lightCol = mix(lightBg, vec4(0.04, 0.55, 0.50, 1.0), clamp(amt, 0.0, 1.0) * 0.85);
    lightCol.a = 1.0;

    gl_FragColor = mix(darkCol, lightCol, uLight);
  }
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function ShaderBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // When WebGL is unavailable (locked-down/corporate browsers, Zscaler browser
  // isolation, disabled hardware acceleration), fall back to a CSS gradient so
  // the hero background is never blank.
  const [failed, setFailed] = useState(false);
  // Theme as a ref so the draw loop can read it without re-initializing WebGL.
  const lightRef = useRef(resolvedTheme === "light");
  const drawRef = useRef<(() => void) | null>(null);

  useEffect(() => setMounted(true), []);

  // Theme change = update the uniform value (+ redraw once for the static /
  // reduced-motion case). No recompile.
  useEffect(() => {
    lightRef.current = resolvedTheme === "light";
    drawRef.current?.();
  }, [resolvedTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mounted) return;
    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) {
      setFailed(true);
      return;
    }

    const vert = compile(gl, gl.VERTEX_SHADER, VERT);
    const frag = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vert || !frag) {
      setFailed(true);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      setFailed(true);
      return;
    }
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFailed(true);
      return;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "aVertexPosition");
    const resLoc = gl.getUniformLocation(program, "iResolution");
    const timeLoc = gl.getUniformLocation(program, "iTime");
    const lightLoc = gl.getUniformLocation(program, "uLight");

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      const w = canvas.clientWidth || canvas.parentElement?.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro?.observe(canvas);
    window.addEventListener("resize", resize);

    const start = Date.now();
    let uLight = lightRef.current ? 1 : 0;
    const draw = (t: number) => {
      // Ease toward the target theme so the plasma smoothly crossfades.
      const target = lightRef.current ? 1 : 0;
      uLight += (target - uLight) * 0.08;
      gl.useProgram(program);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, t);
      gl.uniform1f(lightLoc, uLight);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(posLoc);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    // static / reduced-motion redraw: snap to the target theme instantly
    drawRef.current = () => {
      uLight = lightRef.current ? 1 : 0;
      draw(8);
    };

    let raf = 0;
    let inView = true;
    const loop = () => {
      draw((Date.now() - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    const startLoop = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const stopLoop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    // Live motion preference — freezes the plasma to a static frame when the
    // visitor turns motion off (in-app toggle or OS), resumes when turned on.
    let reduced = prefersReducedMotion();
    const applyMotion = () => {
      reduced = prefersReducedMotion();
      if (reduced) {
        stopLoop();
        drawRef.current?.();
      } else if (inView && !document.hidden) {
        startLoop();
      }
    };

    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (reduced) return;
      inView && !document.hidden ? startLoop() : stopLoop();
    });
    io.observe(canvas);
    const onVisibility = () => {
      if (reduced) return;
      document.hidden || !inView ? stopLoop() : startLoop();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const unsubscribe = onMotionPreferenceChange(applyMotion);

    applyMotion();

    return () => {
      stopLoop();
      drawRef.current = null;
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
      ro?.disconnect();
      unsubscribe();
    };
  }, [mounted]);

  if (failed) {
    const light = resolvedTheme === "light";
    return (
      <div
        aria-hidden
        className={cn("block h-full w-full", className)}
        style={{
          backgroundColor: light ? "#eef2f4" : "#0a0e14",
          backgroundImage: light
            ? "radial-gradient(120% 90% at 82% 0%, rgba(20,170,150,0.16), transparent 60%), radial-gradient(90% 70% at 12% 0%, rgba(167,139,250,0.14), transparent 55%)"
            : "radial-gradient(120% 90% at 82% 0%, rgba(45,212,191,0.22), transparent 60%), radial-gradient(90% 70% at 12% 0%, rgba(167,139,250,0.18), transparent 55%), repeating-linear-gradient(100deg, transparent 0 22px, rgba(45,212,191,0.05) 22px 23px)",
        }}
      />
    );
  }

  return <canvas ref={canvasRef} aria-hidden className={cn("block h-full w-full", className)} />;
}

export default ShaderBackground;
