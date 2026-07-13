import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import About from "./components/About/About";
import Impact from "./components/Impact/Impact";
import Engagement from "./components/Engagement/Engagement";
import CaseStudies from "./components/CaseStudies/CaseStudies";
import FAQ from "./components/FAQ/FAQ";

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Impact />
      <Engagement />
      <CaseStudies />
      <FAQ/>
    </>
  );
}

export default App;