import { router } from "@inertiajs/react";
import { CircleCheckBig, X } from "lucide-react";
import { useState } from "react";

interface Props {
    show: boolean;
    onClose: () => void;
}

const applicationLinks = {
    indigene: "/dashboard/applications/indigene",
    resident: "/dashboard/applications/resident",
    birth: "/dashboard/applications/birth",
    death: "/dashboard/applications/death",
};

export default function ApplicationModal({ show, onClose }: Props) {
    const [selectedApplication, setSelectedApplication] = useState("");

    const handleClose = () => {
        setSelectedApplication("");
        onClose();
    };

    const handleParentClose = (ev: React.MouseEvent<HTMLElement>) => {
        const target = ev.target as HTMLElement;
        if (target.tagName === "SECTION" && target.classList.contains("formData")) {
            handleClose();
        }
    };

    const handleProceed = () => {
        if (!selectedApplication) {
            alert("No application selected");
            return;
        }

        const link = applicationLinks[selectedApplication as keyof typeof applicationLinks];
        if (link) {
            router.visit(link);
            handleClose();
        }
    };

    return (
        <section
            onClick={handleParentClose}
            className={`formData w-full h-screen overflow-y-auto fixed top-0 left-0 bg-[#333333AA] backdrop-blur-xs transition-all duration-700 ${
                show ? "scale-100" : "scale-0"
            } cursor-pointer flex justify-center items-center p-4 z-[500]`}
        >
            <div
                className={`w-full md:max-w-[480px] bg-white transition-all duration-700 delay-200 ${
                    show ? "opacity-100" : "opacity-0"
                } cursor-default rounded-md overflow-hidden text-sm p-6`}
            >
                <div className="w-full flex justify-between items-center gap-4 border-b border-b-gray-200 pb-1 mb-6">
                    <h2 className="font-semibold text-zinc-600 text-lg">Select Application Type</h2>
                    <span
                        onClick={handleClose}
                        className="text-zinc-600 transition-colors hover:text-red-600 cursor-pointer"
                    >
                        <X size={24} />
                    </span>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {(Object.keys(applicationLinks) as Array<keyof typeof applicationLinks>).map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedApplication(type)}
                            className={`w-full flex justify-center items-center gap-3 flex-wrap border ${
                                selectedApplication === type
                                    ? "border-green-500 bg-green-500 text-white"
                                    : "border-green-200"
                            } transition-all rounded-md cursor-pointer py-2 px-4 capitalize`}
                        >
                            <span>{type} Application</span>
                            {selectedApplication === type ? <CircleCheckBig size={20} /> : null}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={handleProceed}
                    className="w-full rounded-md transition-colors bg-green-600 hover:bg-green-500 text-white text-center py-2 px-4"
                >
                    Proceed
                </button>
            </div>
        </section>
    );
}