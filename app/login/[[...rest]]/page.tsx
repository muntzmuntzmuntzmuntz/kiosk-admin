import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-950 sm:px-6 lg:px-8">
      <SignIn
        fallbackRedirectUrl="/kiosk"
        path="/login"
        routing="path"
        signUpUrl="/login"
      />
    </main>
  );
}
