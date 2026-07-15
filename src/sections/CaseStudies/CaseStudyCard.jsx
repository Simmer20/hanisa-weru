import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CaseStudyCard({
title,
industry,
challenge,
approach,
results,
image,
}) {
return (
<motion.article
initial={{opacity:0,y:40}}
whileInView={{opacity:1,y:0}}
viewport={{once:true}}
transition={{duration:.8}}
className="grid lg:grid-cols-2 gap-20 items-center py-28"
>
<img
src={image}
className="rounded-4xl shadow-xl"
/>
<div>
<p className="uppercase tracking-[0.3em] text-sm text-slate-400">
{industry}
</p>
<h2 className="text-5xl font-semibold mt-4">
{title}
</h2>
<div className="mt-12">
<h3 className="font-semibold">
The Challenge
</h3>
<p className="mt-4 text-slate-300 leading-8">
{challenge}
</p>
</div>
<div className="mt-10">
<h3 className="font-semibold">
Approach
</h3>
<p className="mt-4 text-slate-300 leading-8">
{approach}
</p>
</div>
<div className="mt-10">
<h3 className="font-semibold">
Impact
</h3>
<ul className="mt-5 space-y-3">
{results.map(result=>(
<li key={result}>
✓ {result}
</li>
))}
</ul>
</div>
<button className="mt-12 flex gap-3 items-center">
Read Case Study
<ArrowRight size={18}/>
</button>
</div>
</motion.article>
);
}