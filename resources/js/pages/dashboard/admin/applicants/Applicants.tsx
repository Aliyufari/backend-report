import { applications } from "@/data/data";
import useApplicants from "@/hooks/applicants/useApplicants";
import GlobalLoader from "@/pages/components/GlobalLoader";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";

export default function Applicants() {
    const { applicants, isLoading, error } = useApplicants();

    if(isLoading){ return <GlobalLoader /> }
    if(error){
        return <p className="text-center text-secondary mt-10 px-6">{error}</p>
    }

    console.log("Applicants: ", applicants);

    return (
        <>
            <h2 className="font-semibold md:text-lg text-zinc-600 mb-1">Applicants</h2>
            <hr className="border-gray-300 mb-3" />

            <div className="w-full overflow-x-auto pb-2 no-scrollbar">
                <table className="w-full whitespace-nowrap">
                    <thead>
                        <tr className="bg-[#2f3349] text-white text-left">
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">LGA</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            applications.map((application, index) => (
                                <tr
                                    key={application.id}
                                    className={`${(index + 1) % 2 === 0 ? "bg-red-50" : "bg-gray-50"}  transition-colors"`}
                                >
                                    <td className="text-zinc-600 p-4">
                                        {application.surname} {application.middle_name} {application.first_name}
                                    </td>
                                    <td className="text-zinc-600 p-4">
                                        {application.email}
                                    </td>
                                    <td className="text-zinc-600 p-4">
                                        {application.state}
                                    </td>
                                    <td className="text-zinc-600 p-4">
                                        <div className="flex items-center gap-3">
                                            <Link to={`${application.id}`} title="View Application" className="inline-block text-orange-500 transition-all">
                                                <Eye size={24} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}
