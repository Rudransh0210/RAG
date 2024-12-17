import { auth, db } from './firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export interface UserSettings {
  name: string;
  email: string;
  darkMode: boolean;
}

export async function updateUserSettings(userId: string, settings: UserSettings) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, settings);
  } catch (error: any) {
    throw new Error(`Failed to update settings: ${error.message}`);
  }
}

export async function getUserSettings(userId: string): Promise<UserSettings> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    return userDoc.data() as UserSettings;
  } catch (error: any) {
    throw new Error(`Failed to fetch settings: ${error.message}`);
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No authenticated user found');
    }

    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Change password
    await updatePassword(user, newPassword);
  } catch (error: any) {
    throw new Error(`Failed to change password: ${error.message}`);
  }
}