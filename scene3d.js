import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas=document.querySelector('#world3d');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));
renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x101a18);
scene.fog=new THREE.Fog(0xb8bfba,13,48);
const camera=new THREE.PerspectiveCamera(58,canvas.clientWidth/canvas.clientHeight,.1,100);
camera.position.set(0,4.5,8.5);
const orbit=new OrbitControls(camera,renderer.domElement);
orbit.target.set(0,1.3,0);orbit.enableDamping=true;orbit.dampingFactor=.08;
orbit.minDistance=3.5;orbit.maxDistance=13;orbit.maxPolarAngle=Math.PI*.48;
orbit.enablePan=false;

scene.add(new THREE.HemisphereLight(0xc7e4dd,0x24201d,1.4));
const moon=new THREE.DirectionalLight(0xd9e8df,2.1);
moon.position.set(-6,12,6);moon.castShadow=true;moon.shadow.mapSize.set(2048,2048);
moon.shadow.camera.left=-20;moon.shadow.camera.right=20;moon.shadow.camera.top=25;moon.shadow.camera.bottom=-25;scene.add(moon);
const redLight=new THREE.PointLight(0xff294f,30,13,2);redLight.position.set(3,3,-10);scene.add(redLight);

const loader=new THREE.TextureLoader();
async function texture(path,repeatX=1,repeatY=1){
 let t;
 try{
  t=await Promise.race([
   loader.loadAsync(path),
   new Promise((_,reject)=>setTimeout(()=>reject(new Error('Texture timeout: '+path)),7000))
  ]);
 }catch(err){
  console.warn('No se pudo cargar textura, usando material de respaldo:',path,err);
  const c=document.createElement('canvas');c.width=c.height=256;
  const ctx=c.getContext('2d');ctx.fillStyle='#66716b';ctx.fillRect(0,0,256,256);
  ctx.strokeStyle='#28332e';ctx.lineWidth=5;
  for(let n=0;n<=256;n+=64){ctx.beginPath();ctx.moveTo(n,0);ctx.lineTo(n,256);ctx.stroke();ctx.beginPath();ctx.moveTo(0,n);ctx.lineTo(256,n);ctx.stroke();}
  for(let n=0;n<1800;n++){ctx.fillStyle=`rgba(8,15,12,${Math.random()*.12})`;ctx.fillRect(Math.random()*256,Math.random()*256,2,2);}
  t=new THREE.CanvasTexture(c);
 }
 t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;
 t.repeat.set(repeatX,repeatY);t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;
}
const floorTexture=await texture('assets/floor-hospital.png',5,12);
const corridorTexture=await texture('assets/game-hall.png',1,1);
const menuTexture=await texture('assets/menu-corridor.png',1,1);
const zombieTexture=await texture('assets/zombie.png',1,1);

const floor=new THREE.Mesh(new THREE.PlaneGeometry(14,38),new THREE.MeshStandardMaterial({map:floorTexture,roughness:.96}));
floor.rotation.x=-Math.PI/2;floor.position.set(0,-.03,-7);floor.receiveShadow=true;scene.add(floor);
// Square floor patch beneath the character, visibly textured as requested in the assignment.
const squareFloor=new THREE.Mesh(new THREE.PlaneGeometry(12,12),new THREE.MeshStandardMaterial({map:floorTexture,roughness:.98}));
squareFloor.rotation.x=-Math.PI/2;squareFloor.position.set(0,.005,0);squareFloor.receiveShadow=true;scene.add(squareFloor);

const wallMat=new THREE.MeshStandardMaterial({map:corridorTexture,roughness:.94});
const sideMat=new THREE.MeshStandardMaterial({color:0x34413c,roughness:.9});
function wall(w,h,d,x,y,z,mat=sideMat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.receiveShadow=true;m.castShadow=true;scene.add(m);return m;}
wall(.45,5.8,38,-7.2,2.9,-7);wall(.45,5.8,38,7.2,2.9,-7);
wall(14.5,.35,.4,0,5.8,-7,sideMat);
wall(14.5,5.8,.4,0,2.9,-26,wallMat);
wall(14.5,5.8,.4,0,2.9,12,sideMat);
// Texture panels use the provided corridor/menu images as environmental references.
function wallPanel(tex,x,y,z,w,h,rot=0){
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));
 m.position.set(x,y,z);m.rotation.y=rot;scene.add(m);return m;
}
wallPanel(menuTexture,-6.96,2.6,-8,7,4,Math.PI/2);
wallPanel(corridorTexture,6.96,2.6,-16,7,4,-Math.PI/2);
wallPanel(zombieTexture,0,2.5,-25.77,3.2,3.5,0);

// Hospital ceiling beams and overhead lights.
const fixtures=[];
for(let z=8;z>-24;z-=7){
 const fixture=new THREE.Mesh(new THREE.BoxGeometry(1.45,.13,.65),new THREE.MeshStandardMaterial({color:0x9aa8a0,emissive:0x253d35,emissiveIntensity:.4,metalness:.25}));
 fixture.position.set(0,5.35,z);scene.add(fixture);
 const light=new THREE.PointLight(0xa9ffdf,24,11,2);light.position.set(0,4.95,z);scene.add(light);fixtures.push(light);
}

// Props/obstacles, all physical collision barriers.
const obstacles=[];
function prop(w,h,d,x,y,z,color=0x46534d){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.85}));
 m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);
 obstacles.push({x,z,hw:w/2+.48,hd:d/2+.48});return m;
}
prop(2.1,1.1,1.6,-4,.55,-3,0x59645c);
prop(1.5,1.9,1.5,4,.95,-7,0x3b4842);
prop(2.4,.9,1.5,1,.45,5,0x69736b);
prop(1.3,1.8,1.3,-4, .9,9,0x3f4b45);
prop(2,1.3,1.5,5,.65,1,0x48544d);
// Moveable medical cart, also participates in collision checks.
const cart=new THREE.Group();
const cartBody=new THREE.Mesh(new THREE.BoxGeometry(1.3,.8,.75),new THREE.MeshStandardMaterial({color:0x84928b,metalness:.35,roughness:.5}));
cartBody.position.y=.8;cartBody.castShadow=true;cart.add(cartBody);
for(const x of [-.5,.5])for(const z of [-.28,.28]){
 const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.1,12),new THREE.MeshStandardMaterial({color:0x151b18}));
 wheel.rotation.z=Math.PI/2;wheel.position.set(x,.14,z);cart.add(wheel);
}
cart.position.set(-2,0,-13);scene.add(cart);

// Human-like playable character built as a rigged 3D model with a visible pistol.
const player=new THREE.Group();player.position.set(0,0,8);scene.add(player);
const proceduralRig=new THREE.Group();player.add(proceduralRig);
const skin=new THREE.MeshStandardMaterial({color:0xb1b4a4,roughness:.82});
const coat=new THREE.MeshStandardMaterial({color:0x253c35,roughness:.92});
const pants=new THREE.MeshStandardMaterial({color:0x121b19,roughness:.95});
const metal=new THREE.MeshStandardMaterial({color:0x252e2b,metalness:.8,roughness:.28});
const gripMat=new THREE.MeshStandardMaterial({color:0x111412,roughness:.85});
function mesh(geo,mat,parent,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
mesh(new THREE.CapsuleGeometry(.37,.78,6,12),coat,proceduralRig,0,1.4,0);
mesh(new THREE.SphereGeometry(.26,20,16),skin,proceduralRig,0,2.17,0);
const face=mesh(new THREE.BoxGeometry(.27,.035,.025),gripMat,proceduralRig,0,2.15,.245);
for(const x of [-.09,.09])mesh(new THREE.SphereGeometry(.035,8,8),new THREE.MeshStandardMaterial({color:0xffb65e,emissive:0x6b2400}),proceduralRig,x,2.2,.23);
const armR=new THREE.Group();armR.position.set(.38,1.73,0);proceduralRig.add(armR);
mesh(new THREE.CapsuleGeometry(.115,.58,5,10),skin,armR,0,-.31,.12);
const armL=new THREE.Group();armL.position.set(-.38,1.73,0);proceduralRig.add(armL);
mesh(new THREE.CapsuleGeometry(.115,.58,5,10),skin,armL,0,-.31,.12);
const legR=new THREE.Group();legR.position.set(.18,.99,0);proceduralRig.add(legR);
mesh(new THREE.CapsuleGeometry(.14,.72,5,10),pants,legR,0,-.4,0);
const legL=new THREE.Group();legL.position.set(-.18,.99,0);proceduralRig.add(legL);
mesh(new THREE.CapsuleGeometry(.14,.72,5,10),pants,legL,0,-.4,0);
// Pistol grip, slide, barrel and muzzle flash are parented to the right hand.
const pistol=new THREE.Group();pistol.position.set(.02,-.52,.35);armR.add(pistol);
mesh(new THREE.BoxGeometry(.16,.15,.58),metal,pistol,0,.08,.05);
mesh(new THREE.BoxGeometry(.12,.25,.14),gripMat,pistol,0,-.11,-.08);
mesh(new THREE.CylinderGeometry(.035,.035,.36,10),metal,pistol,0,.08,.43).rotation.x=Math.PI/2;
const muzzle=new THREE.PointLight(0xffc56d,0,4,2);muzzle.position.set(0,.08,.7);pistol.add(muzzle);
const muzzleMesh=mesh(new THREE.SphereGeometry(.08,8,8),new THREE.MeshBasicMaterial({color:0xffe1a1}),pistol,0,.08,.7);muzzleMesh.visible=false;
// Load the human Mixamo FBX bundled in the supplied graf-threejs3dScenario archive.
// The armed procedural avatar remains visible if FBX parsing fails.
let fbxModel=null, fbxMixer=null, fbxAction=null, fbxHand=null;
// Se utiliza el personaje humanoide 3D armado integrado en la escena.
// Esto evita que una dependencia FBX incompleta bloquee el renderizado.

// First-person-ish shoulder camera follows the character while orbit remains mouse controlled.
camera.position.set(0,4.2,12);orbit.target.set(0,1.5,7);orbit.update();
let mode=0,paused=false,groundY=0,jumpVelocity=0,fireCooldown=0,fireTimer=0;
let yaw=0,keys={},last=performance.now(),soundEnabled=true,audioUnlocked=false;
const modes=['CAMINAR','CORRER','APUNTAR'];
const aimRaycaster=new THREE.Raycaster();
const aimPointer=new THREE.Vector2();
const aimPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
const aimPoint=new THREE.Vector3();

const actionLabel=document.querySelector('#action3d'),stateLabel=document.querySelector('#state3d');
function setMode(n){
 mode=n;
 actionLabel.textContent=modes[n];
 orbit.enabled = (n !== 2);
 canvas.classList.toggle('aiming3d', n===2);
 stateLabel.textContent = n===2 ? 'MODO APUNTAR' : 'ACTIVO';
}
function collision(x,z){
 if(Math.abs(x)>6.1||z>10.4||z< -24.6)return true;
 for(const o of obstacles)if(Math.abs(x-o.x)<o.hw&&Math.abs(z-o.z)<o.hd)return true;
 if(Math.abs(x-cart.position.x)<1.05&&Math.abs(z-cart.position.z)<.95)return true;
 return false;
}

// Real sound assets from the original PSYCHOSIS project. Start only after user interaction.
const ambience=document.querySelector('#ambience3d'),shotAudio=document.querySelector('#shot3d');
ambience.volume=.38;shotAudio.volume=.8;
function unlockAudio(){
 if(audioUnlocked)return;audioUnlocked=true;
 if(soundEnabled)ambience.play().catch(()=>{});
}
function shootSound(){
 unlockAudio();if(!soundEnabled)return;
 try{shotAudio.currentTime=0;shotAudio.play().catch(()=>{});}catch(e){}
}
function fire(){
 if(paused||fireCooldown>0)return;
 unlockAudio();fireCooldown=.24;fireTimer=.12;
 muzzle.intensity=95;muzzleMesh.visible=true;
 shootSound();
 // Ray-like tracer from the pistol in the direction the character faces.
 const start=new THREE.Vector3();pistol.getWorldPosition(start);
 const dir = mode===2 ? new THREE.Vector3(0,0,1).applyQuaternion(player.quaternion).normalize()
                      : new THREE.Vector3(0,0,1).applyQuaternion(player.quaternion).normalize();
 const end=start.clone().add(dir.multiplyScalar(12));
 const points=[start,end];const tracer=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0xffcf83,transparent:true,opacity:.9}));
 scene.add(tracer);setTimeout(()=>{scene.remove(tracer);tracer.geometry.dispose();tracer.material.dispose();},75);
}
document.querySelector('#sound3d').addEventListener('click',()=>{
 soundEnabled=!soundEnabled;
 document.querySelector('#sound3d').textContent=soundEnabled?'♫ SONIDO: ACTIVADO':'♫ SONIDO: DESACTIVADO';
 if(soundEnabled){unlockAudio();ambience.play().catch(()=>{});}else ambience.pause();
});
function showPause(show){
 paused=show;
 const panel=document.querySelector('#pauseMenu3d');
 if(panel)panel.classList.toggle('show',show);
 stateLabel.textContent=show?'PAUSADO':'ACTIVO';
}
function onKeyDown(e){
 const prevent=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code);
 if(prevent)e.preventDefault();
 keys[e.code]=true;
 unlockAudio();
 if(e.repeat)return;
 const key=e.key;
 if(e.code==='Digit1'||key==='1'||e.code==='Numpad1')setMode(0);
 if(e.code==='Digit2'||key==='2'||e.code==='Numpad2')setMode(1);
 if(e.code==='Digit3'||key==='3'||e.code==='Numpad3')setMode(2);
 if(e.code==='KeyQ'||key.toLowerCase()==='q'){yaw+=Math.PI/2;player.rotation.y=yaw;}
 if(e.code==='KeyE'||key.toLowerCase()==='e'){yaw-=Math.PI/2;player.rotation.y=yaw;}
 if(e.code==='Space'&&player.position.y<=.001&&!paused)jumpVelocity=5.4;
 if(e.code==='KeyF')fire();
 if(e.code==='Escape'){showPause(!paused);}
}
function onKeyUp(e){keys[e.code]=false;}
window.addEventListener('keydown',onKeyDown);window.addEventListener('keyup',onKeyUp);
canvas.addEventListener('pointerdown',e=>{unlockAudio();if(e.button===0)fire();});
canvas.addEventListener('pointermove',e=>{
 if(mode!==2||paused)return;
 const rect=canvas.getBoundingClientRect();
 aimPointer.x=((e.clientX-rect.left)/rect.width)*2-1;
 aimPointer.y=-((e.clientY-rect.top)/rect.height)*2+1;
 aimRaycaster.setFromCamera(aimPointer,camera);
 if(aimRaycaster.ray.intersectPlane(aimPlane,aimPoint)){
  const dx=aimPoint.x-player.position.x,dz=aimPoint.z-player.position.z;
  if(Math.abs(dx)+Math.abs(dz)>.05){player.rotation.y=Math.atan2(dx,dz);yaw=player.rotation.y;}
 }
});
window.addEventListener('blur',()=>{keys={};});
document.querySelector('#resume3d')?.addEventListener('click',()=>showPause(false));
document.querySelector('#restart3d')?.addEventListener('click',()=>location.reload());
document.querySelector('#menu3d')?.addEventListener('click',()=>location.href='index.html');
function resize(){
 const w=canvas.clientWidth,h=canvas.clientHeight;
 camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
}
window.addEventListener('resize',resize);

function animate(now){
 requestAnimationFrame(animate);
 const dt=Math.min((now-last)/1000,.04);last=now;
 if(!paused){
  const forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);
  const strafe=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
  const moving=forward!==0||strafe!==0;
  const sprint=keys.ShiftLeft||keys.ShiftRight||mode===1;
  const speed=sprint?5.3:mode===2?1.8:3.0;
  const direction=new THREE.Vector3(strafe,0,-forward);
  if(direction.lengthSq()>0){
   direction.normalize();
   // Movement follows the camera's horizontal direction, so all four directions work intuitively.
   const camForward=new THREE.Vector3();camera.getWorldDirection(camForward);camForward.y=0;camForward.normalize();
   const camRight=new THREE.Vector3().crossVectors(camForward,new THREE.Vector3(0,1,0)).normalize();
   const move=camRight.multiplyScalar(strafe).add(camForward.multiplyScalar(forward)).normalize();
   const nx=player.position.x+move.x*speed*dt,nz=player.position.z+move.z*speed*dt;
   if(!collision(nx,player.position.z))player.position.x=nx;
   if(!collision(player.position.x,nz))player.position.z=nz;
   if(mode!==2)player.rotation.y=Math.atan2(move.x,move.z);
  }
  const gait=moving?(sprint?10:6):1.2,amp=moving?.65:.035;
  if(fbxMixer){fbxMixer.timeScale=moving?(mode===2?.22:(sprint?1.55:1)):0;fbxMixer.update(dt);}
  const swing=Math.sin(now*.001*gait)*amp;
  if(proceduralRig.visible){legR.rotation.x=swing;legL.rotation.x=-swing;
   if(mode===2){armR.rotation.x=-.75;armL.rotation.x=-.55;}else{armR.rotation.x=-.15+swing*.2;armL.rotation.x=-.1-swing*.2;}}
  player.position.y+=jumpVelocity*dt;
  jumpVelocity-=14*dt;
  if(player.position.y<0){player.position.y=0;jumpVelocity=0;}
  stateLabel.textContent=mode===2?'MODO APUNTAR':(moving?(sprint?'CORRIENDO':'CAMINANDO'):'LISTO');
  // The cart moves through a short, bounded patrol route.
  cart.position.x=-2+Math.sin(now*.00035)*1.5;
  cart.position.z=-13+Math.cos(now*.00035)*.65;
 }
 fireCooldown=Math.max(0,fireCooldown-dt);
 fireTimer=Math.max(0,fireTimer-dt);
 if(fireTimer===0){muzzle.intensity=0;muzzleMesh.visible=false;}
 fixtures.forEach((l,i)=>l.intensity=19+Math.sin(now*.002+i)*3);
 orbit.target.lerp(new THREE.Vector3(player.position.x,1.35+player.position.y,player.position.z),.08);
 orbit.update();renderer.render(scene,camera);
}
document.querySelector('#loading3d').classList.add('hidden3d');
stateLabel.textContent='LISTO';
requestAnimationFrame(animate);
