import SectionTitle from "../ui/SectionTitle";
import EngagementCard from "./EngagementCard";

export default function Engagement() {
  return (
    <section className="py-36 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <SectionTitle
          eyebrow="WAYS WE WORK TOGETHER"
          title="Flexible Engagements Designed Around Your Strategic Priorities."
          description="Whether you're exploring a single challenge or seeking a long-term strategic partner, every engagement is tailored to deliver meaningful outcomes."
        />
        <div className="grid lg:grid-cols-3 gap-8 mt-20">
          <EngagementCard
            title="Discovery Engagement"
            subtitle="Clarify the challenge."
            description="Ideal for organizations seeking an external perspective on a strategic opportunity or business challenge."
            outcomes={[
              "Discovery Session",
              "Strategic Assessment",
              "Priority Recommendations",
              "Executive Summary",
            ]}
          />
          <EngagementCard
            featured
            title="Growth Accelerator"
            subtitle="Move from strategy to execution."
            description="A focused engagement supporting leadership teams through commercial growth, execution planning, and capability development."
            outcomes={[
              "Growth Roadmap",
              "Leadership Workshops",
              "Commercial Strategy",
              "Implementation Support",
              "Executive Coaching",
            ]}
          />
          <EngagementCard
            title="Strategic Partnership"
            subtitle="A trusted advisor for the long term."
            description="Designed for organizations seeking ongoing executive advisory and strategic support throughout periods of growth or transformation."
            outcomes={[
              "Fractional Strategic Advisor",
              "Quarterly Business Reviews",
              "Leadership Support",
              "Partnership Development",
            ]}
          />
        </div>
      </div>
    </section>
  );
}