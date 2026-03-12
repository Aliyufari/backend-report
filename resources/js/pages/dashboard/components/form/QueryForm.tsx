/* eslint-disable @typescript-eslint/no-explicit-any */

import Spinner from "@/pages/components/Spinner";
import { X } from "lucide-react";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";

interface Props {
    show: boolean;
    onClose: () => void;
}

interface FormDataProps {
    message: string;
}

export default function QueryForm({ show, onClose }: Props) {
    const {register, handleSubmit, formState: { errors }, reset } = useForm<FormDataProps>();
    const [loading, setLoading] = useState(false);

    const handleParentClose = (ev: any) => {
        const targetEl = ev.target as HTMLDivElement;
        if(targetEl.tagName === "SECTION" && targetEl.classList.contains("formData")){
            onClose();
        }
    }

    const onSubmit: SubmitHandler<FormDataProps> = async (formData) => {
        console.log("Form data: ", formData);
        if(loading){ return; }

        setLoading(true);
        toast.success("Application rejected");
        setTimeout(() => {
            setLoading(false);
            reset();
            onClose();
        }, 3000);
    }

    return (
        <section onClick={handleParentClose} className={`formData w-full h-screen overflow-y-auto fixed top-0 left-0 bg-[#333333AA] backdrop-blur-xs transition-all duration-700 ${show ? "scale-100" : "scale-0"} transition-all cursor-pointer flex justify-center items-center p-4 z-[500]`}>
            <div className={`w-full md:max-w-[400px] bg-white transition-all duration-700 delay-200 ${show ? "opacity-100" : "opacity-0"} cursor-default rounded-md overflow-hidden text-sm p-6`}>
                <div className="w-full flex justify-between items-center gap-4 border-b border-b-gray-200 pb-1 mb-6">
                    <h2 className="font-semibold text-zinc-600 text-lg">Rejection Form</h2>
                    <span onClick={onClose} className="text-zinc-600 transition-colors hover:text-red-600 cursor-pointer">
                        <X size={24} />
                    </span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
                    <div>
                        <label htmlFor="message" className="block mb-1">Message to Applicant:</label>
                        <textarea id="message"
                            className="w-full h-[100px] border border-gray-300 focus:border-green-500 transition-all outline-none rounded-md placeholder:text-zinc-400 resize-none py-2 px-3"
                            placeholder="Message..."
                            {...register("message", {required: true})}
                            required
                        />
                        {errors.message ? <p className="text-secondary mt-1">Message field is required</p> : null}
                    </div>

                    <div className="flex justify-start items-center">
                        <button className="rounded-md bg-green-500 text-white hover:bg-green-600 cursor-pointer transition-colors flex justify-center items-center gap-1 py-2 px-3">
                            {loading ? <Spinner /> : null}
                            <span>Reject Applicant</span>
                        </button>
                    </div>
                </form>
            </div>
        </section>
    )
}
