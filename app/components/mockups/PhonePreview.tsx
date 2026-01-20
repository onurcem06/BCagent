import React from 'react';

interface PhonePreviewProps {
    children: React.ReactNode;
}

export const PhonePreview: React.FC<PhonePreviewProps> = ({ children }) => {
    return (
        <div className="relative mx-auto border-gray-800 bg-gray-800 border-[8px] rounded-[1.5rem] h-[300px] w-[160px]">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-[5px] left-1/2 -translate-x-1/2 h-[12px] w-[40px] bg-black rounded-lg z-10"></div>

            {/* Side Buttons */}
            <div className="h-[24px] w-[2px] bg-gray-800 absolute -start-[10px] top-[40px] rounded-s-lg"></div>
            <div className="h-[36px] w-[2px] bg-gray-800 absolute -start-[10px] top-[70px] rounded-s-lg"></div>
            <div className="h-[36px] w-[2px] bg-gray-800 absolute -start-[10px] top-[110px] rounded-s-lg"></div>
            <div className="h-[48px] w-[2px] bg-gray-800 absolute -end-[10px] top-[90px] rounded-e-lg"></div>

            <div className="rounded-[1rem] overflow-hidden w-full h-full bg-white relative">
                {children}
            </div>
        </div>
    );
};
