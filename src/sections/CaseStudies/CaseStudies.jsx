import SectionTitle from "../ui/SectionTitle";
import CaseStudyCard from "./CaseStudyCard";

export default function CaseStudies() {
return(
<section
id="cases"
className="bg-slate-950 text-white py-36"
>
<div className="max-w-7xl mx-auto px-8">
<SectionTitle
eyebrow="CLIENT IMPACT"
title="Helping Organizations Turn Strategy Into Results."
description="Every engagement is different, but the objective is always the same: creating measurable business outcomes."
/>
<CaseStudyCard
title="Signvrse"
industry="Accessibility Technology"
image="/images/signvrse.jpg"
challenge="Helping an accessibility startup strengthen its commercial strategy and prepare for sustainable growth."
approach="Developed sales enablement tools, strategic positioning and partnership recommendations."
results={[
"Commercial Growth Strategy",
"Sales Enablement Framework",
"Strategic Partnerships",
]}
/>
<CaseStudyCard
title="StarTimes"
industry="Media & Telecommunications"
image="/images/startimes.jpg"
challenge="Placeholder"
approach="Placeholder"
results={[
"Commercial Strategy",
"Growth Planning",
"Leadership Support"
]}
/>
</div>
</section>
);
}