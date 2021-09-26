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
export const db = getFirestore(app);

if (location.hostname === "localhost") {
  connectFirestoreEmulator(db, "localhost", 8080);
}
const user = () => doc(db, "users", auth.currentUser.uid);

export let lastKnownUser = {};

export const updateUser = async (data = {}) => {
  return setDoc(user(), data, { merge: true });
};
export const getUser = async () => {
  lastKnownUser = (await getDoc(user(), auth.currentUser.uid)).data();
  return lastKnownUser;
};

export const validateFields = (values, ...fields) => {
  const missingFields = fields.filter((f) => !values[f] && values[f] !== 0);
  if (missingFields.length) {
    throw Error(`${missingFields.join(", ")} must be defined`);
  }
};
