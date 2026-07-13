import SectionTitle from "../ui/SectionTitle";
import FAQItem from "./FAQItem";

const faqs = [
  {
    question: "What types of organizations do you work with?",
    answer:
      "Hanisa partners with founders, executive teams, corporations, development organizations, government agencies, NGOs, and growing businesses across multiple industries.",
  },
  {
    question: "Do you work internationally?",
    answer:
      "Yes. Engagements are available both virtually and in person across Africa and internationally.",
  },
  {
    question: "Can workshops be customized?",
    answer:
      "Absolutely. Every workshop is tailored to the goals, audience, and context of your organization.",
  },
  {
    question: "How does executive advisory work?",
    answer:
      "Executive advisory engagements are designed around your priorities, providing strategic guidance, accountability, and ongoing support for leadership teams.",
  },
  {
    question: "What happens after our first conversation?",
    answer:
      "Following an initial discovery conversation, you'll receive a recommended engagement approach outlining objectives, deliverables, timelines, and next steps.",
  },
];  
export default function FAQ() {
  return (
    <section className="py-36 bg-white">
      <div className="max-w-4xl mx-auto px-8">
        <SectionTitle
          eyebrow="COMMON QUESTIONS"
          title="Everything You Need to Know Before We Begin."
          description="A few of the questions organizations often ask before engaging with LynchPin Advisory."
        />
        <div className="mt-16">
          {faqs.map((faq) => (
            <FAQItem key={faq.question} {...faq} />
          ))}
        </div>
      </div>
    </section>
  );
}