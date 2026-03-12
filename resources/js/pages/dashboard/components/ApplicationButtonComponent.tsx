import { SquarePen } from "lucide-react";
import { useState } from "react";
import ApplicationModal from "./ApplicationModal";

type Props = {
    className?: string;
}

export default function ApplicationButtonComponent({ className }: Props) {
    const [showAppModal, setShowAppModal] = useState(false);
  
    return (
        <>
            {/* Application Type Modal */}
            <ApplicationModal
                show={showAppModal}
                onClose={() => setShowAppModal(false)}
            />

            <button onClick={() => setShowAppModal(true)}
                className={`flex justify-center items-center gap-2 rounded-md bg-green-600 text-white text-xs hover:bg-green-500 transition-colors cursor-pointer py-2 px-5 ${className}`}
            >
                <SquarePen size={16} />
                <span>Apply</span>
            </button>
        </>
    )
}
