import { motion } from "framer-motion";
import {
  Briefcase,
  Handshake,
  Users,
  TrendingUp,
} from "lucide-react";
export default function About() {
  return (
    <section
      id="about"
      className="py-32 bg-white"
    >
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          {/* LEFT */}
          <motion.div
            initial={{ opacity:0, x:-40 }}
            whileInView={{ opacity:1, x:0 }}
            viewport={{ once:true }}
            transition={{ duration:.8 }}
          >
            <img
              src="/images/hanisa-profile.jpg"
              alt="Hanisa Weru"
              className="rounded-[36px] shadow-xl"
            />
          </motion.div>
          {/* RIGHT */}
          <motion.div
            initial={{ opacity:0, x:40 }}
            whileInView={{ opacity:1, x:0 }}
            viewport={{ once:true }}
            transition={{ duration:.8 }}
          >
            <p className="uppercase tracking-[0.3em] text-sm text-slate-500 mb-5">
              Meet Hanisa
            </p>
            <h2 className="text-5xl font-bold leading-tight">
              A Trusted Advisor to
              Organizations
              Navigating Growth.
            </h2>
            <p className="mt-8 text-xl leading-9 text-slate-600">
              Hanisa Weru is the Founder of LynchPin Advisory,
              where she works alongside founders, CEOs,
              executive teams, and mission-driven organizations
              to unlock sustainable growth through strategy,
              commercial excellence, and transformational
              partnerships.
            </p>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Her work sits at the intersection of business
              strategy, leadership development, sales
              enablement, and ecosystem building—helping
              organizations move from ambitious ideas to
              measurable outcomes.
            </p>
          </motion.div>
        </div>
        <div className="grid grid-cols-2 gap-5 mt-14">
        <div className="bg-slate-50 rounded-2xl p-6">
            <Briefcase size={28} />
            <h3 className="mt-4 font-semibold">
            Strategic Advisory
            </h3>
        </div>
        <div className="bg-slate-50 rounded-2xl p-6">
            <TrendingUp size={28} />
            <h3 className="mt-4 font-semibold">
            Commercial Growth
            </h3>
        </div>
        <div className="bg-slate-50 rounded-2xl p-6">
            <Users size={28} />
            <h3 className="mt-4 font-semibold">
            Leadership Development
            </h3>
        </div>
        <div className="bg-slate-50 rounded-2xl p-6">
            <Handshake size={28} />
            <h3 className="mt-4 font-semibold">
            Strategic Partnerships
            </h3>
        </div>
        </div>
        <div className="mt-16 border-l-4 border-slate-900 pl-8">
            <p className="text-2xl italic leading-10 text-slate-700">

                "Great organizations don't grow by chance.
                They grow through intentional strategy,
                courageous leadership, and meaningful
                partnerships."

            </p>
        </div>
      </div>
    </section>
  );
}