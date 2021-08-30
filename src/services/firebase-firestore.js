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
const user = () => doc(db, "users", auth.currentUser.uid);
export const updateUser = async (data = {}) => {
  await setDoc(user(), data, { merge: true });
  pushSnacks("User updated!");
};
export const getUser = async () => {
  return (await getDoc(user(), auth.currentUser.uid)).data();
};

export const getShots = async () => {
  const shots = await getDocs(query(collection(db, "shots")));
  const res = shots.docs.map((doc) => doc.data());
  if (res.length === 0) {
    return [];
  }
  const users = await getDocs(
    query(
      collection(db, "users"),
      where(documentId(), "in", res.map((r) => r.author).unique())
    )
  );
  const usersMap = users.docs.reduce(
    (acc, el) => ({ ...acc, [el.id]: el.data() }),
    {}
  );
  window.users = usersMap;
  window.shots = res;
  return res.map((r) => ({
    ...r,
    author: usersMap[r.author].nickname,
  }));
};

export const addShot = async (date, ingredients = []) => {
  await addDoc(collection(db, "shots"), {
    date: date.stringFormat(),
    ingredients,
    author: auth.currentUser.uid,
    creationDate: new Date().stringFormat(),
  });
  pushSnacks("New ginger-shot created!");
};
