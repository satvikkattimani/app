import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useLenis } from "@/hooks/useLenis";
import { Intro } from "@/components/Intro";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { SipCalculator } from "@/components/SipCalculator";
import { DirectVsRegular } from "@/components/DirectVsRegular";
import { Booking } from "@/components/Booking";
import { Contact } from "@/components/Contact";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";

export default function Landing() {
  const [intro, setIntro] = useState(() => !sessionStorage.getItem("sc_intro_seen"));
  const done = useCallback(() => { sessionStorage.setItem("sc_intro_seen", "1"); setIntro(false); }, []);
  useLenis(!intro);

  return (
    <div data-testid="landing-page" className="bg-navy min-h-screen">
      <AnimatePresence>{intro && <Intro key="intro" onDone={done} />}</AnimatePresence>
      <Navbar />
      <Hero ready={!intro} />
      <Marquee />
      <About />
      <Services />
      <SipCalculator />
      <DirectVsRegular />
      <Booking />
      <Contact />
      <Testimonials />
      <Footer />
      <ChatWidget />
    </div>
  );
}
