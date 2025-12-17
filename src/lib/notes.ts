import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export const saveNote = async (
  uid: string,
  lessonId: string,
  text: string
) => {
  await addDoc(collection(db, "notes"), {
    uid,
    lessonId,
    text,
    updatedAt: serverTimestamp(),
  });
};

export const getNotesForLesson = async (
  uid: string,
  lessonId: string
) => {
  const q = query(
    collection(db, "notes"),
    where("uid", "==", uid),
    where("lessonId", "==", lessonId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as { text: string }),
  }));
};
