'use client';

interface SuparPosLoadingProps {
    message?: string;
    fullScreen?: boolean;
}

export default function SuparPosLoading({ message = 'กำลังเตรียม SuparPOS', fullScreen = false }: SuparPosLoadingProps) {
    const containerClasses = fullScreen 
        ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF9F6] backdrop-blur-sm"
        : "w-full min-h-[300px] flex flex-col items-center justify-center bg-transparent py-10";

    return (
        <div className={containerClasses}>
            <div className="relative flex items-center justify-center mb-6">
                {/* Outer Ring with smooth spin */}
                <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                {/* Inner Glowing Center */}
                <div className="absolute w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center animate-pulse shadow-md">
                    <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                </div>
            </div>
            <p className="text-slate-600 font-extrabold text-base tracking-tight animate-pulse text-center px-4 font-sans">
                {message}
            </p>
        </div>
    );
}
