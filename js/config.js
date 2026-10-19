// Google sign-in settings (see docs/GOOGLE_SETUP.md). These IDs are public by
// design: they identify the app to Google, they aren't secrets. Leave the client
// ID empty and accounts stay switched off (everyone plays as a guest).

export const CONFIG = {
  googleClientId: '', // e.g. '1234-abc.apps.googleusercontent.com'
  googleApiKey: '', // optional: enables "choose the save file in Drive" (Google Picker)
  googleAppId: '', // optional: your Cloud project number (used by the Picker)
};
