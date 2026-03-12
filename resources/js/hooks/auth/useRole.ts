// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { getToken } from "@/services/auth.services";
// import { decodeToken, isExpired } from "react-jwt";

// const useRole = () => {
//     const token = getToken();
//     if(!token){ return null; }

//     const decoded: any = decodeToken(token);
//     const expired: boolean = isExpired(token);
//     if(!decoded || expired){ return null; }

//     return decoded.role;
// }

// export default useRole;

import { usePage } from "@inertiajs/react";
import type { Roles } from "@/types";

interface PageProps {
    auth: {
        user: {
            role: Roles;
        } | null;
    };
    [key: string]: unknown;
}

const useRole = (): Roles | null => {
    const { props } = usePage<PageProps>();
    return (props.auth?.user?.role?.name as Roles) ?? null;
};

export default useRole;