
export default function ApplicationTracking() {
    const step = 1;
    const progress = {
        "1": "h-[30%]",
        "2": "h-[60%]",
        "3": "h-[90%]",
        "4": "h-[100%]",
    }
  
    return (
        <div className="w-max">
            <h2 className="w-full py-4 px-6 rounded-md bg-white text-orange-600 mb-6">Indigene application status</h2>
            <div className="relative flex flex-col gap-6 text-sm overflow-hidden">
                {/* Progress */}
                <div className="w-[3px] h-full rounded-md absolute top-0 left-[19px] bg-white overflow-hidden z-0">
                    <div className={`w-full ${progress[step]} bg-green-500 transition-all`} />
                </div>

                {/* Steps */}
                <div className="flex gap-2 items-center z-10">
                    <span className={`w-10 min-w-10 h-10 rounded-full border-3 border-white ${step > 0 ? "bg-green-500 text-white" : "bg-white"} flex justify-center items-center transition-all`}>1</span>

                    <p className={`w-full rounded-md bg-white ${step > 0 ? "text-green-500" : "text-zinc-600" } py-2 px-4 transition-all`}>Pending Application</p>
                </div>

                <div className="flex gap-2 items-center z-10">
                    <span className={`w-10 min-w-10 h-10 rounded-full border-3 border-white ${step > 1 ? "bg-green-500 text-white" : "bg-white"} flex justify-center items-center transition-all`}>2</span>

                    <p className={`w-full rounded-md bg-white ${step > 1 ? "text-green-500" : "text-zinc-600" } py-2 px-4 transition-all`}>Submitted and waiting for verification</p>
                </div>

                <div className="flex gap-2 items-center z-10">
                    <span className={`w-10 min-w-10 h-10 rounded-full border-3 border-white ${step > 2 ? "bg-green-500 text-white" : "bg-white"} flex justify-center items-center transition-all`}>3</span>

                    <p className={`w-full rounded-md bg-white ${step > 2 ? "text-green-500" : "text-zinc-600" } py-2 px-4 transition-all`}>You application has been verified and waiting for approval</p>
                </div>

                <div className="flex gap-2 items-center z-10">
                    <span className={`w-10 min-w-10 h-10 rounded-full border-3 border-white ${step > 3 ? "bg-green-500 text-white" : "bg-white"} flex justify-center items-center transition-all`}>4</span>

                    <p className={`w-full rounded-md bg-white ${step > 3 ? "text-green-500" : "text-zinc-600" } py-2 px-4 transition-all`}>You application has been approved</p>
                </div>
            </div>
        </div>
    );
}
