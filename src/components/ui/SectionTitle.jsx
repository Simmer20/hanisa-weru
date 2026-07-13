export default function SectionTitle({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="max-w-3xl mb-16">

      <p className="uppercase tracking-[0.3em] text-sm text-slate-500 mb-4">
        {eyebrow}
      </p>

      <h2 className="text-5xl font-semibold leading-tight text-slate-900">
        {title}
      </h2>

      <p className="mt-6 text-xl text-slate-600 leading-8">
        {description}
      </p>

    </div>
  );
}