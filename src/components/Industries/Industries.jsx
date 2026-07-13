import {
  Landmark,
  Building2,
  Smartphone,
  Cpu,
  Leaf,
  Globe,
  Accessibility,
  GraduationCap,
  Briefcase,
  Rocket,
  HeartHandshake,
  Building,
} from "lucide-react";
import SectionTitle from "../ui/SectionTitle";
import IndustryCard from "./IndustryCard";

const industries = [
  {
    icon: Landmark,
    title: "Financial Services",
    description:
      "Supporting financial institutions with strategy, partnerships and commercial transformation.",
  },
  {
    icon: Building2,
    title: "Banking",
    description:
      "Helping banks strengthen growth, customer engagement and strategic execution.",
  },
  {
    icon: Smartphone,
    title: "Telecommunications",
    description:
      "Driving commercial innovation in rapidly evolving digital markets.",
  },
  {
    icon: Cpu,
    title: "Technology",
    description:
      "Helping innovative companies scale products, partnerships and market reach.",
  },
  {
    icon: Leaf,
    title: "Climate",
    description:
      "Accelerating organizations creating sustainable environmental impact.",
  },
  {
    icon: Globe,
    title: "Carbon Markets",
    description:
      "Supporting businesses navigating climate finance and carbon ecosystems.",
  },
  {
    icon: Accessibility,
    title: "Accessibility",
    description:
      "Championing inclusive innovation and accessible technology solutions.",
  },
  {
    icon: Building,
    title: "Government",
    description:
      "Partnering with public institutions to improve strategy and delivery.",
  },
  {
    icon: HeartHandshake,
    title: "NGOs",
    description:
      "Helping mission-driven organizations grow their impact sustainably.",
  },
  {
    icon: GraduationCap,
    title: "Education",
    description:
      "Supporting learning institutions through leadership and innovation.",
  },
  {
    icon: Rocket,
    title: "Startups",
    description:
      "Building scalable growth strategies for emerging ventures.",
  },
  {
    icon: Briefcase,
    title: "Social Enterprises",
    description:
      "Balancing commercial sustainability with measurable social impact.",
  },
];
export default function Industries() {
  return (
    <section
      id="industries"
      className="py-36 bg-[#FAFAF8]"
    >
      <div className="max-w-7xl mx-auto px-8">
        <SectionTitle
          eyebrow="INDUSTRIES"
          title="Partnering Across Industries Shaping the Future."
          description="Every sector has unique challenges, but sustainable growth always depends on clear strategy, capable leadership and strong execution."
        />
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 mt-20">
          {industries.map((industry) => (
            <IndustryCard
              key={industry.title}
              {...industry}
            />
          ))}
        </div>
      </div>
    </section>
  );
}