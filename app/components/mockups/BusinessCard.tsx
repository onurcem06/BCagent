import React from 'react';

interface BusinessCardProps {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    font: string;
    logoText: string;
    tagline: string;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ primaryColor, secondaryColor, accentColor, font, logoText, tagline }) => {
    return (
        <div className="relative group perspective-1000">
            <div className="relative w-[280px] h-[160px] bg-white rounded-xl shadow-xl overflow-hidden transform transition-transform duration-500 group-hover:rotate-x-12 group-hover:rotate-y-12">
                {/* Background Pattern */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `radial-gradient(circle at 10% 20%, ${accentColor} 0%, transparent 20%), radial-gradient(circle at 90% 80%, ${primaryColor} 0%, transparent 20%)`
                    }}
                />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                    <div>
                        <div className="w-8 h-8 rounded-full mb-3" style={{ backgroundColor: primaryColor }}></div>
                        <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: font, color: primaryColor }}>
                            {logoText || "Brand Name"}
                        </h3>
                    </div>

                    <div className="space-y-1">
                        <div className="h-0.5 w-12 bg-gray-200 mb-2"></div>
                        <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">
                            {tagline || "Brand Tagline"}
                        </p>
                        <p className="text-[9px] text-gray-400">onur@example.com</p>
                    </div>
                </div>

                {/* Accent Strip */}
                <div className="absolute right-0 top-0 bottom-0 w-2" style={{ backgroundColor: accentColor }}></div>
            </div>
        </div>
    );
};
