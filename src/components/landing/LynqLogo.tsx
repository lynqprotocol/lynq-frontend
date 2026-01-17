import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export function LynqLogo({ className }: { className?: string }) {
    return (
        <div className={cn("relative flex items-center gap-4 select-none", className)}>
            {/* Integrated Glitch-Shield */}
            <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                {/* Main Gradient Shield */}
                <Shield
                    className="w-full h-full text-white z-10"
                    style={{
                        filter: "drop-shadow(0 0 10px rgba(138,46,255,0.8)) drop-shadow(0 0 20px rgba(0,240,255,0.4))"
                    }}
                    strokeWidth={1.5}
                />

                {/* Inner Gradient Mask (Simulated) */}
                <div className="absolute inset-2 rounded-b-full bg-gradient-to-br from-brand-ultraviolet/20 to-brand-cyan/20 blur-sm z-0" />

                {/* Glitch Slices (Absolute positioned over shield) */}
                <div className="absolute top-[20%] left-[-2px] w-[110%] h-[2px] bg-brand-cyan/80 animate-pulse" style={{ animationDuration: '3s' }} />
                <div className="absolute top-[60%] right-[-5px] w-[50%] h-[2px] bg-brand-ultraviolet/80 animate-pulse" style={{ animationDuration: '2s' }} />
                <div className="absolute top-[40%] left-[10px] w-2 h-2 bg-white blur-[1px] animate-pulse" />

                {/* Letter 'L' inside Shield (Implied by the logo description) */}
                <span className="absolute text-brand-cyan/50 font-bold text-2xl font-mono blur-[1px] z-20">L</span>
            </div>

            {/* LYNQ Text with Split Gradient */}
            <div className="relative">
                <h1 className="text-6xl md:text-8xl font-black tracking-widest font-sans glitch-text" data-text="LYNQ">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-ultraviolet via-[#A855F7] to-brand-cyan">
                        LYNQ
                    </span>
                </h1>

                {/* Pixel Artifacts */}
                <div className="absolute -bottom-2 -right-4 flex gap-1">
                    <div className="w-1.5 h-1.5 bg-brand-cyan/60" />
                    <div className="w-1.5 h-1.5 bg-brand-cyan/40" />
                    <div className="w-1.5 h-1.5 bg-brand-cyan/20" />
                </div>
            </div>
        </div>
    );
}
