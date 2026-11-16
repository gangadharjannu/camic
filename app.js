'use strict';

const $ = (selector) => document.querySelector(selector);
const container = $('.camic-container');
const video = $('#video');
const meterEl = $('#volume-meter');
const controls = $('.controls');
const cameraSelect = $('#camera-select');
const micSelect = $('#mic-select');
const mirrorToggle = $('#mirror-toggle');
const installButton = $('#install-button');
const videoInfo = $('#video-info');
const errorEl = $('#error-message');
const noticeEl = $('#notice-message');
const cameraStatus = $('#camera-status');
const micStatus = $('#mic-status');

const VIDEO = { width: { ideal: 1280 }, height: { ideal: 720 } };
// Raw input, so the meter shows what the mic really picks up
const AUDIO = { echoCancellation: false, noiseSuppression: false, autoGainControl: false };

const MESSAGES = {
  NotAllowedError:
    'Camera and microphone access is blocked. Allow it in your browser settings and reload the page.',
  NotFoundError: 'No camera or microphone was found. Connect one and reload the page.',
  NotReadableError: 'The camera or microphone is in use by another app. Close it and try again.',
  OverconstrainedError: 'The selected device is no longer available.',
  unsupported: "Your browser can't access a camera or microphone on this page.",
  waiting: 'Allow camera and microphone access to start the test.',
  dark: 'The camera image is very dark. Check the lens cover or the light.',
};

const store = {
  get(key) {
    try {
      return localStorage.getItem(`camic.${key}`);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`camic.${key}`, value);
    } catch {
      // storage unavailable (private mode etc.) — preferences just won't persist
    }
  },
};

let videoTrack = null;
let audioTrack = null;

/* ---------- messages ---------- */

function show(el, text) {
  el.textContent = text;
  el.classList.toggle('hidden', !text);
}

function setStatus(el, state, text) {
  el.className = `status ${state}`;
  el.textContent = text;
  el.title = '';
}

// Show `text` in the notice, or clear it only if it is still showing `text`
function toggleNotice(text, on) {
  if (on) show(noticeEl, text);
  else if (noticeEl.textContent === text) show(noticeEl, '');
}

const messageFor = (err) => MESSAGES[err && err.name] || (err && err.message) || String(err);

/* ---------- volume meter ---------- */

const CLIP_LEVEL = 0.98;
const CLIP_LAG = 750; // ms the meter stays red after clipping
const FLOOR_DB = -60; // quietest level shown
const RELEASE = 0.012; // fall per frame: fast attack, slow release
const SOUND_DB = -45; // above the noise floor of a quiet room
const SILENCE_MS = 5000; // warn when no sound is heard for this long

let audioCtx = null;
let analyser = null;
let source = null;
let samples = null;
let rafId = 0;
let level = 0;
let lastClip = -Infinity;
let micOk = false;
let silenceTimer = 0;

function drawMeter(now) {
  analyser.getFloatTimeDomainData(samples);
  let sumSquares = 0;
  let peak = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const x = samples[i];
    sumSquares += x * x;
    if (Math.abs(x) > peak) peak = Math.abs(x);
  }
  if (peak >= CLIP_LEVEL) lastClip = now;

  const db = 10 * Math.log10(sumSquares / samples.length || 1e-10); // == 20·log10(rms)
  if (!micOk && db > SOUND_DB) {
    micOk = true;
    clearTimeout(silenceTimer);
    setStatus(micStatus, 'ok', 'Mic: working');
  }
  const target = Math.min(1, Math.max(0, 1 - db / FLOOR_DB));
  level = Math.max(target, level - RELEASE);

  meterEl.style.setProperty('--level', level.toFixed(3));
  meterEl.classList.toggle('clipping', now - lastClip < CLIP_LAG);
  rafId = requestAnimationFrame(drawMeter);
}

function stopMeter() {
  cancelAnimationFrame(rafId);
  clearTimeout(silenceTimer);
  setStatus(micStatus, '', '');
  if (source) source.disconnect();
  source = null;
  level = 0;
  meterEl.style.setProperty('--level', 0);
  meterEl.classList.add('hidden');
}

function startMeter(track) {
  stopMeter();
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  if (!audioCtx) {
    audioCtx = new AudioCtx();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;
    samples = new Float32Array(analyser.fftSize);
  }
  source = audioCtx.createMediaStreamSource(new MediaStream([track]));
  source.connect(analyser);

  if (audioCtx.state === 'suspended') {
    // Autoplay policy: resume on the first user gesture if the browser blocked it
    const resume = () => audioCtx.resume();
    audioCtx.resume().catch(() => {});
    window.addEventListener('pointerdown', resume, { once: true });
    window.addEventListener('keydown', resume, { once: true });
  }
  meterEl.classList.remove('hidden');
  micOk = false;
  setStatus(micStatus, 'pending', 'Mic: speak to test');
  silenceTimer = setTimeout(() => {
    setStatus(micStatus, 'warn', 'Mic: no sound');
    micStatus.title = 'Check that the mic is not muted and that the correct mic is selected.';
  }, SILENCE_MS);
  rafId = requestAnimationFrame(drawMeter);
}

/* ---------- camera check ---------- */

const DARK_LUMA = 24; // average brightness (0–255) below this is "too dark"
const probe = document.createElement('canvas');
probe.width = 32;
probe.height = 18;
const probeCtx = probe.getContext('2d', { willReadFrequently: true });
let cameraTimer = 0;

// Once a second, average the brightness of a tiny copy of the frame
function checkCamera() {
  if (!video.videoWidth) return;
  probeCtx.drawImage(video, 0, 0, probe.width, probe.height);
  const { data } = probeCtx.getImageData(0, 0, probe.width, probe.height);
  let luma = 0;
  for (let i = 0; i < data.length; i += 4) {
    luma += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  }
  const dark = luma / (data.length / 4) < DARK_LUMA;
  setStatus(cameraStatus, dark ? 'warn' : 'ok', dark ? 'Camera: too dark' : 'Camera: working');
  toggleNotice(MESSAGES.dark, dark);
}

function startCameraCheck() {
  clearInterval(cameraTimer);
  setStatus(cameraStatus, 'pending', 'Camera: starting');
  cameraTimer = setInterval(checkCamera, 1000);
}

function stopCameraCheck() {
  clearInterval(cameraTimer);
  setStatus(cameraStatus, '', '');
  toggleNotice(MESSAGES.dark, false);
}

/* ---------- mirror ---------- */

function setMirror(on) {
  video.classList.toggle('mirrored', on);
  mirrorToggle.setAttribute('aria-pressed', String(on));
}

mirrorToggle.addEventListener('click', () => {
  const on = !video.classList.contains('mirrored');
  setMirror(on);
  store.set('mirror', on ? '1' : '0');
});

/* ---------- tracks ---------- */

function updateVideoInfo() {
  if (!videoTrack || !video.videoWidth) {
    videoInfo.textContent = '';
    return;
  }
  const { frameRate } = videoTrack.getSettings();
  videoInfo.textContent = `Video: ${video.videoWidth}×${video.videoHeight}${
    frameRate ? `, ${Math.round(frameRate)} fps` : ''
  }`;
}
video.addEventListener('resize', updateVideoInfo);

function setTrack(track) {
  const isVideo = track.kind === 'video';
  const { deviceId, facingMode } = track.getSettings();
  const select = isVideo ? cameraSelect : micSelect;
  if (deviceId) {
    store.set(isVideo ? 'camera' : 'mic', deviceId);
    select.value = deviceId;
  }
  // Fires when a device is unplugged or permission is revoked
  track.addEventListener('ended', () => {
    if (track === videoTrack || track === audioTrack) switchDevice(track.kind);
  });

  if (isVideo) {
    videoTrack = track;
    video.srcObject = new MediaStream([track]);
    video.play().catch(() => {});
    startCameraCheck();
    const pref = store.get('mirror');
    // Mirror front cameras by default, but not rear (environment) cameras
    setMirror(pref === null ? facingMode !== 'environment' : pref === '1');
  } else {
    audioTrack = track;
    startMeter(track);
  }
}

function clearTrack(kind) {
  if (kind === 'video') {
    if (videoTrack) videoTrack.stop();
    videoTrack = null;
    video.srcObject = null;
    stopCameraCheck();
    updateVideoInfo();
  } else {
    if (audioTrack) audioTrack.stop();
    audioTrack = null;
    stopMeter();
  }
}

async function openDevice(kind, deviceId) {
  const constraints = { ...(kind === 'video' ? VIDEO : AUDIO) };
  if (deviceId) constraints.deviceId = { exact: deviceId };
  const stream = await navigator.mediaDevices.getUserMedia({ [kind]: constraints });
  setTrack(stream.getTracks()[0]);
}

/* ---------- device lists ---------- */

// "FaceTime HD Camera (2C0E:82E3)" -> "FaceTime HD Camera"
const cleanLabel = (label) => label.replace(/\s*\([0-9a-f]{4}:[0-9a-f]{4}\)$/i, '');

function fillSelect(select, devices, track, name) {
  const current = track && track.getSettings().deviceId;
  select.replaceChildren(
    ...devices.map(
      (d, i) => new Option(cleanLabel(d.label) || `${name} ${i + 1}`, d.deviceId, false, d.deviceId === current)
    )
  );
  select.disabled = devices.length < 2;
  select.parentElement.classList.toggle('hidden', devices.length === 0);
}

async function refreshDeviceLists() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const ofKind = (kind) =>
    devices.filter((d) => d.kind === kind && d.deviceId && d.deviceId !== 'communications');
  fillSelect(cameraSelect, ofKind('videoinput'), videoTrack, 'Camera');
  fillSelect(micSelect, ofKind('audioinput'), audioTrack, 'Microphone');
}

async function switchDevice(kind, deviceId) {
  show(noticeEl, '');
  // Stop first: many phones can't open two cameras at the same time
  clearTrack(kind);
  try {
    await openDevice(kind, deviceId);
  } catch (err) {
    show(noticeEl, messageFor(err));
    // Fall back to the default device
    if (deviceId) await openDevice(kind).catch(() => {});
  }
  await refreshDeviceLists();
}

cameraSelect.addEventListener('change', () => switchDevice('video', cameraSelect.value));
micSelect.addEventListener('change', () => switchDevice('audio', micSelect.value));

async function onDeviceChange() {
  await refreshDeviceLists();
  // A device was plugged in while we had none of that kind
  const pending = [];
  if (!videoTrack && cameraSelect.options.length) pending.push(openDevice('video'));
  if (!audioTrack && micSelect.options.length) pending.push(openDevice('audio'));
  if (pending.length) {
    await Promise.allSettled(pending);
    if (videoTrack && audioTrack) show(noticeEl, '');
    await refreshDeviceLists();
  }
}

/* ---------- start ---------- */

function withSaved(base, key) {
  const id = store.get(key);
  // `ideal` (not exact) so a missing saved device silently falls back to the default
  return id ? { ...base, deviceId: id } : base;
}

async function start() {
  if (!window.isSecureContext || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw Object.assign(new Error(MESSAGES.unsupported), { name: 'unsupported' });
  }
  const devices = await navigator.mediaDevices.enumerateDevices();
  const hasCam = devices.some((d) => d.kind === 'videoinput');
  const hasMic = devices.some((d) => d.kind === 'audioinput');
  const unknown = !hasCam && !hasMic; // some browsers hide devices until permission is granted
  const videoC = (hasCam || unknown) && withSaved(VIDEO, 'camera');
  const audioC = (hasMic || unknown) && withSaved(AUDIO, 'mic');

  // Explain the black screen if the browser is still waiting for the user to answer the prompt
  const waiting = setTimeout(() => show(noticeEl, MESSAGES.waiting), 500);
  let tracks;
  try {
    tracks = (await navigator.mediaDevices.getUserMedia({ video: videoC, audio: audioC })).getTracks();
  } catch (err) {
    if (err.name === 'NotAllowedError' || !videoC || !audioC) throw err;
    // e.g. camera busy in another app — still let the user test whatever works
    const results = await Promise.allSettled([
      navigator.mediaDevices.getUserMedia({ video: videoC }),
      navigator.mediaDevices.getUserMedia({ audio: audioC }),
    ]);
    tracks = results.flatMap((r) => (r.status === 'fulfilled' ? r.value.getTracks() : []));
    if (!tracks.length) throw err;
  } finally {
    clearTimeout(waiting);
    toggleNotice(MESSAGES.waiting, false);
  }
  tracks.forEach(setTrack);

  if (!videoTrack) show(noticeEl, 'No camera available. Testing the microphone only.');
  else if (!audioTrack) show(noticeEl, 'No microphone available. Testing the camera only.');

  controls.classList.remove('hidden');
  await refreshDeviceLists();
  navigator.mediaDevices.addEventListener('devicechange', onDeviceChange);
}

start().catch((err) => {
  container.classList.add('hidden');
  controls.remove(); // its space is reserved on mobile; not needed on the error screen
  show(errorEl, messageFor(err));
});

// Release the camera/mic when leaving; restart if restored from the back/forward cache
window.addEventListener('pagehide', () => {
  clearTrack('video');
  clearTrack('audio');
});
window.addEventListener('pageshow', (e) => {
  if (e.persisted) window.location.reload();
});

/* ---------- PWA ---------- */

let installPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installPrompt = e;
  installButton.hidden = false;
});
installButton.addEventListener('click', () => {
  installButton.hidden = true;
  if (installPrompt) installPrompt.prompt();
  installPrompt = null;
});
window.addEventListener('appinstalled', () => {
  installButton.hidden = true;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  });
}
