import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

interface Props {
    children: ReactNode;
}

/**
 * Renders children directly into document.body, escaping any
 * overflow:hidden or stacking context from parent layout components.
 * Use this for all modals, drawers, and dropdowns.
 */
export default function Portal({ children }: Props) {
    const el = useRef(document.createElement("div"));

    useEffect(() => {
        const portal = el.current;
        document.body.appendChild(portal);
        return () => {
            document.body.removeChild(portal);
        };
    }, []);

    return createPortal(children, el.current);
}