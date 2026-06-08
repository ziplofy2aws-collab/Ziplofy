import{r as s,j as r,F as y}from"./index-BX6IafoW.js";const h=({label:u,value:d,options:l,onChange:x,placeholder:g="Select...",disabled:a=!1})=>{const[t,n]=s.useState(!1),c=s.useRef(null);s.useEffect(()=>{const e=i=>{c.current&&!c.current.contains(i.target)&&n(!1)};return document.addEventListener("mousedown",e),()=>{document.removeEventListener("mousedown",e)}},[]);const m=s.useCallback(()=>{a||n(!t)},[a,t]),f=s.useCallback(e=>{x(e),n(!1)},[x]),o=l.find(e=>e.value===d);return r.jsxs("div",{className:"relative",ref:c,children:[r.jsx("label",{className:"block text-xs text-gray-600 mb-1.5",children:u}),r.jsxs("div",{onClick:m,className:`
          w-full min-h-[36px] px-3 py-1.5 text-sm border border-gray-200
          bg-white cursor-pointer flex items-center justify-between
          ${a?"bg-gray-50 cursor-not-allowed":"hover:border-gray-300"}
          ${t?"border-gray-400 ring-1 ring-gray-400":""}
        `,children:[r.jsx("span",{className:o?"text-gray-900":"text-gray-500",children:o?o.label:g}),r.jsx(y,{className:`w-4 h-4 text-gray-400 transition-transform ${t?"rotate-180":""}`})]}),t&&!a&&r.jsx("div",{className:"absolute z-50 w-full mt-1 bg-white border border-gray-200 shadow-lg max-h-60 overflow-auto",children:l.length===0?r.jsx("div",{className:"px-3 py-2 text-sm text-gray-600",children:"No options available"}):l.map(e=>{const i=d===e.value;return r.jsx("div",{onClick:()=>f(e.value),className:`
                    px-3 py-2 text-sm cursor-pointer hover:bg-gray-50
                    ${i?"bg-gray-100 text-gray-900":"text-gray-900"}
                  `,children:e.label},e.value)})})]})};export{h as S};
