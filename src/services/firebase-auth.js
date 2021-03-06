import app from "./firebase";
import {
  getAuth,
  connectAuthEmulator,
  isSignInWithEmailLink,
  browserLocalPersistence,
  sendSignInLinkToEmail,
  signInWithEmailLink,
} from "firebase/auth";
import { readable } from "svelte/store";
import { pushSnacks } from "./snackbar";
import { updateUser } from "./firebase-firestore";

export const auth = getAuth(app);
if (location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://localhost:9099");
}
var actionCodeSettings = {
  url: window.location.href,
  handleCodeInApp: true,
};
// Confirm the link is a sign-in with email link.
if (isSignInWithEmailLink(auth, window.location.href)) {
  var email = window.localStorage.getItem("emailForSignIn");
  if (!email) {
    pushSnacks("You have to use the same browser as you used for the request");
  } else {
    console.log("not calling this");
    // The client SDK will parse the code from the link for you.
    signInWithEmailLink(auth, email, window.location.href)
      .then(() => {
        window.localStorage.removeItem("emailForSignIn");
        auth.setPersistence(browserLocalPersistence);
        window.history.pushState("", "", "/");
        updateUser();
        pushSnacks("Successfully logged in!");
      })
      .catch((error) => {
        pushSnacks(error.message);
      });
  }
}

export async function magicLogin(email) {
  window.localStorage.setItem("emailForSignIn", email);
  await auth.setPersistence(browserLocalPersistence);
  return sendSignInLinkToEmail(auth, email, actionCodeSettings);
}
export async function logout() {
  return auth.signOut();
}

export const user = readable(auth.currentUser, (set) => {
  auth.onAuthStateChanged(set);
});
