'use client'
import React, { FC, useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useSelector } from 'react-redux'
import Image from 'next/image'
import NavItems from '../utils/NavItems'
import ThemeSwitcher from '../utils/ThemeSwitcher'
import { HiOutlineMenuAlt3, HiOutlineUserCircle, HiX } from 'react-icons/hi'
import CustomModal from '../utils/CustomModal'
import Login from './Auth/Login'
import SignUp from './Auth/SignUp'
import Verification from './Auth/Verification'
type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    activeItem: number;
    route: string;
    setRoute: (route: string) => void;
}

const Header: FC<Props> = ({ open, setOpen, activeItem, route, setRoute }) => {
    const [active, setActive] = useState(false);
    const [openSidebar, setOpenSidebar] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [forceUpdate, setForceUpdate] = useState(0);
    const { theme } = useTheme();
    
    // Get user from Redux state - get fresh value on every render
    const user = useSelector((state: any) => state.auth?.user);
    const token = useSelector((state: any) => state.auth?.token);
    
    // Memoize the user check to avoid re-renders
    const isUserLoggedIn = useMemo(() => {
        const result = user && user !== null && user !== "" && (typeof user === 'object' ? Object.keys(user).length > 0 : true);
        console.log("🔍 isUserLoggedIn check:", result, "user:", user);
        return result;
    }, [user]);
    
    // Listen for custom userLoggedIn and userLoggedOut events
    useEffect(() => {
        const handleUserLoggedIn = (event: any) => {
            console.log("🔄 userLoggedIn event received - forcing Header update", event.detail);
            setForceUpdate(prev => prev + 1);
        };
        const handleUserLoggedOut = () => {
            console.log("🔄 userLoggedOut event received - forcing Header update");
            setForceUpdate(prev => prev + 1);
        };
        window.addEventListener('userLoggedIn', handleUserLoggedIn as EventListener);
        window.addEventListener('userLoggedOut', handleUserLoggedOut);
        return () => {
            window.removeEventListener('userLoggedIn', handleUserLoggedIn as EventListener);
            window.removeEventListener('userLoggedOut', handleUserLoggedOut);
        };
    }, []);
    
    // Force re-render when user changes
    useEffect(() => {
        console.log("🔵 Header - User state changed:", user);
        console.log("🔵 Header - Token:", token);
        console.log("🔵 Header - User type:", typeof user);
        console.log("🔵 Header - User is object:", typeof user === 'object');
        console.log("🔵 Header - User is null:", user === null);
        console.log("🔵 Header - User keys:", user && typeof user === 'object' ? Object.keys(user) : 'N/A');
        // Force component update
        setForceUpdate(prev => prev + 1);
    }, [user, token]);

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

    // Set mounted state to prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Determine theme for background colors (use default 'light' during SSR)
    const currentTheme = mounted ? theme : 'light';
    const bgColor = currentTheme === 'dark' ? 'bg-[#0f172a]' : 'bg-white';
    const borderColor = currentTheme === 'dark' ? 'border-[#ffffff1c]' : 'border-[#00000014]';
    const headerTextColor = mounted && currentTheme === 'dark' ? '#ffffff' : '#000000';
   
  return (
    <div className='w-full relative'>
            <div 
                className={`${active ? `fixed top-0 left-0 w-full h-[80px] z-[80] shadow-sm transition-all duration-300` : `w-full h-[80px] z-[80] shadow-sm transition-all duration-300`} ${bgColor} border-b ${borderColor}`}
                style={{ backgroundColor: mounted && currentTheme === 'dark' ? '#0f172a' : '#ffffff' }}
                suppressHydrationWarning
            >
                <div className="w-[95%] 800px:w-[92%] m-auto py-2 h-full">
                    <div className="w-full h-[80px] flex items-center justify-between p-3">
                        <div>
                            <Link 
                                href="/" 
                                className="text-[25px] font-Poppins font-[500] hover:text-[#37a39a] transition-colors duration-200"
                                style={{ color: headerTextColor }}
                                suppressHydrationWarning
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
                            <div className="hidden md:flex items-center" key={`profile-${forceUpdate}`}>
                                {/* Use memoized check */}
                                {isUserLoggedIn ? (
                                    <Link 
                                        href="/profile" 
                                        onClick={(e) => {
                                            // Prevent opening login modal if user is logged in
                                            e.stopPropagation();
                                        }}
                                        className="flex items-center"
                                    >
                                        <Image
                                            src={user?.avatar?.url || "/assests/profile-icon-png-898.png"}
                                            alt="Profile"
                                            width={35}
                                            height={35}
                                            className="rounded-full cursor-pointer border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 transition-colors"
                                            style={{ objectFit: 'cover' }}
                                            priority
                                        />
                                    </Link>
                                ) : (
                                    <HiOutlineUserCircle
                                        size={25}
                                        className="cursor-pointer text-black dark:text-blue-600 hover:text-[#37a39a] transition-colors duration-200"
                                        onClick={() => {
                                            setRoute("Login");
                                            setOpen(true);
                                        }}
                                        suppressHydrationWarning
                                    />
                                )}
                            </div>
                            {/* Mobile menu icon - only visible on mobile */}
                            <div className="flex md:hidden items-center">
                                <HiOutlineMenuAlt3
                                    className="cursor-pointer text-black dark:text-white hover:text-[#37a39a] transition-colors duration-200"
                                    size={25}
                                    onClick={() => setOpenSidebar(true)}
                                    suppressHydrationWarning
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
                            backgroundColor: mounted && currentTheme === 'dark' ? '#0f172a' : '#ffffff' 
                        }}
                        suppressHydrationWarning
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
                                    className="text-[20px] font-Poppins font-[500] text-black dark:text-white hover:text-[#37a39a] transition-colors duration-200"
                                    suppressHydrationWarning
                                >
                                    ELearning
                                </Link>
                                <HiX
                                    className="cursor-pointer text-black dark:text-white hover:text-[#37a39a] transition-colors duration-200"
                                    size={25}
                                    onClick={() => setOpenSidebar(false)}
                                    suppressHydrationWarning
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
                                    {user ? (
                                        <Link href="/profile" onClick={() => setOpenSidebar(false)}>
                                            <div 
                                                className="flex items-center gap-3 cursor-pointer py-3 px-6 text-black dark:text-white hover:text-[#37a39a] transition-colors duration-200"
                                            >
                                                <Image
                                                    src={user.avatar?.url || "/assests/profile-icon-png-898.png"}
                                                    alt="Profile"
                                                    width={25}
                                                    height={25}
                                                    className="rounded-full"
                                                    style={{ objectFit: 'cover' }}
                                                />
                                                <span className="text-[18px] font-Poppins font-[400]">
                                                    Profile
                                                </span>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div 
                                            className="flex items-center gap-3 cursor-pointer py-3 px-6 text-black dark:text-white hover:text-[#37a39a] transition-colors duration-200"
                                            onClick={() => {
                                                setOpenSidebar(false);
                                                setRoute("Login");
                                                setOpen(true);
                                            }}
                                        >
                                            <HiOutlineUserCircle
                                                size={25}
                                                className="text-black dark:text-white"
                                            />
                                            <span className="text-[18px] font-Poppins font-[400]">
                                                Profile
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Only show modals if user is not logged in */}
            {!user && route === "Login" && open && (
                <CustomModal open={open} setOpen={setOpen} activeItem={activeItem} component={Login} setRoute={setRoute} />
            )}
            {!user && route === "Sign-Up" && open && (
                <CustomModal open={open} setOpen={setOpen} activeItem={activeItem} component={SignUp} setRoute={setRoute} />
            )}
            {!user && route === "Verification" && open && (
                <CustomModal open={open} setOpen={setOpen} activeItem={activeItem} component={Verification} setRoute={setRoute} />
            )}
    </div>
  )
}

export default Header;
