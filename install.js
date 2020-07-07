let deferredInstallPrompt = null;
const installButton = document.getElementById('butInstall');

function saveBeforeInstallPromptEvent(evt) {
  deferredInstallPrompt = evt;
  installButton.removeAttribute('hidden');
}

function installPWA(evt) {
  deferredInstallPrompt.prompt();
  evt.srcElement.setAttribute('hidden', true);
  deferredInstallPrompt.userChoice.then(function onInstalledPrompt(choice) {
    if (choice.outcome === 'accepted') {
      // eslint-disable-next-line no-console
      console.log(`User accepted the A2HS prompt ${choice}`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`User dismissed the A2HS prompt ${choice}`);
    }
    deferredInstallPrompt = null;
  });
}

function logAppInstalled(evt) {
  // eslint-disable-next-line no-console
  console.log(`Camic App was installed. ${evt}`);
}

installButton.addEventListener('click', installPWA);
window.addEventListener('beforeinstallprompt', saveBeforeInstallPromptEvent);
window.addEventListener('appinstalled', logAppInstalled);
