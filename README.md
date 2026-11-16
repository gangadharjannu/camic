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

The deployment is automatic. When you merge a change in `public/` to `master`, the `Deploy` workflow starts.

The workflow copies `public/` to the `gh-pages` branch. GitHub Pages and Netlify both use this branch.

To deploy manually:

1. Open the **Actions** tab on GitHub.
2. Select the **Deploy** workflow.
3. Push **Run workflow**.

## 5. Related documents

- [how-this-works.md](how-this-works.md): technical description.
- [next-steps.md](next-steps.md): work that is complete and work for the future.

## 6. Demo

- [Netlify](https://camic.netlify.app)
- [GitHub Pages](https://gangadharjannu.github.io/camic)
