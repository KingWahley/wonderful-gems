import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-mustard-500 py-8 md:py-12 border-t border-charcoal-900">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <img
                src="/images/logo.png"
                alt="The Long Way"
                className="h-10 w-auto mix-blend-multiply rounded"
              />
            </div>
            <p className="font-bold text-[15px] text-charcoal-900 mt-1">
              notes from the road, written slowly ✨
            </p>
          </div>

          <div className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-charcoal-900/90 mt-4 md:mt-0">
            © 2026
          </div>
        </div>
      </div>
    </footer>
  );
}
