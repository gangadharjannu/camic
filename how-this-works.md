# How this works

## 1. Start sequence

1. The application gets the list of devices (`enumerateDevices()`).
2. The application requests the camera and the microphone in one call (`getUserMedia()`). The browser shows one permission request.
3. If one device fails, the application tests the other device. Example: another application uses the camera.

## 2. Video

- The video track goes to the `<video>` element.
- CSS `scaleX(-1)` makes a mirror image.
- The application does not mirror a rear camera (`facingMode: environment`) by default.

Layout:

- On a wide screen (desktop), the video fills the screen. The toolbar and the text are on top of the video.
- On a narrow or portrait screen (phone), the parts are in a column: toolbar, video, level meter, privacy text. No part covers the video.
- On a phone, the video shows the full camera frame (`object-fit: contain`). The column uses the visible screen height (`100dvh`).
- On a phone, the toolbar keeps its space before it appears. Thus, the video does not move when the toolbar appears.

## 3. Level meter

1. The audio track goes to an `AudioContext` and then to an `AnalyserNode`.
2. For each animation frame, the application reads the waveform.
3. The application calculates the RMS level in dB. The range is −60 dB to 0 dB.
4. The application sets the CSS variable `--level` (0 to 1) on the meter.
5. A dark cover hides the unlit part of the meter (`transform: scale`). The browser does not paint again for each frame.

The meter has LED segments in three zones:

| Zone | Level | Meaning |
|---|---|---|
| Green | Up to −18 dB | Good level. Usual speech is −30 dB to −15 dB. |
| Yellow | −18 dB to −6 dB | Loud. |
| Red | More than −6 dB | Too loud. |

The unlit zones stay dimly visible. Thus, you can always see the scale.

The meter rises fast and falls slowly.

When a sample reaches ±0.98 (clipping), a red outline shows for 750 ms.

The meter is vertical on the right edge on a wide screen. It is horizontal below the video on a phone.

The application disables echo cancellation, noise suppression and automatic gain. Thus, the meter shows the true microphone signal.

## 4. Device checks

The toolbar shows a result for each device.

Camera:

1. Once each second, the application draws the frame on a 32 × 18 canvas.
2. The application calculates the average brightness (0 to 255).
3. If the average is less than 24, the status shows "Camera: too dark". A notice tells you to check the lens cover or the light.

Microphone:

- When the level goes above −45 dB, the status shows "Mic: working".
- If the level stays below −45 dB for 5 seconds, the status shows "Mic: no sound".

## 5. Device selection

- The application fills the device lists after you give permission. Before permission, the browser does not show device names.
- When you select a different device, the application stops the old track first. Many phones cannot open two cameras at the same time.
- The application opens the new device with `deviceId: { exact }`.
- If the new device fails, the application uses the default device.
- The application keeps your selection in `localStorage`.
- The application removes USB IDs such as `(2C0E:82E3)` from device names.

## 6. Device changes

- When you connect or disconnect a device, the `devicechange` event occurs. The application then updates the lists.
- When a track stops (`ended` event), the application changes to the default device.

## 7. Offline operation

The service worker gets each file from the network first. It keeps a copy of each file in a cache.

When the network is not available, the service worker uses the cached copy.
