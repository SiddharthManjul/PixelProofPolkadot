"use client";

import RetroGrid from "../components/ui/retro-grid";
import WordPullUp from "../components/ui/word-pull-up";
import { AnimatedTestimonials } from "../components/ui/animated-testimonials";
// import { RainbowButton } from "../components/ui/rainbow-button";
import { CanvasRevealEffectComp } from "../components/custom/custom-canvas";
// import Header from "../components/Header";

import Image from "next/image";

export default function RetroGridDemo() {
  const testimonials = [
    {
      quote:
        "The rise of manipulated content, such as deepfakes and doctored images, has made it challenging to discern real content from fake.",
      name: "",
      designation: "",
      src: "/combat.png",
    },
    {
      quote:
        "Fake certificates, documents, and other fraudulent content harm industries like education, healthcare, and finance.",
      name: "",
      designation: "",
      src: "/digital.png",
    },
    {
      quote:
        "Organizations are increasingly held accountable for the integrity of their digital assets, especially in regulated industries like healthcare and finance.",
      name: "",
      designation: "",
      src: "/empower.png",
    },
    {
      quote:
        "Lack of transparency around how content is created or edited erodes trust, particularly in journalism, social media, and advertisements.",
      name: "",
      designation: "",
      src: "/enhance.png",
    },
    {
      quote:
        "Digital creators often face unauthorized use or theft of their work, losing control over their intellectual property.",
      name: "",
      designation: "",
      src: "/protect.png",
    },
  ];
  return (
    <div className="bg-[#2E073F] relative">
      <div className="relative flex h-[600px] md:h-screen w-full flex-col md:items-left justify-center overflow-hidden bg-background md:shadow-xl">
        <span className="pl-24 md:pl-12 lg:pl-0 pointer-events-none z-10 whitespace-pre-wrap bg-gradient-to-b from-[#17153B] via-[#17153B] to-[#17153B] font-josefin pb-12 bg-clip-text text-center md:text-left mr-12 pr-96 text-7xl font-bold leading-none tracking-normal text-transparent">
          <WordPullUp
            className="text-4xl font-bold tracking-[-0.02em] text-[#17153B] dark:text-white md:text-7xl md:leading-[5rem]"
            words="PixelProof: The Gateway to Content Provenance"
          />
        </span>

        <RetroGrid />
      </div>
      <div className="absolute z-100 top-44 right-20 hidden md:block">
        <Image
          className="rounded-xl border-4 border-[#7A1CAC]"
          src="/IMG_9209.PNG"
          width={240}
          height={240}
          alt="Picture of the author"
        />
      </div>
      <div className="absolute z-200 top-96 mt-20 right-32 hidden md:block">
        <Image
          className="rounded-xl border-4 border-[#7A1CAC]"
          src="/landscape.png"
          width={340}
          height={340}
          alt="Picture of the author"
        />
      </div>
      <div className="w-full ml-8 ">
        <h1 className="mt-12 lg:mt-52 font-josefin font-bold text-5xl ml-16 lg:absolute w-80 text-white">
          Problems with Digital Media
        </h1>
        <div className="pr-14 lg:ml-96 lg:pl-12">
          <AnimatedTestimonials testimonials={testimonials} />;
        </div>
      </div>
      <div>
        <h1 className="text-white font-josefin text-5xl font-bold w-full text-center pb-8">
          Solution
        </h1>
        <div className="relative bg-black-100 flex justify-center items-center flex-col mx-auto sm:px-10 px-5 pb-8 overflow-clip">
          <CanvasRevealEffectComp />
        </div>
      </div>
    </div>
  );
}
