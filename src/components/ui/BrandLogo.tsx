import Image from "next/image";
import React from "react";

interface BrandLogoProps {
    className?: string;
    iconSize?: number;
    textSize?: { width: number; height: number };
}

export function BrandLogo({
    className = "",
    iconSize = 40,
    textSize = { width: 100, height: 32 } // Approximate ratio for text
}: BrandLogoProps) {
    return (
        <div className={`flex items-center ${className}`}>
            <Image
                src="/logo_icon_copy.png"
                alt="Lynq Icon"
                width={iconSize}
                height={iconSize}
                className="object-contain" // Changed from rounded to object-contain, assuming the png has transparency and shape
                priority
            />
            <Image
                src="/logo_text_copy.png"
                alt="Lynq"
                width={textSize.width}
                height={textSize.height}
                className="object-contain"
                priority
            />
        </div>
    );
}
