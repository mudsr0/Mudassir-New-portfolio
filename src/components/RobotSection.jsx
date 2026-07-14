import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* ─── helpers ──────────────────────────────────────────────── */
const box = (w,h,d,m) => { const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m.clone()); me.castShadow=true; return me }
const cyl = (a,b2,h,m,s=12) => { const me=new THREE.Mesh(new THREE.CylinderGeometry(a,b2,h,s),m.clone()); me.castShadow=true; return me }
const sph = (r,m,s=14) => { const me=new THREE.Mesh(new THREE.SphereGeometry(r,s,s),m.clone()); me.castShadow=true; return me }
const tor = (r,t,m) => new THREE.Mesh(new THREE.TorusGeometry(r,t,6,24),m.clone())

/* ─── materials ────────────────────────────────────────────── */
const mkMats = () => ({
  chrome: new THREE.MeshStandardMaterial({color:0xcdd4e8,metalness:0.82,roughness:0.13}),
  silver: new THREE.MeshStandardMaterial({color:0x9aa8bc,metalness:0.80,roughness:0.22}),
  dark:   new THREE.MeshStandardMaterial({color:0x04040e,metalness:0.95,roughness:0.14}),
  joint:  new THREE.MeshStandardMaterial({color:0x28283c,metalness:0.92,roughness:0.10}),
  glow:   new THREE.MeshStandardMaterial({color:0xaae8ff,emissive:0x0044ff,emissiveIntensity:5,metalness:0,roughness:0}),
  panel:  new THREE.MeshStandardMaterial({color:0x0033ee,emissive:0x001299,emissiveIntensity:1.8,metalness:0.5,roughness:0.3}),
  acc:    new THREE.MeshStandardMaterial({color:0x88aaff,emissive:0x2244bb,emissiveIntensity:1.0,metalness:0.7,roughness:0.1}),
})

/* ─── robot ────────────────────────────────────────────────── */
function buildRobot(mat) {
  const root = new THREE.Group()

  /* HEAD */
  const head = new THREE.Group()
  head.position.y = 1.66
  const skull = box(0.29,0.31,0.27,mat.chrome)
  const topPl = box(0.25,0.055,0.23,mat.silver); topPl.position.y=0.183
  const earL  = box(0.033,0.21,0.19,mat.dark);   earL.position.x=-0.163
  const earR  = box(0.033,0.21,0.19,mat.dark);   earR.position.x= 0.163
  for(let i=-1;i<=1;i++){
    const vL=box(0.043,0.025,0.16,mat.joint); vL.position.set(-0.177,i*0.055,0); head.add(vL)
    const vR=box(0.043,0.025,0.16,mat.joint); vR.position.set( 0.177,i*0.055,0); head.add(vR)
  }
  const visor = box(0.25,0.12,0.013,mat.dark);  visor.position.set(0,0.046,0.141)
  const vBrd  = box(0.266,0.134,0.010,mat.joint); vBrd.position.set(0,0.046,0.137)
  const eyeL  = sph(0.041,mat.glow,10);           eyeL.position.set(-0.076,0.046,0.143)
  const eyeR  = sph(0.041,mat.glow,10);           eyeR.position.set( 0.076,0.046,0.143)
  const erL   = tor(0.043,0.009,mat.acc); erL.position.copy(eyeL.position); erL.rotation.x=Math.PI/2
  const erR   = tor(0.043,0.009,mat.acc); erR.position.copy(eyeR.position); erR.rotation.x=Math.PI/2
  const chin  = box(0.23,0.07,0.16,mat.silver);   chin.position.set(0,-0.121,0.015)
  for(let i=-2;i<=2;i++){const mt=box(0.013,0.025,0.015,mat.acc);mt.position.set(i*0.024,-0.099,0.143);head.add(mt)}
  const fPan  = box(0.13,0.038,0.014,mat.panel);  fPan.position.set(0,0.135,0.142)
  head.add(skull,topPl,earL,earR,visor,vBrd,eyeL,eyeR,erL,erR,chin,fPan)

  const neck  = cyl(0.078,0.089,0.132,mat.joint,10); neck.position.y=1.502
  const nkRg  = tor(0.089,0.014,mat.dark); nkRg.position.y=1.432; nkRg.rotation.x=Math.PI/2

  /* TORSO */
  const torso = new THREE.Group()
  const chest  = box(0.56,0.48,0.28,mat.chrome); chest.position.y=1.21
  const cSL    = box(0.084,0.46,0.29,mat.silver); cSL.position.set(-0.322,1.21,0)
  const cSR    = box(0.084,0.46,0.29,mat.silver); cSR.position.set( 0.322,1.21,0)
  const colr   = box(0.54,0.066,0.22,mat.dark);   colr.position.set(0,1.454,0)
  const colF   = box(0.50,0.024,0.018,mat.acc);   colF.position.set(0,1.470,0.115)
  const cPan   = box(0.26,0.26,0.021,mat.panel);  cPan.position.set(0,1.23,0.152)
  const pGlw   = box(0.185,0.185,0.017,mat.glow)
  pGlw.material = new THREE.MeshStandardMaterial({color:0xbbdeff,emissive:0x1133ff,emissiveIntensity:1.6,transparent:true,opacity:0.82})
  pGlw.position.set(0,1.23,0.155)
  for(let y of[1.09,1.20,1.31,1.42]){const al=box(0.54,0.007,0.020,mat.acc);al.position.set(0,y,0.153);torso.add(al)}
  const pecL  = box(0.147,0.147,0.025,mat.silver); pecL.position.set(-0.156,1.325,0.153)
  const pecR  = box(0.147,0.147,0.025,mat.silver); pecR.position.set( 0.156,1.325,0.153)
  const abdo  = box(0.42,0.205,0.235,mat.joint); abdo.position.y=0.920
  for(let i=0;i<3;i++){const as=box(0.40,0.044,0.240,mat.dark);as.position.y=0.975-i*0.062;torso.add(as)}
  const wais  = box(0.46,0.078,0.215,mat.silver); wais.position.y=0.808
  const hips  = box(0.54,0.158,0.255,mat.chrome); hips.position.y=0.710
  const hipL  = box(0.107,0.138,0.275,mat.dark);  hipL.position.set(-0.322,0.710,0)
  const hipR  = box(0.107,0.138,0.275,mat.dark);  hipR.position.set( 0.322,0.710,0)
  for(let i=0;i<7;i++){const sp2=box(0.073,0.072,0.023,i%2===0?mat.dark:mat.joint);sp2.position.set(0,1.41-i*0.102,-0.154);torso.add(sp2)}
  torso.add(chest,cSL,cSR,colr,colF,cPan,pGlw,pecL,pecR,abdo,wais,hips,hipL,hipR)

  /* ARM builder */
  function mkArm(side) {
    const s   = side==='R' ? 1 : -1
    const ag  = new THREE.Group()
    ag.position.set(s*0.365, 1.37, 0)

    const shS = sph(0.098,mat.joint,12); ag.add(shS)
    const shR = tor(0.098,0.013,mat.dark); shR.rotation.z=Math.PI/2; ag.add(shR)
    const shC = box(0.074,0.074,0.148,mat.chrome); shC.position.set(s*0.042,-0.021,0); ag.add(shC)

    /* upper arm pivot */
    const uP  = new THREE.Group()
    const ua  = cyl(0.073,0.063,0.335,mat.chrome,12); ua.position.y=-0.178
    const uaD = box(0.045,0.315,0.016,mat.dark); uaD.position.set(s*0.067,-0.178,0)
    const uaF = box(0.053,0.083,0.018,mat.panel); uaF.position.set(0,-0.097,0.070)
    const elb = sph(0.071,mat.joint,12); elb.position.y=-0.357
    const elR = tor(0.071,0.013,mat.acc); elR.position.y=-0.357; elR.rotation.x=Math.PI/2
    uP.add(ua,uaD,uaF,elb,elR)

    /* forearm pivot */
    const fP  = new THREE.Group()
    fP.position.y = -0.357
    const fa  = cyl(0.060,0.050,0.295,mat.chrome,12); fa.position.y=-0.148
    const faD = box(0.036,0.275,0.016,mat.silver); faD.position.set(s*0.056,-0.148,0)
    const faA = box(0.057,0.067,0.018,mat.panel);  faA.position.set(0,-0.082,0.061)
    const wr  = sph(0.053,mat.joint,10); wr.position.y=-0.297
    const wrR = tor(0.053,0.011,mat.dark); wrR.position.y=-0.297; wrR.rotation.x=Math.PI/2

    /* hand */
    const hP  = new THREE.Group()
    hP.position.y = -0.345
    const plm = box(0.135,0.080,0.095,mat.chrome); plm.position.y=-0.040

    /* fingers — explicit positions, no Object.assign */
    for(let f=0;f<4;f++){
      const fp = new THREE.Group()
      fp.position.set(-0.048+f*0.033, -0.083, 0)
      const s1=box(0.023,0.073,0.021,mat.chrome); s1.position.y=-0.037
      const j1=box(0.021,0.006,0.019,mat.dark);   j1.position.y=-0.073
      const s2=box(0.021,0.061,0.019,mat.silver);  s2.position.y=-0.104
      const j2=box(0.019,0.006,0.017,mat.dark);   j2.position.y=-0.134
      const s3=box(0.019,0.045,0.017,mat.chrome);  s3.position.y=-0.158
      fp.add(s1,j1,s2,j2,s3)
      hP.add(fp)
    }
    /* thumb */
    const th = new THREE.Group()
    th.position.set(s*0.071,-0.029,0.012)
    th.rotation.z = s*0.75
    const t1 = box(0.026,0.057,0.024,mat.chrome); t1.position.y=-0.029
    const t2 = box(0.022,0.045,0.020,mat.silver);  t2.position.y=-0.069
    th.add(t1,t2)
    hP.add(plm,th)

    fP.add(fa,faD,faA,wr,wrR,hP)
    uP.add(fP)
    ag.add(uP)
    return {ag,uP,fP}
  }

  /* LEG builder */
  function mkLeg(side) {
    const s  = side==='R' ? 1 : -1
    const lg = new THREE.Group()
    lg.position.set(s*0.170, 0.628, 0)
    const hj = sph(0.085,mat.joint,12); lg.add(hj)

    const thP = new THREE.Group()
    const th2 = cyl(0.091,0.083,0.415,mat.chrome,12); th2.position.y=-0.208
    const thD = box(0.053,0.395,0.020,mat.dark); thD.position.set(s*0.085,-0.208,0)
    const thF = box(0.068,0.115,0.022,mat.panel); thF.position.set(0,-0.126,0.085)
    const kn  = sph(0.085,mat.joint,12); kn.position.y=-0.425
    const knR = tor(0.085,0.014,mat.acc); knR.position.y=-0.425; knR.rotation.x=Math.PI/2
    thP.add(th2,thD,thF,kn,knR)

    const shP = new THREE.Group()
    shP.position.y = -0.425
    const sh2 = cyl(0.077,0.064,0.375,mat.chrome,12); sh2.position.y=-0.188
    const shD = box(0.046,0.355,0.020,mat.dark);      shD.position.set(0,-0.188,-0.077)
    const ank = sph(0.063,mat.joint,10);               ank.position.y=-0.382
    const ft  = box(0.178,0.079,0.308,mat.chrome);    ft.position.set(s*0.013,-0.430,0.063)
    const ftS = box(0.154,0.021,0.288,mat.dark);      ftS.position.set(s*0.013,-0.474,0.063)
    const ftT = box(0.136,0.058,0.068,mat.silver);    ftT.position.set(s*0.013,-0.430,0.218)
    shP.add(sh2,shD,ank,ft,ftS,ftT)

    thP.add(shP)
    lg.add(thP)
    return {lg}
  }

  const rArm = mkArm('R')
  const lArm = mkArm('L')
  const rLeg = mkLeg('R')
  const lLeg = mkLeg('L')
  torso.add(rArm.ag,lArm.ag,rLeg.lg,lLeg.lg,head,neck,nkRg)
  root.add(torso)
  return {root,torso,head,rArm,lArm,eyeL,eyeR}
}

/* ─── holo panel canvas ───────────────────────────────────── */
function mkPanel(label) {
  const cv=document.createElement('canvas'); cv.width=256; cv.height=192
  const ctx=cv.getContext('2d'), tex=new THREE.CanvasTexture(cv)
  const mesh=new THREE.Mesh(
    new THREE.PlaneGeometry(0.88,0.66),
    new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending})
  )
  return {mesh,cv,ctx,tex,label,t:Math.random()*100}
}

function drawPanel(p) {
  const {ctx,tex,label} = p; p.t+=0.03
  const t = p.t
  ctx.clearRect(0,0,256,192)
  ctx.fillStyle='rgba(2,5,24,0.94)'; ctx.fillRect(0,0,256,192)
  ctx.strokeStyle='rgba(50,110,255,0.85)'; ctx.lineWidth=1.5; ctx.strokeRect(1.5,1.5,253,189)
  ctx.strokeStyle='rgba(80,140,255,0.2)';  ctx.lineWidth=4;   ctx.strokeRect(3,3,250,186)
  const hg=ctx.createLinearGradient(0,0,256,0)
  hg.addColorStop(0,'rgba(20,55,200,0.92)'); hg.addColorStop(1,'rgba(10,25,120,0.6)')
  ctx.fillStyle=hg; ctx.fillRect(2,2,252,24)
  ctx.fillStyle='#99bbff'; ctx.font='bold 9px monospace'; ctx.fillText(label,8,16)
  ctx.fillStyle='rgba(60,200,80,0.95)'; ctx.font='8px monospace'; ctx.fillText('● ACTIVE',178,16)
  for(let i=0;i<8;i++){
    const bh=12+Math.abs(Math.sin(t*1.3+i*0.85))*44
    const x=8+i*30, bw=22
    const bg=ctx.createLinearGradient(0,92-bh,0,92)
    bg.addColorStop(0,`rgba(${55+i*16},${88+i*11},255,0.95)`)
    bg.addColorStop(1,'rgba(18,35,170,0.35)')
    ctx.fillStyle=bg; ctx.fillRect(x,92-bh,bw,bh)
    ctx.fillStyle='rgba(160,200,255,0.55)'; ctx.fillRect(x,92-bh,bw,1)
  }
  for(let y=94;y<=94;y+=6){ctx.strokeStyle='rgba(40,70,180,0.22)';ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(4,y);ctx.lineTo(252,y);ctx.stroke()}
  ctx.beginPath(); ctx.strokeStyle='rgba(100,200,255,0.78)'; ctx.lineWidth=1.4
  for(let x=4;x<252;x+=2){
    const y=122+Math.sin((x/252)*Math.PI*4+t*1.9)*11+Math.sin((x/252)*Math.PI*9+t*2.5)*5
    x===4?ctx.moveTo(x,y):ctx.lineTo(x,y)
  }; ctx.stroke()
  ctx.font='7.5px monospace'; ctx.fillStyle='rgba(100,160,255,0.82)'
  ;[`PROC  ${(79+Math.sin(t*1.1)*13).toFixed(1)}%`,`NET   ${(50+Math.cos(t*0.9)*20).toFixed(0)}MB/s`,
    `TASKS ${(Math.abs(Math.floor(t*7))%999).toString().padStart(3,'0')}`,`MEM   ${(63+Math.sin(t*0.7)*16).toFixed(1)}%`
  ].forEach((v,i)=>ctx.fillText(v,10,150+i*11))
  ctx.fillStyle='rgba(70,130,255,0.65)'
  ;[`LAT  ${(7+Math.abs(Math.sin(t*2.2))*11).toFixed(0)}ms`,`UPT  99.${Math.floor(80+Math.sin(t)*19)}%`
  ].forEach((v,i)=>ctx.fillText(v,146,150+i*11))
  ctx.fillStyle='rgba(80,140,255,0.06)'; ctx.fillRect(0,((t*34)%192),256,2)
  tex.needsUpdate=true
}

/* ─── main component ──────────────────────────────────────── */
export default function RobotSection() {
  const mountRef = useRef(null)
  const mouse    = useRef({x:0,y:0,tx:0,ty:0})

  useEffect(()=>{
    const mount=mountRef.current; if(!mount) return
    const W=window.innerWidth, H=Math.round(window.innerHeight*0.84)

    /* renderer */
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'})
    renderer.setSize(W,H); renderer.setPixelRatio(Math.min(devicePixelRatio,2))
    renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap
    renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.3
    renderer.setClearColor(0x000000,0)
    mount.appendChild(renderer.domElement)
    renderer.domElement.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none'

    /* scene / camera — low angle */
    const scene=new THREE.Scene()
    scene.fog=new THREE.FogExp2(0x000008,0.034)
    const camera=new THREE.PerspectiveCamera(44,W/H,0.1,200)
    camera.position.set(0,0.28,5.9); camera.lookAt(0,1.26,0)

    /* lights */
    scene.add(new THREE.AmbientLight(0xffffff,0.90))
    const key=new THREE.DirectionalLight(0xffffff,3.8); key.position.set(2,7,6)
    key.castShadow=true; key.shadow.mapSize.set(2048,2048)
    key.shadow.camera.left=-7; key.shadow.camera.right=7
    key.shadow.camera.top=9;   key.shadow.camera.bottom=-2
    scene.add(key)
    const fill=new THREE.DirectionalLight(0x8899cc,1.6); fill.position.set(-5,4,3); scene.add(fill)
    const rim =new THREE.DirectionalLight(0xffffff,2.2); rim.position.set(0,6,-6);  scene.add(rim)
    const und =new THREE.DirectionalLight(0x2244ff,0.8); und.position.set(0,-2,3);  scene.add(und)

    const mkSpot=(x)=>{
      const s=new THREE.SpotLight(0x8899ff,0,18,Math.PI/7.5,0.55,1.3)
      s.position.set(x,9,1.5); s.target.position.set(x,0,0)
      scene.add(s,s.target); return s
    }
    const spotL=mkSpot(-2.4), spotR=mkSpot(2.4)
    const eyePtL=new THREE.PointLight(0x55aaff,0,1.6); scene.add(eyePtL)
    const eyePtR=new THREE.PointLight(0x55aaff,0,1.6); scene.add(eyePtR)
    const flGL=new THREE.PointLight(0x1133ff,2.2,3.2); flGL.position.set(-2.4,0.05,0); scene.add(flGL)
    const flGR=new THREE.PointLight(0x1133ff,2.2,3.2); flGR.position.set( 2.4,0.05,0); scene.add(flGR)

    /* reflective floor */
    const floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(26,26),
      new THREE.MeshPhysicalMaterial({color:0x030310,metalness:1,roughness:0.015,clearcoat:1,clearcoatRoughness:0.04})
    )
    floorMesh.rotation.x = -Math.PI/2
    floorMesh.receiveShadow = true
    scene.add(floorMesh)
    scene.add(new THREE.GridHelper(20,40,0x101030,0x080820))

    /* spotlight beam cones */
    const mkBeam=(x)=>{
      const geo=new THREE.CylinderGeometry(0.03,0.62,9,22,1,true)
      geo.translate(0,-4.5,0)
      const m2=new THREE.MeshBasicMaterial({color:0x5577ff,transparent:true,opacity:0,side:THREE.BackSide,depthWrite:false,blending:THREE.AdditiveBlending})
      const mesh=new THREE.Mesh(geo,m2); mesh.position.set(x,9,1.5); scene.add(mesh); return mesh
    }
    const beamL=mkBeam(-2.4), beamR=mkBeam(2.4)

    /* matrix rain background */
    const rainCv=document.createElement('canvas'); rainCv.width=512; rainCv.height=512
    const rCtx=rainCv.getContext('2d'), rTex=new THREE.CanvasTexture(rainCv)
    const bgPl=new THREE.Mesh(
      new THREE.PlaneGeometry(24,14),
      new THREE.MeshBasicMaterial({map:rTex,transparent:true,opacity:0.14,depthWrite:false,blending:THREE.AdditiveBlending})
    )
    bgPl.position.set(0,4.8,-7); scene.add(bgPl)
    const drops=Array.from({length:36},()=>Math.random()*45)
    const rChars='01アイウABCDEF!@#%^01101'.split('')
    let rFrame=0

    const updateRain=()=>{
      rFrame++; if(rFrame%3!==0) return
      rCtx.fillStyle='rgba(0,0,6,0.054)'; rCtx.fillRect(0,0,512,512)
      drops.forEach((y,i)=>{
        rCtx.font=`${11+Math.floor(Math.random()*3)}px monospace`
        rCtx.fillStyle=`rgba(38,78,255,${0.22+Math.random()*0.42})`
        rCtx.fillText(rChars[Math.floor(Math.random()*rChars.length)],i*14+1,y*14)
        if(y*14>512&&Math.random()>0.972) drops[i]=0; else drops[i]+=0.55
      })
      rTex.needsUpdate=true
    }

    /* energy rings — 2 per robot */
    const rings=[]
    for(const [x,off] of [[-2.4,0],[-2.4,0.5],[2.4,0.25],[2.4,0.75]]){
      const geo=new THREE.RingGeometry(0.05,0.14,48)
      const m2=new THREE.MeshBasicMaterial({color:0x2255ff,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending})
      const mesh=new THREE.Mesh(geo,m2); mesh.rotation.x=-Math.PI/2; mesh.position.set(x,0.004,0)
      scene.add(mesh); rings.push({mesh,t:off,x})
    }

    /* data orbs — BIGGER now */
    const orbDefs=[
      {r:0.80,rz:0.32,spd: 0.75,off:0,            by:1.15,fs:1.1,col:0x4499ff,sz:0.085},
      {r:0.55,rz:0.24,spd:-0.58,off:Math.PI*2/3,   by:1.48,fs:0.88,col:0x6644ff,sz:0.072},
      {r:0.95,rz:0.42,spd: 0.40,off:Math.PI*4/3,   by:0.95,fs:1.38,col:0x2277ff,sz:0.078},
    ]
    const orbs=orbDefs.map(od=>{
      const grp=new THREE.Group(); grp.scale.setScalar(0)
      const sm=new THREE.MeshStandardMaterial({color:od.col,emissive:od.col,emissiveIntensity:4,metalness:0,roughness:0})
      const orb=new THREE.Mesh(new THREE.SphereGeometry(od.sz,16,16),sm)
      const ring2=new THREE.Mesh(
        new THREE.TorusGeometry(od.sz*1.55,od.sz*0.12,8,32),
        new THREE.MeshBasicMaterial({color:od.col,transparent:true,opacity:0.75,depthWrite:false,blending:THREE.AdditiveBlending})
      )
      ring2.rotation.x=Math.PI/2
      const pt=new THREE.PointLight(od.col,1.2,1.8)
      grp.add(orb,ring2,pt); scene.add(grp)
      return {...od,grp,ring2}
    })

    /* holo panels */
    const panL=mkPanel('AGENT_01 ░ STATUS')
    const panR=mkPanel('AGENT_02 ░ STATUS')
    panL.mesh.position.set(-3.6,1.44,0.8); panL.mesh.rotation.y= 0.42; scene.add(panL.mesh)
    panR.mesh.position.set( 3.6,1.44,0.8); panR.mesh.rotation.y=-0.42; scene.add(panR.mesh)

    /* mist + dust */
    const mkCloud=(count,spread,h,color,sz,op)=>{
      const pos=new Float32Array(count*3)
      for(let i=0;i<count;i++){pos[i*3]=(Math.random()-.5)*spread;pos[i*3+1]=Math.random()*h;pos[i*3+2]=(Math.random()-.5)*(spread*.5)}
      const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(pos,3))
      return new THREE.Points(geo,new THREE.PointsMaterial({color,size:sz,transparent:true,opacity:op,sizeAttenuation:true,depthWrite:false,blending:THREE.AdditiveBlending}))
    }
    scene.add(mkCloud(300,12,0.4,0x2244cc,0.5,0.065))
    const dustPts=mkCloud(500,22,10,0xffffff,0.019,0.18)
    dustPts.material.blending=THREE.NormalBlending; scene.add(dustPts)

    /* build robots */
    const mats=mkMats()
    const botL=buildRobot(mats), botR=buildRobot(mats)
    botL.root.scale.setScalar(1.18); botR.root.scale.setScalar(1.18)
    scene.add(botL.root,botR.root)

    /* REST POSE — arms clearly hanging at sides, no hidden arms */
    const restPose=(bot)=>{
      /* right arm: slight outward from body, slightly forward */
      bot.rArm.uP.rotation.set(0.06, 0, 0.20)
      bot.rArm.fP.rotation.set(0.04, 0, 0)
      /* left arm: mirror */
      bot.lArm.uP.rotation.set(0.06, 0, -0.20)
      bot.lArm.fP.rotation.set(0.04, 0, 0)
    }
    restPose(botL); restPose(botR)

    /* start ABOVE scene */
    botL.root.position.set(-2.4, 10, 0); botL.root.rotation.y =  0.12
    botR.root.position.set( 2.4, 10, 0); botR.root.rotation.y = -0.12

    /* ── TIMELINE ── */
    const tl=gsap.timeline({paused:true})
    const ss={i:0,b:0,eI:0}

    /* phase 1 — descend */
    tl.to(botL.root.position,{y:0.04,duration:1.8,ease:'power3.in'},0)
    tl.to(botR.root.position,{y:0.04,duration:1.8,ease:'power3.in'},0.22)
    tl.to(botL.root.position,{y:0,duration:0.38,ease:'back.out(2.8)'},1.80)
    tl.to(botR.root.position,{y:0,duration:0.38,ease:'back.out(2.8)'},2.02)
    tl.to(botL.root.scale,{x:1.22,z:1.22,duration:0.16,ease:'power2.out'},1.80)
    tl.to(botL.root.scale,{x:1.18,y:1.18,z:1.18,duration:0.32,ease:'elastic.out(1,0.5)'},1.96)
    tl.to(botR.root.scale,{x:1.22,z:1.22,duration:0.16,ease:'power2.out'},2.02)
    tl.to(botR.root.scale,{x:1.18,y:1.18,z:1.18,duration:0.32,ease:'elastic.out(1,0.5)'},2.18)

    /* spotlights kick on */
    tl.to(ss,{i:5.5,b:0.078,eI:1.3,duration:0.6,ease:'power2.out',
      onUpdate:()=>{spotL.intensity=ss.i;spotR.intensity=ss.i;beamL.material.opacity=ss.b;beamR.material.opacity=ss.b;eyePtL.intensity=ss.eI;eyePtR.intensity=ss.eI}
    },1.68)

    /* phase 2 — DRAMATIC PAUSE (2.4 → 3.5s) */

    /* phase 3 — LEFT robot: Majesty Presentation */
    tl.to(botL.torso.rotation,{x:0.17,y:0.32,duration:1.05,ease:'power3.out'},3.5)
    tl.to(botL.head.rotation,{x:-0.06,y:-0.30,duration:1.05,ease:'power3.out'},3.5)
    /* right arm (inner) → presenting, palm up */
    tl.to(botL.rArm.uP.rotation,{x:-0.35,y:0.50,z:0.12,duration:0.95,ease:'power3.out'},3.62)
    tl.to(botL.rArm.fP.rotation,{x:-1.25,y:0,z:0,duration:0.88,ease:'power3.out'},3.78)
    /* left arm (outer) → forearm tucked behind lower back */
    tl.to(botL.lArm.uP.rotation,{x:0.62,y:0,z:-0.10,duration:0.95,ease:'power3.out'},3.62)
    tl.to(botL.lArm.fP.rotation,{x:-0.35,y:0,z:0.95,duration:0.88,ease:'power3.out'},3.78)

    /* phase 4 — RIGHT robot: Majesty Presentation */
    tl.to(botR.torso.rotation,{x:0.17,y:-0.32,duration:1.05,ease:'power3.out'},3.5)
    tl.to(botR.head.rotation, {x:-0.06,y:0.30,duration:1.05,ease:'power3.out'},3.5)
    /* left arm (inner) → presenting, palm up */
    tl.to(botR.lArm.uP.rotation,{x:-0.35,y:-0.50,z:-0.12,duration:0.95,ease:'power3.out'},3.62)
    tl.to(botR.lArm.fP.rotation,{x:-1.25,y:0,z:0,duration:0.88,ease:'power3.out'},3.78)
    /* right arm (outer) → forearm tucked behind lower back */
    tl.to(botR.rArm.uP.rotation,{x:0.62,y:0,z:0.10,duration:0.95,ease:'power3.out'},3.62)
    tl.to(botR.rArm.fP.rotation,{x:-0.35,y:0,z:-0.95,duration:0.88,ease:'power3.out'},3.78)

    /* phase 5 — orbs appear */
    orbs.forEach((o,i)=>tl.to(o.grp.scale,{x:1,y:1,z:1,duration:0.72,ease:'back.out(2.2)'},4.65+i*0.22))
    /* panels fade in */
    tl.to(panL.mesh.material,{opacity:0.90,duration:1.1,ease:'power2.out'},5.15)
    tl.to(panR.mesh.material,{opacity:0.90,duration:1.1,ease:'power2.out'},5.38)

    /* scroll trigger */
    ScrollTrigger.create({trigger:mount,start:'top 80%',once:true,onEnter:()=>tl.play()})

    /* mouse */
    const onMouse=e=>{
      mouse.current.tx=(e.clientX/window.innerWidth-0.5)*2
      mouse.current.ty=-(e.clientY/window.innerHeight-0.5)*2
    }
    window.addEventListener('mousemove',onMouse,{passive:true})

    /* blink system */
    let blinkTimer=0, nextBlink=4+Math.random()*3
    const doBlink=()=>{
      [botL.eyeL,botL.eyeR,botR.eyeL,botR.eyeR].forEach(e=>{
        if(!e) return
        gsap.to(e.scale,{y:0.05,duration:0.055,yoyo:true,repeat:1,ease:'power2.inOut'})
      })
      gsap.to([eyePtL,eyePtR],{intensity:0,duration:0.055,yoyo:true,repeat:1})
    }

    /* body sway for continuous life */
    const sway=(bot,phase)=>{
      const s=Math.sin(Date.now()*0.0006+phase)*0.018
      bot.root.rotation.z=s
    }

    /* main loop */
    let t=0, rafId, panFrame=0
    const animate=()=>{
      rafId=requestAnimationFrame(animate); t+=0.01

      mouse.current.x+=(mouse.current.tx-mouse.current.x)*0.05
      mouse.current.y+=(mouse.current.ty-mouse.current.y)*0.05

      const prog=tl.progress()

      /* breathing */
      const br=Math.sin(t*0.90)*0.0088
      botL.torso.position.y=br; botR.torso.position.y=br

      /* body sway — gentle left-right rock, always running */
      botL.root.rotation.z=Math.sin(t*0.55)*0.016
      botR.root.rotation.z=Math.sin(t*0.55+Math.PI)*0.016

      /* head scan (pre-pose) → GSAP owns 0.54-0.85 → mouse tracking around pose base */
      if(prog<0.54){
        botL.head.rotation.y=Math.sin(t*0.52)*0.22
        botR.head.rotation.y=Math.sin(t*0.48+1)*0.22
      } else if(prog>0.85){
        const mx=mouse.current.x, my=mouse.current.y
        const ty2=mx*0.20+Math.sin(t*0.28)*0.05
        const tx2=my*0.10+0.02
        botL.head.rotation.y+=((-0.30+ty2)-botL.head.rotation.y)*0.055
        botL.head.rotation.x+=((-0.06+tx2)-botL.head.rotation.x)*0.055
        botR.head.rotation.y+=((0.30+ty2)-botR.head.rotation.y)*0.055
        botR.head.rotation.x+=((-0.06+tx2)-botR.head.rotation.x)*0.055
      }

      /* eye blink */
      blinkTimer+=0.01
      if(blinkTimer>nextBlink){blinkTimer=0;nextBlink=4+Math.random()*3;if(prog>0.28)doBlink()}

      /* arm micro-float post welcome */
      if(prog>0.96){
        botL.torso.rotation.x=0.17+Math.sin(t*0.65)*0.012
        botL.torso.rotation.y=0.32+Math.sin(t*0.3)*0.01
        botL.rArm.uP.rotation.x=-0.35+Math.sin(t*0.9)*0.02

        botR.torso.rotation.x=0.17+Math.sin(t*0.65+Math.PI)*0.012
        botR.torso.rotation.y=-0.32+Math.sin(t*0.3+Math.PI)*0.01
        botR.lArm.uP.rotation.x=-0.35+Math.sin(t*0.9+Math.PI)*0.02
      }

      /* eye glow pulse */
      const gp=0.72+Math.sin(t*2.6)*0.50
      if(eyePtL.intensity>0){eyePtL.intensity=gp*1.15; eyePtR.intensity=gp*1.15}
      eyePtL.position.set(botL.root.position.x,1.75,0.80)
      eyePtR.position.set(botR.root.position.x,1.75,0.80)

      /* energy rings */
      rings.forEach(r=>{
        r.t=(r.t+0.005)%1
        const s2=0.4+r.t*5.8
        r.mesh.scale.set(s2,1,s2)
        r.mesh.material.opacity=Math.max(0,0.40*(1-r.t*1.3))
      })

      /* orbs orbit */
      orbs.forEach(o=>{
        const angle=t*o.spd+o.off
        o.grp.position.set(Math.cos(angle)*o.r, o.by+Math.sin(t*o.fs)*0.10, Math.sin(angle)*o.rz)
        o.ring2.rotation.z+=0.024
        o.grp.children[0].material.emissiveIntensity=3.0+Math.sin(t*3.1+o.off)*1.4
      })

      /* spotlight breathe */
      if(prog>0.55){
        const sb=0.072+Math.sin(t*1.35)*0.016
        beamL.material.opacity=sb; beamR.material.opacity=sb
        spotL.intensity=5.2+Math.sin(t*0.88)*0.55; spotR.intensity=5.2+Math.sin(t*0.92+1)*0.55
      }

      /* panels update every 2 frames */
      panFrame++
      if(panFrame%2===0){drawPanel(panL);drawPanel(panR)}

      /* matrix rain */
      updateRain()

      /* dust drift */
      dustPts.rotation.y+=0.00022; dustPts.position.y=Math.sin(t*0.19)*0.06

      /* camera breathe */
      camera.position.y=0.28+Math.sin(t*0.44)*0.015

      renderer.render(scene,camera)
    }
    animate()

    const onResize=()=>{
      const w=window.innerWidth,h=mount.clientHeight
      camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h)
    }
    window.addEventListener('resize',onResize)

    return ()=>{
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove',onMouse)
      window.removeEventListener('resize',onResize)
      if(mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      tl.kill(); renderer.dispose()
    }
  },[])

  return (
    <section className="robot-section" id="robots">
      <div ref={mountRef} className="robot-canvas"
        role="img" aria-label="Two AI robots welcoming visitors with animated holographic displays" />
      <div className="robot-overlay">
        <p className="robot-eyebrow" data-fade>built different</p>
        <h2 className="robot-h" data-fade data-delay="0.1">
          Welcome to the future<br />of development.
        </h2>
        <p className="robot-sub" data-fade data-delay="0.2">
          Agentic systems that think. Automations that run themselves.<br />
          Code that doesn't need babysitting.
        </p>
      </div>
      <div className="robot-scroll-hint">
        <span>scroll</span>
        <div className="robot-scroll-line" />
      </div>
    </section>
  )
}
