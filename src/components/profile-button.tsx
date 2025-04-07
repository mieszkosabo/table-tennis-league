"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { SignOutButton } from "@/components/sign-out-button";

export const ProfileButton = ({
  user,
}: {
  user: { name?: string | null; image?: string | null; email?: string | null };
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="shadow">
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback>{user.name?.at(0) ?? "U"}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        {user.name && (
          <DropdownMenuLabel className="font-medium text-slate-500 py-0">
            {user.name}
          </DropdownMenuLabel>
        )}
        <DropdownMenuLabel className="font-light text-slate-500 pt-0">
          {user.email}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem disabled>Profile (Coming soon)</DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <SignOutButton className="text-red-600" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
