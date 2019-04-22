import '@babel/polyfill';
import './reset.css';
import './main.css';

// get source details
// each device contains below 4 properties
// deviceId: device id
// groupID: group id
// kind: type of source : audio/video
// label: source label

// video element
const videoEl = document.querySelector('video');
const audioSourceEl = document.getElementById('audioSource');
const videoSourceEl = document.getElementById('videoSource');

function init() {
    // Reduces reverbertation
    videoEl.volume = 0.1;
    getDevices();
    getStream();
}
async function getDevices() {
    let devices = null;
    let audioSourceOptions = document.createDocumentFragment();
    let videoSourceOptions = document.createDocumentFragment();

    try {
        devices = await navigator.mediaDevices.enumerateDevices();
        for (let device of devices) {
            if (device.kind === 'audioinput') {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text =
                    device.label || `microphone ${audioSourceEl.length + 1}`;
                audioSourceOptions.appendChild(option);
            } else if (device.kind === 'videoinput') {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text =
                    device.label || `camera ${videoSourceEl.length + 1}`;
                videoSourceOptions.appendChild(option);
            } else {
                console.log('unknown device: ', device);
            }
        }
        audioSourceEl.appendChild(audioSourceOptions);
        videoSourceEl.appendChild(videoSourceOptions);
    } catch (error) {
        handleError(error);
    }
}
async function getStream() {
    let mediaStream = null;

    const audioSource = audioSourceEl.value;
    const videoSource = videoSourceEl.value;
    const videoOptions = {
        width: { ideal: 640, max: 1280 },
        height: { ideal: 480, max: 720 }
    };
    const constraints = {
        audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
        video: {
            deviceId: videoSource
                ? { exact: videoSource, ...videoOptions }
                : undefined
        }
    };
    videoEl.srcObject = null;
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        videoEl.srcObject = mediaStream;
    } catch (error) {
        handleError(error);
    }
}
function handleError(error) {
    console.error(
        `navigator.mediaDevices error: ${error.name}, ${error.message}`
    );
}

audioSourceEl.onchange = getStream;
videoSourceEl.onchange = getStream;

// start
init();
