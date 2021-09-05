import {
  setDoc,
  doc,
  getDocs,
  query,
  collection,
  addDoc,
  where,
  documentId,
  deleteDoc,
} from 'firebase/firestore';
import { db, validateFields } from '../services/firebase-firestore';

export const getShots = async () => {
  const shots = await getDocs(query(collection(db, 'shots')));
  const res = shots.docs.map((d) => ({ ...d.data(), id: d.id }));
  if (res.length === 0) {
    return [];
  }
  const users = await getDocs(
    query(
      collection(db, 'users'),
      where(documentId(), 'in', res.map((r) => r.author).unique())
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
};

export const addShot = async (date, ingredients = []) => {
  validateFields({ date }, 'date');
  return addDoc(collection(db, 'shots'), {
    date: new Date(date),
    ingredients,
    author: auth.currentUser.uid,
    editDate: new Date(),
  });
};

export const updateShot = async (shot) => {
  validateFields(shot, 'author', 'ingredients', 'date');
  return setDoc(doc(db, 'shots', shot.id), {
    author: shot.authorId,
    ingredients: shot.ingredients,
    date: new Date(shot.date),
    editDate: new Date(),
  });
};

export const deleteShot = async (shot) => {
  const id = typeof shot === 'string' ? shot : shot.id;
  return deleteDoc(doc(db, 'shots', id));
};
