import Button from "../../components/ui/Button";

export default function CTA() {
  return (
    <section className="bg-slate-950 text-white py-40">
      <div className="max-w-4xl mx-auto text-center px-8">
        <p className="uppercase tracking-[0.3em] text-sm text-slate-400">
          START THE CONVERSATION
        </p>
        <h2 className="text-6xl font-bold mt-8 leading-tight">
          Ready to Build What's Next?
        </h2>
        <p className="mt-8 text-xl text-slate-300 leading-9">
          Whether you're navigating growth,
          strengthening leadership, or exploring
          new strategic opportunities,
          let's begin the conversation.
        </p>
        <Button className="mt-12">
          Book a Strategy Conversation
        </Button>
      </div>
    </section>
  );
}