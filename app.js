(function () {
  var videoElement = document.getElementById('video');
  var errorTextElement = document.querySelector('.help-text .error');
  // volume meter
  var meter = null;
  var canvasContext = null;
  var WIDTH = 30;
  var HEIGHT = 150;
  var rafID = null;

  var mediaStreamSource = null;
  // grab our canvas
  canvasContext = document.getElementById('volume-meter').getContext('2d');

  // monkeypatch Web Audio
  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  function getAudioVideoStream() {
    if (!errorTextElement.classList.contains('hidden')) {
      errorTextElement.classList.add('hidden');
    }
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;

    navigator.mediaDevices.getUserMedia({
      video: {
        width: 1024,
        height: 768
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
        errorTextElement.classList.remove('hidden');
      });
  }

  document.querySelector('.start-button').addEventListener('click', getAudioVideoStream);

  document.querySelector('.stop-button').addEventListener('click', function onStop() {
    var tracks = videoElement.srcObject && videoElement.srcObject.getTracks();
    tracks && tracks.forEach(function (stream) { stream.stop() });
    rafID && window.cancelAnimationFrame(rafID);
  });

  document.getElementById('video').addEventListener('click', getAudioVideoStream);


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
}());

