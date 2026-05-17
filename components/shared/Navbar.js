"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, Search } from "lucide-react";
import SearchModal from "./SearchModal";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Global ⌘K / Ctrl+K keyboard listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { name: "HOME", path: "/" },
    { name: "DESTINATIONS", path: "/destinations" },
    { name: "BLOG", path: "/blog" },
    { name: "MINI-GUIDES", path: "/mini-guides" },
    { name: "TOURS", path: "/tours" },
    { name: "ABOUT", path: "/about" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out border-t-[8px] border-b-[16px] border-mustard-500 ${
          isScrolled ? "bg-cream-100/95 backdrop-blur-md shadow-sm py-4" : "bg-cream-100 py-4 lg:py-5"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-3xl lg:text-[34px] font-bold tracking-tight text-[#1a2332] flex items-center" style={{ fontFamily: 'Comic Sans MS, cursive, sans-serif' }}>
            The Long Way
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-7">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`text-[11px] font-bold tracking-[0.15em] uppercase transition-colors relative group ${
                  isActive(link.path)
                    ? "text-mustard-500"
                    : "text-[#2b3a4a] hover:text-mustard-500"
                }`}
              >
                {link.name.replace("-", " ")}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center space-x-5">
            <div 
              className="relative cursor-pointer group"
              onClick={() => setIsSearchOpen(true)}
            >
              <input 
                type="text" 
                readOnly
                placeholder="Search..." 
                className="bg-white border border-[#2b3a4a] rounded-full py-2 pl-9 pr-14 text-xs text-charcoal-900 focus:outline-none w-48 focus:w-56 cursor-pointer transition-all duration-300 placeholder:text-gray-500"
              />
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-cream-200 border border-gray-200 text-gray-500 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center">
                ⌘K
              </div>
            </div>
            
            <Link href="/plan-with-me" className="bg-mustard-500 hover:bg-mustard-600 text-white rounded-full px-6 py-2.5 text-[11px] font-bold tracking-[0.1em] uppercase transition-colors shadow-sm">
              PLAN WITH ME
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-[#1a2332]"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Menu"
          >
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-[60] bg-charcoal-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={`absolute top-0 right-0 w-[80%] max-w-sm h-full bg-cream-100 shadow-2xl transition-transform duration-500 ease-in-out flex flex-col ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end p-6">
            <button onClick={() => setMobileMenuOpen(false)} className="text-charcoal-800 hover:text-mustard-600 transition-colors">
              <X size={28} />
            </button>
          </div>
          <div className="flex flex-col space-y-6 px-10 pt-4">
            {/* Mobile Search Bar */}
            <div 
              className="relative cursor-pointer mb-2"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
            >
              <input 
                type="text" 
                readOnly
                placeholder="Search..." 
                className="bg-white border border-[#2b3a4a] rounded-full py-3 pl-11 pr-4 text-sm text-charcoal-900 focus:outline-none w-full cursor-pointer placeholder:text-gray-500"
              />
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-xl font-serif transition-colors ${
                  isActive(link.path)
                    ? "text-mustard-500 font-bold"
                    : "text-charcoal-800 hover:text-mustard-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link 
              href="/plan-with-me" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-xl font-serif text-charcoal-800 hover:text-mustard-600 transition-colors flex items-center"
            >
              PLAN WITH ME <span className="ml-2">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Global Interactive Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
