"use client";

import { SignOutButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isKiosk = pathname === "/kiosk";

  return (
    <header className={isHome ? "bg-[#f7f4ee] text-zinc-950" : "bg-zinc-50 text-zinc-950"}>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-10">
        <Link aria-label="Binate home" className="block" href="/">
          <Image
            alt="Binate"
            className="h-9 w-auto"
            height={170}
            priority
            src="/binate-logo.svg"
            width={640}
          />
        </Link>

        {isHome ? (
          <div className="flex items-center gap-3 sm:gap-8">
            <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-600 sm:flex" aria-label="Main navigation">
              <a className="hover:text-zinc-950" href="#services">Services</a>
              <a className="hover:text-zinc-950" href="#samples">Samples</a>
              <a className="hover:text-zinc-950" href="#contact">Contact</a>
            </nav>
            <Link
              className="inline-flex h-10 items-center justify-center border border-zinc-950 bg-white px-4 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-950 hover:text-white"
              href="/login"
            >
              Login
            </Link>
          </div>
        ) : null}

        {isKiosk ? (
          <SignOutButton redirectUrl="/">
            <button
              type="button"
              className="h-10 border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100"
            >
              Logout
            </button>
          </SignOutButton>
        ) : null}
      </div>
    </header>
  );
}
