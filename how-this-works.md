# How this works

## 1. Start sequence

1. The application gets the list of devices (`enumerateDevices()`).
2. The application requests the camera and the microphone in one call (`getUserMedia()`). The browser shows one permission request.
3. If one device fails, the application tests the other device. Example: another application uses the camera.

## 2. Video

- The video track goes to the `<video>` element.
- CSS `scaleX(-1)` makes a mirror image.
- The application does not mirror a rear camera (`facingMode: environment`) by default.

## 3. Level meter

1. The audio track goes to an `AudioContext` and then to an `AnalyserNode`.
2. For each animation frame, the application reads the waveform.
3. The application calculates the RMS level in dB. The range is −60 dB to 0 dB.
4. The application changes the height of the meter with `transform: scaleY`.

The meter rises fast and falls slowly.

The meter becomes red for 750 ms when a sample reaches ±0.98.

The application disables echo cancellation, noise suppression and automatic gain. Thus, the meter shows the true microphone signal.

## 4. Device checks

The toolbar shows a result for each device.

Camera:

1. Once each second, the application draws the frame on a 32 × 18 canvas.
2. The application calculates the average brightness (0 to 255).
3. If the average is less than 24, the status shows "Camera: too dark". A notice tells you to check the lens cover or the light.

Microphone:

- When the level goes above −45 dB, the status shows "Mic ✓".
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
