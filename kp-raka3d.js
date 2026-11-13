/* K-Pedia — RAKA 3D (renderer WebGL2 mandiri, tanpa Three.js)
   Aset: assets/raka/raka.glb (satu mesh geometri murni, tanpa material, tekstur, rig, atau animasi).
   Karena GLB tidak berwarna, warna seragam diproyeksikan dari gambar karakter (assets/raka/raka-front.webp)
   memakai penyelarasan siluet yang dihitung saat membangun aset (konstanta MAP di bawah).
   Gerak: napas, menoleh mengikuti pointer, dan anggukan sapaan — deformasi lunak di vertex shader.
   Lambaian lengan sengaja tidak dibuat: tanpa rig, lengan merusak bentuk karakter.
   Tidak ada rig yang dikarang; bila WebGL2 gagal, gambar 2D (raka-stand.webp) dipakai sebagai cadangan. */
"use strict";
(function () {
  const GLB = "assets/raka/raka.glb", TEX = "assets/raka/raka-front.webp", FALLBACK = "assets/raka/raka-stand.webp";
  const MAP = { sx: 428.97, sy: 461.26, tx: 212.21, ty: 491.49, W: 392, H: 1024 };
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  let meshPromise = null;

  function parseGLB(buf) {
    const dv = new DataView(buf);
    if (dv.getUint32(0, true) !== 0x46546c67) throw new Error("bukan GLB");
    const jl = dv.getUint32(12, true), json = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, jl)));
    const bo = 20 + jl + 8, view = (i) => { const a = json.accessors[i], v = json.bufferViews[a.bufferView]; return { a, off: bo + (v.byteOffset || 0) + (a.byteOffset || 0) }; };
    const prim = json.meshes[0].primitives[0];
    const pi = view(prim.attributes.POSITION), ii = view(prim.indices);
    const pos = new Float32Array(buf.slice(pi.off, pi.off + pi.a.count * 12));
    const idx = ii.a.componentType === 5125 ? new Uint32Array(buf.slice(ii.off, ii.off + ii.a.count * 4)) : Uint32Array.from(new Uint16Array(buf.slice(ii.off, ii.off + ii.a.count * 2)));
    return { pos, idx };
  }
  function normals(pos, idx) {
    const n = new Float32Array(pos.length);
    for (let i = 0; i < idx.length; i += 3) {
      const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
      const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
      const vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      for (const k of [a, b, c]) { n[k] += nx; n[k + 1] += ny; n[k + 2] += nz; }
    }
    for (let i = 0; i < n.length; i += 3) { const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1; n[i] /= l; n[i + 1] /= l; n[i + 2] /= l; }
    return n;
  }
  function loadMesh() {
    if (!meshPromise) meshPromise = fetch(GLB).then(r => { if (!r.ok) throw new Error("GLB " + r.status); return r.arrayBuffer(); }).then(b => { const m = parseGLB(b); m.nor = normals(m.pos, m.idx); return m; });
    return meshPromise;
  }
  const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });

  const VS = `#version 300 es
precision highp float;
in vec3 aPos; in vec3 aNor;
uniform mat4 uProj; uniform mat4 uModel; uniform vec4 uMap; uniform vec2 uTex;
uniform vec2 uLook; uniform float uBreath;
out vec2 vUV; out vec3 vN;
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,s,-s,c); }
void main(){
  vec3 p=aPos, n=aNor;
  vUV = vec2((aPos.x*uMap.x+uMap.z)/uTex.x, (-aPos.y*uMap.y+uMap.w)/uTex.y);
  float chest = smoothstep(-0.1,0.1,p.y)*(1.0-smoothstep(0.3,0.4,p.y));
  p.xz *= 1.0 + uBreath*0.012*chest;
  /* menoleh: kepala berputar lunak di sekitar leher */
  float hw = smoothstep(0.34,0.46,p.y);
  vec3 pv = vec3(0.0,0.33,0.0);
  vec3 q = p-pv; vec3 qn = n;
  q.xz = rot(-uLook.x)*q.xz; qn.xz = rot(-uLook.x)*qn.xz;
  q.yz = rot(uLook.y)*q.yz;  qn.yz = rot(uLook.y)*qn.yz;
  p = mix(p, q+pv, hw); n = normalize(mix(n, qn, hw));
  vN = mat3(uModel)*n;
  gl_Position = uProj*uModel*vec4(p,1.0);
}`;
  const FS = `#version 300 es
precision mediump float;
in vec2 vUV; in vec3 vN; uniform sampler2D uImg; uniform vec3 uRim; out vec4 o;
void main(){
  vec3 c = texture(uImg, clamp(vUV,0.0,1.0)).rgb;
  vec3 N = normalize(vN);
  float d = max(dot(N, normalize(vec3(-0.35,0.55,0.75))),0.0);
  float rim = pow(1.0-clamp(N.z,0.0,1.0), 2.6);
  o = vec4(c*(0.80+0.24*d) + uRim*rim*0.32, 1.0);
}`;

  function sh(gl, t, s) { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
  function persp(f, a, n, fr) { const t = 1 / Math.tan(f / 2); return [t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (fr + n) / (n - fr), -1, 0, 0, 2 * fr * n / (n - fr), 0]; }
  function model(yaw, pitch, dist, yoff) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    // M = T(0,0,-dist) * Rx(pitch) * Ry(yaw) * T(0,-yoff,0)
    const R = [cy, sy * sp, -sy * cp, 0, 0, cp, sp, 0, sy, -cy * sp, cy * cp, 0, 0, 0, 0, 1];
    const tx = 0, ty = -yoff, tz = 0;
    R[12] = R[0] * tx + R[4] * ty + R[8] * tz; R[13] = R[1] * tx + R[5] * ty + R[9] * tz; R[14] = R[2] * tx + R[6] * ty + R[10] * tz - dist;
    return R;
  }
  const ease = (t) => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  function mount(host, opts) {
    opts = opts || {};
    const still = reduce();
    const fb = () => { host.classList.add("is-fallback"); if (!host.querySelector("img")) { const i = new Image(); i.src = FALLBACK; i.alt = ""; i.decoding = "async"; host.appendChild(i); } opts.onFail && opts.onFail(); };
    const canvas = document.createElement("canvas"); canvas.className = "raka3d-canvas"; canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl2", { alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: "low-power" });
    if (!gl) { fb(); return { destroy() {}, greet() {}, react() {} }; }
    let alive = true, raf = 0, visible = true;
    const st = { yaw: 0, pitch: 0, ty: 0, tp: 0, look: [0, 0], tl: [0, 0], waveT: -1, react: -1, t0: performance.now(), last: performance.now() };
    let prog, mesh, vao, uni = {}, tex, n = 0;
    const api = {
      destroy() { alive = false; cancelAnimationFrame(raf); removeEventListener("pointermove", onMove); document.removeEventListener("visibilitychange", onVis); io && io.disconnect(); ro && ro.disconnect(); canvas.remove(); },
      greet() { st.waveT = 0; kick(); },
      react() { st.react = 0; kick(); }
    };
    Promise.all([loadMesh(), loadImg(TEX)]).then(([m, img]) => {
      if (!alive) return; mesh = m;
      prog = gl.createProgram(); gl.attachShader(prog, sh(gl, gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl, gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
      gl.useProgram(prog);
      vao = gl.createVertexArray(); gl.bindVertexArray(vao);
      const mk = (data, name, tgt) => { const b = gl.createBuffer(); gl.bindBuffer(tgt, b); gl.bufferData(tgt, data, gl.STATIC_DRAW); if (name) { const l = gl.getAttribLocation(prog, name); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 3, gl.FLOAT, false, 0, 0); } };
      mk(m.pos, "aPos", gl.ARRAY_BUFFER); mk(m.nor, "aNor", gl.ARRAY_BUFFER); mk(m.idx, null, gl.ELEMENT_ARRAY_BUFFER); n = m.idx.length;
      tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      ["uProj", "uModel", "uMap", "uTex", "uLook", "uBreath", "uImg", "uRim"].forEach(k => uni[k] = gl.getUniformLocation(prog, k));
      gl.uniform4f(uni.uMap, MAP.sx, MAP.sy, MAP.tx, MAP.ty); gl.uniform2f(uni.uTex, MAP.W, MAP.H); gl.uniform1i(uni.uImg, 0); gl.uniform3f(uni.uRim, 1.0, 0.62, 0.2);
      gl.enable(gl.DEPTH_TEST); gl.clearColor(0, 0, 0, 0);
      host.appendChild(canvas); host.classList.remove("is-fallback"); host.querySelector("img")?.remove(); host.classList.add("is-ready");
      resize(); opts.onReady && opts.onReady(api);
      if (still) draw(0); else { kick(); setTimeout(() => api.greet(), opts.greetDelay ?? 900); }
    }).catch(e => { console.warn("RAKA 3D:", e.message); if (alive) fb(); });

    function resize() {
      const r = host.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      const w = Math.max(2, Math.round(r.width * dpr)), h = Math.max(2, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
      if (still && mesh) draw(0);
    }
    function draw(dt) {
      const time = (performance.now() - st.t0) / 1000, k = Math.min(1, dt * 6);
      st.yaw += (st.ty - st.yaw) * k; st.pitch += (st.tp - st.pitch) * k;
      st.look[0] += (st.tl[0] - st.look[0]) * Math.min(1, dt * 7); st.look[1] += (st.tl[1] - st.look[1]) * Math.min(1, dt * 7);
      let bob = 0, nod = 0;
      if (st.waveT >= 0) { st.waveT += dt; const p = st.waveT / 1.1; if (p >= 1) st.waveT = -1; else { nod = Math.sin(p * Math.PI) * .2 + Math.sin(p * Math.PI * 2) * .05; bob = Math.sin(p * Math.PI) * .012; } }
      if (st.react >= 0) { st.react += dt; const p = st.react / .55; if (p >= 1) st.react = -1; else { nod = Math.sin(p * Math.PI) * .16; bob = Math.sin(p * Math.PI) * .018; } }
      const aspect = canvas.width / canvas.height, fov = 0.34, fill = 0.94;
      const dist = (1.0 / Math.tan(fov / 2)) / fill + 0.1;
      const breath = still ? 0 : Math.sin(time * 1.9);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(prog); gl.bindVertexArray(vao); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniformMatrix4fv(uni.uProj, false, persp(fov, aspect, 0.1, 20));
      gl.uniformMatrix4fv(uni.uModel, false, model(st.yaw * 0.6, st.pitch * 0.3, dist, bob - 0.0));
      gl.uniform2f(uni.uLook, st.look[0] + st.yaw * 0.5, st.look[1] + nod);
      gl.uniform1f(uni.uBreath, breath);
      gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_INT, 0);
    }
    function frame(now) {
      raf = 0; if (!alive || !mesh) return;
      const dt = Math.min(0.05, (now - st.last) / 1000); st.last = now;
      draw(dt);
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && alive && mesh && visible && !still) { st.last = performance.now(); raf = requestAnimationFrame(frame); } else if (still && mesh) draw(0); }
    function onMove(e) {
      if (still || e.pointerType === "touch") return;
      const r = host.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * .25;
      const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / (innerWidth * .5))), ny = Math.max(-1, Math.min(1, (e.clientY - cy) / (innerHeight * .5)));
      st.ty = nx * 0.5; st.tp = ny * 0.35; st.tl = [nx * 0.45, -ny * 0.22];
    }
    function onVis() { if (!document.hidden) kick(); }
    addEventListener("pointermove", onMove, { passive: true }); document.addEventListener("visibilitychange", onVis);
    const io = "IntersectionObserver" in window ? new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) kick(); }) : null; io && io.observe(host);
    const ro = "ResizeObserver" in window ? new ResizeObserver(() => { if (mesh) resize(); }) : null; ro && ro.observe(host);
    return api;
  }
  window.KPRaka3D = { mount };
})();
