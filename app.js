(function () {
  var videoElement = document.getElementById('video');

  function getAudioVideoStream() {
    try {
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
        });
    } catch (e) {
      alert('getUserMedia threw exception :' + e);
    }
  }
  function play(event) {
    event.preventDefault();

    if (isNaN(videoElement.duration)) {
      getAudioVideoStream();
    } else {
      videoElement.play();
    }
  }

  document.querySelector('.start-btn').addEventListener('click', play);

  document.querySelector('.stop-btn').addEventListener('click', function onStop() {
    videoElement.pause();
  });

  document.getElementById('video').addEventListener('click', play);


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

