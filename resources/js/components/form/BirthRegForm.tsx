/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import profileImageIcon from "@/assets/images/profile.png";
import { applications } from "@/data/data";
import SelectOptionComponent from "@/pages/components/SelectOptionComponent";
import { Camera, MoveLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

type FormProps = {
  surname: string;
  first_name: string;
  middle_name: string;
  lga: string;
  ward: string;
  address: string;
  gender: string;
  nin: string;
  dob: string;
  phone_number: string;
  next_of_kin: string;
}

export default function BirthRegForm() {
    const {register, handleSubmit, formState: { errors }, watch, setValue} = useForm<FormProps>();
    const [files, setFiles] = useState<File[]>([]);
    const formValues = watch();
    const [searchParams, setSearchParams] = useSearchParams();


    useEffect(() => {

        const indigene_id = searchParams.get("indigene_id");
        if(indigene_id){
            const ind = applications.find(cert => cert.id === indigene_id);
            if(ind){
                setValue("surname", ind.surname);
                setValue("first_name", ind.first_name);
                setValue("middle_name", ind.middle_name || "");
                setValue("gender", ind.gender);
                setValue("dob", ind.dob);
                return;
            }

            searchParams.delete("id");
            setSearchParams(searchParams);
        }

    }, []);


    const handleFileUpload = (ev: any) => {
        const file: File = ev.target.files[0];
        if(!file){ return; }
        if(!file.type.startsWith("image/")){
        return toast.error("Only image is required");
        }
        setFiles([file]);
    }

    const onSubmit: SubmitHandler<FormProps> = (formData) => {
        console.log("Form data: ", formData);
    }

    const handleImageError = (ev: any) => ev.target.src = profileImageIcon;

    return (
        <>
            <h2 className="font-semibold md:text-lg text-zinc-600 mb-1">Birth Application Form</h2>
            <hr className="border-gray-300 mb-3" />

            <div className="flex justify-start items-center mb-4">
                <Link to="/dashboard/my-applications" className="flex items-center gap-1 text-zinc-500 transition-colors hover:text-orange-500">
                    <MoveLeft size={24} />
                    <span>Back</span>
                </Link>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="relative w-full bg-white rounded-lg p-8 mb-4">
                {/* File Upload */}
                <div className="relative w-[100px] h-[100px] md:w-[150px] md:h-[150px] border bg-gray-200 hover:bg-gray-100 transition-colors rounded-full mx-auto cursor-pointer overflow-hidden flex justify-center items-center mb-8 md:mb-14">
                    <Camera size={40} className="text-gray-400" />
                    
                    {
                        files.length ? (
                            <img src={URL.createObjectURL(files[0])} alt="Photo" onError={handleImageError}
                                className="w-full h-full object-cover absolute top-0 left-0 z-10" 
                            />
                        ) : null
                    }

                    <input type="file"
                        className="w-full h-full absolute top-0 left-0 opacity-0 cursor-pointer z-20"
                        onChange={handleFileUpload}
                    />
                </div>

                {/* Form Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                    <div>
                        <label htmlFor="surname" className="block w-full mb-1">Surname</label>
                        <input type="text" id="surname"
                            className="w-full py-2 px-4 border rounded-md outline-none focus:border-primary transition-colors"
                            placeholder="Doe"
                            // {...register("surname", {required: true})}
                            // required
                        />
                        {/* {errors.surname ? <p className="text-secondary mt-1">Surname is required</p> : null} */}
                    </div>

                    <div>
                        <label htmlFor="first_name" className="block w-full mb-1">First Name</label>
                        <input type="text" id="first_name"
                            className="w-full py-2 px-4 border rounded-md outline-none focus:border-primary transition-colors"
                            placeholder="Doe"
                            {...register("first_name", {required: true})}
                            required
                        />
                        {errors.first_name ? <p className="text-secondary mt-1">First name is required</p> : null}
                    </div>

                    <div>
                        <label htmlFor="middle_name" className="block w-full mb-1">Middle Name</label>
                        <input type="text" id="middle_name"
                            className="w-full py-2 px-4 border rounded-md outline-none focus:border-primary transition-colors"
                            placeholder="Doe"
                            {...register("middle_name")}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                    <div>
                        <label htmlFor="mother_maiden_name" className="block w-full mb-1">Mother Maiden Name</label>
                        <input type="text" id="mother_maiden_name"
                            className="w-full py-2 px-4 border rounded-md outline-none focus:border-primary transition-colors"
                            placeholder="Doe"
                            // {...register("mother_maiden_name", {required: true})}
                            // required
                        />
                        {/* {errors.mother_maiden_name ? <p className="text-secondary mt-1">Mother maiden name is required</p> : null} */}
                    </div>

                    <div>
                        <input type="text" id="lga" className="hidden" {...register("lga", {required: true})} />
                        <SelectOptionComponent
                            selected={formValues.lga || ""}
                            handleChange={(value) => setValue("lga", value as string)}
                            options={["LGA1", "LGA2"]}
                            label="L.G.A:"
                            className="bg-white"
                        />
                        {errors.lga ? <p className="text-secondary mt-1">L.G.A is required</p> : null}
                    </div>

                    <div>
                        <input type="text" id="ward" className="hidden" {...register("ward", {required: true})} />
                        <SelectOptionComponent
                            selected={formValues.ward || ""}
                            handleChange={(value) => setValue("ward", value as string)}
                            options={["Ward I", "Ward II"]}
                            label="Ward"
                            className="bg-white"
                        />
                        {errors.ward ? <p className="text-secondary mt-1">Ward is required</p> : null}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                    <div>
                        <input type="text" id="gender" className="hidden" {...register("gender", {required: true})} />
                        <SelectOptionComponent
                            selected={formValues.gender || ""}
                            handleChange={(value) => setValue("gender", value as string)}
                            options={["Male", "Female"]}
                            label="Gender"
                            className="bg-white"
                        />
                        {errors.gender ? <p className="text-secondary mt-1">Gender is required</p> : null}
                    </div>

                    <div>
                        <label htmlFor="dob" className="block w-full mb-1">Date of Birth</label>
                        <input type="date" id="dob"
                            className="w-full py-2 px-4 border rounded-md outline-none focus:border-primary transition-colors"
                            {...register("dob", {required: true})}
                            required
                        />
                        {errors.dob ? <p className="text-secondary mt-1">Date of birth is required</p> : null}
                    </div>

                    <div>
                        <label htmlFor="nin" className="block w-full mb-1">NIN</label>
                        <input type="text" id="nin"
                            className="w-full py-2 px-4 border rounded-md outline-none focus:border-primary transition-colors"
                            placeholder="121234342312"
                            {...register("nin", {required: true, minLength: 11, maxLength: 11})}
                            required
                        />
                        {errors.nin ? <p className="text-secondary mt-1">NIN number is required and should be 11 characters</p> : null}
                    </div>

                    <div>
                        <label htmlFor="phone_number" className="block w-full mb-1">Phone Number</label>
                        <input type="text" id="phone_number"
                            className="w-full py-2 px-4 border rounded-md outline-none focus:border-primary transition-colors"
                            placeholder="08080009000"
                            {...register("phone_number", {required: true})}
                            required
                        />
                        {errors.phone_number ? <p className="text-secondary mt-1">Phone number is required</p> : null}
                    </div>

                    <div>
                        <label htmlFor="next_of_kin" className="block w-full mb-1">Next of Kin:</label>
                        <input type="text" id="next_of_kin"
                            className="w-full py-2 px-4 border rounded-md outline-none focus:border-primary transition-colors"
                            placeholder="08080009000"
                            {...register("next_of_kin", {required: true})}
                            required
                        />
                        {errors.next_of_kin ? <p className="text-secondary mt-1">Next of kin is required</p> : null}
                    </div>
                </div>

                <div className="mb-8">
                    <label htmlFor="address" className="block w-full mb-1">Address</label>
                    <textarea id="address" className="w-full h-32 resize-none py-2 px-4 border rounded-md outline-none focus:border-primary transition-colors"
                        placeholder="Address"
                        {...register("address", {required: true})}
                    ></textarea>
                    {errors.address ? <p className="text-secondary mt-1">Address is required</p> : null}
                </div>

                <button className="rounded-md bg-green-600 hover:bg-green-500 text-white py-2 px-6 cursor-pointer transition-colors flex justify-center items-center gap-1">
                    <span>Create</span>
                </button>
            </form>
        </>
    )
}
