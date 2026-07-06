const GOOGLE_SCRIPT_ID = "google-identity-services";

export const loadGoogleIdentityScript = () =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existing) {
      existing.addEventListener(
        "load",
        () => resolve(),
        { once: true },
      );
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Identity Services.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services."));
    document.head.appendChild(script);
  });

export const getGoogleIdToken = async (clientId) => {
  if (!clientId) {
    throw new Error("Missing Google client ID. Set VITE_GOOGLE_CLIENT_ID in your environment.");
  }

  await loadGoogleIdentityScript();

  if (!window.google?.accounts?.id) {
    throw new Error("Google Identity Services is unavailable in this browser.");
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (handler, value) => {
      if (settled) return;
      settled = true;
      handler(value);
    };

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (!response?.credential) {
          finish(reject, new Error("Google sign-in did not return an ID token."));
          return;
        }
        finish(resolve, response.credential);
      },
    });

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        finish(reject, new Error("Google sign-in prompt could not be displayed."));
      }
    });

    setTimeout(() => {
      finish(reject, new Error("Google sign-in timed out."));
    }, 60000);
  });
};
