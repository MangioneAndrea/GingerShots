import firebase from "@firebase/app"
import { readable } from 'svelte/store'
firebase.initializeApp({
    apiKey: "AIzaSyAPmQO1_YRx4wzVR-pqIchp8RvR8kjhMgs",
    authDomain: "ginger-shots.firebaseapp.com",
    databaseURL: "https://ginger-shots-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ginger-shots",
    storageBucket: "ginger-shots.appspot.com",
    messagingSenderId: "20571660088",
    appId: "1:20571660088:web:b58c50e65eca0eb91fabcd",
    measurementId: "G-DD8T83V5KG"
})
if (false) {
    firebase.auth().useEmulator("http://localhost:9099");
}
var actionCodeSettings = {
    url: window.location.href,
    handleCodeInApp: true,
};
// Confirm the link is a sign-in with email link.
if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
    var email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
        console.error("You have to use the same browser as you used for the request")
    } else {
        // The client SDK will parse the code from the link for you.
        firebase.auth().signInWithEmailLink(email, window.location.href)
            .then(({ user }) => {
                window.localStorage.removeItem('emailForSignIn');
                console.log(user)
                firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            })
            .catch((error) => {
                console.error(error)
            });
    }
}

export async function magicLogin(email) {
    window.localStorage.setItem('emailForSignIn', email);
    await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    return firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings);
}
export async function logout() {
    return firebase.auth().signOut();
}

export const user = readable(firebase.auth().currentUser, (set) => {
    firebase.auth().onAuthStateChanged((user) => {
        set(user)
    });
})