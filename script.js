// maps
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const rev = {};
const numToLetter = {};
for (let i=0;i<letters.length;i++){ const ch = letters[i]; const val = 27 - (i+1); rev[ch] = val; numToLetter[val] = ch; }

const input = document.getElementById('input');
const output = document.getElementById('output');
const sepEl = document.getElementById('sep');
const preserveP = document.getElementById('preserveP');
const encodeBtn = document.getElementById('encodeBtn');
const decodeBtn = document.getElementById('decodeBtn');
const copyBtn = document.getElementById('copyBtn');
const autoCopy = document.getElementById('autoCopy');
const downloadBtn = document.getElementById('downloadBtn');

// ripple effect handler
function createRipple(e){
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const span = document.createElement('span');
  const size = Math.max(rect.width, rect.height) * 1.2;
  span.style.width = span.style.height = size + 'px';
  span.style.left = (e.clientX - rect.left - size/2) + 'px';
  span.style.top = (e.clientY - rect.top - size/2) + 'px';
  btn.appendChild(span);
  setTimeout(()=> span.remove(), 700);
}
document.querySelectorAll('.ripple').forEach(b=> b.addEventListener('click', createRipple));

function encodeText(text, sep, keepP=true){
  const tokens = [];
  for (const ch of text){
    if (/[a-zA-Z]/.test(ch)) tokens.push(String(rev[ch.toUpperCase()]));
    else if (ch === ' ') tokens.push('');
    else if (keepP) tokens.push(ch);
  }
  let res = '';
  let prevNum = false;
  for (const t of tokens){
    const isNum = /^\d+$/.test(t);
    if (t === ''){ res += (res && !res.endsWith(sep) ? sep+sep : sep+sep); prevNum = false; }
    else if (isNum){ res += (res && prevNum ? sep + t : t); prevNum = true; }
    else { res += (res && !res.endsWith(' ') ? ' ' + t : t); prevNum = false; }
  }
  return res || '(empty)';
}

function decodeText(codeString){
  const parts = codeString.match(/\d+|[^0-9\s]+|\s+/g) || [];
  let out = '';
  for (const p of parts){
    if (/^\d+$/.test(p)){ out += (numToLetter[Number(p)] || '?'); }
    else if (/^\s+$/.test(p)) out += p; else out += p;
  }
  return out;
}

// typing animation (char-by-char) – respects prefers-reduced-motion
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
async function typeToOutput(text, speed=18){
  if (prefersReduced){ output.textContent = text; return; }
  output.textContent = '';
  for (let i=0;i<text.length;i++){
    output.textContent += text[i];
    await new Promise(r => setTimeout(r, speed));
  }
}

function flashOutput(){ output.classList.remove('flash'); void output.offsetWidth; output.classList.add('flash'); }

async function setOutput(text, animate=true){
  if (animate) await typeToOutput(text);
  else output.textContent = text;
  flashOutput();
  if (autoCopy.checked) await copyOutputText();
}

encodeBtn.addEventListener('click', async ()=>{ const s = sepEl.value; const keepP = preserveP.checked; await setOutput(encodeText(input.value, s, keepP), true); });
decodeBtn.addEventListener('click', async ()=>{ await setOutput(decodeText(input.value).toUpperCase(), true); });

async function copyOutputText(){
  const text = output.textContent;
  if(!text || text === 'Output will appear here...' || text === '(empty)') return;
  try{ await navigator.clipboard.writeText(text); animateCopySuccess(); }
  catch(e){ try{ const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); animateCopySuccess(); }catch(e2){ animateCopyFail(); } }
}
copyBtn.addEventListener('click', copyOutputText);

function animateCopySuccess(){ copyBtn.textContent = 'Copied!'; copyBtn.style.background = 'linear-gradient(90deg,var(--success),#38bdf8)'; setTimeout(()=>{ copyBtn.textContent = 'Copy'; copyBtn.style.background = ''; },1200); }
function animateCopyFail(){ copyBtn.textContent = 'Copy failed'; copyBtn.style.background = 'linear-gradient(90deg,var(--danger),#ef9a9a)'; setTimeout(()=>{ copyBtn.textContent = 'Copy'; copyBtn.style.background = ''; },1200); }

downloadBtn.addEventListener('click', ()=>{
  const blob = new Blob([output.textContent], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'reversed-code.txt'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

// keyboard shortcuts
document.addEventListener('keydown', (e)=>{
  const cmd = e.ctrlKey || e.metaKey;
  if(cmd && e.key.toLowerCase() === 'e'){ e.preventDefault(); encodeBtn.click(); }
  if(cmd && e.key.toLowerCase() === 'd'){ e.preventDefault(); decodeBtn.click(); }
  if(cmd && e.key.toLowerCase() === 'c' && document.activeElement === output){ e.preventDefault(); copyOutputText(); }
});

// initial example
input.value = '';
output.textContent = 'Click Encode to see result';
