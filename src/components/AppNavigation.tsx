"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const AppNavigation = () => {
  const pathname = usePathname();

  const getTileClassName = (href: string) => {
    const isActive = pathname === href;

    return `rounded-xl border px-6 py-3 text-sm font-semibold transition ${
      isActive
        ? "border-sky-300 bg-slate-50 text-sky-800"
        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
    }`;
  };

  return (
    <nav aria-label="Primary" className="mt-5 flex justify-center gap-4">
      <Link href="/" className={getTileClassName("/")}>
        Dashboard
      </Link>
      <Link href="/budget" className={getTileClassName("/budget")}>
        Budget
      </Link>
    </nav>
  );
};

export default AppNavigation;
