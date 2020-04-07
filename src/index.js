import './styles.css';

var videoElement = document.getElementById('video');
var volumeMeter = document.getElementById('volume-meter');
var noPermissionsError = document.querySelector('.help-text .error.no-permissions');
var noDevicesError = document.querySelector('.help-text .error.no-devices');
// volume meter
var meter = null;
var canvasContext = null;
var WIDTH = 30;
var HEIGHT = 150;
var rafID = null;

var mediaStreamSource = null;

// grab our canvas
canvasContext = volumeMeter.getContext('2d');

// monkeypatch Web Audio
window.AudioContext = window.AudioContext || window.webkitAudioContext;

function createAudioMeter(audioContext, clipLevel, averaging, clipLag) {
  var processor = audioContext.createScriptProcessor(512);
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

  processor.checkClipping =
    function () {
      if (!this.clipping)
        return false;
      if ((this.lastClip + this.clipLag) < window.performance.now())
        this.clipping = false;
      return this.clipping;
    };

  processor.shutdown =
    function () {
      this.disconnect();
      this.onaudioprocess = null;
    };

  return processor;
}

function volumeAudioProcess(event) {
  var buf = event.inputBuffer.getChannelData(0);
  var bufLength = buf.length;
  var sum = 0;
  var x;

  // Do a root-mean-square on the samples: sum up the squares...
  for (var i = 0; i < bufLength; i++) {
    x = buf[i];
    if (Math.abs(x) >= this.clipLevel) {
      this.clipping = true;
      this.lastClip = window.performance.now();
    }
    sum += x * x;
  }

  // ... then take the square root of the sum.
  var rms = Math.sqrt(sum / bufLength);

  // Now smooth this out with the averaging factor applied
  // to the previous sample - take the max here because we
  // want "fast attack, slow release."
  this.volume = Math.max(rms, this.volume * this.averaging);
}

function getAudioVideoStream() {
  if (!noPermissionsError.classList.contains('hidden')) {
    noPermissionsError.classList.add('hidden');
  }
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

  navigator.mediaDevices.getUserMedia({
    video: {
      width: 640,
      height: 480
    },
    audio: {
      mandatory: {
        googEchoCancellation: false,
        googAutoGainControl: false,
        googNoiseSuppression: false,
        googHighpassFilter: false
      },
      optional: []
    },
  })
    .then(function (stream) {
      video.srcObject = stream;
      gotStream(stream);
      video.play();
    })
    .catch(function (err) {
      console.log('An error occurred: ' + err);
      noPermissionsError.classList.remove('hidden');
    });
}

function gotStream(stream) {
  // grab an audio context
  var audioContext = new AudioContext();
  // Create an AudioNode from the stream.
  mediaStreamSource = audioContext.createMediaStreamSource(stream);

  // Create a new volume meter and connect it.
  meter = createAudioMeter(audioContext);
  mediaStreamSource.connect(meter);

  // kick off the visual updating
  drawLoop();
}

function drawLoop(time) {
  // clear the background
  canvasContext.clearRect(0, 0, WIDTH, HEIGHT);

  // check if we're currently clipping
  if (meter.checkClipping())
    canvasContext.fillStyle = '#F00';
  else
    canvasContext.fillStyle = '#0F0';

  // draw a bar based on the current volume
  canvasContext.fillRect(0, HEIGHT - (meter.volume * HEIGHT * 1.4), WIDTH, meter.volume * HEIGHT * 1.4);

  // set up the next visual callback
  rafID = window.requestAnimationFrame(drawLoop);
}

function detectCamic() {
  return new Promise(function (resolve, reject) {
    var browserSupport = navigator.mediaDevices || navigator.mediaDevices.enumerateDevices;
    if (!browserSupport) {
      reject('no browser support');
    }
    navigator.mediaDevices.enumerateDevices().then(devices => {
      if (devices.some(device => ['videoinput', 'audioinput'].indexOf(device.kind) > -1)) {
        resolve('success')
      } else {
        reject('no devices available');
      }
    });
  });
}

detectCamic().then(function () {
  document.querySelector('.start-button').addEventListener('click', getAudioVideoStream);

  document.querySelector('.stop-button').addEventListener('click', function onStop() {
    var tracks = videoElement.srcObject && videoElement.srcObject.getTracks();
    tracks && tracks.forEach(function (stream) { stream.stop() });
    if (rafID) {
      window.cancelAnimationFrame(rafID);
      canvasContext.clearRect(0, 0, WIDTH, HEIGHT);
    }
  });
}).catch(function (reason) {
  console.log(reason);
  noDevicesError.classList.remove('hidden');
});
