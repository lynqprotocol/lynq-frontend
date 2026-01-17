import Link from "next/link";
import { BrandLogo } from "../ui/BrandLogo";

interface FooterProps {
    onLaunch?: () => void;
}

export function Footer({ onLaunch }: FooterProps) {
    return (
        <footer className="bg-surface-dark border-t border-glass-border pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col items-center text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
                        Build the <span className="text-gradient">Private Layer</span> of
                        Solana
                    </h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={onLaunch}
                            className="bg-white text-black font-bold px-8 py-4 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                            Launch App
                        </button>
                        {/* <button className="border border-white/20 text-white font-bold px-8 py-4 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                            Read Whitepaper
                        </button> */}
                        <a
                            href="#"
                            className="border border-white/20 text-white font-bold px-8 py-4 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                        >
                            Buy $LYNQ
                        </a>

                        {/* <button className="text-gray-400 border border-white/20 font-bold px-8 py-4 rounded-lg hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2 cursor-pointer">
                            Developer Docs
                            <span className="material-symbols-outlined text-sm">
                                open_in_new
                            </span>
                        </button> */}
                    </div>
                </div>
                <div className="grid md:grid-cols-4 gap-8 border-t border-white/5 pt-10">
                    <div className="col-span-1">
                        {/* <div className="flex items-center gap-2 mb-4">
                            <div className="size-6 rounded bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-xs">share</span>
                            </div>
                            <span className="font-bold text-lg text-white">Lynq</span>
                        </div> */}
                        <BrandLogo />
                        <p className="text-gray-500 text-sm mt-3">
                            © 2026 Lynq Protocol.
                            <br />
                            All rights reserved.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h5 className="font-bold text-white mb-2">Product</h5>
                        <Link
                            className="text-gray-500 hover:text-white text-sm transition-colors"
                            href="/app"
                        >
                            Messenger
                        </Link>
                        <Link
                            className="text-gray-500 hover:text-white text-sm transition-colors"
                            href="/app"
                        >
                            Pay
                        </Link>
                        {/* <a
                            className="text-gray-500 hover:text-white text-sm transition-colors"
                            href="#"
                        >
                            Identity
                        </a> */}
                    </div>
                    <div className="flex flex-col gap-2">
                        <h5 className="font-bold text-white mb-2">Resources</h5>
                        {/* <Link
                            className="text-gray-500 hover:text-white text-sm transition-colors"
                            href="/docs"
                        >
                            Documentation
                        </Link> */}
                        <a
                            className="text-gray-500 hover:text-white text-sm transition-colors"
                            href="https://github.com/lynqprotocol"
                            target="_blank"
                        >
                            GitHub
                        </a>
                        <a
                            className="text-gray-500 hover:text-white text-sm transition-colors"
                            href="https://lynqprotocol.medium.com"
                            target="_blank"
                        >
                            Medium
                        </a>
                        {/* <a
                            className="text-gray-500 hover:text-white text-sm transition-colors"
                            href="#"
                        >
                            Brand Kit
                        </a> */}
                    </div>
                    <div className="flex flex-col gap-2">
                        <h5 className="font-bold text-white mb-2">Connect</h5>
                        <a
                            className="text-gray-500 hover:text-white text-sm transition-colors"
                            href="https://x.com/LynqProtocol"
                        >
                            X (Twitter)
                        </a>
                        {/* <a
                            className="text-gray-500 hover:text-white text-sm transition-colors"
                            href="#"
                        >
                            Discord
                        </a> */}
                        <a
                            className="text-gray-500 hover:text-white text-sm transition-colors"
                            href="mailto:admin@lynqprotocol.com"
                        >
                            Contact
                        </a>
                    </div>
                </div>
                <div className="mt-10 text-center">
                    <p className="text-[10px] text-gray-700 font-mono">
                        POWERED BY SOLANA
                    </p>
                </div>
            </div>
        </footer>
    );
}
