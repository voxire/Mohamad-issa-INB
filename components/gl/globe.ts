import { context, fit, multiply, perspective, program, release, rotationX, rotationY, translation, type Mat4 } from "./core";

/**
 * The investor globe in the International section: the real earth at night (NASA Black Marble 2016,
 * graded to the palette by scripts/earth-texture.py), turned to face Dubai, with arcs of light flying in
 * from the roadshow cities in CONTENT.md.
 * The sphere is ray-traced in a fragment shader on one quad, so there is no mesh to build or download.
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
const TEXTURE = "/media/earth-night-2048.webp";

/* ---------- The earth: a ray-traced sphere ---------- */
const EARTH_VS = `
attribute vec2 q;
varying vec2 vNdc;
void main() { vNdc = q; gl_Position = vec4(q, 0.0, 1.0); }`;

const EARTH_FS = `
precision highp float;
varying vec2 vNdc;
uniform sampler2D map;
uniform mat3 inv;
uniform float camZ;
uniform float tanH;
uniform float aspect;
uniform float ready;
const float R = ${R.toFixed(2)};
const float PI = 3.14159265;
const vec3 ATM = vec3(0.616, 0.722, 0.800);
void main() {
  vec3 d = normalize(vec3(vNdc.x * tanH * aspect, vNdc.y * tanH, -1.0));
  vec3 o = vec3(0.0, 0.0, camZ);
  float b = dot(o, d);
  float h = b * b - (dot(o, o) - R * R);
  if (h < 0.0) {
    // A thin atmosphere just outside the limb
    float closest = sqrt(max(dot(o, o) - b * b, 0.0));
    float g = smoothstep(R * 1.075, R, closest);
    float a = g * g * 0.32 * ready;
    gl_FragColor = vec4(ATM * a, a);
    return;
  }
  vec3 n = (o + d * (-b - sqrt(h))) / R;
  vec3 s = inv * n;
  vec2 uv = vec2(fract(atan(s.z, -s.x) / (2.0 * PI)), acos(clamp(s.y, -1.0, 1.0)) / PI);
  vec3 col = texture2D(map, uv).rgb;
  float ndv = max(dot(n, -d), 0.0);
  col *= mix(0.3, 1.0, pow(ndv, 0.55));
  col += ATM * pow(1.0 - ndv, 3.0) * 0.5;
  gl_FragColor = vec4(col * ready, ready);
}`;

/* ---------- Arcs and markers: points. info = (kind, u along the arc, delay, size in CSS px) ---------- */
// Kinds: 1 Dubai, 2 city, 3 arc, 4 halo
const PTS_VS = `
attribute vec3 pos;
attribute vec4 info;
uniform mat4 vp;
uniform mat4 model;
uniform float t;
uniform float dpr;
uniform float ready;
varying float vKind;
varying float vAlpha;
void main() {
  vec4 w = model * vec4(pos, 1.0);
  gl_Position = vp * w;
  float kind = info.x;
  float a = smoothstep(-0.05, 0.3, w.z / length(w.xyz)) * ready;
  float size = info.w;
  if (kind > 2.5 && kind < 3.5) {
    float c = mod(max(t - info.z, 0.0), 6.0);
    float k = clamp(c / 2.2, 0.0, 1.0);
    a *= step(info.y, k) * (0.45 + 0.55 * smoothstep(k - 0.22, k, info.y)) * (1.0 - smoothstep(4.6, 6.0, c));
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

const PTS_FS = `
precision mediump float;
varying float vKind;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float m = vKind > 3.5 ? smoothstep(0.5, 0.45, d) * smoothstep(0.36, 0.42, d) : smoothstep(0.5, 0.28, d);
  if (m <= 0.0) discard;
  vec3 col = vKind < 1.5 ? vec3(1.0, 0.94, 0.84) : vec3(0.616, 0.722, 0.800);
  float a = m * vAlpha;
  gl_FragColor = vec4(col * a, a);
}`;

type V3 = [number, number, number];
const ll = ([lat, lon]: [number, number], r = R): V3 => {
  const ph = ((90 - lat) * Math.PI) / 180, th = ((lon + 180) * Math.PI) / 180;
  return [-r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)];
};

/** Upper-left 3x3 of a rotation matrix, transposed (its inverse), column-major. */
const inverse3 = (m: Mat4) => {
  const o = new Float32Array(9);
  for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) o[c * 3 + r] = m[r * 4 + c];
  return o;
};

export function createGlobe(canvas: HTMLCanvasElement, { reduce }: { reduce: boolean }): (() => void) | null {
  const gl = context(canvas);
  const earth = gl && program(gl, EARTH_VS, EARTH_FS);
  const pts = gl && program(gl, PTS_VS, PTS_FS);
  if (!gl || !earth || !pts) return null;
  const mobile = window.matchMedia("(max-width: 860px)").matches;

  /* ---------- Geometry ---------- */
  const pos: number[] = [];
  const info: number[] = [];
  const add = (p: V3, kind: number, u: number, delay: number, size: number) => {
    pos.push(...p);
    info.push(kind, u, delay, size);
  };
  const dubai = ll(DUBAI, R * 1.003);
  CITIES.forEach((c, i) => {
    const s = ll(c, R * 1.003);
    const dist = Math.hypot(s[0] - dubai[0], s[1] - dubai[1], s[2] - dubai[2]);
    const mid = s.map((v, k) => (v + dubai[k]) / 2) as V3;
    const lift = (R * (1.22 + dist * 0.08)) / Math.hypot(...mid);
    const m = mid.map((v) => v * lift) as V3;
    for (let j = 0; j <= ARC_POINTS; j++) {
      const u = j / ARC_POINTS, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, cc = u * u;
      add([a * s[0] + b * m[0] + cc * dubai[0], a * s[1] + b * m[1] + cc * dubai[1], a * s[2] + b * m[2] + cc * dubai[2]], 3, u, i * 0.45, mobile ? 1.6 : 1.8);
    }
    add(s, 2, 0, 0, mobile ? 4.5 : 5);
  });
  add(dubai, 1, 0, 0, mobile ? 5.5 : 6.5);
  add(dubai, 4, 0, 0, 9);
  const count = pos.length / 3;

  const buf = (data: Float32Array) => {
    const b = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return b;
  };
  const quad = buf(new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]));
  const posBuf = buf(new Float32Array(pos));
  const infoBuf = buf(new Float32Array(info));
  const loc = {
    q: gl.getAttribLocation(earth, "q"),
    pos: gl.getAttribLocation(pts, "pos"),
    info: gl.getAttribLocation(pts, "info"),
  };
  const bind = (l: number, b: WebGLBuffer, size: number) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.enableVertexAttribArray(l);
    gl.vertexAttribPointer(l, size, gl.FLOAT, false, 0, 0);
  };
  const reset = () => {
    for (let i = 0; i < 4; i++) gl.disableVertexAttribArray(i);
  };
  const ue = (n: string) => gl.getUniformLocation(earth, n);
  const up = (n: string) => gl.getUniformLocation(pts, n);
  const E = { map: ue("map"), inv: ue("inv"), camZ: ue("camZ"), tanH: ue("tanH"), aspect: ue("aspect"), ready: ue("ready") };
  const P = { vp: up("vp"), model: up("model"), t: up("t"), dpr: up("dpr"), ready: up("ready") };

  /* ---------- Texture ---------- */
  const tex = gl.createTexture();
  let loaded = false, fade = 0;
  const img = new Image();
  img.decoding = "async";
  img.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    loaded = true;
    if (reduce) {
      fade = 1;
      draw(4.1);
    }
  };
  img.src = TEXTURE;

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  // Face Dubai toward the camera: undo its azimuth, then tilt by its latitude (a little further north so the arcs sit in frame)
  const ry = -Math.atan2(dubai[0], dubai[2]);
  const rx = ((DUBAI[0] + 10) * Math.PI) / 180;

  let dpr = 1, aspect = 1, camZ = 5.9, vp = perspective(FOV, 1);
  const tanH = Math.tan((FOV * Math.PI) / 360);
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  const move = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = canvas.getBoundingClientRect();
    ptr.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    ptr.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
  };
  const leave = () => ((ptr.tx = 0), (ptr.ty = 0));
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerleave", leave);

  function draw(t: number) {
    const d = fit(canvas, mobile ? 1.5 : 2);
    if (d) {
      dpr = d;
      gl!.viewport(0, 0, canvas.width, canvas.height);
      aspect = canvas.width / canvas.height;
      camZ = 5.9 / Math.min(1, aspect);
      vp = multiply(perspective(FOV, aspect), translation(0, 0, -camZ));
    }
    if (!loaded) return;
    ptr.x += (ptr.tx - ptr.x) * 0.05;
    ptr.y += (ptr.ty - ptr.y) * 0.05;
    const model = multiply(rotationX(rx + ptr.y * 0.25), rotationY(ry + Math.sin(t * 0.12) * 0.28 + ptr.x * 0.7));
    const g = gl!;
    g.clearColor(0, 0, 0, 0);
    g.clear(g.COLOR_BUFFER_BIT);

    g.useProgram(earth!);
    reset();
    bind(loc.q, quad, 2);
    g.activeTexture(g.TEXTURE0);
    g.bindTexture(g.TEXTURE_2D, tex);
    g.uniform1i(E.map, 0);
    g.uniformMatrix3fv(E.inv, false, inverse3(model));
    g.uniform1f(E.camZ, camZ);
    g.uniform1f(E.tanH, tanH);
    g.uniform1f(E.aspect, aspect);
    g.uniform1f(E.ready, fade);
    g.drawArrays(g.TRIANGLES, 0, 6);

    g.useProgram(pts!);
    reset();
    bind(loc.pos, posBuf, 3);
    bind(loc.info, infoBuf, 4);
    g.uniformMatrix4fv(P.vp, false, vp);
    g.uniformMatrix4fv(P.model, false, model);
    g.uniform1f(P.t, t);
    g.uniform1f(P.dpr, dpr);
    g.uniform1f(P.ready, fade);
    g.drawArrays(g.POINTS, 0, count);
  }

  let raf = 0, elapsed = 0, last = 0;
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    if (loaded) {
      elapsed += dt;
      fade = Math.min(1, fade + dt / 0.9);
    }
    draw(elapsed);
  };
  const io = new IntersectionObserver(([e]) => {
    if (reduce) return draw(4.1);
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
