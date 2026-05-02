import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kiosk Setup | Kiosk Admin",
  description: "Download the kiosk setup package and follow the setup steps.",
};

const setupSteps = [
  "Factory reset the tablet.",
  "Enable Developer Mode.",
  "Turn on USB Debugging.",
  "Connect the tablet to the PC.",
  "Run setup.exe",
];

export default function SetupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-8 text-zinc-950">
      <section className="w-full max-w-xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-500">Kiosk Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Kiosk Setup</h1>
          <p className="mt-3 text-sm text-zinc-600">
            Download the setup package, then follow the steps below to prepare the tablet.
          </p>
        </div>

        <a
          href="/kiosk-setup-package.txt"
          download
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-md bg-zinc-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
        >
          Download Setup Package
        </a>

        <div className="mt-6 border-t border-zinc-200 pt-5">
          <h2 className="text-sm font-semibold text-zinc-950">Steps</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-zinc-700">
            {setupSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
