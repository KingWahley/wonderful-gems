import { MapPin, FileText, MessageSquare, CalendarCheck, TrendingUp, Compass, BookOpen } from "lucide-react";

export default function DashboardOverview() {
  const stats = [
    { title: "Total Destinations", value: "14", icon: <MapPin size={24} className="text-gold-600" /> },
    { title: "Published Blogs", value: "32", icon: <FileText size={24} className="text-gold-600" /> },
    { title: "Active Tours", value: "8", icon: <MapPin size={24} className="text-gold-600" /> },
    { title: "New Inquiries", value: "12", icon: <MessageSquare size={24} className="text-gold-600" /> },
    { title: "Pending Bookings", value: "5", icon: <CalendarCheck size={24} className="text-gold-600" /> },
  ];

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif text-charcoal-900 mb-2">Dashboard Overview</h1>
          <p className="text-charcoal-800/70 text-sm">Welcome back, Elena. Here's what's happening today.</p>
        </div>
        <button className="bg-charcoal-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gold-600 transition-colors">
          View Live Site
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-cream-200">
            <div className="flex justify-between items-start mb-4">
              {stat.icon}
              <span className="flex items-center text-xs text-green-600 font-medium">
                <TrendingUp size={14} className="mr-1" /> +2%
              </span>
            </div>
            <div className="text-3xl font-serif text-charcoal-900 mb-1">{stat.value}</div>
            <div className="text-xs text-charcoal-800/60 uppercase tracking-wider">{stat.title}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Inquiries */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 overflow-hidden">
          <div className="p-6 border-b border-cream-200 flex justify-between items-center">
            <h2 className="font-serif text-xl text-charcoal-900">Recent Inquiries</h2>
            <button className="text-gold-600 text-sm hover:underline">View All</button>
          </div>
          <div className="divide-y divide-cream-200">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-6 flex items-start gap-4 hover:bg-cream-100/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-charcoal-900 text-gold-500 flex items-center justify-center font-serif text-lg">
                  M
                </div>
                <div>
                  <h3 className="text-charcoal-900 font-medium">Michael & Sarah</h3>
                  <p className="text-sm text-charcoal-800/70 mb-2">Interested in: Amalfi Coast Itinerary</p>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">New</span>
                </div>
                <div className="ml-auto text-xs text-charcoal-800/50">2 hours ago</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 overflow-hidden">
          <div className="p-6 border-b border-cream-200">
            <h2 className="font-serif text-xl text-charcoal-900">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <button className="p-4 border border-cream-200 rounded-lg text-left hover:border-gold-500 hover:bg-cream-100 transition-all group">
              <FileText className="text-charcoal-400 group-hover:text-gold-500 mb-3" size={24} />
              <div className="text-charcoal-900 font-medium mb-1">Write Blog Post</div>
              <div className="text-xs text-charcoal-800/60">Draft a new story</div>
            </button>
            <button className="p-4 border border-cream-200 rounded-lg text-left hover:border-gold-500 hover:bg-cream-100 transition-all group">
              <MapPin className="text-charcoal-400 group-hover:text-gold-500 mb-3" size={24} />
              <div className="text-charcoal-900 font-medium mb-1">Add Destination</div>
              <div className="text-xs text-charcoal-800/60">Create a new location</div>
            </button>
            <button className="p-4 border border-cream-200 rounded-lg text-left hover:border-gold-500 hover:bg-cream-100 transition-all group">
              <Compass className="text-charcoal-400 group-hover:text-gold-500 mb-3" size={24} />
              <div className="text-charcoal-900 font-medium mb-1">Create Tour</div>
              <div className="text-xs text-charcoal-800/60">Publish a new experience</div>
            </button>
            <button className="p-4 border border-cream-200 rounded-lg text-left hover:border-gold-500 hover:bg-cream-100 transition-all group">
              <BookOpen className="text-charcoal-400 group-hover:text-gold-500 mb-3" size={24} />
              <div className="text-charcoal-900 font-medium mb-1">New Guide</div>
              <div className="text-xs text-charcoal-800/60">Create a pocket guide</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
