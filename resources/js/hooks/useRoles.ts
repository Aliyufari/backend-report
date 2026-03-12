import { usePage } from "@inertiajs/react";
import type { NameID } from "@/types";

interface PageProps {
    roles?: NameID[];
    [key: string]: unknown;
}

const useRoles = () => {
    const { props } = usePage<PageProps>();

    return {
        roles: props.roles ?? [],
    };
};

export default useRoles;