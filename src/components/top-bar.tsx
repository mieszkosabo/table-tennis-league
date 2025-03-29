import { SignOutButton } from "@/components/sign-out-button";

export const TopBar = () => {
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center space-x-4">
        <div className="text-2xl font-semibold">🏓 Table Tennis League</div>
      </div>
      <div className="flex items-center space-x-4">
        <SignOutButton />
      </div>
    </div>
  );
};
