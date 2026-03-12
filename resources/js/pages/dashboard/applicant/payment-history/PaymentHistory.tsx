import { Link } from "react-router-dom"

export default function PaymentHistory() {
    const myAppts = [
        {
            id: "1",
            application_type: "indigene",
            status: "successful"
        },
        {
            id: "2",
            application_type: "birth",
            status: "pending"
        }
    ]
  
    return (
        <>
            <h2 className="font-semibold md:text-lg text-zinc-600 mb-1">Payment History</h2>
            <hr className="border-gray-300 mb-3" />

            <div className="w-full overflow-x-auto pb-2 no-scrollbar">
                <table className="w-full whitespace-nowrap">
                    <thead>
                        <tr className="bg-[#2f3349] text-white text-left">
                            <th className="p-4">Application Type</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Payment Date</th>
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
                                        <span className={`${appt.status === "successful" ? "text-green-500" : "text-orange-500"}`}>{appt.status}</span>
                                    </td>
                                    <td className="text-zinc-600 p-4 capitalize">
                                        {
                                            appt.status === "successful" ? new Date().toDateString() : "----"
                                        }
                                    </td>
                                    <td className="text-zinc-600 p-4">
                                        <div className="flex items-center gap-3">
                                            {
                                                appt.status === "pending" ? (
                                                    <Link to="#" title="Continue Applicaton" className="inline-block text-blue-500 hover:underline underline-offset-2 transition-all">
                                                        Pay Now
                                                    </Link>
                                                ) : null
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
