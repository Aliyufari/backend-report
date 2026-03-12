import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function MyApplications() {
    const myAppts = [
        {
            id: "KSN-0001",
            application_type: "indigene",
            status: "completed"
        },
        {
            id: "KSN-0002",
            application_type: "birth",
            status: "pending"
        }
    ];
  
    return (
        <>
            <h2 className="font-semibold md:text-lg text-zinc-600 mb-1">My Applications</h2>
            <hr className="border-gray-300 mb-3" />

            <div className="w-full overflow-x-auto pb-2 no-scrollbar">
                <table className="w-full whitespace-nowrap">
                    <thead>
                        <tr className="bg-[#2f3349] text-white text-left">
                            <th className="p-4">Application Type</th>
                            <th className="p-4">Status</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            myAppts.map((appt, index) => (
                                <tr
                                    key={appt.id}
                                    className={`${(index + 1) % 2 === 0 ? "bg-red-50" : "bg-gray-50"}  transition-colors"`}
                                >
                                    <td className="text-zinc-600 p-4 capitalize">
                                        {appt.application_type}
                                    </td>
                                    <td className="text-zinc-600 p-4 capitalize">
                                        <span className={`${appt.status === "completed" ? "text-green-500" : "text-orange-500"}`}>{appt.status}</span>
                                    </td>
                                    <td className="text-zinc-600 p-4">
                                        <div className="flex items-center gap-3">
                                            {
                                                appt.status === "completed" ? (
                                                    <Link to={`${appt.id}`} title="View Applicaton" className="inline-block hover:text-blue-500 transition-all">
                                                        <Eye size={24} />
                                                    </Link>
                                                ) : (
                                                    <Link to="/dashboard/applications/indigene" onClick={() => toast.info("Proceed to payment if not paid or back to application form.")} title="Continue Applicaton" className="inline-block text-blue-500 hover:underline underline-offset-2 transition-all">
                                                        Continue
                                                    </Link>
                                                )
                                            }
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
