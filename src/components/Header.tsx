"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/audit/hallucinations", label: "Hallucinations" },
  { href: "/audit/instruction-following", label: "Instructions" },
  { href: "/audit/edge-cases", label: "Edge Cases" },
  { href: "/audit/unsafe-responses", label: "Unsafe" },
  { href: "/report", label: "Report" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">ChatGPT Audit</span>
            <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-medium">
              QA Tool
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
