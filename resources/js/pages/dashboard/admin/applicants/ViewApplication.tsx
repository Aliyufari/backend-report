/* eslint-disable react-hooks/exhaustive-deps */
import GlobalLoader from "@/pages/components/GlobalLoader";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { applications } from "@/data/data";
import type { Application } from "@/pages/types/types";
import { toast } from "react-toastify";
import profileImage from "@/assets/images/profile.png";
import Modal from "@/pages/components/Modal";
import QueryForm from "../../components/form/QueryForm";
import { MoveLeft } from "lucide-react";

export default function ViewApplication() {
    const { application_id } = useParams();
    const [applicant, setApplicant] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [verifyInfo, setVerifyInfo] = useState({
        show: false,
        loading: false,
        id: ""
    });
    const [queryInfo, setQueryInfo] = useState({
        show: false,
        id: ""
    });

    useEffect(() => {

        const aplt = applications.find(apt => apt.id === application_id);
        if(aplt){
            setApplicant(aplt);
            setLoading(false);
        } else {
            toast.error("Invalid identification.");
            navigate("/dashboard/applications");
        }

    }, [application_id]);

    const handleVerify = () => {
        if(verifyInfo.loading){ return; }

        setVerifyInfo({...verifyInfo, loading: true});
        toast.success("Application sent for approval.");
        return setTimeout(() => {
            setVerifyInfo({
                ...verifyInfo,
                show: false,
                loading: false,
                id: ""
            });
            navigate("/dashboard/applicants");
        }, 3000);
    }

    if(loading){ return <GlobalLoader />; }

    return (
        <>
            {/* Verify Confirmation Modal */}
            <Modal
                show={verifyInfo.show}
                message="Are you sure you want to send applicant for approval?"
                loading={verifyInfo.loading}
                onClose={() =>  setVerifyInfo({...verifyInfo, show: false, loading: false, id: ""})}
                onProceed={handleVerify}
            />

            {/* Query Form */}
            <QueryForm
                show={queryInfo.show}
                onClose={() => setQueryInfo({...queryInfo, id: "", show: false})}
            />

            <div className="flex justify-start items-center mb-4">
                <Link to="/dashboard/applicants" className="flex items-center gap-1 text-zinc-500 transition-colors hover:text-orange-500">
                    <MoveLeft size={24} />
                    <span>Back</span>
                </Link>
            </div>
        
            <div className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="w-full h-max rounded-lg bg-white p-6">
                        <h2 className="font-semibold md:text-lg text-zinc-600 mb-1">Applicant's Information</h2>
                        <hr className="border-gray-300 mb-3" />

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
                                        <td className="text-zinc-600 p-4">{applicant?.first_name}</td>
                                    </tr>
                                    
                                    <tr className="">
                                        <th className="text-zinc-600 p-4">Middle Name:</th>
                                        <td className="text-zinc-600 p-4">{applicant?.middle_name}</td>
                                    </tr>
                                    
                                    <tr className="bg-gray-50">
                                        <th className="text-zinc-600 p-4">Surname Name:</th>
                                        <td className="text-zinc-600 p-4">{applicant?.surname}</td>
                                    </tr>
                                    
                                    <tr className="">
                                        <th className="text-zinc-600 p-4">Email Address:</th>
                                        <td className="text-zinc-600 p-4">{applicant?.email}</td>
                                    </tr>
                                    
                                    <tr className="bg-gray-50">
                                        <th className="text-zinc-600 p-4">Gender:</th>
                                        <td className="text-zinc-600 p-4">{applicant?.gender}</td>
                                    </tr>
                                    
                                    <tr className="">
                                        <th className="text-zinc-600 p-4">Date of Birth:</th>
                                        <td className="text-zinc-600 p-4">{applicant?.dob}</td>
                                    </tr>
                                    
                                    <tr className="">
                                        <th className="text-zinc-600 p-4">LGA:</th>
                                        <td className="text-zinc-600 p-4">{applicant?.lga}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="w-full h-max rounded-lg bg-white p-6">
                            <h2 className="font-semibold md:text-lg text-zinc-600 mb-1">Applicant Father's Information</h2>
                            <hr className="border-gray-300 mb-3" />

                            <div className="overflow-hidden">
                                <table className="w-full">
                                    <tbody className="text-left">
                                        <tr className="bg-gray-50">
                                            <th className="text-zinc-600 p-4">First Name:</th>
                                            <td className="text-zinc-600 p-4">{applicant?.father_first_name}</td>
                                        </tr>
                                        
                                        <tr className="">
                                            <th className="text-zinc-600 p-4">Middle Name:</th>
                                            <td className="text-zinc-600 p-4">{applicant?.father_middle_name}</td>
                                        </tr>
                                        
                                        <tr className="bg-gray-50">
                                            <th className="text-zinc-600 p-4">Surname Name:</th>
                                            <td className="text-zinc-600 p-4">{applicant?.father_surname}</td>
                                        </tr>
                                        
                                        <tr className="">
                                            <th className="text-zinc-600 p-4">Phone Number:</th>
                                            <td className="text-zinc-600 p-4">{applicant?.father_phone}</td>
                                        </tr>

                                        <tr className="bg-gray-50">
                                            <th className="text-zinc-600 p-4">Father NIN:</th>
                                            <td className="text-zinc-600 p-4">{applicant?.father_nin}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="w-full h-max rounded-lg bg-white p-6">
                            <h2 className="font-semibold md:text-lg text-zinc-600 mb-1">Applicant Mother's Information</h2>
                            <hr className="border-gray-300 mb-3" />

                            <div className="overflow-hidden">
                                <table className="w-full">
                                    <tbody className="text-left">
                                        <tr className="bg-gray-50">
                                            <th className="text-zinc-600 p-4">First Name:</th>
                                            <td className="text-zinc-600 p-4">{applicant?.mother_first_name}</td>
                                        </tr>
                                        
                                        <tr className="">
                                            <th className="text-zinc-600 p-4">Surname Name:</th>
                                            <td className="text-zinc-600 p-4">{applicant?.mother_surname}</td>
                                        </tr>
                                        
                                        <tr className="bg-gray-50">
                                            <th className="text-zinc-600 p-4">Phone Number:</th>
                                            <td className="text-zinc-600 p-4">{applicant?.mother_phone}</td>
                                        </tr>
                                        
                                        <tr className="">
                                            <th className="text-zinc-600 p-4">Phone NIN:</th>
                                            <td className="text-zinc-600 p-4">{applicant?.mother_nin}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg flex justify-start items-center gap-4 flex-wrap bg-white p-6">
                    <button type="button" onClick={() => setVerifyInfo({...verifyInfo, show: true, id: application_id!})} className="rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors cursor-pointer py-2 px-4">
                        Verify and Send for Approval
                    </button>

                    <button type="button" onClick={() => setQueryInfo({...queryInfo, show: true, id: application_id!})} className="rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors cursor-pointer py-2 px-4">
                        Reject Applicant
                    </button>
                </div>
            </div>
        </>
    );
}
