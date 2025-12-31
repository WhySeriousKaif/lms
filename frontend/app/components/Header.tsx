'use client'
import React, { FC, useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import NavItems from '../utils/NavItems'
import ThemeSwitcher from '../utils/ThemeSwitcher'
import { HiOutlineMenuAlt3, HiOutlineUserCircle, HiX } from 'react-icons/hi'

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    activeItem: number;
}

const Header: FC<Props> = ({ open, setOpen, activeItem }) => {
    const [active, setActive] = useState(false);
    const [openSidebar, setOpenSidebar] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 85) {
                setActive(true);
            } else {
                setActive(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close sidebar when clicking outside and prevent body scroll
    useEffect(() => {
        if (openSidebar) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [openSidebar]);

    // Determine background color based on theme
    const bgColor = theme === 'dark' ? 'bg-[#0f172a]' : 'bg-white';
    const textColor = theme === 'dark' ? 'text-white' : 'text-black';
    const borderColor = theme === 'dark' ? 'border-[#ffffff1c]' : 'border-[#00000014]';
   
  return (
    <div className='w-full relative'>
            <div 
                className={`${active ? `fixed top-0 left-0 w-full h-[80px] z-[80] shadow-sm transition-all duration-300` : `w-full h-[80px] z-[80] shadow-sm transition-all duration-300`} ${bgColor} border-b ${borderColor}`}
                style={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff' }}
            >
                <div className="w-[95%] 800px:w-[92%] m-auto py-2 h-full">
                    <div className="w-full h-[80px] flex items-center justify-between p-3">
                        <div>
                            <Link 
                                href="/" 
                                className="text-[25px] font-Poppins font-[500]"
                                style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
                            >
                                ELearning
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Hide NavItems on mobile, show only on desktop */}
                            <div className="hidden md:flex items-center">
                                <NavItems activeItem={activeItem} isMobile={false} />
                            </div>
                            <ThemeSwitcher/>
                            {/* Profile button - only visible on desktop */}
                            <div className="hidden md:flex items-center">
                                <HiOutlineUserCircle
                                    size={25}
                                    className={`cursor-pointer ${textColor}`}
                                    onClick={() => setOpen(true)}
                                />
                            </div>
                            {/* Mobile menu icon - only visible on mobile */}
                            <div className="flex md:hidden items-center">
                                <HiOutlineMenuAlt3
                                    className={`${textColor} cursor-pointer`}
                                    size={25}
                                    onClick={() => setOpenSidebar(true)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar */}
            {openSidebar && (
                <>
                    {/* Overlay */}
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-[90] md:hidden"
                        onClick={() => setOpenSidebar(false)}
                    />
                    {/* Sidebar */}
                    <div 
                        className="fixed top-0 right-0 h-full w-[280px] z-[100] md:hidden shadow-2xl transform transition-all duration-300 ease-in-out"
                        style={{ 
                            backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff' 
                        }}
                    >
                        <div className="flex flex-col h-full">
                            {/* Sidebar Header */}
                            <div 
                                className="flex items-center justify-between p-5 border-b"
                                style={{ 
                                    borderColor: theme === 'dark' ? '#ffffff1c' : '#00000014' 
                                }}
                            >
                                <Link 
                                    href="/" 
                                    className="text-[20px] font-Poppins font-[500]"
                                    style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
                                >
                                    ELearning
                                </Link>
                                <HiX
                                    className="cursor-pointer"
                                    size={25}
                                    style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
                                    onClick={() => setOpenSidebar(false)}
                                />
                            </div>
                            {/* Sidebar Navigation */}
                            <div className="flex-1 overflow-y-auto p-5">
                                <NavItems activeItem={activeItem} isMobile={true} />
                                {/* Profile button in sidebar - after FAQ */}
                                <div 
                                    className="mt-5 pt-5 border-t"
                                    style={{ 
                                        borderColor: theme === 'dark' ? '#ffffff1c' : '#00000014' 
                                    }}
                                >
                                    <div 
                                        className="flex items-center gap-3 cursor-pointer py-3 px-6 transition-colors"
                                        style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#37a39a'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#000000'}
                                        onClick={() => {
                                            setOpenSidebar(false);
                                            setOpen(true);
                                        }}
                                    >
                                        <HiOutlineUserCircle
                                            size={25}
                                            style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
                                        />
                                        <span className="text-[18px] font-Poppins font-[400]">
                                            Profile
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
    </div>
  )
}

export default Header;
