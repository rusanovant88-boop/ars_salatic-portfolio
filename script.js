// Desktop retains the exact 1440x900 reference artboard.
// Mobile (<901px) is laid out natively; it must never be scaled down as a desktop image.
const artboard = document.getElementById('artboard');
const folder = document.getElementById('worksFolder');
const comingNext = document.getElementById('comingNext');
const bonyaTrigger = document.getElementById('bonyaTrigger');
const bonyaWalker = document.querySelector('.bonya-patrol-traveler');
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
bonyaTrigger.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch'&&!dogPinned&&!bonyaWalker?.matches(':hover'))showBonya(false);});
// The tiny walking Bonya reveals the SAME photo as her name.
// The hit area travels with the sprite; empty parts of her path stay transparent.
bonyaWalker?.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')showBonya(true);});
bonyaWalker?.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch'&&!dogPinned&&!bonyaTrigger.matches(':hover'))showBonya(false);});
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
const username=document.querySelector('.username');
const usernamePhoto=document.querySelector('.username-photo');
let lookingAtPortrait=false;
function pointEyesAtPortrait(){
  if(!lookingAtPortrait)return;
  const photo=usernamePhoto.getBoundingClientRect();
  aimEyes(photo.left+photo.width/2,photo.top+photo.height/2);
}
function setPortraitGaze(show){
  if(lookingAtPortrait===show)return;
  lookingAtPortrait=show;
  eyes.classList.toggle('eyes-portrait-gaze',show);
  if(show){
    pointEyesAtPortrait();
  }else if(lastPointer){
    aimEyes(...lastPointer);
  }else{
    pupils.forEach(p=>p.removeAttribute('transform'));
  }
}
username.addEventListener('pointerenter',event=>{
  if(event.pointerType!=='touch')setPortraitGaze(true);
});
username.addEventListener('pointerleave',event=>{
  if(event.pointerType!=='touch'&&!username.matches(':focus-visible'))setPortraitGaze(false);
});
username.addEventListener('focus',()=>{
  if(username.matches(':focus-visible'))setPortraitGaze(true);
});
username.addEventListener('blur',()=>{
  // Mobile :hover can stay active after a tap, so it is not the source of truth.
  if(window.innerWidth<=900){
    setPortraitGaze(username.classList.contains('portrait-touch-open'));
    return;
  }
  setPortraitGaze(username.matches(':hover'));
});
// Touchscreens have no real hover. First tap opens portrait and gaze;
// second tap closes both. A tap elsewhere also dismisses them.
function setMobilePortraitOpen(open){
  username.classList.toggle('portrait-touch-open',open);
  setPortraitGaze(open);
}
username.addEventListener('click',event=>{
  if(window.innerWidth>900)return;
  event.stopPropagation();
  setMobilePortraitOpen(!username.classList.contains('portrait-touch-open'));
});
document.addEventListener('pointerdown',event=>{
  if(window.innerWidth>900||!username.classList.contains('portrait-touch-open'))return;
  if(username.contains(event.target))return;
  setMobilePortraitOpen(false);
});
window.addEventListener('resize',()=>{
  if(window.innerWidth>900&&username.classList.contains('portrait-touch-open')){
    setMobilePortraitOpen(false);
  }else{
    pointEyesAtPortrait();
  }
},{passive:true});
function aimEyes(clientX,clientY){
  const rect=eyes.getBoundingClientRect();
  const cx=rect.left+rect.width/2;
  const cy=rect.top+rect.height/2;
  // Track distance from the eyes, not the full viewport, so even small
  // nearby cursor moves produce a clearly visible change in gaze.
  // The smooth tanh limit keeps both pupils within their clipped shapes.
  const dx=clientX-cx;
  const dy=clientY-cy;
  const tx=7.5*Math.tanh(dx/170);
  const ty=3.5*Math.tanh(dy/120);
  pupils.forEach(p=>p.setAttribute('transform',`translate(${tx.toFixed(2)} ${ty.toFixed(2)})`));
}
document.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch')return;
  lastPointer=[e.clientX,e.clientY];
  if(lookingAtPortrait||animationQueued)return;
  animationQueued=true;
  requestAnimationFrame(()=>{
    animationQueued=false;
    if(lastPointer&&!lookingAtPortrait)aimEyes(...lastPointer);
  });
},{passive:true});

// Trigger the shy glance unless the portrait currently owns the eyes.
eyes.addEventListener('pointerenter',event=>{
  if(event.pointerType!=='touch'&&!lookingAtPortrait)aimEyes(event.clientX,event.clientY);
});
eyes.addEventListener('pointerleave',event=>{
  if(event.pointerType!=='touch'&&!lookingAtPortrait)aimEyes(event.clientX,event.clientY);
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
// Restore the exact original Salatic signature. No synthetic traces or reveal masks.
// The button wrapper remains because it also navigates home from the Works stage.
const signatureImg = document.querySelector('.signature');
const signatureHit = document.createElement('button');
signatureHit.type = 'button';
signatureHit.id = 'signatureHit';
signatureHit.className = 'signature-hit';
signatureHit.setAttribute('aria-label','Open SALATIC home screen');
signatureImg.parentElement.insertBefore(signatureHit,signatureImg);
signatureHit.appendChild(signatureImg);
// Kept for callers in the Works transition; intentionally no handwriting animation.
function stopWriting(){}
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');


// v0.4: letters fall away; original signature becomes the only remaining UI.
let scene='home', rain=null, endRainTimer=null;
const charRange=document.createRange();

function randomUnit(seed){
  let n=Math.imul(seed+1,2654435761)>>>0;
  n^=n>>>16; n=Math.imul(n,2246822507); n^=n>>>13;
  return (n>>>0)/4294967295;
}
function createLettersFromRoots(roots,clipEl=null){
  const overlay=document.createElement('div');
  overlay.className='letter-rain';overlay.setAttribute('aria-hidden','true');
  const fragment=document.createDocumentFragment();
  const chars=[],scale=previousScale||1;
  for(const root of roots){
    if(!root||Number(getComputedStyle(root).opacity)<0.05)continue;
    const clipRect=clipEl&&clipEl.contains(root)?clipEl.getBoundingClientRect():null;
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
          if(rect.width>0&&rect.height>0&&(!clipRect||
             (rect.left<clipRect.right&&rect.right>clipRect.left&&rect.top<clipRect.bottom&&rect.bottom>clipRect.top))){
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
function createLetters(){
  return createLettersFromRoots(['.username','.role','.folder-name','.bio']
    .map(selector=>artboard.querySelector(selector)).filter(Boolean));
}
function createFinderLetters(){
  const list=worksWindow.querySelector('.works-list');
  const roots=portfolioStage.querySelectorAll(
    '.works-bar-name, .works-bar-version, .works-columns, .works-file, .works-footer'
  );
  return createLettersFromRoots(roots,list);
}
function createCaseLetters(){
  // The iframe/imagery does not fall: only text that belongs to the case UI.
  // Do not duplicate invisible content from projects further down the page.
  const roots=setkaCase.querySelectorAll(
    '.case-back, #caseTitle, #caseTag, #caseRole, #caseIntro, #caseConcept, #caseContribution, #casePagination'
  );
  return createLettersFromRoots([...roots].filter(root=>{
    const box=root.getBoundingClientRect();
    return box.bottom>0&&box.top<window.innerHeight&&box.right>0&&box.left<window.innerWidth;
  }));
}
// Shared physical behavior: the Finder and the home screen use the same gravity,
// sideways drift, rotations, stagger and duration.
function animateFallingLetters(chars){
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
  return lastEnd;
}
function clearLetters(){
  if(endRainTimer!==null){clearTimeout(endRainTimer);endRainTimer=null;}
  if(rain){rain.remove();rain=null;}
}
function resetScene(){
  cancelWindowDotWave();
  const stage=document.getElementById('caseStage');
  if(stage)stage.classList.remove('kv-fallback-fullscreen');
  clearLetters();
  document.getElementById('worksWindow')?.classList.remove('case-raining');
  document.getElementById('projectCase')?.classList.remove('case-raining');
  scene='home';
  stopWriting();
  artboard.classList.remove('stage-exiting','stage-exited');
  signatureHit.setAttribute('aria-label','Return to SALATIC home screen');
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
    startWindowDotWave(document.getElementById('worksWindow'));
    return;
  }
  const lastEnd=animateFallingLetters(chars);
  endRainTimer=setTimeout(function(){
    clearLetters();
    if(scene!=='falling')return;
    scene='empty';artboard.classList.add('stage-exited');
    comingNext.textContent='Works stage. Activate the logo to return.';
    startWindowDotWave(document.getElementById('worksWindow'));
  },lastEnd+35);
}
folder.addEventListener('click',openWorks);
// Mobile has no hover. Play the existing bounce fully before navigating home.
// Desktop keeps its original immediate action and hover animation.
function activateSalaticLogo(button){
  if(window.innerWidth>900||reducedMotion.matches){
    returnHomeWithLetters();
    return;
  }
  if(button.classList.contains('mobile-logo-tapped'))return;
  const previousScene=scene;
  button.classList.add('mobile-logo-tapped');
  window.setTimeout(function(){
    button.classList.remove('mobile-logo-tapped');
    // On the intro the logo only bounces. In Works/Case the usual letters fall next.
    if(previousScene!=='home'&&scene===previousScene)returnHomeWithLetters();
  },640);
}
signatureHit.addEventListener('click',function(){activateSalaticLogo(signatureHit);});
document.addEventListener('keydown',function(event){
  if(event.key==='Escape'&&scene!=='home'&&!document.getElementById('caseStage')?.classList.contains('kv-fallback-fullscreen'))resetScene();
});


// v0.5 / Simple list-based Finder. Only Setka is a real project at this point.
const portfolioStage=document.getElementById('portfolioStage');
const worksWindow=document.getElementById('worksWindow');
const setkaCase=document.getElementById('projectCase');
/* Bounce window lights in sequence, one second after each scene opens.
   A new scene cancels the old wave, so navigation never leaks animations. */
let dotWaveTimer=null;
let dotWaveTarget=null;
function cancelWindowDotWave(){
  if(dotWaveTimer!==null){clearTimeout(dotWaveTimer);dotWaveTimer=null;}
  if(dotWaveTarget){dotWaveTarget.classList.remove('window-dot-wave');dotWaveTarget=null;}
}
function startWindowDotWave(target){
  cancelWindowDotWave();
  if(reducedMotion.matches||!target)return;
  target.classList.add('window-dot-wave');
  dotWaveTarget=target;
  dotWaveTimer=setTimeout(()=>{
    target.classList.remove('window-dot-wave');
    if(dotWaveTarget===target)dotWaveTarget=null;
    dotWaveTimer=null;
  },4900);
}

const caseTitle=document.getElementById('caseTitle');
const caseTag=document.getElementById('caseTag');
const caseRole=document.getElementById('caseRole');
const caseIntro=document.getElementById('caseIntro');
const caseConcept=document.getElementById('caseConcept');
const caseContribution=document.getElementById('caseContribution');
const caseStage=document.getElementById('caseStage');
const casePlaceholder=document.getElementById('casePlaceholder');
const casePagination=document.getElementById('casePagination');
const posterReader=document.createElement('dialog');
posterReader.className='poster-reader';
posterReader.setAttribute('aria-label','Read print at full size');
posterReader.innerHTML=`
  <div class="poster-reader-view" tabindex="0" aria-label="Drag to move the print; use plus and minus to zoom">
    <img class="poster-reader-image" alt="" draggable="false">
  </div>
  <div class="poster-reader-controls" aria-label="Print zoom controls">
    <span class="poster-reader-hint">drag to read</span>
    <button type="button" data-action="out" aria-label="Zoom out">−</button>
    <output class="poster-reader-level">100%</output>
    <button type="button" data-action="in" aria-label="Zoom in">+</button>
    <button type="button" data-action="close" aria-label="Close fullscreen print">×</button>
  </div>`;
document.body.appendChild(posterReader);
const posterReaderImage=posterReader.querySelector('.poster-reader-image');
const posterReaderView=posterReader.querySelector('.poster-reader-view');
const posterReaderLevel=posterReader.querySelector('.poster-reader-level');
let posterZoom=1,posterOffsetX=0,posterOffsetY=0;
function renderPosterReader(){
  posterReaderImage.style.transform='translate('+posterOffsetX+'px,'+posterOffsetY+'px) scale('+posterZoom+')';
  posterReaderLevel.textContent=Math.round(posterZoom*100)+'%';
  posterReaderView.classList.toggle('is-zoomed',posterZoom>1);
}
function setPosterZoom(value){
  const next=Math.max(1,Math.min(6,value));
  if(next===1){posterOffsetX=0;posterOffsetY=0;}
  posterZoom=next;
  renderPosterReader();
}
function openPosterReader(src,label){
  posterZoom=1;posterOffsetX=0;posterOffsetY=0;
  posterReaderImage.src=src;
  posterReaderImage.alt=label;
  renderPosterReader();
  if(!posterReader.open)posterReader.showModal();
  posterReaderView.focus({preventScroll:true});
}
posterReader.querySelector('[data-action="close"]').addEventListener('click',()=>posterReader.close());
posterReader.querySelector('[data-action="in"]').addEventListener('click',()=>setPosterZoom(posterZoom*1.6));
posterReader.querySelector('[data-action="out"]').addEventListener('click',()=>setPosterZoom(posterZoom/1.6));
posterReader.addEventListener('close',()=>{posterReaderImage.removeAttribute('src');});
posterReader.addEventListener('keydown',event=>{
  // Do not let the site's global Escape or arrow navigation close the case.
  event.stopPropagation();
  if(event.key==='Escape')posterReader.close();
  if(event.key==='+'||event.key==='=')setPosterZoom(posterZoom*1.6);
  if(event.key==='-')setPosterZoom(posterZoom/1.6);
});
posterReaderView.addEventListener('wheel',event=>{
  event.preventDefault();
  setPosterZoom(posterZoom*(event.deltaY<0?1.12:1/1.12));
},{passive:false});
let posterDrag=null;
posterReaderView.addEventListener('pointerdown',event=>{
  if(posterZoom<=1)return;
  posterDrag={id:event.pointerId,x:event.clientX,y:event.clientY,startX:posterOffsetX,startY:posterOffsetY};
  posterReaderView.setPointerCapture(event.pointerId);
  posterReaderView.classList.add('is-dragging');
});
posterReaderView.addEventListener('pointermove',event=>{
  if(!posterDrag||event.pointerId!==posterDrag.id)return;
  posterOffsetX=posterDrag.startX+event.clientX-posterDrag.x;
  posterOffsetY=posterDrag.startY+event.clientY-posterDrag.y;
  renderPosterReader();
});
function endPosterDrag(){posterDrag=null;posterReaderView.classList.remove('is-dragging');}
posterReaderView.addEventListener('pointerup',endPosterDrag);
posterReaderView.addEventListener('pointercancel',endPosterDrag);

// Only KV images use the portfolio fullscreen viewer. Vimeo uses its native controls.
function isMediaFullscreen(){
  return document.fullscreenElement===caseStage || document.webkitFullscreenElement===caseStage;
}
async function toggleKVFullscreen(){
  if(!['kv','pair'].includes(caseMedia[casePage]?.type))return;
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
  if(!event.target.matches('img.case-kv'))return;
  // Unlike the two-up layout, the reader opens one ORIGINAL vertical print.
  if(event.target.closest('.case-poster-pair')||caseMedia[casePage]?.reader){
    openPosterReader(event.target.currentSrc||event.target.src,event.target.alt);
  }else{
    toggleKVFullscreen();
  }
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
    media:[{type:'video',vimeoId:'1243208592',label:'Dodo Pizza — Simple Math'}]  },
  kion:{
    title:'kion top',
    role:'role: senior art director',
    paragraphs:[
      "with more information and content around us than ever before, there's simply not enough time to take it all in. we decided to take this idea to the extreme: what if a person had three heads?",
      "in the commercial for kion, we brought this idea to life, turning three heads into a visual metaphor. because sometimes, to watch more, you need to push the boundaries of perception."
    ],
    media:[{type:'video',vimeoId:'1243214506',label:'KION — TOP'}]
  },
  dixy:{
    title:'dixy. cracked',
    role:'role: senior art director',
    paragraphs:[
      "we created an anime-style animated commercial for dixy's \"cracked\" collectible toy promotion. with just three weeks to complete the project, we quickly assembled a team of artists and animators from around the world, including kazakhstan, dubai, bali, khanty-mansiysk, and argentina.",
      "working across different time zones, we ran production in parallel to meet the campaign's launch deadline."
    ],
    media:[{type:'video',vimeoId:'1243234014',label:'Dixy — Cracked'}]
  },
  triazavirin:{
    title:'triazavirin. what is care?',
    role:'role: senior art director',
    paragraphs:[
      "when triazavirin became available over the counter, the brand needed to reach a wider audience for the first time. instead of relying on typical pharmaceutical advertising clichés, we decided to tell a simple, human story about caring for one another.",
      "the result was \"care is the best medicine,\" a commercial that follows a day in the life of an ordinary family through the eyes of the one who needs love and support the most. at its heart is a simple idea: caring for our loved ones starts with the little things we do."
    ],
    media:[{type:'video',vimeoId:'1243246229',label:'Triazavirin — What Is Care?'}]  },
  kazakhstan:{
    "title": "kazakhstan chocolate",
    "tag": "spec ad · unofficial concept",
    "role": "role: senior art director",
    "paragraphs": [
      "kazakhstan chocolate has long been one of the country's most recognizable symbols. its iconic blue-and-gold wrapper and distinctive taste are known far beyond kazakhstan. people bring it back from their travels and give it to friends and loved ones as a little piece of their homeland.",
      "the name \"kazakhstan\" can be interpreted as \"the land of free people.\" this inspired the idea behind our unofficial commercial: kazakhstan chocolate is the taste of a free land. the taste of freedom."
    ],
    "media": [
      {
        "type": "video",
        "vimeoId": "1243259860",
        "label": "Kazakhstan Chocolate — Unofficial Spec Ad"
      }
    ]
  },
  avionero:{
    "title": "avionero. seeing is believing",
    "role": "role: senior art director",
    "paragraphs": [
      "for avionero, we created a minimalist commercial where sound takes center stage. instead of showing typical travel footage, we let the audience hear people witnessing a whale emerging from the water. the sounds of nature, the whale itself, and the excited reactions of onlookers create a sense of being there.",
      "we built the commercial around asmr and the viewer's imagination, leaving the most spectacular moment unseen. because some experiences are better witnessed with your own eyes. the idea comes together in the final tagline: \"it's better to see once. travel with avionero.\""
    ],
    "media": [
      {
        "type": "video",
        "vimeoId": "1243258410",
        "label": "Avionero — Seeing Is Believing"
      }
    ]  },
  akademichesky:{
    "title": "akademichesky — our handiwork",
    "role": "role: senior art director",
    "paragraphs": [
      "for the past 20 years, kortros has been building akademichesky in yekaterinburg. not just residential buildings, but an entire neighborhood with schools, kindergartens, parks, and even its own tram line.",
      "we decided to bring this idea to life with a giant hand that shapes the neighborhood right before its residents’ eyes. it unveils a new school, lays tram tracks, installs a basketball hoop, and even helps two strangers meet.",
      "we filmed on the real streets of akademichesky and brought the giant hand to life with cgi. a way to show just how much goes into turning a collection of buildings into a neighborhood people want to call home."
    ],
    "media": [
      {
        "type": "video",
        "vimeoId": "1243393457",
        "label": "Akademichesky — Our Handiwork"
      }
    ]
  },
  mikenco:{
    title:'mikenco. forever love',
    role:'role: senior art director',
    paragraphs:[
      "we shot a fashion film for vietnamese brand mikenco in kazakhstan, drawing inspiration from the fashion campaigns of the '80s and '90s, with their distinctive atmosphere, colors, and styling.",
      "the funny thing is, a lot of people thought the falling leaves were cgi. but there were no visual effects involved. just a guy standing above the set, shaking a branch to make the leaves fall perfectly into frame."
    ],
    media:[{type:'video',vimeoId:'1243586795',label:'MIKENCO — Forever Love'}]
  },
  mitchme:{
    title:'mitch&me.\nchristmas is easy to ruin',
    role:'role: senior art director',
    paragraphs:[
      "dog shampoo brand mitch&me wanted to wish dog owners a merry christmas and a happy new year. but a typical holiday greeting just wasn't the brand's style.",
      "so we created a playful holiday message with a simple reminder: always clean up after your dog. because ruining christmas is easier than you think."
    ],
    media:[
      {type:'kv',image:'assets/mitchme-christmas-print.webp',fallbackImage:'https://vumbnail.com/1244824452.jpg',label:'mitch&me — Christmas Is Easy to Ruin — Print'},
      {type:'video',vimeoId:'1244824452',label:'mitch&me — Christmas Is Easy to Ruin'}
    ]
  },
  mitchmeHalloween:{
    title:'mitch&me. non-scary halloween',
    role:'role: senior art director',
    paragraphs:[
      "large black dogs and so-called fighting breeds are often feared, making it especially difficult for them to find new homes. for dog shampoo brand mitch&me, we decided to challenge these stereotypes using the scariest holiday of the year: halloween.",
      "instead of telling traditional horror stories, we showed how a big, intimidating dog could actually make you feel safe in frightening situations. the campaign gained widespread attention across the media and social networks. most importantly, it helped 12 shelter dogs find new homes."
    ],
    media:[
      {type:'kv',image:'assets/mitchme-halloween-freddy.webp',label:'mitch&me — Non-Scary Halloween — Freddy'},
      {type:'kv',image:'assets/mitchme-halloween-jason.webp',label:'mitch&me — Non-Scary Halloween — Jason'},
      {type:'kv',image:'assets/mitchme-halloween-pennywise.webp',label:'mitch&me — Non-Scary Halloween — Pennywise'},
      {type:'video',vimeoId:'519386527',label:'mitch&me — Non-Scary Halloween — Case Study'}
    ]
  },
  donorsearch:{
    title:'donorsearch. 10% for life',
    role:'role: senior art director',
    paragraphs:[
      "a blood donor gives around 10% of their blood to help save lives. we asked brands to do the same by donating 10% of their advertising space and content to raise awareness of blood donation.",
      "together with donorsearch, we turned this simple idea into a nationwide challenge, bringing major brands together and reaching over 40 million people."
    ],
    media:[
      {type:'video',vimeoId:'1244829007',label:'Donorsearch — 10% for Life — Case Study'}
    ]
  },
  taezhnyDar:{
    title:'taezhny dar. exists in nature',
    role:'role: senior art director',
    paragraphs:[
      "taezhny dar is a soft drink made with real berries and herbs. but the word \"natural\" has been so overused in advertising that we decided to avoid it altogether. instead, we wanted to show the product as it really is, without any unnecessary polish.",
      "we took inspiration from a familiar sight in russia: people selling freshly picked wild berries in cut-off plastic bottles along the roadside. we did the same with taezhny dar bottles, filled them with real berries, and cast actual roadside vendors in the commercials. that's how the \"exists in nature\" campaign came to life."
    ],
    media:[
      {type:'video',vimeoId:'1244831185',label:'Taezhny Dar — Exists in Nature — Film 01'},
      {type:'video',vimeoId:'1244831184',label:'Taezhny Dar — Exists in Nature — Film 02'},
      {type:'video',vimeoId:'1244831183',label:'Taezhny Dar — Exists in Nature — Film 03'}
    ]
  },
  shortShotFest:{
    title:"short shot fest. life's too short",
    role:'role: senior art director',
    paragraphs:[
      "for moscow's short shot fest, we created a campaign where the entire film unfolds in the viewer's imagination. instead of showing actual movie scenes, we used short stories with unexpected twists and endings, leaving everyone to imagine the visuals in their own way.",
      "the idea caught on so well that people started coming up with their own endings. in china, it even sparked a social media challenge where users shared alternative endings to the stories. the campaign also won two bronze awards at the epica awards for copywriting and storytelling."
    ],
    media:[
      {type:'pair',label:'Short Shot Fest — Two English Print Stories',fallbackImage:'assets/short-shot-fest-lifes-too-short-01-prints-en.webp',images:[
        {image:'assets/short-shot-fest-print-en-01.jpg',label:'Short Shot Fest — English Print 01'},
        {image:'assets/short-shot-fest-print-en-02.jpg',label:'Short Shot Fest — English Print 02'}
      ]},
      {type:'pair',label:'Short Shot Fest — Two Russian Print Stories',fallbackImage:'assets/short-shot-fest-lifes-too-short-02-prints-ru.webp',images:[
        {image:'assets/short-shot-fest-print-ru-01.jpg',label:'Short Shot Fest — Russian Print 01'},
        {image:'assets/short-shot-fest-print-ru-02.jpg',label:'Short Shot Fest — Russian Print 02'}
      ]},
      {type:'video',vimeoId:'679473458',label:'Short Shot Fest — Life’s Too Short — Case Study'},
      {type:'kv',image:'assets/short-shot-fest-lifes-too-short-04-mockups.webp',label:'Short Shot Fest — Campaign Mockups'}
    ]
  },
  mitchmeDogsFirst:{
    title:'mitch&me. dogs were the first',
    role:'role: senior art director',
    paragraphs:[
      "on cosmonautics day, we usually celebrate the people who conquered space. but before humans ventured into space, dogs paved the way. many of them never made it back to earth.",
      "for mitch&me, we wanted to pay tribute to these forgotten heroes. we created a print featuring a dog's paw print on the moon and a film made from archival footage of early space experiments. the result was \"dogs were the first,\" a campaign honoring the animals that gave their lives in the name of scientific progress."
    ],
    media:[
      {type:'kv',image:'assets/mitchme-dogs-first-print-en.jpg',label:'mitch&me — Dogs Were the First — English Print',reader:true},
      {type:'kv',image:'assets/mitchme-dogs-first-print-ru.jpg',label:'mitch&me — Dogs Were the First — Russian Print',reader:true},
      {type:'video',vimeoId:'681410004',label:'mitch&me — Dogs Were the First — Case Study'}
    ]
  }
};
let caseMedia=projects[activeProject].media;

function clearPlayer(){
  caseStage.classList.remove('kv-fallback-fullscreen');
  if(posterReader.open)posterReader.close();
  // Stop Vimeo and clean both single artboards and original-resolution pairs.
  for(const media of caseStage.querySelectorAll('iframe, .case-poster-pair, img.case-kv')){
    media.remove();
  }
}
function showCaseMedia(index){
  casePage=(index+caseMedia.length)%caseMedia.length;
  clearPlayer();
  const item=caseMedia[casePage];
  casePagination.textContent=String(casePage+1).padStart(2,'0')+' / '+String(caseMedia.length).padStart(2,'0');
  if(item.type==='pair'){
    casePlaceholder.textContent='loading / '+item.label;
    casePlaceholder.hidden=false;
    const pair=document.createElement('div');
    pair.className='case-poster-pair';
    pair.setAttribute('aria-label',item.label);
    let loaded=0,failed=false;
    const showPreviousLayout=()=>{
      if(failed)return;
      failed=true;
      pair.remove();
      // Keep the existing two-up artwork visible until the full-size
      // original files have been uploaded into assets/.
      const fallback=document.createElement('img');
      fallback.className='case-kv';
      fallback.alt=item.label;
      fallback.onload=()=>{if(fallback.isConnected)casePlaceholder.hidden=true;};
      fallback.onerror=()=>{fallback.remove();casePlaceholder.textContent='High-resolution prints not uploaded yet';};
      fallback.src=item.fallbackImage;
      caseStage.appendChild(fallback);
    };
    for(const poster of item.images){
      const image=document.createElement('img');
      image.className='case-kv case-poster-original';
      image.alt=poster.label;
      image.title='Click to read this print at full resolution';
      image.decoding='async';
      image.draggable=false;
      image.onload=()=>{
        loaded++;
        if(!failed&&loaded===item.images.length&&pair.isConnected)casePlaceholder.hidden=true;
      };
      image.onerror=showPreviousLayout;
      image.src=poster.image;
      pair.appendChild(image);
    }
    caseStage.appendChild(pair);
  }else if(item.type==='video'){
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
      if(item.fallbackImage&&!image.dataset.fallbackUsed){
        image.dataset.fallbackUsed='true';
        image.src=item.fallbackImage;
        return;
      }
      image.remove();
      casePlaceholder.textContent='Print preview temporarily unavailable / '+item.label;
      casePlaceholder.hidden=false;
    };
    image.src=item.image;
    caseStage.appendChild(image);
  }
}
function hideCasePreviews(){
  for(const preview of document.querySelectorAll('.works-hover-preview')){
    preview.classList.remove('is-visible');
    preview.setAttribute('aria-hidden','true');
  }
  // Mobile previews live directly below their file rows and reflow the list.
  for(const preview of document.querySelectorAll('.mobile-case-preview.is-open')){
    preview.classList.remove('is-open');
    preview.setAttribute('aria-hidden','true');
    preview.tabIndex=-1;
    const row=preview.previousElementSibling;
    if(row&&row.classList.contains('works-file'))row.setAttribute('aria-expanded','false');
  }
}
function showWorksList(){
  cancelWindowDotWave();
  hideCasePreviews();
  worksWindow.classList.remove('case-raining');
  setkaCase.classList.remove('case-raining');
  clearPlayer();
  worksWindow.hidden=false;
  setkaCase.hidden=true;
  scene='empty';
  comingNext.textContent='Selected works. Seventeen projects are available.';
  if(window.innerWidth<=900)window.scrollTo({top:0,behavior:'instant'});
  startWindowDotWave(worksWindow);
}
// The same glyph collector and gravity used by Home → Works and Works → Case
// also handle Case → Works, Case → Home, and Works → Home.
function transitionOutOfPortfolio(destination){
  if(scene!=='case'&&scene!=='empty')return;
  cancelWindowDotWave();
  const fromCase=scene==='case';
  const finish=()=>destination==='home'?resetScene():showWorksList();
  if(reducedMotion.matches){finish();return;}
  hideCasePreviews();
  const {overlay,chars}=fromCase?createCaseLetters():createFinderLetters();
  if(!chars.length){overlay.remove();finish();return;}
  rain=overlay;
  scene='return-falling'; // Lock buttons during transition.
  comingNext.textContent=destination==='home'?'Returning to home.':'Returning to selected works.';
  if(fromCase){
    setkaCase.classList.add('case-raining');
    clearPlayer(); // Stop Vimeo immediately on navigation; keep case shell visible.
  }else{
    worksWindow.classList.add('case-raining');
  }
  const lastEnd=animateFallingLetters(chars);
  endRainTimer=setTimeout(function(){
    if(scene!=='return-falling')return;
    clearLetters();
    finish();
  },lastEnd+35);
}
function backToWorksWithLetters(){
  if(scene==='case')transitionOutOfPortfolio('works');
}
function returnHomeWithLetters(){
  if(scene==='home'||scene==='return-falling')return;
  if(scene==='case'||scene==='empty'){
    transitionOutOfPortfolio('home');
    return;
  }
  // An already-running transition can be cancelled without animating
  // two competing sets of glyphs.
  resetScene();
}
function displayProjectCase(key){
  cancelWindowDotWave();
  hideCasePreviews();
  activeProject=key;
  const project=window.salaticLocale?.project(key)||projects[key];
  caseMedia=project.media;
  caseTitle.textContent=project.title;
  caseTag.textContent=project.tag||'';
  caseTag.hidden=!project.tag;
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
  startWindowDotWave(setkaCase);
}
function showProjectCase(key,animate=true){
  if(scene!=='empty'||!projects[key])return;
  hideCasePreviews();
  // Accessibility and automatic next-case navigation skip the visual transition.
  if(!animate||reducedMotion.matches){
    displayProjectCase(key);
    return;
  }
  const {overlay,chars}=createFinderLetters();
  if(!chars.length){
    overlay.remove();
    displayProjectCase(key);
    return;
  }
  rain=overlay;
  scene='case-falling'; // Also prevents a double-click from opening another case.
  comingNext.textContent='Opening '+key+' case.';
  // Keep the Finder frame visible, but remove its source text after measuring.
  worksWindow.classList.add('case-raining');
  const lastEnd=animateFallingLetters(chars);
  endRainTimer=setTimeout(function(){
    if(scene!=='case-falling')return;
    clearLetters();
    worksWindow.classList.remove('case-raining');
    displayProjectCase(key);
  },lastEnd+35);
}
function bindCaseRow(rowId,previewId,projectKey){
  const row=document.getElementById(rowId);
  const preview=document.getElementById(previewId);
  // Reuse the exact same preview image as desktop, including its fallback.
  // A sibling button (not a button nested in another button) opens the case.
  const mobilePreview=document.createElement('button');
  mobilePreview.type='button';
  mobilePreview.className='mobile-case-preview';
  mobilePreview.id='mobile-preview-'+projectKey;
  mobilePreview.tabIndex=-1;
  mobilePreview.setAttribute('aria-hidden','true');
  mobilePreview.setAttribute('aria-label','Open '+projects[projectKey].title.replace(/\s+/g,' ')+' case');
  const slideshow=preview.querySelector('.preview-slides');
  const image=slideshow?slideshow.cloneNode(true):preview.querySelector('img').cloneNode(true);
  const previewImages=slideshow?image.querySelectorAll('img'):[image];
  previewImages.forEach(img=>{
    img.alt='';
    img.loading='lazy';
    img.draggable=false;
  });
  const openLabel=document.createElement('span');
  openLabel.className='mobile-case-open';
  openLabel.textContent='open case ↗';
  mobilePreview.append(image,openLabel);
  row.insertAdjacentElement('afterend',mobilePreview);
  row.setAttribute('aria-controls',mobilePreview.id);
  row.setAttribute('aria-expanded','false');

  function toggle(show){
    if(window.innerWidth<=900)return; // Mobile taps own the preview.
    const visible=show&&scene==='empty'&&!worksWindow.hidden;
    if(visible)hideCasePreviews();
    preview.classList.toggle('is-visible',visible);
    preview.setAttribute('aria-hidden',String(!visible));
  }
  row.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')toggle(true)});
  row.addEventListener('pointerleave',()=>toggle(false));
  row.addEventListener('focus',()=>toggle(true));
  row.addEventListener('blur',()=>toggle(false));
  row.addEventListener('click',()=>{
    if(window.innerWidth>900){showProjectCase(projectKey);return;}
    if(scene!=='empty'||worksWindow.hidden)return;
    const wasOpen=mobilePreview.classList.contains('is-open');
    if(wasOpen){
      // A second tap on the same filename opens its case, just like the preview.
      showProjectCase(projectKey);
      return;
    }
    hideCasePreviews();
    mobilePreview.classList.add('is-open');
    mobilePreview.setAttribute('aria-hidden','false');
    mobilePreview.tabIndex=0;
    row.setAttribute('aria-expanded','true');
  });
  mobilePreview.addEventListener('click',()=>showProjectCase(projectKey));
}
bindCaseRow('openSetka','setkaHoverPreview','setka');
bindCaseRow('openLitres','litresHoverPreview','litres');
bindCaseRow('openDodo','dodoHoverPreview','dodo');
bindCaseRow('openDodoMath','dodoMathHoverPreview','dodoMath');
bindCaseRow('openKion','kionHoverPreview','kion');
bindCaseRow('openDixy','dixyHoverPreview','dixy');
bindCaseRow('openTriazavirin','triazavirinHoverPreview','triazavirin');
bindCaseRow('openKazakhstan','kazakhstanHoverPreview','kazakhstan');
bindCaseRow('openAvionero','avioneroHoverPreview','avionero');
bindCaseRow('openAkademichesky','akademicheskyHoverPreview','akademichesky');
bindCaseRow('openMikenco','mikencoHoverPreview','mikenco');
bindCaseRow('openMitchme','mitchmeHoverPreview','mitchme');
bindCaseRow('openMitchmeHalloween','mitchmeHalloweenHoverPreview','mitchmeHalloween');
bindCaseRow('openDonorsearch','donorsearchHoverPreview','donorsearch');
bindCaseRow('openTaezhnyDar','taezhnyDarHoverPreview','taezhnyDar');
bindCaseRow('openShortShotFest','shortShotFestHoverPreview','shortShotFest');
bindCaseRow('openMitchmeDogsFirst','mitchmeDogsFirstHoverPreview','mitchmeDogsFirst');
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
document.getElementById('caseBack').addEventListener('click',backToWorksWithLetters);
document.getElementById('caseClose').addEventListener('click',backToWorksWithLetters);
document.getElementById('mobileStageLogo').addEventListener('click',function(){activateSalaticLogo(this);});
document.getElementById('mobileWorksBack').addEventListener('click',returnHomeWithLetters);
document.getElementById('mobileCaseBack').addEventListener('click',backToWorksWithLetters);
document.getElementById('worksClose').addEventListener('click',returnHomeWithLetters);
const projectOrder=['litres','setka','kion','mitchmeHalloween','triazavirin','dodoMath','dixy','shortShotFest','kazakhstan','taezhnyDar','akademichesky','dodo','mitchme','avionero','donorsearch','mitchmeDogsFirst','mikenco'];
function stepCaseMedia(direction){
  if(caseMedia.length===1){
    const index=projectOrder.indexOf(activeProject);
    const next=projectOrder[(index+direction+projectOrder.length)%projectOrder.length];
    showWorksList();
    showProjectCase(next,false);
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

// The dot is a real DOM element so mix-blend-mode:difference inverts it
// against *each rendered pixel*, including cyan text, outlines and icons.
(function initSalaticCursor(){
  const finePointer=window.matchMedia('(hover:hover) and (pointer:fine)');
  if(!finePointer.matches)return;
  const cursor=document.createElement('div');
  cursor.className='salatic-cursor';
  cursor.setAttribute('aria-hidden','true');
  // The magnifier is part of the original difference-blended cursor, not a
  // second overlay. It appears only while a KV/print can be opened.
  cursor.innerHTML='<svg class="salatic-cursor-magnifier" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5M10.5 7.5v6M7.5 10.5h6"/></svg>';
  document.body.appendChild(cursor);
  const hide=()=>{cursor.style.visibility='hidden';};
  const move=(event)=>{
    if(event.pointerType==='touch'||document.fullscreenElement||document.webkitFullscreenElement){
      hide();
      return;
    }
    const hoveredElement=document.elementFromPoint(event.clientX,event.clientY);
    if(hoveredElement && hoveredElement.closest('iframe')) {
      hide();
      return;
    }
    // Render the zoom affordance in the same cyan circle on any portfolio KV.
    // Fallback fullscreen uses a minus indicator for the return action.
    const onPrint=hoveredElement?.matches?.('.case-stage img.case-kv')===true;
    cursor.classList.toggle('is-zoomable',onPrint);
    cursor.classList.toggle('is-zoomed',onPrint&&caseStage.classList.contains('kv-fallback-fullscreen'));
    cursor.style.left=event.clientX+'px';
    cursor.style.top=event.clientY+'px';
    cursor.style.visibility='visible';
  };
  window.addEventListener('pointermove',move,{passive:true});
  document.addEventListener('pointerout',event=>{
    if(!event.relatedTarget)hide();
  },{passive:true});
  window.addEventListener('blur',hide);
  document.addEventListener('fullscreenchange',hide);
  document.addEventListener('webkitfullscreenchange',hide);
  // The Vimeo iframe consumes pointer events, so hide our dot on entry.
  document.addEventListener('pointerover',event=>{
    if(event.target instanceof Element && event.target.closest('iframe'))hide();
  },{passive:true});
})();


// Home-only micro-thumbnail trail. It uses existing portfolio preview assets,
// stays behind the regular Salatic cursor, and never catches pointer events.
(function initHomeWorkTrail(){
  const desktopPointer=window.matchMedia('(hover:hover) and (pointer:fine) and (min-width:901px)');
  if(!desktopPointer.matches||reducedMotion.matches)return;

  const sources=Array.from(document.querySelectorAll('.works-hover-preview > img'))
    .map(img=>img.getAttribute('src'))
    .filter(Boolean);
  if(!sources.length)return;

  const trail=document.createElement('div');
  trail.className='home-work-trail';
  trail.setAttribute('aria-hidden','true');
  document.body.appendChild(trail);

  let lastX=null,lastY=null,lastStampTime=-Infinity,nextImage=0;
  let motionX=null,motionY=null,motionTime=null,smoothedSpeed=0;
  const stamps=[];
  const rotations=[-7,4,-4,7,2,-6,5,-3];

  // Previews live only on empty black space. Protect names, text, photos,
  // logos and buttons, with padding based on each thumbnail's ACTUAL size
  // (which can grow with cursor velocity).
  const protectedElements=Array.from(new Set([
    ...document.querySelectorAll(
      '.masthead .username, .masthead .role, .masthead .eyes, '+
      '.username-photo, .contact-entry, '+
      '.works-folder .folder-base, .works-folder .folder-name, .works-folder .folder-person, '+
      '.bottom .signature-hit, .bottom .bio, .bonya-overlay'
    ),
    ...Array.from(artboard.querySelectorAll('button, a, [role="button"]'))
      .filter(element=>!element.closest('.portfolio-stage')&&!element.matches('.works-folder'))
  ]));

  function overlapsContent(x,y,padX=2,padY=2){
    for(const element of protectedElements){
      const style=getComputedStyle(element);
      if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity)<0.02)continue;
      const rect=element.getBoundingClientRect();
      if(rect.width===0||rect.height===0)continue;
      if(x+padX>rect.left&&x-padX<rect.right
        &&y+padY>rect.top&&y-padY<rect.bottom)return true;
    }
    return false;
  }

  function removeBlockedStamps(){
    for(let i=stamps.length-1;i>=0;i--){
      const stamp=stamps[i];
      if(overlapsContent(
        Number(stamp.dataset.x),Number(stamp.dataset.y),
        Number(stamp.dataset.padX),Number(stamp.dataset.padY)
      )){
        stamp.remove();
        stamps.splice(i,1);
      }
    }
  }

  function clearTrail(){
    trail.replaceChildren();
    stamps.length=0;
    lastX=lastY=motionX=motionY=motionTime=null;
    smoothedSpeed=0;
    lastStampTime=-Infinity;
  }

  function onHome(){
    return scene==='home'&&!artboard.classList.contains('stage-exiting')
      &&!artboard.classList.contains('stage-exited');
  }

  function stampAt(x,y,speed=0){
    // Slow movement: 54x31 px. Fast flicks: up to 180x103 px.
    // Grow earlier on real mouse flicks while keeping slow movement subtle.
    const strength=Math.max(0,Math.min(1,(speed-.3)/1.9));
    const width=Math.round(54+126*strength);
    const height=Math.round(width*31/54);
    // Only 1px of clearance around the actual preview footprint.
    const padX=width/2+1,padY=height/2+1;

    // Spawn directly to the right of the cursor, aligned to its Y position.
    // Never drop previews below the cursor or flip them to the left.
    const sx=x+width/2+26;
    const sy=y;

    if(overlapsContent(x,y)||overlapsContent(sx,sy,padX,padY))return;
    if(sx-padX<0||sx+padX>window.innerWidth
      ||sy-padY<0||sy+padY>window.innerHeight)return;

    // Give each thumbnail its own subtle fall, following the same seeded
    // sideways drift and rotation language as the falling type transition.
    const rotation=rotations[nextImage%rotations.length];
    const drift=(randomUnit(nextImage*19+7)-.5)*58;
    const spin=(randomUnit(nextImage*23+11)>.5?1:-1)
      *(9+randomUnit(nextImage*43+2)*23);
    const maxDrop=Math.min(175,window.innerHeight-sy-padY-12);
    if(maxDrop<35)return;

    // Keep falling thumbnails off the biography, folder, header and buttons,
    // not just away from those elements at their initial positions.
    let drop=maxDrop;
    for(let step=1;step<=10;step++){
      const fraction=step/10;
      if(overlapsContent(sx+drift*fraction,sy+maxDrop*fraction,padX,padY)){
        drop=maxDrop*((step-1)/10);
        break;
      }
    }
    if(drop<35)return;
    const driftRatio=drop/maxDrop;
    const fallDrift=drift*driftRatio;
    const endRotation=rotation+spin*driftRatio;

    const stamp=document.createElement('span');
    stamp.className='home-work-stamp';
    stamp.dataset.x=String(sx);
    stamp.dataset.y=String(sy);
    stamp.dataset.padX=String(padX);
    stamp.dataset.padY=String(padY);
    stamp.style.width=width+'px';
    stamp.style.height=height+'px';
    stamp.style.left=sx+'px';
    stamp.style.top=sy+'px';
    stamp.style.setProperty('--trail-rotation',rotation+'deg');
    stamp.style.setProperty('--trail-rotation-mid',(rotation+spin*driftRatio*.12).toFixed(2)+'deg');
    stamp.style.setProperty('--trail-rotation-end',endRotation.toFixed(2)+'deg');
    stamp.style.setProperty('--trail-drop-mid',(drop*.12).toFixed(1)+'px');
    stamp.style.setProperty('--trail-drift-mid',(fallDrift*.12).toFixed(1)+'px');
    stamp.style.setProperty('--trail-drop',drop.toFixed(1)+'px');
    stamp.style.setProperty('--trail-drift',fallDrift.toFixed(1)+'px');

    const img=document.createElement('img');
    img.alt='';
    img.decoding='async';
    img.draggable=false;
    img.onerror=()=>{stamp.remove();const index=stamps.indexOf(stamp);if(index!==-1)stamps.splice(index,1);};
    img.src=sources[nextImage%sources.length];
    nextImage++;
    stamp.appendChild(img);
    trail.appendChild(stamp);
    stamps.push(stamp);
    while(stamps.length>14)stamps.shift().remove();
    window.setTimeout(()=>{
      stamp.remove();
      const index=stamps.indexOf(stamp);
      if(index!==-1)stamps.splice(index,1);
    },1950);
  }

  document.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch'||!desktopPointer.matches||!onHome()){
      if(stamps.length)clearTrail();
      return;
    }
    // Remove existing thumbnails that now overlap revealed UI (for example
    // Anton's photo or Bonya), and never stamp over any protected content.
    removeBlockedStamps();
    const x=event.clientX,y=event.clientY,t=event.timeStamp;
    if(overlapsContent(x,y)){
      lastX=motionX=x;
      lastY=motionY=y;
      motionTime=t;
      smoothedSpeed=0;
      return;
    }

    // Measure actual instantaneous pointer speed (px/ms), not distance
    // since the last emitted stamp. Smooth bursts to avoid size flicker.
    if(motionX!==null&&motionTime!==null){
      const distance=Math.hypot(x-motionX,y-motionY);
      const elapsed=Math.max(8,t-motionTime);
      const speed=Math.min(6,distance/elapsed);
      smoothedSpeed=smoothedSpeed*.5+speed*.5;
    }
    motionX=x;motionY=y;motionTime=t;

    if(lastX===null){
      lastX=x;lastY=y;
      lastStampTime=t;
      stampAt(x,y,smoothedSpeed);
      return;
    }
    // Slightly denser trail than before: 26px / 40ms versus 36px / 65ms.
    if(Math.hypot(x-lastX,y-lastY)<26)return;
    if(t-lastStampTime<40)return;
    lastX=x;lastY=y;
    lastStampTime=t;
    stampAt(x,y,smoothedSpeed);
  },{passive:true});

  // Recheck when hover/focus reveals the portrait without cursor travel.
  for(const target of protectedElements){
    target.addEventListener('pointerenter',removeBlockedStamps,{passive:true});
    target.addEventListener('focusin',removeBlockedStamps);
  }
  const stageWatcher=new MutationObserver(()=>{
    if(!onHome())clearTrail();
  });
  stageWatcher.observe(artboard,{attributes:true,attributeFilter:['class']});
  window.addEventListener('blur',clearTrail);
  window.addEventListener('resize',clearTrail,{passive:true});
})();
