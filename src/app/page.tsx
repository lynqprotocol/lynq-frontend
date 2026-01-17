"use client";

import { useRouter } from "next/navigation";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Hero } from "@/components/landing/Hero";
import { Comparison } from "@/components/landing/Comparison";
import { Features } from "@/components/landing/Features";
import { Architecture } from "@/components/landing/Architecture";
import { Roadmap } from "@/components/landing/Roadmap";
import { UseCases } from "@/components/landing/UseCases";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export default function Page() {
  const router = useRouter();

  const handleLaunchApp = () => {
    router.push("/app");
  };

  return (
    <main className="bg-background-dark min-h-screen text-white font-sans selection:bg-primary selection:text-white">
      <LandingNavbar onLaunch={handleLaunchApp} />
      <Hero onLaunch={handleLaunchApp} />
      <Comparison />
      <Features />
      <Architecture />
      <Roadmap />
      <UseCases />
      <FAQ />
      <Footer onLaunch={handleLaunchApp} />
    </main>
  );
}
