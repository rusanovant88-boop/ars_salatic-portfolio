// Desktop retains the exact 1440x900 reference artboard.
// Mobile (<901px) is laid out natively; it must never be scaled down as a desktop image.
const artboard = document.getElementById('artboard');
const folder = document.getElementById('worksFolder');
const comingNext = document.getElementById('comingNext');
const bonyaTrigger = document.getElementById('bonyaTrigger');
const bonyaOverlay = document.getElementById('bonyaOverlay');
const eyes = document.getElementById('eyes');
const pupils = [document.getElementById('pupil-left'),document.getElementById('pupil-right')];
let previousScale=0;
let dogPinned=false;

function fitStage(){
  const scale=window.innerWidth<=900?1:Math.min(window.innerWidth/1440,window.innerHeight/900);
  if(Math.abs(scale-previousScale)<0.001)return;
  previousScale=scale;
  document.documentElement.style.setProperty('--stage-scale',String(scale));
}
fitStage();
window.addEventListener('resize',fitStage,{passive:true});

function showBonya(show){
  bonyaOverlay.classList.toggle('is-visible',show);
  bonyaOverlay.setAttribute('aria-hidden',String(!show));
  bonyaTrigger.setAttribute('aria-expanded',String(show));
}
bonyaTrigger.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')showBonya(true);});
bonyaTrigger.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch'&&!dogPinned)showBonya(false);});
bonyaTrigger.addEventListener('focus',()=>showBonya(true));
bonyaTrigger.addEventListener('blur',()=>{if(!dogPinned)showBonya(false)});
bonyaTrigger.addEventListener('click',e=>{
  e.stopPropagation();
  if(e.detail!==0){dogPinned=!dogPinned;showBonya(dogPinned);}
});
document.addEventListener('pointerdown',e=>{
  if(!bonyaTrigger.contains(e.target)&&dogPinned){dogPinned=false;showBonya(false);}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){dogPinned=false;showBonya(false);comingNext.classList.remove('show');}});

// The Works click transition is defined after the logo initialization.

let lastPointer=null;
let animationQueued=false;
function aimEyes(clientX,clientY){
  const rect=eyes.getBoundingClientRect();
  const cx=rect.left+rect.width/2;
  const cy=rect.top+rect.height/2;
  const dx=(clientX-cx)/Math.max(1,window.innerWidth/2);
  const dy=(clientY-cy)/Math.max(1,window.innerHeight/2);
  const tx=Math.max(-5,Math.min(5,dx*5));
  const ty=Math.max(-2.8,Math.min(2.8,dy*2.8));
  pupils.forEach(p=>p.setAttribute('transform',`translate(${tx.toFixed(2)} ${ty.toFixed(2)})`));
}
document.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch')return;
  lastPointer=[e.clientX,e.clientY];
  if(animationQueued)return;
  animationQueued=true;
  requestAnimationFrame(()=>{animationQueued=false;if(lastPointer)aimEyes(...lastPointer);});
},{passive:true});

// Trigger the shy glance on entry, then resume regular cursor-follow on exit.
eyes.addEventListener('pointerenter',event=>{
  if(event.pointerType!=='touch')aimEyes(event.clientX,event.clientY);
});
eyes.addEventListener('pointerleave',event=>{
  if(event.pointerType!=='touch')aimEyes(event.clientX,event.clientY);
});


// v0.2: Keep the original folder unchanged when the person appears.
// The combined figure from the source PDF also contains a SECOND, smaller
// folder; only that blue portion is removed from the overlay in memory.
// No changes to the source image or to the default folder artwork.
const portraitOverlay = document.querySelector('.folder-person');
async function preparePersonOverlay() {
  try {
    await portraitOverlay.decode();
    const canvas = document.createElement('canvas');
    canvas.width = portraitOverlay.naturalWidth;
    canvas.height = portraitOverlay.naturalHeight;
    const ctx = canvas.getContext('2d', {willReadFrequently:true});
    if (!ctx) return;
    ctx.drawImage(portraitOverlay,0,0);
    const frame = ctx.getImageData(0,0,canvas.width,canvas.height);
    const px = frame.data;
    const width=canvas.width,height=canvas.height;
    const blue = new Uint8Array(width*height);
    for(let i=0,j=0;i<px.length;i+=4,j++){
      const r=px[i],g=px[i+1],b=px[i+2];
      const max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;
      let hue=0;
      if(delta>0){
        if(max===r) hue=((g-b)/delta)%6*60;
        else if(max===g) hue=((b-r)/delta+2)*60;
        else hue=((r-g)/delta+4)*60;
        if(hue<0) hue+=360;
      }
      blue[j]=(hue>=160 && hue<=266 && delta/Math.max(max,1)>.20 && max>=65)?1:0;
    }
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const index=y*width+x, offset=index*4;
      if(blue[index]){px[offset+3]=0;continue;}
      // A narrow antialiasing margin avoids cyan halos around fingers.
      let near=false;
      for(let yy=Math.max(0,y-1);yy<=Math.min(height-1,y+1)&&!near;yy++)
        for(let xx=Math.max(0,x-1);xx<=Math.min(width-1,x+1);xx++)
          if(blue[yy*width+xx]){near=true;break;}
      if(near)px[offset+3]=Math.round(px[offset+3]*0.18);
    }
    ctx.putImageData(frame,0,0);
    portraitOverlay.src=canvas.toDataURL('image/webp',0.93);
  } catch(err) {
    // The original file remains usable if this optional image cleanup fails.
    console.warn('Salatic portrait preparation skipped',err);
  }
}
preparePersonOverlay();

// Signature handwriting v1.0: pristine source pixels, no encoded in-between frames.
// A smooth, time-coded pen trace reveals the EXACT original image alpha and RGB.
// The original, unmodified logo remains the non-animated fallback.
// Signature v2.1: ALWAYS render the original artwork, even during the reveal.
// SVG trajectories define only a transparent REVEAL MASK over the SAME image.
// They never render replacement blue paths, so the lettering cannot change shape.
const signatureImg = document.querySelector('.signature');
const signatureHit = document.createElement('button');
signatureHit.type = 'button';
signatureHit.id = 'signatureHit';
signatureHit.className = 'signature-hit';
signatureHit.setAttribute('aria-label','Replay Salatic signature writing animation');
signatureImg.parentElement.insertBefore(signatureHit,signatureImg);
signatureHit.appendChild(signatureImg);

const writingOverlay = document.createElement('div');
writingOverlay.className = 'signature-writing';
writingOverlay.setAttribute('aria-hidden','true');
signatureHit.appendChild(writingOverlay);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const writingDurationMs = 4200;
const writingDrawMs = 3500;
let writingToken = 0;
let writingDoneTimer = null;
let writingAnimations = [];
let signatureSvgReady = false;
let signatureRevealPaths = [];
let signatureRevealFinish = null;

// Paths describe pen movement only, never the image's rendered appearance.
const signatureRoutes = [
 {w:32,r:30,p:[[308,39],[290,59],[264,98],[240,147],[219,203],[214,263],[198,247],[182,204],[163,150],[144,115],[116,96],[90,100],[66,122],[48,163],[49,208],[69,244],[103,274],[151,304],[203,333],[252,365],[288,397],[316,437],[328,480],[312,533],[269,568],[211,592],[151,589],[95,568],[48,531],[14,480],[4,419],[15,371],[38,352],[83,362]]},
 {w:7,r:28,p:[[298,181],[291,219],[287,270],[286,334],[288,414],[291,493]]},
 {w:9,r:28,p:[[184,450],[220,414],[256,387],[292,373],[323,378],[349,405],[375,464]]},
 {w:11,r:28,p:[[306,89],[320,169],[341,247],[363,310],[398,380],[432,449],[451,480]]},
 {w:11,r:27,p:[[353,263],[398,227],[451,199],[497,172],[496,225],[463,271],[410,311],[360,321],[348,294],[360,265]]},
 {w:4,r:27,p:[[500,171],[503,204],[502,263]]},
 {w:5,r:26,p:[[494,320],[468,331],[445,367],[439,403],[448,465]]},
 {w:7,r:28,p:[[355,162],[412,144],[469,134],[533,127],[614,136],[702,157],[769,183],[810,208]]},
 {w:8,r:29,p:[[578,6],[568,34],[562,94],[557,167],[547,260],[536,365],[525,476],[518,552]]},
 {w:2,r:20,p:[[601,216],[600,222]]},
 {w:5,r:25,p:[[597,250],[590,287],[581,332],[570,368]]},
 {w:7,r:28,p:[[666,179],[644,245],[626,321],[613,405],[594,475]]},
 {w:6,r:27,p:[[655,354],[628,379],[603,408],[600,449],[599,475]]},
 {w:7,r:28,p:[[617,394],[649,417],[692,451],[729,487],[762,523]]}
];

function signaturePath(points) {
  if(!points || points.length < 2) return '';
  let d = 'M '+points[0][0]+' '+points[0][1];
  for(let i=0;i<points.length-1;i++) {
    const p0=points[Math.max(0,i-1)];
    const p1=points[i];
    const p2=points[i+1];
    const p3=points[Math.min(points.length-1,i+2)];
    const c1x=p1[0]+(p2[0]-p0[0])/6;
    const c1y=p1[1]+(p2[1]-p0[1])/6;
    const c2x=p2[0]-(p3[0]-p1[0])/6;
    const c2y=p2[1]-(p3[1]-p1[1])/6;
    d+=' C '+c1x+' '+c1y+' '+c2x+' '+c2y+' '+p2[0]+' '+p2[1];
  }
  return d;
}


function ensureSignatureSvg(){
  if(signatureSvgReady) return;
  const ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 816 600');
  svg.setAttribute('preserveAspectRatio','xMidYMid meet');
  svg.setAttribute('aria-hidden','true');
  svg.classList.add('signature-writing-svg');

  const defs=document.createElementNS(ns,'defs');
  const mask=document.createElementNS(ns,'mask');
  mask.setAttribute('id','salatic-original-ink-reveal');
  mask.setAttribute('maskUnits','userSpaceOnUse');
  mask.setAttribute('maskContentUnits','userSpaceOnUse');
  mask.setAttribute('x','0');mask.setAttribute('y','0');
  mask.setAttribute('width','816');mask.setAttribute('height','600');
  mask.setAttribute('style','mask-type:alpha');

  for(const route of signatureRoutes){
    const stroke=document.createElementNS(ns,'path');
    stroke.setAttribute('d',signaturePath(route.p));
    stroke.setAttribute('fill','none');
    stroke.setAttribute('stroke','#fff');
    // Wide paint coverage reveals real ink, but does not add artificial ink.
    stroke.setAttribute('stroke-width',String(Math.max(60,route.r*2.4)));
    stroke.setAttribute('stroke-linecap','round');
    stroke.setAttribute('stroke-linejoin','round');
    mask.appendChild(stroke);
    signatureRevealPaths.push(stroke);
  }

  // Finish by smoothly revealing any remaining pixels from the real logo.
  // It also makes the end frame pixel-identical to the untouched source.
  signatureRevealFinish=document.createElementNS(ns,'rect');
  signatureRevealFinish.setAttribute('x','0');
  signatureRevealFinish.setAttribute('y','0');
  signatureRevealFinish.setAttribute('width','816');
  signatureRevealFinish.setAttribute('height','600');
  signatureRevealFinish.setAttribute('fill','#fff');
  signatureRevealFinish.setAttribute('opacity','0');
  mask.appendChild(signatureRevealFinish);
  defs.appendChild(mask);
  svg.appendChild(defs);

  const source=document.createElementNS(ns,'image');
  source.setAttribute('href',signatureImg.getAttribute('src'));
  source.setAttribute('x','0');
  source.setAttribute('y','0');
  source.setAttribute('width','816');
  source.setAttribute('height','600');
  source.setAttribute('preserveAspectRatio','xMidYMid meet');
  source.setAttribute('mask','url(#salatic-original-ink-reveal)');
  svg.appendChild(source);
  writingOverlay.appendChild(svg);
  signatureSvgReady=true;
}

function stopWriting(){
  writingToken++;
  if(writingDoneTimer!==null){
    clearTimeout(writingDoneTimer);
    writingDoneTimer=null;
  }
  for(const animation of writingAnimations) animation.cancel();
  writingAnimations=[];
  signatureHit.classList.remove('is-writing');
  if(signatureRevealFinish)signatureRevealFinish.setAttribute('opacity','0');
}

async function startWriting(){
  stopWriting();
  if(reducedMotion.matches||artboard.classList.contains('stage-exiting'))return;
  const token=writingToken;
  try{
    await signatureImg.decode();
    if(token!==writingToken||artboard.classList.contains('stage-exiting'))return;
    ensureSignatureSvg();
    const totalWeight=signatureRoutes.reduce((sum,route)=>sum+route.w,0);
    let delay=0;
    for(let i=0;i<signatureRevealPaths.length;i++){
      const stroke=signatureRevealPaths[i];
      const length=stroke.getTotalLength();
      const duration=writingDrawMs*signatureRoutes[i].w/totalWeight;
      stroke.style.strokeDasharray=String(length);
      stroke.style.strokeDashoffset=String(length);
      writingAnimations.push(stroke.animate([
        {strokeDashoffset:String(length)},
        {strokeDashoffset:'0'}
      ],{duration,delay,easing:'cubic-bezier(.33,0,.18,1)',fill:'forwards'}));
      delay+=duration*.93;
    }
    signatureRevealFinish.setAttribute('opacity','0');
    writingAnimations.push(signatureRevealFinish.animate([
      {opacity:0},{opacity:1}
    ],{duration:350,delay:writingDrawMs,easing:'ease-out',fill:'forwards'}));
    signatureHit.classList.add('is-writing');
    writingDoneTimer=setTimeout(()=>{
      if(token===writingToken)stopWriting();
    },writingDurationMs);
  }catch(error){
    if(token===writingToken){
      stopWriting();
      console.warn('Signature animation unavailable; original artwork preserved',error);
    }
  }
}

signatureHit.addEventListener('pointerenter',event=>{
  if(event.pointerType!=='touch')startWriting();
});
signatureHit.addEventListener('pointerleave',event=>{
  if(event.pointerType!=='touch')stopWriting();
});
signatureHit.addEventListener('focus',startWriting);
signatureHit.addEventListener('blur',stopWriting);
signatureHit.addEventListener('click',event=>{
  if(event.detail===0||event.pointerType==='touch')startWriting();
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape')stopWriting();
});


// v0.4: letters fall away; original signature becomes the only remaining UI.
let scene='home', rain=null, endRainTimer=null;
const charRange=document.createRange();

function randomUnit(seed){
  let n=Math.imul(seed+1,2654435761)>>>0;
  n^=n>>>16; n=Math.imul(n,2246822507); n^=n>>>13;
  return (n>>>0)/4294967295;
}
function createLetters(){
  const overlay=document.createElement('div');
  overlay.className='letter-rain';overlay.setAttribute('aria-hidden','true');
  const fragment=document.createDocumentFragment();
  const chars=[],scale=previousScale||1;
  for(const selector of ['.username','.role','.folder-name','.bio']){
    const root=artboard.querySelector(selector);
    if(!root||Number(getComputedStyle(root).opacity)<0.05)continue;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let node;
    while((node=walker.nextNode())){
      const parent=node.parentElement,content=node.nodeValue||'';
      if(!parent||!content)continue;
      const style=getComputedStyle(parent);
      if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity)<0.05)continue;
      let start=0;
      for(const character of content){
        const end=start+character.length;
        if(character.trim()){
          charRange.setStart(node,start);charRange.setEnd(node,end);
          const rect=charRange.getBoundingClientRect();
          if(rect.width>0&&rect.height>0){
            const span=document.createElement('span');
            span.className='falling-letter';
            span.textContent=character;
            span.style.left=rect.left+'px';span.style.top=rect.top+'px';
            span.style.fontFamily=style.fontFamily;
            span.style.fontWeight=style.fontWeight;
            span.style.fontStyle=style.fontStyle;
            span.style.fontSize=(parseFloat(style.fontSize)*scale)+'px';
            span.style.letterSpacing='0px';
            span.style.lineHeight=rect.height+'px';
            span.style.color=style.color;
            fragment.appendChild(span);
            chars.push({el:span,rect});
          }
        }
        start=end;
      }
    }
  }
  overlay.appendChild(fragment);
  document.body.appendChild(overlay);
  return {overlay,chars};
}
function clearLetters(){
  if(endRainTimer!==null){clearTimeout(endRainTimer);endRainTimer=null;}
  if(rain){rain.remove();rain=null;}
}
function resetScene(){
  const stage=document.getElementById('caseStage');
  if(stage)stage.classList.remove('kv-fallback-fullscreen');
  clearLetters();
  scene='home';
  stopWriting();
  artboard.classList.remove('stage-exiting','stage-exited');
  signatureHit.setAttribute('aria-label','Replay Salatic signature writing animation');
  comingNext.textContent='';
  dogPinned=false;showBonya(false);
}
function openWorks(){
  if(scene!=='home')return;
  scene='falling';stopWriting();dogPinned=false;showBonya(false);
  comingNext.textContent='Opening works.';
  let chars=[];
  if(!reducedMotion.matches){
    const collected=createLetters();
    rain=collected.overlay;chars=collected.chars;
  }
  // Hide source text after measuring every rendered letter.
  artboard.classList.add('stage-exiting');
  signatureHit.setAttribute('aria-label','Return to SALATIC home screen');
  if(reducedMotion.matches){
    scene='empty';artboard.classList.add('stage-exited');
    comingNext.textContent='Works stage. Activate the logo to return.';
    return;
  }
  // Quick, gravity-led collapse: minimal stagger, tight sideways movement,
  // short spins, and travel time scaled to the distance each glyph falls.
  // The ease-in curve starts near rest and accelerates downwards.
  let lastEnd=0;
  chars.forEach(function(item,i){
    const a=randomUnit(i*11+7), b=randomUnit(i*17+173), c=randomUnit(i*31+29);
    const drift=(a-.5)*110;
    const fall=Math.max(190,window.innerHeight-item.rect.top+105);
    const spin=(b>.5?1:-1)*(23+c*70);
    const delay=Math.round(c*58+(item.rect.top/window.innerHeight)*20);
    const duration=Math.round(430+Math.sqrt(fall/Math.max(window.innerHeight,1))*280+b*65);
    lastEnd=Math.max(lastEnd,delay+duration);
    item.el.animate([
      {transform:'translate3d(0,0,0) rotate(0deg)',opacity:1},
      {transform:'translate3d('+drift.toFixed(1)+'px,'+fall.toFixed(1)+'px,0) rotate('+spin.toFixed(1)+'deg)',opacity:1}
    ],{duration,delay,easing:'cubic-bezier(.42,0,1,1)',fill:'both'});
  });
  endRainTimer=setTimeout(function(){
    clearLetters();
    if(scene!=='falling')return;
    scene='empty';artboard.classList.add('stage-exited');
    comingNext.textContent='Works stage. Activate the logo to return.';
  },lastEnd+35);
}
folder.addEventListener('click',openWorks);
signatureHit.addEventListener('click',function(){
  if(scene==='empty')resetScene();
});
document.addEventListener('keydown',function(event){
  if(event.key==='Escape'&&scene!=='home'&&!document.getElementById('caseStage')?.classList.contains('kv-fallback-fullscreen'))resetScene();
});


// v0.5 / Simple list-based Finder. Only Setka is a real project at this point.
const portfolioStage=document.getElementById('portfolioStage');
const worksWindow=document.getElementById('worksWindow');
const setkaCase=document.getElementById('projectCase');
const caseTitle=document.getElementById('caseTitle');
const caseRole=document.getElementById('caseRole');
const caseIntro=document.getElementById('caseIntro');
const caseConcept=document.getElementById('caseConcept');
const caseContribution=document.getElementById('caseContribution');
const caseStage=document.getElementById('caseStage');
const casePlaceholder=document.getElementById('casePlaceholder');
const casePagination=document.getElementById('casePagination');
// Only KV images use the portfolio fullscreen viewer. Vimeo uses its native controls.
function isMediaFullscreen(){
  return document.fullscreenElement===caseStage || document.webkitFullscreenElement===caseStage;
}
async function toggleKVFullscreen(){
  if(caseMedia[casePage]?.type!=='kv')return;
  const fallbackClass='kv-fallback-fullscreen';
  if(caseStage.classList.contains(fallbackClass)){
    caseStage.classList.remove(fallbackClass);
    return;
  }
  try{
    if(isMediaFullscreen()){
      const exit=document.exitFullscreen||document.webkitExitFullscreen;
      if(exit)await exit.call(document);
    }else{
      const enter=caseStage.requestFullscreen||caseStage.webkitRequestFullscreen;
      if(enter)await enter.call(caseStage);
      else caseStage.classList.add(fallbackClass);
    }
  }catch(error){
    // iOS Safari may not expose requestFullscreen on arbitrary elements.
    caseStage.classList.add(fallbackClass);
  }
}
caseStage.addEventListener('click',function(event){
  // Click directly on the KV to open it; click again to exit.
  if(event.target.matches('img.case-kv'))toggleKVFullscreen();
});

let casePage=0;
let activeProject='setka';
const projects={
  setka:{
    title:'setka. career jungle',
    role:'role: senior art director',
    paragraphs:[
      "it's easy to get lost or go unnoticed in the career jungle. for setka, a professional networking platform by hh.ru, we created a campaign about making connections and finding your way forward. the challenge was to make the brand more relevant to IT, digital and creative professionals on a limited budget.",
      "the visual concept transforms everyday workplaces into a jungle. coffee waterfalls, walls of keyboards, an HR leopard and offices overgrown with vegetation. through this world, we explored three things setka helps people do: connect, share their experience and discover something new."
    ],
    media:[
      {type:'video',vimeoId:'1240745678',label:'Setka — Video 01'},
      {type:'video',vimeoId:'1240745680',label:'Setka — Video 02'},
      {type:'video',vimeoId:'1240745679',label:'Setka — Video 03'},
      {type:'kv',image:'assets/setka-kv-01.webp',label:'Setka — KV 01'},
      {type:'kv',image:'assets/setka-kv-02.webp',label:'Setka — KV 02'},
      {type:'kv',image:'assets/setka-kv-03.webp',label:'Setka — KV 03'}
    ]
  },
  litres:{
    title:'litres.\ndiscover new releases first',
    role:'role: senior art director',
    paragraphs:[
      'litres has over a million books in its catalog, but instead of focusing on its size, we wanted to highlight a different advantage: new releases often arrive on litres before anywhere else.',
      'this led to the idea of turning readers into literary explorers, with every new book becoming uncharted territory. in the campaign, victoria isakova played three different explorers, each setting off to discover new stories.',
      "responsible for the project's art direction at every stage, from developing the visual concept to overseeing final execution."
    ],
    media:[
      {type:'video',vimeoId:'1240748705',label:'Litres — Discover New Releases First'}
    ]
  },
  dodo:{
    title:'dodo pizza. 15 years of\ndreaming out loud',
    role:'role: senior art director',
    paragraphs:[
      "they say you should keep your wishes to yourself, or they won't come true. but dodo pizza has always done things differently. for the brand's 15th anniversary, we created the campaign \"15 years of dreaming out loud,\" encouraging people to stop keeping their dreams quiet and start saying them out loud.",
      "we brought the same idea into a commercial for dodo's big prize giveaway. the brand makes a wish for viewers to see the ad and discover their chance to win an apartment, a car, a year's supply of pizza, and millions of other prizes. and the wish comes true the moment they're watching."
    ],
    media:[{type:'video',vimeoId:'1243201685',label:'Dodo Pizza — 15 Years of Dreaming Out Loud'}]
  },
  dodoMath:{
    title:'dodo pizza. simple math',
    role:'role: senior art director',
    paragraphs:[
      "when the school year begins, it's not just kids who go back to school. parents find themselves struggling with tricky homework problems all over again. we built dodo pizza's commercial around this contrast: school math can be complicated, but saving money should be simple.",
      "in the commercial, a son brings his parents a geometry textbook, leaving them completely puzzled. but when three pizzas arrive, everything starts to make sense. mathematical formulas come to life on screen, turning an ordinary family dinner into a lesson in simple math: three pizzas for 900 rubles."
    ],
    media:[{type:'video',vimeoId:'1243208592',label:'Dodo Pizza — Simple Math'}]
  }
};
let caseMedia=projects[activeProject].media;

function clearPlayer(){
  caseStage.classList.remove('kv-fallback-fullscreen');
  // Always stop the previous Vimeo film and remove its iframe.
  for(const media of caseStage.querySelectorAll('iframe, img.case-kv')){
    media.remove();
  }
}
function showCaseMedia(index){
  casePage=(index+caseMedia.length)%caseMedia.length;
  clearPlayer();
  const item=caseMedia[casePage];
  casePagination.textContent=String(casePage+1).padStart(2,'0')+' / '+String(caseMedia.length).padStart(2,'0');
  if(item.type==='video'){
    casePlaceholder.hidden=true;
    const iframe=document.createElement('iframe');
    iframe.src='https://player.vimeo.com/video/'+item.vimeoId+'?title=0&byline=0&portrait=0&dnt=1&transparent=0';
    iframe.title=item.label+' — Vimeo';
    iframe.allow='autoplay; fullscreen; picture-in-picture';
    iframe.setAttribute('allowfullscreen','');
    iframe.referrerPolicy='strict-origin-when-cross-origin';
    caseStage.appendChild(iframe);
  }else{
    // Gracefully label any KV that has not been uploaded into assets/ yet.
    casePlaceholder.textContent='loading / '+item.label;
    casePlaceholder.hidden=false;
    const image=document.createElement('img');
    image.className='case-kv';
    image.alt=item.label;
    image.decoding='async';
    image.onload=function(){
      if(image.isConnected)casePlaceholder.hidden=true;
    };
    image.onerror=function(){
      image.remove();
      casePlaceholder.textContent='KV not uploaded yet / '+item.label;
      casePlaceholder.hidden=false;
    };
    image.src=item.image;
    caseStage.appendChild(image);
  }
}
function hideCasePreviews(){
  for(const preview of [document.getElementById('setkaHoverPreview'),document.getElementById('litresHoverPreview'),document.getElementById('dodoHoverPreview'),document.getElementById('dodoMathHoverPreview')]){
    preview.classList.remove('is-visible');
    preview.setAttribute('aria-hidden','true');
  }
}
function showWorksList(){
  hideCasePreviews();
  clearPlayer();
  worksWindow.hidden=false;
  setkaCase.hidden=true;
  scene='empty';
  comingNext.textContent='Selected works. Four projects are available.';
  if(window.innerWidth<=900)window.scrollTo({top:0,behavior:'instant'});
}
function showProjectCase(key){
  if(scene!=='empty'||!projects[key])return;
  hideCasePreviews();
  activeProject=key;
  const project=projects[key];
  caseMedia=project.media;
  caseTitle.textContent=project.title;
  caseRole.textContent=project.role;
  caseIntro.textContent=project.paragraphs[0]||'';
  caseConcept.textContent=project.paragraphs[1]||'';
  caseContribution.textContent=project.paragraphs[2]||'';
  caseContribution.hidden=!project.paragraphs[2];
  setkaCase.dataset.project=key;
  setkaCase.setAttribute('aria-label',project.title.replace('\n',' ')+' case');
  worksWindow.hidden=true;
  setkaCase.hidden=false;
  scene='case';
  showCaseMedia(0);
  comingNext.textContent=key+' case, use back to works to return.';
  if(window.innerWidth<=900)window.scrollTo({top:0,behavior:'instant'});
}
function bindCaseRow(rowId,previewId,projectKey){
  const row=document.getElementById(rowId);
  const preview=document.getElementById(previewId);
  function toggle(show){
    const visible=show&&scene==='empty'&&!worksWindow.hidden;
    if(visible)hideCasePreviews();
    preview.classList.toggle('is-visible',visible);
    preview.setAttribute('aria-hidden',String(!visible));
  }
  row.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')toggle(true)});
  row.addEventListener('pointerleave',()=>toggle(false));
  row.addEventListener('focus',()=>toggle(true));
  row.addEventListener('blur',()=>toggle(false));
  row.addEventListener('click',()=>showProjectCase(projectKey));
}
bindCaseRow('openSetka','setkaHoverPreview','setka');
bindCaseRow('openLitres','litresHoverPreview','litres');
bindCaseRow('openDodo','dodoHoverPreview','dodo');
bindCaseRow('openDodoMath','dodoMathHoverPreview','dodoMath');
// Locally prepared screenshot-based thumbnail is preferred; a Vimeo thumbnail
// provides a temporary fallback until the WebP is committed to assets/.
const dodoPreviewImage=document.querySelector('#dodoHoverPreview img');
dodoPreviewImage.addEventListener('error',function(){if(!this.dataset.fallback){this.dataset.fallback='true';this.src='https://vumbnail.com/1243201685.jpg';}});
const dodoMathPreviewImage=document.querySelector('#dodoMathHoverPreview img');
dodoMathPreviewImage.addEventListener('error',function(){
  if(!this.dataset.fallback){
    this.dataset.fallback='true';
    this.src='https://vumbnail.com/1243208592.jpg';
  }
});
const litresPreviewImage=document.querySelector('#litresHoverPreview img');
litresPreviewImage.addEventListener('error',function(){
  if(!this.dataset.fallback){
    this.dataset.fallback='true';
    this.src='https://vumbnail.com/1240748705.jpg';
  }
});
document.getElementById('caseBack').addEventListener('click',showWorksList);
document.getElementById('caseClose').addEventListener('click',showWorksList);
document.getElementById('mobileStageLogo').addEventListener('click',resetScene);
document.getElementById('worksClose').addEventListener('click',resetScene);
const projectOrder=['setka','litres','dodo','dodoMath'];
function stepCaseMedia(direction){
  if(caseMedia.length===1){
    const index=projectOrder.indexOf(activeProject);
    const next=projectOrder[(index+direction+projectOrder.length)%projectOrder.length];
    showWorksList();
    showProjectCase(next);
    return;
  }
  showCaseMedia(casePage+direction);
}
document.getElementById('caseLeft').addEventListener('click',function(){stepCaseMedia(-1);});
document.getElementById('caseRight').addEventListener('click',function(){stepCaseMedia(1);});
document.addEventListener('keydown',function(event){
  if(event.key==='Escape'&&caseStage.classList.contains('kv-fallback-fullscreen')){
    caseStage.classList.remove('kv-fallback-fullscreen');
    return;
  }
  if(scene==='case' && event.key==='ArrowRight')stepCaseMedia(1);
  if(scene==='case' && event.key==='ArrowLeft')stepCaseMedia(-1);
});
// Existing classes decide when the letters have finished their exit animation.
const stageObserver=new MutationObserver(function(){
  const isVisible=artboard.classList.contains('stage-exited');
  portfolioStage.setAttribute('aria-hidden',String(!isVisible));
  if(!isVisible){hideCasePreviews();clearPlayer();worksWindow.hidden=false;setkaCase.hidden=true;casePage=0;}
});
stageObserver.observe(artboard,{attributes:true,attributeFilter:['class']});
