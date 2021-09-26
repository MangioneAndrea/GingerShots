import { setDoc, doc } from "firebase/firestore";
import { db, validateFields } from "../services/firebase-firestore";
import { auth } from "../services/firebase-auth";

export const updateReview = async (shot, review) => {
  validateFields(review, "rating", "date", "description");

  console.error(shot, {
    reviews: {
      [auth.currentUser.uid]: review,
    },
  });
  return setDoc(
    doc(db, "shots", shot.id),
    {
      reviews: {
        [auth.currentUser.uid]: review,
      },
    },
    { merge: true }
  );
};
