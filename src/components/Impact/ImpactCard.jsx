import { ArrowRight } from "lucide-react";

export default function ImpactCard({
  icon: Icon,
  title,
  description,
  items,
  button,
}) {
  return (
    <div
      className="
      group
      bg-white
      rounded-3xl
      p-10
      shadow-sm
      border
      border-slate-200
      hover:shadow-xl
      hover:-translate-y-2
      transition-all
      duration-500
      h-full
      flex
      flex-col
    "
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
        <Icon size={28} />
      </div>
      <h3 className="mt-8 text-3xl font-semibold">
        {title}
      </h3>
      <p className="mt-5 text-slate-600 leading-8">
        {description}
      </p>
      <ul className="mt-8 space-y-3 grow">
        {items.map((item) => (
          <li
            key={item}
            className="text-slate-700"
          >
            • {item}
          </li>
        ))}
      </ul>
      <button className="mt-10 flex items-center gap-3 font-medium group-hover:gap-5 transition-all">
        {button}
        <ArrowRight size={18} />
      </button>
    </div>
  );
}