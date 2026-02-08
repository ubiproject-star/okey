import React, { useEffect, useState } from 'react';

export const LandscapeEnforcer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

    useEffect(() => {
        const checkOrientation = () => {
            setIsPortrait(window.innerHeight > window.innerWidth);
        };

        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);

        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        };
    }, []);

    if (isPortrait) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
                <div className="mb-6 animate-bounce">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-24 w-24"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        style={{ transform: 'rotate(90deg)' }}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Lütfen Telefonu Çevirin</h2>
                <p className="text-gray-300">Okey en iyi yatay ekranda oynanır.</p>
            </div>
        );
    }

    return <>{children}</>;
};
