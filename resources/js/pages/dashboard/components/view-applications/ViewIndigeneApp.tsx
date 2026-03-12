import { Link, router } from "@inertiajs/react";
import type { Application } from "@/types";
import { MoveLeft } from "lucide-react";

interface Props {
    application: Application;
}

export default function ViewIndigeneApp({ application }: Props) {
    return (
        <>
            <div className="flex justify-start items-center mb-4">
                <Link
                    href="/dashboard/my-applications"
                    className="flex items-center gap-1 text-zinc-500 transition-colors hover:text-orange-500"
                >
                    <MoveLeft size={24} />
                    <span>Back</span>
                </Link>
            </div>

            <div className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="w-full h-max rounded-lg bg-white p-6">
                        <h2 className="font-semibold md:text-lg text-zinc-600 mb-1">Indigene Application</h2>
                        <hr className="border-gray-300 mb-3" />

                        <div
                            className="w-[120px] h-[120px] rounded-full border border-gray-100 overflow-hidden mx-auto mb-4 bg-cover bg-no-repeat bg-center"
                            style={{
                                backgroundImage: `url("${application.profile_image ?? "/images/profile.png"}")`,
                            }}
                        />

                        <div className="overflow-hidden">
                            <table className="w-full mb-2">
                                <tbody className="text-left">
                                    {[
                                        ["First Name", application.first_name],
                                        ["Middle Name", application.middle_name],
                                        ["Surname", application.surname],
                                        ["Email Address", application.email],
                                        ["Gender", application.gender],
                                        ["Date of Birth", application.dob],
                                        ["LGA", application.lga],
                                    ].map(([label, value], i) => (
                                        <tr key={label} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                                            <th className="text-zinc-600 p-4">{label}:</th>
                                            <td className="text-zinc-600 p-4">{value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="w-full h-max rounded-lg bg-white p-6">
                            <h2 className="font-semibold md:text-lg text-zinc-600 mb-1">
                                Applicant Father's Information
                            </h2>
                            <hr className="border-gray-300 mb-3" />
                            <div className="overflow-hidden">
                                <table className="w-full">
                                    <tbody className="text-left">
                                        {[
                                            ["First Name", application.father_first_name],
                                            ["Middle Name", application.father_middle_name],
                                            ["Surname", application.father_surname],
                                            ["Phone Number", application.father_phone],
                                            ["Father NIN", application.father_nin],
                                        ].map(([label, value], i) => (
                                            <tr key={label} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                                                <th className="text-zinc-600 p-4">{label}:</th>
                                                <td className="text-zinc-600 p-4">{value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="w-full h-max rounded-lg bg-white p-6">
                            <h2 className="font-semibold md:text-lg text-zinc-600 mb-1">
                                Applicant Mother's Information
                            </h2>
                            <hr className="border-gray-300 mb-3" />
                            <div className="overflow-hidden">
                                <table className="w-full">
                                    <tbody className="text-left">
                                        {[
                                            ["First Name", application.mother_first_name],
                                            ["Surname", application.mother_surname],
                                            ["Phone Number", application.mother_phone],
                                            ["Mother NIN", application.mother_nin],
                                        ].map(([label, value], i) => (
                                            <tr key={label} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                                                <th className="text-zinc-600 p-4">{label}:</th>
                                                <td className="text-zinc-600 p-4">{value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-lg flex justify-start items-center gap-4 flex-wrap bg-white p-6 mb-4">
                <button
                    type="button"
                    onClick={() => router.visit(`/dashboard/applications/${application.id}/print`)}
                    className="rounded-md bg-green-600 text-white hover:bg-green-500 transition-colors cursor-pointer py-2 px-4"
                >
                    Print Certificate
                </button>
            </div>
        </>
    );
}