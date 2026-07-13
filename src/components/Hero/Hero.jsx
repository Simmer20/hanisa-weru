import { motion } from "framer-motion";
import Button from "../ui/Button";

export default function Hero() {
  return (
    <section className="bg-[#FAFAF8] min-h-screen pt-40">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="uppercase tracking-[0.35em] text-sm text-slate-500 mb-8">
              Founder • LynchPin Advisory
            </p>
            <h1 className="text-6xl lg:text-8xl font-bold leading-[0.92] text-slate-900">
              Helping
              <br />
              Organizations
              <br />
              Turn Strategy
              <br />
              Into Sustainable
              <br />
              Growth.
            </h1>
            <p className="mt-10 text-xl leading-9 text-slate-600 max-w-xl">
              Through strategic advisory, commercial growth,
              leadership development, and transformational
              partnerships, Hanisa helps ambitious organizations
              create measurable impact.
            </p>
            <div className="mt-12 flex gap-5">
              <Button>
                Book a Strategy Conversation
              </Button>
              <Button variant="secondary">
                View Capability Profile
              </Button>
            </div>
          </motion.div>
          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="rounded-[40px] overflow-hidden shadow-2xl">
              <img
                src="/images/hanisa-hero.jpeg"
                alt="Hanisa Weru"
                className="w-full h-187.5 object-cover"
              />
            </div>
          </motion.div>
        </div>
        <div className="mt-32 border-t border-slate-200">
        <div className="max-w-7xl mx-auto py-14">
            <p className="uppercase text-sm tracking-[0.3em] text-slate-500 text-center">
            Trusted by organizations including
            </p>
            <div className="flex flex-wrap justify-center gap-16 mt-10 opacity-70">
                <img src="/logos/airtel.jpg" className="h-10" />
                <img src="/logos/bboxx.png" className="h-10" />
                <img src="/logos/equity.png" className="h-10" />
                <img src="/logos/Inclusivity.jpg" className="h-10" />
                <img src="/logos/GIZ.png" className="h-10" />
                <img src="/logos/ITM.jpg" className="h-10" />
                <img src="/logos/KCB.png" className="h-10" />
                <img src="/logos/MTN.jpg" className="h-10" />
                <img src="/logos/SAWA.jpg" className="h-10" />
                <img src="/logos/Signvrse.png" className="h-10" />
                <img src="/logos/Sunking.jpg" className="h-10" />
                <img src="/logos/Verst.png" className="h-10" />
            </div>
        </div>
        </div>
         <div className="flex justify-center pb-10">
        <div className="animate-bounce text-slate-400">
            ↓
        </div>
        </div>
      </div>
    </section>
  );
}