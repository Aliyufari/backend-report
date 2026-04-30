import "../css/app.css";

import "@/echo";
import { ToastContainer } from "react-toastify";
import { createInertiaApp, router } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import { initializeTheme } from "./hooks/use-appearance";
import AppLoader from "@/components/ui/AppLoader";
import { useLoader } from "@/hooks/useLoader";

const appName = import.meta.env.VITE_APP_NAME || "Backend Report";

/**
 * ─────────────────────────────────────────────
 * Loader setup (single instance)
 * ─────────────────────────────────────────────
 */
const loaderContainer = document.createElement("div");
document.body.appendChild(loaderContainer);
const loaderRoot = createRoot(loaderContainer);

let timer: ReturnType<typeof setTimeout> | null = null;

type Mode = "idle" | "page" | "auth" | "logout";

let mode: Mode = "idle";

/**
 * detect silent requests (datatable / background refresh)
 */
const isSilentRequest = (visit: any) =>
    visit?.silent ||
    visit?.headers?.["x-datatable"] === "true" ||
    visit?.headers?.["x-loader-scope"] === "datatable";

/**
 * show loader
 */
function showLoader() {
    useLoader.getState().start();
    loaderRoot.render(<AppLoader />);
}

/**
 * hide loader
 */
function hideLoader() {
    useLoader.getState().finish();
    loaderRoot.render(null);
}

/**
 * ─────────────────────────────────────────────
 * BEFORE navigation
 * ─────────────────────────────────────────────
 */
router.on("before", (e) => {
    const visit = e.detail.visit;

    if (isSilentRequest(visit)) return;

    if (timer) clearTimeout(timer);

    const method = visit.method?.toLowerCase() ?? "get";
    const url = new URL(visit.url, window.location.origin).pathname;

    // ── logout (keep global loader)
    if (method === "post" && url === "/logout") {
        mode = "logout";
        showLoader();
        return;
    }

    // ── ALL OTHER POST REQUESTS (login/register/etc)
    // IMPORTANT: NEVER show global loader here
    if (method === "post") {
        mode = "auth";
        return; // 👈 stop completely
    }

    // ── page navigation only
    mode = "page";
    timer = setTimeout(showLoader, 120);
});

/**
 * ─────────────────────────────────────────────
 * AFTER navigation
 * ─────────────────────────────────────────────
 */
router.on("finish", (e) => {
    const visit = e.detail.visit;

    if (isSilentRequest(visit)) return;

    if (timer) clearTimeout(timer);

    // ── AUTH (login/register) UX POLISH
    if (mode === "auth") {
        // show loader briefly AFTER redirect
        showLoader();

        timer = setTimeout(() => {
            hideLoader();
            mode = "idle";
        }, 350); // 👈 tweak feel here (300–500ms is ideal)

        return;
    }

    // ── normal navigation
    timer = setTimeout(() => {
        hideLoader();
        mode = "idle";
    }, 120);
});

/**
 * ─────────────────────────────────────────────
 * ERROR / CANCEL
 * ─────────────────────────────────────────────
 */
router.on("cancel", () => {
    if (timer) clearTimeout(timer);
    hideLoader();
    mode = "idle";
});

router.on("error", () => {
    if (timer) clearTimeout(timer);
    hideLoader();
    mode = "idle";
});

/**
 * ─────────────────────────────────────────────
 * App bootstrap
 * ─────────────────────────────────────────────
 */
createInertiaApp({
    title: (title) =>
        title ? `${title} - ${appName}` : appName,

    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob("./pages/**/*.tsx")
        ),

    setup({ el, App, props }) {
        createRoot(el).render(
            <>
                <App {...props} />
                <ToastContainer position="top-right" autoClose={4000} />
            </>
        );
    },

    progress: false,
});

initializeTheme();