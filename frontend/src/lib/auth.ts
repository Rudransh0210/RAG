import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserData {
  id: string;
  email: string | null;
  username: string;
  settings: {
    name: string;
  };
}

export async function signUp(email: string, password: string, username: string): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;

    // Initialize user data
    await setDoc(doc(db, 'users', userId), {
      username,
      email,
      settings: {
        name: username
      }
    });

    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function signIn(email: string, password: string) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getUserData(userId: string): Promise<UserData> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    return { id: userId, ...userDoc.data() } as UserData;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateUserSettings(userId: string, settings: Partial<UserData['settings']>) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const currentData = userDoc.data();
    await setDoc(userRef, {
      ...currentData,
      settings: { ...currentData.settings, ...settings }
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}