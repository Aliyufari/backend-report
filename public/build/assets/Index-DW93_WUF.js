import{u as t,r as s,y as e,j as r,H as l}from"./app-Gnwv0IP-.js";import{A as d,a as m}from"./AppLayout-rSR5qP4j.js";import n from"./ProfileCard-BdpSSNWl.js";import p from"./EmailCard-D2k0LHeQ.js";import c from"./PasswordCard-BU1eOOQU.js";/* empty css            */import"./logo-BuOOC7SJ.js";import"./Spinner-B5qeSgZP.js";import"./loader-D1xkvpde.js";import"./createLucideIcon-CVHonguK.js";import"./map-pin-DIYsNaPw.js";import"./chevron-down-Bx1Kbosw.js";import"./index-FriQxbfz.js";import"./index-CMWG4mbA.js";import"./Portal-DtCgItmA.js";import"./index-CUnUQ3eh.js";import"./pencil-lSZNSCAT.js";import"./circle-user-Wobw8_m3.js";import"./x-r2AMCqeY.js";import"./camera-Ca65XvoV.js";import"./loader-circle-C1UEGQRL.js";import"./eye-closed-Wkn4yFUh.js";import"./eye-D1ltVOoB.js";function _(){const{props:o}=t(),{profile:i,flash:a}=o;return s.useEffect(()=>{a?.message&&(a.status?e.success(a.message):e.error(a.message))},[a]),r.jsxs(r.Fragment,{children:[r.jsx(l,{title:"My Profile"}),r.jsxs(d,{SideNavigation:m,title:"My Profile",sub:"Manage your account information",live:!1,children:[r.jsx("style",{children:`
                    @import url('https://fonts.bunny.net/css?family=dm-mono:400,500|syne:600,700');

                    @keyframes fadeSlideIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                    .profile-card {
                        animation: fadeSlideIn 0.3s ease both;
                        height: 100%;
                    }
                    .profile-card:nth-child(1) { animation-delay: 0.05s; }
                    .profile-card:nth-child(2) { animation-delay: 0.12s; }
                    .profile-card:nth-child(3) { animation-delay: 0.19s; }

                    /* Shared modal styles injected here so all child modals inherit */
                    .profile-modal-overlay {
                        position: fixed;
                        inset: 0;
                        z-index: 200;
                        background: rgba(0,0,0,0.5);
                        backdrop-filter: blur(4px);
                        -webkit-backdrop-filter: blur(4px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 16px;
                        overflow-y: auto;
                        animation: fadeIn 0.15s ease;
                    }

                    .profile-modal-box {
                        background: var(--card);
                        border-radius: 16px;
                        width: 100%;
                        max-width: 480px;
                        max-height: calc(100dvh - 48px);
                        overflow-y: auto;
                        box-shadow: 0 24px 60px rgba(0,0,0,0.2);
                        border: 1px solid var(--border);
                        animation: slideUp 0.2s ease;
                        flex-shrink: 0;
                    }

                    @keyframes fadeIn  { from { opacity: 0 }              to { opacity: 1 } }
                    @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
                `}),r.jsxs("div",{className:"w-full grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 items-start",children:[r.jsx("div",{className:"profile-card",children:r.jsx(n,{profile:i})}),r.jsxs("div",{className:"space-y-5",children:[r.jsx("div",{className:"profile-card",children:r.jsx(p,{email:i.email})}),r.jsx("div",{className:"profile-card",children:r.jsx(c,{})})]})]})]})]})}export{_ as default};
