"use client";
import React, { useEffect } from 'react';
import { useTheme } from 'next-themes';


type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    activeItem: any;
    component: any;
    setRoute: (route: string) => void;
}

const CustomModal: React.FC<Props> = ({ open, setOpen, setRoute, activeItem, component: Component }) => {
    const { theme } = useTheme();

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={() => setOpen(false)}
            />

            {/* Modal Content */}
            <div
                className="relative z-10 w-full max-w-md transform transition-all rounded-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                }}
            >
                <Component setOpen={setOpen} setRoute={setRoute} activeItem={activeItem} />
            </div>
        </div>
    );
}

export default CustomModal;