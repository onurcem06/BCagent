import React from 'react';

interface MacbookPreviewProps {
    children: React.ReactNode;
}

export const MacbookPreview: React.FC<MacbookPreviewProps> = ({ children }) => {
    return (
        <div className="relative mx-auto mt-4 max-w-[90%]">
            {/* Lid */}
            <div className="relative mx-auto border-gray-800 bg-gray-800 border-[8px] rounded-t-xl h-[172px] md:h-[210px] w-full md:w-[350px]">
                <div className="rounded-lg overflow-hidden h-[156px] md:h-[194px] bg-white"> {/* Screen Area */}
                    {children}
                </div>
                {/* Camera */}
                <div className="absolute top-[2px] left-1/2 -translate-x-1/2 h-1.5 w-1.5 bg-gray-700 rounded-full"></div>
            </div>
            {/* Bottom */}
            <div className="relative mx-auto bg-gray-900 rounded-b-xl rounded-t-sm h-[12px] md:h-[14px] w-full md:w-[380px]">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[50px] h-[3px] bg-gray-800 rounded-b-lg"></div>
            </div>
        </div>
    );
};
