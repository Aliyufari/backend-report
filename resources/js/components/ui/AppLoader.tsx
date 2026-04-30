import { Loader } from 'lucide-react';

export default function AppLoader() {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center
                bg-black/25"
        >
            <div
                className="flex items-center justify-center
                    w-20 h-20 rounded-full
                    bg-background/85 border border-border
                    shadow-xl"
            >
                <Loader
                    size={38}
                    className="text-primary animate-spin"
                />
            </div>
        </div>
    );
}