import { ArrowRight, Check } from "lucide-react";

export default function EngagementCard({
  title,
  subtitle,
  description,
  outcomes,
  featured = false,
}) {
  return (
    <div
      className={`
        rounded-3xl
        p-10
        transition-all
        duration-500
        hover:-translate-y-2
        ${
          featured
            ? "bg-slate-900 text-white shadow-2xl scale-105"
            : "bg-white border border-slate-200 shadow-sm"
        }
      `}
    >
      {featured && (
        <span className="inline-block rounded-full bg-white/15 px-4 py-2 text-sm mb-8">
          Most Popular
        </span>
      )}
      <h3 className="text-3xl font-semibold">
        {title}
      </h3>
      <p className={`mt-3 ${featured ? "text-slate-300" : "text-slate-500"}`}>
        {subtitle}
      </p>
      <p
        className={`mt-8 leading-8 ${
          featured ? "text-slate-300" : "text-slate-600"
        }`}
      >
        {description}
      </p>
      <div className="mt-10 space-y-5">
        {outcomes.map((item) => (
          <div
            key={item}
            className="flex items-start gap-4"
          >
            <Check size={20} />
            <span>{item}</span>
          </div>
        ))}
      </div>
      <button className="mt-12 flex items-center gap-3 font-medium">
        Learn More
        <ArrowRight size={18} />
      </button>
    </div>
  );
}