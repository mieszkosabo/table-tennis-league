"use client";
import { Button, type ButtonProps } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export type SignOutButtonProps = ButtonProps;

export const SignOutButton = (props: SignOutButtonProps) => {
  return (
    <Button
      variant="ghost"
      onClick={() => {
        void signOut();
      }}
      {...props}
    >
      Sign out
    </Button>
  );
};
