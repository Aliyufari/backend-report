/* eslint-disable @typescript-eslint/no-explicit-any */

import Spinner from "@/pages/components/Spinner";
import { updatePassword } from "@/services/backend.services";
import { Eye, EyeClosed, X } from "lucide-react";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";

interface Props {
    show: boolean;
    onClose: () => void;
}

interface FormDataProps {
    old_password: string;
    new_password: string;
    confirm_password: string;
}

export default function PasswordUpdateForm({ show, onClose }: Props) {
    const {register, handleSubmit, formState: { errors }, reset } = useForm<FormDataProps>();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleParentClose = (ev: any) => {
        const targetEl = ev.target as HTMLDivElement;
        if(targetEl.tagName === "SECTION" && targetEl.classList.contains("formData")){
            onClose();
            reset();
        }
    }

    const onSubmit: SubmitHandler<FormDataProps> = async (formData) => {
        if(loading){ return; }

        if(formData.new_password !== formData.confirm_password){
            toast.error("New password and confirm password do not match");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                old_password: formData.old_password,
                password: formData.new_password,
                password_confirmation: formData.confirm_password
            };
            const { data } = await updatePassword(payload);

            if(data.status){
                toast.success(data.message || "Password updated successfully");
                reset();
                onClose();
                return;
            }
            
            toast.error(data.message || "An error occurred");

        } catch (error: any) {
            toast.error(error.response ? error.response?.data?.message : error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section onClick={handleParentClose} className={`formData w-full h-screen overflow-y-auto fixed top-0 left-0 bg-[#333333AA] backdrop-blur-xs transition-all duration-700 ${show ? "scale-100" : "scale-0"} transition-all cursor-pointer flex justify-center items-center p-4 z-[500]`}>
            <div className={`w-full md:max-w-[400px] bg-white transition-all duration-700 delay-200 ${show ? "opacity-100" : "opacity-0"} cursor-default rounded-md overflow-hidden text-sm p-6`}>
                <div className="w-full flex justify-between items-center gap-4 border-b border-b-gray-200 pb-1 mb-6">
                    <h2 className="font-semibold text-zinc-600 text-lg">Password Update</h2>
                    <span onClick={onClose} className="text-zinc-600 transition-colors hover:text-red-600 cursor-pointer">
                        <X size={24} />
                    </span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
                    <div className="relative mb-4">
                        <label htmlFor="old_password" className="block w-full mb-1">Old Password:</label>
                        <input type={showPassword ? "text" : "password"} id="old_password"
                            className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-md outline-none focus:border-primary transition-colors"
                            placeholder="xxxxxxxx"
                            {...register("old_password", {required: true, minLength: 8})}
                            required
                        />
                        <span onClick={() => setShowPassword(!showPassword)} className="block w-[25px] h-[22px] absolute top-8 right-3 cursor-pointer text-gray-400 z-10">
                            {showPassword ? <EyeClosed size={24} /> : <Eye size={24} />}
                        </span>
                        {errors.old_password ? <p className="text-secondary mt-1">Old password field is required and should be at least 8 characters</p> : null}
                    </div>

                    <div className="relative mb-4">
                        <label htmlFor="new_password" className="block w-full mb-1">New Password:</label>
                        <input type={showPassword ? "text" : "password"} id="new_password"
                            className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-md outline-none focus:border-primary transition-colors"
                            placeholder="xxxxxxxx"
                            {...register("new_password", {required: true, minLength: 8})}
                            required
                        />
                        <span onClick={() => setShowPassword(!showPassword)} className="block w-[25px] h-[22px] absolute top-8 right-3 cursor-pointer text-gray-400 z-10">
                            {showPassword ? <EyeClosed size={24} /> : <Eye size={24} />}
                        </span>
                        {errors.new_password ? <p className="text-secondary mt-1">New password field is required and should be at least 8 characters</p> : null}
                    </div>

                    <div className="relative mb-4">
                        <label htmlFor="confirm_password" className="block w-full mb-1">Confirm Password:</label>
                        <input type={showPassword ? "text" : "password"} id="confirm_password"
                            className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-md outline-none focus:border-primary transition-colors"
                            placeholder="xxxxxxxx"
                            {...register("confirm_password", {required: true, minLength: 8})}
                            required
                        />
                        <span onClick={() => setShowPassword(!showPassword)} className="block w-[25px] h-[22px] absolute top-8 right-3 cursor-pointer text-gray-400 z-10">
                            {showPassword ? <EyeClosed size={24} /> : <Eye size={24} />}
                        </span>
                        {errors.confirm_password ? <p className="text-secondary mt-1">Confirm password field is required and should be at least 8 characters</p> : null}
                    </div>

                    <div className="flex justify-start items-center">
                        <button className="rounded-md bg-green-500 text-white hover:bg-green-600 cursor-pointer transition-colors flex justify-center items-center gap-1 py-2 px-3">
                            {loading ? <Spinner /> : null}
                            <span>Update Password</span>
                        </button>
                    </div>
                </form>
            </div>
        </section>
    )
}
