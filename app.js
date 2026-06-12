/* app.js - InstaBooth Interactive Controller */

// UI Elements
const video = document.getElementById('video');
const liveCanvas = document.getElementById('liveCanvas');
const captureCanvas = document.getElementById('captureCanvas');
const stripCanvas = document.getElementById('stripCanvas');

const countdownOverlay = document.getElementById('countdownOverlay');
const countdownText = document.getElementById('countdownText');
const flashOverlay = document.getElementById('flashOverlay');
const statusDot = document.querySelector('.pulse-dot');
const statusText = document.getElementById('statusText');
const shotCounter = document.getElementById('shotCounter');
const currentShotNum = document.getElementById('currentShotNum');
const totalShotsNum = document.getElementById('totalShotsNum');

const startSessionBtn = document.getElementById('startSessionBtn');
const startSessionBtnDesktop = document.getElementById('startSessionBtnDesktop');

// Helper: sync disabled state for both start buttons
function setStartBtnsDisabled(disabled) {
  startSessionBtn.disabled = disabled;
  if (startSessionBtnDesktop) startSessionBtnDesktop.disabled = disabled;
}
const switchCamBtn = document.getElementById('switchCamBtn');
const toggleSoundBtn = document.getElementById('toggleSoundBtn');
const soundOnIcon = document.getElementById('soundOnIcon');
const soundOffIcon = document.getElementById('soundOffIcon');
const soundBtnText = document.getElementById('soundBtnText');

const toggleMirrorBtn = document.getElementById('toggleMirrorBtn');
const mirrorBtnText = document.getElementById('mirrorBtnText');

const frameChipsList = document.getElementById('frameChipsList');
const filterChipsGrid = document.getElementById('filterChipsGrid');

const resultModal = document.getElementById('resultModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const downloadBtn = document.getElementById('downloadBtn');
const retakeBtn = document.getElementById('retakeBtn');

const galleryGrid = document.getElementById('galleryGrid');
const galleryEmptyState = document.getElementById('galleryEmptyState');
const clearGalleryBtn = document.getElementById('clearGalleryBtn');

// App State
let currentStream = null;
let useFrontCamera = true;
let isSoundEnabled = true;
let isMirrored = true;
let activeLayout = 'strip-3'; // 'strip-3', 'strip-4', 'grid-2x2'
let maxShots = 3;
let selectedFilter = 'none';
let selectedFrameColor = '#FFFDF8'; // Default paper cream
let selectedFrameId = 'cream';     // Track frame id for decorative frames
let capturedPhotos = [];
let galleryList = [];

// Filters Preset
const FILTERS = [
  { id: 'none', label: 'Original', css: 'none' },
  { id: 'vintage', label: 'Vintage Film', css: 'sepia(0.35) saturate(1.3) contrast(0.95) brightness(1.05)' },
  { id: 'mono', label: 'Dramatic Noir', css: 'grayscale(1) contrast(1.25) brightness(0.95)' },
  { id: 'sepia', label: 'Retro Sepia', css: 'sepia(0.8) contrast(1.05) saturate(0.9)' },
  { id: 'warm', label: 'Warm Chrome', css: 'saturate(1.25) hue-rotate(-10deg) brightness(1.02)' },
  { id: 'cool', label: 'Cool Teal', css: 'saturate(1.15) hue-rotate(15deg) brightness(1.04)' },
  { id: 'faded', label: 'Faded Velvet', css: 'contrast(0.85) brightness(1.08) saturate(0.9)' },
  { id: 'high-con', label: 'High Contrast', css: 'contrast(1.3) saturate(1.1)' }
];

// Frame Preset — type: 'solid' | 'decorative'
const FRAMES = [
  // ── Polos (Solid Colors) ──
  { id: 'cream',   type: 'solid', color: '#FFFDF8', label: 'Krem Klasik' },
  { id: 'dark',    type: 'solid', color: '#2B2622', label: 'Hitam Malam' },
  { id: 'rust',    type: 'solid', color: '#C85A32', label: 'Terracotta' },
  { id: 'sage',    type: 'solid', color: '#606C50', label: 'Hijau Sage' },
  { id: 'gold',    type: 'solid', color: '#DEB038', label: 'Emas Mustard' },
  { id: 'pink',    type: 'solid', color: '#ECC8C5', label: 'Pink Blush' },
  { id: 'navy',    type: 'solid', color: '#1E3A5F', label: 'Biru Navy' },
  { id: 'lavender',type: 'solid', color: '#C9B8E8', label: 'Lavender' },
  { id: 'mint',    type: 'solid', color: '#A8D8C8', label: 'Hijau Mint' },
  { id: 'white',   type: 'solid', color: '#FFFFFF', label: 'Putih Bersih' },
  // ── Dekoratif ──
  { id: 'floral',    type: 'decorative', color: '#FFF5F7', label: '🌸 Bunga', draw: drawFloralFrame },
  { id: 'stars',     type: 'decorative', color: '#1A1A2E', label: '⭐ Bintang', draw: drawStarsFrame },
  { id: 'hearts',    type: 'decorative', color: '#FFF0F3', label: '❤️ Hati', draw: drawHeartsFrame },
  { id: 'retro',     type: 'decorative', color: '#FDF6E3', label: '🎞️ Retro', draw: drawRetroFrame },
  { id: 'confetti',  type: 'decorative', color: '#F8F4FF', label: '🎉 Confetti', draw: drawConfettiFrame },
  { id: 'vintage',   type: 'decorative', color: '#F5ECD7', label: '📜 Vintage', draw: drawVintageFrame },
  { id: 'rainbow',   type: 'decorative', color: '#FFFFFF', label: '🌈 Pelangi', draw: drawRainbowFrame },
  { id: 'night',     type: 'decorative', color: '#0D1B2A', label: '🌙 Malam', draw: drawNightFrame },
];

// ─── Decorative Frame Drawers ───────────────────────────────────────
// Each function receives (ctx, canvasW, canvasH) and draws on top of
// the already-filled background.

function drawFloralFrame(ctx, w, h) {
  const flowers = [
    // corners + midpoints
    {x:0,   y:0},   {x:w,   y:0},   {x:0,   y:h},   {x:w,   y:h},
    {x:w/2, y:0},   {x:w/2, y:h},   {x:0,   y:h/2}, {x:w,   y:h/2},
    {x:w/4, y:0},   {x:3*w/4,y:0},  {x:w/4, y:h},   {x:3*w/4,y:h},
  ];
  const petals = 5, r = 18, pr = 9;
  flowers.forEach(({x, y}) => {
    for (let i = 0; i < petals; i++) {
      const angle = (Math.PI * 2 / petals) * i;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      ctx.beginPath();
      ctx.ellipse(px, py, pr, pr * 0.55, angle, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? '#FF9EB5' : '#FFB7C5';
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#FFE566';
    ctx.fill();
  });
}

function drawStarsFrame(ctx, w, h) {
  const positions = [];
  const seed = 42;
  for (let i = 0; i < 40; i++) {
    const t = (seed * (i + 1) * 137.508) % 1;
    const u = (seed * (i + 1) * 97.3) % 1;
    const margin = 60;
    let x, y;
    if (i % 4 === 0)      { x = t * w; y = u * margin; }
    else if (i % 4 === 1) { x = t * w; y = h - u * margin; }
    else if (i % 4 === 2) { x = u * margin; y = t * h; }
    else                  { x = w - u * margin; y = t * h; }
    positions.push({x, y, r: 6 + (i % 3) * 4});
  }
  const colors = ['#FFE566','#FFC94D','#FFFFFF','#B8D4FF','#FFD6A5'];
  positions.forEach(({x, y, r}, i) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((i * 30) * Math.PI / 180);
    drawStar(ctx, 0, 0, r, r * 0.45, 5);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.restore();
  });
}

function drawStar(ctx, cx, cy, outerR, innerR, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    i === 0 ? ctx.moveTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
             : ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
  }
  ctx.closePath();
}

function drawHeartsFrame(ctx, w, h) {
  const spots = [];
  for (let i = 0; i < 30; i++) {
    const t = ((i * 73.1) % 97) / 97;
    const u = ((i * 31.7) % 89) / 89;
    const m = 55;
    let x, y;
    if (i % 4 === 0)      { x = t * w; y = u * m; }
    else if (i % 4 === 1) { x = t * w; y = h - u * m; }
    else if (i % 4 === 2) { x = u * m; y = t * h; }
    else                  { x = w - u * m; y = t * h; }
    spots.push({x, y, s: 8 + (i % 3) * 5});
  }
  const colors = ['#FF6B9D','#FF9EB5','#FF4D79','#FFB3C6','#FF1744'];
  spots.forEach(({x, y, s}, i) => {
    ctx.save();
    ctx.translate(x, y);
    drawHeart(ctx, 0, 0, s);
    ctx.fillStyle = colors[i % colors.length];
    ctx.globalAlpha = 0.75;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  });
}

function drawHeart(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.3);
  ctx.bezierCurveTo(x, y - s * 0.2, x - s, y - s * 0.2, x - s, y + s * 0.3);
  ctx.bezierCurveTo(x - s, y + s * 0.75, x, y + s * 1.1, x, y + s * 1.4);
  ctx.bezierCurveTo(x, y + s * 1.1, x + s, y + s * 0.75, x + s, y + s * 0.3);
  ctx.bezierCurveTo(x + s, y - s * 0.2, x, y - s * 0.2, x, y + s * 0.3);
  ctx.closePath();
}

function drawRetroFrame(ctx, w, h) {
  const border = 22;
  // Outer double-line border
  ctx.strokeStyle = '#8B6914';
  ctx.lineWidth = 4;
  ctx.strokeRect(border / 2, border / 2, w - border, h - border);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(border, border, w - border * 2, h - border * 2);
  // Corner decorations
  const corners = [{x:0,y:0},{x:w,y:0},{x:0,y:h},{x:w,y:h}];
  corners.forEach(({x,y}) => {
    ctx.save();
    ctx.translate(x, y);
    const flip = x > 0 ? -1 : 1;
    const flopy = y > 0 ? -1 : 1;
    ctx.scale(flip, flopy);
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, 20 + i * 12, 0, Math.PI / 2);
      ctx.stroke();
    }
    ctx.restore();
  });
  // Film sprocket holes along sides
  const holeR = 6, holeGap = 40;
  ctx.fillStyle = '#C9A227';
  for (let y = holeGap; y < h; y += holeGap) {
    ctx.beginPath(); ctx.arc(10, y, holeR, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(w - 10, y, holeR, 0, Math.PI * 2); ctx.fill();
  }
}

function drawConfettiFrame(ctx, w, h) {
  const shapes = ['rect','circle','triangle'];
  const colors = ['#FF6B6B','#4ECDC4','#FFE66D','#A8E6CF','#FF8B94','#C3A6FF','#FF9A3C'];
  for (let i = 0; i < 80; i++) {
    const t  = ((i * 61.8) % 97) / 97;
    const u  = ((i * 23.5) % 83) / 83;
    const m  = 65;
    let x, y;
    if (i % 4 === 0)      { x = t * w; y = u * m; }
    else if (i % 4 === 1) { x = t * w; y = h - u * m; }
    else if (i % 4 === 2) { x = u * m; y = t * h; }
    else                  { x = w - u * m; y = t * h; }
    const s = 4 + (i % 4) * 3;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((i * 47) * Math.PI / 180);
    ctx.fillStyle = colors[i % colors.length];
    ctx.globalAlpha = 0.8;
    const shape = shapes[i % shapes.length];
    if (shape === 'rect') {
      ctx.fillRect(-s, -s / 2, s * 2, s);
    } else if (shape === 'circle') {
      ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s, s); ctx.lineTo(-s, s); ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

function drawVintageFrame(ctx, w, h) {
  // Aged paper texture edges
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0,   'rgba(139,100,20,0.25)');
  grad.addColorStop(0.1, 'rgba(139,100,20,0)');
  grad.addColorStop(0.9, 'rgba(139,100,20,0)');
  grad.addColorStop(1,   'rgba(139,100,20,0.25)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  const gradH = ctx.createLinearGradient(0, 0, w, 0);
  gradH.addColorStop(0,   'rgba(139,100,20,0.25)');
  gradH.addColorStop(0.1, 'rgba(139,100,20,0)');
  gradH.addColorStop(0.9, 'rgba(139,100,20,0)');
  gradH.addColorStop(1,   'rgba(139,100,20,0.25)');
  ctx.fillStyle = gradH;
  ctx.fillRect(0, 0, w, h);
  // Ornate border
  ctx.strokeStyle = '#8B6914';
  ctx.lineWidth = 3;
  const p = 18;
  ctx.strokeRect(p, p, w - p * 2, h - p * 2);
  // Corner flourishes
  const c2 = [{x:p,y:p},{x:w-p,y:p},{x:p,y:h-p},{x:w-p,y:h-p}];
  c2.forEach(({x,y}, i) => {
    const sx = i % 2 === 0 ? 1 : -1;
    const sy = i < 2 ? 1 : -1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sx, sy);
    ctx.strokeStyle = '#A0882A';
    ctx.lineWidth = 1.5;
    // Diamond shape
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(16, 0); ctx.lineTo(0, 16); ctx.closePath();
    ctx.stroke();
    // Small dot
    ctx.beginPath(); ctx.arc(20, 20, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#A0882A'; ctx.fill();
    ctx.restore();
  });
  // Sepia vignette corners
  [0, w, 0, h].forEach((_, i) => {
    const corners2 = [{x:0,y:0},{x:w,y:0},{x:0,y:h},{x:w,y:h}];
    const {x, y} = corners2[i];
    const vg = ctx.createRadialGradient(x, y, 0, x, y, w * 0.5);
    vg.addColorStop(0, 'rgba(100,60,10,0.3)');
    vg.addColorStop(1, 'rgba(100,60,10,0)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  });
}

function drawRainbowFrame(ctx, w, h) {
  const border = 28;
  const colors = ['#FF0000','#FF7700','#FFDD00','#00CC44','#0099FF','#7700FF'];
  const stripeW = border / colors.length;
  // Top
  colors.forEach((c, i) => {
    ctx.fillStyle = c; ctx.globalAlpha = 0.85;
    ctx.fillRect(0, i * stripeW, w, stripeW);
  });
  // Bottom
  colors.forEach((c, i) => {
    ctx.fillStyle = c; ctx.globalAlpha = 0.85;
    ctx.fillRect(0, h - border + i * stripeW, w, stripeW);
  });
  // Left
  colors.forEach((c, i) => {
    ctx.fillStyle = c; ctx.globalAlpha = 0.85;
    ctx.fillRect(i * stripeW, 0, stripeW, h);
  });
  // Right
  colors.forEach((c, i) => {
    ctx.fillStyle = c; ctx.globalAlpha = 0.85;
    ctx.fillRect(w - border + i * stripeW, 0, stripeW, h);
  });
  ctx.globalAlpha = 1;
  // White inner border
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 2;
  ctx.strokeRect(border + 2, border + 2, w - (border + 2) * 2, h - (border + 2) * 2);
}

function drawNightFrame(ctx, w, h) {
  // Starfield
  for (let i = 0; i < 60; i++) {
    const t  = ((i * 73.1) % 97) / 97;
    const u  = ((i * 31.7) % 89) / 89;
    const m  = 70;
    let x, y;
    if (i % 4 === 0)      { x = t * w; y = u * m; }
    else if (i % 4 === 1) { x = t * w; y = h - u * m; }
    else if (i % 4 === 2) { x = u * m; y = t * h; }
    else                  { x = w - u * m; y = t * h; }
    const r = 0.8 + (i % 3) * 0.8;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.4 + (i % 5) * 0.12})`;
    ctx.fill();
  }
  // Moon crescent top-right
  ctx.save();
  ctx.translate(w - 45, 35);
  ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#FFE566'; ctx.fill();
  ctx.beginPath(); ctx.arc(8, -4, 16, 0, Math.PI * 2);
  ctx.fillStyle = '#0D1B2A'; ctx.fill();
  ctx.restore();
  // Gradient border glow
  const glow = ctx.createLinearGradient(0, 0, w, h);
  glow.addColorStop(0, 'rgba(100,120,255,0.15)');
  glow.addColorStop(1, 'rgba(200,100,255,0.15)');
  ctx.strokeStyle = glow;
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, w - 6, h - 6);
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  initializeFilters();
  initializeFrames();
  initializeLayouts();
  setupGallery();
  startCamera();
  
  // Responsive: show correct start button based on screen width
  updateStartButtonVisibility();
  window.addEventListener('resize', updateStartButtonVisibility);

  // Event Listeners
  switchCamBtn.addEventListener('click', toggleCameraFacing);
  toggleSoundBtn.addEventListener('click', toggleSoundState);
  toggleMirrorBtn.addEventListener('click', toggleMirrorState);
  startSessionBtn.addEventListener('click', startSession);
  if (startSessionBtnDesktop) startSessionBtnDesktop.addEventListener('click', startSession);
  
  closeModalBtn.addEventListener('click', hideModal);
  retakeBtn.addEventListener('click', () => {
    hideModal();
    startSession(); // Auto restart session on retake
  });
  
  downloadBtn.addEventListener('click', downloadStitchedStrip);
  clearGalleryBtn.addEventListener('click', clearGallery);
});

// --- RESPONSIVE BUTTON TOGGLE ---
// Uses inline style (highest priority) to guarantee correct visibility
// regardless of CSS caching issues.
function updateStartButtonVisibility() {
  const isDesktop = window.innerWidth >= 769;
  const mobileWrapper = document.querySelector('.action-wrapper--mobile');
  const desktopWrapper = document.querySelector('.action-wrapper--desktop');
  if (mobileWrapper) mobileWrapper.style.display = isDesktop ? 'none' : 'block';
  if (desktopWrapper) desktopWrapper.style.display = isDesktop ? 'block' : 'none';
}

// --- CAMERA STAGE MANAGEMENT ---
async function startCamera() {
  setCameraStatus('busy', 'Menghubungkan...');
  
  if (window.location.protocol === 'file:') {
    setCameraStatus('error', 'Protokol file:// Terblokir');
    alert('PERINGATAN BROWSER:\nBrowser memblokir akses kamera untuk file HTML lokal yang dibuka langsung (file://).\n\nSilakan:\n1. Jalankan server lokal (misalnya Python/Live-Server) seperti panduan di README.md, ATAU\n2. Unggah ke GitHub Pages (karena menggunakan https:// yang aman, kamera akan otomatis aktif).');
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setCameraStatus('error', 'WebRTC Tidak Didukung');
    alert('Browser Anda tidak mendukung akses kamera. Harap gunakan browser modern (Chrome, Edge, Safari, Firefox).');
    return;
  }

  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  // Safe constraints: 1280x720 is supported by almost all modern laptops/mobile front cameras
  const constraints = {
    video: {
      facingMode: useFrontCamera ? 'user' : 'environment',
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
    audio: false
  };

  try {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (e) {
      console.warn("Retrying with simple video constraints...", e);
      // Graceful fallback to any video capture device
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }
    
    currentStream = stream;
    
    // Bind metadata listener BEFORE setting srcObject to avoid race conditions
    video.onloadedmetadata = () => {
      setCameraStatus('ready', 'Kamera Siap');
      video.play().catch(err => console.warn("Auto-play failed, waiting for user:", err));
    };
    
    video.srcObject = currentStream;
    
    // Fallback: If metadata is already loaded (sometimes happens instantly)
    if (video.readyState >= 2) {
      setCameraStatus('ready', 'Kamera Siap');
      video.play().catch(err => console.warn("Auto-play failed, waiting for user:", err));
    }
  } catch (error) {
    console.error('Webcam Access Error:', error);
    setCameraStatus('error', 'Kamera Gagal Diakses');
    alert('Gagal mengakses kamera. Harap pastikan:\n1. Izin kamera telah diberikan di browser.\n2. Kamera tidak sedang digunakan oleh aplikasi lain (seperti Zoom, Teams, dll).');
  }
}

function setCameraStatus(type, message) {
  statusDot.className = 'pulse-dot';
  if (type === 'error') {
    statusDot.classList.add('error');
    setStartBtnsDisabled(true);
  } else if (type === 'busy') {
    statusDot.classList.add('busy');
    setStartBtnsDisabled(true);
  } else {
    // ready
    setStartBtnsDisabled(false);
  }
  statusText.textContent = message;
}

function toggleCameraFacing() {
  useFrontCamera = !useFrontCamera;
  // Auto-set mirror: front camera = ON (selfie), rear camera = OFF (natural)
  isMirrored = useFrontCamera;
  applyMirrorState();
  startCamera();
}

// --- SOUND EFFECTS SYNTHESIZER (Web Audio API) ---
function playBeepSound() {
  if (!isSoundEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // Pitch (A5 note)
    
    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  } catch (e) {
    console.warn('Audio Context failed to start:', e);
  }
}

function playShutterSound() {
  if (!isSoundEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // 1. Shutter White Noise Burst
    const bufferSize = audioCtx.sampleRate * 0.15; // 0.15 seconds
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'bandpass';
    filterNode.frequency.setValueAtTime(1000, audioCtx.currentTime);
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    
    noiseNode.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // 2. Camera Mirror Click Tone
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 0.08);
    
    oscGain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
    
    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);
    
    noiseNode.start();
    osc.start();
    
    noiseNode.stop(audioCtx.currentTime + 0.15);
    osc.stop(audioCtx.currentTime + 0.08);
  } catch (e) {
    console.warn('Audio Context failed to start:', e);
  }
}

function toggleSoundState() {
  isSoundEnabled = !isSoundEnabled;
  if (isSoundEnabled) {
    soundOnIcon.classList.remove('hidden');
    soundOffIcon.classList.add('hidden');
    soundBtnText.textContent = 'Suara Aktif';
    playBeepSound();
  } else {
    soundOnIcon.classList.add('hidden');
    soundOffIcon.classList.remove('hidden');
    soundBtnText.textContent = 'Suara Mati';
  }
}

function toggleMirrorState() {
  isMirrored = !isMirrored;
  applyMirrorState();
}

// Apply current isMirrored state to video, canvas, and button label
function applyMirrorState() {
  video.classList.toggle('mirrored', isMirrored);
  liveCanvas.classList.toggle('mirrored', isMirrored);
  mirrorBtnText.textContent = isMirrored ? 'Mirror: On' : 'Mirror: Off';
}

// --- OPTION CHIPS AND CONFIGURATION ---
function initializeFilters() {
  filterChipsGrid.innerHTML = '';
  FILTERS.forEach(f => {
    const btn = document.createElement('button');
    btn.className = `filter-chip-btn ${f.id === selectedFilter ? 'active' : ''}`;
    btn.textContent = f.label;
    btn.dataset.id = f.id;
    
    btn.addEventListener('click', () => {
      selectedFilter = f.id;
      // Apply CSS filter to preview
      video.style.filter = f.css;
      
      // Update UI active state
      document.querySelectorAll('.filter-chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
    
    filterChipsGrid.appendChild(btn);
  });
}

function initializeFrames() {
  frameChipsList.innerHTML = '';

  // Group: Polos
  const solidGroup = document.createElement('div');
  solidGroup.className = 'frame-group';
  const solidLabel = document.createElement('span');
  solidLabel.className = 'frame-group-label';
  solidLabel.textContent = 'Polos';
  solidGroup.appendChild(solidLabel);
  const solidRow = document.createElement('div');
  solidRow.className = 'frame-chips-row';
  solidGroup.appendChild(solidRow);
  frameChipsList.appendChild(solidGroup);

  // Group: Dekoratif
  const decoGroup = document.createElement('div');
  decoGroup.className = 'frame-group';
  const decoLabel = document.createElement('span');
  decoLabel.className = 'frame-group-label';
  decoLabel.textContent = 'Dekoratif';
  decoGroup.appendChild(decoLabel);
  const decoRow = document.createElement('div');
  decoRow.className = 'frame-chips-row frame-chips-deco-row';
  decoGroup.appendChild(decoRow);
  frameChipsList.appendChild(decoGroup);

  FRAMES.forEach(fr => {
    const chip = document.createElement('button');
    chip.title = fr.label;
    chip.dataset.id = fr.id;

    if (fr.type === 'solid') {
      chip.className = `frame-chip ${fr.id === selectedFrameId ? 'active' : ''}`;
      chip.style.backgroundColor = fr.color;
      const isDarkColor = isHexColorDark(fr.color);
      chip.style.color = isDarkColor ? '#fffdfa' : '#2b2622';
      solidRow.appendChild(chip);
    } else {
      chip.className = `frame-chip frame-chip--deco ${fr.id === selectedFrameId ? 'active' : ''}`;
      chip.style.backgroundColor = fr.color;
      chip.textContent = fr.label.split(' ')[0]; // show emoji
      const isDarkColor = isHexColorDark(fr.color);
      chip.style.color = isDarkColor ? '#fffdfa' : '#2b2622';
      // Mini canvas preview inside chip
      const miniCanvas = document.createElement('canvas');
      miniCanvas.width = 44;
      miniCanvas.height = 44;
      miniCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border-radius:inherit;pointer-events:none;';
      chip.style.position = 'relative';
      chip.style.overflow = 'hidden';
      chip.style.fontSize = '18px';
      // Draw preview after appending
      setTimeout(() => {
        const mctx = miniCanvas.getContext('2d');
        mctx.fillStyle = fr.color;
        mctx.fillRect(0, 0, 44, 44);
        fr.draw(mctx, 44, 44);
        chip.appendChild(miniCanvas);
      }, 0);
      decoRow.appendChild(chip);
    }

    chip.addEventListener('click', () => {
      selectedFrameColor = fr.color;
      selectedFrameId = fr.id;
      document.querySelectorAll('.frame-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });
}

function initializeLayouts() {
  document.querySelectorAll('.layout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      activeLayout = btn.dataset.layout;
      maxShots = parseInt(btn.dataset.shots);
    });
  });
}

// Utility to check if hex color is dark
function isHexColorDark(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

// --- SESSION CONTROLLER ---
async function startSession() {
  // Disable UI during session
  setStartBtnsDisabled(true);
  switchCamBtn.disabled = true;
  document.querySelectorAll('.layout-btn, .frame-chip, .filter-chip-btn').forEach(el => el.disabled = true);
  
  capturedPhotos = [];
  shotCounter.style.display = 'block';
  totalShotsNum.textContent = maxShots;
  
  setCameraStatus('busy', 'Mengambil Foto...');

  for (let i = 0; i < maxShots; i++) {
    currentShotNum.textContent = i + 1;
    
    // 1. Run 3 seconds countdown
    await runShotCountdown(3);
    
    // 2. Play shutter sound and capture frame
    playShutterSound();
    triggerFlashAnimation();
    
    const photoDataUrl = captureVideoFrame();
    capturedPhotos.push(photoDataUrl);
    
    // 3. Brief delay between shots
    await wait(600);
  }

  // Session completed
  shotCounter.style.display = 'none';
  setCameraStatus('ready', 'Proses Foto...');
  
  // Build and display stitched strip
  await buildStitchedStrip();
  showModal();
  
  // Re-enable UI
  setStartBtnsDisabled(false);
  switchCamBtn.disabled = false;
  document.querySelectorAll('.layout-btn, .frame-chip, .filter-chip-btn').forEach(el => el.disabled = false);
  setCameraStatus('ready', 'Kamera Siap');
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function runShotCountdown(seconds) {
  return new Promise(async (resolve) => {
    countdownOverlay.classList.add('active');
    
    for (let c = seconds; c > 0; c--) {
      countdownText.textContent = c;
      playBeepSound();
      
      // Animate countdown text scale
      countdownText.style.animation = 'none';
      void countdownText.offsetWidth; // Trigger reflow
      countdownText.style.animation = 'countdownPulse 1s ease-in-out infinite';
      
      await wait(1000);
    }
    
    countdownOverlay.classList.remove('active');
    resolve();
  });
}

function triggerFlashAnimation() {
  flashOverlay.classList.remove('trigger');
  void flashOverlay.offsetWidth; // Trigger reflow
  flashOverlay.classList.add('trigger');
}

function captureVideoFrame() {
  const videoW = video.videoWidth || 640;
  const videoH = video.videoHeight || 480;
  
  // Calculate crop dimensions for 4:3 aspect ratio
  const targetRatio = 4 / 3;
  let sWidth = videoW;
  let sHeight = videoH;
  let sx = 0;
  let sy = 0;
  
  if (videoW / videoH > targetRatio) {
    // Source is wider (e.g. 16:9 landscape)
    sWidth = videoH * targetRatio;
    sx = (videoW - sWidth) / 2;
  } else {
    // Source is taller (e.g. 9:16 portrait on phone)
    sHeight = videoW / targetRatio;
    sy = (videoH - sHeight) / 2;
  }
  
  // Standardize output frame size to 640x480 (4:3)
  captureCanvas.width = 640;
  captureCanvas.height = 480;
  
  const ctx = captureCanvas.getContext('2d');
  ctx.clearRect(0, 0, captureCanvas.width, captureCanvas.height);
  
  ctx.save();
  
  // Apply mirroring if enabled
  if (isMirrored) {
    ctx.translate(captureCanvas.width, 0);
    ctx.scale(-1, 1);
  }
  
  // Draw the cropped center portion of the video onto the full canvas
  ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, captureCanvas.width, captureCanvas.height);
  
  ctx.restore();
  
  // Return as base64 jpeg
  return captureCanvas.toDataURL('image/jpeg', 0.95);
}

// --- CANVAS STITCHING ENGINE ---
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
}

async function buildStitchedStrip() {
  const photoWidth = 540;
  const photoHeight = Math.round(photoWidth * 3 / 4); // 405px
  const padding = 28;
  const gap = 20;
  const footerHeight = 85;
  
  let canvasW, canvasH;
  
  // Determine layout dimensions
  if (activeLayout === 'grid-2x2') {
    canvasW = photoWidth * 2 + padding * 2 + gap;
    canvasH = photoHeight * 2 + padding * 2 + gap + footerHeight;
  } else {
    // strip-3 or strip-4
    canvasW = photoWidth + padding * 2;
    canvasH = (photoHeight * maxShots) + padding * 2 + (gap * (maxShots - 1)) + footerHeight;
  }
  
  stripCanvas.width = canvasW;
  stripCanvas.height = canvasH;
  
  const ctx = stripCanvas.getContext('2d');
  
  // 1. Fill Frame Background
  ctx.fillStyle = selectedFrameColor;
  ctx.fillRect(0, 0, canvasW, canvasH);
  // If decorative frame, draw the overlay BEFORE photos
  const activeFrame = FRAMES.find(f => f.id === selectedFrameId);
  if (activeFrame && activeFrame.type === 'decorative' && activeFrame.draw) {
    activeFrame.draw(ctx, canvasW, canvasH);
  }
  
  // 2. Draw Captured Images (with filter applied on top)
  const filterCss = FILTERS.find(f => f.id === selectedFilter).css;
  ctx.filter = filterCss;
  
  for (let i = 0; i < capturedPhotos.length; i++) {
    const img = await loadImage(capturedPhotos[i]);
    
    let x, y;
    
    if (activeLayout === 'grid-2x2') {
      const col = i % 2;
      const row = Math.floor(i / 2);
      x = padding + col * (photoWidth + gap);
      y = padding + row * (photoHeight + gap);
    } else {
      // vertical strip
      x = padding;
      y = padding + i * (photoHeight + gap);
    }
    
    ctx.drawImage(img, x, y, photoWidth, photoHeight);
  }
  
  // Reset filter for text/branding
  ctx.filter = 'none';
  
  // 3. Draw Branding & Date Footer
  const isDarkFrame = isHexColorDark(selectedFrameColor);
  const textColor = isDarkFrame ? '#FFFDF8' : '#2B2622';
  const subColor = isDarkFrame ? 'rgba(255, 253, 250, 0.7)' : 'rgba(43, 38, 34, 0.7)';
  
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  
  // Title (Playfair Serif mood)
  ctx.font = '700 24px Georgia, serif';
  ctx.fillText('InstaBooth Studio', canvasW / 2, canvasH - footerHeight + 34);
  
  // Date & Format (Sans Mood)
  const today = new Date();
  const dateStr = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatText = `—  ${activeLayout.toUpperCase().replace('-', ' ')}  —  ${dateStr}`;
  
  ctx.fillStyle = subColor;
  ctx.font = '500 13px "Outfit", sans-serif';
  ctx.fillText(formatText, canvasW / 2, canvasH - footerHeight + 58);
}

// --- RESULT DIALOG & SHARING ---
function showModal() {
  resultModal.classList.add('show');
}

function hideModal() {
  resultModal.classList.remove('show');
  
  // Save current strip into history automatically
  saveStripToGallery();
}

function downloadStitchedStrip() {
  const formatName = activeLayout === 'grid-2x2' ? 'grid' : 'strip';
  const filename = `instabooth-${formatName}-${Date.now()}.jpg`;
  
  const link = document.createElement('a');
  link.download = filename;
  link.href = stripCanvas.toDataURL('image/jpeg', 0.95);
  link.click();
}

// --- LOCAL GALLERY MANAGEMENT ---
function setupGallery() {
  const stored = localStorage.getItem('instabooth_gallery');
  if (stored) {
    try {
      galleryList = JSON.parse(stored);
    } catch (e) {
      galleryList = [];
    }
  }
  renderGallery();
}

function saveStripToGallery() {
  const imgData = stripCanvas.toDataURL('image/jpeg', 0.85); // High compression to save LocalStorage quota
  const today = new Date();
  const dateStr = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  
  const item = {
    id: 'photo_' + Date.now(),
    src: imgData,
    date: dateStr,
    layout: activeLayout.replace('-', ' ')
  };
  
  // Add to start of array
  galleryList.unshift(item);
  
  // Keep only last 10 photos to prevent LocalStorage quota overflow (approx 5-10MB limit)
  if (galleryList.length > 8) {
    galleryList.pop();
  }
  
  localStorage.setItem('instabooth_gallery', JSON.stringify(galleryList));
  renderGallery();
}

function renderGallery() {
  // Clear grid except empty state
  const items = galleryGrid.querySelectorAll('.gallery-item');
  items.forEach(el => el.remove());
  
  if (galleryList.length === 0) {
    galleryEmptyState.style.display = 'flex';
    clearGalleryBtn.style.display = 'none';
    return;
  }
  
  galleryEmptyState.style.display = 'none';
  clearGalleryBtn.style.display = 'inline-flex';
  
  galleryList.forEach(item => {
    const card = document.createElement('div');
    card.className = 'gallery-item';
    
    card.innerHTML = `
      <img src="${item.src}" alt="InstaBooth Strip">
      <div class="gallery-item-footer">
        <div class="gallery-item-info">
          <span class="layout-tag">${item.layout.toUpperCase()}</span>
          <span class="date-tag">${item.date}</span>
        </div>
        <div class="gallery-item-actions">
          <button class="gallery-action-btn btn-download-item" title="Unduh Strip Foto">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
          <button class="gallery-action-btn btn-delete btn-delete-item" title="Hapus">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    `;
    
    // Add event listeners to actions
    card.querySelector('.btn-download-item').addEventListener('click', (e) => {
      e.stopPropagation();
      downloadGalleryItem(item.src, item.layout);
    });
    
    card.querySelector('.btn-delete-item').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteGalleryItem(item.id);
    });
    
    // Clicking card opens full size in a new tab
    card.addEventListener('click', () => {
      const newTab = window.open();
      newTab.document.write(`<img src="${item.src}" style="max-width:100%; height:auto; display:block; margin:20px auto; box-shadow:0 8px 30px rgba(0,0,0,0.3); border-radius:4px;">`);
      newTab.document.title = "InstaBooth Full Preview";
    });

    galleryGrid.appendChild(card);
  });
}

function downloadGalleryItem(src, layout) {
  const filename = `instabooth-${layout.replace(' ', '-')}-${Date.now()}.jpg`;
  const link = document.createElement('a');
  link.download = filename;
  link.href = src;
  link.click();
}

function deleteGalleryItem(id) {
  if (confirm('Apakah Anda yakin ingin menghapus foto strip ini?')) {
    galleryList = galleryList.filter(item => item.id !== id);
    localStorage.setItem('instabooth_gallery', JSON.stringify(galleryList));
    renderGallery();
  }
}

function clearGallery() {
  if (confirm('Apakah Anda yakin ingin menghapus semua riwayat foto strip Anda?')) {
    galleryList = [];
    localStorage.removeItem('instabooth_gallery');
    renderGallery();
  }
}
