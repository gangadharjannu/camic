# Camic - Test your camera and microphone online

Camic = **Ca**mera + **mic**rophone test.

## 1. Description

Camic is a web application. It shows the image from your camera and the sound level from your microphone.

All processing occurs in your browser. Camic does not send data to a server.

## 2. Functions

- You can select a camera and a microphone from a list. Camic keeps your selection for the next visit.
- The video shows a mirror image (selfie view). Push **Mirror** to change this.
- A level meter shows the microphone signal. The meter becomes red when the signal is too loud (clipping).
- You can install Camic as an application (PWA). It operates without a network connection after the first visit.

The application has no framework, no build step and no dependencies. All application files are in `public/`.

## 3. Start the application on your computer

1. Install Node.js.
2. Open a terminal in the project folder.
3. Type `npm start`.
4. Open `http://localhost:8080` in your browser.

NOTE: You do not need HTTPS certificates. The browser accepts `localhost` as a secure origin.

NOTE: The service worker gets files from the network first. A usual page reload shows your changes.

## 4. Deploy the application

### 4.1 Netlify

1. Set the build command to `npm run build`.
2. Set the publish directory to `dist`.

### 4.2 GitHub Pages

1. Type `npm run deploy`.

This command sends the `dist` folder to the `gh-pages` branch.

## 5. Related documents

- [how-this-works.md](how-this-works.md): technical description.
- [next-steps.md](next-steps.md): work that is complete and work for the future.

## 6. Demo

- [Netlify](https://camic.netlify.app)
- [GitHub Pages](https://gangadharjannu.github.io/camic)
