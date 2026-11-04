import * as THREE from 'three';

/* ============================================================
   WORLD — 밝은 하늘 / 칙칙한 도시
   ============================================================ */

const PAL = {
  skyTop:    0x5FA6DE,
  skyHaze:   0xCFE2EF,
  sun:       0xFFF6E2,
  ground:    0xB4AC9B,
  groundDim: 0x9C947F,
  road:      0x4A4742,
  curb:      0xB0A897,
  facadeA:   0x7B7060,
  facadeB:   0x655C4F,
  facadeC:   0x877860,
  rust:      0x8C5A3C,
  signBlue:  0x3E6B84,
  signRed:   0xA5432F,
  signYellow:0xC9A227,
  metal:     0x6E6A63,
  darkMetal: 0x3A3733,
  wood:      0x6B5641,
  glassTint: 0x8FB6CE
};

/* ---------- 절차적 텍스처 ---------- */
function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function noiseOverlay(ctx, w, h, amount, alpha) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amount;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  if (alpha) {
    ctx.globalAlpha = alpha;
    ctx.globalAlpha = 1;
  }
}

function concreteTexture() {
  const S = 1024;
  const [c, ctx] = makeCanvas(S, S);
  ctx.fillStyle = '#948a72';
  ctx.fillRect(0, 0, S, S);

  // 얼룩 (기름때, 물때)
  for (let i = 0; i < 260; i++) {
    const x = Math.random() * S, y = Math.random() * S;
    const r = 10 + Math.random() * 120;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const dark = Math.random() < 0.7;
    g.addColorStop(0, dark ? 'rgba(58,52,42,0.22)' : 'rgba(196,188,168,0.18)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
  // 보도블록 줄눈
  ctx.strokeStyle = 'rgba(120,113,99,0.45)';
  ctx.lineWidth = 2;
  const step = S / 12;
  for (let i = 0; i <= 12; i++) {
    ctx.beginPath(); ctx.moveTo(i * step, 0); ctx.lineTo(i * step, S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * step); ctx.lineTo(S, i * step); ctx.stroke();
  }
  noiseOverlay(ctx, S, S, 26);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  t.encoding = THREE.sRGBEncoding;
  return t;
}

function asphaltTexture() {
  const S = 512;
  const [c, ctx] = makeCanvas(S, S);
  ctx.fillStyle = '#4c4944';
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * S, y = Math.random() * S;
    ctx.fillStyle = Math.random() < 0.5 ? 'rgba(30,28,26,0.5)' : 'rgba(110,106,99,0.35)';
    ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  // 갈라진 자국
  ctx.strokeStyle = 'rgba(28,26,24,0.5)';
  for (let i = 0; i < 12; i++) {
    ctx.lineWidth = 0.6 + Math.random();
    ctx.beginPath();
    let x = Math.random() * S, y = Math.random() * S;
    ctx.moveTo(x, y);
    for (let s = 0; s < 8; s++) {
      x += (Math.random() - 0.5) * 60; y += (Math.random() - 0.5) * 60;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  noiseOverlay(ctx, S, S, 20);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  t.encoding = THREE.sRGBEncoding;
  return t;
}

function facadeTexture(baseHex, seed) {
  const S = 512;
  const [c, ctx] = makeCanvas(S, S);
  const base = new THREE.Color(baseHex);
  ctx.fillStyle = '#' + base.getHexString();
  ctx.fillRect(0, 0, S, S);

  // 콘크리트 판 이음선
  ctx.strokeStyle = 'rgba(0,0,0,0.14)';
  ctx.lineWidth = 3;
  for (let y = 0; y <= S; y += S / 4) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(S, y); ctx.stroke();
  }
  // 빗물 흘러내린 자국
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * S;
    const w = 3 + Math.random() * 16;
    const g = ctx.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, 'rgba(48,42,34,0.28)');
    g.addColorStop(0.6, 'rgba(48,42,34,0.10)');
    g.addColorStop(1, 'rgba(48,42,34,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x, Math.random() * S * 0.4, w, S);
  }
  // 매연 누적 (아래로 갈수록 진하게)
  const smog = ctx.createLinearGradient(0, S * 0.35, 0, S);
  smog.addColorStop(0, 'rgba(40,36,30,0)');
  smog.addColorStop(1, 'rgba(40,36,30,0.35)');
  ctx.fillStyle = smog;
  ctx.fillRect(0, 0, S, S);
  noiseOverlay(ctx, S, S, 22);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  t.encoding = THREE.sRGBEncoding;
  return t;
}

/* 하늘 그라디언트 큐브맵 — 유리 반사용 */
function skyEnvMap(renderer) {
  const faces = [];
  for (let i = 0; i < 6; i++) {
    const [c, ctx] = makeCanvas(128, 128);
    if (i === 2) {                       // +Y : 하늘 위
      ctx.fillStyle = '#4E98D6'; ctx.fillRect(0, 0, 128, 128);
    } else if (i === 3) {                // -Y : 도시 바닥
      ctx.fillStyle = '#6E6553'; ctx.fillRect(0, 0, 128, 128);
    } else {                             // 옆면 : 지평선
      const g = ctx.createLinearGradient(0, 0, 0, 128);
      g.addColorStop(0, '#5FA6DE');
      g.addColorStop(0.52, '#CFE2EF');
      g.addColorStop(0.56, '#8C8271');
      g.addColorStop(1, '#5C5548');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
    }
    faces.push(c);
  }
  const cube = new THREE.CubeTexture(faces);
  cube.encoding = THREE.sRGBEncoding;
  cube.needsUpdate = true;
  return cube;
}

/* ============================================================
   빌드
   ============================================================ */

const PLAZA = { w: 78, d: 54 };
const ROAD_Z = 34;      // 도로 중심 z
const ROAD_W = 13;

function buildWorld(scene, renderer) {
  const W = {
    perches: [],        // {pos:Vector3, hard:0..1, kind:'wire'|'lamp'|'sign'|'ledge'|'bench'|'ac'}
    glass: [],          // {box:Box3, normal:Vector3, mesh}
    stringZones: [],    // {x,z,r}
    solids: [],         // Box3 충돌 (건물)
    platforms: [],      // Box3 얇은 판 (천막·차양·실외기·처마) — 위에 앉고, 뚫고 못 지나감
    cars: [],
    ground: null,
    roadBox: null,
    stainGroup: null
  };

  const env = skyEnvMap(renderer);
  scene.environment = env;

  /* ---------- 하늘 ---------- */
  const skyGeo = new THREE.SphereGeometry(420, 32, 20);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: {
      top: { value: new THREE.Color(PAL.skyTop) },
      haze: { value: new THREE.Color(PAL.skyHaze) }
    },
    vertexShader: `varying float vy; void main(){ vy = normalize(position).y; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `varying float vy; uniform vec3 top; uniform vec3 haze;
      void main(){ float t = smoothstep(-0.05,0.55,vy); vec3 c = mix(haze, top, t);
        // 얇은 구름 띠
        c += vec3(0.05)*smoothstep(0.15,0.35,vy)*(1.0-smoothstep(0.35,0.6,vy));
        gl_FragColor = vec4(c,1.0);} `
  });
  scene.add(new THREE.Mesh(skyGeo, skyMat));

  /* ---------- 조명 ---------- */
  const hemi = new THREE.HemisphereLight(0xBFDCF2, 0x6B6252, 0.34);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(PAL.sun, 1.25);
  sun.position.set(38, 52, 24);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -55; sc.right = 55; sc.top = 55; sc.bottom = -55;
  sc.near = 1; sc.far = 160;
  sun.shadow.bias = -0.0009;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0xA8BED0, 0.09));

  scene.fog = new THREE.Fog(0xC6D9E6, 90, 330);

  /* ---------- 광장 바닥 ---------- */
  const gTex = concreteTexture();
  gTex.repeat.set(11, 8);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(PLAZA.w, PLAZA.d),
    new THREE.MeshStandardMaterial({ map: gTex, roughness: 0.96, metalness: 0.0, color: 0xffffff })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  W.ground = ground;

  // 광장 바깥 여백 바닥 (멀리까지)
  const outer = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.MeshStandardMaterial({ color: 0x8A8271, roughness: 1 })
  );
  outer.rotation.x = -Math.PI / 2;
  outer.position.y = -0.02;
  scene.add(outer);

  /* ---------- 도로 ---------- */
  const aTex = asphaltTexture();
  aTex.repeat.set(16, 3);
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(220, ROAD_W),
    new THREE.MeshStandardMaterial({ map: aTex, roughness: 0.9 })
  );
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.012, ROAD_Z);
  road.receiveShadow = true;
  scene.add(road);
  W.roadBox = { z0: ROAD_Z - ROAD_W / 2, z1: ROAD_Z + ROAD_W / 2 };

  // 중앙선
  for (let x = -105; x < 105; x += 7) {
    const line = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 0.22),
      new THREE.MeshBasicMaterial({ color: 0xD9CE9B })
    );
    line.rotation.x = -Math.PI / 2;
    line.position.set(x, 0.02, ROAD_Z);
    scene.add(line);
  }
  // 연석
  const curbMat = new THREE.MeshStandardMaterial({ color: PAL.curb, roughness: 0.95 });
  [ROAD_Z - ROAD_W / 2 - 0.2, ROAD_Z + ROAD_W / 2 + 0.2].forEach(z => {
    const cb = new THREE.Mesh(new THREE.BoxGeometry(220, 0.22, 0.4), curbMat);
    cb.position.set(0, 0.11, z);
    cb.receiveShadow = true; cb.castShadow = true;
    scene.add(cb);
  });

  /* ---------- 건물 ---------- */
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x5E7686, roughness: 0.09, metalness: 0.88,
    envMap: env, envMapIntensity: 1.0
  });
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x4A5560, roughness: 0.35, metalness: 0.5, envMap: env, envMapIntensity: 0.55
  });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x55504A, roughness: 0.8 });

  function addBuilding(cx, cz, w, d, h, faceHex, facing) {
    const g = new THREE.Group();
    const tex = facadeTexture(faceHex, cx);
    tex.repeat.set(Math.max(1, w / 6), Math.max(1, h / 6));
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 })
    );
    body.position.set(cx, h / 2, cz);
    body.castShadow = true; body.receiveShadow = true;
    g.add(body);
    W.solids.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(cx, h / 2, cz), new THREE.Vector3(w, h, d)));

    // facing: 광장을 바라보는 방향 단위벡터
    const n = facing.clone();
    const right = new THREE.Vector3(-n.z, 0, n.x);
    const faceOff = (Math.abs(n.z) > 0.5 ? d : w) / 2;
    const faceW = (Math.abs(n.z) > 0.5 ? w : d);

    // 창문 격자
    const cols = Math.max(2, Math.floor(faceW / 3.0));
    const rows = Math.max(1, Math.floor((h - 5.2) / 3.2));
    for (let r = 0; r < rows; r++) {
      for (let cI = 0; cI < cols; cI++) {
        const u = (cI + 0.5) / cols - 0.5;
        const y = 4.7 + r * 3.2;
        if (y > h - 1.6) continue;
        const px = cx + n.x * (faceOff + 0.06) + right.x * u * faceW * 0.92;
        const pz = cz + n.z * (faceOff + 0.06) + right.z * u * faceW * 0.92;

        const isGlass = Math.random() < 0.28 && y < 14;   // 큰 통유리 (반사 강함)
        const ww = isGlass ? 2.4 : 1.6, wh = isGlass ? 2.5 : 1.9;

        const frame = new THREE.Mesh(new THREE.BoxGeometry(ww + 0.22, wh + 0.22, 0.12), frameMat);
        frame.position.set(px, y, pz);
        frame.lookAt(px + n.x, y, pz + n.z);
        g.add(frame);

        const pane = new THREE.Mesh(
          new THREE.PlaneGeometry(ww, wh),
          isGlass ? glassMat : windowMat
        );
        pane.position.set(px + n.x * 0.09, y, pz + n.z * 0.09);
        pane.lookAt(px + n.x * 2, y, pz + n.z * 2);
        g.add(pane);

        if (isGlass) {
          W.glass.push({
            pos: new THREE.Vector3(px + n.x * 0.09, y, pz + n.z * 0.09),
            normal: n.clone(), hw: ww / 2, hh: wh / 2, mesh: pane
          });
        }

        // 창턱 (횃대)
        const sill = new THREE.Mesh(new THREE.BoxGeometry(ww + 0.3, 0.12, 0.34), frameMat);
        sill.position.set(px + n.x * 0.16, y - wh / 2 - 0.1, pz + n.z * 0.16);
        sill.lookAt(px + n.x * 2, y - wh / 2 - 0.1, pz + n.z * 2);
        sill.castShadow = true;
        g.add(sill);
        W.perches.push({
          pos: new THREE.Vector3(px + n.x * 0.28, y - wh / 2 + 0.02, pz + n.z * 0.28),
          hard: 0.45, kind: 'ledge', normal: n.clone()
        });
      }
    }

    // 처마 / 옥상 난간 (쉬운 자리)
    const cornice = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.7, 0.5, d + 0.7),
      new THREE.MeshStandardMaterial({ color: 0x6E6455, roughness: 0.95 })
    );
    cornice.position.set(cx, h - 0.25, cz);
    cornice.castShadow = true; cornice.receiveShadow = true;
    g.add(cornice);
    W.platforms.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(cx, h - 0.25, cz), new THREE.Vector3(w + 0.7, 0.5, d + 0.7)));


    // 실외기
    const acMat = new THREE.MeshStandardMaterial({ color: 0x9A968C, roughness: 0.75, metalness: 0.35 });
    const acGrill = new THREE.MeshStandardMaterial({ color: 0x4C4842, roughness: 0.6, metalness: 0.4 });
    for (let i = 0; i < 4; i++) {
      const u = (Math.random() - 0.5) * 0.8;
      const y = 4 + Math.random() * (h - 8);
      const px = cx + n.x * (faceOff + 0.4) + right.x * u * faceW;
      const pz = cz + n.z * (faceOff + 0.4) + right.z * u * faceW;
      const ac = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.5), acMat);
      ac.position.set(px, y, pz);
      ac.lookAt(px + n.x, y, pz + n.z);
      ac.castShadow = true;
      g.add(ac);
      W.platforms.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(px, y, pz),
        new THREE.Vector3(Math.abs(n.z) > 0.5 ? 0.9 : 0.5, 0.7, Math.abs(n.z) > 0.5 ? 0.5 : 0.9)));
      const grill = new THREE.Mesh(new THREE.CircleGeometry(0.26, 16), acGrill);
      grill.position.set(px + n.x * 0.27, y, pz + n.z * 0.27);
      grill.lookAt(px + n.x * 3, y, pz + n.z * 3);
      g.add(grill);
      W.perches.push({
        pos: new THREE.Vector3(px, y + 0.4, pz), hard: 0.3, kind: 'ac', normal: n.clone()
      });
    }

    // 간판
    const signCols = [PAL.signBlue, PAL.signRed, PAL.signYellow, 0x4C7A5A];
    for (let i = 0; i < 2; i++) {
      const u = (Math.random() - 0.5) * 0.7;
      const y = 5 + Math.random() * (h - 10);
      const sw = 2.2 + Math.random() * 2.6;
      const px = cx + n.x * (faceOff + 0.35) + right.x * u * faceW;
      const pz = cz + n.z * (faceOff + 0.35) + right.z * u * faceW;
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(sw, 1.0, 0.24),
        new THREE.MeshStandardMaterial({
          color: signCols[(Math.random() * signCols.length) | 0],
          roughness: 0.7
        })
      );
      sign.position.set(px, y, pz);
      sign.lookAt(px + n.x, y, pz + n.z);
      sign.castShadow = true;
      g.add(sign);
      W.perches.push({
        pos: new THREE.Vector3(px + n.x * 0.05, y + 0.55, pz + n.z * 0.05),
        hard: 0.72, kind: 'sign', normal: n.clone()
      });
    }

    // 1층 상가 유리 + 차양
    const shopH = 2.5;
    const shop = new THREE.Mesh(
      new THREE.PlaneGeometry(faceW * 0.88, shopH * 0.78),
      glassMat
    );
    const spx = cx + n.x * (faceOff + 0.07), spz = cz + n.z * (faceOff + 0.07);
    shop.position.set(spx, shopH * 0.39 + 0.62, spz);
    shop.lookAt(spx + n.x * 2, shopH / 2 + 0.1, spz + n.z * 2);
    g.add(shop);
    W.glass.push({
      pos: new THREE.Vector3(spx, shopH * 0.39 + 0.62, spz),
      normal: n.clone(), hw: faceW * 0.44, hh: shopH * 0.39, mesh: shop
    });
    // 기단 + 유리 상단 프레임
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(faceW * 0.96, 0.62, 0.30),
      new THREE.MeshStandardMaterial({ color: 0x50483D, roughness: 0.95 }));
    plinth.position.set(cx + n.x * (faceOff + 0.10), 0.31, cz + n.z * (faceOff + 0.10));
    plinth.lookAt(cx + n.x * 99, 0.31, cz + n.z * 99);
    plinth.receiveShadow = true; plinth.castShadow = true;
    g.add(plinth);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(faceW * 0.96, 0.34, 0.26), frameMat);
    lintel.position.set(cx + n.x * (faceOff + 0.09), shopH + 0.12, cz + n.z * (faceOff + 0.09));
    lintel.lookAt(cx + n.x * 99, shopH + 0.12, cz + n.z * 99);
    lintel.castShadow = true;
    g.add(lintel);

    const awnCols = [0x7E3A2C, 0x2F5468, 0x4A5C36, 0x6B5228];
    const nAwn = Math.max(1, Math.round(faceW / 9));
    for (let ai = 0; ai < nAwn; ai++) {
      const u = (ai + 0.5) / nAwn - 0.5;
      const aw = Math.min(5.2, faceW / nAwn * 0.72);
      const ax = cx + n.x * (faceOff + 0.72) + right.x * u * faceW;
      const az = cz + n.z * (faceOff + 0.72) + right.z * u * faceW;
      const awn = new THREE.Mesh(
        new THREE.BoxGeometry(aw, 0.13, 1.35),
        new THREE.MeshStandardMaterial({ color: awnCols[(ai + (cx | 0)) & 3], roughness: 0.88 })
      );
      awn.position.set(ax, shopH + 0.30, az);
      awn.lookAt(ax + n.x * 99, shopH + 0.30, az + n.z * 99);
      awn.castShadow = true;
      g.add(awn);
      W.platforms.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(ax, shopH + 0.30, az),
        new THREE.Vector3(Math.abs(n.z) > 0.5 ? aw : 1.35, 0.13, Math.abs(n.z) > 0.5 ? 1.35 : aw)));
      W.perches.push({
        pos: new THREE.Vector3(ax, shopH + 0.40, az), hard: 0.25, kind: 'awning', normal: n.clone()
      });
    }

    scene.add(g);
  }

  const F = (x, z) => new THREE.Vector3(x, 0, z);
  addBuilding(-30, -36, 26, 16, 21, PAL.facadeA, F(0, 1));
  addBuilding(  0, -38, 22, 16, 27, PAL.facadeB, F(0, 1));
  addBuilding( 28, -35, 24, 16, 17, PAL.facadeC, F(0, 1));
  addBuilding(-47,  -6, 16, 30, 24, PAL.facadeB, F(1, 0));
  addBuilding(-47,  22, 16, 22, 15, PAL.facadeC, F(1, 0));
  addBuilding( 47,  -8, 16, 32, 19, PAL.facadeA, F(-1, 0));
  addBuilding( 47,  24, 16, 22, 26, PAL.facadeB, F(-1, 0));
  // 도로 건너편
  addBuilding(-24, 52, 30, 16, 23, PAL.facadeC, F(0, -1));
  addBuilding( 18, 54, 28, 16, 18, PAL.facadeA, F(0, -1));

  /* ---------- 가로등 + 전선 ---------- */
  const poleMat = new THREE.MeshStandardMaterial({ color: PAL.metal, roughness: 0.6, metalness: 0.6 });
  const wireMat = new THREE.LineBasicMaterial({ color: 0x2E2B27 });
  const lampPos = [];
  for (let i = 0; i < 6; i++) {
    const x = -33 + i * 13.2;
    const z = 20;
    lampPos.push(new THREE.Vector3(x, 0, z));
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 7.2, 8), poleMat);
    pole.position.set(x, 3.6, z);
    pole.castShadow = true;
    scene.add(pole);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 6), poleMat);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(x - 0.7, 7.1, z);
    scene.add(arm);
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.2, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x7C7870, roughness: 0.5, metalness: 0.6 })
    );
    head.position.set(x - 1.35, 7.0, z);
    head.castShadow = true;
    scene.add(head);
    W.perches.push({ pos: new THREE.Vector3(x, 7.28, z), hard: 0.82, kind: 'lamp', normal: new THREE.Vector3(0, 0, -1) });
    W.perches.push({ pos: new THREE.Vector3(x - 1.35, 7.16, z), hard: 0.6, kind: 'lamp', normal: new THREE.Vector3(0, 0, -1) });
  }
  // 전선 (가장 어려운 자리)
  for (let i = 0; i < lampPos.length - 1; i++) {
    const a = lampPos[i].clone().setY(6.6), b = lampPos[i + 1].clone().setY(6.6);
    for (let k = 0; k < 2; k++) {
      const off = k * 0.35;
      const pts = [];
      const sag = 0.9;
      for (let t = 0; t <= 1.0001; t += 0.05) {
        pts.push(new THREE.Vector3(
          a.x + (b.x - a.x) * t,
          a.y - Math.sin(Math.PI * t) * sag - off * 0.3,
          a.z + (b.z - a.z) * t + off
        ));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      scene.add(new THREE.Line(geo, wireMat));
      if (k === 0) {
        for (let t = 0.25; t < 0.9; t += 0.25) {
          W.perches.push({
            pos: new THREE.Vector3(
              a.x + (b.x - a.x) * t,
              a.y - Math.sin(Math.PI * t) * sag + 0.05,
              a.z + (b.z - a.z) * t),
            hard: 1.0, kind: 'wire', normal: new THREE.Vector3(0, 0, -1)
          });
        }
      }
    }
  }

  /* ---------- 벤치 ---------- */
  const benchWood = new THREE.MeshStandardMaterial({ color: PAL.wood, roughness: 0.9 });
  const benchIron = new THREE.MeshStandardMaterial({ color: PAL.darkMetal, roughness: 0.6, metalness: 0.5 });
  const benches = [];
  const benchSpec = [
    [-18, 2, 0], [-2, 6, 0], [14, 1, 0], [26, 10, Math.PI * 0.5], [-28, 14, Math.PI * 0.5], [4, 16, 0]
  ];
  benchSpec.forEach(([x, z, rot]) => {
    const b = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.07, 0.19), benchWood);
      slat.position.set(0, 0.45, -0.22 + i * 0.22);
      slat.castShadow = true; slat.receiveShadow = true;
      b.add(slat);
    }
    for (let i = 0; i < 3; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.17, 0.06), benchWood);
      slat.position.set(0, 0.66 + i * 0.19, -0.34);
      slat.castShadow = true;
      b.add(slat);
    }
    [-0.85, 0.85].forEach(sx => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.62), benchIron);
      leg.position.set(sx, 0.22, -0.05);
      leg.castShadow = true;
      b.add(leg);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.62, 0.07), benchIron);
      back.position.set(sx, 0.72, -0.34);
      b.add(back);
    });
    b.position.set(x, 0, z);
    b.rotation.y = rot;
    scene.add(b);
    benches.push({ x, z, rot });
    W.perches.push({ pos: new THREE.Vector3(x - 0.34 * Math.sin(rot), 1.14, z - 0.34 * Math.cos(rot)), hard: 0.55, kind: 'bench', normal: new THREE.Vector3(Math.sin(rot), 0, Math.cos(rot)) });
    W.perches.push({ pos: new THREE.Vector3(x, 0.50, z), hard: 0.02, kind: 'benchseat', normal: new THREE.Vector3(Math.sin(rot), 0, Math.cos(rot)) });
  });
  W.benches = benches;

  /* ---------- 가로수 ---------- */
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5B4632, roughness: 1 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x5E7A3E, roughness: 1, flatShading: true });
  [[-38, 26], [-14, 27], [10, 26], [34, 27], [-26, -20], [22, -21]].forEach(([x, z]) => {
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 3.4, 7), trunkMat);
    tr.position.set(x, 1.7, z); tr.castShadow = true;
    scene.add(tr);
    for (let i = 0; i < 3; i++) {
      const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3 + Math.random() * 0.6, 0), leafMat);
      blob.position.set(x + (Math.random() - 0.5) * 1.4, 3.7 + i * 0.75, z + (Math.random() - 0.5) * 1.4);
      blob.scale.y = 0.75;
      blob.castShadow = true;
      scene.add(blob);
    }
    W.perches.push({ pos: new THREE.Vector3(x, 6.05, z), hard: 0.5, kind: 'tree', normal: new THREE.Vector3(0, 0, 1) });
  });

  /* ---------- 쓰레기통 / 노점 (실 구역) ---------- */
  const binMat = new THREE.MeshStandardMaterial({ color: 0x4E6B4E, roughness: 0.8, metalness: 0.2 });
  [[-20, 18], [8, 20], [30, 4], [-34, 4]].forEach(([x, z]) => {
    const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.36, 1.0, 12), binMat);
    bin.position.set(x, 0.5, z);
    bin.castShadow = true; bin.receiveShadow = true;
    scene.add(bin);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 6, 16), binMat);
    rim.rotation.x = Math.PI / 2; rim.position.set(x, 1.0, z);
    scene.add(rim);
    W.perches.push({ pos: new THREE.Vector3(x, 1.1, z), hard: 0.4, kind: 'bin', normal: new THREE.Vector3(0, 0, 1) });
    W.stringZones.push({ x, z, r: 3.4 });
  });

  // 노점 천막 두 개 — 실이 제일 많은 곳
  [[-8, 24, 0xB8563F], [20, 22, 0x3F6B8B]].forEach(([x, z, col]) => {
    const stall = new THREE.Group();
    const top = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 2.6),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.85 }));
    top.position.y = 2.3; top.castShadow = true;
    stall.add(top);
    [[-1.7, -1.2], [1.7, -1.2], [-1.7, 1.2], [1.7, 1.2]].forEach(([px, pz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.3, 6), poleMat);
      leg.position.set(px, 1.15, pz);
      stall.add(leg);
    });
    const table = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x8A8378, roughness: 0.9 }));
    table.position.set(0, 0.85, -0.3); table.castShadow = true;
    stall.add(table);
    stall.position.set(x, 0, z);
    scene.add(stall);
    W.platforms.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x, 2.3, z), new THREE.Vector3(3.6, 0.12, 2.6)));
    W.perches.push({ pos: new THREE.Vector3(x, 2.42, z), hard: 0.35, kind: 'stall', normal: new THREE.Vector3(0, 0, 1) });
    W.stringZones.push({ x, z, r: 5.0 });
  });

  /* ---------- 실/머리카락 디테일 (실 구역 표시) ---------- */
  const debrisMat = new THREE.LineBasicMaterial({ color: 0x2A2622, transparent: true, opacity: 0.55 });
  W.stringZones.forEach(zn => {
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * 7, r = Math.random() * zn.r;
      const bx = zn.x + Math.cos(a) * r, bz = zn.z + Math.sin(a) * r;
      const pts = [];
      let cx2 = bx, cz2 = bz;
      for (let s = 0; s < 5; s++) {
        pts.push(new THREE.Vector3(cx2, 0.02, cz2));
        cx2 += (Math.random() - 0.5) * 0.22;
        cz2 += (Math.random() - 0.5) * 0.22;
      }
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), debrisMat);
      scene.add(l);
    }
  });

  /* ---------- 자동차 ---------- */
  const carCols = [0xB8B4AC, 0x2E3A48, 0x8C2F28, 0x3D5B45, 0xE0DCD2, 0x38352F];
  function makeCar(dir) {
    const g = new THREE.Group();
    const col = carCols[(Math.random() * carCols.length) | 0];
    const bodyMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.45, metalness: 0.5, envMap: env, envMapIntensity: 0.7 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.85, 1.85), bodyMat);
    body.position.y = 0.72; body.castShadow = true;
    g.add(body);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.75, 1.65),
      new THREE.MeshStandardMaterial({ color: 0x2A3038, roughness: 0.15, metalness: 0.8, envMap: env, envMapIntensity: 1.2 }));
    cabin.position.set(-0.2, 1.45, 0); cabin.castShadow = true;
    g.add(cabin);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1E1C1A, roughness: 0.95 });
    [[-1.4, 0.95], [1.4, 0.95], [-1.4, -0.95], [1.4, -0.95]].forEach(([px, pz]) => {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.26, 12), tireMat);
      t.rotation.x = Math.PI / 2;
      t.position.set(px, 0.36, pz);
      g.add(t);
    });
    g.rotation.y = dir > 0 ? 0 : Math.PI;
    return g;
  }
  for (let i = 0; i < 7; i++) {
    const dir = i % 2 === 0 ? 1 : -1;
    const car = makeCar(dir);
    const lane = dir > 0 ? ROAD_Z + 3.2 : ROAD_Z - 3.2;
    car.position.set(-100 + Math.random() * 200, 0, lane);
    scene.add(car);
    W.cars.push({ mesh: car, dir, speed: 13 + Math.random() * 9, lane });
  }

  /* ---------- 현수막 배치 ---------- */
  addBanner(scene, W, -19, 1.55, 25.4, Math.PI, 4.4, 0, true);
  addBanner(scene, W, 13, 1.55, 25.4, Math.PI, 4.4, 1, true);
  addBanner(scene, W, -36, 1.55, 16.5, Math.PI + 0.6, 4.4, 2, true);
  addBanner(scene, W, -30, 4.05, -27.58, 0, 6.0, 2, false);
  addBanner(scene, W, 28, 4.05, -26.58, 0, 6.0, 0, false);
  addBanner(scene, W, -38.58, 4.05, 8, Math.PI / 2, 6.0, 1, false);
  addBanner(scene, W, 38.58, 4.05, -4, -Math.PI / 2, 6.0, 2, false);

  /* ---------- 자국 레이어 ---------- */
  W.stainGroup = new THREE.Group();
  scene.add(W.stainGroup);

  return W;
}


/* ---------- 현수막 ---------- */
function drawNoPigeon(ctx, cx, cy, r) {
  ctx.save();
  ctx.fillStyle = '#161616';
  ctx.beginPath(); ctx.ellipse(cx + r * 0.06, cy + r * 0.14, r * 0.40, r * 0.25, -0.12, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx - r * 0.20, cy + r * 0.00, r * 0.17, r * 0.15, 0.5, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(cx - r * 0.31, cy - r * 0.13, r * 0.145, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx - r * 0.43, cy - r * 0.15); ctx.lineTo(cx - r * 0.60, cy - r * 0.07); ctx.lineTo(cx - r * 0.42, cy - r * 0.04); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx + r * 0.38, cy + r * 0.06); ctx.lineTo(cx + r * 0.68, cy - r * 0.10); ctx.lineTo(cx + r * 0.64, cy + r * 0.18); ctx.fill();
  ctx.strokeStyle = '#D6231B'; ctx.lineWidth = r * 0.17; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.86, 0, 7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - r * 0.60, cy - r * 0.60); ctx.lineTo(cx + r * 0.60, cy + r * 0.60); ctx.stroke();
  ctx.restore();
}
const KFONT = '"Noto Sans KR","Malgun Gothic","Apple SD Gothic Neo","Nanum Gothic",sans-serif';
function outlined(ctx, txt, x, y, fill, stroke, w) {
  ctx.lineJoin = 'round';
  ctx.strokeStyle = stroke; ctx.lineWidth = w; ctx.strokeText(txt, x, y);
  ctx.fillStyle = fill; ctx.fillText(txt, x, y);
}
function bannerTexture(kind) {
  const Wd = 1024, Hd = 256;
  const [c, ctx] = makeCanvas(Wd, Hd);
  ctx.textBaseline = 'middle';
  if (kind === 0) {
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, Wd, Hd);
    ctx.strokeStyle = '#2C4DA0'; ctx.lineWidth = 8; ctx.strokeRect(4, 4, Wd - 8, Hd - 8);
    drawNoPigeon(ctx, 112, 128, 92);
    drawNoPigeon(ctx, Wd - 112, 128, 92);
    ctx.textAlign = 'center';
    ctx.font = 'bold 96px ' + KFONT;
    outlined(ctx, '비둘기', 372, 96, '#111111', '#FFFFFF', 10);
    outlined(ctx, '먹이주기 금지', 676, 96, '#D6231B', '#FFFFFF', 10);
    ctx.fillStyle = '#1F3A8A'; ctx.fillRect(228, 168, 568, 62);
    ctx.font = 'bold 30px ' + KFONT;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('과도한 먹이주기는 도시생태계에 위해를 끼칠 수 있습니다', 512, 200);
  } else if (kind === 1) {
    const g = ctx.createLinearGradient(0, 0, Wd, 0);
    g.addColorStop(0, '#DDEBF7'); g.addColorStop(0.5, '#FFFFFF'); g.addColorStop(1, '#D3E6F6');
    ctx.fillStyle = g; ctx.fillRect(0, 0, Wd, Hd);
    ctx.fillStyle = 'rgba(70,140,205,0.35)';
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(60 + i * 30, 140 + i * 18, 320, 40, -0.35, 0, 7); ctx.fill(); }
    ctx.textAlign = 'center';
    ctx.font = 'bold 82px ' + KFONT;
    outlined(ctx, '비둘기 먹이 주기는', 330, 90, '#1F4FB0', '#FFFFFF', 12);
    ctx.font = 'bold 108px ' + KFONT;
    outlined(ctx, '이제 그만 !', 790, 90, '#D6231B', '#FFFFFF', 14);
    ctx.font = 'bold 28px ' + KFONT;
    ctx.fillStyle = '#1B1B1B';
    ctx.fillText('비둘기는 무리를 이뤄 주민에게 혐오감을 주고, 분변, 털 날림 등으로 주거환경이 나빠지고 있습니다.', 512, 186);
    ctx.fillText('비둘기가 스스로 먹이를 찾을 수 있도록 주민 여러분의 많은 협조 부탁드립니다.', 512, 226);
  } else {
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, Wd, Hd);
    ctx.strokeStyle = '#BBBBBB'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, Wd - 4, Hd - 4);
    drawNoPigeon(ctx, Wd - 140, 128, 96);
    ctx.textAlign = 'left';
    ctx.font = 'bold 84px ' + KFONT;
    outlined(ctx, '비둘기', 50, 74, '#111111', '#FFFFFF', 8);
    ctx.font = 'bold 60px ' + KFONT;
    outlined(ctx, '에게', 318, 84, '#111111', '#FFFFFF', 8);
    ctx.font = 'bold 84px ' + KFONT;
    outlined(ctx, '먹이를 주지마세요', 50, 158, '#D6231B', '#FFFFFF', 8);
    ctx.font = 'bold 27px ' + KFONT;
    ctx.fillStyle = '#222222';
    ctx.fillText('비둘기가 스스로 먹이를 찾아 생태계의 당당한 일원이 될 수 있도록 도와주세요', 52, 222);
  }
  const t = new THREE.CanvasTexture(c);
  t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 8;
  return t;
}
const BANNER_TEX = {};
function addBanner(scene, W, x, y, z, rotY, width, kind, poles) {
  if (!BANNER_TEX[kind]) BANNER_TEX[kind] = bannerTexture(kind);
  const h = width / 4;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, h, 8, 1),
    new THREE.MeshStandardMaterial({ map: BANNER_TEX[kind], roughness: 0.9, side: THREE.DoubleSide })
  );
  // 살짝 늘어진 천 느낌
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i) / (width / 2);
    pos.setZ(i, Math.sin(px * Math.PI) * 0.04 - (1 - px * px) * 0.02);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
  mesh.position.set(x, y, z);
  mesh.rotation.y = rotY;
  mesh.castShadow = true; mesh.receiveShadow = true;
  scene.add(mesh);
  const right = new THREE.Vector3(Math.cos(rotY), 0, -Math.sin(rotY));
  if (poles) {
    const pm = new THREE.MeshStandardMaterial({ color: 0x777369, roughness: 0.6, metalness: 0.5 });
    [-1, 1].forEach(s => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, y + h / 2 + 0.15, 8), pm);
      pole.position.set(x + right.x * s * (width / 2 + 0.06), (y + h / 2 + 0.15) / 2, z + right.z * s * (width / 2 + 0.06));
      pole.castShadow = true;
      scene.add(pole);
    });
  }
  const n = new THREE.Vector3(Math.sin(rotY), 0, Math.cos(rotY));
  W.perches.push({ pos: new THREE.Vector3(x, y + h / 2 + 0.03, z), hard: 0.62, kind: 'banner', normal: n });
}

/* ---------- 자국 만들기 ---------- */
function stainTexture(kind) {
  const S = 128;
  const [c, ctx] = makeCanvas(S, S);
  ctx.clearRect(0, 0, S, S);
  if (kind === 'flat') {
    // 아스팔트에 눌어붙은 것
    ctx.fillStyle = 'rgba(58,38,32,0.86)';
    ctx.beginPath();
    ctx.moveTo(64, 20);
    for (let a = 0; a < 7; a += 0.35) {
      const r = 26 + Math.sin(a * 3.1) * 9 + Math.random() * 7;
      ctx.lineTo(64 + Math.cos(a) * r * 1.35, 64 + Math.sin(a) * r * 0.85);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(30,20,18,0.75)';
    ctx.beginPath(); ctx.ellipse(64, 64, 22, 13, 0.3, 0, 7); ctx.fill();
    // 삐져나온 깃털
    ctx.strokeStyle = 'rgba(120,124,132,0.8)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * 7;
      ctx.beginPath();
      ctx.moveTo(64 + Math.cos(a) * 26, 64 + Math.sin(a) * 17);
      ctx.lineTo(64 + Math.cos(a) * (40 + Math.random() * 14), 64 + Math.sin(a) * (26 + Math.random() * 9));
      ctx.stroke();
    }
  } else {
    // 깃털 무더기
    ctx.fillStyle = 'rgba(90,86,80,0.35)';
    ctx.beginPath(); ctx.ellipse(64, 64, 26, 20, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(128,132,140,0.85)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 24; i++) {
      const a = Math.random() * 7, r = Math.random() * 24;
      const x = 64 + Math.cos(a) * r, y = 64 + Math.sin(a) * r * 0.8;
      const a2 = Math.random() * 7;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a2) * 9, y + Math.sin(a2) * 9);
      ctx.stroke();
    }
  }
  return new THREE.CanvasTexture(c);
}

const STAIN_TEX = {};
function addStain(W, x, z, kind, age) {
  if (!STAIN_TEX[kind]) { STAIN_TEX[kind] = stainTexture(kind); STAIN_TEX[kind].encoding = THREE.sRGBEncoding; }
  const size = kind === 'flat' ? 1.5 : 1.1;
  const fade = Math.max(0.12, 1 - age * 0.16);
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({
      map: STAIN_TEX[kind], transparent: true, opacity: fade,
      depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4
    })
  );
  m.rotation.x = -Math.PI / 2;
  m.rotation.z = Math.random() * 7;
  m.position.set(x, 0.028, z);
  W.stainGroup.add(m);
  return m;
}

/* ============================================================
   PIGEON MODEL
   ============================================================ */

function texCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

/* 날개 텍스처: u = 날개 안→밖, v = 앞→뒤 */
let WING_TEX = null;
function wingTexture() {
  if (WING_TEX) return WING_TEX;
  const [c, ctx] = texCanvas(256, 128);
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0.00, '#8A929C');
  g.addColorStop(0.45, '#7C858F');
  g.addColorStop(0.72, '#69727C');
  g.addColorStop(1.00, '#383E47');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 128);

  // 앞가장자리 밝게
  const le = ctx.createLinearGradient(0, 0, 0, 128);
  le.addColorStop(0, 'rgba(168,176,186,0.55)');
  le.addColorStop(0.35, 'rgba(168,176,186,0)');
  ctx.fillStyle = le; ctx.fillRect(0, 0, 256, 128);

  // 집비둘기 특유의 검은 띠 두 줄
  ctx.fillStyle = 'rgba(34,38,44,0.94)';
  ctx.fillRect(34, 60, 148, 16);
  ctx.fillRect(30, 92, 142, 16);

  // 첫째날개깃 갈라짐
  ctx.strokeStyle = 'rgba(30,34,40,0.5)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const x = 150 + i * 13;
    ctx.beginPath(); ctx.moveTo(x, 6); ctx.lineTo(x - 16, 124); ctx.stroke();
  }
  // 둘째날개깃 결
  ctx.strokeStyle = 'rgba(60,66,74,0.35)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 12; i++) {
    const x = 14 + i * 11;
    ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x - 5, 126); ctx.stroke();
  }
  // 뒤쪽 어둡게
  const te = ctx.createLinearGradient(0, 128, 0, 84);
  te.addColorStop(0, 'rgba(40,45,52,0.5)');
  te.addColorStop(1, 'rgba(40,45,52,0)');
  ctx.fillStyle = te; ctx.fillRect(0, 0, 256, 128);

  WING_TEX = new THREE.CanvasTexture(c);
  WING_TEX.encoding = THREE.sRGBEncoding;
  return WING_TEX;
}

let TAIL_TEX = null;
function tailTexture() {
  if (TAIL_TEX) return TAIL_TEX;
  const [c, ctx] = texCanvas(128, 128);
  const g = ctx.createLinearGradient(0, 0, 0, 128);
  g.addColorStop(0, '#7C858F');
  g.addColorStop(0.42, '#6A727C');
  g.addColorStop(0.62, '#2B3037');
  g.addColorStop(1, '#1D2228');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = 'rgba(46,52,60,0.45)';
  ctx.lineWidth = 1.6;
  for (let i = 1; i < 7; i++) {
    const x = i * 128 / 7;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 128); ctx.stroke();
  }
  TAIL_TEX = new THREE.CanvasTexture(c);
  TAIL_TEX.encoding = THREE.sRGBEncoding;
  return TAIL_TEX;
}

const IRIDESCENT = () => new THREE.ShaderMaterial({
  uniforms: {
    base: { value: new THREE.Color(0x6E7885) },
    ca:   { value: new THREE.Color(0x1F8F5C) },
    cb:   { value: new THREE.Color(0x8046A8) },
    lightDir: { value: new THREE.Vector3(0.55, 0.72, 0.42) }
  },
  vertexShader: `
    varying vec3 vN; varying vec3 vV;
    void main(){
      vec4 wp = modelMatrix * vec4(position,1.0);
      vN = normalize(mat3(modelMatrix) * normal);
      vV = normalize(cameraPosition - wp.xyz);
      gl_Position = projectionMatrix * viewMatrix * wp;
    }`,
  fragmentShader: `
    varying vec3 vN; varying vec3 vV;
    uniform vec3 base; uniform vec3 ca; uniform vec3 cb; uniform vec3 lightDir;
    void main(){
      vec3 N = normalize(vN);
      float ndv = clamp(abs(dot(N, normalize(vV))), 0.0, 1.0);
      float fres = pow(1.0 - ndv, 2.1);
      float band = 0.5 + 0.5*sin(ndv*8.0 + dot(N, normalize(lightDir))*3.0);
      vec3 irid = mix(ca, cb, band);
      float lam = clamp(dot(N, normalize(lightDir)),0.0,1.0)*0.55 + 0.62;
      vec3 col = base*lam;
      col = mix(col, irid*(0.55+0.45*lam), clamp(fres*1.25, 0.0, 0.88));
      gl_FragColor = vec4(col, 1.0);
    }`
});

const M = {
  body:  () => new THREE.MeshStandardMaterial({ color: 0x6B747F, roughness: 0.88 }),
  belly: () => new THREE.MeshStandardMaterial({ color: 0x79828D, roughness: 0.9 }),
  rump:  () => new THREE.MeshStandardMaterial({ color: 0x8B939D, roughness: 0.88 }),
  wing:  () => new THREE.MeshStandardMaterial({ map: wingTexture(), roughness: 0.84, side: THREE.DoubleSide }),
  tail:  () => new THREE.MeshStandardMaterial({ map: tailTexture(), roughness: 0.84, side: THREE.DoubleSide }),
  beak:  () => new THREE.MeshStandardMaterial({ color: 0x33333A, roughness: 0.5 }),
  cere:  () => new THREE.MeshStandardMaterial({ color: 0xE6E2DA, roughness: 0.95 }),
  eye:   () => new THREE.MeshStandardMaterial({ color: 0x121010, roughness: 0.2 }),
  iris:  () => new THREE.MeshStandardMaterial({ color: 0xD4501F, roughness: 0.35, emissive: 0x40140A, emissiveIntensity: 0.45 }),
  foot:  () => new THREE.MeshStandardMaterial({ color: 0xB44E44, roughness: 0.72 }),
  claw:  () => new THREE.MeshStandardMaterial({ color: 0x2B2724, roughness: 0.6 })
};

/* 날개 — XZ 평면에 직접 구성 (x=날개 폭, z=앞뒤, y=캠버) */
const WING_SPAN = 0.340;
const WING_T    = [0.00, 0.14, 0.32, 0.52, 0.72, 0.88, 1.00];
const WING_LEAD = [0.046, 0.068, 0.066, 0.050, 0.030, 0.010, -0.014];
const WING_TRAIL= [-0.082, -0.104, -0.106, -0.092, -0.068, -0.040, -0.022];
const WING_CAMB = [0.000, 0.006, 0.006, 0.001, -0.006, -0.013, -0.020];

function wingGeometry(side) {
  const n = WING_T.length;
  const pos = [], uvs = [], idx = [];
  for (let i = 0; i < n; i++) {
    const x = WING_T[i] * WING_SPAN * side;
    const y = WING_CAMB[i];
    pos.push(x, y + 0.004, WING_LEAD[i]);   uvs.push(WING_T[i], 0);
    pos.push(x, y, WING_TRAIL[i]);          uvs.push(WING_T[i], 1);
  }
  for (let i = 0; i < n - 1; i++) {
    const a = i * 2, b = i * 2 + 1, c = (i + 1) * 2, d = (i + 1) * 2 + 1;
    if (side > 0) { idx.push(a, b, d, a, d, c); }
    else          { idx.push(a, d, b, a, c, d); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}


/* 접힌 날개 — 옆구리에 붙는 별도 패널 (같은 텍스처 재사용: 앞쪽에 검은 띠, 뒤쪽이 어두움) */
const FOLD_UP = [
  [0.018,  0.062,  0.078],
  [0.036,  0.060,  0.020],
  [0.044,  0.050, -0.052],
  [0.040,  0.030, -0.124],
  [0.028,  0.012, -0.190]
];
const FOLD_LO = [
  [0.030, -0.010,  0.060],
  [0.056, -0.026,  0.008],
  [0.062, -0.038, -0.058],
  [0.053, -0.040, -0.122],
  [0.035, -0.030, -0.180]
];
function foldedWingMesh(side) {
  const n = FOLD_UP.length, pos = [], uvs = [], idx = [];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    const a = FOLD_UP[i], b = FOLD_LO[i];
    pos.push(a[0] * side, a[1], a[2]); uvs.push(u, 0.30);
    pos.push(b[0] * side, b[1], b[2]); uvs.push(u, 1.00);
  }
  for (let i = 0; i < n - 1; i++) {
    const a = i * 2, b = i * 2 + 1, c = (i + 1) * 2, d = (i + 1) * 2 + 1;
    if (side > 0) idx.push(a, b, d, a, d, c);
    else          idx.push(a, d, b, a, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, M.wing());
  m.castShadow = true;
  return m;
}

function buildWing(side) {
  const shoulder = new THREE.Group();
  const upperArm = new THREE.Group();
  shoulder.add(upperArm);

  const inner = new THREE.Group();
  const wingMesh = new THREE.Mesh(wingGeometry(side), M.wing());
  wingMesh.castShadow = true;
  inner.add(wingMesh);

  // 끝 첫째날개깃 (실루엣)
  const primMat = new THREE.MeshStandardMaterial({ color: 0x3E444C, roughness: 0.84, side: THREE.DoubleSide });
  const prim = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const t = i / 3;
    const len = 0.090 - t * 0.020;
    const geo = new THREE.PlaneGeometry(0.024, len);
    const f = new THREE.Mesh(geo, primMat);
    f.rotation.x = Math.PI / 2;
    f.rotation.y = side * (0.30 + t * 0.34);
    f.position.set(side * (WING_SPAN * (0.92 - t * 0.06)), -0.018 - t * 0.005, -0.036 - len * 0.44);
    f.castShadow = true;
    prim.add(f);
  }
  inner.add(prim);

  upperArm.add(inner);
  return { shoulder, upperArm, foreArm: inner, prim, side };
}

/* 꼬리 — XZ 평면 */
function buildTail() {
  const pos = [], uvs = [], idx = [];
  const rows = [
    { z: 0.010, hw: 0.032 },
    { z: -0.052, hw: 0.049 },
    { z: -0.104, hw: 0.058 },
    { z: -0.142, hw: 0.060 }
  ];
  rows.forEach((r, i) => {
    const v = i / (rows.length - 1);
    pos.push(-r.hw, -v * 0.006, r.z); uvs.push(0, v);
    pos.push( r.hw, -v * 0.006, r.z); uvs.push(1, v);
  });
  for (let i = 0; i < rows.length - 1; i++) {
    const a = i * 2, b = i * 2 + 1, c = (i + 1) * 2, d = (i + 1) * 2 + 1;
    idx.push(a, c, d, a, d, b);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, M.tail());
  m.castShadow = true;
  return m;
}

function buildFoot() {
  const g = new THREE.Group();
  const tarsus = new THREE.Mesh(new THREE.CylinderGeometry(0.0090, 0.0115, 0.070, 6), M.foot());
  tarsus.position.y = 0.035;
  g.add(tarsus);
  const toes = [];
  const dirs = [[-0.62, 0.86], [0, 1.0], [0.62, 0.86], [0, -0.8]];
  dirs.forEach(([dx, dz], i) => {
    const toe = new THREE.Group();
    const len = i === 3 ? 0.030 : 0.044;
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.0062, 0.0046, len, 5), M.foot());
    seg.rotation.x = Math.PI / 2;
    seg.rotation.z = -dx * 0.5;
    seg.position.set(dx * len * 0.5, 0, dz * len * 0.5);
    toe.add(seg);
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.0046, 0.014, 5), M.claw());
    claw.rotation.x = dz > 0 ? Math.PI / 2.2 : -Math.PI / 2.2;
    claw.position.set(dx * len * 0.95, -0.003, dz * len * 0.95);
    toe.add(claw);
    g.add(toe);
    toes.push(toe);
  });
  return { group: g, toes };
}

function buildPigeon() {
  const root = new THREE.Group();
  const tilt = new THREE.Group();
  root.add(tilt);

  // 몸통 — 물방울형
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 22, 16), M.body());
  body.scale.set(0.112, 0.122, 0.255);
  body.position.set(0, 0, -0.015);
  body.castShadow = true;
  tilt.add(body);

  // 가슴 (앞으로 볼록)
  const breast = new THREE.Mesh(new THREE.SphereGeometry(0.5, 18, 14), M.belly());
  breast.scale.set(0.106, 0.112, 0.135);
  breast.position.set(0, -0.012, 0.070);
  breast.castShadow = true;
  tilt.add(breast);

  // 배
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 12), M.belly());
  belly.scale.set(0.098, 0.082, 0.200);
  belly.position.set(0, -0.030, -0.005);
  tilt.add(belly);

  // 허리 (밝은 회색)
  const rump = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 12), M.rump());
  rump.scale.set(0.086, 0.080, 0.110);
  rump.position.set(0, 0.005, -0.115);
  tilt.add(rump);

  // 목 — 무지개
  const neckMat = IRIDESCENT();
  const neck = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 16), neckMat);
  neck.scale.set(0.080, 0.098, 0.086);
  neck.position.set(0, 0.058, 0.098);
  neck.castShadow = true;
  tilt.add(neck);

  const neck2 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 18, 14), neckMat);
  neck2.scale.set(0.066, 0.074, 0.070);
  neck2.position.set(0, 0.098, 0.108);
  tilt.add(neck2);

  // 머리
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 0.126, 0.108);
  tilt.add(headPivot);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 16), M.body());
  head.scale.set(0.062, 0.060, 0.072);
  head.position.set(0, 0.010, 0.010);
  head.castShadow = true;
  headPivot.add(head);

  // 이마 (약간 도톰)
  const crown = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 12), M.body());
  crown.scale.set(0.052, 0.040, 0.048);
  crown.position.set(0, 0.024, -0.002);
  headPivot.add(crown);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.0105, 0.046, 8), M.beak());
  beak.rotation.x = Math.PI / 2 + 0.16;
  beak.position.set(0, 0.004, 0.060);
  headPivot.add(beak);

  const cere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), M.cere());
  cere.scale.set(0.021, 0.014, 0.015);
  cere.position.set(0, 0.021, 0.043);
  headPivot.add(cere);

  [-1, 1].forEach(s => {
    const ir = new THREE.Mesh(new THREE.SphereGeometry(0.0092, 12, 10), M.iris());
    ir.position.set(s * 0.026, 0.014, 0.021);
    headPivot.add(ir);
    const pu = new THREE.Mesh(new THREE.SphereGeometry(0.0044, 8, 6), M.eye());
    pu.position.set(s * 0.031, 0.014, 0.023);
    headPivot.add(pu);
  });

  // 꼬리
  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 0.010, -0.150);
  tilt.add(tailPivot);
  tailPivot.add(buildTail());

  // 날개
  const wingL = buildWing(-1), wingR = buildWing(1);
  wingL.shoulder.position.set(-0.030, 0.040, 0.006);
  wingR.shoulder.position.set(0.030, 0.040, 0.006);
  tilt.add(wingL.shoulder); tilt.add(wingR.shoulder);

  // 다리
  const footL = buildFoot(), footR = buildFoot();
  footL.group.position.set(-0.031, -0.104, 0.010);
  footR.group.position.set(0.031, -0.104, 0.010);
  tilt.add(footL.group); tilt.add(footR.group);

  const foldedL = foldedWingMesh(-1), foldedR = foldedWingMesh(1);
  tilt.add(foldedL); tilt.add(foldedR);

  // 어깨덮깃 — 날개 뿌리와 몸통을 이어줌
  [-1, 1].forEach(sd => {
    const cov = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), M.body());
    cov.scale.set(0.062, 0.048, 0.130);
    cov.position.set(sd * 0.038, 0.032, 0.004);
    cov.castShadow = true;
    tilt.add(cov);
  });

  const badgeAnchor = new THREE.Group();
  badgeAnchor.position.set(0, 0.050, -0.072);
  tilt.add(badgeAnchor);

  return {
    root, tilt, body, headPivot, tailPivot, neckMat, neck, neck2,
    wingL, wingR, foldedL, foldedR, feet: [footL, footR], badgeAnchor,
    allToes: [...footL.toes, ...footR.toes]
  };
}

/* ---------- 메달 (리본 + 원판 + 엠블럼) ---------- */
const BADGE_SPEC = [
  { color: '#B8703F', dark: '#5E3316', light: '#E4AC78', ribbon: ['#1F3A6E', '#C8322B', '#1F3A6E'] },
  { color: '#C9CED4', dark: '#68707A', light: '#F2F4F6', ribbon: ['#1F3A6E', '#F4F4F4', '#1F3A6E'] },
  { color: '#E2B637', dark: '#7A5A0E', light: '#FBE48E', ribbon: ['#C8322B', '#E2B637', '#C8322B'] }
];
function medalFaceTexture(i) {
  const sp = BADGE_SPEC[i];
  const [c, ctx] = texCanvas(128, 128);
  const g = ctx.createRadialGradient(46, 40, 4, 64, 64, 66);
  g.addColorStop(0, sp.light); g.addColorStop(0.55, sp.color); g.addColorStop(1, sp.dark);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(64, 64, 63, 0, 7); ctx.fill();
  ctx.strokeStyle = sp.dark; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(64, 64, 53, 0, 7); ctx.stroke();
  ctx.fillStyle = sp.dark;
  if (i < 2) {
    if (typeof drawNoPigeon === 'function') drawNoPigeon(ctx, 64, 64, 42);
  } else {
    // 사람 픽토그램 — 명예 인간
    ctx.beginPath(); ctx.arc(64, 33, 11, 0, 7); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(52, 48); ctx.lineTo(76, 48); ctx.lineTo(80, 80); ctx.lineTo(70, 80); ctx.lineTo(70, 104);
    ctx.lineTo(58, 104); ctx.lineTo(58, 80); ctx.lineTo(48, 80); ctx.closePath(); ctx.fill();
    ctx.fillRect(40, 50, 9, 28); ctx.fillRect(79, 50, 9, 28);
  }
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
}
function ribbonTexture(i) {
  const sp = BADGE_SPEC[i];
  const [c, ctx] = texCanvas(48, 48);
  const w = [16, 16, 16];
  let x = 0;
  sp.ribbon.forEach((col, k) => { ctx.fillStyle = col; ctx.fillRect(x, 0, w[k], 48); x += w[k]; });
  // 천 결
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  for (let y = 0; y < 48; y += 3) ctx.fillRect(0, y, 48, 1);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
}
const MEDAL_TEX = {};
function addBadge(bird, index) {
  const i = Math.min(index, 2), sp = BADGE_SPEC[i];
  if (!MEDAL_TEX[i]) MEDAL_TEX[i] = { face: medalFaceTexture(i), ribbon: ribbonTexture(i) };
  const g = new THREE.Group();

  // 리본 (오각형, 등 위에 납작하게)
  const shp = new THREE.Shape();
  shp.moveTo(-0.012, 0.020); shp.lineTo(0.012, 0.020); shp.lineTo(0.012, 0.005);
  shp.lineTo(0, -0.004); shp.lineTo(-0.012, 0.005); shp.lineTo(-0.012, 0.020);
  const rg = new THREE.ShapeGeometry(shp);
  rg.computeBoundingBox();
  const bb = rg.boundingBox, pos = rg.attributes.position, uv = rg.attributes.uv;
  for (let k = 0; k < pos.count; k++) uv.setXY(k, (pos.getX(k) - bb.min.x) / (bb.max.x - bb.min.x), (pos.getY(k) - bb.min.y) / (bb.max.y - bb.min.y));
  uv.needsUpdate = true;
  const ribbon = new THREE.Mesh(rg, new THREE.MeshStandardMaterial({ map: MEDAL_TEX[i].ribbon, roughness: 0.92, side: THREE.DoubleSide }));
  ribbon.rotation.x = Math.PI / 2;
  ribbon.position.set(0, 0.0026, 0.010);
  ribbon.castShadow = true;
  g.add(ribbon);

  const metal = new THREE.MeshStandardMaterial({ color: sp.color, roughness: 0.28, metalness: 0.92 });
  const metalDark = new THREE.MeshStandardMaterial({ color: sp.dark, roughness: 0.34, metalness: 0.9 });
  const faceMat = new THREE.MeshStandardMaterial({ map: MEDAL_TEX[i].face, roughness: 0.3, metalness: 0.75 });

  // 고리
  const link = new THREE.Mesh(new THREE.TorusGeometry(0.0034, 0.0011, 6, 14), metalDark);
  link.rotation.x = Math.PI / 2; link.position.set(0, 0.0022, -0.0045);
  g.add(link);

  // 원판
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.0145, 0.0145, 0.0038, 30), [metal, faceMat, metal]);
  disc.position.set(0, 0.0022, -0.021); disc.castShadow = true;
  g.add(disc);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.0145, 0.0019, 6, 30), metalDark);
  rim.rotation.x = Math.PI / 2; rim.position.copy(disc.position);
  g.add(rim);

  // 등 곡률에 맞춰 배치 (왼쪽부터 동·은·금)
  const slots = [[-0.030, -0.003, 0.66], [0, 0.009, 0], [0.030, -0.003, -0.66]];
  const [sx, sy, rz] = slots[i];
  g.position.set(sx, sy, 0);
  g.rotation.z = rz;
  g.rotation.x = -0.12;
  bird.badgeAnchor.add(g);
  return g;
}

/* ============================================================
   비행 물리
   ============================================================ */
const PECK_DUR = 0.34;
const FLY = {
  gravity: 9.0,
  flapUp: 3.0,
  flapFwd: 1.7,
  flapCooldown: 0.27,
  liftCoef: 0.070,
  maxLift: 14.0,
  drag: 0.34,
  align: 3.4,
  yawRate: 2.2,
  pitchRate: 1.7,
  maxPitch: 0.95,
  walkSpeed: 1.5,
  takeoffUp: 4.2
};

function buildPigeonLaser() {
  const gun = new THREE.Group();
  const casing = new THREE.MeshStandardMaterial({ color: 0x30343C, roughness: 0.42, metalness: 0.62 });
  const trim = new THREE.MeshStandardMaterial({ color: 0xA6D9E8, emissive: 0x1E7993, emissiveIntensity: 1.2, metalness: 0.35 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.034, 0.115), casing);
  body.position.z = 0.005; gun.add(body);
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.052, 0.035), casing);
  grip.position.set(0, -0.038, -0.027); grip.rotation.x = -0.18; gun.add(grip);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.021, 0.048, 10), trim);
  barrel.rotation.x = Math.PI / 2; barrel.position.z = 0.078; gun.add(barrel);
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), new THREE.MeshBasicMaterial({ color: 0xFF4B70 }));
  muzzle.position.z = 0.105; gun.add(muzzle);
  gun.position.set(0.098, -0.018, 0.018);
  return gun;
}

class Pigeon {
  constructor(scene) {
    this.model = buildPigeon();
    this.model.laserGun = buildPigeonLaser();
    this.model.tilt.add(this.model.laserGun);
    scene.add(this.model.root);
    this.pos = new THREE.Vector3(0, 16, 14);
    this.vel = new THREE.Vector3(0, 0, -7);
    this.yaw = Math.PI;
    this.pitch = -0.18;
    this.roll = 0;
    this.mode = 'fly';
    this.flapT = 0;
    this.flapPhase = 0;
    this.walkPhase = 0;
    this.perch = null;
    this.stunT = 0;
    this.toesLost = 0;
    this.slipT = 0;
    this.fold = 1;
    this.flapHeld = false;
    this.peckT = 0;
    this.peckTarget = null;
    this.cooT = 0;
    this.landCooldown = 0;
    this.flapHeld = false;  // 버튼 누르고 있는 동안 계속 날갯짓
    this.peckT = 0;         // 쪼기 애니메이션
    this.peckDur = 0.34;
  }

  forward() {
    const cp = Math.cos(this.pitch);
    return new THREE.Vector3(Math.sin(this.yaw) * cp, Math.sin(this.pitch), Math.cos(this.yaw) * cp);
  }

  flap() {
    if (this.mode === 'stun') return false;
    if (this.flapT > 0) return false;
    if (this.mode === 'walk' || this.mode === 'perch') {
      this.mode = 'fly';
      this.perch = null;
      this.vel.set(Math.sin(this.yaw) * 2.2, FLY.takeoffUp, Math.cos(this.yaw) * 2.2);
      this.pitch = 0.35;
      this.flapT = FLY.flapCooldown;
      this.flapPhase = 0;
      if (typeof SFX !== 'undefined') SFX.flap();
      return true;
    }
    const f = this.forward();
    this.vel.y += FLY.flapUp;
    this.vel.addScaledVector(f, FLY.flapFwd);
    this.flapT = FLY.flapCooldown;
    this.flapPhase = 0;
    if (typeof SFX !== 'undefined') SFX.flap();
    return true;
  }

  update(dt, input) {
    if (this.flapT > 0) this.flapT -= dt;
    if (this.peckT > 0) this.peckT -= dt;
    if (this.cooT > 0) this.cooT -= dt;
    if (this.landCooldown > 0) this.landCooldown -= dt;
    if (this.flapHeld && this.flapT <= 0 && (this.mode === 'fly' || this.mode === 'walk' || this.mode === 'perch')) this.flap();
    if (this.peckT > 0) this.peckT -= dt;
    if (this.cooT > 0) this.cooT -= dt;
    if (this.landCooldown > 0) this.landCooldown -= dt;
    if (this.flapHeld && this.mode === 'fly' && this.flapT <= 0) this.flap();

    if (this.mode === 'stun') {
      this.stunT -= dt;
      this.vel.y -= FLY.gravity * dt;
      const prevS = this.pos.clone();
      this.pos.addScaledVector(this.vel, dt);
      if (typeof collideSolids === 'function') collideSolids(prevS, this.pos, this.vel);
      this.roll += dt * 5;
      const ghs = groundHeightAt(this.pos.x, this.pos.z, this.pos.y);
      if (this.pos.y <= ghs + 0.115) {
        this.pos.y = ghs + 0.115;
        this.vel.set(0, 0, 0);
        if (this.stunT <= 0) { this.mode = 'walk'; this.roll = 0; }
      }
      this.applyTransform(dt);
      return;
    }

    if (this.mode === 'walk' || this.mode === 'perch') {
      this.updateGround(dt, input);
      this.applyTransform(dt);
      return;
    }

    this.yaw -= input.x * FLY.yawRate * dt;
    this.pitch += -input.y * FLY.pitchRate * dt;
    this.pitch = Math.max(-FLY.maxPitch, Math.min(FLY.maxPitch, this.pitch));
    this.pitch += (-0.05 - this.pitch) * 0.35 * dt;

    const targetRoll = -input.x * 0.85;
    this.roll += (targetRoll - this.roll) * Math.min(1, dt * 5.5);

    const f = this.forward();
    const speed = this.vel.length();

    const up = new THREE.Vector3(0, 1, 0).addScaledVector(f, -f.y).normalize();
    let lift = Math.min(FLY.maxLift, speed * speed * FLY.liftCoef);
    lift *= 1 - Math.abs(this.roll) * 0.22;
    this.vel.addScaledVector(up, lift * dt);

    this.vel.y -= FLY.gravity * dt;
    this.vel.multiplyScalar(Math.exp(-FLY.drag * dt * (1 + Math.abs(this.pitch) * 0.4)));

    const aligned = f.clone().multiplyScalar(this.vel.length());
    this.vel.lerp(aligned, Math.min(1, FLY.align * dt));

    const prev = this.pos.clone();
    this.pos.addScaledVector(this.vel, dt);
    if (typeof collideSolids === 'function') collideSolids(prev, this.pos, this.vel);

    const LIM = 108;
    if (Math.abs(this.pos.x) > LIM) { this.pos.x = Math.sign(this.pos.x) * LIM; this.vel.x *= -0.3; }
    if (Math.abs(this.pos.z) > LIM) { this.pos.z = Math.sign(this.pos.z) * LIM; this.vel.z *= -0.3; }
    if (this.pos.y > 62) { this.pos.y = 62; this.vel.y = Math.min(0, this.vel.y); }

    this.applyTransform(dt);
  }

  updateGround(dt, input) {
    if (this.peckT > 0) return;
    const fwd = -input.y;
    this.yaw -= input.x * 2.4 * dt;
    if (this.mode === 'perch') {
      // 횃대 위에서는 제자리. 스틱을 어느 쪽이든 세게 밀면 그쪽으로 뛰어내림
      const mag = Math.hypot(input.x, input.y);
      if (mag > 0.55) {
        this.yaw -= Math.atan2(input.x, -input.y);
        this.mode = 'fly'; this.perch = null;
        this.vel.set(Math.sin(this.yaw) * 1.8, -0.3, Math.cos(this.yaw) * 1.8);
        this.pitch = -0.25;
        if (typeof SFX !== 'undefined') SFX.flap();
      }
      this.roll += (0 - this.roll) * Math.min(1, dt * 6);
      this.pitch += (0 - this.pitch) * Math.min(1, dt * 6);
      return;
    }
    const spd = FLY.walkSpeed * (1 - this.toesLost * 0.05);
    if (Math.abs(fwd) > 0.05) {
      const prev = this.pos.clone();
      this.pos.x += Math.sin(this.yaw) * fwd * spd * dt;
      this.pos.z += Math.cos(this.yaw) * fwd * spd * dt;
      this.walkPhase += dt * 7.5 * Math.abs(fwd);
      if (this.mode === 'walk' && typeof collideSolids === 'function') {
        const v0 = new THREE.Vector3(); collideSolids(prev, this.pos, v0);
        // 지붕 가장자리에서 떨어짐
        const gh = groundHeightAt(this.pos.x, this.pos.z, this.pos.y);
        if (this.pos.y > gh + 0.5) {
          this.mode = 'fly'; this.vel.set(Math.sin(this.yaw) * 1.2, -0.5, Math.cos(this.yaw) * 1.2); this.pitch = -0.3;
          return;
        }
      }
    }
    this.roll += (0 - this.roll) * Math.min(1, dt * 6);
    this.pitch += (0 - this.pitch) * Math.min(1, dt * 6);
    if (this.mode === 'walk') this.pos.y = groundHeightAt(this.pos.x, this.pos.z, this.pos.y) + 0.115;
  }

  applyTransform(dt) {
    const m = this.model;
    m.root.position.copy(this.pos);
    m.root.rotation.y = this.yaw;
    m.tilt.rotation.x = -this.pitch;
    m.tilt.rotation.z = this.roll;

    const flying = this.mode === 'fly' || this.mode === 'stun' || this.slipT > 0;
    this.fold += ((flying ? 0 : 1) - this.fold) * Math.min(1, dt * 9);

    let flapAngle = 0, twist = 0;
    if (this.mode === 'fly') {
      const glide = this.flapT <= 0;
      this.flapPhase += dt * (glide ? 3.0 : 13.5);
      if (glide) {
        flapAngle = 0.10 + Math.sin(this.flapPhase * 1.1) * 0.055;
        twist = -0.10;
      } else {
        flapAngle = Math.sin(this.flapPhase * 2.9 - 1.2) * 1.05 + 0.15;
        twist = Math.sin(this.flapPhase * 2.9 - 1.9) * 0.42;
      }
    } else if (this.mode === 'stun' || this.slipT > 0) {
      this.slipT = Math.max(0, this.slipT - dt);
      this.flapPhase += dt * 22;
      flapAngle = Math.sin(this.flapPhase * 3) * 0.95;
      twist = 0.25;
    } else {
      flapAngle = -0.02;
    }

    // 접힘: 뒤로 쓸고, 몸통 옆면에 붙이고, 손목이 접히므로 길이가 줄어듦
    const f = this.fold;
    const sweep = f * 1.30;
    const spanScale = 1 - f * 0.46;
    const chordScale = 1 - f * 0.30;

    m.wingR.upperArm.rotation.z = flapAngle * (1 - f) - f * 0.10;
    m.wingL.upperArm.rotation.z = -(flapAngle * (1 - f) - f * 0.10);
    m.wingR.upperArm.rotation.x = twist * (1 - f);
    m.wingL.upperArm.rotation.x = twist * (1 - f);
    m.wingR.upperArm.position.set(0.030 - f * 0.006, 0.040 + f * 0.008, 0.006 - f * 0.026);
    m.wingL.upperArm.position.set(-0.030 + f * 0.006, 0.040 + f * 0.008, 0.006 - f * 0.026);
    m.wingR.foreArm.rotation.y = sweep;
    m.wingL.foreArm.rotation.y = -sweep;
    m.wingR.foreArm.rotation.z = 0;
    m.wingL.foreArm.rotation.z = 0;
    m.wingR.foreArm.scale.set(spanScale, 1, chordScale);
    m.wingL.foreArm.scale.set(spanScale, 1, chordScale);
    const spread = f < 0.55;
    m.wingR.shoulder.visible = spread;
    m.wingL.shoulder.visible = spread;
    m.foldedR.visible = !spread;
    m.foldedL.visible = !spread;

    // 꼬리
    if (this.mode === 'fly') {
      m.tailPivot.rotation.x = -this.pitch * 0.30 + 0.06;
      m.tailPivot.scale.x = 1.0;
    } else {
      m.tailPivot.rotation.x = -0.10;
      m.tailPivot.scale.x = 0.72;
    }

    // 머리 까딱 / 다리
    if (this.mode === 'walk' || this.mode === 'perch') {
      const p = this.walkPhase % (Math.PI * 2);
      const thrust = p < Math.PI * 0.32 ? (p / (Math.PI * 0.32)) : 1 - ((p - Math.PI * 0.32) / (Math.PI * 1.68));
      m.headPivot.position.z = 0.108 + thrust * 0.050;
      m.headPivot.position.y = 0.126 + thrust * 0.006;
      m.headPivot.rotation.x = -thrust * 0.12;
      if (this.peckT > 0) {
        const k = Math.sin(Math.PI * (1 - this.peckT / this.peckDur));   // 0→1→0
        m.headPivot.rotation.x = -1.30 * k;
        m.headPivot.position.y = 0.126 - 0.085 * k;
        m.headPivot.position.z = 0.108 + 0.070 * k;
        m.tilt.rotation.x = 0.28 * k;      // 몸도 앞으로 숙임
      }
      m.tilt.position.y = Math.sin(this.walkPhase * 2) * 0.005;
      m.feet[0].group.position.set(-0.031, -0.104 + Math.max(0, Math.sin(this.walkPhase)) * 0.018, 0.010 + Math.sin(this.walkPhase) * 0.038);
      m.feet[1].group.position.set(0.031, -0.104 + Math.max(0, -Math.sin(this.walkPhase)) * 0.018, 0.010 - Math.sin(this.walkPhase) * 0.038);
      m.feet[0].group.rotation.x = 0;
      m.feet[1].group.rotation.x = 0;
    } else {
      m.headPivot.position.set(0, 0.126, 0.108);
      m.headPivot.rotation.x = THREE.MathUtils.clamp(this.pitch * 0.55, -0.45, 0.45);
      m.tilt.position.y = 0;
      m.feet[0].group.position.set(-0.026, -0.052, -0.062);
      m.feet[1].group.position.set(0.026, -0.052, -0.062);
      m.feet[0].group.rotation.x = 1.55;
      m.feet[1].group.rotation.x = 1.55;
    }
    this.applyPeck();
    this.applyCoo();
  }

  peck() {
    if (this.peckT > 0 || this.mode !== 'walk') return false;
    this.peckT = this.peckDur;
    return true;
  }

  applyCoo() {
    const m = this.model;
    if (this.cooT > 0) {
      const k = Math.sin(Math.PI * Math.min(1, this.cooT / 1.1));
      const p = 1 + 0.42 * k + 0.08 * Math.sin(this.cooT * 60) * k;
      m.neck.scale.set(0.080 * p, 0.098 * (1 + 0.18 * k), 0.086 * p);
      m.neck2.scale.set(0.066 * (1 + 0.25 * k), 0.074, 0.070 * (1 + 0.25 * k));
      m.headPivot.rotation.x += 0.35 * k;
    } else {
      m.neck.scale.set(0.080, 0.098, 0.086);
      m.neck2.scale.set(0.066, 0.074, 0.070);
    }
  }

  applyPeck() {
    if (this.peckT <= 0) return;
    const m = this.model;
    const k = Math.sin(Math.PI * Math.min(1, this.peckT / PECK_DUR));
    m.headPivot.rotation.x = -1.25 * k;
    m.headPivot.position.y = 0.126 - 0.075 * k;
    m.headPivot.position.z = 0.108 + 0.040 * k;
    m.tilt.rotation.x = -this.pitch + 0.26 * k;
  }

  loseToe() {
    const alive = this.model.allToes.filter(t => t.visible);
    if (alive.length <= 2) return null;
    const pick = alive[(Math.random() * alive.length) | 0];
    pick.visible = false;
    this.toesLost++;
    return pick;
  }

  toeCount() { return this.model.allToes.filter(t => t.visible).length; }

  perchChance(hard) {
    const t = this.toeCount() / 8;
    const grip = 0.25 + 0.75 * t;
    const base = 1 - hard * 0.92;
    return Math.max(0.06, Math.min(0.99, base + (grip - 1) * hard * 1.9 + grip * 0.14));
  }
}

/* ============================================================
   MAIN
   ============================================================ */

let renderer, scene, camera, W, bird, timer;
let people = [], crumbs = [], flock = [];
let badges = 0;
let stringT = 0, started = false;
let badgeCamT = 0;
let redPigeon = null, redPigeonRespawnTimer = 0, snackRespawnTimer = -1, carBumpT = 0;
const input = { x: 0, y: 0 };
const keys = {};
let camPos = new THREE.Vector3(0, 20, 26);
let camLook = new THREE.Vector3(0, 14, 12);


/* ---------- 저장 ---------- */
const STORE_KEY = 'pigeon_marks_v2';
let memStore = null;
function loadMarks() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); }
  catch (e) { return memStore || []; }
}

/* ============================================================
   사람
   ============================================================ */
const SKIN = [0xE8C4A0, 0xD4A87C, 0xC08D62, 0xF0D2B4, 0xA8764E];
const CLOTH = [0x3A4C6B, 0x6B3A3A, 0x4A5B4A, 0x2E2E33, 0x7A6A4E, 0x5B4A6B, 0x8A8578];

function buildPerson(sitting, opts) {
  opts = opts || {};
  const colors = {
    skin: opts.skin ?? SKIN[(Math.random() * SKIN.length) | 0],
    top: opts.top ?? CLOTH[(Math.random() * CLOTH.length) | 0],
    bottom: opts.bottom ?? CLOTH[(Math.random() * CLOTH.length) | 0],
    hair: opts.hair ?? [0x1E1A17, 0x3A2A1E, 0x6B5540, 0x8A8580][(Math.random() * 4) | 0]
  };
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: colors.skin, roughness: 0.85 });
  const top = new THREE.MeshStandardMaterial({ color: colors.top, roughness: 0.92 });
  const bottom = new THREE.MeshStandardMaterial({ color: colors.bottom, roughness: 0.92 });
  const shoe = new THREE.MeshStandardMaterial({ color: 0x2A2724, roughness: 0.8 });
  const hipY = sitting ? 0.52 : 0.92;
  const upper = new THREE.Group(); upper.position.y = hipY; g.add(upper);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.40, 4, 10), top);
  torso.position.y = 0.32; torso.castShadow = true; upper.add(torso);
  const sh = new THREE.Mesh(new THREE.CapsuleGeometry(0.155, 0.30, 4, 10), top);
  sh.rotation.z = Math.PI / 2; sh.position.y = 0.52; sh.castShadow = true; upper.add(sh);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.09, 8), skin);
  neck.position.y = 0.68; upper.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 12), skin);
  head.scale.set(0.92, 1.12, 1.0); head.position.y = 0.80; head.castShadow = true; upper.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.122, 14, 10, 0, 6.3, 0, 1.9),
    new THREE.MeshStandardMaterial({ color: colors.hair, roughness: 0.95 }));
  hair.scale.set(0.95, 1.15, 1.02); hair.position.y = 0.815; hair.castShadow = true; upper.add(hair);
  if (opts.cap) {
    const capMat = new THREE.MeshStandardMaterial({ color: 0x17233A, roughness: 0.85 });
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.128, 0.132, 0.075, 16), capMat);
    cap.position.y = 0.905; cap.castShadow = true; upper.add(cap);
    const brim = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.018, 0.11), capMat);
    brim.position.set(0, 0.87, 0.13); upper.add(brim);
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.03, 0.02),
      new THREE.MeshStandardMaterial({ color: 0xD8C25A, roughness: 0.6 }));
    band.position.set(0, 0.885, 0.118); upper.add(band);
  }
  [-1, 1].forEach(s => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0x22201E, roughness: 0.3 }));
    eye.position.set(s * 0.042, 0.815, 0.098); upper.add(eye);
  });

  const arms = [];
  [-1, 1].forEach(s => {
    const arm = new THREE.Group(); arm.position.set(s * 0.20, 0.54, 0);
    const ua = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.24, 3, 8), top);
    ua.position.y = -0.16; ua.castShadow = true; arm.add(ua);
    const fore = new THREE.Group(); fore.position.y = -0.30;
    const fmesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.046, 0.22, 3, 8), skin);
    fmesh.position.y = -0.14; fmesh.castShadow = true; fore.add(fmesh);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), skin);
    hand.position.y = -0.28; fore.add(hand);
    arm.add(fore); upper.add(arm); arms.push({ arm, fore, hand });
  });

  const legs = [];
  [-1, 1].forEach(s => {
    const leg = new THREE.Group(); leg.position.set(s * 0.085, hipY, 0);
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.072, sitting ? 0.30 : 0.34, 3, 8), bottom);
    const shin = new THREE.Group();
    if (sitting) { thigh.rotation.x = -Math.PI / 2; thigh.position.set(0, 0, 0.20); shin.position.set(0, 0, 0.40); }
    else { thigh.position.y = -0.19; shin.position.y = -0.40; }
    thigh.castShadow = true; leg.add(thigh);
    const shinMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.062, 0.34, 3, 8), bottom);
    shinMesh.position.y = -0.19; shinMesh.castShadow = true; shin.add(shinMesh);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.24), shoe);
    foot.position.set(0, -0.40, 0.06); foot.castShadow = true; shin.add(foot);
    leg.add(shin); g.add(leg); legs.push({ leg, shin });
  });
  return { group: g, upper, arms, legs, head, colors };
}

function spawnPeople() {
  const spec = [
    { x: -18, z: 2.1, rot: 0, sit: true, feeder: true },
    { x: 14, z: 1.1, rot: 0, sit: true, feeder: true },
    { x: 4, z: 16.1, rot: 0, sit: true, feeder: true },
    { x: -2, z: 6.1, rot: 0, sit: true, feeder: false },
    { x: 26.5, z: 10, rot: Math.PI * 0.5, sit: true, feeder: false },
    { x: -6, z: -8, rot: 2.1, sit: false, feeder: false, walk: true },
    { x: 18, z: -4, rot: 4.0, sit: false, feeder: false, walk: true },
    { x: -30, z: 10, rot: 1.0, sit: false, feeder: false, walk: true },
    { x: -14, z: 27.3, rot: Math.PI / 2, sit: false, feeder: false, fighting: true, pair: 0, side: 0 },
    { x: -11.2, z: 27.3, rot: -Math.PI / 2, sit: false, feeder: false, fighting: true, pair: 0, side: 1 },
    { x: 10.5, z: 27.3, rot: Math.PI / 2, sit: false, feeder: false, fighting: true, pair: 1, side: 0 },
    { x: 13.3, z: 27.3, rot: -Math.PI / 2, sit: false, feeder: false, fighting: true, pair: 1, side: 1 }
  ];
  spec.forEach((s, i) => {
    const p = buildPerson(s.sit, s.fighting ? { top: i % 2 ? 0x9A4639 : 0x354A62, bottom: 0x34343B } : undefined);
    if (s.fighting) {
      const brow = new THREE.MeshStandardMaterial({ color: 0x9D302B, roughness: 0.8 });
      [-1, 1].forEach(side => {
        const mark = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.012, 0.009), brow);
        mark.position.set(side * 0.037, 0.875, 0.106); mark.rotation.z = side * -0.24; p.upper.add(mark);
      });
    }
    p.group.position.set(s.x, 0, s.z);
    p.group.rotation.y = s.rot;
    scene.add(p.group);
    if (s.feeder) attachFoodSnack(p);
    people.push({ ...p, ...s, id: i, alive: true, reported: false,
      feedT: Math.random() * 3, walkT: 0, dir: Math.random() * 7, leaveT: 0, phase: Math.random() * 7 });
  });
  spawnSnackEater();
}

function randomPlazaSpot() {
  for (let attempt = 0; attempt < 60; attempt++) {
    const x = (Math.random() - 0.5) * 66;
    const z = (Math.random() - 0.5) * 42;
    if (insideSolid(new THREE.Vector3(x, 1.2, z))) continue;
    if (people.some(p => p.alive && (p.group.position.x - x) ** 2 + (p.group.position.z - z) ** 2 < 12)) continue;
    return { x, z };
  }
  return { x: 0, z: 18 };
}

function attachFoodSnack(person) {
  const snack = new THREE.Group();
  const paper = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.13, 0.09),
    new THREE.MeshStandardMaterial({ color: 0xE4D4B7, roughness: 0.95 }));
  paper.position.y = -0.34; snack.add(paper);
  const bun = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xC88742, roughness: 0.9 }));
  bun.scale.set(0.08, 0.036, 0.052); bun.position.set(0, -0.25, 0.012); snack.add(bun);
  const filling = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.018, 0.055),
    new THREE.MeshStandardMaterial({ color: 0x6B8B45, roughness: 0.9 }));
  filling.position.set(0, -0.279, 0.012); snack.add(filling);
  person.arms[1].fore.add(snack);
  person.arms[1].arm.rotation.x = -0.55;
}

function spawnSnackEater() {
  const point = randomPlazaSpot();
  const eater = buildPerson(true, { top: [0x3D536C, 0x75433A, 0x576947][(Math.random() * 3) | 0] });
  eater.group.position.set(point.x, 0, point.z);
  eater.group.rotation.y = Math.random() * Math.PI * 2;
  scene.add(eater.group);
  attachFoodSnack(eater);
  const actor = { ...eater, id: people.length, sit: true, walk: false, feeder: true,
    foodEater: true, respawnSnack: true, alive: true, reported: false, feedT: 1.5 + Math.random() * 2,
    walkT: 0, dir: 0, leaveT: 0, phase: Math.random() * 7, eatT: 0 };
  people.push(actor);
  return actor;
}

/* ---------- 먹이 ---------- */
const crumbGeo = new THREE.SphereGeometry(0.013, 5, 4);
const crumbMats = [
  new THREE.MeshStandardMaterial({ color: 0xB89A62, roughness: 0.95 }),
  new THREE.MeshStandardMaterial({ color: 0x9E7F4C, roughness: 0.95 }),
  new THREE.MeshStandardMaterial({ color: 0xCEC0A2, roughness: 0.95 })
];
function scatterCrumbs(p) {
  const n = 9 + ((Math.random() * 6) | 0);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 7, r = 0.5 + Math.random() * 2.0;
    const m = new THREE.Mesh(crumbGeo, crumbMats[(Math.random() * 3) | 0]);
    const x = p.group.position.x + Math.cos(a) * r, z = p.group.position.z + 0.7 + Math.sin(a) * r;
    m.position.set(x, 0.014, z);
    m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    m.scale.set(1 + Math.random() * 0.7, 0.7 + Math.random() * 0.5, 1 + Math.random() * 0.6);
    m.castShadow = true;
    scene.add(m);
    crumbs.push({ mesh: m, x, z, t: 0 });
  }
}

/* ---------- 둥지 ---------- */
function buildSquab() {
  const g = new THREE.Group();
  const fuzz = new THREE.MeshStandardMaterial({ color: 0xD3C49C, roughness: 1 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xC9A388, roughness: 0.95 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), fuzz);
  body.scale.set(0.058, 0.046, 0.066); body.position.y = 0.023; body.castShadow = true; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), skin);
  head.scale.set(0.036, 0.034, 0.036); head.position.set(0, 0.048, 0.035); g.add(head);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.010, 0.032, 6),
    new THREE.MeshStandardMaterial({ color: 0x3B3235, roughness: 0.6 }));
  beak.rotation.x = Math.PI / 2 + 0.3; beak.position.set(0, 0.044, 0.060); g.add(beak);
  [-1, 1].forEach(s => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.006, 6, 5),
      new THREE.MeshStandardMaterial({ color: 0x2A2323, roughness: 0.4 }));
    eye.position.set(s * 0.016, 0.054, 0.048); g.add(eye);
  });
  return g;
}
function buildNest(withSquabs) {
  const g = new THREE.Group();
  const twig = new THREE.MeshStandardMaterial({ color: 0x7A5A3A, roughness: 1 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.045, 14),
    new THREE.MeshStandardMaterial({ color: 0x5C4E3E, roughness: 1 }));
  base.position.y = 0.022; base.castShadow = true; g.add(base);
  for (let i = 0; i < 28; i++) {
    const a = Math.random() * 7, r = 0.10 + Math.random() * 0.07;
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.0028, 0.12 + Math.random() * 0.10, 4), twig);
    st.position.set(Math.cos(a) * r, 0.03 + Math.random() * 0.03, Math.sin(a) * r);
    st.rotation.set((Math.random() - 0.5) * 0.5, a, Math.PI / 2 + (Math.random() - 0.5) * 0.5);
    g.add(st);
  }
  // 굳은 배설물 층
  const grime = new THREE.Mesh(new THREE.CircleGeometry(0.28, 18),
    new THREE.MeshStandardMaterial({ color: 0x3E3A33, roughness: 1, transparent: true, opacity: 0.8 }));
  grime.rotation.x = -Math.PI / 2; grime.position.y = 0.004; g.add(grime);
  if (withSquabs) {
    [[-0.035, 0.6], [0.035, -0.5]].forEach(([x, r]) => {
      const s = buildSquab(); s.position.set(x, 0.04, 0); s.rotation.y = r; g.add(s);
    });
  } else {
    const eggMat = new THREE.MeshStandardMaterial({ color: 0xF2EEE4, roughness: 0.55 });
    [[-0.028, 0.01], [0.026, -0.012]].forEach(([x, z]) => {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), eggMat);
      e.scale.set(0.036, 0.046, 0.036); e.position.set(x, 0.062, z); e.rotation.z = 0.35; e.castShadow = true; g.add(e);
    });
  }
  return g;
}
function spawnNests() {
  W.nests = [];
  const acs = W.perches.filter(p => p.kind === 'ac');
  const awn = W.perches.filter(p => p.kind === 'awning');
  const stalls = W.perches.filter(p => p.kind === 'stall');
  const picks = [acs[2], acs[7], awn[1], stalls[0], acs[13]].filter(Boolean);
  picks.forEach((pc, i) => {
    const n = buildNest(i % 2 === 1);
    n.position.copy(pc.pos).add(new THREE.Vector3(pc.normal.x * 0.02, 0.0, pc.normal.z * 0.02));
    scene.add(n);
    W.nests.push({ perch: pc, group: n });
    pc.hard = Math.min(pc.hard, 0.18);
    if (i < 3) {  // 어미
      const pm = buildPigeon();
      pm.root.position.copy(pc.pos).add(new THREE.Vector3(pc.normal.x * 0.24, 0.115, pc.normal.z * 0.24));
      pm.root.rotation.y = Math.atan2(-pc.normal.x, -pc.normal.z) + 0.4;
      pm.wingL.shoulder.visible = false; pm.wingR.shoulder.visible = false;
      pm.foldedL.visible = true; pm.foldedR.visible = true;
      scene.add(pm.root);
    }
  });
}

/* ---------- 다른 비둘기 ---------- */
const FLOCK_PERCH_KINDS = new Set(['ledge', 'awning', 'ac', 'sign', 'banner', 'lamp', 'bench', 'stall', 'tree', 'bin', 'wire']);
function flockPerches() { return W.perches.filter(p => FLOCK_PERCH_KINDS.has(p.kind)); }
function spawnFlock() {
  const pl = flockPerches();
  for (let i = 0; i < 13; i++) {
    const p = buildPigeon();
    p.root.scale.setScalar(0.95 + Math.random() * 0.12);
    scene.add(p.root);
    const poopMesh = new THREE.Mesh(new THREE.SphereGeometry(0.027, 9, 7),
      new THREE.MeshStandardMaterial({ color: 0x8D7550, roughness: 0.95 }));
    poopMesh.visible = false; scene.add(poopMesh);
    const f = { m: p, x: 0, y: 0.115, z: 0, tx: 0, ty: 0.115, tz: 0, yaw: Math.random() * 7,
      state: 'walk', t: Math.random() * 3, walkPhase: Math.random() * 7, peck: 0, perch: null, target: null,
      poopMesh, poopTimer: 3 + Math.random() * 17, poopDuration: 0, poopAge: 0, poopMax: 0 };
    if (i < 5 && pl.length) {
      const pc = pl[(Math.random() * pl.length) | 0];
      f.x = pc.pos.x; f.y = pc.pos.y + 0.115; f.z = pc.pos.z; f.state = 'perch'; f.perch = pc;
      f.t = 6 + Math.random() * 20; f.yaw = Math.atan2(pc.normal.x, pc.normal.z);
    } else {
      f.x = (Math.random() - 0.5) * 50; f.z = (Math.random() - 0.5) * 36;
    }
    f.tx = f.x; f.tz = f.z;
    p.root.position.set(f.x, f.y, f.z);
    flock.push(f);
  }
}
function tintCrimsonPigeon(model) {
  model.root.traverse(node => {
    if (!node.isMesh) return;
    const tint = material => {
      if (!material) return material;
      const copy = material.clone();
      if (copy.color) {
        const dark = copy.color.r + copy.color.g + copy.color.b < 0.28;
        const tinyEye = node.geometry && node.geometry.type === 'SphereGeometry' && node.scale.x < 0.018;
        if (!dark && !tinyEye) copy.color.set(0xC52336);
      }
      if (copy.uniforms) {
        if (copy.uniforms.base) copy.uniforms.base.value.set(0x8F172B);
        if (copy.uniforms.ca) copy.uniforms.ca.value.set(0xF04452);
        if (copy.uniforms.cb) copy.uniforms.cb.value.set(0x72152B);
      }
      return copy;
    };
    node.material = Array.isArray(node.material) ? node.material.map(tint) : tint(node.material);
  });
}

function spawnBigRedPigeon() {
  const model = buildPigeon();
  tintCrimsonPigeon(model);
  model.root.scale.setScalar(1.85);
  scene.add(model.root);
  const point = randomPlazaSpot();
  redPigeon = { type: 'redPigeon', model, group: model.root, x: point.x, z: point.z,
    tx: point.x, tz: point.z, yaw: Math.random() * Math.PI * 2, moveT: 1, phase: Math.random() * 8,
    alive: true, reported: false };
  model.root.position.set(point.x, 0.115, point.z);
  model.root.rotation.y = redPigeon.yaw;
}

function reportBigPigeon() {
  if (!redPigeon || !redPigeon.alive || redPigeon.reported) return;
  redPigeon.reported = true; redPigeon.alive = false; redPigeon.group.visible = false;
  redPigeonRespawnTimer = 9 + Math.random() * 7;
  reportTarget = null;
}

function updateRedPigeon(dt) {
  if (!redPigeon) return;
  if (!redPigeon.alive) {
    redPigeonRespawnTimer -= dt;
    if (redPigeonRespawnTimer <= 0) {
      const point = randomPlazaSpot();
      redPigeon.x = redPigeon.tx = point.x; redPigeon.z = redPigeon.tz = point.z;
      redPigeon.yaw = Math.random() * Math.PI * 2;
      redPigeon.alive = true; redPigeon.reported = false; redPigeon.group.visible = true;
    } else return;
  }
  const bird = redPigeon;
  bird.phase += dt; bird.moveT -= dt;
  if (bird.moveT <= 0) {
    const point = randomPlazaSpot(); bird.tx = point.x; bird.tz = point.z;
    bird.moveT = 3 + Math.random() * 4;
  }
  const dx = bird.tx - bird.x, dz = bird.tz - bird.z, distance = Math.hypot(dx, dz);
  if (distance > 0.12) {
    bird.yaw = Math.atan2(dx, dz);
    const step = Math.min(distance, 0.48 * dt);
    bird.x += dx / distance * step; bird.z += dz / distance * step;
  }
  bird.group.position.set(bird.x, 0.115, bird.z);
  bird.group.rotation.y = bird.yaw;
  bird.model.headPivot.rotation.y = Math.sin(bird.phase * 1.8) * 0.17;
  bird.model.headPivot.position.y = 0.126 + Math.sin(bird.phase * 2.5) * 0.008;
}

function updateSnackRespawn(dt) {
  if (snackRespawnTimer < 0) return;
  snackRespawnTimer -= dt;
  if (snackRespawnTimer <= 0) { snackRespawnTimer = -1; spawnSnackEater(); }
}

function flockGoTo(f, x, y, z, perch) {
  f.tx = x; f.ty = y; f.tz = z; f.target = perch || null; f.state = 'fly';
  f.startD = Math.hypot(x - f.x, z - f.z);
}
function updateFlock(dt) {
  flock.forEach(f => {
    f.t -= dt;
    if (f.state === 'walk') {
      if (f.t <= 0) {
        let best = null, bd = 1e9;
        crumbs.forEach(c => { const d = (c.x - f.x) ** 2 + (c.z - f.z) ** 2; if (d < bd) { bd = d; best = c; } });
        if (best && bd < 400 && Math.random() < 0.8) {
          if (bd > 90) flockGoTo(f, best.x + (Math.random() - 0.5), 0.115, best.z + (Math.random() - 0.5));
          else { f.tx = best.x + (Math.random() - 0.5) * 0.6; f.tz = best.z + (Math.random() - 0.5) * 0.6; }
        } else if (Math.random() < 0.22) {
          const pl = flockPerches(); const pc = pl[(Math.random() * pl.length) | 0];
          flockGoTo(f, pc.pos.x, pc.pos.y + 0.115, pc.pos.z, pc);
        } else { f.tx = f.x + (Math.random() - 0.5) * 8; f.tz = f.z + (Math.random() - 0.5) * 8; }
        f.t = 1.2 + Math.random() * 2.4;
      }
      const dx = f.tx - f.x, dz = f.tz - f.z, d = Math.hypot(dx, dz);
      if (d > 0.15) {
        f.yaw = Math.atan2(dx, dz);
        const s = Math.min(1.1, d) * 0.9;
        f.x += (dx / d) * s * dt; f.z += (dz / d) * s * dt;
        f.walkPhase += dt * 7;
      } else if (f.peck <= 0 && Math.random() < dt * 1.5) {
        f.peck = 0.34;
        for (let i = crumbs.length - 1; i >= 0; i--) {
          if ((crumbs[i].x - f.x) ** 2 + (crumbs[i].z - f.z) ** 2 < 0.09) { scene.remove(crumbs[i].mesh); crumbs.splice(i, 1); break; }
        }
      }
      f.y += (0.115 - f.y) * Math.min(1, dt * 6);
    } else if (f.state === 'perch') {
      if (f.t <= 0) {
        if (Math.random() < 0.35) {
          const pl = flockPerches(); const pc = pl[(Math.random() * pl.length) | 0];
          flockGoTo(f, pc.pos.x, pc.pos.y + 0.115, pc.pos.z, pc);
        } else {
          flockGoTo(f, (Math.random() - 0.5) * 40, 0.115, (Math.random() - 0.5) * 30);
        }
      }
    } else {  // fly
      const dx = f.tx - f.x, dz = f.tz - f.z, d = Math.hypot(dx, dz);
      f.yaw = Math.atan2(dx, dz);
      const sp = 6.5;
      if (d > 0.05) { f.x += (dx / d) * Math.min(d, sp * dt); f.z += (dz / d) * Math.min(d, sp * dt); }
      const prog = f.startD > 0.01 ? 1 - Math.min(1, d / f.startD) : 1;
      const bump = Math.sin(prog * Math.PI) * Math.min(4.5, f.startD * 0.28);
      const wantY = f.ty + bump;
      f.y += (wantY - f.y) * Math.min(1, dt * 3.2);
      f.walkPhase += dt * 16;
      if (d < 0.35 && Math.abs(f.y - f.ty) < 0.35) {
        f.y = f.ty;
        if (f.target) { f.state = 'perch'; f.perch = f.target; f.t = 6 + Math.random() * 22; f.yaw = Math.atan2(f.target.normal.x, f.target.normal.z); }
        else { f.state = 'walk'; f.t = 0.8; }
      }
    }
    if (f.peck > 0) f.peck -= dt;
    if (f.state === 'fly') {
      f.poopDuration = 0; f.poopMesh.visible = false;
    } else if (f.poopDuration > 0) {
      f.poopAge += dt; f.poopDuration -= dt;
      const progress = Math.min(1, f.poopAge / f.poopMax);
      f.poopMesh.visible = true;
      f.poopMesh.position.set(f.x - Math.sin(f.yaw) * 0.14,
        Math.max(0.045, f.y - 0.045 - progress * Math.max(0.08, f.y - 0.09)),
        f.z - Math.cos(f.yaw) * 0.14);
      f.poopMesh.scale.setScalar(0.6 + Math.sin(progress * Math.PI) * 0.55);
      if (f.poopDuration <= 0) f.poopMesh.visible = false;
    } else {
      f.poopTimer -= dt;
      if (f.poopTimer <= 0) {
        f.poopMax = f.poopDuration = 0.45 + Math.random() * 1.65;
        f.poopAge = 0; f.poopMesh.visible = true;
        f.poopTimer = 5 + Math.random() * 19;
      }
    }
    const m = f.m;
    m.root.position.set(f.x, f.y, f.z);
    m.root.rotation.y = f.yaw;
    const flying = f.state === 'fly';
    m.wingL.shoulder.visible = flying; m.wingR.shoulder.visible = flying;
    m.foldedL.visible = !flying; m.foldedR.visible = !flying;
    if (flying) {
      const wa = Math.sin(f.walkPhase * 2.2) * 0.95 + 0.15;
      m.wingL.upperArm.rotation.z = -wa; m.wingR.upperArm.rotation.z = wa;
      m.wingL.foreArm.rotation.y = 0; m.wingR.foreArm.rotation.y = 0;
      m.wingL.foreArm.scale.set(1, 1, 1); m.wingR.foreArm.scale.set(1, 1, 1);
      m.headPivot.position.set(0, 0.126, 0.108); m.headPivot.rotation.x = 0;
      m.feet[0].group.position.set(-0.026, -0.052, -0.062); m.feet[1].group.position.set(0.026, -0.052, -0.062);
      m.feet[0].group.rotation.x = 1.55; m.feet[1].group.rotation.x = 1.55;
    } else {
      m.feet[0].group.position.set(-0.031, -0.104, 0.010); m.feet[1].group.position.set(0.031, -0.104, 0.010);
      m.feet[0].group.rotation.x = 0; m.feet[1].group.rotation.x = 0;
      if (f.peck > 0) {
        const k = Math.sin(Math.PI * Math.min(1, f.peck / 0.34));
        m.headPivot.rotation.x = -1.25 * k;
        m.headPivot.position.set(0, 0.126 - 0.075 * k, 0.108 + 0.04 * k);
      } else if (f.state === 'perch') {
        m.headPivot.position.set(0, 0.126, 0.108);
        m.headPivot.rotation.x = 0;
        m.headPivot.rotation.y = Math.sin(f.t * 0.9) * 0.6;
      } else {
        const ph = f.walkPhase % (Math.PI * 2);
        const thrust = ph < Math.PI * 0.35 ? (ph / (Math.PI * 0.35)) : 1 - ((ph - Math.PI * 0.35) / (Math.PI * 1.65));
        m.headPivot.position.set(0, 0.126, 0.108 + thrust * 0.05);
        m.headPivot.rotation.x = -thrust * 0.12;
        m.headPivot.rotation.y = 0;
      }
    }
  });
}

/* ============================================================
   초기화
   ============================================================ */
function init() {
  THREE.ColorManagement.enabled = true;
  renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.74;
  document.getElementById('app').appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.05, 700);

  W = buildWorld(scene, renderer);
  spawnPeople();
  spawnNests();
  spawnFlock();
  bird = new Pigeon(scene);
  spawnBigRedPigeon();

  const marks = loadMarks();
  marks.forEach((s, i) => {
    const age = marks.length - i;
    if (s.k !== 'bag') addStain(W, s.x, s.z, s.k, age);
  });

  timer = new THREE.Timer();
  bindInput();
  addEventListener('resize', onResize);
  animate();
}

const activeLasers = [];
let laserCooldown = 0;
function fireLaser() {
  if (!started || !bird || laserCooldown > 0) return;
  laserCooldown = 0.18;
  const forward = bird.forward().normalize();
  const start = bird.pos.clone().addScaledVector(forward, 0.24);
  const reach = 34;
  let end = start.clone().addScaledVector(forward, reach), closest = reach;
  for (const person of people) {
    if (!person.fighting || !person.alive) continue;
    const target = person.group.position.clone().add(new THREE.Vector3(0, 0.85, 0));
    const along = target.clone().sub(start).dot(forward);
    if (along <= 0 || along > closest) continue;
    const miss = target.sub(start).addScaledVector(forward, -along).length();
    if (miss < 1.15) { closest = along; end = start.clone().addScaledVector(forward, along); person.zapped = 2.4; }
  }
  const direction = end.clone().sub(start), length = direction.length();
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, length, 8), new THREE.MeshBasicMaterial({ color: 0xFF3B68, transparent: true, opacity: 0.98, depthTest: false }));
  core.position.copy(start).add(end).multiplyScalar(0.5);
  core.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  core.renderOrder = 25; scene.add(core);
  const glow = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, length, 8), new THREE.MeshBasicMaterial({ color: 0xFF79A0, transparent: true, opacity: 0.24, depthTest: false }));
  glow.position.copy(core.position); glow.quaternion.copy(core.quaternion); glow.renderOrder = 24; scene.add(glow);
  activeLasers.push({ core, glow, t: 0.13 });
}
function updateLasers(dt) {
  laserCooldown = Math.max(0, laserCooldown - dt);
  for (let i = activeLasers.length - 1; i >= 0; i--) {
    const shot = activeLasers[i]; shot.t -= dt;
    shot.core.material.opacity = Math.max(0, shot.t / 0.13);
    shot.glow.material.opacity = Math.max(0, shot.t / 0.13) * 0.24;
    if (shot.t <= 0) {
      scene.remove(shot.core, shot.glow); shot.core.geometry.dispose(); shot.glow.geometry.dispose();
      shot.core.material.dispose(); shot.glow.material.dispose(); activeLasers.splice(i, 1);
    }
  }
}

function onResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}

/* ============================================================
   입력
   ============================================================ */
let stickActive = false, stickId = -1, stickOrigin = { x: 0, y: 0 }, flapTouchId = null;
function bindInput() {
  addEventListener('keydown', e => {
    if (e.repeat) return;
    keys[e.code] = true;
    if (e.code === 'Space') { e.preventDefault(); bird.flapHeld = true; doFlap(); }
    if (e.code === 'Backquote') toggleDev();
    if (e.code === 'KeyC') coo();
  });
  addEventListener('blur', () => { bird.flapHeld = false; for (const k in keys) keys[k] = false; input.x = 0; input.y = 0; stickActive = false; document.getElementById('stick').classList.remove('on'); });
  addEventListener('keyup', e => {
    keys[e.code] = false;
    if (e.code === 'Space') bird.flapHeld = false;
  });

  // 왼쪽 화면 어디를 눌러도 그 자리에 스틱이 생김
  const zone = document.getElementById('stickZone');
  const stick = document.getElementById('stick');
  const knob = document.getElementById('knob');
  function stickStart(x, y, id) {
    stickActive = true; stickId = id; stickOrigin = { x, y };
    stick.style.left = x + 'px'; stick.style.top = y + 'px';
    knob.style.transform = 'translate(0,0)';
    stick.classList.add('on');
    input.x = 0; input.y = 0;
  }
  function stickMoveXY(x, y) {
    let dx = x - stickOrigin.x, dy = y - stickOrigin.y;
    const R = 52, d = Math.hypot(dx, dy);
    if (d > R) { dx *= R / d; dy *= R / d; }
    knob.style.transform = `translate(${dx}px,${dy}px)`;
    input.x = dx / R; input.y = dy / R;
  }
  function stickEnd() {
    stickActive = false; stickId = -1; input.x = 0; input.y = 0;
    stick.classList.remove('on');
  }
  zone.addEventListener('touchstart', e => {
    if (stickActive) return;
    e.preventDefault();
    const t = e.changedTouches[0];
    stickStart(t.clientX, t.clientY, t.identifier);
  }, { passive: false });
  addEventListener('touchmove', e => {
    if (!stickActive) return;
    const t = Array.from(e.changedTouches).find(t => t.identifier === stickId);
    if (!t) return;
    e.preventDefault();
    stickMoveXY(t.clientX, t.clientY);
  }, { passive: false });
  const stickTouchEnd = e => {
    if (!stickActive) return;
    if (Array.from(e.changedTouches).some(t => t.identifier === stickId)) stickEnd();
  };
  addEventListener('touchend', stickTouchEnd);
  addEventListener('touchcancel', stickTouchEnd);
  zone.addEventListener('mousedown', e => { e.preventDefault(); stickStart(e.clientX, e.clientY, -1); });
  addEventListener('mousemove', e => { if (stickActive && stickId === -1) stickMoveXY(e.clientX, e.clientY); });
  addEventListener('mouseup', () => { if (stickActive && stickId === -1) stickEnd(); });

  const fb = document.getElementById('flapBtn');
  fb.addEventListener('touchstart', e => {
    e.preventDefault();
    flapTouchId = e.changedTouches[0].identifier;
    bird.flapHeld = true; doFlap();
  }, { passive: false });
  const flapRelease = e => {
    if (e.changedTouches) {
      if (!Array.from(e.changedTouches).some(t => t.identifier === flapTouchId)) return;
      flapTouchId = null;
    }
    bird.flapHeld = false;
  };
  addEventListener('touchend', flapRelease);
  addEventListener('touchcancel', flapRelease);
  fb.addEventListener('mousedown', e => { e.preventDefault(); bird.flapHeld = true; doFlap(); });
  addEventListener('mouseup', () => { bird.flapHeld = false; });

  const cb = document.getElementById('cooBtn');
  cb.addEventListener('touchstart', e => { e.preventDefault(); coo(); }, { passive: false });
  cb.addEventListener('mousedown', e => { e.preventDefault(); coo(); });
  const laserBtn = document.getElementById('laserBtn');
  laserBtn.addEventListener('pointerdown', e => { e.preventDefault(); fireLaser(); });
  renderer.domElement.addEventListener('pointerdown', e => {
    if (!e.isPrimary || e.button !== 0) return;
    fireLaser();
  });

  document.getElementById('reportBtn').addEventListener('click', e => {
    e.preventDefault();
    if (reportTarget && started) { if (reportTarget.type === 'redPigeon') reportBigPigeon(); else reportPerson(reportTarget); SFX.beep(); }
  });
  document.getElementById('startBtn').addEventListener('click', () => {
    document.getElementById('title').style.display = 'none';
    SFX.init();
    started = true;
  });
}

function readKeys() {
  if (stickActive) return;
  let x = 0, y = 0;
  if (keys['KeyA'] || keys['ArrowLeft']) x -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) x += 1;
  if (keys['KeyW'] || keys['ArrowUp']) y -= 1;
  if (keys['KeyS'] || keys['ArrowDown']) y += 1;
  input.x = x; input.y = y;
}

function doFlap() {
  if (!started) return;
  bird.flap();
}

/* ============================================================
   효과음 — 파일 없이 합성
   ============================================================ */
const SFX = (() => {
  let ctx = null, noiseBuf = null, out = null, lastCar = -9, lastFlap = -9;
  function ensure() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const len = ctx.sampleRate | 0;
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      // 전체 출력 버스: 크게 틀어도 안 찢어지게 컴프레서를 거침
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -12; comp.knee.value = 14; comp.ratio.value = 5;
      comp.attack.value = 0.004; comp.release.value = 0.14;
      comp.connect(ctx.destination);
      out = ctx.createGain(); out.gain.value = 1.0; out.connect(comp);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function burst(t0, dur, type, f0, f1, q, peak, attack) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.Q.value = q;
    fl.frequency.setValueAtTime(f0, t0); fl.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(peak, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(fl); fl.connect(g); g.connect(out);
    src.start(t0); src.stop(t0 + dur + 0.02);
  }
  function tone(t0, dur, type, f0, f1, peak, attack) {
    const o = ctx.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(peak, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(out);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }
  return {
    init() { try { ensure(); } catch (e) {} },
    flap() {  // 푸드득
      try { const c = ensure(), t0 = c.currentTime; if (t0 - lastFlap < 0.08) return; lastFlap = t0;
        burst(t0, 0.26, 'bandpass', 620, 220, 0.55, 0.62, 0.07);
        burst(t0 + 0.14, 0.22, 'bandpass', 520, 200, 0.55, 0.48, 0.06);
        tone(t0 + 0.02, 0.14, 'sine', 105, 55, 0.30, 0.03);
      } catch (e) {}
    },
    flutter() {  // 미끄러져 퍼덕
      try { const c = ensure(), t0 = c.currentTime;
        for (let i = 0; i < 5; i++) burst(t0 + i * 0.09, 0.14, 'bandpass', 700, 260, 0.6, 0.48, 0.03);
      } catch (e) {}
    },
    land() {  // 착지 툭
      try { const c = ensure(), t0 = c.currentTime;
        tone(t0, 0.09, 'sine', 120, 55, 0.8, 0.008);
        burst(t0, 0.05, 'lowpass', 900, 300, 0.7, 0.42, 0.005);
      } catch (e) {}
    },
    peck() {  // 톡
      try { const c = ensure(), t0 = c.currentTime;
        burst(t0, 0.022, 'highpass', 2600, 2600, 0.7, 0.6, 0.003);
        tone(t0, 0.03, 'sine', 900, 400, 0.25, 0.003);
      } catch (e) {}
    },
    thud() {  // 유리에 박음
      try { const c = ensure(), t0 = c.currentTime;
        tone(t0, 0.18, 'sine', 95, 40, 1.1, 0.008);
        burst(t0, 0.08, 'lowpass', 1200, 200, 0.6, 0.7, 0.004);
        tone(t0 + 0.01, 0.35, 'sine', 2400, 2300, 0.18, 0.004);
      } catch (e) {}
    },
    beep() {  // 신고 접수
      try { const c = ensure(), t0 = c.currentTime;
        tone(t0, 0.06, 'square', 1320, 1320, 0.13, 0.004);
        tone(t0 + 0.09, 0.09, 'square', 1760, 1760, 0.13, 0.004);
      } catch (e) {}
    },
    car(k) {  // 차 지나감 (k: 0~1 가까움)
      try { const c = ensure(), t0 = c.currentTime; if (t0 - lastCar < 0.9) return; lastCar = t0;
        burst(t0, 0.95, 'lowpass', 260 + k * 700, 200, 0.6, 0.28 + k * 0.6, 0.30);
      } catch (e) {}
    },
    fanfare() {  // 빰-빠-밤-빠아
      try { const c = ensure(), t0 = c.currentTime;
        const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; lp.Q.value = 0.7; lp.connect(out);
        const note = (f, s, d, peak) => {
          [1, 1.005].forEach(det => {
            const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * det;
            const g = c.createGain();
            g.gain.setValueAtTime(0.0001, t0 + s); g.gain.exponentialRampToValueAtTime(peak, t0 + s + 0.03);
            g.gain.setValueAtTime(peak, t0 + s + d * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t0 + s + d);
            o.connect(g); g.connect(lp); o.start(t0 + s); o.stop(t0 + s + d + 0.05);
          });
        };
        note(523.25, 0.00, 0.16, 0.22);
        note(523.25, 0.18, 0.16, 0.22);
        note(659.25, 0.36, 0.16, 0.22);
        note(783.99, 0.54, 0.16, 0.22);
        note(1046.5, 0.74, 0.95, 0.26);
        note(783.99, 0.74, 0.95, 0.14);
        note(523.25, 0.74, 0.95, 0.14);
      } catch (e) {}
    },
    coo() {
      try { const c = ensure(), t0 = c.currentTime;
        const master = c.createGain(); master.gain.setValueAtTime(0.0001, t0); master.connect(out);
        const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500; lp.Q.value = 1.6; lp.connect(master);
        const o1 = c.createOscillator(); o1.type = 'triangle';
        const o2 = c.createOscillator(); o2.type = 'sine';
        const o3 = c.createOscillator(); o3.type = 'sawtooth';
        const g2 = c.createGain(); g2.gain.value = 0.6;
        const g3 = c.createGain(); g3.gain.value = 0.18;
        o1.connect(lp); o2.connect(g2); g2.connect(lp); o3.connect(g3); g3.connect(lp);
        const trem = c.createOscillator(); trem.type = 'sine'; trem.frequency.value = 26;
        const tg = c.createGain(); tg.gain.value = 0.55; trem.connect(tg); tg.connect(master.gain);
        [[0.00, 0.26, 330], [0.30, 0.20, 305], [0.55, 0.50, 285]].forEach(([s, d, f]) => {
          o1.frequency.setValueAtTime(f * 1.12, t0 + s); o1.frequency.exponentialRampToValueAtTime(f * 0.86, t0 + s + d);
          o2.frequency.setValueAtTime(f * 2.05, t0 + s); o2.frequency.exponentialRampToValueAtTime(f * 1.7, t0 + s + d);
          o3.frequency.setValueAtTime(f * 3.02, t0 + s); o3.frequency.exponentialRampToValueAtTime(f * 2.55, t0 + s + d);
          master.gain.setValueAtTime(0.0001, t0 + s);
          master.gain.exponentialRampToValueAtTime(1.5, t0 + s + 0.06);
          master.gain.exponentialRampToValueAtTime(0.0001, t0 + s + d);
        });
        o1.start(t0); o2.start(t0); o3.start(t0); trem.start(t0);
        o1.stop(t0 + 1.2); o2.stop(t0 + 1.2); o3.stop(t0 + 1.2); trem.stop(t0 + 1.2);
      } catch (e) {}
    }
  };
})();
function coo() {
  if (!started || bird.cooT > 0) return;
  bird.cooT = 1.1;
  SFX.coo();
}

/* ============================================================
   행동
   ============================================================ */
function autoPeck() {
  if (bird.mode !== 'walk' || bird.peckT > 0) return;
  const fx = bird.pos.x + Math.sin(bird.yaw) * 0.15, fz = bird.pos.z + Math.cos(bird.yaw) * 0.15;
  for (let i = 0; i < crumbs.length; i++) {
    const c = crumbs[i];
    if ((c.x - fx) ** 2 + (c.z - fz) ** 2 < 0.024) {
      bird.peckT = PECK_DUR;
      bird.peckTarget = c;
      return;
    }
  }
}
function resolvePeck() {
  if (!bird.peckTarget || bird.peckT > PECK_DUR * 0.5) return;
  const idx = crumbs.indexOf(bird.peckTarget);
  if (idx >= 0) { scene.remove(crumbs[idx].mesh); crumbs.splice(idx, 1); SFX.peck(); }
  bird.peckTarget = null;
}

function reportPerson(p) {
  if (p.reported) return;
  p.reported = true;
  arrestQueue.push(p);
}

/* ============================================================
   경찰 — 연행 담당 하나, 수여 담당 하나 (동시에 움직임)
   ============================================================ */
let officer = null, pinOfficer = null;
const arrestQueue = [], pinQueue = [];
let pinCamPos = null, pinCamLook = null;
function animWalk(pp, dt) {
  pp.phase = (pp.phase || 0) + dt;
  const sw = Math.sin(pp.phase * 5.2) * 0.55;
  pp.legs[0].leg.rotation.x = sw; pp.legs[1].leg.rotation.x = -sw;
  pp.legs[0].shin.rotation.x = Math.max(0, -sw) * 0.7; pp.legs[1].shin.rotation.x = Math.max(0, sw) * 0.7;
  pp.arms[0].arm.rotation.x = -sw * 0.6; pp.arms[1].arm.rotation.x = sw * 0.6;
}
function animIdle(pp) {
  pp.legs[0].leg.rotation.x = 0; pp.legs[1].leg.rotation.x = 0;
  pp.legs[0].shin.rotation.x = 0; pp.legs[1].shin.rotation.x = 0;
}
function walkTo(pp, tx, tz, speed, dt) {
  const g = pp.group;
  const dx = tx - g.position.x, dz = tz - g.position.z, d = Math.hypot(dx, dz);
  if (d < 0.05) return 0;
  const step = Math.min(d, speed * dt);
  g.position.x += (dx / d) * step; g.position.z += (dz / d) * step;
  g.rotation.y = Math.atan2(dx, dz);
  animWalk(pp, dt);
  return d - step;
}
function makeOfficer() { return buildPerson(false, { top: 0x1F3D6E, bottom: 0x1A2A45, cap: true }); }
function setPinCamera(o) {
  const away = bird.pos.clone().sub(o.group.position); away.y = 0; away.normalize();
  const side = new THREE.Vector3(away.z, 0, -away.x);
  pinCamPos = bird.pos.clone().addScaledVector(away, 1.7).addScaledVector(side, 0.9).add(new THREE.Vector3(0, 1.05, 0));
  pinCamLook = bird.pos.clone().lerp(o.group.position.clone().add(new THREE.Vector3(0, 0.75, 0)), 0.42);
  badgeCamT = 3.4;
}

function updateArrest(dt) {
  if (!officer) {
    if (!arrestQueue.length) return;
    const p = arrestQueue.shift();
    const o = makeOfficer();
    const sx = p.group.position.x + 1.5, sz = Math.min(25.5, p.group.position.z + 6.0);
    o.group.position.set(sx, 0, sz);
    scene.add(o.group);
    officer = { ...o, stage: 0, t: 0, target: p, spawn: new THREE.Vector3(sx, 0, sz), escort: null };
    return;
  }
  const o = officer, p = o.target;
  if (o.stage === 0) {
    const d = walkTo(o, p.group.position.x, p.group.position.z + 0.75, 2.2, dt);
    if (d < 0.15) { o.stage = 1; o.t = 0; animIdle(o); }
  } else if (o.stage === 1) {
    o.t += dt;
    o.arms[1].arm.rotation.x = -1.5 * Math.min(1, o.t / 0.3);
    if (o.t > 0.6) {
      p.group.visible = false; p.alive = false;
      const s = buildPerson(false, p.colors);
      s.group.position.copy(p.group.position);
      scene.add(s.group);
      o.escort = s; o.stage = 2;
    }
  } else {
    const d = walkTo(o, o.spawn.x, o.spawn.z, 1.9, dt);
    const g = o.group;
    const side = new THREE.Vector3(Math.cos(g.rotation.y), 0, -Math.sin(g.rotation.y));
    o.escort.group.position.set(g.position.x + side.x * 0.72, 0, g.position.z + side.z * 0.72);
    o.escort.group.rotation.y = g.rotation.y;
    animWalk(o.escort, dt);
    o.arms[1].arm.rotation.x = -0.9;
    if (d < 0.2) {
      scene.remove(o.escort.group); scene.remove(o.group); officer = null; pinQueue.push(p);
      if (p.respawnSnack) snackRespawnTimer = 2.5 + Math.random() * 2.5;
    }
  }
}

function updatePin(dt) {
  if (!pinOfficer) {
    if (!pinQueue.length) return;
    pinQueue.shift();
    const o = makeOfficer();
    const toCenter = new THREE.Vector3(-bird.pos.x, 0, -bird.pos.z); toCenter.y = 0;
    if (toCenter.lengthSq() < 1) toCenter.set(1, 0, 0);
    toCenter.normalize();
    const sx = bird.pos.x + toCenter.x * 4.5, sz = bird.pos.z + toCenter.z * 4.5;
    o.group.position.set(sx, groundHeightAt(sx, sz, bird.pos.y), sz);
    scene.add(o.group);
    pinOfficer = { ...o, stage: 0, t: 0, spawn: new THREE.Vector3(sx, 0, sz), pinned: false };
    return;
  }
  const o = pinOfficer;
  if (o.stage === 0) {
    const d = walkTo(o, bird.pos.x, bird.pos.z, 2.2, dt);
    o.group.position.y = groundHeightAt(o.group.position.x, o.group.position.z, bird.pos.y);
    if (d <= 0.95) animIdle(o);
    const reachable = (bird.pos.y - o.group.position.y) < 2.4 && bird.mode !== 'fly' && bird.mode !== 'stun';
    if (d <= 0.95 && reachable) {
      o.stage = 1; o.t = 0; setPinCamera(o); animIdle(o);
      o.group.rotation.y = Math.atan2(bird.pos.x - o.group.position.x, bird.pos.z - o.group.position.z);
    }
  } else if (o.stage === 1) {
    o.t += dt;
    const k = Math.sin(Math.PI * Math.min(1, o.t / 2.2));
    o.upper.rotation.x = 1.05 * k;
    o.legs[0].leg.rotation.x = -0.35 * k; o.legs[1].leg.rotation.x = -0.35 * k;
    o.legs[0].shin.rotation.x = 0.5 * k; o.legs[1].shin.rotation.x = 0.5 * k;
    o.arms[0].arm.rotation.x = -0.95 * k; o.arms[1].arm.rotation.x = -0.95 * k;
    if (o.t > 1.0 && !o.pinned) {
      o.pinned = true;
      SFX.fanfare();
      badges++;
      addBadge(bird.model, badges - 1);
      if (badges >= 3) honorary = true;
    }
    if (o.t > 2.2) { o.stage = 2; o.upper.rotation.x = 0; animIdle(o); o.arms[0].arm.rotation.x = 0; o.arms[1].arm.rotation.x = 0; }
  } else {
    const d = walkTo(o, o.spawn.x, o.spawn.z, 2.2, dt);
    o.group.position.y = groundHeightAt(o.group.position.x, o.group.position.z, o.group.position.y + 0.3);
    if (d < 0.2) { scene.remove(o.group); pinOfficer = null; }
  }
}
function updatePolice(dt) { updateArrest(dt); updatePin(dt); }

/* ============================================================
   루프
   ============================================================ */
function updatePeople(dt) {
  people.forEach(p => {
    if (p.leaveT > 0) {
      p.leaveT += dt;
      p.group.position.y = -p.leaveT * 0.9;
      p.group.rotation.y += dt * 0.6;
      if (p.leaveT > 2.2 && p.alive) { p.alive = false; p.group.visible = false; }
      return;
    }
    if (!p.alive) return;
    p.phase += dt;
    if (p.feeder && !p.reported) {
      p.feedT -= dt;
      if (p.feedT <= 0) { scatterCrumbs(p); p.feedT = 5.5 + Math.random() * 3.5; p.eatT = 0.62; }
      p.eatT = Math.max(0, (p.eatT || 0) - dt);
      const bite = p.eatT > 0 ? 1 : Math.max(0, Math.sin(p.phase * 1.65)) * 0.18;
      p.arms[1].arm.rotation.x += (-0.55 - bite * 0.68 - p.arms[1].arm.rotation.x) * Math.min(1, dt * 8);
      p.arms[1].fore.rotation.x += (-0.28 * bite - p.arms[1].fore.rotation.x) * Math.min(1, dt * 7);
    }
    if (p.fighting) {
      p.zapped = Math.max(0, (p.zapped || 0) - dt);
      if (p.zapped > 0) {
        p.arms[0].arm.rotation.x = -2.2; p.arms[1].arm.rotation.x = -2.2;
        p.upper.rotation.x = Math.sin(p.phase * 12) * 0.12;
      } else {
        const beat = p.phase * 5 + p.side * Math.PI;
        p.arms[0].arm.rotation.x = -1.05 - Math.max(0, Math.sin(beat)) * 0.85;
        p.arms[1].arm.rotation.x = -1.05 - Math.max(0, Math.sin(beat + Math.PI)) * 0.85;
        p.arms[0].fore.rotation.x = -0.25; p.arms[1].fore.rotation.x = -0.25;
        p.upper.rotation.x = Math.sin(beat * 0.5) * 0.08;
        p.head.rotation.x = -0.06 - Math.max(0, Math.sin(beat)) * 0.08;
      }
    } else if (p.walk) {
      p.walkT += dt;
      if (p.walkT > 4 + Math.random() * 3) { p.dir += (Math.random() - 0.5) * 2.2; p.walkT = 0; }
      p.group.position.x += Math.sin(p.dir) * 1.05 * dt;
      p.group.position.z += Math.cos(p.dir) * 1.05 * dt;
      if (Math.abs(p.group.position.x) > 34) p.dir += Math.PI;
      if (p.group.position.z > 24 || p.group.position.z < -22) p.dir += Math.PI;
      p.group.rotation.y = p.dir;
      const sw = Math.sin(p.phase * 4.6) * 0.55;
      p.legs[0].leg.rotation.x = sw; p.legs[1].leg.rotation.x = -sw;
      p.legs[0].shin.rotation.x = Math.max(0, -sw) * 0.7; p.legs[1].shin.rotation.x = Math.max(0, sw) * 0.7;
      p.arms[0].arm.rotation.x = -sw * 0.6; p.arms[1].arm.rotation.x = sw * 0.6;
    } else {
      p.head.rotation.y = Math.sin(p.phase * 0.5) * 0.4;
    }
    if (bird.mode !== 'fly') {
      const px = p.group.position.x, pz = p.group.position.z;
      const d2 = (px - bird.pos.x) ** 2 + (pz - bird.pos.z) ** 2;
      if (d2 < 0.85) {
        const a = Math.atan2(bird.pos.x - px, bird.pos.z - pz);
        if (bird.mode === 'perch') {
          bird.mode = 'fly'; bird.perch = null; bird.yaw = a;
          bird.vel.set(Math.sin(a) * 1.8, 0.6, Math.cos(a) * 1.8); bird.pitch = 0.1;
        } else {
          bird.pos.x += Math.sin(a) * 2.2 * dt; bird.pos.z += Math.cos(a) * 2.2 * dt;
        }
        p.arms[0].arm.rotation.x = -1.6;
      } else if (!p.walk) {
        p.arms[0].arm.rotation.x += (0 - p.arms[0].arm.rotation.x) * Math.min(1, dt * 4);
      }
    }
  });
}

function updateCars(dt) {
  carBumpT = Math.max(0, carBumpT - dt);
  W.cars.forEach(c => {
    c.mesh.position.x += c.dir * c.speed * dt;
    if (c.dir > 0 && c.mesh.position.x > 115) c.mesh.position.x = -115;
    if (c.dir < 0 && c.mesh.position.x < -115) c.mesh.position.x = 115;
    const dx = Math.abs(bird.pos.x - c.mesh.position.x), dz = Math.abs(bird.pos.z - c.mesh.position.z);
    if (bird.pos.y < 0.75 && dx < 2.4 && dz < 1.1 && carBumpT <= 0) {
      carBumpT = 1.1; bird.pos.y = 1.35; bird.mode = 'fly'; bird.perch = null;
      bird.vel.set(0, 2.4, c.dir * -1.4); bird.pitch = 0.18; bird.flapHeld = false; shake(0.22);
    }
    if (dx < 2.5 && dz < 9 && bird.pos.y < 8) SFX.car(Math.max(0, 1 - dz / 9));
  });
}

function checkGlass() {
  if (bird.mode !== 'fly') return;
  if (bird.vel.length() < 4.5) return;
  for (const g of W.glass) {
    const d = bird.pos.clone().sub(g.pos);
    const along = d.dot(g.normal);
    if (along > 0.34 || along < -0.5) continue;
    const right = new THREE.Vector3(-g.normal.z, 0, g.normal.x);
    const u = d.dot(right), v = d.y;
    if (Math.abs(u) < g.hw && Math.abs(v) < g.hh && bird.vel.dot(g.normal) < -1.5) {
      bird.mode = 'stun'; bird.stunT = 2.1; bird.flapHeld = false;
      bird.vel.multiplyScalar(-0.18); bird.vel.y = 0.5;
      markGlass(g, u, v); shake(0.5); SFX.thud();
      return;
    }
  }
}

const glassMarks = new Map();
function markGlass(g, u, v) {
  const n = glassMarks.get(g) || 0;
  if (n > 3) return;
  glassMarks.set(g, n + 1);
  const S = 64, c = document.createElement('canvas'); c.width = c.height = S;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(236,232,224,0.85)';
  ctx.beginPath(); ctx.ellipse(32, 34, 7, 11, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(32, 20, 5, 0, 7); ctx.fill();
  [-1, 1].forEach(s => {
    ctx.beginPath(); ctx.moveTo(32, 28);
    ctx.quadraticCurveTo(32 + s * 20, 16, 32 + s * 27, 30);
    ctx.quadraticCurveTo(32 + s * 18, 32, 32, 36); ctx.fill();
  });
  const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.7, depthWrite: false }));
  m.position.copy(g.pos).addScaledVector(g.normal, 0.02);
  const right = new THREE.Vector3(-g.normal.z, 0, g.normal.x);
  m.position.addScaledVector(right, u).add(new THREE.Vector3(0, v, 0));
  m.lookAt(m.position.clone().add(g.normal));
  scene.add(m);
}

let shakeT = 0, shakeAmt = 0;
function shake(a) { shakeT = 0.4; shakeAmt = a; }

function groundHeightAt(x, z, y) {
  // (x,z) 아래에 있는 가장 높은 윗면. y 를 주면 그보다 위에 있는 판은 무시 (천막 밑을 걸을 때)
  const lim = (y === undefined) ? Infinity : y + 0.06;
  let h = 0;
  for (const b of W.solids) {
    if (x >= b.min.x && x <= b.max.x && z >= b.min.z && z <= b.max.z && b.max.y <= lim) h = Math.max(h, b.max.y);
  }
  for (const b of W.platforms) {
    if (x >= b.min.x && x <= b.max.x && z >= b.min.z && z <= b.max.z && b.max.y <= lim) h = Math.max(h, b.max.y);
  }
  return h;
}
function pushOutSide(b, pos, vel) {
  const px = Math.min(pos.x - b.min.x, b.max.x - pos.x);
  const pz = Math.min(pos.z - b.min.z, b.max.z - pos.z);
  if (px < pz) { pos.x = (pos.x - b.min.x) < (b.max.x - pos.x) ? b.min.x - 0.05 : b.max.x + 0.05; vel.x *= -0.1; }
  else { pos.z = (pos.z - b.min.z) < (b.max.z - pos.z) ? b.min.z - 0.05 : b.max.z + 0.05; vel.z *= -0.1; }
  vel.multiplyScalar(0.5);
}
function collideSolids(prev, pos, vel) {
  for (const b of W.solids) {
    if (pos.x <= b.min.x || pos.x >= b.max.x || pos.z <= b.min.z || pos.z >= b.max.z) continue;
    if (pos.y >= b.max.y - 0.02) continue;
    if (prev.y >= b.max.y - 0.02) { pos.y = b.max.y + 0.115; if (vel.y < 0) vel.y = 0; continue; }
    pushOutSide(b, pos, vel);
  }
  for (const b of W.platforms) {
    if (pos.x <= b.min.x || pos.x >= b.max.x || pos.z <= b.min.z || pos.z >= b.max.z) continue;
    const top = b.max.y + 0.115, bot = b.min.y - 0.115;
    if (prev.y >= b.max.y - 0.02) {                       // 위에서 옴: 윗면을 지나쳤으면 얹음
      if (pos.y < top) { pos.y = top; if (vel.y < 0) vel.y = 0; }
      continue;
    }
    if (prev.y <= bot + 0.02) {                            // 밑에서 옴: 아랫면을 지나쳤으면 머리 부딪힘
      if (pos.y > bot) { pos.y = bot; if (vel.y > 0) vel.y = -0.4; }
      continue;
    }
    if (pos.y > bot && pos.y < top) pushOutSide(b, pos, vel);   // 옆에서 들어옴
  }
}

function tryLand() {
  if (bird.mode !== 'fly') return;
  const gh = groundHeightAt(bird.pos.x, bird.pos.z, bird.pos.y);
  if (bird.pos.y <= gh + 0.115 && bird.vel.y <= 0) {
    if (bird.vel.length() > 13) shake(0.25);
    bird.pos.y = gh + 0.115; bird.vel.set(0, 0, 0);
    bird.mode = 'walk'; bird.pitch = 0; bird.roll = 0;
    SFX.land();
    return;
  }
  if (bird.vel.length() > 10 || bird.landCooldown > 0) return;
  if (bird.flapHeld || bird.vel.y > 0.4) return;
  for (const pc of W.perches) {
    if (pc.kind === 'stall' || pc.kind === 'awning' || pc.kind === 'ac') continue;
    const dy = bird.pos.y - pc.pos.y;
    if (dy < -0.05 || dy > 0.6) continue;
    const dxz = Math.hypot(bird.pos.x - pc.pos.x, bird.pos.z - pc.pos.z);
    if (dxz < 0.55) {
      if (Math.random() < bird.perchChance(pc.hard)) {
        bird.mode = 'perch';
        bird.pos.copy(pc.pos).add(new THREE.Vector3(0, 0.115, 0));
        bird.vel.set(0, 0, 0); bird.perch = pc; bird.pitch = 0; bird.roll = 0;
        if (pc.normal) bird.yaw = Math.atan2(pc.normal.x, pc.normal.z);
        SFX.land();
      } else {
        bird.slipT = 0.7; bird.landCooldown = 0.7; SFX.flutter();
        const n = pc.normal || new THREE.Vector3(0, 0, 1);
        bird.vel.set(n.x * 1.5 + (Math.random() - 0.5) * 0.6, -0.4, n.z * 1.5 + (Math.random() - 0.5) * 0.6);
        bird.pos.addScaledVector(n, 0.12);
      }
      return;
    }
  }
}

function updateStrings(dt) {
  if (bird.mode !== 'walk') return;
  let inZone = false;
  for (const z of W.stringZones) {
    if ((z.x - bird.pos.x) ** 2 + (z.z - bird.pos.z) ** 2 < z.r * z.r) { inZone = true; break; }
  }
  if (!inZone || Math.abs(input.x) + Math.abs(input.y) < 0.1) return;
  stringT += dt;
  if (stringT > 7.5) { stringT = 0; if (bird.loseToe()) shake(0.2); }
}

function insideSolid(p) {
  for (const b of W.solids) {
    if (p.x > b.min.x && p.x < b.max.x && p.z > b.min.z && p.z < b.max.z && p.y < b.max.y) return true;
  }
  return false;
}
function clipCamera(from, to) {
  let last = from.clone();
  for (let i = 1; i <= 12; i++) {
    const p = from.clone().lerp(to, i / 12);
    if (insideSolid(p)) return last;
    last = p;
  }
  return to;
}
function updateCamera(dt) {
  let targetPos, targetLook;
  if (badgeCamT > 0 && pinCamPos) {
    badgeCamT -= dt;
    targetPos = clipCamera(bird.pos, pinCamPos);
    targetLook = pinCamLook;
    camPos.lerp(targetPos, Math.min(1, dt * 4)); camLook.lerp(targetLook, Math.min(1, dt * 5));
  } else if (bird.mode === 'perch') {
    // 횃대에서는 어깨 너머로 바깥을 내다봄
    const n = (bird.perch && bird.perch.normal) ? bird.perch.normal : new THREE.Vector3(Math.sin(bird.yaw), 0, Math.cos(bird.yaw));
    targetPos = bird.pos.clone().add(new THREE.Vector3(0, 0.56, 0)).addScaledVector(n, 0.02);
    targetPos = clipCamera(bird.pos.clone().add(new THREE.Vector3(0, 0.2, 0)), targetPos);
    targetLook = bird.pos.clone().addScaledVector(n, 2.2).add(new THREE.Vector3(0, -0.28, 0));
    camPos.lerp(targetPos, Math.min(1, dt * 4)); camLook.lerp(targetLook, Math.min(1, dt * 5));
  } else if (bird.mode === 'fly' || bird.mode === 'stun') {
    const f = bird.forward();
    const back = 1.55 + Math.min(1.2, bird.vel.length() * 0.045);
    targetPos = clipCamera(bird.pos, bird.pos.clone().addScaledVector(f, -back).add(new THREE.Vector3(0, 0.52, 0)));
    targetLook = bird.pos.clone().addScaledVector(f, 2.4).add(new THREE.Vector3(0, 0.1, 0));
    camPos.lerp(targetPos, Math.min(1, dt * 4.6)); camLook.lerp(targetLook, Math.min(1, dt * 6.5));
  } else {
    const f = new THREE.Vector3(Math.sin(bird.yaw), 0, Math.cos(bird.yaw));
    targetPos = clipCamera(bird.pos.clone().add(new THREE.Vector3(0, 0.15, 0)), bird.pos.clone().addScaledVector(f, -0.95).add(new THREE.Vector3(0, 0.42, 0)));
    targetLook = bird.pos.clone().addScaledVector(f, 1.6).add(new THREE.Vector3(0, 0.02, 0));
    camPos.lerp(targetPos, Math.min(1, dt * 5)); camLook.lerp(targetLook, Math.min(1, dt * 6));
  }
  if (camPos.y < 0.18) camPos.y = 0.18;
  camera.position.copy(camPos);
  if (shakeT > 0) {
    shakeT -= dt;
    camera.position.x += (Math.random() - 0.5) * shakeAmt * shakeT;
    camera.position.y += (Math.random() - 0.5) * shakeAmt * shakeT;
  }
  camera.lookAt(camLook);
}

/* ---------- 신고 버튼 ---------- */
let reportTarget = null;
function updateReportUI() {
  const el = document.getElementById('report');
  if (!started) { el.classList.remove('show'); return; }
  let best = null, bd = 1e9;
  people.forEach(p => {
    if (!p.alive || !p.feeder || p.reported) return;
    const d = bird.pos.distanceToSquared(p.group.position);
    if (d < bd) { bd = d; best = p; }
  });
  if (redPigeon && redPigeon.alive && !redPigeon.reported) {
    const d = bird.pos.distanceToSquared(redPigeon.group.position);
    if (d < bd) { bd = d; best = redPigeon; }
  }
  const button = document.getElementById('reportBtn');
  if (!best || bd > 12.5) { el.classList.remove('show'); reportTarget = null; button.textContent = '신고하기'; return; }
  reportTarget = best;
  button.textContent = best.type === 'redPigeon' ? '대형 비둘기 신고' : '신고하기';
  const headY = best.type === 'redPigeon' ? 0.64 : (best.sit ? 1.45 : 1.85);
  camera.updateMatrixWorld();
  const pv = best.group.position.clone().add(new THREE.Vector3(0, headY + 0.12, 0)); pv.project(camera);
  if (pv.z > 1) { el.classList.remove('show'); return; }
  const sx = (pv.x * 0.5 + 0.5) * innerWidth;
  let sy = (-pv.y * 0.5 + 0.5) * innerHeight;
  // 좌우로 시야를 벗어났으면 없음
  if (sx < 10 || sx > innerWidth - 10 || sy > innerHeight + 10) { el.classList.remove('show'); return; }
  // 너무 가까워서 머리가 화면 위로 나갔을 때만 끌어내림
  if (sy < 26) sy = 26;
  el.style.left = sx + 'px'; el.style.top = sy + 'px';
  el.classList.add('show');
}

function animate(ts) {
  requestAnimationFrame(animate);
  
  timer.update(ts);
  const dt = Math.min(0.05, timer.getDelta());
  updateLasers(dt);

  if (started) {
    readKeys();
    bird.update(dt, input);
    tryLand();
    checkGlass();
    updateStrings(dt);
    autoPeck();
    resolvePeck();
    updatePeople(dt);
    updatePolice(dt);
    updateCars(dt);
    updateFlock(dt);
    updateReportUI();
  } else {
    updatePeople(dt); updateCars(dt); updateFlock(dt);
  }
  updateRedPigeon(dt);
  updateSnackRespawn(dt);
  updateCamera(dt);
  if (!started) document.getElementById('report').classList.remove('show');
  for (let i = crumbs.length - 1; i >= 0; i--) {
    crumbs[i].t += dt;
    if (crumbs[i].t > 30) { scene.remove(crumbs[i].mesh); crumbs.splice(i, 1); }
  }
  renderer.render(scene, camera);
}

/* ---------- 개발용 슬라이더 ( ~ 키 ) ---------- */
function toggleDev() {
  const d = document.getElementById('dev');
  if (d.dataset.built !== '1') {
    d.dataset.built = '1';
    const rows = [['gravity', 4, 20], ['flapUp', 1, 6], ['flapFwd', 0, 5], ['flapCooldown', 0.1, 0.8],
      ['liftCoef', 0.01, 0.15], ['drag', 0.05, 1.2], ['align', 0.5, 9], ['yawRate', 0.5, 5], ['pitchRate', 0.4, 4]];
    d.innerHTML = rows.map(([k, a, b]) =>
      `<label>${k}<input type=range min=${a} max=${b} step=0.005 value=${FLY[k]} data-k="${k}"><span>${FLY[k]}</span></label>`).join('');
    d.addEventListener('input', e => { const k = e.target.dataset.k; FLY[k] = parseFloat(e.target.value); e.target.nextElementSibling.textContent = FLY[k]; });
  }
  d.classList.toggle('show');
}

addEventListener('load', init);