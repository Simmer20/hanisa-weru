import Button from "../ui/Button";
export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl rounded-full px-8 py-4 shadow-sm border border-slate-200">
          {/* Logo */}
          <div>
            <h1 className="font-semibold text-lg tracking-wide">
              LynchPin Advisory
            </h1>
          </div>
          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-10 text-slate-600">
            <a href="#about" className="hover:text-black">
              About
            </a>
            <a href="#impact" className="hover:text-black">
              Impact
            </a>
            <a href="#cases" className="hover:text-black">
              Case Studies
            </a>
            <a href="#investment" className="hover:text-black">
              Investment
            </a>
          </nav>
          <Button>
            Book Conversation
          </Button>
        </div>
      </div>
    </header>
  );
}