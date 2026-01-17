import { BrandLogo } from "@/components/ui/BrandLogo";
import Link from "next/link";

interface LandingNavbarProps {
    onLaunch?: () => void;
}

export function LandingNavbar({ onLaunch }: LandingNavbarProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-glass-border bg-background-dark/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <BrandLogo />
                <nav className="hidden md:flex items-center gap-8">
                    <Link
                        className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        href="#product"
                    >
                        Product
                    </Link>
                    <Link
                        className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        href="#technology"
                    >
                        Technology
                    </Link>
                    <Link
                        className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        href="#roadmap"
                    >
                        Roadmap
                    </Link>
                    {/* <Link
                        className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        href="#developers"
                    >
                        Developers
                    </Link> */}
                    <Link
                        className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        href="#faq"
                    >
                        FAQ
                    </Link>
                </nav>
                <div className="flex items-center gap-4">
                    {/* <Link
                        className="hidden sm:flex text-sm font-bold text-gray-300 hover:text-white transition-colors"
                        href="#"
                    >
                        Read Whitepaper
                    </Link> */}
                    <button
                        onClick={onLaunch}
                        className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all neon-border flex items-center gap-2 cursor-pointer">
                        <span>Launch App</span>
                        {/* <span className="material-symbols-outlined text-[16px]">
                            arrow_forward
                        </span> */}
                    </button>
                </div>
            </div>
        </header>
    );
}
