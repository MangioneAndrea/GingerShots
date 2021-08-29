import app from "./firebase";
import {
  getFirestore,
  connectFirestoreEmulator,
  setDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
const auth = getAuth(app);
const db = getFirestore(app);
if (location.hostname === "localhost") {
  connectFirestoreEmulator(db, "localhost", 8080);
}
const user = () => doc(db, "users", auth.currentUser.email);
export const updateUser = async (n = {}) => {
  await setDoc(user(), n, { merge: true });
};
export const currentUser = async () => {
  return (await getDoc(user(), auth.currentUser.email)).data();
};
