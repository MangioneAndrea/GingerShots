import {
  setDoc,
  doc,
  getDocs,
  query,
  collection,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { auth } from "../services/firebase-auth";
import { db, validateFields } from "../services/firebase-firestore";

export const getShots = async () => {
  let [shots, users] = await Promise.all([
    getDocs(query(collection(db, "shots"))),
    getDocs(query(collection(db, "users"))),
  ]);
  const res = shots.docs.map((d) => ({ ...d.data(), id: d.id }));
  if (res.length === 0) {
    return [];
  }

  const usersMap = users.docs.reduce(
    (acc, el) => ({ ...acc, [el.id]: el.data() }),
    {}
  );
  return res.map((s) => ({
    ...s,
    date: s.date?.toDate(),
    authorId: s.author,
    author: usersMap[s.author]?.nickname || s.author,
    reviews:
      s.reviews &&
      Object.entries(s.reviews).map(([usr, rev]) => ({
        ...rev,
        author: usersMap[usr]?.nickname || usr,
        authorId: usr,
        date: rev.date?.toDate(),
      })),
  }));
};

export const addShot = async (date, ingredients = []) => {
  validateFields({ date }, "date");
  return addDoc(collection(db, "shots"), {
    date: new Date(date),
    ingredients,
    author: auth.currentUser.uid,
    editDate: new Date(),
    reviews: {},
  });
};

export const updateShot = async (shot) => {
  validateFields(shot, "author", "ingredients", "date");
  return setDoc(
    doc(db, "shots", shot.id),
    {
      author: shot.authorId,
      ingredients: shot.ingredients,
      date: new Date(shot.date),
      editDate: new Date(),
    },
    { merge: true }
  );
};

export const deleteShot = async (shot) => {
  const id = typeof shot === "string" ? shot : shot.id;
  return deleteDoc(doc(db, "shots", id));
};
