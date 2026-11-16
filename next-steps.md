# Next steps

## 1. Complete

- [x] The application requests permission when the page opens.
- [x] The video fills the page. The level meter shows on the video.
- [x] The application shows a clear message for each error: blocked, not found, in use, not supported.
- [x] You can select from more than one camera and microphone.
- [x] The video shows a mirror image (selfie view).
- [x] The application has no build step and no dependencies.
- [x] The service worker gets files from the network first.
- [x] The toolbar shows a result for each device: "Camera ✓" and "Mic ✓", or a warning.
- [x] The application shows a warning when the camera image is very dark (lens cover or no light).
- [x] The application shows a warning when the microphone hears no sound for 5 seconds.
- [x] The application asks you to allow access while the browser waits for permission.
- [x] Device names do not show USB IDs such as `(2C0E:82E3)`.
- [x] The level meter has a microphone icon.
- [x] The privacy text shows in all states: before permission, during the test and on an error.
- [x] Device lists have a custom arrow with space on the right. Errors and notices use the same dark style.

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
10. **Single device.** When there is only one camera or one microphone, show the name as text. A disabled list looks broken.
11. **Mirror button state.** Make the on and off states clearly different. Use a filled and an outlined style, or an icon.
12. **Toolbar on phones.** On a narrow screen, the toolbar uses 2 or 3 lines and covers the face. Put the device lists behind one button.
13. **Install button position.** Move **Install** to the right end of the toolbar. Then it is separate from the test controls.
14. **Full screen.** Add a button that shows the video in full screen.
15. **Blocked access.** Add a **Reload** button to the error message. Add short steps for each browser to allow access again.
