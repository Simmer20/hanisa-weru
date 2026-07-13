export default function Button({
  children,
  variant = "primary",
  className = "",
}) {
  const styles = {
    primary:
      "bg-slate-900 text-white hover:bg-slate-800",
    secondary:
      "border border-slate-300 text-slate-800 hover:bg-slate-100",
  };

  return (
    <button
      className={`
        px-8
        py-4
        rounded-2xl
        font-medium
        transition-all
        duration-300
        hover:-translate-y-1
        ${styles[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}