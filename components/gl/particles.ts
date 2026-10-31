import { attribute, buffer, context, fit, multiply, perspective, program, release, rotationX, rotationY, translation } from "./core";

/**
 * The particle story used by the opening intro.
 * Thousands of points of light drift as dust, form his portrait, then a tower, a globe and finally "Let's talk".
 * The caller drives `state.v` (0 = dust, 1 = portrait, 2 = tower, 3 = globe, 4 = words); fractions morph between shapes.
 */

export type ParticleStory = { state: { v: number }; ready: Promise<void>; destroy: () => void };

type Options = { portrait: string; words: string; font: string; rtl: boolean };

const VS = `
attribute vec3 a;
attribute vec3 b;
attribute float seed;
uniform mat4 mvp;
uniform float p;
uniform float t;
uniform float size;
varying float vBlue;
void main() {
  float wave = sin(p * 3.14159);
  vec3 drift = vec3(sin(seed * 12.9 + t * 1.3), cos(seed * 7.3 + t * 1.1), sin(seed * 3.7 + t * 0.9));
  vec3 pos = mix(a, b, p) + drift * (0.006 + 0.14 * wave);
  gl_Position = mvp * vec4(pos, 1.0);
  gl_PointSize = size * (0.55 + fract(seed * 43.7) * 0.9) / gl_Position.w;
  vBlue = step(0.86, fract(seed * 91.3));
}`;

const FS = `
precision mediump float;
varying float vBlue;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c);
  if (d > 0.25) discard;
  float k = smoothstep(0.25, 0.0, d) * 0.95;
  vec3 col = mix(vec3(0.910, 0.863, 0.784), vec3(0.616, 0.722, 0.800), vBlue);
  gl_FragColor = vec4(col * k, k);
}`;

const FOV = 35;

export function createParticleStory(canvas: HTMLCanvasElement, opts: Options): ParticleStory | null {
  const gl = context(canvas);
  const prog = gl && program(gl, VS, FS);
  if (!gl || !prog) return null;

  const mobile = window.matchMedia("(max-width: 860px)").matches;
  const N = mobile ? 7000 : 14000;
  const halfW = mobile ? 1.85 : 2.45; // the widest shape must fit inside ±halfW
  const rnd = Math.random;

  /* ---------- Shapes ---------- */
  const dust = () => {
    const o = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 2.2 + rnd() * 3.2, th = rnd() * Math.PI * 2, ph = Math.acos(2 * rnd() - 1);
      o.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.7, r * Math.sin(ph) * Math.sin(th) - 1], i * 3);
    }
    return o;
  };
  const sphere = (R = 1.5) => {
    const o = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963;
      o.set([Math.cos(th) * r * R, y * R, Math.sin(th) * r * R], i * 3);
    }
    return o;
  };
  /** A wireframe globe: points on parallels and meridians, so it reads as the earth rather than a ball. */
  const globe = (R = 1.35) => {
    const o = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const along = rnd() * Math.PI * 2;
      let x: number, y: number, zz: number;
      if (rnd() < 0.5) {
        const lat = ((((rnd() * 7) | 0) - 3) * Math.PI) / 8, r = Math.cos(lat) * R;
        [x, y, zz] = [Math.cos(along) * r, Math.sin(lat) * R, Math.sin(along) * r];
      } else {
        const lon = (((rnd() * 12) | 0) * Math.PI) / 12;
        [x, y, zz] = [Math.cos(along) * Math.cos(lon) * R, Math.sin(along) * R, Math.cos(along) * Math.sin(lon) * R];
      }
      o.set([x, y, zz], i * 3);
    }
    return o;
  };
  const tower = () => {
    const o = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const y = -1.5 + rnd() * 3.0, k = (y + 1.5) / 3.0;
      const w = y > 1.3 ? 0.03 : 0.45 * Math.pow(1 - Math.floor(k * 7) / 7, 0.85) + 0.05;
      const u = (rnd() * 2 - 1) * w, side = rnd() < 0.5 ? -1 : 1;
      o.set(rnd() < 0.5 ? [u, y, side * w * 0.7] : [side * w, y, u * 0.7], i * 3);
    }
    return o;
  };
  /** Sample N points from whatever is drawn on a small canvas; brightness becomes depth. */
  const fromCanvas = (W: number, H: number, maxW: number, maxH: number, depth: number, draw: (x: CanvasRenderingContext2D) => void) => {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const x = c.getContext("2d", { willReadFrequently: true })!;
    draw(x);
    const d = x.getImageData(0, 0, W, H).data;
    const cand: number[] = [];
    for (let py = 0; py < H; py++)
      for (let px = 0; px < W; px++) {
        const k = (py * W + px) * 4;
        if (d[k + 3] > 120) cand.push(px, py, (d[k] + d[k + 1] + d[k + 2]) / 765);
      }
    const scale = Math.min(maxW, (maxH * W) / H);
    const o = new Float32Array(N * 3);
    const n = cand.length / 3;
    for (let i = 0; i < N; i++) {
      const j = n ? ((rnd() * n) | 0) * 3 : -1;
      const [px, py, l] = j < 0 ? [W / 2, H / 2, 0.5] : [cand[j], cand[j + 1], cand[j + 2]];
      o.set([(px / W - 0.5) * scale, -(py / H - 0.5) * scale * (H / W), (l - 0.5) * depth + (rnd() - 0.5) * 0.04], i * 3);
    }
    return o;
  };

  const shapes = [dust(), sphere(), tower(), globe(), sphere()];
  const bufs = shapes.map((s) => buffer(gl, s));
  const replace = (i: number, data: Float32Array) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, bufs[i]);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  };

  const portrait = new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const W = 180, H = Math.round((180 * img.naturalHeight) / img.naturalWidth);
      replace(1, fromCanvas(W, H, 2.9, 2.9, 0.5, (x) => x.drawImage(img, 0, 0, W, H)));
      resolve();
    };
    img.onerror = () => resolve();
    img.src = opts.portrait;
  });
  const font = `${opts.rtl ? 400 : 300} ${opts.rtl ? 84 : 96}px ${opts.font}`;
  const words = (document.fonts ? document.fonts.load(font).catch(() => undefined) : Promise.resolve()).then(() => {
    replace(4, fromCanvas(520, 150, halfW * 1.95, 1.2, 0.1, (x) => {
      x.fillStyle = "#fff";
      x.font = font;
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.direction = opts.rtl ? "rtl" : "ltr";
      x.fillText(opts.words, 260, 78);
    }));
  });

  const seeds = new Float32Array(N);
  for (let i = 0; i < N; i++) seeds[i] = rnd();
  const seedBuf = buffer(gl, seeds);

  /* ---------- Render ---------- */
  gl.useProgram(prog);
  attribute(gl, prog, "seed", seedBuf, 1);
  const u = (n: string) => gl.getUniformLocation(prog, n);
  const [uMvp, uP, uT, uSize] = [u("mvp"), u("p"), u("t"), u("size")];
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE);

  const state = { v: 0 };
  let proj = perspective(FOV, 1), z = 5.6, size = 1;
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  const move = (e: PointerEvent) => {
    ptr.tx = e.clientX / window.innerWidth - 0.5;
    ptr.ty = e.clientY / window.innerHeight - 0.5;
  };
  window.addEventListener("pointermove", move);

  const t0 = performance.now();
  let raf = 0;
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (fit(canvas, mobile ? 1.5 : 1.75)) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      const aspect = canvas.width / canvas.height, tan = Math.tan((FOV * Math.PI) / 360);
      // Fit the widest shape, and keep ~2.15 units of height on each side so the name below stays clear
      z = Math.max(2.15 / tan, (halfW + 0.15) / (tan * aspect));
      proj = perspective(FOV, aspect);
      size = 0.022 * canvas.height * 0.5 * (z / 5.6) * (mobile ? 0.9 : 1);
    }
    const t = (now - t0) / 1000;
    ptr.x += (ptr.tx - ptr.x) * 0.05;
    ptr.y += (ptr.ty - ptr.y) * 0.05;
    const v = Math.min(Math.max(state.v, 0), shapes.length - 1);
    const i = Math.min(Math.floor(v), shapes.length - 2);
    const model = multiply(rotationX(ptr.y * 0.35), rotationY(Math.sin(t * 0.3) * 0.15 + ptr.x * 0.6 + (1 - Math.min(v, 1)) * t * 0.08));
    gl.uniformMatrix4fv(uMvp, false, multiply(proj, multiply(translation(0, 0.3, -z), model)));
    gl.uniform1f(uP, v - i);
    gl.uniform1f(uT, t);
    gl.uniform1f(uSize, size);
    attribute(gl, prog, "a", bufs[i], 3);
    attribute(gl, prog, "b", bufs[i + 1], 3);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, N);
  };
  raf = requestAnimationFrame(frame);

  return {
    state,
    ready: Promise.all([portrait, words]).then(() => undefined),
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      release(gl);
    },
  };
}
