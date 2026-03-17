"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { ApiError } from "@/services/api";
import { loginUser } from "@/services/clinic-service";
import { SESSION_STORAGE_KEY } from "@/utils/constants";
import { asRole } from "@/utils/format";
import type { AuthSession } from "@/utils/types";

interface AuthContextValue {
  hydrated:boolean;
  loginLoading: boolean;
  session: AuthSession | null;
  login: (email: string, password: string) => Promise<AuthSession>;
  logout:() => void;
}

const AuthContext =createContext<AuthContextValue | null>(null);

function normalizeStoredSession(session: AuthSession | null): AuthSession | null {
  if (!session?.token || !session.user) {
   return null;
  }

  const role= asRole(session.user.role);
  if (!role) {
    return null;
  }

  return {
   token:session.token,
    user: {
      ...session.user,
      role,
    },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] =useState(false);
  const [loginLoading, setLoginLoading]= useState(false);
  const [session, setSession] =useState<AuthSession | null>(null);

  useEffect(() => {
    const savedTxt= window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (savedTxt) {
      try {
        const savedObj =JSON.parse(savedTxt) as AuthSession;
       const safeSession= normalizeStoredSession(savedObj);

        if (safeSession) {
          setSession(safeSession);
        } else {
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
     }
    }

    setHydrated(true);
  }, []);

  const persistSession =(nextSession: AuthSession) => {
    setSession(nextSession);
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
  };

  const clearSession= () => {
    setSession(null);
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const login =async (email: string, password: string) => {
    setLoginLoading(true);

    try {
      const response =await loginUser({
        email:email.trim(),
        password,
      });

      const role= asRole(response.user.role);
      if (!role) {
       throw new ApiError(
          `Unsupported role returned by API: ${response.user.role}`,
          500,
        );
      }

      const nextSession: AuthSession= {
        token: response.token,
        user: {
         ...response.user,
          role,
        },
      };

      persistSession(nextSession);
      return nextSession;
    } finally {
      setLoginLoading(false);
   }
  };

  return (
    <AuthContext.Provider
      value={{
        hydrated,
        login,
        loginLoading,
       logout: clearSession,
        session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context =useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider.");
  }

  return context;
}
