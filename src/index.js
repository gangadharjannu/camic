import './styles.css';

const videoElement = document.getElementById('video');
const volumeMeter = document.getElementById('volume-meter');
const noPermissionsError = document.querySelector('.help-text .error.no-permissions');
const noDevicesError = document.querySelector('.help-text .error.no-devices');
const privacyText = document.querySelector('.overlay-text');

// volume meter
let meter = null;
let canvasContext = null;
const WIDTH = 30;
const HEIGHT = 150;
let rafID = null;

let mediaStreamSource = null;

// grab our canvas
canvasContext = volumeMeter.getContext('2d');

// monkeypatch Web Audio
window.AudioContext = window.AudioContext || window.webkitAudioContext;

function volumeAudioProcess(event) {
  const buf = event.inputBuffer.getChannelData(0);
  const bufLength = buf.length;
  let sum = 0;
  let x;

  // Do a root-mean-square on the samples: sum up the squares...
  for (let i = 0; i < bufLength; i += 1) {
    x = buf[i];
    if (Math.abs(x) >= this.clipLevel) {
      this.clipping = true;
      this.lastClip = window.performance.now();
    }
    sum += x * x;
  }

  // ... then take the square root of the sum.
  const rms = Math.sqrt(sum / bufLength);

  // Now smooth this out with the averaging factor applied
  // to the previous sample - take the max here because we
  // want "fast attack, slow release."
  this.volume = Math.max(rms, this.volume * this.averaging);
}

function createAudioMeter(audioContext, clipLevel, averaging, clipLag) {
  const processor = audioContext.createScriptProcessor(512);
  processor.onaudioprocess = volumeAudioProcess;
  processor.clipping = false;
  processor.lastClip = 0;
  processor.volume = 0;
  processor.clipLevel = clipLevel || 0.98;
  processor.averaging = averaging || 0.95;
  processor.clipLag = clipLag || 750;

  // this will have no effect, since we don't copy the input to the output,
  // but works around a current Chrome bug.
  processor.connect(audioContext.destination);

  processor.checkClipping = function checkClipping() {
    if (!this.clipping) return false;
    if (this.lastClip + this.clipLag < window.performance.now()) this.clipping = false;
    return this.clipping;
  };

  processor.shutdown = function shutdown() {
    this.disconnect();
    this.onaudioprocess = null;
  };

  return processor;
}

function drawLoop() {
  // clear the background
  canvasContext.clearRect(0, 0, WIDTH, HEIGHT);

  // check if we're currently clipping
  if (meter.checkClipping()) canvasContext.fillStyle = '#F00';
  else canvasContext.fillStyle = '#0F0';

  // draw a bar based on the current volume
  canvasContext.fillRect(
    0,
    HEIGHT - meter.volume * HEIGHT * 1.4,
    WIDTH,
    meter.volume * HEIGHT * 1.4
  );

  // set up the next visual callback
  rafID = window.requestAnimationFrame(drawLoop);
}

function gotStream(stream) {
  // grab an audio context
  const audioContext = new AudioContext();
  // Create an AudioNode from the stream.
  mediaStreamSource = audioContext.createMediaStreamSource(stream);

  // Create a new volume meter and connect it.
  meter = createAudioMeter(audioContext);
  mediaStreamSource.connect(meter);

  // kick off the visual updating
  drawLoop();
}

function getAudioVideoStream() {
  if (!noPermissionsError.classList.contains('hidden')) {
    noPermissionsError.classList.add('hidden');
  }
  if (videoElement.srcObject && videoElement.srcObject.active) {
    return Promise.reject(new Error('no video element found'));
  }

  navigator.getUserMedia =
    navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  return navigator.mediaDevices
    .getUserMedia({
      video: {
        width: 640,
        height: 480,
      },
      audio: {
        mandatory: {
          googEchoCancellation: false,
          googAutoGainControl: false,
          googNoiseSuppression: false,
          googHighpassFilter: false,
        },
        optional: [],
      },
    })
    .then(function gotStreamFromBrowser(stream) {
      videoElement.srcObject = stream;
      gotStream(stream);
      videoElement.play();
      // Starts displaying privacy text when the video starts playing
      privacyText.classList.remove('hidden');
    });
}

function detectCamic() {
  return new Promise(function hasBrowserSupport(resolve, reject) {
    const browserSupport = navigator.mediaDevices || navigator.mediaDevices.enumerateDevices;
    if (!browserSupport) {
      reject(new Error('no browser support'));
    }
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const availableDevices = devices.map((device) => device.kind);
      if (
        ['videoinput', 'audioinput'].every(
          (inputDevices) => availableDevices.indexOf(inputDevices) > -1
        )
      ) {
        resolve('success');
      } else {
        reject(new Error('camera and microphone are not available'));
      }
    });
  });
}

/**
 * Main function
 * Execution starts here
 * check for browser support
 * If we have browser support then ask for permissions and display video upon successful permissions
 */
detectCamic()
  .then(getAudioVideoStream)
  .catch(function noCamicSupport(reason) {
    document.querySelector('.camic-container').classList.add('hidden');
    // eslint-disable-next-line no-console
    console.log(`An error occurred: ${reason}`);
    if (reason && reason.message && reason.message.toLowerCase().includes('permission denied')) {
      noPermissionsError.classList.remove('hidden');
    } else {
      noDevicesError.classList.remove('hidden');
    }

    window.addEventListener('beforeunload', window.cancelAnimationFrame(rafID));
  });
