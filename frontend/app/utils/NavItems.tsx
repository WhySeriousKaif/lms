'use client'
import Link from 'next/link';
import React, { FC, useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

type Props = {
    activeItem: number;
    isMobile: boolean;
}

const navItemsData = [
    { name: 'Home', url: '/', id: 0 },
    { name: 'Courses', url: '/courses', id: 1 },
    { name: 'About', url: '/about', id: 2 },
    { name: 'Policy', url: '/policy', id: 3 },
    { name: 'FAQ', url: '/faq', id: 4 },
];

/**
 * Navigation Items Component
 * Displays navigation links with proper theme colors
 * - Light mode: Black text on white background, green on hover
 * - Dark mode: White text on blue background, green on hover
 */
const NavItems: FC<Props> = ({ activeItem, isMobile }) => {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const textColor = mounted && theme === 'dark' ? '#ffffff' : '#000000';

    // Desktop view - horizontal navigation
    if (!isMobile) {
        return (
            <div className='flex items-center'>
                {navItemsData.map((item) => (
                    <Link href={item.url} key={item.id} className="block">
                        <span 
                            className="px-3 800px:px-6 font-Poppins font-[400] relative transition-colors duration-200 cursor-pointer text-sm 800px:text-base hover:text-[#37a39a]"
                            style={{ color: textColor }}
                        >
                            {item.name}
                        </span>
                    </Link>
                ))}
            </div>
        );
    }

    // Mobile view - vertical navigation (only in sidebar)
    return (
        <div className='w-full'>
            {navItemsData.map((item, index) => (
                <Link href={item.url} key={item.id} className="block">
                    <span 
                        className="block py-5 text-[18px] px-6 font-Poppins font-[400] transition-colors duration-200 cursor-pointer hover:text-[#37a39a]"
                        style={{ color: textColor }}
                    >
                        {item.name}
                    </span>
                </Link>
            ))}
        </div>
    );
}

export default NavItems;
