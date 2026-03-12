import { Loader } from "lucide-react";

interface Props {
    color?: string;
    size?: number;
}

const Spinner = ({ size = 18, color = "white" }: Props) => {
    return (
        <span className="inline-block animate-spin" style={{ color }}>
            <Loader size={size} />
        </span>
    );
};

export default Spinner;