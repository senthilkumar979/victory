'use client'

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export const useCheckIsAuthenticated = () => {
  const { userId, sessionId, getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      redirect("/sign-in");
    }
  }, [isLoaded, isSignedIn]);

}