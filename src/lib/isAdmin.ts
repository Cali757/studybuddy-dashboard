import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export async function isAdmin(): Promise<boolean> {
  const user = auth.currentUser;
  
  if (!user) {
    return false;
  }

  // TEMPORARY: Allow all logged-in users to access admin for testing
  return true;

  // try {
  //   const userDoc = await getDoc(doc(db, "users", user.uid));
  //   
  //   if (!userDoc.exists()) {
  //     return false;
  //   }

  //   const userData = userDoc.data();
  //   return userData?.role === "admin";
  // } catch (error) {
  //   console.error("Error checking admin status:", error);
  //   return false;
  // }
}
