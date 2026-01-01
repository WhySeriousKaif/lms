'use client'
import React, { FC } from "react";
import Image from "next/image";
import { BiSearch } from "react-icons/bi";
import Link from "next/link";
import { useTheme } from "next-themes";

type Props = {};

const Hero: FC<Props> = () => {
  const { theme } = useTheme();
  
  return (
    <section 
      className="w-full bg-white dark:bg-[#0f172a] min-h-screen flex items-center pt-24 pb-16 transition-colors duration-300"
      style={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff' }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-0 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Section - Image with Animated Circle */}
          <div className="flex justify-center lg:justify-start lg:-ml-8 xl:-ml-12 order-2 lg:order-1">
            <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl aspect-square">
              {/* Animated gradient circle background */}
              <div className="absolute inset-0 hero_animation rounded-full"></div>
              {/* Image container */}
              <div className="absolute inset-0 flex items-center justify-center p-6">
        <Image
                  src="/assests/cropped_circle_image-Photoroom.png"
                  alt="Online Learning Experience"
                  width={600}
                  height={600}
                  className="w-full h-full object-contain rounded-full"
                  priority
        />
      </div>
            </div>
          </div>

          {/* Right Section - Content */}
          <div className="flex flex-col space-y-8 order-1 lg:order-2 lg:pl-8 xl:pl-12">
            
            {/* Main Heading */}
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-Josefin leading-tight text-black dark:text-white"
              style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
            >
          Improve Your Online Learning Experience Better Instantly
            </h1>
            
            {/* Description */}
            <p 
              className="text-lg sm:text-xl text-gray-900 dark:text-gray-300 font-Josefin font-medium leading-relaxed max-w-2xl"
              style={{ color: theme === 'dark' ? '#d1d5db' : '#111827' }}
            >
          We have 40k+ Online courses & 500K+ Online registered student. Find your desired Courses from them.
        </p>
            
            {/* Search Bar */}
            <div className="relative w-full max-w-xl pt-2">
          <input
            type="search"
            placeholder="Search Courses..."
                className="w-full h-14 sm:h-16 pl-6 pr-20 rounded-xl bg-white dark:bg-slate-800 border-2 border-gray-400 dark:border-slate-600 text-black dark:text-white placeholder-gray-700 dark:placeholder-gray-400 text-lg font-medium font-Josefin focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-600 dark:focus:border-blue-400 transition-all shadow-sm hover:shadow-md"
                style={{ 
                  color: theme === 'dark' ? '#ffffff' : '#000000',
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff'
                }}
              />
              <button
                type="button"
                className="absolute right-0 top-0 h-14 sm:h-16 w-16 sm:w-20 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-r-xl flex items-center justify-center transition-all shadow-md hover:shadow-lg"
                aria-label="Search courses"
              >
                <BiSearch className="text-white text-2xl" />
              </button>
            </div>
            
            {/* Trust Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pt-2">
              {/* Client Avatars */}
              <div className="flex items-center -space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-3 border-white dark:border-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-lg z-10">
                  A
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 border-3 border-white dark:border-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-lg z-20">
                  B
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 border-3 border-white dark:border-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-lg z-30">
                  C
          </div>
        </div>
              
              {/* Trust Text */}
              <div className="flex flex-wrap items-center gap-2">
                <p 
                  className="text-base sm:text-lg text-black dark:text-gray-100 font-Josefin font-semibold"
                  style={{ color: theme === 'dark' ? '#f3f4f6' : '#000000' }}
                >
                  500K+ People already trusted us.
                </p>
            <Link
              href="/courses"
                  className="text-base sm:text-lg text-blue-700 dark:text-emerald-400 font-Josefin font-semibold hover:underline transition-all hover:text-blue-800 dark:hover:text-emerald-300"
                  style={{ color: theme === 'dark' ? '#34d399' : '#1d4ed8' }}
            >
              View Courses
            </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
