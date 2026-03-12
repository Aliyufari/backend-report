/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";

interface Props {
    show: boolean;
    onProceed: () => void;
    onClose: () => void;
    message: string;
    loading: boolean;
}

export default function Modal({ show, onClose, onProceed, loading, message }: Props) {
 
    const handleClose = (ev: any) => {
        const targetEl = ev.target as HTMLDivElement;
        if(targetEl.tagName === "SECTION" && targetEl.classList.contains("modal")){
            onClose();
        }
    }

    return (
        <section onClick={handleClose} className={`modal w-full h-screen bg-[#333333AA] backdrop-blur-xs fixed top-0 left-0 flex justify-center items-center cursor-pointer transition-all duration-500 ${show ? "translate-y-0 opacity-100" : "-translate-y-[120vh] opacity-0"} p-6 z-[100]`}>
            <div className={`w-full max-w-[400px] bg-white rounded-md cursor-default transition-all duration-500 delay-500 ${show ? "opacity-100" : "opacity-0"} p-8`}>
                <h2 className="font-semibold text-sm md:text-lg text-center mb-6">{message}</h2>
                <div className="flex justify-center items-center gap-4 flex-wrap">
                    <button disabled={loading} type="button" onClick={onClose} className="rounded bg-red-500 text-white opacity-90 hover:opacity-100 transition-colors cursor-pointer py-2 px-4">No, Cancel</button>

                    <button disabled={loading} onClick={onProceed} type="button" className="rounded bg-green-500 hover:bg-green-600 text-white transition-colors cursor-pointer flex justify-center items-center gap-1 py-2 px-4">
                        {loading ? <span className="inline-block w-4 min-w-4 h-4 rounded-full animate-spin"> <Loader size={16} /> </span> : null}
                        <span>Yes, Proceed</span>
                    </button>
                </div>
            </div>
        </section>
    )
}
