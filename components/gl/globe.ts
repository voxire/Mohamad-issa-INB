import { attribute, buffer, context, fit, multiply, perspective, program, release, rotationX, rotationY, translation } from "./core";

/**
 * The investor globe in the International section: a dotted earth turned to face Dubai,
 * with arcs of light flying in from the roadshow cities in CONTENT.md.
 * Renders only while on screen. Under reduced motion it draws one still frame with every arc in place.
 */

/** [lat, lon]. Same order as the cities in content/en.ts, Dubai excluded. */
const CITIES: [number, number][] = [
  [51.5, -0.13], // London
  [55.75, 37.62], // Moscow
  [59.93, 30.36], // St Petersburg
  [41.0, 28.98], // Istanbul
  [1.35, 103.82], // Singapore
];
const DUBAI: [number, number] = [25.2, 55.27];
const R = 1.6;
const FOV = 35;
const ARC_POINTS = 260;

// info = (kind, u along the arc, delay, size in CSS px). Kinds: 0 dot, 1 Dubai, 2 city, 3 arc, 4 halo.
const VS = `
attribute vec3 pos;
attribute vec4 info;
uniform mat4 vp;
uniform mat4 model;
uniform float t;
uniform float dpr;
varying float vKind;
varying float vAlpha;
void main() {
  vec4 w = model * vec4(pos, 1.0);
  gl_Position = vp * w;
  float kind = info.x;
  float a = mix(0.08, 1.0, smoothstep(-0.2, 0.55, w.z / length(w.xyz)));
  float size = info.w;
  if (kind > 2.5 && kind < 3.5) {
    float c = mod(max(t - info.z, 0.0), 6.0);
    float k = clamp(c / 2.2, 0.0, 1.0);
    a *= step(info.y, k) * (0.4 + 0.6 * smoothstep(k - 0.22, k, info.y)) * (1.0 - smoothstep(4.6, 6.0, c));
  }
  if (kind > 3.5) {
    float ph = fract(t * 0.6);
    size *= 1.0 + ph * 2.2;
    a *= 1.0 - ph;
  }
  vKind = kind;
  vAlpha = a;
  gl_PointSize = size * dpr;
}`;

const FS = `
precision mediump float;
varying float vKind;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float m = vKind > 3.5 ? smoothstep(0.5, 0.45, d) * smoothstep(0.36, 0.42, d) : smoothstep(0.5, 0.28, d);
  if (m <= 0.0) discard;
  vec3 col = vKind < 0.5 ? vec3(0.66, 0.62, 0.56) : (vKind < 1.5 ? vec3(0.910, 0.863, 0.784) : vec3(0.616, 0.722, 0.800));
  float a = m * vAlpha;
  gl_FragColor = vec4(col * a, a);
}`;

type V3 = [number, number, number];
const ll = ([lat, lon]: [number, number], r = R): V3 => {
  const ph = ((90 - lat) * Math.PI) / 180, th = ((lon + 180) * Math.PI) / 180;
  return [-r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)];
};

export function createGlobe(canvas: HTMLCanvasElement, { reduce }: { reduce: boolean }): (() => void) | null {
  const gl = context(canvas);
  const prog = gl && program(gl, VS, FS);
  if (!gl || !prog) return null;

  const mobile = window.matchMedia("(max-width: 860px)").matches;
  const pos: number[] = [];
  const info: number[] = [];
  const add = (p: V3, kind: number, u: number, delay: number, size: number) => {
    pos.push(...p);
    info.push(kind, u, delay, size);
  };

  // Dots: an even Fibonacci sphere
  const n = mobile ? 1700 : 2600;
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963;
    add([Math.cos(th) * r * R, y * R, Math.sin(th) * r * R], 0, 0, 0, mobile ? 1.6 : 1.9);
  }
  // Arcs: quadratic curves lifted above the surface, drawn as fine points
  const dubai = ll(DUBAI);
  CITIES.forEach((c, i) => {
    const s = ll(c);
    const dist = Math.hypot(s[0] - dubai[0], s[1] - dubai[1], s[2] - dubai[2]);
    const mid = s.map((v, k) => (v + dubai[k]) / 2) as V3;
    const len = Math.hypot(...mid), lift = (R * (1.25 + dist * 0.08)) / len;
    const m = mid.map((v) => v * lift) as V3;
    for (let j = 0; j <= ARC_POINTS; j++) {
      const u = j / ARC_POINTS, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, cc = u * u;
      add([a * s[0] + b * m[0] + cc * dubai[0], a * s[1] + b * m[1] + cc * dubai[1], a * s[2] + b * m[2] + cc * dubai[2]], 3, u, i * 0.45, 1.7);
    }
    add(s, 2, 0, 0, 5);
  });
  add(dubai, 1, 0, 0, 6.5);
  add(dubai, 4, 0, 0, 9);

  const count = pos.length / 3;
  gl.useProgram(prog);
  attribute(gl, prog, "pos", buffer(gl, new Float32Array(pos)), 3);
  attribute(gl, prog, "info", buffer(gl, new Float32Array(info)), 4);
  const u = (name: string) => gl.getUniformLocation(prog, name);
  const [uVp, uModel, uT, uDpr] = [u("vp"), u("model"), u("t"), u("dpr")];
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  // Face Dubai toward the camera: undo its azimuth, then tilt by its latitude (a little further north so the arcs sit in frame)
  const ry = -Math.atan2(dubai[0], dubai[2]);
  const rx = ((DUBAI[0] + 12) * Math.PI) / 180;

  let dpr = 1, vp = perspective(FOV, 1);
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  const move = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    ptr.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    ptr.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
  };
  const leave = () => ((ptr.tx = 0), (ptr.ty = 0));
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerleave", leave);

  const draw = (t: number) => {
    const d = fit(canvas, mobile ? 1.5 : 2);
    if (d) {
      dpr = d;
      gl.viewport(0, 0, canvas.width, canvas.height);
      const aspect = canvas.width / canvas.height;
      vp = multiply(perspective(FOV, aspect), translation(0, 0, -5.9 / Math.min(1, aspect)));
    }
    ptr.x += (ptr.tx - ptr.x) * 0.05;
    ptr.y += (ptr.ty - ptr.y) * 0.05;
    const model = multiply(rotationX(rx + ptr.y * 0.3), rotationY(ry + Math.sin(t * 0.12) * 0.3 + ptr.x * 0.8));
    gl.uniformMatrix4fv(uVp, false, vp);
    gl.uniformMatrix4fv(uModel, false, model);
    gl.uniform1f(uT, t);
    gl.uniform1f(uDpr, dpr);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, count);
  };

  let raf = 0, elapsed = 0, last = 0;
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    elapsed += Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    draw(elapsed);
  };
  const io = new IntersectionObserver(([e]) => {
    if (reduce) return draw(4.1); // one still frame, every arc drawn
    if (e.isIntersecting && !raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    } else if (!e.isIntersecting && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  });
  io.observe(canvas);
  const onResize = () => reduce && draw(4.1);
  window.addEventListener("resize", onResize);

  return () => {
    io.disconnect();
    cancelAnimationFrame(raf);
    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("pointerleave", leave);
    window.removeEventListener("resize", onResize);
    release(gl);
  };
}
