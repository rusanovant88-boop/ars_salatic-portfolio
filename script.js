// Preserve the Figma 1440 x 900 composition at different desktop viewport sizes.
// A separate mobile artboard can be implemented when its Figma design arrives.
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
  const scale=Math.min(window.innerWidth/1440,window.innerHeight/900);
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

// The works window is deliberately not invented before the user provides the Finder artboard.
folder.addEventListener('click',()=>{
  comingNext.classList.add('show');
  window.clearTimeout(folder._messageTimeout);
  folder._messageTimeout=window.setTimeout(()=>comingNext.classList.remove('show'),1700);
});

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

// Build the reveal on top of the REAL signature. No font substitution.
const signatureImg = document.querySelector('.signature');
const signatureHit = document.createElement('button');
signatureHit.type='button';
signatureHit.id='signatureHit';
signatureHit.className='signature-hit';
signatureHit.setAttribute('aria-label','Replay the Salatic graffiti signature');
signatureImg.parentElement.insertBefore(signatureHit,signatureImg);
signatureHit.appendChild(signatureImg);
const inkPaths=[
  'M 152 633 C 65 610 31 649 39 740 C 45 913 231 1037 387 1030 C 551 1018 602 894 545 792 C 507 711 390 624 239 555 C 89 485 58 394 98 276 C 125 195 181 160 230 172 C 337 191 334 380 387 467 C 410 292 443 160 544 72',
  'M 344 801 C 394 717 452 643 530 639 C 603 633 647 702 662 779',
  'M 515 853 C 516 745 504 470 519 326',
  'M 538 155 C 552 301 592 416 639 533 C 696 664 761 790 802 849',
  'M 623 555 C 605 601 646 579 704 549 C 807 495 861 384 878 311 C 789 326 677 397 625 488',
  'M 620 292 C 790 232 1016 209 1156 242 C 1281 268 1388 337 1421 362',
  'M 1028 27 C 994 61 985 220 974 350 C 951 577 933 799 906 948 L 915 971',
  'M 872 625 C 826 600 792 645 781 710 C 770 767 779 820 800 847',
  'M 1059 380 L 1059 382',
  'M 1050 438 C 1037 510 1012 630 1003 690',
  'M 1172 317 C 1121 427 1082 657 1043 839',
  'M 1163 629 L 1080 699',
  'M 1081 701 C 1195 788 1301 859 1351 931'
];
const maskMarkup=inkPaths.map(d=>'<path d="'+d+'"/>').join('');
signatureHit.insertAdjacentHTML('beforeend',
  '<svg class="signature-writing" viewBox="0 0 1440 1059" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">'+
  '<defs><mask id="signatureRevealMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1440" height="1059">'+
  '<g class="signature-mask-strokes" fill="none" stroke="white" stroke-width="66" stroke-linecap="round" stroke-linejoin="round">'+maskMarkup+
  '</g></mask></defs>'+
  '<image href="assets/salatic-signature.webp" x="0" y="0" width="1440" height="1059" mask="url(#signatureRevealMask)"/>'+
  '</svg>');
const signaturePaths=Array.from(signatureHit.querySelectorAll('.signature-mask-strokes path'));
const reduceAnimation=window.matchMedia('(prefers-reduced-motion: reduce)');
let signatureAnimations=[],signatureFinish=null;

function stopSignature(){
  if(signatureFinish!==null){clearTimeout(signatureFinish);signatureFinish=null;}
  for(const animation of signatureAnimations)animation.cancel();
  signatureAnimations=[];
  signatureHit.classList.remove('is-writing');
}
function drawSignature(){
  stopSignature();
  if(reduceAnimation.matches)return;
  const lengths=signaturePaths.map(p=>p.getTotalLength());
  const total=lengths.reduce((a,b)=>a+b,0);
  let elapsed=0;
  signatureHit.classList.add('is-writing');
  signaturePaths.forEach((path,i)=>{
    const length=lengths[i];
    path.style.strokeDasharray=String(length);
    path.style.strokeDashoffset=String(length);
    const duration=Math.max(75,Math.round(2800*length/total));
    const animation=path.animate(
      [{strokeDashoffset:length},{strokeDashoffset:0}],
      {duration,delay:elapsed,easing:'ease-in-out',fill:'forwards'}
    );
    signatureAnimations.push(animation);
    elapsed+=duration;
  });
  // When finished, show the exact complete image to avoid micro-gaps.
  signatureFinish=setTimeout(()=>{
    signatureHit.classList.remove('is-writing');
    signatureAnimations.forEach(a=>a.cancel());
    signatureAnimations=[];
    signatureFinish=null;
  },elapsed+60);
}
signatureHit.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')drawSignature();});
signatureHit.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')stopSignature();});
signatureHit.addEventListener('focus',drawSignature);
signatureHit.addEventListener('blur',stopSignature);
signatureHit.addEventListener('click',e=>{if(e.detail===0||e.pointerType==='touch')drawSignature();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')stopSignature();});
