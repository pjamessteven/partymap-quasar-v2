const API_KEY = process.env.GMAPS_API_KEY;
const CALLBACK_NAME = 'gmapsCallback';

let initialized = false;
let resolveInitPromise;
let rejectInitPromise;

// This promise handles the initialization status of the Google Maps script.
const initPromise = new Promise((resolve, reject) => {
  resolveInitPromise = resolve;
  rejectInitPromise = reject;
});

export default function init() {
  console.log('GMAPS INIT');

  // Check if we're on the client side
  if (!process.env.CLIENT) {
    // On the server, do nothing, return the promise immediately.
    return initPromise;
  }

  // If Google Maps is already initialized, resolve the promise immediately
  if (initialized) {
    return initPromise;
  }

  // Set the flag to true to indicate that initialization is in progress
  initialized = true;

  // The callback function will be called when the Google Maps script loads successfully
  window[CALLBACK_NAME] = () => {
    resolveInitPromise(window.google);
  };

  // Inject the Google Maps script into the <head> of the document
  const script = document.createElement('script');
  script.async = true;
  script.defer = true;
  script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=${CALLBACK_NAME}&libraries=places`;
  script.onerror = () => {
    rejectInitPromise(new Error('Failed to load Google Maps script'));
  };
  document.querySelector('head').appendChild(script);

  // Return the initialization promise that will be resolved when the script loads
  return initPromise;
}
