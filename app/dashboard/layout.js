"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MapPin, 
  FileText, 
  BookOpen, 
  Compass, 
  Map,
  Briefcase, 
  MessageSquare, 
  CalendarCheck, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load from localStorage on mount to prevent layout shifts/reset on refresh
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("sidebar-collapsed", String(nextState));
  };

  const sidebarLinks = [
    { name: "Overview", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Destinations", path: "/dashboard/destinations", icon: <MapPin size={18} /> },
    { name: "Blog Posts", path: "/dashboard/blog", icon: <FileText size={18} /> },
    { name: "Pocket Guides", path: "/dashboard/pocket-guides", icon: <BookOpen size={18} /> },
    { name: "Itinerary Guides", path: "/dashboard/itinerary-guides", icon: <Compass size={18} /> },
    { name: "Tours", path: "/dashboard/tours", icon: <Map size={18} /> },
    { name: "Packages", path: "/dashboard/packages", icon: <Briefcase size={18} /> },
    { name: "Media Library", path: "/dashboard/media-library", icon: <ImageIcon size={18} /> },
    { name: "Inquiries", path: "/dashboard/inquiries", icon: <MessageSquare size={18} /> },
    { name: "Bookings", path: "/dashboard/bookings", icon: <CalendarCheck size={18} /> },
    { name: "Settings", path: "/dashboard/settings", icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-brand-bg overflow-hidden font-sans text-brand-ink">
      {/* Sidebar */}
      <aside 
        className={`bg-brand-sidebar text-white flex flex-col h-full hidden md:flex border-r border-white/5 transition-all duration-300 ease-in-out relative ${
          isCollapsed ? "w-[80px]" : "w-[270px]"
        }`}
      >
        {/* Collapse Icon Button */}
        <button
          onClick={toggleSidebar}
          className="absolute top-8 -right-3.5 bg-brand-sidebar hover:bg-brand-mustard border border-white/10 hover:border-brand-mustard text-white hover:text-black w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 z-50 shadow-md cursor-pointer group"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight size={14} className="group-hover:scale-110 transition-transform" />
          ) : (
            <ChevronLeft size={14} className="group-hover:scale-110 transition-transform" />
          )}
        </button>

        {/* Brand Header */}
        <div className={`text-center border-b border-white/5 relative transition-all duration-300 flex flex-col items-center justify-center ${isCollapsed ? "p-4 py-6" : "p-6"}`}>
          <div className={`text-brand-mustard font-serif text-3xl font-extrabold mb-1 tracking-wider ${isCollapsed ? "" : "hidden"}`}>T</div>
          <div className={`transition-all duration-300 overflow-hidden flex flex-col items-center ${isCollapsed ? "max-h-0 opacity-0 pointer-events-none hidden" : "max-h-24 opacity-100"}`}>
            <Link href="/" className="block hover:opacity-80 transition-opacity">
              <img src="/images/logo.png" alt="The Long Way" className="h-10 w-auto object-contain rounded-md" />
            </Link>
            <span className="block text-[9px] text-brand-muted mt-3 uppercase tracking-[0.3em] font-semibold">CMS Panel</span>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 scrollbar-luxury">
          <nav className={`space-y-1.5 transition-all duration-300 ${isCollapsed ? "px-2" : "px-4"}`}>
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`flex items-center rounded-lg transition-all duration-300 text-sm group relative ${
                    isActive 
                      ? "text-brand-mustard bg-white/10 font-semibold" 
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  } ${isCollapsed ? "justify-center px-2 py-3 gap-0" : "px-4 py-3 gap-3"}`}
                  title={isCollapsed ? link.name : undefined}
                >
                  {/* Left Active indicator pill */}
                  {isActive && (
                    <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-mustard rounded-r-md"></span>
                  )}
                  <span className={`${isActive ? "text-brand-mustard" : "text-white/40 group-hover:text-white"} transition-colors flex-shrink-0`}>
                    {link.icon}
                  </span>
                  <span className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
                    isCollapsed ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100"
                  }`}>
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Footer info / Logout */}
        <div className={`border-t border-white/5 bg-black/10 transition-all duration-300 ${isCollapsed ? "p-2" : "p-6"}`}>
          <button className={`flex items-center w-full text-left text-white/60 hover:text-brand-coral transition-all text-sm rounded-lg hover:bg-white/5 font-medium ${isCollapsed ? "justify-center px-2 py-2.5 gap-0" : "px-4 py-2.5 gap-3"}`} title="Logout">
            <LogOut size={18} className="flex-shrink-0" />
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
              isCollapsed ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100"
            }`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto bg-brand-bg scrollbar-luxury">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

