import { useEffect, useRef, memo } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ========================================================= PRIMITIVE MESH HELPERS ========================================================= */

const box = (w, h, d, m) => {
  const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)
  me.castShadow = true; me.receiveShadow = false
  return me
}

const cyl = (a, b2, h, m, s = 12) => {
  const me = new THREE.Mesh(new THREE.CylinderGeometry(a, b2, h, s), m)
  me.castShadow = true; me.receiveShadow = false
  return me
}

const sph = (r, m, s = 14) => {
  const me = new THREE.Mesh(new THREE.SphereGeometry(r, s, s), m)
  me.castShadow = true; me.receiveShadow = false
  return me
}

const tor = (r, t, m) => new THREE.Mesh(new THREE.TorusGeometry(r, t, 6, 24), m)


/* ========================================================= MATERIAL PALETTE ========================================================= */

const mkMats = () => ({
  chrome: new THREE.MeshStandardMaterial({ color: 0xcdd4e8, metalness: 0.85, roughness: 0.15 }),
  silver: new THREE.MeshStandardMaterial({ color: 0x9aa8bc, metalness: 0.80, roughness: 0.22 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x080816, metalness: 0.90, roughness: 0.20 }),
  joint: new THREE.MeshStandardMaterial({ color: 0x222234, metalness: 0.92, roughness: 0.12 }),
  glow: new THREE.MeshStandardMaterial({ color: 0xaae8ff, emissive: 0x0044ff, emissiveIntensity: 4.5, metalness: 0, roughness: 0 }),
  panel: new THREE.MeshStandardMaterial({ color: 0x0033ee, emissive: 0x001299, emissiveIntensity: 1.8, metalness: 0.5, roughness: 0.3 }),
  acc: new THREE.MeshStandardMaterial({ color: 0x88aaff, emissive: 0x2244bb, emissiveIntensity: 1.0, metalness: 0.7, roughness: 0.1 })
})


/* ========================================================= ROBOT STRUCTURE BUILDER ========================================================= */

function buildRobot(mat) {
  const root = new THREE.Group()

  /* ---------------- HEAD ---------------- */
  const head = new THREE.Group(); head.position.y = 1.68
  const skull = box(0.29, 0.31, 0.27, mat.chrome)
  const topPl = box(0.25, 0.055, 0.23, mat.silver); topPl.position.y = 0.183
  const earL = box(0.033, 0.21, 0.19, mat.dark); earL.position.x = -0.163
  const earR = box(0.033, 0.21, 0.19, mat.dark); earR.position.x = 0.163

  for (let i = -1; i <= 1; i++) {
    const vL = box(0.043, 0.025, 0.16, mat.joint); vL.position.set(-0.177, i * 0.055, 0)
    const vR = box(0.043, 0.025, 0.16, mat.joint); vR.position.set(0.177, i * 0.055, 0)
    head.add(vL, vR)
  }

  const visor = box(0.25, 0.12, 0.013, mat.dark); visor.position.set(0, 0.046, 0.141)
  const vBrd = box(0.266, 0.134, 0.010, mat.joint); vBrd.position.set(0, 0.046, 0.137)
  const eyeL = sph(0.041, mat.glow, 10); eyeL.position.set(-0.076, 0.046, 0.143)
  const eyeR = sph(0.041, mat.glow, 10); eyeR.position.set(0.076, 0.046, 0.143)
  const erL = tor(0.043, 0.009, mat.acc); erL.position.copy(eyeL.position); erL.rotation.x = Math.PI / 2
  const erR = tor(0.043, 0.009, mat.acc); erR.position.copy(eyeR.position); erR.rotation.x = Math.PI / 2
  const chin = box(0.23, 0.07, 0.16, mat.silver); chin.position.set(0, -0.121, 0.015)

  for (let i = -2; i <= 2; i++) {
    const mt = box(0.013, 0.025, 0.015, mat.acc); mt.position.set(i * 0.024, -0.099, 0.143)
    head.add(mt)
  }

  const fPan = box(0.13, 0.038, 0.014, mat.panel); fPan.position.set(0, 0.135, 0.142)
  head.add(skull, topPl, earL, earR, visor, vBrd, eyeL, eyeR, erL, erR, chin, fPan)

  /* ---------------- NECK ---------------- */
  const neckBase = box(0.20, 0.04, 0.18, mat.chrome); neckBase.position.y = 1.44
  const neck = cyl(0.078, 0.089, 0.132, mat.joint, 10); neck.position.y = 1.51
  const nkRg = tor(0.089, 0.014, mat.dark); nkRg.position.y = 1.45; nkRg.rotation.x = Math.PI / 2

  /* ---------------- TORSO ---------------- */
  const torso = new THREE.Group()
  const chest = box(0.56, 0.48, 0.28, mat.chrome); chest.position.y = 1.21
  const cSL = box(0.084, 0.46, 0.29, mat.silver); cSL.position.set(-0.322, 1.21, 0)
  const cSR = box(0.084, 0.46, 0.29, mat.silver); cSR.position.set(0.322, 1.21, 0)
  const colr = box(0.54, 0.066, 0.22, mat.dark); colr.position.set(0, 1.454, 0)
  const colF = box(0.50, 0.024, 0.018, mat.acc); colF.position.set(0, 1.470, 0.115)
  const cPan = box(0.26, 0.26, 0.021, mat.panel); cPan.position.set(0, 1.23, 0.152)
  const pGlw = box(0.185, 0.185, 0.017, mat.glow); pGlw.position.set(0, 1.23, 0.155)

  for (const y of [1.09, 1.20, 1.31, 1.42]) {
    const al = box(0.54, 0.007, 0.020, mat.acc); al.position.set(0, y, 0.153); torso.add(al)
  }

  const pecL = box(0.147, 0.147, 0.025, mat.silver); pecL.position.set(-0.156, 1.325, 0.153)
  const pecR = box(0.147, 0.147, 0.025, mat.silver); pecR.position.set(0.156, 1.325, 0.153)
  const abdo = box(0.42, 0.205, 0.235, mat.joint); abdo.position.y = 0.920

  for (let i = 0; i < 3; i++) {
    const as = box(0.40, 0.044, 0.240, mat.dark); as.position.y = 0.975 - i * 0.062; torso.add(as)
  }

  const wais = box(0.46, 0.078, 0.215, mat.silver); wais.position.y = 0.808

  /* ---------------- PELVIS ---------------- */
  const pelvisCore = box(0.26, 0.14, 0.22, mat.joint); pelvisCore.position.y = 0.710
  const hips = box(0.54, 0.158, 0.255, mat.chrome); hips.position.y = 0.710
  const hipL = box(0.107, 0.138, 0.275, mat.dark); hipL.position.set(-0.322, 0.710, 0)
  const hipR = box(0.107, 0.138, 0.275, mat.dark); hipR.position.set(0.322, 0.710, 0)

  for (let i = 0; i < 7; i++) {
    const sp2 = box(0.073, 0.072, 0.023, i % 2 === 0 ? mat.dark : mat.joint); sp2.position.set(0, 1.41 - i * 0.102, -0.154); torso.add(sp2)
  }

  torso.add(chest, cSL, cSR, colr, colF, cPan, pGlw, pecL, pecR, abdo, wais, pelvisCore, hips, hipL, hipR)


  /* ======================================================= ARM BUILDER ======================================================= */

  function mkArm(side) {
    const s = side === 'R' ? 1 : -1
    const ag = new THREE.Group(); ag.position.set(s * 0.38, 1.37, 0)

    const shS = sph(0.098, mat.joint, 12)
    const shR = tor(0.098, 0.013, mat.dark); shR.rotation.z = Math.PI / 2
    const shC = box(0.074, 0.074, 0.148, mat.chrome); shC.position.set(s * 0.042, -0.021, 0)
    ag.add(shS, shR, shC)

    const uP = new THREE.Group()
    const ua = cyl(0.073, 0.063, 0.335, mat.chrome, 12); ua.position.y = -0.178
    const uaD = box(0.045, 0.315, 0.016, mat.dark); uaD.position.set(s * 0.067, -0.178, 0)
    const uaF = box(0.053, 0.083, 0.018, mat.panel); uaF.position.set(0, -0.097, 0.070)
    const elb = sph(0.071, mat.joint, 12); elb.position.y = -0.357
    const elR = tor(0.071, 0.013, mat.acc); elR.position.y = -0.357; elR.rotation.x = Math.PI / 2
    uP.add(ua, uaD, uaF, elb, elR)

    const fP = new THREE.Group(); fP.position.y = -0.357
    const fa = cyl(0.060, 0.050, 0.295, mat.chrome, 12); fa.position.y = -0.148
    const faD = box(0.036, 0.275, 0.016, mat.silver); faD.position.set(s * 0.056, -0.148, 0)
    const faA = box(0.057, 0.067, 0.018, mat.panel); faA.position.set(0, -0.082, 0.061)
    const wr = sph(0.053, mat.joint, 10); wr.position.y = -0.297
    const wrR = tor(0.053, 0.011, mat.dark); wrR.position.y = -0.297; wrR.rotation.x = Math.PI / 2

    const hP = new THREE.Group(); hP.position.y = -0.345
    const plm = box(0.135, 0.080, 0.095, mat.chrome); plm.position.y = -0.040

    for (let f = 0; f < 4; f++) {
      const fp = new THREE.Group(); fp.position.set(-0.048 + f * 0.033, -0.083, 0)
      const s1 = box(0.023, 0.073, 0.021, mat.chrome); s1.position.y = -0.037
      const j1 = box(0.021, 0.006, 0.019, mat.dark); j1.position.y = -0.073
      const s2 = box(0.021, 0.061, 0.019, mat.silver); s2.position.y = -0.104
      const j2 = box(0.019, 0.006, 0.017, mat.dark); j2.position.y = -0.134
      const s3 = box(0.019, 0.045, 0.017, mat.chrome); s3.position.y = -0.158
      fp.add(s1, j1, s2, j2, s3); hP.add(fp)
    }

    const th = new THREE.Group(); th.position.set(s * 0.071, -0.029, 0.012); th.rotation.z = s * 0.75
    const t1 = box(0.026, 0.057, 0.024, mat.chrome); t1.position.y = -0.029
    const t2 = box(0.022, 0.045, 0.020, mat.silver); t2.position.y = -0.069
    th.add(t1, t2); hP.add(plm, th)

    fP.add(fa, faD, faA, wr, wrR, hP); uP.add(fP); ag.add(uP)
    return { ag, uP, fP }
  }


  /* ======================================================= LEG BUILDER ======================================================= */

  function mkLeg(side) {
    const s = side === 'R' ? 1 : -1
    const lg = new THREE.Group(); lg.position.set(s * 0.170, 0.628, 0)
    const hj = sph(0.085, mat.joint, 12); lg.add(hj)

    const thP = new THREE.Group()
    const th2 = cyl(0.091, 0.083, 0.415, mat.chrome, 12); th2.position.y = -0.208
    const thD = box(0.053, 0.395, 0.020, mat.dark); thD.position.set(s * 0.085, -0.208, 0)
    const thF = box(0.068, 0.115, 0.022, mat.panel); thF.position.set(0, -0.126, 0.085)
    const kn = sph(0.085, mat.joint, 12); kn.position.y = -0.425
    const knR = tor(0.085, 0.014, mat.acc); knR.position.y = -0.425; knR.rotation.x = Math.PI / 2
    thP.add(th2, thD, thF, kn, knR)

    const shP = new THREE.Group(); shP.position.y = -0.425
    const sh2 = cyl(0.077, 0.064, 0.375, mat.chrome, 12); sh2.position.y = -0.188
    const shD = box(0.046, 0.355, 0.020, mat.dark); shD.position.set(0, -0.188, -0.077)
    const ank = sph(0.063, mat.joint, 10); ank.position.y = -0.382

    const footGroup = new THREE.Group(); footGroup.position.set(s * 0.013, -0.400, 0.030)
    const ankPistonL = cyl(0.014, 0.014, 0.13, mat.joint, 8); ankPistonL.position.set(-0.045, -0.01, -0.04)
    const ankPistonR = cyl(0.014, 0.014, 0.13, mat.joint, 8); ankPistonR.position.set(0.045, -0.01, -0.04)
    footGroup.add(ankPistonL, ankPistonR)

    const ftBase = box(0.185, 0.065, 0.28, mat.chrome); ftBase.position.set(0, -0.035, 0.04)
    const ftHeel = box(0.165, 0.085, 0.12, mat.dark); ftHeel.position.set(0, -0.025, -0.08)
    const ftSideL = box(0.020, 0.055, 0.22, mat.silver); ftSideL.position.set(-0.10, -0.035, 0.03)
    const ftSideR = box(0.020, 0.055, 0.22, mat.silver); ftSideR.position.set(0.10, -0.035, 0.03)
    const toeInner = box(0.085, 0.052, 0.11, mat.silver); toeInner.position.set(-0.048, -0.040, 0.21)
    const toeOuter = box(0.085, 0.052, 0.11, mat.silver); toeOuter.position.set(0.048, -0.040, 0.21)
    const toeCapI = box(0.080, 0.032, 0.06, mat.joint); toeCapI.position.set(-0.048, -0.050, 0.28)
    const toeCapO = box(0.080, 0.032, 0.06, mat.joint); toeCapO.position.set(0.048, -0.050, 0.28)
    const soleGlow = box(0.17, 0.012, 0.36, mat.glow); soleGlow.position.set(0, -0.070, 0.08)
    const solePad = box(0.19, 0.010, 0.38, mat.dark); solePad.position.set(0, -0.078, 0.08)

    footGroup.add(ftBase, ftHeel, ftSideL, ftSideR, toeInner, toeOuter, toeCapI, toeCapO, soleGlow, solePad)
    shP.add(sh2, shD, ank, footGroup); thP.add(shP); lg.add(thP)
    return { lg }
  }

  const rArm = mkArm('R'), lArm = mkArm('L'), rLeg = mkLeg('R'), lLeg = mkLeg('L')
  torso.add(rArm.ag, lArm.ag, rLeg.lg, lLeg.lg, head, neckBase, neck, nkRg)
  root.add(torso)

  /* ---------------- HIT BOX ---------------- */
  const hitBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 1.8, 0.6),
    new THREE.MeshBasicMaterial({ visible: false })
  )
  hitBox.position.set(0, 0.9, 0); root.add(hitBox)

  return { root, torso, head, rArm, lArm, pGlw, eyeL, eyeR, hitBox }
}


/* ========================================================= HOLOGRAPHIC PANEL ========================================================= */

function mkPanel(label) {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 192
  const ctx = cv.getContext('2d')
  const tex = new THREE.CanvasTexture(cv)
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.88, 0.66),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })
  )
  return { mesh, cv, ctx, tex, label, t: Math.random() * 100 }
}

function drawPanel(p) {
  const { ctx, tex, label } = p
  p.t += 0.03; const t = p.t
  ctx.clearRect(0, 0, 256, 192)
  ctx.fillStyle = 'rgba(2,5,24,0.94)'; ctx.fillRect(0, 0, 256, 192)
  ctx.strokeStyle = 'rgba(50,110,255,0.85)'; ctx.lineWidth = 1.5; ctx.strokeRect(1.5, 1.5, 253, 189)
  ctx.strokeStyle = 'rgba(80,140,255,0.2)'; ctx.lineWidth = 4; ctx.strokeRect(3, 3, 250, 186)

  const hg = ctx.createLinearGradient(0, 0, 256, 0)
  hg.addColorStop(0, 'rgba(20,55,200,0.92)'); hg.addColorStop(1, 'rgba(10,25,120,0.6)')
  ctx.fillStyle = hg; ctx.fillRect(2, 2, 252, 24)

  ctx.fillStyle = '#99bbff'; ctx.font = 'bold 9px monospace'; ctx.fillText(label, 8, 16)
  ctx.fillStyle = 'rgba(60,200,80,0.95)'; ctx.font = '8px monospace'; ctx.fillText('● ACTIVE', 178, 16)

  for (let i = 0; i < 8; i++) {
    const bh = 12 + Math.abs(Math.sin(t * 1.3 + i * 0.85)) * 44
    const x = 8 + i * 30, bw = 22
    const bg = ctx.createLinearGradient(0, 92 - bh, 0, 92)
    bg.addColorStop(0, `rgba(${55 + i * 16},${88 + i * 11},255,0.95)`)
    bg.addColorStop(1, 'rgba(18,35,170,0.35)')
    ctx.fillStyle = bg; ctx.fillRect(x, 92 - bh, bw, bh)
    ctx.fillStyle = 'rgba(160,200,255,0.55)'; ctx.fillRect(x, 92 - bh, bw, 1)
  }

  ctx.strokeStyle = 'rgba(40,70,180,0.22)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(4, 94); ctx.lineTo(252, 94); ctx.stroke()
  ctx.beginPath(); ctx.strokeStyle = 'rgba(100,200,255,0.78)'; ctx.lineWidth = 1.4

  for (let x = 4; x < 252; x += 2) {
    const y = 122 + Math.sin((x / 252) * Math.PI * 4 + t * 1.9) * 11 + Math.sin((x / 252) * Math.PI * 9 + t * 2.5) * 5
    if (x === 4) { ctx.moveTo(x, y) } else { ctx.lineTo(x, y) }
  }
  ctx.stroke()

  ctx.font = '7.5px monospace'; ctx.fillStyle = 'rgba(100,160,255,0.82)'
  const stats = [
    `PROC  ${(79 + Math.sin(t * 1.1) * 13).toFixed(1)}%`,
    `NET   ${(50 + Math.cos(t * 0.9) * 20).toFixed(0)}MB/s`,
    `TASKS ${(Math.abs(Math.floor(t * 7)) % 999).toString().padStart(3, '0')}`,
    `MEM   ${(63 + Math.sin(t * 0.7) * 16).toFixed(1)}%`
  ]
  stats.forEach((v, i) => ctx.fillText(v, 10, 150 + i * 11))

  ctx.fillStyle = 'rgba(70,130,255,0.65)'
  const extraStats = [
    `LAT  ${(7 + Math.abs(Math.sin(t * 2.2)) * 11).toFixed(0)}ms`,
    `UPT  99.${Math.floor(80 + Math.sin(t) * 19)}%`
  ]
  extraStats.forEach((v, i) => ctx.fillText(v, 146, 150 + i * 11))

  ctx.fillStyle = 'rgba(80,140,255,0.06)'; ctx.fillRect(0, ((t * 34) % 192), 256, 2)
  tex.needsUpdate = true
}


/* ========================================================= MAIN COMPONENT ========================================================= */

function RobotSection() {
  const mountRef = useRef(null), overlayRef = useRef(null), canvasRef = useRef(null)
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 })

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    /* ===================== DEVICE SETTINGS ===================== */
    const isMobile = window.innerWidth < 768
    // Scaled down slightly on mobile to fit both comfortably
    const botX = isMobile ? 1.2 : 2.4
    const panX = isMobile ? 1.8 : 3.6
    const camZ = isMobile ? 6.5 : 5.9

    /* ===================== RENDERER ===================== */
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: !isMobile, alpha: true, powerPreference: 'high-performance' })
    renderer.setSize(mount.clientWidth, mount.clientHeight, false)
    const pixelRatio = isMobile ? Math.min(window.devicePixelRatio, 1) : Math.min(window.devicePixelRatio, 1.5)
    renderer.setPixelRatio(pixelRatio)
    
    // Disable shadows entirely on mobile to save GPU and prevent context loss
    renderer.shadowMap.enabled = !isMobile
    if (!isMobile) renderer.shadowMap.type = THREE.PCFShadowMap
    
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.3
    renderer.setClearColor(0x000000, 0)

    /* ===================== SCENE & CAMERA ===================== */
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000008, 0.034)

    const camera = new THREE.PerspectiveCamera(44, mount.clientWidth / mount.clientHeight, 0.1, 200)
    camera.position.set(0, 0.28, camZ)
    camera.lookAt(0, 1.26, 0)

    /* ===================== LIGHTING ===================== */
    scene.add(new THREE.AmbientLight(0xffffff, isMobile ? 1.1 : 0.90))

    const key = new THREE.DirectionalLight(0xffffff, isMobile ? 2.5 : 3.8)
    key.position.set(2, 7, 6)
    if (!isMobile) {
        key.castShadow = true
        key.shadow.mapSize.set(512, 512)
        key.shadow.camera.left = -7; key.shadow.camera.right = 7; key.shadow.camera.top = 9; key.shadow.camera.bottom = -2
    }
    scene.add(key)

    // Skip heavy extra lights on mobile
    if (!isMobile) {
        const fill = new THREE.DirectionalLight(0x8899cc, 1.6); fill.position.set(-5, 4, 3); scene.add(fill)
        const rim = new THREE.DirectionalLight(0xffffff, 2.2); rim.position.set(0, 6, -6); scene.add(rim)
        const und = new THREE.DirectionalLight(0x2244ff, 0.8); und.position.set(0, -2, 3); scene.add(und)
    }

    /* ===================== SPOTLIGHTS ===================== */
    const mkSpot = (x) => {
      const s = new THREE.SpotLight(0x8899ff, 0, 18, Math.PI / 7.5, 0.55, 1.3)
      s.position.set(x, 9, 1.5); s.target.position.set(x, 0, 0)
      scene.add(s, s.target); return s
    }
    const spotL = mkSpot(-botX), spotR = mkSpot(botX)
    const eyePtL = new THREE.PointLight(0x55aaff, 0, 1.6), eyePtR = new THREE.PointLight(0x55aaff, 0, 1.6)
    scene.add(eyePtL, eyePtR)

    /* ===================== FLOOR ===================== */
    const floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 26),
      new THREE.MeshPhysicalMaterial({ color: 0x030310, metalness: 1, roughness: 0.015, clearcoat: 1, clearcoatRoughness: 0.04 })
    )
    floorMesh.rotation.x = -Math.PI / 2; floorMesh.receiveShadow = !isMobile; scene.add(floorMesh)
    if (!isMobile) scene.add(new THREE.GridHelper(20, 40, 0x101030, 0x080820))

    /* ===================== LIGHT BEAMS ===================== */
    const mkBeam = (x) => {
      const geo = new THREE.CylinderGeometry(0.03, 0.62, 9, 16, 1, true)
      geo.translate(0, -4.5, 0)
      const m2 = new THREE.MeshBasicMaterial({ color: 0x5577ff, transparent: true, opacity: 0, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending })
      const mesh = new THREE.Mesh(geo, m2); mesh.position.set(x, 9, 1.5); scene.add(mesh); return mesh
    }
    const beamL = mkBeam(-botX), beamR = mkBeam(botX)

    /* ===================== MATRIX / RAIN BACKGROUND ===================== */
    let rTex
    let updateRain = () => {} // Defined as no-op by default to prevent scoping issues

    if (!isMobile) {
      const rainCv = document.createElement('canvas'); rainCv.width = 256; rainCv.height = 256
      const rCtx = rainCv.getContext('2d')
      rTex = new THREE.CanvasTexture(rainCv)
      rTex.generateMipmaps = false
      rTex.minFilter = THREE.LinearFilter
      const bgPl = new THREE.Mesh(
        new THREE.PlaneGeometry(24, 14),
        new THREE.MeshBasicMaterial({ map: rTex, transparent: true, opacity: 0.14, depthWrite: false, blending: THREE.AdditiveBlending })
      )
      bgPl.position.set(0, 4.8, -7); scene.add(bgPl)

      const drops = Array.from({ length: 24 }, () => Math.random() * 30)
      const rChars = '01ABCDEF!@#%^01101'.split('')
      let rFrame = 0

      updateRain = () => {
        rFrame++
        if (rFrame % 5 !== 0) return
        rCtx.fillStyle = 'rgba(0,0,6,0.08)'; rCtx.fillRect(0, 0, 256, 256)
        drops.forEach((y, i) => {
          rCtx.font = '10px monospace'
          rCtx.fillStyle = `rgba(38,78,255,${0.3 + Math.random() * 0.4})`
          rCtx.fillText(rChars[Math.floor(Math.random() * rChars.length)], i * 11 + 1, y * 11)
          if (y * 11 > 256 && Math.random() > 0.96) { drops[i] = 0 } else { drops[i] += 0.55 }
        })
        rTex.needsUpdate = true
      }
    }

    /* ===================== HOLOGRAPHIC PANELS ===================== */
    const panL = mkPanel('AGENT_01 ░ STATUS'), panR = mkPanel('AGENT_02 ░ STATUS')
    panL.mesh.position.set(-panX, 1.44, 0.8); panL.mesh.rotation.y = 0.42
    panR.mesh.position.set(panX, 1.44, 0.8); panR.mesh.rotation.y = -0.42
    scene.add(panL.mesh, panR.mesh)

    /* ===================== ROBOTS ===================== */
    const mats = mkMats()
    const botL = buildRobot(mats), botR = buildRobot(mats)
    botL.root.scale.setScalar(isMobile ? 0.9 : 1.18); botR.root.scale.setScalar(isMobile ? 0.9 : 1.18)

    const restPose = (bot) => {
      bot.rArm.uP.rotation.set(0.06, 0, 0.18); bot.rArm.fP.rotation.set(0.12, 0, 0)
      bot.lArm.uP.rotation.set(0.06, 0, -0.18); bot.lArm.fP.rotation.set(0.12, 0, 0)
    }
    restPose(botL); restPose(botR)

    botL.root.position.set(-botX, 9.5, 0); botL.root.rotation.y = 0.12
    botR.root.position.set(botX, 9.5, 0); botR.root.rotation.y = -0.12
    scene.add(botL.root, botR.root)

    /* ===================== ENTRANCE TIMELINE ===================== */
    let tl
    const ctx = gsap.context(() => {
      tl = gsap.timeline({ paused: true })
      const ss = { i: 0, b: 0, eI: 0 }

      tl.to(botL.root.position, { y: 0.37, duration: 1.6, ease: 'power2.in' }, 0)
      tl.to(botR.root.position, { y: 0.37, duration: 1.6, ease: 'power2.in' }, 0.18)
      tl.to(botL.root.position, { y: 0.33, duration: 0.35, ease: 'back.out(2.2)' }, 1.60)
      tl.to(botR.root.position, { y: 0.33, duration: 0.35, ease: 'back.out(2.2)' }, 1.78)
      tl.to(botL.root.scale, { x: 1.0, y: 0.95, z: 1.0, duration: 0.14, ease: 'power2.out' }, 1.60)
      tl.to(botL.root.scale, { x: isMobile ? 0.9 : 1.18, y: isMobile ? 0.9 : 1.18, z: isMobile ? 0.9 : 1.18, duration: 0.30, ease: 'elastic.out(1,0.5)' }, 1.74)
      tl.to(botR.root.scale, { x: 1.0, y: 0.95, z: 1.0, duration: 0.14, ease: 'power2.out' }, 1.78)
      tl.to(botR.root.scale, { x: isMobile ? 0.9 : 1.18, y: isMobile ? 0.9 : 1.18, z: isMobile ? 0.9 : 1.18, duration: 0.30, ease: 'elastic.out(1,0.5)' }, 1.92)

      tl.to(ss, {
        i: 5.5, b: 0.078, eI: 1.3, duration: 0.5, ease: 'power2.out',
        onUpdate: () => {
          spotL.intensity = ss.i; spotR.intensity = ss.i
          beamL.material.opacity = ss.b; beamR.material.opacity = ss.b
          eyePtL.intensity = ss.eI; eyePtR.intensity = ss.eI
        }
      }, 1.50)

      tl.to(botL.torso.rotation, { x: 0.12, y: 0.28, duration: 1.0, ease: 'power3.out' }, 2.4)
      tl.to(botL.head.rotation, { x: -0.04, y: -0.25, duration: 1.0, ease: 'power3.out' }, 2.4)
      tl.to(botL.rArm.uP.rotation, { x: -0.45, y: 0.35, z: 0.25, duration: 0.9, ease: 'power3.out' }, 2.5)
      tl.to(botL.rArm.fP.rotation, { x: -0.85, y: -0.20, z: 0.10, duration: 0.85, ease: 'power3.out' }, 2.6)
      tl.to(botL.lArm.uP.rotation, { x: -0.10, y: 0.05, z: -0.15, duration: 0.9, ease: 'power3.out' }, 2.5)
      tl.to(botL.lArm.fP.rotation, { x: -0.25, y: 0.0, z: -0.05, duration: 0.85, ease: 'power3.out' }, 2.6)
      tl.to(botR.torso.rotation, { x: 0.10, y: -0.26, duration: 1.0, ease: 'power3.out' }, 2.4)
      tl.to(botR.head.rotation, { x: -0.04, y: 0.25, duration: 1.0, ease: 'power3.out' }, 2.4)
      tl.to(botR.lArm.uP.rotation, { x: -0.42, y: -0.32, z: -0.22, duration: 0.9, ease: 'power3.out' }, 2.5)
      tl.to(botR.lArm.fP.rotation, { x: -0.82, y: 0.18, z: -0.08, duration: 0.85, ease: 'power3.out' }, 2.6)
      tl.to(botR.rArm.uP.rotation, { x: -0.08, y: -0.05, z: 0.15, duration: 0.9, ease: 'power3.out' }, 2.5)
      tl.to(botR.rArm.fP.rotation, { x: -0.22, y: 0.0, z: 0.05, duration: 0.85, ease: 'power3.out' }, 2.6)
      tl.to(panL.mesh.material, { opacity: 0.90, duration: 1.0, ease: 'power2.out' }, 3.2)
      tl.to(panR.mesh.material, { opacity: 0.90, duration: 1.0, ease: 'power2.out' }, 3.4)

      /* ===================== SCROLL TRIGGER ===================== */
      ScrollTrigger.create({ trigger: mount, start: 'top 80%', once: true, onEnter: () => tl.play() })
    })

    /* ===================== MOUSE / RAYCASTING ===================== */
    const raycaster = new THREE.Raycaster()
    const mouseVec = new THREE.Vector2()

    const onMouse = (e) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.current.tx = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.ty = -(e.clientY / window.innerHeight - 0.5) * 2
      mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    }

    /* ===================== CLICK WAVE ===================== */
    const triggerWave = (bot, isLeft) => {
      ctx.add(() => {
        const arm = isLeft ? bot.rArm : bot.lArm
        const s = isLeft ? 1 : -1
        gsap.to(arm.uP.rotation, { x: -1.2, y: s * 0.2, z: s * 0.4, duration: 0.35, ease: 'back.out(1.7)' })
        gsap.to(arm.fP.rotation, { x: -0.6, y: s * 0.5, z: s * 0.2, duration: 0.35, ease: 'back.out(1.7)' })
        gsap.to(bot.pGlw.scale, { x: 1.4, y: 1.4, duration: 0.2, yoyo: true, repeat: 1 })
        gsap.to(arm.uP.rotation, { x: -0.45, y: s * 0.35, z: s * 0.25, duration: 0.6, delay: 0.6, ease: 'power2.out' })
        gsap.to(arm.fP.rotation, { x: -0.85, y: -s * 0.20, z: s * 0.10, duration: 0.6, delay: 0.6, ease: 'power2.out' })
      })
    }

    const onClick = () => {
      raycaster.setFromCamera(mouseVec, camera)
      const hits = raycaster.intersectObjects([botL.hitBox, botR.hitBox])
      if (hits.length > 0) {
        if (hits[0].object === botL.hitBox) triggerWave(botL, true)
        if (hits[0].object === botR.hitBox) triggerWave(botR, false)
      }
    }

    if (!isMobile) {
      window.addEventListener('mousemove', onMouse, { passive: true })
      renderer.domElement.addEventListener('click', onClick)
    }

    /* ===================== VISIBILITY OPTIMIZATION ===================== */
    let sectionVisible = true
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => { sectionVisible = entry.isIntersecting },
      { root: null, rootMargin: '500px 0px' }
    )
    visibilityObserver.observe(mount)

    /* ===================== ANIMATION LOOP ===================== */
    let t = 0, rafId, panFrame = 0
    const cameraTarget = new THREE.Vector3(0, 1.26, 0)

    const animate = () => {
      rafId = requestAnimationFrame(animate)
      if (!sectionVisible) return
      t += 0.01
      const prog = tl.progress()

      if (!isMobile) {
        mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.05
        mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.05
        const mx = mouse.current.x, my = mouse.current.y
        camera.position.x = mx * 0.5
        camera.position.y = 0.28 + my * 0.25
        if (overlayRef.current) {
          overlayRef.current.style.transform = `translate(-50%, -50%) perspective(1000px) rotateX(${-my * 6}deg) rotateY(${mx * 6}deg)`
        }
        if (prog > 0.85) {
          botL.head.rotation.y += ((-0.25 + mx * 0.22) - botL.head.rotation.y) * 0.06
          botL.head.rotation.x += ((-0.04 + my * 0.12) - botL.head.rotation.x) * 0.06
          botR.head.rotation.y += ((0.25 + mx * 0.22) - botR.head.rotation.y) * 0.06
          botR.head.rotation.x += ((-0.04 + my * 0.12) - botR.head.rotation.x) * 0.06
        }
      } else {
        camera.position.x = 0
        camera.position.y = 0.28
        if (overlayRef.current) {
          overlayRef.current.style.transform = 'translate(-50%, -50%)'
        }
      }
      camera.lookAt(cameraTarget)

      const br = Math.sin(t * 0.90) * 0.008
      botL.torso.position.y = br
      botR.torso.position.y = br

      eyePtL.position.set(botL.root.position.x, botL.root.position.y + 1.75, 0.80)
      eyePtR.position.set(botR.root.position.x, botR.root.position.y + 1.75, 0.80)

      if (prog > 0.3) {
        panFrame++
        const panFreq = isMobile ? 6 : 4;
        if (panFrame % panFreq === 0) { 
            drawPanel(panL)
            drawPanel(panR)
        }
        if (!isMobile) updateRain()
      }
      renderer.render(scene, camera)
    }
    animate()

    /* ===================== RESIZE ===================== */
    let resizeRaf = null
    const onResize = () => {
      if (resizeRaf) return
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null
        if (!mount) return
        const w = mount.clientWidth, h = mount.clientHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h, false)
      })
    }
    window.addEventListener('resize', onResize, { passive: true })

    /* ===================== CLEANUP ===================== */
    return () => {
      cancelAnimationFrame(rafId)
      if (resizeRaf) cancelAnimationFrame(resizeRaf)
      visibilityObserver.disconnect()
      window.removeEventListener('mousemove', onMouse)
      renderer.domElement.removeEventListener('click', onClick)
      window.removeEventListener('resize', onResize)
      ctx.revert()

      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => {
            if (material.map) material.map.dispose()
            material.dispose()
          })
        }
      })
      if (rTex) rTex.dispose()
      renderer.dispose()
    }
  }, [])

  /* ===================== JSX ===================== */
  const handleScrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.65, behavior: 'smooth' })
  }

  return (
    <>
      <section className="robot-section" id="robots">
        <div ref={mountRef} className="robot-canvas" role="img" aria-label="Two AI robots welcoming visitors with animated holographic displays">
          <canvas ref={canvasRef} />
        </div>

        <div className="robot-overlay" ref={overlayRef}>
          <p className="robot-eyebrow" data-fade>built different</p>
          <h2 className="robot-h" data-fade data-delay="0.1">Welcome to the future<br />of development.</h2>
          <p className="robot-sub" data-fade data-delay="0.2">Agentic systems that think. Automations that run themselves.<br />Code that doesn't need babysitting.</p>
        </div>

        <div className="robot-scroll-hint" onClick={handleScrollDown} role="button" tabIndex={0} style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
          <span>scroll</span>
          <div className="robot-scroll-line" />
        </div>
      </section>
    </>
  )
}

export default memo(RobotSection)