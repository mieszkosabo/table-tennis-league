import { LoginForm } from "@/components/login-form";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
