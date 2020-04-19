var deferredInstallPrompt = null;
var installButton = document.getElementById('butInstall');

function saveBeforeInstallPromptEvent(evt) {
  deferredInstallPrompt = evt;
  installButton.removeAttribute('hidden');
}

function installPWA(evt) {
  deferredInstallPrompt.prompt();
  evt.srcElement.setAttribute('hidden', true);
  deferredInstallPrompt.userChoice
    .then(function (choice) {
      if (choice.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt', choice);
      } else {
        console.log('User dismissed the A2HS prompt', choice);
      }
      deferredInstallPrompt = null;
    });
}

function logAppInstalled(evt) {
  console.log('Camic App was installed.', evt);
}

installButton.addEventListener('click', installPWA);
window.addEventListener('beforeinstallprompt', saveBeforeInstallPromptEvent);
window.addEventListener('appinstalled', logAppInstalled);
