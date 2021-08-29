import app from "./firebase";
import {
  getFirestore,
  connectFirestoreEmulator,
  setDoc,
  doc,
  getDoc,
  getDocs,
  query,
  collection,
  addDoc,
  where,
  documentId,
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
export const getUser = async () => {
  return (await getDoc(user(), auth.currentUser.email)).data();
};

export const getShots = async () => {
  const shots = await getDocs(query(collection(db, "shots")));
  const res = shots.docs.map((doc) => doc.data());
  const users = await getDocs(
    query(
      collection(db, "users"),
      where(documentId(), "in", res.map((r) => r.author).unique())
    )
  );
  const usersMap = users.docs.reduce(
    (acc, el) => ({ ...acc, [el.id]: el.data().nickname }),
    {}
  );
  return res.map((r) => ({
    ...r,
    author: usersMap[r.author],
  }));
};

export const addShot = async (date, ingredients = []) => {
  return addDoc(collection(db, "shots"), {
    date: date.stringFormat(),
    ingredients,
    author: auth.currentUser.email,
    creationDate: new Date().stringFormat(),
  });
};