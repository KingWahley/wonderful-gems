import Link from "next/link";
import { LayoutDashboard, MapPin, FileText, BookOpen, Compass, Briefcase, MessageSquare, CalendarCheck, Settings, LogOut } from "lucide-react";

export default function DashboardLayout({ children }) {
  const sidebarLinks = [
    { name: "Overview", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Destinations", path: "/dashboard/destinations", icon: <MapPin size={20} /> },
    { name: "Blog Posts", path: "/dashboard/blog", icon: <FileText size={20} /> },
    { name: "Pocket Guides", path: "/dashboard/pocket-guides", icon: <BookOpen size={20} /> },
    { name: "Itinerary Guides", path: "/dashboard/itinerary-guides", icon: <Compass size={20} /> },
    { name: "Tours", path: "/dashboard/tours", icon: <Compass size={20} /> },
    { name: "Packages", path: "/dashboard/packages", icon: <Briefcase size={20} /> },
    { name: "Inquiries", path: "/dashboard/inquiries", icon: <MessageSquare size={20} /> },
    { name: "Bookings", path: "/dashboard/bookings", icon: <CalendarCheck size={20} /> },
    { name: "Settings", path: "/dashboard/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-cream-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-charcoal-900 text-white flex flex-col h-full hidden md:flex">
        <div className="p-6 border-b border-charcoal-800">
          <Link href="/" className="font-serif text-2xl tracking-wider text-gold-500">
            WANDERFUL
          </Link>
          <span className="block text-xs text-charcoal-400 mt-1 uppercase tracking-widest">Admin Dashboard</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="space-y-1 px-3">
            {sidebarLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-charcoal-300 hover:text-white hover:bg-charcoal-800 transition-colors text-sm"
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-charcoal-800">
          <button className="flex items-center gap-3 px-3 py-2 w-full text-left text-charcoal-400 hover:text-white transition-colors text-sm">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto bg-cream-100/50">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
