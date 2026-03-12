import bannerImage from '@/assets/images/banner.jpg';
import logo from '@/assets/images/logo.png';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title: string;
    description?: string;
    maxWidth?: string;
}

export default function AuthBannerLayout({
    children,
    title,
    description,
    maxWidth = 'max-w-[400px]',
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div
            className="relative min-h-screen flex items-center justify-center p-4"
            style={{
                backgroundImage: `url("${bannerImage}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Card */}
            <div className={`relative z-10 w-full ${maxWidth} bg-white rounded-md p-8 text-sm shadow-lg my-6`}>
                {/* Logo */}
                <div className="flex flex-col items-center mb-6">
                    <img src={logo} alt="Logo" className="h-[80px] w-auto mb-2" />
                    <h2 className="font-semibold text-zinc-600 text-lg md:text-xl text-center border-b border-b-gray-100 pb-1 w-full">
                        {title}
                    </h2>
                </div>

                {/* Optional description */}
                {description && (
                    <p className="text-zinc-500 text-center mb-5">{description}</p>
                )}

                {children}
            </div>
        </div>
    );
}