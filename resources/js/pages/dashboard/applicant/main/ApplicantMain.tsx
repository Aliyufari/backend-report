import { ShieldAlert } from "lucide-react";
import ApplicationTracking from "./ApplicationTracking";
import ApplicationButtonComponent from "@/pages/dashboard/components/ApplicationButtonComponent";

export default function ApplicantMain() {
    const pending = true;

    return (
        <>
            <div className="flex justify-between items-center gap-4 flex-wrap mb-1">
                <h2 className="font-semibold md:text-lg text-zinc-600 ">Dashboard</h2>
                <ApplicationButtonComponent />
            </div>
            <hr className="border-gray-300 mb-3" />

            {
                pending ? (
                    <ApplicationTracking />
                ) : (
                    <div className="w-full rounded-lg bg-white p-6">
                        <div className="w-full max-w-[300px] border border-gray-100 shadow rounded-lg flex items-center gap-4 flex-col text-zinc-500 mx-auto p-8">
                            <ShieldAlert size={60} />
                            <p className="text-orange-600">You don't have any active application.</p>
                        </div>
                    </div>
                )
            }
        </>
    )
}
