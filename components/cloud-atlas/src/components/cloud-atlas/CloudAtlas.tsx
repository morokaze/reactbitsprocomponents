"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { createWakeRecovery } from "./recovery";
import { DEFAULTS, type CloudAtlasProps, type CloudSettings } from "./types";
import {
  VERTEX_SHADER,
  FRAGMENT_SHADER,
  BLUR_FRAGMENT_SHADER,
  FLOW_FRAGMENT_SHADER,
} from "./shaders";

const clamp = (value: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, value));
function normalize(props: CloudAtlasProps): CloudSettings {
  const defined = Object.fromEntries(
    Object.entries(props).filter(([, value]) => value !== undefined),
  );
  return { ...DEFAULTS, ...defined };
}
function color(hex: string): [number, number, number] {
  let raw = hex.replace("#", "");
  if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) raw = "6d5bc0";
  if (raw.length === 3)
    raw = raw
      .split("")
      .map((c) => c + c)
      .join("");
  return [0, 2, 4].map((i) => parseInt(raw.slice(i, i + 2), 16) / 255) as [
    number,
    number,
    number,
  ];
}
export default function CloudAtlas(props: CloudAtlasProps) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const settings = useRef(normalize(props));
  const invalidate = useRef<(() => void) | null>(null);

  useEffect(() => {
    settings.current = normalize(props);
    invalidate.current?.();
  }, [props]);

  useEffect(() => {
    const element = root.current!;
    const surface = canvas.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let cleanupRenderer = () => {};

    const setup = () => {
      cleanupRenderer();
      const gl = surface.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "low-power",
      });
      if (!gl) {
        element.dataset.renderer = "fallback";
        return;
      }
      const shaders: WebGLShader[] = [];
      let program: WebGLProgram | null = null;
      let buffer: WebGLBuffer | null = null;
      let blurProgram: WebGLProgram | null = null;
      let texture: WebGLTexture | null = null;
      let framebuffer: WebGLFramebuffer | null = null;
      let flowProgram: WebGLProgram | null = null;
      const flowTextures: WebGLTexture[] = [];
      const flowBuffers: WebGLFramebuffer[] = [];
      const release = () => {
        shaders.forEach((shader) => gl.deleteShader(shader));
        if (buffer) gl.deleteBuffer(buffer);
        if (program) gl.deleteProgram(program);
        if (blurProgram) gl.deleteProgram(blurProgram);
        if (texture) gl.deleteTexture(texture);
        if (framebuffer) gl.deleteFramebuffer(framebuffer);
        if (flowProgram) gl.deleteProgram(flowProgram);
        flowTextures.forEach((t) => gl.deleteTexture(t));
        flowBuffers.forEach((f) => gl.deleteFramebuffer(f));
      };
      try {
        const compile = (type: number, source: string) => {
          const shader = gl.createShader(type);
          if (!shader) throw new Error("Cannot allocate WebGL shader");
          shaders.push(shader);
          gl.shaderSource(shader, source);
          gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            throw new Error(
              gl.getShaderInfoLog(shader) || "Shader compilation failed",
            );
          return shader;
        };
        program = gl.createProgram();
        if (!program) throw new Error("Cannot allocate WebGL program");
        gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
        gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
        gl.bindAttribLocation(program, 0, "aPosition");
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
          throw new Error(
            gl.getProgramInfoLog(program) || "Program link failed",
          );
        blurProgram = gl.createProgram();
        if (!blurProgram) throw new Error("Cannot allocate blur program");
        gl.attachShader(blurProgram, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
        gl.attachShader(
          blurProgram,
          compile(gl.FRAGMENT_SHADER, BLUR_FRAGMENT_SHADER),
        );
        gl.bindAttribLocation(blurProgram, 0, "aPosition");
        gl.linkProgram(blurProgram);
        if (!gl.getProgramParameter(blurProgram, gl.LINK_STATUS))
          throw new Error(
            gl.getProgramInfoLog(blurProgram) || "Blur shader link failed",
          );
        flowProgram = gl.createProgram();
        if (!flowProgram) throw new Error("Cannot allocate flow program");
        gl.attachShader(flowProgram, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
        gl.attachShader(
          flowProgram,
          compile(gl.FRAGMENT_SHADER, FLOW_FRAGMENT_SHADER),
        );
        gl.bindAttribLocation(flowProgram, 0, "aPosition");
        gl.linkProgram(flowProgram);
        if (!gl.getProgramParameter(flowProgram, gl.LINK_STATUS))
          throw new Error(
            gl.getProgramInfoLog(flowProgram) || "Flow link failed",
          );
        const neutral = new Uint8Array(256 * 128 * 4);
        for (let i = 0; i < neutral.length; i += 4) {
          neutral[i] = 128;
          neutral[i + 1] = 128;
        }
        for (let i = 0; i < 2; i++) {
          const t = gl.createTexture(),
            f = gl.createFramebuffer();
          if (!t || !f) throw new Error("Cannot allocate flow buffer");
          flowTextures.push(t);
          flowBuffers.push(f);
          gl.bindTexture(gl.TEXTURE_2D, t);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            256,
            128,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            neutral,
          );
          gl.bindFramebuffer(gl.FRAMEBUFFER, f);
          gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            t,
            0,
          );
        }
        texture = gl.createTexture();
        framebuffer = gl.createFramebuffer();
        if (!texture || !framebuffer)
          throw new Error("Cannot allocate render texture");
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0,
          gl.TEXTURE_2D,
          texture,
          0,
        );
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(program);
        buffer = gl.createBuffer();
        if (!buffer) throw new Error("Cannot allocate WebGL buffer");
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
          gl.STATIC_DRAW,
        );
        const position = gl.getAttribLocation(program, "aPosition");
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      } catch (error) {
        console.error("[CloudAtlas]", error);
        release();
        element.dataset.renderer = "fallback";
        return;
      }
      element.dataset.renderer = "webgl";
      const locations = new Map<string, WebGLUniformLocation | null>();
      const uniform = (name: string) => {
        if (!locations.has(name))
          locations.set(name, gl.getUniformLocation(program!, name));
        return locations.get(name)!;
      };
      const blurUniform = (name: string) =>
        gl.getUniformLocation(blurProgram!, name);
      const blurLocations = {
        cloud: blurUniform("uCloud"),
        size: blurUniform("uSize"),
        flow: blurUniform("uFlow"),
        enabled: blurUniform("uEnabled"),
      };
      const flowUniform = (name: string) =>
        gl.getUniformLocation(flowProgram!, name);
      const flowLocations = {
        previous: flowUniform("uPrevious"),
        size: flowUniform("uSize"),
        delta: flowUniform("uDelta"),
        carry: flowUniform("uCarry"),
        injectDelta: flowUniform("uInjectDelta"),
        radius: flowUniform("uRadius"),
        trail: flowUniform("uTrail[0]"),
      };
      let flowRead = 0,
        flowEnergy = 0,
        resetFlow = false,
        carry = 1;
      const trails = Array.from({ length: 6 }, () => ({
        x: -10,
        y: -10,
        dx: 0,
        dy: 0,
      }));
      const packed = new Float32Array(24);
      let trailIndex = 0;
      let pointer: { x: number; y: number; id: number } | null = null;
      let rect = element.getBoundingClientRect();
      let dirty = true,
        visible = true,
        clock = 0,
        last = 0;
      let width = 1,
        height = 1,
        allocated = false;
      const stopped = () => {
        const p = settings.current;
        return p.paused || (p.respectReducedMotion && reduced.matches);
      };
      const markDirty = () => {
        dirty = true;
      };
      invalidate.current = markDirty;
      const recovery = createWakeRecovery(markDirty, () => {
        resetFlow = true;
        flowEnergy = 0;
        trails.forEach((trail) => {
          gsap.killTweensOf(trail);
          trail.dx = 0;
          trail.dy = 0;
        });
      });
      const settle = (trail: (typeof trails)[number]) => {
        gsap.to(trail, {
          dx: 0,
          dy: 0,
          duration: 0.22,
          ease: "power3.out",
          overwrite: true,
          onUpdate: markDirty,
        });
      };
      const move = (event: PointerEvent) => {
        const p = settings.current;
        if (stopped() || !p.interactive || p.cursorStrength === 0) return;
        rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = (event.clientX - rect.left) / rect.width;
        const y = 1 - (event.clientY - rect.top) / rect.height;
        if (pointer && pointer.id === event.pointerId) {
          const dx = clamp(
            (x - pointer.x) * p.cursorStrength * 1.25,
            -0.12,
            0.12,
          );
          const dy = clamp(
            (y - pointer.y) * p.cursorStrength * 1.25,
            -0.12,
            0.12,
          );
          if (Math.abs(dx) + Math.abs(dy) > 0.0002) {
            const trail = trails[trailIndex++ % trails.length];
            gsap.killTweensOf(trail);
            Object.assign(trail, { x, y, dx, dy });
            settle(trail);
            flowEnergy = 1;
            carry *= recovery.state.amount;
            recovery.strike();
            dirty = true;
          }
        }
        pointer = { x, y, id: event.pointerId };
      };
      const leave = () => {
        pointer = null;
      };
      const resize = new ResizeObserver(() => {
        rect = element.getBoundingClientRect();
        dirty = true;
      });
      resize.observe(element);
      const intersection = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        dirty = true;
      });
      intersection.observe(element);
      element.addEventListener("pointermove", move, { passive: true });
      element.addEventListener("pointerleave", leave);
      element.addEventListener("pointercancel", leave);
      reduced.addEventListener("change", markDirty);
      document.addEventListener("visibilitychange", markDirty);

      const draw = (_elapsed: number, deltaMs: number) => {
        if (disposed || gl.isContextLost()) return;
        const p = settings.current;
        const frozen = stopped();
        const active = visible && !document.hidden && !frozen;
        recovery.pause(!active);
        recovery.advance();
        element.dataset.wake = recovery.state.amount.toFixed(5);
        trails.forEach((trail) => {
          for (const tween of gsap.getTweensOf(trail)) tween.paused(!active);
        });
        if (!visible || document.hidden) return;
        const moving =
          !frozen &&
          (p.speed !== 0 ||
            (flowEnergy > 0.001 && recovery.state.amount > 0) ||
            trails.some((t) => Math.abs(t.dx) + Math.abs(t.dy) > 0.00001));
        if (!dirty && !moving) {
          last = performance.now();
          return;
        }
        const now = performance.now();
        const dt = last
          ? Math.min((now - last) / 1000, 0.05)
          : Math.min(deltaMs / 1000, 0.016);
        last = now;
        if (!frozen) clock += dt * clamp(p.speed, 0, 5);
        dirty = false;
        const ratio =
          clamp(p.resolution, 0.15, 1) * Math.min(devicePixelRatio || 1, 1.5);
        width = Math.max(1, Math.round(rect.width * ratio));
        height = Math.max(1, Math.round(rect.height * ratio));
        if (
          !allocated ||
          surface.width !== width ||
          surface.height !== height
        ) {
          surface.width = width;
          surface.height = height;
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            width,
            height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
          );
          allocated = true;
        }
        gl.activeTexture(gl.TEXTURE0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.useProgram(program);
        gl.viewport(0, 0, width, height);
        gl.uniform2f(uniform("uSize"), width, height);
        gl.uniform1f(uniform("uTime"), clock);
        const values: [string, number][] = [
          ["uHeight", clamp(p.height, 0, 1.5)],
          ["uCoverage", clamp(p.coverage, 0, 1)],
          ["uDensity", clamp(p.density, 0, 1)],
          ["uScale", clamp(p.scale, 0.2, 4)],
          ["uTowers", clamp(p.towers, 0, 3)],
          ["uOpacity", clamp(p.opacity, 0, 1)],
          ["uWind", p.wind],
          ["uBillow", p.billow],
          ["uRise", clamp(p.rise, 0, 2)],
          ["uSeed", p.seed],
          ["uAnchor", p.anchor === "top" ? 1 : 0],
          ["uRadius", clamp(p.cursorRadius, 0.02, 1)],
        ];
        values.forEach(([name, value]) => gl.uniform1f(uniform(name), value));
        gl.uniform3fv(uniform("uLight"), color(p.colors[0]));
        gl.uniform3fv(uniform("uShade"), color(p.colors[1]));
        trails.forEach((trail, i) => {
          const enabled =
            p.interactive && !(p.respectReducedMotion && reduced.matches);
          packed.set(
            [trail.x, trail.y, enabled ? trail.dx : 0, enabled ? trail.dy : 0],
            i * 4,
          );
        });
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        if (resetFlow) {
          for (const target of flowBuffers) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, target);
            gl.clearColor(128 / 255, 128 / 255, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
          }
          resetFlow = false;
        }
        const flowWrite = 1 - flowRead;
        gl.bindFramebuffer(gl.FRAMEBUFFER, flowBuffers[flowWrite]);
        gl.viewport(0, 0, 256, 128);
        gl.useProgram(flowProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, flowTextures[flowRead]);
        gl.uniform1i(flowLocations.previous, 0);
        gl.uniform2f(flowLocations.size, width, height);
        gl.uniform1f(flowLocations.carry, carry);
        carry = 1;
        gl.uniform1f(flowLocations.delta, frozen ? 0 : dt);
        gl.uniform1f(flowLocations.injectDelta, frozen ? 0 : dt);
        gl.uniform1f(flowLocations.radius, clamp(p.cursorRadius, 0.02, 1));
        gl.uniform4fv(flowLocations.trail, packed);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        flowRead = flowWrite;
        if (!frozen) flowEnergy *= Math.exp(-dt * 0.9);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, width, height);
        gl.useProgram(blurProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(blurLocations.cloud, 0);
        gl.uniform2f(blurLocations.size, width, height);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, flowTextures[flowRead]);
        gl.uniform1i(blurLocations.flow, 1);
        gl.uniform1f(
          blurLocations.enabled,
          p.interactive && !(p.respectReducedMotion && reduced.matches)
            ? recovery.state.amount
            : 0,
        );
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };
      gsap.ticker.add(draw);
      cleanupRenderer = () => {
        gsap.ticker.remove(draw);
        recovery.kill();
        trails.forEach((trail) => gsap.killTweensOf(trail));
        resize.disconnect();
        intersection.disconnect();
        element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerleave", leave);
        element.removeEventListener("pointercancel", leave);
        reduced.removeEventListener("change", markDirty);
        document.removeEventListener("visibilitychange", markDirty);
        invalidate.current = null;
        release();
      };
    };
    const lost = (event: Event) => {
      event.preventDefault();
      element.dataset.renderer = "fallback";
      cleanupRenderer();
      cleanupRenderer = () => {};
    };
    const restored = () => {
      if (!disposed) setup();
    };
    surface.addEventListener("webglcontextlost", lost);
    surface.addEventListener("webglcontextrestored", restored);
    setup();
    return () => {
      disposed = true;
      cleanupRenderer();
      surface.removeEventListener("webglcontextlost", lost);
      surface.removeEventListener("webglcontextrestored", restored);
    };
  }, []);

  return (
    <div
      ref={root}
      data-cloud-atlas
      data-revision="rising-plumes-5"
      data-renderer="fallback"
      className={`group/cloud relative isolate overflow-hidden ${props.className ?? ""}`}
      style={{
        backgroundColor: props.backgroundColor ?? DEFAULTS.backgroundColor,
        ...props.style,
      }}
    >
      <div
        aria-hidden="true"
        className="cloud-fallback pointer-events-none absolute inset-0 -z-10 group-data-[renderer=webgl]/cloud:hidden"
      />
      <canvas
        ref={canvas}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 block h-full w-full group-data-[renderer=fallback]/cloud:invisible"
      />
      {props.children}
    </div>
  );
}
export type { CloudAtlasProps } from "./types";
