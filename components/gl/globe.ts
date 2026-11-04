import { context, fit, multiply, perspective, program, release, rotationX, rotationY, translation, type Mat4 } from "./core";

/**
 * The investor globe in the International section: the real earth at night (NASA Black Marble 2016,
 * graded to the palette by scripts/earth-texture.py), with arcs of light flying into Dubai from the
 * roadshow cities in CONTENT.md.
 *  - Idle: turns slowly from Dubai to Europe to the Americas and back.
 *  - Focus (hover or tap a country or city in the list): turns and moves in to those pins, redraws
 *    their arcs into Dubai, pulses them, labels them, and dims everything else.
 * The sphere is ray-traced in a fragment shader on one quad, so there is no mesh to build or download.
 * Renders only while on screen. Under reduced motion it draws still frames, with every arc in place.
 */

/**
 * [lat, lon] of every roadshow pin, in the same order as the countries and cities in content/en.ts
 * (his list, Nov 2026). A country with no cities gets one pin at its main city:
 * Texas: Houston, Singapore, Lebanon: Beirut, Italy: Milan, Iraq: Baghdad.
 */
const PINS: [number, number][] = [
  [55.75, 37.62], // Moscow
  [54.71, 20.51], // Kaliningrad
  [59.93, 30.36], // St Petersburg
  [34.05, -118.24], // Los Angeles
  [25.76, -80.19], // Miami
  [29.76, -95.37], // Houston, Texas
  [51.51, -0.13], // London
  [53.48, -2.24], // Manchester
  [24.71, 46.68], // Riyadh
  [21.49, 39.19], // Jeddah
  [47.37, 8.54], // Zurich
  [46.2, 6.14], // Geneva
  [41.01, 28.98], // Istanbul
  [37.03, 27.43], // Bodrum
  [1.35, 103.82], // Singapore
  [33.89, 35.5], // Beirut, Lebanon
  [45.46, 9.19], // Milan, Italy
  [33.31, 44.36], // Baghdad, Iraq
];
export const PIN_COUNT = PINS.length;
/** The globe turns slowly between these longitudes: Dubai, Europe, the Americas, then back. */
const TOUR = [55, 20, -25, 20];
const HOLD = 4.5; // seconds resting on each view
const MOVE = 3.5; // seconds turning between views
const DUBAI: [number, number] = [25.2, 55.27];
const R = 1.6;
const FOV = 35;
const ARC_POINTS = 260;
const TEXTURE = "/media/earth-night-2048.webp";
const DUBAI_SLOT = PINS.length; // focus slot that is never set, for Dubai's own points

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
uniform vec3 fdir;
uniform float famt;
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
  // Focus: a soft pool of light around the focused place, the rest of the earth steps back
  float pool = smoothstep(0.82, 0.995, dot(s, fdir));
  col *= mix(1.0, 0.45 + 1.25 * pool, famt);
  col += ATM * pow(1.0 - ndv, 3.0) * 0.5;
  gl_FragColor = vec4(col * ready, ready);
}`;

/* ---------- Arcs and markers: points ---------- */
// info = (kind, u along the arc, delay, size in CSS px); pin = which roadshow pin the point belongs to.
// Kinds: 1 Dubai, 2 city, 3 arc, 4 Dubai halo, 5 city halo (only while focused)
const PTS_VS = `
attribute vec3 pos;
attribute vec4 info;
attribute float pin;
uniform mat4 vp;
uniform mat4 model;
uniform float t;
uniform float dpr;
uniform float ready;
uniform float still;
uniform float hasFocus;
uniform float focusT;
uniform float uFocus[${PINS.length + 1}];
varying float vKind;
varying float vAlpha;
void main() {
  vec4 w = model * vec4(pos, 1.0);
  gl_Position = vp * w;
  float kind = info.x;
  float f = uFocus[int(pin + 0.5)];
  float a = smoothstep(-0.05, 0.3, w.z / length(w.xyz)) * ready;
  float size = info.w;
  if (kind > 2.5 && kind < 3.5) {
    if (hasFocus > 0.5) {
      // Focused arcs draw again from the city into Dubai; the rest fade back
      float k = still > 0.5 ? 1.0 : clamp((t - focusT) / 1.6, 0.0, 1.0);
      a *= f > 0.5 ? step(info.y, k) * (0.55 + 0.45 * smoothstep(k - 0.22, k, info.y)) : 0.1;
      size *= f > 0.5 ? 1.3 : 1.0;
    } else if (still < 0.5) {
      float c = mod(max(t - info.z, 0.0), 6.0);
      float k = clamp(c / 2.2, 0.0, 1.0);
      a *= step(info.y, k) * (0.45 + 0.55 * smoothstep(k - 0.22, k, info.y)) * (1.0 - smoothstep(4.6, 6.0, c));
    }
  }
  if (kind > 1.5 && kind < 2.5 && hasFocus > 0.5) {
    a *= f > 0.5 ? 1.0 : 0.3;
    size *= f > 0.5 ? 1.5 : 1.0;
  }
  if (kind > 3.5) {
    float ph = fract(t * 0.6);
    size *= 1.0 + ph * 2.2;
    a *= 1.0 - ph;
    if (kind > 4.5) a *= f * hasFocus;
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

/** Shortest signed angle from a to b. */
const turn = (a: number, b: number) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

export type Globe = {
  /** Focus on these pins (indices into PINS), or pass null to return to the slow tour. */
  focus: (pins: number[] | null) => void;
  destroy: () => void;
};

type Options = {
  reduce: boolean;
  /** One label element per pin, positioned over the globe while its pin is focused. */
  labels: (HTMLElement | null)[];
};

export function createGlobe(canvas: HTMLCanvasElement, opts: Options): Globe | null {
  // Without GPU acceleration, draw still frames instead of animating
  const fast = context(canvas);
  const gl = fast ?? context(canvas, false);
  const reduce = opts.reduce || !fast;
  const earth = gl && program(gl, EARTH_VS, EARTH_FS);
  const pts = gl && program(gl, PTS_VS, PTS_FS);
  if (!gl || !earth || !pts) return null;
  const mobile = window.matchMedia("(max-width: 860px)").matches;

  /* ---------- Geometry ---------- */
  const pos: number[] = [];
  const info: number[] = [];
  const pinOf: number[] = [];
  const add = (p: V3, kind: number, u: number, delay: number, size: number, pin: number) => {
    pos.push(...p);
    info.push(kind, u, delay, size);
    pinOf.push(pin);
  };
  const dubai = ll(DUBAI, R * 1.003);
  const pinPos = PINS.map((c) => ll(c, R * 1.003));
  // Arcs follow the great circle from each city to Dubai, lifted gently (longer flights fly a little higher),
  // so even the transatlantic ones stay close to the earth and inside the frame.
  const unit = (p: V3): V3 => {
    const l = Math.hypot(...p);
    return [p[0] / l, p[1] / l, p[2] / l];
  };
  const ud = unit(dubai);
  pinPos.forEach((s, i) => {
    const us = unit(s);
    const om = Math.acos(Math.min(1, us[0] * ud[0] + us[1] * ud[1] + us[2] * ud[2]));
    const amp = 0.05 + (0.15 * om) / Math.PI;
    for (let j = 0; j <= ARC_POINTS; j++) {
      const u = j / ARC_POINTS;
      const k1 = Math.sin((1 - u) * om) / Math.sin(om), k2 = Math.sin(u * om) / Math.sin(om);
      const r = R * (1.003 + amp * Math.sin(Math.PI * u));
      add([(k1 * us[0] + k2 * ud[0]) * r, (k1 * us[1] + k2 * ud[1]) * r, (k1 * us[2] + k2 * ud[2]) * r], 3, u, (i * 6) / PINS.length, mobile ? 1.6 : 1.8, i);
    }
    add(s, 2, 0, 0, mobile ? 4.5 : 5, i);
    add(s, 5, 0, 0, 8, i);
  });
  add(dubai, 1, 0, 0, mobile ? 5.5 : 6.5, DUBAI_SLOT);
  add(dubai, 4, 0, 0, 9, DUBAI_SLOT);
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
  const pinBuf = buf(new Float32Array(pinOf));
  const loc = {
    q: gl.getAttribLocation(earth, "q"),
    pos: gl.getAttribLocation(pts, "pos"),
    info: gl.getAttribLocation(pts, "info"),
    pin: gl.getAttribLocation(pts, "pin"),
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
  const E = { map: ue("map"), inv: ue("inv"), camZ: ue("camZ"), tanH: ue("tanH"), aspect: ue("aspect"), ready: ue("ready"), fdir: ue("fdir"), famt: ue("famt") };
  const P = {
    vp: up("vp"),
    model: up("model"),
    t: up("t"),
    dpr: up("dpr"),
    ready: up("ready"),
    still: up("still"),
    hasFocus: up("hasFocus"),
    focusT: up("focusT"),
    focus: up("uFocus"),
  };

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
      still();
    }
  };
  img.src = TEXTURE;

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  /* ---------- Camera: tour when idle, ease to a focus target when asked ---------- */
  // Turning to a point: undo its azimuth (yaw), then tilt it to the centre (pitch).
  const yawOf = (p: V3) => -Math.atan2(p[0], p[2]);
  const pitchOf = (p: V3) => Math.atan2(p[1], Math.hypot(p[0], p[2]));
  const yawFor = (lon: number) => yawOf(ll([0, lon]));
  const tourPitch = ((DUBAI[0] + 10) * Math.PI) / 180; // a little north of Dubai, so the arcs sit in frame
  const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  /** Rest on each view in TOUR, then turn the short way round to the next. Starts facing Dubai. */
  const tourYaw = (t: number) => {
    const step = HOLD + MOVE;
    const i = Math.floor(t / step) % TOUR.length;
    const local = t % step;
    const a = yawFor(TOUR[i]);
    if (local < HOLD) return a;
    return a + turn(a, yawFor(TOUR[(i + 1) % TOUR.length])) * ease((local - HOLD) / MOVE);
  };

  const cam = { yaw: yawFor(TOUR[0]), pitch: tourPitch, zoom: 1, light: 0 };
  let lightDir: V3 = [0, 0, 1]; // object-space direction of the focused place, for the pool of light
  const focusMask = new Float32Array(PINS.length + 1);
  let focused: number[] | null = null;
  let focusTarget = { yaw: 0, pitch: 0, zoom: 1 };
  let focusAt = 0;
  let tourT = 0; // the tour clock only runs while nothing is focused
  let elapsed = 0;

  let dpr = 1, aspect = 1, baseZ = 6.3;
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

  /** Place each focused pin's label over the globe (above the pin, or below it when that would overlap another); hide the rest. */
  const placeLabels = (model: Mat4, vp: Mat4) => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const placed: { x: number; y: number; w: number; h: number }[] = [];
    opts.labels.forEach((el, i) => {
      if (!el) return;
      const on = !!focused && focusMask[i] > 0.5;
      if (!on) {
        el.style.opacity = "0";
        return;
      }
      const p = pinPos[i];
      const wx = model[0] * p[0] + model[4] * p[1] + model[8] * p[2];
      const wy = model[1] * p[0] + model[5] * p[1] + model[9] * p[2];
      const wz = model[2] * p[0] + model[6] * p[1] + model[10] * p[2];
      const cx = vp[0] * wx + vp[4] * wy + vp[8] * wz + vp[12];
      const cy = vp[1] * wx + vp[5] * wy + vp[9] * wz + vp[13];
      const cw = vp[3] * wx + vp[7] * wy + vp[11] * wz + vp[15];
      const facing = wz / Math.hypot(wx, wy, wz);
      el.style.opacity = facing > 0.15 ? String(Math.min(1, (facing - 0.15) * 4)) : "0";
      const x = ((cx / cw) * 0.5 + 0.5) * w, y = (0.5 - (cy / cw) * 0.5) * h;
      const lw = el.offsetWidth, lh = el.offsetHeight;
      const box = (dy: number) => ({ x: x - lw / 2, y: y + dy, w: lw, h: lh });
      const hits = (b: { x: number; y: number; w: number; h: number }) =>
        placed.some((o) => b.x < o.x + o.w + 6 && o.x < b.x + b.w + 6 && b.y < o.y + o.h && o.y < b.y + b.h);
      let b = box(-lh * 2); // centred just above the pin
      if (hits(b)) b = box(lh); // or just below it
      placed.push(b);
      el.style.transform = `translate(${b.x}px, ${b.y}px)`;
    });
  };

  function draw(dt: number) {
    const d = fit(canvas, mobile ? 1.5 : 2);
    if (d) {
      dpr = d;
      gl!.viewport(0, 0, canvas.width, canvas.height);
      aspect = canvas.width / canvas.height;
      baseZ = 6.3 / Math.min(1, aspect); // leaves room round the earth for its glow and the arcs
    }
    if (!loaded) return;
    if (!focused) tourT += dt;
    const target = focused ? focusTarget : { yaw: tourYaw(tourT), pitch: tourPitch, zoom: 1 };
    // Ease toward the target; jump straight there for still frames
    const k = reduce ? 1 : 1 - Math.exp(-dt * (focused ? 2.4 : 1.2));
    cam.yaw += turn(cam.yaw, target.yaw) * k;
    cam.pitch += (target.pitch - cam.pitch) * k;
    cam.zoom += (target.zoom - cam.zoom) * k;
    cam.light += ((focused ? 1 : 0) - cam.light) * (reduce ? 1 : 1 - Math.exp(-dt * 2.6));
    ptr.x += (ptr.tx - ptr.x) * 0.05;
    ptr.y += (ptr.ty - ptr.y) * 0.05;

    const camZ = baseZ * cam.zoom;
    const vp = multiply(perspective(FOV, aspect), translation(0, 0, -camZ));
    const model = multiply(rotationX(cam.pitch + ptr.y * 0.2), rotationY(cam.yaw + ptr.x * 0.4));
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
    g.uniform3fv(E.fdir, lightDir);
    g.uniform1f(E.famt, cam.light);
    g.drawArrays(g.TRIANGLES, 0, 6);

    g.useProgram(pts!);
    reset();
    bind(loc.pos, posBuf, 3);
    bind(loc.info, infoBuf, 4);
    bind(loc.pin, pinBuf, 1);
    g.uniformMatrix4fv(P.vp, false, vp);
    g.uniformMatrix4fv(P.model, false, model);
    g.uniform1f(P.t, reduce ? 4.1 : elapsed);
    g.uniform1f(P.dpr, dpr);
    g.uniform1f(P.ready, fade);
    g.uniform1f(P.still, reduce ? 1 : 0); // a still frame shows every arc at once
    g.uniform1f(P.hasFocus, focused ? 1 : 0);
    g.uniform1f(P.focusT, focusAt);
    g.uniform1fv(P.focus, focusMask);
    g.drawArrays(g.POINTS, 0, count);
    placeLabels(model, vp);
  }
  const still = () => draw(0);

  let raf = 0, last = 0;
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    if (loaded) {
      elapsed += dt;
      fade = Math.min(1, fade + dt / 0.9);
    }
    draw(loaded ? dt : 0);
  };
  const io = new IntersectionObserver(([e]) => {
    if (reduce) return still();
    if (e.isIntersecting && !raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    } else if (!e.isIntersecting && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  });
  io.observe(canvas);
  const onResize = () => reduce && still();
  window.addEventListener("resize", onResize);

  return {
    focus(pins) {
      const next = pins && pins.length ? pins.filter((i) => i >= 0 && i < PINS.length) : null;
      if (String(next) === String(focused)) return;
      focused = next && next.length ? next : null;
      focusMask.fill(0);
      if (focused) {
        focused.forEach((i) => (focusMask[i] = 1));
        // Aim at the middle of the focused pins; move in closer for a single city
        const c = focused.reduce<V3>((s, i) => [s[0] + pinPos[i][0], s[1] + pinPos[i][1], s[2] + pinPos[i][2]], [0, 0, 0]);
        focusTarget = { yaw: yawOf(c), pitch: pitchOf(c), zoom: focused.length === 1 ? 0.93 : 0.96 };
        lightDir = unit(c);
        focusAt = elapsed;
      }
      if (reduce) still();
    },
    destroy() {
      io.disconnect();
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
      window.removeEventListener("resize", onResize);
      release(gl);
    },
  };
}
