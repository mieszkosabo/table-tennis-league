"use client";
import { signIn } from "next-auth/react";

export const SignInButton = () => {
  return (
    <button
      type="button"
      onClick={() => {
        void signIn();
      }}
    >
      Sign in
    </button>
  );
};
