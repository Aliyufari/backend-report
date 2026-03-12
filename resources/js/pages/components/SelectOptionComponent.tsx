import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface Props {
    selected: string | number;
    handleChange: (val: string | number) => void;
    options: string[] | number[];
    className?: string;
    label?: string;
    optionOffset?: string;
}

const SelectOptionComponent = ({ selected, options, label, className, optionOffset, handleChange }: Props) => {
    const [showOptions, setShowOptions] = useState(false);

  return (
    <>
        {label ? <p className="mb-1">{label}</p> : null}
        <div tabIndex={0} onBlur={() => setTimeout(() => setShowOptions(false), 200)} onClick={() => setShowOptions(!showOptions)}
            className={`relative w-full py-2 px-4 border border-gray-300 focus:border-green-500 rounded-md outline-none transition-colors flex justify-between items-center gap-4 cursor-pointer ${className}`}>
            <span>{selected || "Select option"}</span>
            <ChevronDown size={20} color="#333333" />

            {
                showOptions ? (
                    <ul className={`w-full max-h-[250px] overflow-y-auto overflow-x-hidden border border-gray-300 bg-white absolute left-0 ${optionOffset ?? "top-10"} p-4 z-20`}>
                        {
                            options.map((option, index) => (
                                <li key={option} onClick={() => handleChange(option)}
                                    className={`whitespace-break-spaces capitalize ${selected === option ? "bg-green-500 text-white" : "hover:bg-gray-100"} py-2 px-4 ${(options.length) - 1 !== index ? "mb-1" : ""}`}>
                                    {option}
                                </li>
                            ))
                        }
                    </ul>
                ) : null
            }
        </div>
    </>
  )
}

export default SelectOptionComponent;