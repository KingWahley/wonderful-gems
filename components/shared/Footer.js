import Link from "next/link";
import { Mail } from "lucide-react";

const Instagram = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const Twitter = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>;
const Facebook = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;

export default function Footer() {
  return (
    <footer className="bg-charcoal-900 text-cream-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          <div className="space-y-6">
            <h3 className="font-serif text-2xl tracking-widest uppercase">Wanderful</h3>
            <p className="text-cream-200/80 text-sm leading-relaxed">
              Curating luxury travel experiences and discovering the world's most breathtaking destinations for the modern explorer.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-cream-200 hover:text-gold-500 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-cream-200 hover:text-gold-500 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-cream-200 hover:text-gold-500 transition-colors"><Facebook size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-lg tracking-wider mb-6">Explore</h4>
            <ul className="space-y-3 text-sm text-cream-200/80">
              <li><Link href="/destinations" className="hover:text-gold-500 transition-colors">Destinations</Link></li>
              <li><Link href="/tours" className="hover:text-gold-500 transition-colors">Tours & Activities</Link></li>
              <li><Link href="/mini-guides" className="hover:text-gold-500 transition-colors">Mini Guides</Link></li>
              <li><Link href="/blog" className="hover:text-gold-500 transition-colors">Travel Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg tracking-wider mb-6">Company</h4>
            <ul className="space-y-3 text-sm text-cream-200/80">
              <li><Link href="/about" className="hover:text-gold-500 transition-colors">About Us</Link></li>
              <li><Link href="/plan-with-me" className="hover:text-gold-500 transition-colors">Plan With Me</Link></li>
              <li><Link href="#" className="hover:text-gold-500 transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-gold-500 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg tracking-wider mb-6">Newsletter</h4>
            <p className="text-sm text-cream-200/80 mb-4">Subscribe for exclusive luxury travel inspiration.</p>
            <form className="flex flex-col space-y-3">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="bg-charcoal-800 border border-charcoal-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
                required
              />
              <button type="submit" className="bg-gold-600 hover:bg-gold-500 text-white px-4 py-3 text-sm tracking-widest uppercase transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-charcoal-800 flex flex-col md:flex-row justify-between items-center text-xs text-cream-200/60">
          <p>&copy; {new Date().getFullYear()} Wanderful Travel. All rights reserved.</p>
          <p className="mt-4 md:mt-0 italic font-serif">"To travel is to live." - Hans Christian Andersen</p>
        </div>
      </div>
    </footer>
  );
}
