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
  if (Object.values(data).length > 0) {
    pushSnacks("User updated!");
  }
};
export const getUser = async () => {
  return (await getDoc(user(), auth.currentUser.uid)).data();
};

export const getShots = async () => {
  try {
    const shots = await getDocs(query(collection(db, "shots")));
    const res = shots.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
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
    return res.map((r) => ({
      ...r,
      date: console.log(r) || r.date?.toDate(),
      authorId: r.author,
      author: usersMap[r.author]?.nickname || r.author,
    }));
  } catch (err) {
    pushSnacks(err.message);
  }
};

export const addShot = async (date, ingredients = []) => {
  validateFields({ date }, "date");
  return addDoc(collection(db, "shots"), {
    date: new Date(date),
    ingredients,
    author: auth.currentUser.uid,
    editDate: new Date(),
  });
};

export const updateShot = async (shot) => {
  validateFields(shot, "author", "ingredients", "date");
  await setDoc(doc(db, "shots", shot.id), {
    author: shot.authorId,
    ingredients: shot.ingredients,
    date: new Date(shot.date),
    editDate: new Date(),
  });
};

const validateFields = (values, ...fields) => {
  const missingFields = fields.filter((f) => !values[f] && values[f] !== 0);
  if (missingFields.length) {
    throw Error(`${missingFields.join(", ")} must be defined`);
  }
};
