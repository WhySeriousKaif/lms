"use client";
import React from "react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { BiSun, BiMoon } from "react-icons/bi";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-[25px] h-[25px] flex items-center justify-center">
        <div className="w-[20px] h-[20px] rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
      </div>
    );
  }

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
  }
  };

  return (
    <div className="flex items-center gap-2">
        {theme === "dark" ? (
          <BiSun
          className="cursor-pointer text-white hover:text-[#37a39a] transition-colors"
            size={25}
          onClick={toggleTheme}
          />
        ) : (
          <BiMoon
          className="cursor-pointer text-black hover:text-[#37a39a] transition-colors"
            size={25}
          onClick={toggleTheme}
          />
        )}
    </div>
  );
};

export default ThemeSwitcher;
