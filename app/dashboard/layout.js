"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MapPin, FileText, BookOpen, Compass, Briefcase, MessageSquare, CalendarCheck, Settings, LogOut } from "lucide-react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  const sidebarLinks = [
    { name: "Overview", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Destinations", path: "/dashboard/destinations", icon: <MapPin size={18} /> },
    { name: "Blog Posts", path: "/dashboard/blog", icon: <FileText size={18} /> },
    { name: "Pocket Guides", path: "/dashboard/pocket-guides", icon: <BookOpen size={18} /> },
    { name: "Itinerary Guides", path: "/dashboard/itinerary-guides", icon: <Compass size={18} /> },
    { name: "Tours", path: "/dashboard/tours", icon: <Compass size={18} /> },
    { name: "Packages", path: "/dashboard/packages", icon: <Briefcase size={18} /> },
    { name: "Inquiries", path: "/dashboard/inquiries", icon: <MessageSquare size={18} /> },
    { name: "Bookings", path: "/dashboard/bookings", icon: <CalendarCheck size={18} /> },
    { name: "Settings", path: "/dashboard/settings", icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-brand-bg overflow-hidden font-sans text-brand-ink">
      {/* Sidebar */}
      <aside className="w-[270px] bg-brand-sidebar text-white flex flex-col h-full hidden md:flex border-r border-white/5">
        {/* Brand Header */}
        <div className="p-8 text-center border-b border-white/5">
          <div className="text-brand-mustard font-serif text-3xl font-extrabold mb-1 tracking-wider">T</div>
          <Link href="/" className="font-serif text-lg tracking-[0.2em] font-medium hover:text-brand-mustard transition-colors uppercase block">
            THE LONG WAY
          </Link>
          <span className="block text-[9px] text-brand-muted mt-2 uppercase tracking-[0.3em] font-semibold">CMS Panel</span>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 scrollbar-luxury">
          <nav className="space-y-1.5 px-4">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-sm group relative ${
                    isActive 
                      ? "text-brand-mustard bg-white/10 font-semibold" 
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {/* Left Active indicator pill */}
                  {isActive && (
                    <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-mustard rounded-r-md"></span>
                  )}
                  <span className={`${isActive ? "text-brand-mustard" : "text-white/40 group-hover:text-white"} transition-colors`}>
                    {link.icon}
                  </span>
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Footer info / Logout */}
        <div className="p-6 border-t border-white/5 bg-black/10">
          <button className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-white/60 hover:text-brand-coral transition-all text-sm rounded-lg hover:bg-white/5 font-medium">
            <LogOut size={18} />
            Logout
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
