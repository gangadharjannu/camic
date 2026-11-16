# Next steps

## 1. Complete

- [x] The application requests permission when the page opens.
- [x] The video fills the page. The level meter shows on the video.
- [x] The application shows a clear message for each error: blocked, not found, in use, not supported.
- [x] You can select from more than one camera and microphone.
- [x] The video shows a mirror image (selfie view).
- [x] The application has no build step and no dependencies.
- [x] The service worker gets files from the network first.

## 2. Future work

1. **Microphone playback test.** Record 3 seconds of sound and play it back. Then the user can hear the microphone.
2. **Speaker test.** Add a button that plays a tone. Add a speaker list (`setSinkId`, if the browser supports it).
3. **Camera data.** Show the resolutions and frame rates that the camera supports (`getCapabilities()`).
4. **Multi-camera view.** Show all cameras at the same time in a grid.
5. **Snapshot.** Save the current frame as a PNG file. Use it to examine the framing and the light.
6. **Maskable icon.** Make a 512 px icon with a safe border. Then Android does not cut the logo.
7. **Search ranking (SEO).** Add a short help section below the video. Add Open Graph tags. Keep the text short.
8. **Netlify configuration.** Add `netlify.toml` with `publish = "public"`. Add cache headers:
   - Long cache for `assets/`.
   - `no-cache` for `index.html` and `service-worker.js`.
9. **Tests.** Add a Playwright smoke test. Use the Chrome fake-device flag (`--use-fake-device-for-media-stream`).
