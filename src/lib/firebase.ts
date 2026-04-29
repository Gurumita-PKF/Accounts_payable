import { initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined) || "",
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined) || "",
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined) || "",
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string | undefined) || "",
};

const requiredKeys: Array<keyof typeof firebaseConfig> = ["apiKey", "authDomain", "projectId", "appId"];
const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);

export const firebaseConfigError =
  missingKeys.length > 0
    ? `Missing Firebase env vars: ${missingKeys
        .map((key) => `VITE_FIREBASE_${key.replace(/[A-Z]/g, (m) => `_${m}`).toUpperCase()}`)
        .join(", ")}`
    : null;

let authInstance: Auth | null = null;
if (!firebaseConfigError) {
  const app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
}

export const auth = authInstance;
