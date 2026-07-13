import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function IndustryCard({
  icon: Icon,
  title,
  description,
}) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-xl transition-all"
    >
      <div className="flex justify-between items-start">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
          <Icon size={28} />
        </div>
        <ArrowUpRight
          size={20}
          className="text-slate-400 group-hover:text-slate-900 transition"
        />
      </div>
      <h3 className="mt-8 text-2xl font-semibold">
        {title}
      </h3>
      <p className="mt-4 leading-8 text-slate-600">
        {description}
      </p>
    </motion.div>
  );
}