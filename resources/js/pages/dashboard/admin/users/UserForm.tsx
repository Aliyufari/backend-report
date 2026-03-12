/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import useLGAs from "@/hooks/useLGAs";
import useRoles from "@/hooks/useRoles";
import useMutateUser from "@/hooks/users/useMutateUser";
import SelectOptionComponent from "@/pages/components/SelectOptionComponent";
import Spinner from "@/pages/components/Spinner";
import type { Session } from "@/pages/types/types";
import { Eye, EyeOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";

interface Props {
    show: boolean;
    onClose: () => void;
    user?: Session["user"];
}

type UserProps = {
    "first_name": string;
    "middle_name": string | null;
    "last_name": string;
    "email": string;
    "phone": string;
    "role": string;
    "created_at": string;
    "updated_at": string;
    "password"?: string;
    "lga": string;
}


export default function UserForm({ show, onClose, user }: Props) {
    const {register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<UserProps>();
    const [showPassword, setShowPassword] = useState(false);
    const formValues = watch();
    const { roles, isLoading, error } = useRoles();
    const { lgas, isLoading: isLgaLoading, error: lgaError } = useLGAs();
    
    const userMutation = useMutateUser({
        onError: (message: string) => { toast.error(message); },
        onSuccess: (message: string) => { 
            toast.success(message);
            handleClose();
        }
    });


    useEffect(() => {

        if(user?.id){
            setValue("first_name", user.first_name);
            setValue("last_name", user.last_name);
            setValue("email", user.email);
            setValue("phone", user.phone);
            setValue("role", user.role);
            setValue("lga", user?.lga?.name || "");
        }

    }, [user]);

    useEffect(() => {

        if(error){ toast.error(error); }
        if(lgaError){ toast.error(lgaError); }

    }, [error, lgaError]);


    const handleParentClose = (ev: any) => {
        const targetEl = ev.target as HTMLDivElement;
        if(targetEl.tagName === "SECTION" && targetEl.classList.contains("formData")){
            onClose();
            reset();
        }
    }

    const handleClose = () => {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<UserProps> = async (formData) => {
        if(userMutation.isPending){ return; }

        try {
            const payload: any = {
                ...formData,
                role_id: roles.find(r => r.name === formData.role)?.id || "",
                lga_id: lgas.find(l => l.name === formData.lga)?.id || ""
            };
            
            delete payload.lga; // Remove lga from payload as we are sending lga_id
            delete payload.role; // Remove role from payload as we are sending role_id

            if(user?.id){ payload.id = user.id; }

            userMutation.mutate(payload);

        } catch (error: any) {
            if(error.code === "ERR_NETWORK" || error.code === "ECONNABORTED"){ 
                toast.error("Network error, check your internet connection!"); 
            } else {
                toast.error(error.response?.data?.message || error.message);
            }
        }
    }


    return (
        <section onClick={handleParentClose} className={`formData w-full h-screen overflow-y-auto fixed top-0 left-0 bg-[#333333AA] backdrop-blur-xs transition-all duration-700 ${show ? "scale-100" : "scale-0"} transition-all cursor-pointer flex justify-center items-start md:items-center p-4 z-[500]`}>
            <div className={`w-full md:max-w-[480px] bg-white transition-all duration-700 delay-200 ${show ? "opacity-100" : "opacity-0"} cursor-default rounded-md overflow-hidden text-sm p-6`}>
                <div className="w-full flex justify-between items-center gap-4 border-b border-b-gray-200 pb-1 mb-6">
                    <h2 className="font-semibold text-zinc-600 text-lg">{user?.id ? "Edit" : "Add"} User</h2>
                    <span onClick={handleClose} className="text-zinc-600 transition-colors hover:text-red-600 cursor-pointer">
                        <X size={24} />
                    </span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label htmlFor="first_name" className="block mb-1">First Name:</label>
                            <input type="text" id="first_name"
                                className="w-full border border-gray-300 focus:border-green-500 transition-all outline-none rounded-md placeholder:text-zinc-400 py-2 px-3"
                                placeholder="John Doe"
                                {...register("first_name", {required: true})}
                                required
                            />
                            {errors.first_name ? <p className="text-secondary mt-1">First name is required</p> : null}
                        </div>

                        <div>
                            <label htmlFor="last_name" className="block mb-1">Last Name:</label>
                            <input type="text" id="last_name"
                                className="w-full border border-gray-300 focus:border-green-500 transition-all outline-none rounded-md placeholder:text-zinc-400 py-2 px-3"
                                placeholder="John Doe"
                                {...register("last_name", {required: true})}
                                required
                            />
                            {errors.last_name ? <p className="text-secondary mt-1">Last name is required</p> : null}
                        </div>
                    </div>

                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label htmlFor="email" className="block mb-1">Email:</label>
                            <input type="email" id="email"
                                className="w-full border border-gray-300 focus:border-green-500 transition-all outline-none rounded-md placeholder:text-zinc-400 py-2 px-3"
                                placeholder="johndoe@email.com"
                                {...register("email", {required: true})}
                                required
                            />
                            {errors.email ? <p className="text-secondary mt-1">Email field is required</p> : null}
                        </div>

                        <div>
                            <label htmlFor="phone" className="block mb-1">Phone:</label>
                            <input type="phone" id="phone"
                                className="w-full border border-gray-300 focus:border-green-500 transition-all outline-none rounded-md placeholder:text-zinc-400 py-2 px-3"
                                placeholder="09090009000"
                                {...register("phone", {required: true})}
                                required
                            />
                            {errors.phone ? <p className="text-secondary mt-1">Phone number is required</p> : null}
                        </div>
                    </div>

                    <div className="relative mb-6">
                        {
                            isLoading ? <Spinner color="green" /> : (
                                <>
                                    <input type="hidden" id="role" {...register("role", {required: true})} required />
                                    <SelectOptionComponent
                                        selected={formValues.role}
                                        handleChange={(role) => setValue("role", role as string)}
                                        options={roles.map(r => r.name).filter(r => r.toLowerCase() !== "super_admin")}
                                        optionOffset="-top-40"
                                        label="Role:"
                                    />
                                    {errors.role ? <p className="text-secondary mt-1">Role field is required</p> : null}
                                </>
                            )
                        }
                    </div>

                    <div className="relative mb-6">
                        {
                            isLgaLoading ? <Spinner color="green" /> : (
                                <>
                                    <input type="hidden" id="lga" {...register("lga", {required: true})} required />
                                    <SelectOptionComponent
                                        selected={formValues.lga || ""}
                                        handleChange={(lga) => setValue("lga", lga as string)}
                                        options={lgas.map(lga => lga.name)}
                                        optionOffset="-top-64"
                                        label="LGA:"
                                    />
                                    {errors.lga ? <p className="text-secondary mt-1">LGA field is required</p> : null}
                                </>
                            )
                        }
                    </div>

                    {/* Show password input only adding new user */}
                    {
                        show && !user?.id ? (
                            <div className="relative mb-6">
                                <label htmlFor="password" className="block mb-1">Password</label>
                                <input type={showPassword ? "text" : "password"} id="password"
                                    className="w-full border border-gray-300 focus:border-green-500 transition-colors outline-none rounded-md placeholder:text-zinc-400 py-2 pl-4 pr-9"
                                    placeholder="xxxxxxxxx"
                                    {...register("password", {required: true})}
                                    required
                                />

                                <span onClick={() => setShowPassword(!showPassword)} className="inline-block w-4 h-4 absolute top-[35px] right-3 cursor-pointer z-10">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </span>
                                {errors.password ? <p className="text-red-500 mt-1">Password field is required and must be at least 8 characters</p> : null}
                            </div>
                        ) : null
                    }

                    <button className="w-full rounded-md bg-green-600 text-white hover:bg-green-500 cursor-pointer transition-colors flex justify-center items-center gap-1 py-2 px-3">
                        {userMutation.isPending ? <Spinner /> : null}
                        <span>{user?.id ? "Update" : "Add"} User</span>
                    </button>
                </form>
            </div>
        </section>
    )
}
