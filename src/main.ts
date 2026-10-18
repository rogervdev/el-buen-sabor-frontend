import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// 1. Silenciar mensajes de licencia de PrimeUI en la consola
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('[PrimeUI]')) return;
  originalWarn(...args);
};

const originalError = console.error;
console.error = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('[PrimeUI]')) return;
  originalError(...args);
};

// 2. Eliminar inmediatamente el nodo #p-license-host del DOM
const licenseObserver = new MutationObserver(() => {
  const licenseHost = document.getElementById('p-license-host');
  if (licenseHost) {
    licenseHost.remove();
  }
});

licenseObserver.observe(document.documentElement, {
  childList: true,
  subtree: true
});

// 3. Inicializar la aplicación
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));