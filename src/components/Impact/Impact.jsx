import {
    Briefcase,
    Users,
    Mic2,
    Handshake
} from "lucide-react";

import ImpactCard from "./ImpactCard";
import SectionTitle from "../ui/SectionTitle";

export default function Impact() {
    return (
        <section
        id="impact"
        className="py-36 bg-[#FAFAF8]"
        >
        <div className="max-w-7xl mx-auto px-8">
        <SectionTitle
        eyebrow="HOW WE CREATE IMPACT"
        title="Partnering With Organizations to Drive Sustainable Growth."
        description="Every engagement is designed around the outcomes you need—whether that's strategic clarity, stronger leadership, commercial capability, or long-term partnership."
        />
        <div className="grid lg:grid-cols-2 gap-8">
        <ImpactCard
        icon={Briefcase}
        title="Advise Me"
        description="Strategic support for founders, executives and leadership teams navigating growth."
        items={[
        "Business Strategy",
        "Commercial Strategy",
        "Market Expansion",
        "Executive Advisory",
        "Partnership Strategy",
        "Organizational Development",
        ]}
        button="Let's Talk Strategy"
        />
        <ImpactCard
        icon={Users}
        title="Equip My Team"
        description="Developing confident, commercially minded teams that execute with purpose."
        items={[
        "Sales Enablement",
        "Negotiation",
        "Leadership Workshops",
        "Customer Engagement",
        "Commercial Thinking",
        "Team Facilitation",
        ]}
        button="Develop My Team"
        />
        <ImpactCard
        icon={Mic2}
        title="Inspire My Audience"
        description="Executive keynotes that challenge thinking and inspire meaningful action."
        items={[
        "AI & Business",
        "Leadership",
        "Innovation",
        "Sustainability",
        "Sales Strategy",
        "Inclusive Growth",
        ]}
        button="Book Hanisa"/>
        <ImpactCard
        icon={Handshake}
        title="Partner With Us"
        description="Long-term advisory relationships that support strategic execution."
        items={[
        "Fractional Strategy Partner",
        "Commercial Advisor",
        "Executive Coaching",
        "Quarterly Business Reviews",
        "Leadership Support",
        "Growth Roadmaps",
        ]}
        button="Become a Strategic Partner"/>
        </div>
        </div>
    </section>

);
}