# Setting up Google sign-in (one time, about 15 minutes)

Keys to the Universe signs in with Google and saves progress to the player's own Google Drive. There's no server, but Google needs to know which website is allowed to ask. You create a free "OAuth client ID" for that and paste it into `js/config.js`. Until you do, accounts stay switched off and everyone plays as a guest.

## 1. Create a Google Cloud project
1. Go to https://console.cloud.google.com/ and sign in with the Google account that should own the app.
2. Top bar › project picker › **New project**. Name it "Keys to the Universe" and create it.

## 2. Turn on the Google Drive API
1. **APIs & Services › Library**, search **Google Drive API**, then **Enable**.
2. Optional (for the "choose your save file" picker): also enable **Google Picker API**.

## 3. Set up the consent screen (what players see when signing in)
1. **APIs & Services › OAuth consent screen** (or **Google Auth Platform › Branding**).
2. User type: **External**.
3. App name: **Keys to the Universe**. User support email: your email. App logo: optional.
4. App domain:
   - Home page: `https://tommedenney.github.io/keys-to-the-universe/`
   - Privacy policy: `https://tommedenney.github.io/keys-to-the-universe/#/about`
5. Developer contact: your email.
6. **Scopes / Data access:** add `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile` and `.../auth/drive.file`. All four are non-sensitive, so no security review is needed.
7. **Audience:** while it says *Testing*, only the test users you add can sign in (up to 100). Add yourself and anyone testing. When you're ready for everyone, click **Publish app**.

## 4. Create the client ID
1. **APIs & Services › Credentials › Create credentials › OAuth client ID**.
2. Application type: **Web application**. Name: "Keys to the Universe web".
3. **Authorized JavaScript origins:**
   - `https://tommedenney.github.io`
   - `http://localhost:8765` (for testing on your Mac)
4. **Authorized redirect URIs**, exactly:
   - `https://tommedenney.github.io/keys-to-the-universe/`
   - `http://localhost:8765/`
5. Create, then copy the **Client ID** (it ends in `.apps.googleusercontent.com`).

## 5. Optional: Picker API key
**Credentials › Create credentials › API key**, then restrict it:
- Application restriction: **Websites**, `https://tommedenney.github.io/*`.
- API restriction: **Google Picker API**.

Copy the key. Your **project number** is on the project's Dashboard / Settings page.

## 6. Paste them into `js/config.js`
```js
export const CONFIG = {
  googleClientId: 'YOUR-CLIENT-ID.apps.googleusercontent.com',
  googleApiKey: 'YOUR-PICKER-API-KEY', // optional
  googleAppId: 'YOUR-PROJECT-NUMBER',   // optional
};
```
These values are public by design: they identify the app to Google and aren't secrets. Commit and push to deploy.

## If you buy a domain later
Add the new address to **Authorized JavaScript origins** and **Authorized redirect URIs** (with the trailing `/`), and update the Home page and Privacy policy links on the consent screen.
