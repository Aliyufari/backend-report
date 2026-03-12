import profileImage from "@/assets/images/profile.png";
import { useState } from "react";
import PasswordUpdateForm from "./PasswordUpdateForm";
import useProfile from "@/hooks/useProfile";
import GlobalLoader from "@/pages/components/GlobalLoader";


export default function Profile() {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const { user, isLoading, error } = useProfile();

    if(isLoading){ return <GlobalLoader /> }
    if(error){
        return <p className="text-center text-secondary mt-10 px-6">{error}</p>
    }

    return (
        <>
            {/* Password Update */}
            <PasswordUpdateForm
                show={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
            />

            <h2 className="font-semibold md:text-lg text-zinc-600 mb-1">Profile Information</h2>
            <hr className="border-gray-300 mb-3" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="w-full h-max rounded-lg bg-white p-6">
                    <div className="w-[120px] h-[120px] rounded-full border border-gray-100 overflow-hidden mx-auto mb-4"
                        style={{
                            backgroundImage: `url("${profileImage}")`,
                            backgroundRepeat: "no-repeat",
                            backgroundSize: "cover"
                        }}
                    ></div>

                    <div className="overflow-hidden">
                        <table className="w-full">
                            <tbody className="text-left">
                                <tr className="bg-gray-50">
                                    <th className="text-zinc-600 p-4">First Name:</th>
                                    <td className="text-zinc-600 p-4">{user?.first_name}</td>
                                </tr>

                                <tr className="">
                                    <th className="text-zinc-600 p-4">Middle Name:</th>
                                    <td className="text-zinc-600 p-4">{user?.middle_name}</td>
                                </tr>

                                <tr className="bg-gray-50">
                                    <th className="text-zinc-600 p-4">Last Name:</th>
                                    <td className="text-zinc-600 p-4">{user?.last_name}</td>
                                </tr>
                                
                                <tr className="">
                                    <th className="text-zinc-600 p-4">Email Address:</th>
                                    <td className="text-zinc-600 p-4">{user?.email}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="w-full h-max rounded-lg bg-white flex justify-start items-center gap-6 flex-wrap p-6">
                    <button onClick={() => setShowPasswordModal(true)} type="button" className="rounded-md border border-green-500 text-green-500 hover:bg-green-600 hover:text-white transition-colors cursor-pointer py-2 px-4">
                        Update Password
                    </button>
                </div>
            </div>
        </>
    );
}
