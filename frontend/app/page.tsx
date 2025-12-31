"use client";
import React, { useState, FC } from "react";
import Heading from "./utils/Heading";
import Header from "./components/Header";
import Hero from "./components/Hero";

interface Props {}

const Page: FC<Props> = () => {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] transition-colors duration-300">
      <Heading
        title="Elearning"
        description="Elearning is a platform for students to learn online and get help from the best teachers"
        keywords="Elearning, learning, courses, teachers, Mern Stack, React, Node.js, MongoDB, Express, Tailwind CSS, JavaScript, TypeScript, HTML, CSS"
      />
      <Header open={open} setOpen={setOpen} activeItem={activeItem} />
      <Hero />
    </div>
  );
};

export default Page;
