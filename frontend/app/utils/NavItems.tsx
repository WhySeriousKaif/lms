'use client'
import Link from 'next/link';
import React, { FC } from 'react'
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

const NavItems: FC<Props> = ({ activeItem, isMobile }) => {
    const { theme } = useTheme();
    
    // Desktop view - horizontal navigation
    if (!isMobile) {
        return (
            <div className='flex items-center'>
                {
                    navItemsData && navItemsData.map((item) => {
                        const isActive = activeItem === item.id;
                        // Default color is black in light mode, white in dark mode (same for active and inactive)
                        const defaultColor = theme === 'dark' ? '#ffffff' : '#000000';
                        const hoverColor = '#37a39a'; // Teal on hover
                        
                        return (
                            <Link href={item.url} key={item.id} className="block">
                                <span 
                                    className="px-3 800px:px-6 font-Poppins font-[400] relative transition-colors cursor-pointer text-sm 800px:text-base"
                                    style={{ 
                                        color: defaultColor 
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = hoverColor}
                                    onMouseLeave={(e) => e.currentTarget.style.color = defaultColor}
                                >
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })
                }
            </div>
        );
    }

    // Mobile view - vertical navigation (only in sidebar)
    return (
        <div className='w-full'>
            {
                navItemsData && navItemsData.map((item, index) => {
                    const isActive = activeItem === index;
                    // Default color is black in light mode, white in dark mode (same for active and inactive)
                    const defaultColor = theme === 'dark' ? '#ffffff' : '#000000';
                    const hoverColor = '#37a39a'; // Teal on hover
                    
                    return (
                        <Link href={item.url} key={item.id} className="block">
                            <span 
                                className="block py-5 text-[18px] px-6 font-Poppins font-[400] transition-colors cursor-pointer"
                                style={{ 
                                    color: defaultColor 
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = hoverColor}
                                onMouseLeave={(e) => e.currentTarget.style.color = defaultColor}
                            >
                                {item.name}
                            </span>
                        </Link>
                    );
                })
            }
        </div>
    );
}

export default NavItems;
