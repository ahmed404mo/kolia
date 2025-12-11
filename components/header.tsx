"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchModal } from "./search-modal";
import { SettingsModal } from "./settings-modal";
import { usePathname } from "next/navigation";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pathName = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 bg-background border-b border-border shadow-sm">
        {menuOpen && (
  <div className="fixed inset-0 bg-black/40 z-50 lg:hidden" onClick={() => setMenuOpen(false)}>
    <div 
      className="absolute right-0 top-0 w-64 h-full bg-white shadow-xl p-6 flex flex-col gap-6"
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        onClick={() => setMenuOpen(false)} 
        className="text-lg font-bold self-end"
      >
        ✕
      </button>

      <Link href="/" onClick={() => setMenuOpen(false)}>الرئيسية</Link>
      <Link href="/News" onClick={() => setMenuOpen(false)}>أخبار</Link>
      <Link href="/Artical" onClick={() => setMenuOpen(false)}>أراء</Link>
      <Link href="/Calcutural" onClick={() => setMenuOpen(false)}>ثقافة</Link>
      <Link href="/Sport" onClick={() => setMenuOpen(false)}>رياضة</Link>
    </div>
  </div>
)}

        {/* Top bar with menu and search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Left: Menu and Logo */}
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">
                  ج
                </span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-primary"> جريدة طفولة</h1>
                <p className="text-xs text-muted-foreground">
                  صوت الطلاب والمعرفة
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Main Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/"
              className={`text-sm font-medium border-2 p-2 rounded-[10px]  text-black    ${
                pathName === "/"
                  ? " transition-colors bg-black hover:bg-gray-800 text-white "
                  : "bg-white"
              }`}
            >
              الرئيسية
            </Link>
            <Link
              href="/News"
              className={`text-sm font-medium border-2 p-2 rounded-[10px]  text-black    ${
                pathName === "/News"
                  ? " transition-colors bg-black hover:bg-gray-800 text-white "
                  : "bg-white"
              }`}
            >
              أخبار
            </Link>
            <Link
              href="/Artical"
              className={`text-sm font-medium border-2 p-2 rounded-[10px]  text-black    ${
                pathName === "/Artical"
                  ? " transition-colors bg-black hover:bg-gray-800 text-white "
                  : "bg-white"
              }`}
            >
              أراء
            </Link>
            <Link
              href="/Calcutural"
              className={`text-sm font-medium border-2 p-2 rounded-[10px]  text-black    ${
                pathName === "/Calcutural"
                  ? " transition-colors bg-black hover:bg-gray-800 text-white "
                  : "bg-white"
              }`}
            >
              ثقافة
            </Link>
            <Link
              href="/Sport"
              className={`text-sm font-medium border-2 p-2 rounded-[10px]  text-black    ${
                pathName === "/Sport"
                  ? " transition-colors bg-black hover:bg-gray-800 text-white "
                  : "bg-white"
              }`}
            >
              رياضة
            </Link>
          </nav>

          {/* Right: Search and Settings */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
