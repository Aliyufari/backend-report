import{u as E,r as s,y as k,j as e,H as R,d}from"./app-Gnwv0IP-.js";import{A as L,a as H}from"./AppLayout-rSR5qP4j.js";import P from"./UserModal-CRF-1Ezu.js";import{T as $,D as q}from"./DeleteUserModal-B6FsnIRw.js";import{u as M}from"./index-CEwEZrYa.js";import{c as h}from"./createLucideIcon-CVHonguK.js";import{C as I}from"./circle-user-Wobw8_m3.js";import{P as T}from"./pencil-lSZNSCAT.js";/* empty css            */import"./logo-BuOOC7SJ.js";import"./Spinner-B5qeSgZP.js";import"./loader-D1xkvpde.js";import"./map-pin-DIYsNaPw.js";import"./chevron-down-Bx1Kbosw.js";import"./Portal-DtCgItmA.js";import"./index-CUnUQ3eh.js";import"./x-r2AMCqeY.js";import"./camera-Ca65XvoV.js";import"./eye-D1ltVOoB.js";import"./loader-circle-C1UEGQRL.js";import"./index-CMWG4mbA.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B=[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]],G=h("RefreshCw",B);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]],J=h("Search",W);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"19",x2:"19",y1:"8",y2:"14",key:"1bvyxn"}],["line",{x1:"22",x2:"16",y1:"11",y2:"11",key:"1shjgl"}]],O=h("UserPlus",K);function fe(){const{props:w}=E(),{users:o,roles:p,state:N,filters:f,flash:n}=w,[a,m]=s.useState(f.search??""),[t,x]=s.useState(f.role??""),[S,u]=s.useState(!1),[C,g]=s.useState(null),[v,b]=s.useState(null);s.useEffect(()=>{n?.message&&(n.status?k.success(n.message):k.error(n.message))},[n]);const l=(r={})=>{const i={},y=r.search??a,j=r.role??t;y&&(i.search=y),j&&(i.role=j),d.get(M.index().url,i,{preserveState:!0,replace:!0})},z=r=>{r.preventDefault(),l()},D=r=>{x(r),l({role:r})},U=()=>d.reload({only:["users"]}),F=()=>{g(null),u(!0)},_=r=>{g(r),u(!0)},A=r=>b(r),c=p.find(r=>r.value===t);return e.jsxs(e.Fragment,{children:[e.jsx(R,{title:"Manage Users"}),e.jsxs(L,{SideNavigation:H,title:"Manage Users",sub:"Create and manage system user accounts",live:!1,actions:e.jsxs("button",{onClick:F,className:"flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90",style:{fontFamily:"'Syne', sans-serif",background:"var(--primary)",color:"var(--primary-foreground)"},children:[e.jsx(O,{size:15}),"Add User"]}),children:[e.jsx("style",{children:`
                    @import url('https://fonts.bunny.net/css?family=dm-mono:400,500|syne:600,700');

                    .users-table { width: 100%; border-collapse: collapse; }
                    .users-table th {
                        font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500;
                        text-transform: uppercase; letter-spacing: 0.08em;
                        color: var(--muted-foreground); padding: 10px 14px; text-align: left;
                        border-bottom: 1px solid var(--border); white-space: nowrap;
                    }
                    .users-table td {
                        padding: 12px 14px; border-bottom: 1px solid var(--border);
                        font-size: 13px; color: var(--foreground); vertical-align: middle;
                    }
                    .users-table tr:last-child td { border-bottom: none; }
                    .users-table tbody tr { transition: background 0.12s ease; }
                    .users-table tbody tr:hover { background: color-mix(in oklch, var(--primary) 4%, transparent); }

                    .role-badge {
                        display: inline-flex; align-items: center;
                        padding: 3px 10px; border-radius: 20px;
                        font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500;
                        background: color-mix(in oklch, var(--primary) 10%, transparent);
                        color: var(--primary);
                        border: 1px solid color-mix(in oklch, var(--primary) 20%, transparent);
                        white-space: nowrap; text-transform: capitalize;
                    }

                    .action-btn {
                        width: 30px; height: 30px; border-radius: 7px;
                        display: inline-flex; align-items: center; justify-content: center;
                        border: 1px solid var(--border); background: transparent;
                        cursor: pointer; transition: all 0.15s ease; color: var(--muted-foreground);
                    }
                    .action-btn:hover { background: var(--muted); color: var(--foreground); }
                    .action-btn.danger:hover {
                        background: color-mix(in oklch, var(--destructive) 10%, transparent);
                        color: var(--destructive);
                        border-color: color-mix(in oklch, var(--destructive) 30%, transparent);
                    }

                    .search-input {
                        padding: 8px 12px 8px 36px; border: 1px solid var(--border); border-radius: 8px;
                        font-family: 'DM Mono', monospace; font-size: 12px;
                        color: var(--foreground); background: var(--background);
                        outline: none; width: 200px; transition: all 0.15s;
                    }
                    .search-input:focus { border-color: var(--primary); width: 240px; }
                    .search-input::placeholder { color: var(--muted-foreground); }

                    .role-filter-select {
                        padding: 8px 32px 8px 10px; border: 1px solid var(--border); border-radius: 8px;
                        font-family: 'DM Mono', monospace; font-size: 12px;
                        color: var(--foreground); background: var(--background);
                        outline: none; cursor: pointer; appearance: none;
                        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
                        background-repeat: no-repeat; background-position: right 10px center;
                        transition: border-color 0.15s; min-width: 130px;
                    }
                    .role-filter-select:focus { border-color: var(--primary); }
                    .role-filter-select.active { border-color: var(--primary); color: var(--primary); background-color: color-mix(in oklch, var(--primary) 6%, var(--background)); }

                    .page-btn {
                        min-width: 32px; height: 32px; border-radius: 7px;
                        display: inline-flex; align-items: center; justify-content: center;
                        font-family: 'DM Mono', monospace; font-size: 12px;
                        border: 1px solid var(--border); background: transparent;
                        color: var(--muted-foreground); cursor: pointer; transition: all 0.15s; padding: 0 6px;
                    }
                    .page-btn:hover:not(:disabled) { background: var(--muted); color: var(--foreground); }
                    .page-btn.active { background: var(--primary); color: var(--primary-foreground); border-color: var(--primary); }
                    .page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

                    .avatar-circle {
                        width: 34px; height: 34px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
                        background: color-mix(in oklch, var(--primary) 12%, var(--muted));
                        display: flex; align-items: center; justify-content: center;
                        border: 1.5px solid color-mix(in oklch, var(--primary) 20%, transparent);
                    }
                    .avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
                    .avatar-initials {
                        font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
                        color: var(--primary); text-transform: uppercase;
                    }

                    .filter-chip {
                        display: inline-flex; align-items: center; gap: 5px;
                        padding: 3px 10px; border-radius: 20px; font-size: 11px;
                        font-family: 'DM Mono', monospace;
                        background: color-mix(in oklch, var(--primary) 10%, transparent);
                        color: var(--primary);
                        border: 1px solid color-mix(in oklch, var(--primary) 25%, transparent);
                        cursor: pointer; transition: all 0.15s;
                    }
                    .filter-chip:hover { background: color-mix(in oklch, var(--primary) 18%, transparent); }
                `}),e.jsxs("div",{className:"bg-card rounded-2xl border shadow-sm overflow-hidden",style:{borderColor:"var(--border)"},children:[e.jsxs("div",{className:"flex flex-col gap-3 px-5 py-4 border-b",style:{borderColor:"var(--border)"},children:[e.jsxs("div",{className:"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3",children:[e.jsxs("div",{style:{fontFamily:"'DM Mono', monospace",fontSize:12,color:"var(--muted-foreground)"},children:["Showing ",o.from??0,"–",o.to??0," of ",o.total," users",c&&e.jsxs("span",{style:{marginLeft:8},children:["filtered by ",e.jsx("strong",{style:{color:"var(--foreground)"},children:c.label})]})]}),e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsxs("select",{className:`role-filter-select ${t?"active":""}`,value:t,onChange:r=>D(r.target.value),children:[e.jsx("option",{value:"",children:"All Roles"}),p.map(r=>e.jsx("option",{value:r.value,children:r.label},r.value))]}),e.jsxs("form",{onSubmit:z,className:"relative",children:[e.jsx(J,{size:14,className:"absolute left-3 top-1/2 -translate-y-1/2",style:{color:"var(--muted-foreground)"}}),e.jsx("input",{type:"text",className:"search-input",placeholder:"Search users...",value:a,onChange:r=>m(r.target.value)})]}),e.jsxs("button",{onClick:U,className:"flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-all hover:bg-muted",style:{fontFamily:"'DM Mono', monospace",borderColor:"var(--border)",color:"var(--muted-foreground)"},children:[e.jsx(G,{size:13}),"Refresh"]})]})]}),(a||t)&&e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsx("span",{style:{fontFamily:"'DM Mono', monospace",fontSize:11,color:"var(--muted-foreground)"},children:"Active filters:"}),a&&e.jsxs("span",{className:"filter-chip",onClick:()=>{m(""),l({search:""})},children:['"',a,'" ×']}),t&&c&&e.jsxs("span",{className:"filter-chip",onClick:()=>{x(""),l({role:""})},children:[c.label," ×"]}),e.jsx("button",{onClick:()=>{m(""),x(""),d.get(M.index().url,{},{replace:!0})},style:{fontFamily:"'DM Mono', monospace",fontSize:11,color:"var(--destructive)",background:"none",border:"none",cursor:"pointer"},children:"Clear all"})]})]}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"users-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"User"}),e.jsx("th",{children:"Email"}),e.jsx("th",{children:"Role"}),e.jsx("th",{children:"Created"}),e.jsx("th",{style:{textAlign:"right"},children:"Actions"})]})}),e.jsx("tbody",{children:o.data.length===0?e.jsx("tr",{children:e.jsxs("td",{colSpan:5,style:{textAlign:"center",padding:"48px 0",color:"var(--muted-foreground)"},children:[e.jsx(I,{size:32,style:{margin:"0 auto 10px",opacity:.4}}),e.jsx("p",{style:{fontFamily:"'DM Mono', monospace",fontSize:12},children:a||t?"No users match your filters":"No users found"})]})}):o.data.map(r=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"avatar-circle",children:r.avatar?e.jsx("img",{src:`/storage/${r.avatar}`,alt:r.name}):e.jsx("span",{className:"avatar-initials",children:r.name.charAt(0)})}),e.jsx("span",{style:{fontFamily:"'Syne', sans-serif",fontWeight:600,fontSize:13},children:r.name})]})}),e.jsx("td",{style:{fontFamily:"'DM Mono', monospace",fontSize:12},children:r.email}),e.jsx("td",{children:e.jsx("span",{className:"role-badge",children:r.role?.name??"—"})}),e.jsx("td",{style:{fontFamily:"'DM Mono', monospace",fontSize:11,color:"var(--muted-foreground)"},children:new Date(r.created_at).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}),e.jsx("td",{children:e.jsxs("div",{className:"flex items-center justify-end gap-1.5",children:[e.jsx("button",{className:"action-btn",title:"Edit",onClick:()=>_(r),children:e.jsx(T,{size:13})}),e.jsx("button",{className:"action-btn danger",title:"Delete",onClick:()=>A(r),children:e.jsx($,{size:13})})]})})]},r.id))})]})}),o.last_page>1&&e.jsx("div",{className:"flex items-center justify-center gap-1.5 px-5 py-4 border-t",style:{borderColor:"var(--border)"},children:o.links.map((r,i)=>e.jsx("button",{className:`page-btn ${r.active?"active":""}`,disabled:!r.url,onClick:()=>r.url&&d.visit(r.url,{preserveState:!0}),dangerouslySetInnerHTML:{__html:r.label}},i))})]}),e.jsx(P,{open:S,onClose:()=>u(!1),roles:p,state:N,user:C}),e.jsx(q,{open:!!v,onClose:()=>b(null),user:v})]})]})}export{fe as default};
