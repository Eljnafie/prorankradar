// Simple utility to load the Google Maps script dynamically
let isScriptLoaded = false;
let isScriptLoading = false;

const CALLBACK_NAME = 'initGoogleMaps';

export const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isScriptLoaded) {
      resolve();
      return;
    }

    if (isScriptLoading) {
      // If already loading, wait for the existing callback
      const checkInterval = setInterval(() => {
        if (isScriptLoaded) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      return;
    }

    isScriptLoading = true;

    // Create global callback
    (window as any)[CALLBACK_NAME] = () => {
      isScriptLoaded = true;
      isScriptLoading = false;
      resolve();
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=${CALLBACK_NAME}`;
    script.async = true;
    script.defer = true;
    script.onerror = (err) => {
      isScriptLoading = false;
      reject(err);
    };
    
    document.head.appendChild(script);
  });
};
