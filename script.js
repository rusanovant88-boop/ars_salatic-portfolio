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

// Pixel-accurate handwriting animation v0.3.
// The frame sequence was generated by following the actual painted strokes
// of salatic-signature.webp; all pixels are revealed progressively.
// There is no last-frame jump or unrelated lettering.
const signatureImg = document.querySelector('.signature');
const signatureHit = document.createElement('button');
signatureHit.type = 'button';
signatureHit.id = 'signatureHit';
signatureHit.className = 'signature-hit';
signatureHit.setAttribute('aria-label','Replay Salatic signature writing animation');
signatureImg.parentElement.insertBefore(signatureHit,signatureImg);
signatureHit.appendChild(signatureImg);

const writingImg = document.createElement('img');
writingImg.className='signature-writing';
writingImg.alt='';
writingImg.draggable=false;
writingImg.setAttribute('aria-hidden','true');
signatureHit.appendChild(writingImg);

const writingAsset = 'assets/salatic-signature-writing.webp';
const writingBlobPromise = fetch(writingAsset).then(response => {
  if (!response.ok) throw new Error('Could not load the signature animation');
  return response.blob();
});
writingBlobPromise.catch(()=>{}); // Keep the original logo if offline.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const writingDurationMs = 4224;
let writingToken = 0;
let writingObjectURL = null;
let writingDoneTimer = null;
let writingActive = false;

function stopWriting() {
  writingToken++;
  writingActive = false;
  if (writingDoneTimer !== null) {
    window.clearTimeout(writingDoneTimer);
    writingDoneTimer = null;
  }
  signatureHit.classList.remove('is-writing');
  writingImg.removeAttribute('src');
  if (writingObjectURL) {
    URL.revokeObjectURL(writingObjectURL);
    writingObjectURL = null;
  }
}

async function startWriting() {
  stopWriting();
  if (reducedMotion.matches) return;
  writingActive = true;
  const token = writingToken;
  try {
    const blob = await writingBlobPromise;
    if (!writingActive || token !== writingToken) return;
    // A fresh object URL ensures WebP animation restarts on EVERY hover,
    // including repeated hovers from a warm browser cache.
    const url = URL.createObjectURL(blob);
    writingObjectURL = url;
    writingImg.src = url;
    await writingImg.decode();
    if (!writingActive || token !== writingToken) return;
    signatureHit.classList.add('is-writing');
    writingDoneTimer = window.setTimeout(() => {
      if (token === writingToken) stopWriting();
    }, writingDurationMs + 180);
  } catch (err) {
    if (token === writingToken) {
      stopWriting(); // Gracefully show the exact, unanimated original.
      console.warn('Signature animation unavailable',err);
    }
  }
}
signatureHit.addEventListener('pointerenter',event=>{
  if (event.pointerType!=='touch') startWriting();
});
signatureHit.addEventListener('pointerleave',event=>{
  if (event.pointerType!=='touch') stopWriting();
});
signatureHit.addEventListener('focus',startWriting);
signatureHit.addEventListener('blur',stopWriting);
signatureHit.addEventListener('click',event=>{
  if (event.detail===0 || event.pointerType==='touch') startWriting();
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape') stopWriting();
});
