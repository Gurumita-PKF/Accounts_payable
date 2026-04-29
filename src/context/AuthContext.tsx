import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import {
  OAuthProvider,
  browserSessionPersistence,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInWithRedirect,
  signInWithPopup,
  signOut,
  type UserCredential,
} from "firebase/auth";
import { auth, firebaseConfigError } from "@/lib/firebase";

interface AuthContextValue {
  currentUser: User | null;
  loading: boolean;
  loginWithMicrosoft: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const ALLOWED_EMAIL_DOMAINS = new Set(["pkf.co.in", "pkfindia.in"]);

const getEmailDomain = (email?: string | null): string => {
  if (!email) return "";
  const [, domain = ""] = email.split("@");
  return domain.toLowerCase();
};

const isAllowedUser = (email?: string | null): boolean => {
  const domain = getEmailDomain(email);
  return domain ? ALLOWED_EMAIL_DOMAINS.has(domain) : false;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    const hydrateSession = async () => {
      try {
        await getRedirectResult(auth);
      } catch {
        // Redirect fallback can fail if no redirect flow was used.
      }
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user && !isAllowedUser(user.email)) {
          await signOut(auth);
          setCurrentUser(null);
          setLoading(false);
          return;
        }
        setCurrentUser(user);
        setLoading(false);
      });
      return unsubscribe;
    };

    let unsubscribe: (() => void) | undefined;
    hydrateSession().then((u) => {
      unsubscribe = u;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const mapAuthError = (code?: string): string => {
    switch (code) {
      case "auth/cancelled-popup-request":
        return "Another sign-in popup is already open. Complete or close it, then retry.";
      case "auth/popup-blocked":
        return "Popup was blocked. Allow popups for this site and try again.";
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed before completing authentication.";
      case "auth/network-request-failed":
        return "Network error during sign-in. Check your connection and retry.";
      case "auth/unauthorized-domain":
        return "This domain is not authorized in Firebase Authentication settings.";
      case "auth/invalid-tenant-id":
      case "auth/invalid-oauth-client-id":
        return "Invalid Azure tenant configuration. Verify VITE_AZURE_TENANT_ID and app setup.";
      case "auth/insufficient-permission":
        return "Your email domain is not allowed for this application.";
      default:
        return "Microsoft sign-in failed. Please try again.";
    }
  };

  const popupWithTimeout = async (provider: OAuthProvider) => {
    const POPUP_TIMEOUT_MS = 30000;
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("auth/popup-timeout")), POPUP_TIMEOUT_MS);
    });
    return (await Promise.race([signInWithPopup(auth!, provider), timeout])) as UserCredential;
  };

  const enforceAllowedDomain = async (credential: UserCredential) => {
    if (isAllowedUser(credential.user.email)) return;
    await signOut(auth!);
    throw new Error("Your email domain is not allowed. Use a pkf.co.in or pkfindia.in account.");
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      loading,
      loginWithMicrosoft: async () => {
        if (!auth) {
          throw new Error(firebaseConfigError || "Firebase is not configured.");
        }

        const provider = new OAuthProvider("microsoft.com");
        provider.addScope("email");
        provider.addScope("profile");
        provider.addScope("openid");
        provider.setCustomParameters({
          prompt: "select_account",
          domain_hint: "organizations",
        });

        try {
          await setPersistence(auth, browserSessionPersistence);
          const credential = await popupWithTimeout(provider);
          await enforceAllowedDomain(credential);
        } catch (error) {
          const code =
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            typeof (error as { code?: unknown }).code === "string"
              ? ((error as { code: string }).code as string)
              : undefined;
          const message = error instanceof Error ? error.message : "";

          if (
            code === "auth/popup-blocked" ||
            code === "auth/cancelled-popup-request" ||
            message === "auth/popup-timeout"
          ) {
            await signInWithRedirect(auth, provider);
            return;
          }

          throw new Error(mapAuthError(code));
        }
      },
      logout: async () => {
        if (!auth) {
          setCurrentUser(null);
          return;
        }
        await signOut(auth);
        setCurrentUser(null);
      },
    }),
    [currentUser, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
