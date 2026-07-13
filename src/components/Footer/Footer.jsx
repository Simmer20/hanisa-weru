import {
  //Linkedin,
  Mail,
  Globe,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-slate-300">
      <div className="max-w-7xl mx-auto px-8 py-20">

        <div className="grid md:grid-cols-3 gap-16">

          <div>
            <h2 className="text-3xl font-semibold text-white">
              LynchPin Advisory
            </h2>

            <p className="mt-6 leading-8">
              Strategy.
              <br />
              Growth.
              <br />
              Leadership.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">
              Explore
            </h3>

            <ul className="space-y-4">
              <li><a href="#about">About</a></li>
              <li><a href="#impact">Impact</a></li>
              <li><a href="#cases">Case Studies</a></li>
              <li><a href="#investment">Investment</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">
              Connect
            </h3>

            <div className="space-y-5">
{/* 
              <div className="flex items-center gap-3">
                <Linkedin size={18} />
                LinkedIn
              </div> */}

              <div className="flex items-center gap-3">
                <Mail size={18} />
                hanisaw.weru@gmail.com
              </div>

              <div className="flex items-center gap-3">
                <Globe size={18} />
                thelynchpinadvisory.com
              </div>

            </div>
          </div>

        </div>

        <div className="border-t border-slate-700 mt-20 pt-8 flex justify-between text-sm">
          <p>© 2026 LynchPin Advisory. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}