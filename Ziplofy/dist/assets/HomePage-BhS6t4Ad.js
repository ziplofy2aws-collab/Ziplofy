import{r as o,j as e,u as W,a as Y,b8 as Z,a3 as ae,o as U,y as ie,aO as re,as as le,s as ce,c as de,aI as ue,C as me,aS as pe,at as he,b9 as fe,aw as xe,P as D,ba as ge,W as be}from"./index-BX6IafoW.js";import{r as ye}from"./index-Bm-HwmKC.js";import{D as ve}from"./DashboardContent-BFLvpZpb.js";import{F as q}from"./ChevronRightIcon-BxpR6I9F.js";import{M as we,u as K,P as je,a as ke,b as Ce,L as Ne,m as C}from"./proxy-C-6oTHRq.js";import{F as Q}from"./CheckIcon-CiryK9yS.js";import{F as Se}from"./ArrowRightIcon-agg4ygI8.js";import"./EllipsisHorizontalIcon-VJb6L9RY.js";import"./CurrencyDollarIcon-ChAAbpi1.js";function Ee({title:t,titleId:s,...a},n){return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:n,"aria-labelledby":s},a),t?o.createElement("title",{id:s},t):null,o.createElement("path",{fillRule:"evenodd",d:"M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z",clipRule:"evenodd"}))}const Le=o.forwardRef(Ee);class _e extends o.Component{getSnapshotBeforeUpdate(s){const a=this.props.childRef.current;if(a&&s.isPresent&&!this.props.isPresent){const n=this.props.sizeRef.current;n.height=a.offsetHeight||0,n.width=a.offsetWidth||0,n.top=a.offsetTop,n.left=a.offsetLeft}return null}componentDidUpdate(){}render(){return this.props.children}}function Re({children:t,isPresent:s}){const a=o.useId(),n=o.useRef(null),u=o.useRef({width:0,height:0,top:0,left:0}),{nonce:m}=o.useContext(we);return o.useInsertionEffect(()=>{const{width:x,height:c,top:f,left:i}=u.current;if(s||!n.current||!x||!c)return;n.current.dataset.motionPopId=a;const h=document.createElement("style");return m&&(h.nonce=m),document.head.appendChild(h),h.sheet&&h.sheet.insertRule(`
          [data-motion-pop-id="${a}"] {
            position: absolute !important;
            width: ${x}px !important;
            height: ${c}px !important;
            top: ${f}px !important;
            left: ${i}px !important;
          }
        `),()=>{document.head.removeChild(h)}},[s]),e.jsx(_e,{isPresent:s,childRef:n,sizeRef:u,children:o.cloneElement(t,{ref:n})})}const Pe=({children:t,initial:s,isPresent:a,onExitComplete:n,custom:u,presenceAffectsLayout:m,mode:x})=>{const c=K(Ie),f=o.useId(),i=o.useCallback(k=>{c.set(k,!0);for(const p of c.values())if(!p)return;n&&n()},[c,n]),h=o.useMemo(()=>({id:f,initial:s,isPresent:a,custom:u,onExitComplete:i,register:k=>(c.set(k,!1),()=>c.delete(k))}),m?[Math.random(),i]:[a,i]);return o.useMemo(()=>{c.forEach((k,p)=>c.set(p,!1))},[a]),o.useEffect(()=>{!a&&!c.size&&n&&n()},[a]),x==="popLayout"&&(t=e.jsx(Re,{isPresent:a,children:t})),e.jsx(je.Provider,{value:h,children:t})};function Ie(){return new Map}const z=t=>t.key||"";function B(t){const s=[];return o.Children.forEach(t,a=>{o.isValidElement(a)&&s.push(a)}),s}const Me=({children:t,custom:s,initial:a=!0,onExitComplete:n,presenceAffectsLayout:u=!0,mode:m="sync",propagate:x=!1})=>{const[c,f]=ke(x),i=o.useMemo(()=>B(t),[t]),h=x&&!c?[]:i.map(z),k=o.useRef(!0),p=o.useRef(i),N=K(()=>new Map),[w,E]=o.useState(i),[g,S]=o.useState(i);Ce(()=>{k.current=!1,p.current=i;for(let r=0;r<g.length;r++){const l=z(g[r]);h.includes(l)?N.delete(l):N.get(l)!==!0&&N.set(l,!1)}},[g,h.length,h.join("-")]);const b=[];if(i!==w){let r=[...i];for(let l=0;l<g.length;l++){const j=g[l],d=z(j);h.includes(d)||(r.splice(l,0,j),b.push(j))}m==="wait"&&b.length&&(r=b),S(B(r)),E(i);return}const{forceRender:y}=o.useContext(Ne);return e.jsx(e.Fragment,{children:g.map(r=>{const l=z(r),j=x&&!c?!1:i===g||h.includes(l),d=()=>{if(N.has(l))N.set(l,!0);else return;let v=!0;N.forEach(L=>{L||(v=!1)}),v&&(y?.(),S(p.current),x&&f?.(),n&&n())};return e.jsx(Pe,{isPresent:j,initial:!k.current||a?void 0:!1,custom:j?void 0:s,presenceAffectsLayout:u,mode:m,onExitComplete:j?void 0:d,children:r},l)})})};var F=function(t,s){return F=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(a,n){a.__proto__=n}||function(a,n){for(var u in n)Object.prototype.hasOwnProperty.call(n,u)&&(a[u]=n[u])},F(t,s)};function T(t,s){if(typeof s!="function"&&s!==null)throw new TypeError("Class extends value "+String(s)+" is not a constructor or null");F(t,s);function a(){this.constructor=t}t.prototype=s===null?Object.create(s):(a.prototype=s.prototype,new a)}var M=function(){return M=Object.assign||function(s){for(var a,n=1,u=arguments.length;n<u;n++){a=arguments[n];for(var m in a)Object.prototype.hasOwnProperty.call(a,m)&&(s[m]=a[m])}return s},M.apply(this,arguments)};function Te(t,s){s===void 0&&(s={});var a=s.insertAt;if(!(typeof document>"u")){var n=document.head||document.getElementsByTagName("head")[0],u=document.createElement("style");u.type="text/css",a==="top"&&n.firstChild?n.insertBefore(u,n.firstChild):n.appendChild(u),u.styleSheet?u.styleSheet.cssText=t:u.appendChild(document.createTextNode(t))}}var ze=`/*
  code is extracted from Calendly's embed stylesheet: https://assets.calendly.com/assets/external/widget.css
*/

.calendly-inline-widget,
.calendly-inline-widget *,
.calendly-badge-widget,
.calendly-badge-widget *,
.calendly-overlay,
.calendly-overlay * {
  font-size: 16px;
  line-height: 1.2em;
}

.calendly-inline-widget {
  min-width: 320px;
  height: 630px;
}

.calendly-inline-widget iframe,
.calendly-badge-widget iframe,
.calendly-overlay iframe {
  display: inline;
  width: 100%;
  height: 100%;
}

.calendly-popup-content {
  position: relative;
}

.calendly-popup-content.calendly-mobile {
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
}

.calendly-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 9999;
  background-color: #a5a5a5;
  background-color: rgba(31, 31, 31, 0.4);
}

.calendly-overlay .calendly-close-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.calendly-overlay .calendly-popup {
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 50%;
  -webkit-transform: translateY(-50%) translateX(-50%);
  transform: translateY(-50%) translateX(-50%);
  width: 80%;
  min-width: 900px;
  max-width: 1000px;
  height: 90%;
  max-height: 680px;
}

@media (max-width: 975px) {
  .calendly-overlay .calendly-popup {
    position: fixed;
    top: 50px;
    left: 0;
    right: 0;
    bottom: 0;
    -webkit-transform: none;
    transform: none;
    width: 100%;
    height: auto;
    min-width: 0;
    max-height: none;
  }
}

.calendly-overlay .calendly-popup .calendly-popup-content {
  height: 100%;
}

.calendly-overlay .calendly-popup-close {
  position: absolute;
  top: 25px;
  right: 25px;
  color: #fff;
  width: 19px;
  height: 19px;
  cursor: pointer;
  background: url(https://assets.calendly.com/assets/external/close-icon.svg)
    no-repeat;
  background-size: contain;
}

@media (max-width: 975px) {
  .calendly-overlay .calendly-popup-close {
    top: 15px;
    right: 15px;
  }
}

.calendly-badge-widget {
  position: fixed;
  right: 20px;
  bottom: 15px;
  z-index: 9998;
}

.calendly-badge-widget .calendly-badge-content {
  display: table-cell;
  width: auto;
  height: 45px;
  padding: 0 30px;
  border-radius: 25px;
  box-shadow: rgba(0, 0, 0, 0.25) 0 2px 5px;
  font-family: sans-serif;
  text-align: center;
  vertical-align: middle;
  font-weight: bold;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
}

.calendly-badge-widget .calendly-badge-content.calendly-white {
  color: #666a73;
}

.calendly-badge-widget .calendly-badge-content span {
  display: block;
  font-size: 12px;
}

.calendly-spinner {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  text-align: center;
  z-index: -1;
}

.calendly-spinner > div {
  display: inline-block;
  width: 18px;
  height: 18px;
  background-color: #e1e1e1;
  border-radius: 50%;
  vertical-align: middle;
  -webkit-animation: calendly-bouncedelay 1.4s infinite ease-in-out;
  animation: calendly-bouncedelay 1.4s infinite ease-in-out;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
}

.calendly-spinner .calendly-bounce1 {
  -webkit-animation-delay: -0.32s;
  animation-delay: -0.32s;
}

.calendly-spinner .calendly-bounce2 {
  -webkit-animation-delay: -0.16s;
  animation-delay: -0.16s;
}

@-webkit-keyframes calendly-bouncedelay {
  0%,
  80%,
  100% {
    -webkit-transform: scale(0);
    transform: scale(0);
  }

  40% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}

@keyframes calendly-bouncedelay {
  0%,
  80%,
  100% {
    -webkit-transform: scale(0);
    transform: scale(0);
  }

  40% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}
`;Te(ze);function A(t){return t.charAt(0)==="#"?t.slice(1):t}function $e(t){return t?.primaryColor&&(t.primaryColor=A(t.primaryColor)),t?.textColor&&(t.textColor=A(t.textColor)),t?.backgroundColor&&(t.backgroundColor=A(t.backgroundColor)),t}var G;(function(t){t.PROFILE_PAGE_VIEWED="calendly.profile_page_viewed",t.EVENT_TYPE_VIEWED="calendly.event_type_viewed",t.DATE_AND_TIME_SELECTED="calendly.date_and_time_selected",t.EVENT_SCHEDULED="calendly.event_scheduled",t.PAGE_HEIGHT="calendly.page_height"})(G||(G={}));var X=function(t){var s=t.url,a=t.prefill,n=a===void 0?{}:a,u=t.pageSettings,m=u===void 0?{}:u,x=t.utm,c=x===void 0?{}:x,f=t.embedType,i=$e(m),h=i.backgroundColor,k=i.hideEventTypeDetails,p=i.hideLandingPageDetails,N=i.primaryColor,w=i.textColor,E=i.hideGdprBanner,g=n.customAnswers,S=n.date,b=n.email,y=n.firstName,r=n.guests,l=n.lastName,j=n.location,d=n.name,v=c.utmCampaign,L=c.utmContent,_=c.utmMedium,R=c.utmSource,I=c.utmTerm,H=c.salesforce_uuid,O=s.indexOf("?"),V=O>-1,te=s.slice(O+1),ne=V?s.slice(0,O):s,se=[V?te:null,h?"background_color=".concat(h):null,k?"hide_event_type_details=1":null,p?"hide_landing_page_details=1":null,N?"primary_color=".concat(N):null,w?"text_color=".concat(w):null,E?"hide_gdpr_banner=1":null,d?"name=".concat(encodeURIComponent(d)):null,j?"location=".concat(encodeURIComponent(j)):null,y?"first_name=".concat(encodeURIComponent(y)):null,l?"last_name=".concat(encodeURIComponent(l)):null,r?"guests=".concat(r.map(encodeURIComponent).join(",")):null,b?"email=".concat(encodeURIComponent(b)):null,S&&S instanceof Date?"date=".concat(Oe(S)):null,v?"utm_campaign=".concat(encodeURIComponent(v)):null,L?"utm_content=".concat(encodeURIComponent(L)):null,_?"utm_medium=".concat(encodeURIComponent(_)):null,R?"utm_source=".concat(encodeURIComponent(R)):null,I?"utm_term=".concat(encodeURIComponent(I)):null,H?"salesforce_uuid=".concat(encodeURIComponent(H)):null,f?"embed_type=".concat(f):null,"embed_domain=1"].concat(g?Ae(g):[]).filter(function(oe){return oe!==null}).join("&");return"".concat(ne,"?").concat(se)},Oe=function(t){var s=t.getMonth()+1,a=t.getDate(),n=t.getFullYear();return[n,s<10?"0".concat(s):s,a<10?"0".concat(a):a].join("-")},De=/^a\d{1,2}$/,Ae=function(t){var s=Object.keys(t).filter(function(a){return a.match(De)});return s.length?s.map(function(a){return"".concat(a,"=").concat(encodeURIComponent(t[a]))}):[]},J=(function(t){T(s,t);function s(){return t!==null&&t.apply(this,arguments)||this}return s.prototype.render=function(){return o.createElement("div",{className:"calendly-spinner"},o.createElement("div",{className:"calendly-bounce1"}),o.createElement("div",{className:"calendly-bounce2"}),o.createElement("div",{className:"calendly-bounce3"}))},s})(o.Component),Fe="calendly-inline-widget",We=(function(t){T(s,t);function s(a){var n=t.call(this,a)||this;return n.state={isLoading:!0},n.onLoad=n.onLoad.bind(n),n}return s.prototype.onLoad=function(){this.setState({isLoading:!1})},s.prototype.render=function(){var a=X({url:this.props.url,pageSettings:this.props.pageSettings,prefill:this.props.prefill,utm:this.props.utm,embedType:"Inline"}),n=this.props.LoadingSpinner||J;return o.createElement("div",{className:this.props.className||Fe,style:this.props.styles||{}},this.state.isLoading&&o.createElement(n,null),o.createElement("iframe",{width:"100%",height:"100%",frameBorder:"0",title:this.props.iframeTitle||"Calendly Scheduling Page",onLoad:this.onLoad,src:a}))},s})(o.Component),Ue=(function(t){T(s,t);function s(a){var n=t.call(this,a)||this;return n.state={isLoading:!0},n.onLoad=n.onLoad.bind(n),n}return s.prototype.onLoad=function(){this.setState({isLoading:!1})},s.prototype.render=function(){var a=X({url:this.props.url,pageSettings:this.props.pageSettings,prefill:this.props.prefill,utm:this.props.utm,embedType:"Inline"}),n=this.props.LoadingSpinner||J;return o.createElement(o.Fragment,null,this.state.isLoading&&o.createElement(n,null),o.createElement("iframe",{width:"100%",height:"100%",frameBorder:"0",title:this.props.iframeTitle||"Calendly Scheduling Page",onLoad:this.onLoad,src:a}))},s})(o.Component),ee=(function(t){if(!t.open)return null;if(!t.rootElement)throw new Error("[react-calendly]: PopupModal rootElement property cannot be undefined");return ye.createPortal(o.createElement("div",{className:"calendly-overlay"},o.createElement("div",{onClick:t.onModalClose,className:"calendly-close-overlay"}),o.createElement("div",{className:"calendly-popup"},o.createElement("div",{className:"calendly-popup-content"},o.createElement(Ue,M({},t)))),o.createElement("button",{className:"calendly-popup-close",onClick:t.onModalClose,"aria-label":"Close modal",style:{display:"block",border:"none",padding:0}})),t.rootElement)});(function(t){T(s,t);function s(a){var n=t.call(this,a)||this;return n.state={isOpen:!1},n.onClick=n.onClick.bind(n),n.onClose=n.onClose.bind(n),n}return s.prototype.onClick=function(a){a.preventDefault(),this.setState({isOpen:!0})},s.prototype.onClose=function(a){a.stopPropagation(),this.setState({isOpen:!1})},s.prototype.render=function(){return o.createElement(o.Fragment,null,o.createElement("button",{onClick:this.onClick,style:this.props.styles||{},className:this.props.className||""},this.props.text),o.createElement(ee,M({},this.props,{open:this.state.isOpen,onModalClose:this.onClose,rootElement:this.props.rootElement})))},s})(o.Component);(function(t){T(s,t);function s(a){var n=t.call(this,a)||this;return n.state={isOpen:!1},n.onClick=n.onClick.bind(n),n.onClose=n.onClose.bind(n),n}return s.prototype.onClick=function(){this.setState({isOpen:!0})},s.prototype.onClose=function(a){a.stopPropagation(),this.setState({isOpen:!1})},s.prototype.render=function(){return o.createElement("div",{className:"calendly-badge-widget",onClick:this.onClick},o.createElement("div",{className:"calendly-badge-content",style:{background:this.props.color||"#00a2ff",color:this.props.textColor||"#ffffff"}},this.props.text||"Schedule time with me",this.props.branding&&o.createElement("span",null,"powered by Calendly")),o.createElement(ee,M({},this.props,{open:this.state.isOpen,onModalClose:this.onClose,rootElement:this.props.rootElement})))},s})(o.Component);const He="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-dashboard-card transition-shadow duration-200 hover:shadow-dashboard-card-hover sm:flex-row sm:items-center sm:justify-between",Ve=()=>{const t=W(),{activeStoreId:s}=Y(),{storeSubdomain:a,getByStoreId:n,loading:u,error:m}=Z();o.useEffect(()=>{s&&n(s)},[s,n]);const x=o.useCallback(()=>{t("/settings/domains")},[t]);return e.jsxs("div",{className:He,children:[e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("h3",{className:"text-base font-semibold text-slate-900",children:"Customize your domain"}),m?e.jsx("p",{className:"mt-1 text-sm text-red-600",children:m}):e.jsxs("p",{className:"mt-1 text-sm text-slate-600",children:["Default domain:"," ",u?e.jsx("span",{className:"text-slate-400",children:"Loading…"}):a?.url?e.jsx("a",{href:a.url,target:"_blank",rel:"noopener noreferrer",className:"font-medium text-slate-900 underline decoration-slate-300 underline-offset-2 transition-colors hover:text-blue-600",children:a.url.replace(/^https?:\/\//,"")}):e.jsx("span",{className:"text-slate-400",children:"—"})]})]}),e.jsx("button",{type:"button",onClick:x,className:"inline-flex w-full shrink-0 items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 sm:w-auto",children:"Manage"})]})};function Be(){const[t,s]=o.useState(!0),a=o.useCallback(()=>s(!1),[]);return t?e.jsxs("div",{className:"relative flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-slate-100/80 px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5",children:[e.jsxs("div",{className:"flex min-w-0 items-start gap-3 sm:items-center",children:[e.jsx("span",{className:"flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80",children:e.jsx(Le,{className:"h-5 w-5 text-amber-500","aria-hidden":!0})}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("p",{className:"text-sm font-semibold text-slate-900",children:"Upgrade your plan to unlock advanced features"}),e.jsx("p",{className:"mt-0.5 text-xs text-slate-600 sm:text-sm",children:"More automation, reporting, and growth tools when you're ready."})]})]}),e.jsxs("div",{className:"flex shrink-0 items-center gap-2 pl-[52px] sm:pl-0",children:[e.jsxs(ae,{to:"/settings/plan",className:"inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700",children:["Select plan",e.jsx("span",{"aria-hidden":!0,children:"→"})]}),e.jsx("button",{type:"button",onClick:a,className:"rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/80 hover:text-slate-800","aria-label":"Dismiss",children:e.jsx(U,{className:"h-5 w-5"})})]})]}):null}const Ge=({steps:t=[{id:"theme",title:"Make your store stand out with the right theme",buttonText:"Configure Theme",buttonVariant:"primary"},{id:"domain",title:"Set your own domain for your store",description:"Added Domain: fashion-0-60058040737.ziplofy.com",buttonText:"Add Domain",buttonVariant:"primary"},{id:"items",title:"Add all the items that you'll be selling on your store",buttonText:"Add Items",buttonVariant:"primary"},{id:"shipping",title:"Set up shipping zones to deliver your items efficiently",buttonText:"Setup",buttonVariant:"primary"},{id:"payment",title:"Connect payment gateways to start accepting online payments",buttonText:"Configure Online Payments",buttonVariant:"primary"}],onStepClick:s,onTestOrderClick:a})=>{const n=o.useCallback(m=>{s?s(m):console.log("Step clicked:",m)},[s]),u=o.useCallback(()=>{a?a():console.log("Test order clicked")},[a]);return e.jsxs("div",{className:"bg-white rounded-xl p-5 border border-gray-200/80 shadow-sm",children:[e.jsx("div",{className:"mb-4 pl-3 border-l-4 border-blue-600",children:e.jsx("h2",{className:"text-base font-semibold text-gray-900",children:"Complete these few steps to launch your store"})}),e.jsx("div",{className:"space-y-3 mb-4",children:t.map(m=>e.jsxs("div",{className:"flex items-center justify-between gap-4 p-4 bg-page-background-color rounded-lg border border-gray-200/80",children:[e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-sm font-medium text-gray-900 mb-0.5",children:m.title}),m.description&&e.jsx("p",{className:"text-xs text-gray-500 truncate mt-0.5",children:m.description})]}),e.jsx("button",{onClick:()=>n(m.id),className:`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${m.buttonVariant==="added"?"bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100":"bg-blue-600 text-white border border-blue-600 hover:bg-blue-700"}`,children:m.buttonText})]},m.id))}),e.jsx("div",{className:"bg-blue-600 rounded-lg p-4",children:e.jsxs("div",{className:"flex items-center justify-between gap-4",children:[e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("h3",{className:"text-sm font-semibold text-white mb-0.5",children:"Try placing a test order yourself"}),e.jsx("p",{className:"text-xs text-blue-100",children:"Experience how the process works from start to finish"})]}),e.jsx("button",{onClick:u,className:"px-4 py-2 text-sm font-medium text-blue-600 bg-white rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap flex-shrink-0",children:"See How It Works"})]})})]})},Ye=({resource:t,onClick:s})=>e.jsxs("button",{onClick:()=>s?.(t.id),className:"w-full flex items-center gap-3 p-3 bg-page-background-color border border-gray-200/80 rounded-lg hover:bg-blue-50 hover:border-blue-200/80 transition-colors text-left",children:[e.jsx("div",{className:"flex-shrink-0 w-5 h-5 flex items-center justify-center",children:t.icon}),e.jsx("div",{className:"flex-1 min-w-0",children:e.jsx("p",{className:"text-sm font-medium text-gray-900",children:t.title})}),e.jsx("div",{className:"flex-shrink-0",children:e.jsx(q,{className:"w-4 h-4 text-blue-500"})})]}),Ze=({resources:t=[{id:"help-center",title:"Visit our Help Center",icon:e.jsx("svg",{className:"w-5 h-5 text-blue-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"})})},{id:"academy",title:"Try our Academy Page",icon:e.jsx("svg",{className:"w-5 h-5 text-blue-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"})})},{id:"forum",title:"Try our Forum Area",icon:e.jsx("svg",{className:"w-6 h-6 text-blue-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"})})}],onResourceClick:s})=>{const a=o.useCallback(n=>{s?s(n):console.log("Resource clicked:",n)},[s]);return e.jsxs("div",{className:"bg-white rounded-xl p-5 border border-gray-200/80 shadow-sm flex-1",children:[e.jsx("div",{className:"mb-4 pl-3 border-l-4 border-blue-600",children:e.jsx("h3",{className:"text-base font-semibold text-gray-900",children:"Other Helpful Resources"})}),e.jsx("div",{className:"space-y-2.5",children:t.map(n=>e.jsx(Ye,{resource:n,onClick:a},n.id))})]})},$=({item:t,onClick:s})=>e.jsxs("button",{onClick:()=>s?.(t.id),className:"w-full flex items-start gap-3 p-3 bg-page-background-color border border-gray-200/80 rounded-lg hover:bg-blue-50 hover:border-blue-200/80 transition-colors text-left",children:[e.jsx("div",{className:"flex-shrink-0 w-8 h-8 flex items-center justify-center",children:t.icon}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("h4",{className:"text-sm font-medium text-gray-900 mb-1",children:t.title}),e.jsx("p",{className:"text-xs text-gray-600",children:t.description})]}),e.jsx("div",{className:"flex-shrink-0",children:e.jsx(q,{className:"w-4 h-4 text-blue-500"})})]}),qe=({onItemClick:t})=>{const s=o.useCallback(a=>{t?t(a):console.log("Improvement item clicked:",a)},[t]);return e.jsxs("div",{className:"bg-white rounded-xl p-5 border border-gray-200/80 shadow-sm",children:[e.jsx("div",{className:"mb-4 pl-3 border-l-4 border-blue-600",children:e.jsx("h3",{className:"text-base font-semibold text-gray-900",children:"Here are some ways to improve your store"})}),e.jsxs("div",{className:"flex gap-3",children:[e.jsxs("div",{className:"flex-1 flex gap-2 flex-col",children:[e.jsx($,{item:{id:"taxes",title:"Set Up taxes",description:"Configure Tax Rates & Rules to boost Sales",icon:e.jsxs("svg",{className:"w-5 h-5 text-blue-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:[e.jsx("circle",{cx:"7",cy:"11",r:"2.5",strokeWidth:1.5}),e.jsx("circle",{cx:"15",cy:"13",r:"2.5",strokeWidth:1.5}),e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:1.5,d:"M7 11l8 2"}),e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 4v3m0 10v3"}),e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:1.5,d:"M19 6l-3 3M5 16l3-3"})]})},onClick:s}),e.jsx($,{item:{id:"collections",title:"Manage Collections",description:"Combine different items to show under a common filter",icon:e.jsxs("svg",{className:"w-5 h-5 text-blue-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:[e.jsx("rect",{x:"6",y:"4",width:"12",height:"4",rx:"1",strokeWidth:1.5}),e.jsx("rect",{x:"6",y:"10",width:"12",height:"4",rx:"1",strokeWidth:1.5}),e.jsx("rect",{x:"6",y:"16",width:"12",height:"4",rx:"1",strokeWidth:1.5})]})},onClick:s})]}),e.jsxs("div",{className:"flex-1 flex gap-2 flex-col",children:[e.jsx($,{item:{id:"coupons",title:"Create Coupons",description:"Add and manage discounts for orders",icon:e.jsx("svg",{className:"w-5 h-5 text-blue-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"})})},onClick:s}),e.jsx($,{item:{id:"shipping",title:"Shipping Integration",description:"Integrate with shipping carriers for real-time tracking and shipping",icon:e.jsx("svg",{className:"w-5 h-5 text-blue-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"})})},onClick:s})]})]})]})},Ke="/assets/all-about-ziplofy-Bvbz7z7C.png",Qe=({videoUrl:t,title:s="Watch a quick overview video",onPlay:a})=>e.jsxs("div",{className:"bg-white rounded-xl p-5 border border-gray-200/80 shadow-sm flex-1",children:[e.jsx("div",{className:"mb-4 pl-3 border-l-4 border-blue-600",children:e.jsx("h3",{className:"text-base font-semibold text-gray-900",children:"Watch a quick overview video"})}),e.jsx("div",{className:"relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden",children:t?e.jsx("iframe",{src:t,className:"w-full h-full",frameBorder:"0",allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",allowFullScreen:!0,title:"Overview Video"}):e.jsx("img",{src:Ke,alt:"All About Ziplofy",className:"w-full h-full object-cover"})})]}),Xe=({onStepClick:t,onTestOrderClick:s,onImprovementClick:a,onResourceClick:n})=>e.jsxs("div",{className:"flex flex-col gap-6",children:[e.jsxs("div",{children:[e.jsxs("h1",{className:"text-2xl font-bold text-gray-900 tracking-tight",children:["Welcome to ",e.jsx("span",{className:"text-blue-600",children:"Ziplofy"})]}),e.jsx("p",{className:"mt-1 text-sm text-gray-500",children:"Let's set up your e-commerce store and manage your business effectively"})]}),e.jsx(Ge,{onStepClick:t,onTestOrderClick:s}),e.jsx(qe,{onItemClick:a}),e.jsxs("div",{className:"flex gap-4",children:[e.jsx(Qe,{}),e.jsx(Ze,{onResourceClick:n})]})]}),P=[{id:"welcome",title:"Welcome to Ziplofy! 🎉",description:"We're excited to have you here! Let's take a quick tour to help you get started with managing your store.",icon:e.jsx(re,{className:"w-7 h-7"}),position:"center",action:"next"},{id:"home",title:"Dashboard Overview",description:"This is your home dashboard. View your sales, revenue, and key metrics at a glance.",icon:e.jsx(le,{className:"w-5 h-5"}),targetSelector:'[data-tour-id="nav-home"]',targetPath:"/",position:"right",action:"next"},{id:"products",title:"Manage Products",description:"Add products, manage inventory, create collections, and organize your entire catalog.",icon:e.jsx(ce,{className:"w-5 h-5"}),targetSelector:'[data-tour-id="nav-products"]',targetPath:"/products",position:"right",action:"next"},{id:"orders",title:"Handle Orders",description:"Process customer orders, manage fulfillment, handle returns, and track shipments.",icon:e.jsx(de,{className:"w-5 h-5"}),targetSelector:'[data-tour-id="nav-orders"]',targetPath:"/orders",position:"right",action:"next"},{id:"customers",title:"Customer Management",description:"View customer details, create segments, and build lasting relationships with your buyers.",icon:e.jsx(ue,{className:"w-5 h-5"}),targetSelector:'[data-tour-id="nav-customers"]',targetPath:"/customers",position:"right",action:"next"},{id:"discounts",title:"Create Discounts",description:"Set up discount codes, automatic promotions, and special offers to boost your sales.",icon:e.jsx(me,{className:"w-5 h-5"}),targetSelector:'[data-tour-id="nav-discounts"]',targetPath:"/discounts",position:"right",action:"next"},{id:"analytics",title:"View Analytics",description:"Track your store performance with detailed reports and real-time analytics.",icon:e.jsx(pe,{className:"w-5 h-5"}),targetSelector:'[data-tour-id="nav-analytics"]',targetPath:"/analytics",position:"right",action:"next"},{id:"settings",title:"Store Settings",description:"Configure payments, shipping, taxes, domains, and customize your store experience.",icon:e.jsx(he,{className:"w-5 h-5"}),targetSelector:'[data-tour-id="nav-settings"]',targetPath:"/settings/general",position:"right",action:"next"},{id:"complete",title:"You're All Set! 🚀",description:"Congratulations! You now know your way around Ziplofy. Start building your successful online business!",icon:e.jsx(Q,{className:"w-7 h-7"}),position:"center",action:"next"}],Je=({onComplete:t})=>{const s=W(),a=ie(),[n,u]=o.useState(()=>{const r=localStorage.getItem("ziplofy_onboarding_step");return r?parseInt(r,10):0}),[m,x]=o.useState(!0),[c,f]=o.useState({top:0,left:0,arrowPosition:"none"}),[i,h]=o.useState(null),k=o.useRef(null),p=P[n],N=(n+1)/P.length*100,w=o.useCallback(()=>{if(!p.targetSelector){h(null),f({top:0,left:0,arrowPosition:"none"});return}const r=document.querySelector(p.targetSelector);if(!r){h(null);return}const l=r.getBoundingClientRect();h(l);const j=340,d=220,v=16,L=20;let _=l.top+l.height/2-d/2,R=l.right+v,I="left";R+j>window.innerWidth-v&&(R=l.left-j-v,I="left"),_<v?_=v:_+d>window.innerHeight-v&&(_=window.innerHeight-d-v),(p.position==="bottom"||p.position==="bottom-right")&&(_=l.bottom+v+L,R=l.left,I="top"),f({top:_,left:R,arrowPosition:I})},[p]);o.useEffect(()=>{w(),window.addEventListener("resize",w),window.addEventListener("scroll",w);const r=setTimeout(w,100);return()=>{window.removeEventListener("resize",w),window.removeEventListener("scroll",w),clearTimeout(r)}},[w,n]),o.useEffect(()=>{localStorage.setItem("ziplofy_onboarding_step",n.toString())},[n]);const E=o.useCallback(()=>{if(n<P.length-1){const r=P[n+1];r.targetPath&&a.pathname!==r.targetPath&&s(r.targetPath),u(l=>l+1)}else S()},[n,a.pathname,s]),g=o.useCallback(()=>{S()},[]),S=o.useCallback(()=>{x(!1),localStorage.removeItem("ziplofy_onboarding_step"),setTimeout(()=>{localStorage.setItem("ziplofy_onboarding_complete","true"),t()},300)},[t]),b=o.useCallback(r=>{r.key==="Escape"?g():r.key==="ArrowRight"||r.key==="Enter"?E():r.key==="ArrowLeft"&&n>0&&u(l=>l-1)},[E,g,n]);o.useEffect(()=>(window.addEventListener("keydown",b),()=>window.removeEventListener("keydown",b)),[b]);const y=p.position==="center"||!p.targetSelector;return e.jsx(Me,{children:m&&e.jsxs(e.Fragment,{children:[e.jsx(C.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},transition:{duration:.3},className:"fixed inset-0 z-[9998] pointer-events-none",style:{background:"rgba(0,0,0,0.75)",clipPath:i?`polygon(
                    0% 0%, 
                    0% 100%, 
                    ${i.left-8}px 100%, 
                    ${i.left-8}px ${i.top-8}px, 
                    ${i.right+8}px ${i.top-8}px, 
                    ${i.right+8}px ${i.bottom+8}px, 
                    ${i.left-8}px ${i.bottom+8}px, 
                    ${i.left-8}px 100%, 
                    100% 100%, 
                    100% 0%
                  )`:"none"}}),i&&e.jsx(C.div,{initial:{opacity:0,scale:.95},animate:{opacity:1,scale:1},exit:{opacity:0,scale:.95},transition:{duration:.3},className:"fixed z-[9999] pointer-events-none",style:{top:i.top-8,left:i.left-8,width:i.width+16,height:i.height+16,borderRadius:"12px",border:"3px solid #3b82f6",boxShadow:"0 0 20px 4px rgba(59, 130, 246, 0.5), inset 0 0 20px 4px rgba(59, 130, 246, 0.1)",background:"transparent"}}),i&&e.jsx(C.div,{initial:{opacity:0},animate:{opacity:[.4,.8,.4],scale:[1,1.1,1]},transition:{duration:2,repeat:1/0,ease:"easeInOut"},className:"fixed z-[9997] pointer-events-none",style:{top:i.top-12,left:i.left-12,width:i.width+24,height:i.height+24,borderRadius:"16px",border:"2px solid rgba(59, 130, 246, 0.6)",background:"transparent"}}),e.jsxs(C.div,{ref:k,initial:{opacity:0,scale:.9,y:y?20:0,x:y?0:-10},animate:{opacity:1,scale:1,y:0,x:0},exit:{opacity:0,scale:.9},transition:{type:"spring",damping:25,stiffness:300},className:"fixed z-[10000]",style:y?{left:"50%",top:"50%",transform:"translate(-50%, -50%)"}:{top:c.top,left:c.left},children:[e.jsxs("div",{className:"relative bg-white rounded-2xl shadow-2xl w-[340px] overflow-hidden",children:[!y&&c.arrowPosition==="left"&&e.jsx("div",{className:"absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0",style:{borderTop:"10px solid transparent",borderBottom:"10px solid transparent",borderRight:"10px solid white"}}),!y&&c.arrowPosition==="top"&&e.jsx("div",{className:"absolute left-8 -top-2 w-0 h-0",style:{borderLeft:"10px solid transparent",borderRight:"10px solid transparent",borderBottom:"10px solid white"}}),e.jsx("div",{className:"h-1 bg-gray-100",children:e.jsx(C.div,{className:"h-full bg-gradient-to-r from-blue-500 to-blue-600",initial:{width:0},animate:{width:`${N}%`},transition:{duration:.3}})}),e.jsxs("div",{className:"p-5",children:[e.jsxs("div",{className:"flex items-center justify-between mb-4",children:[e.jsx("div",{className:"flex items-center gap-1.5",children:P.map((r,l)=>e.jsx(C.div,{className:`h-1.5 rounded-full transition-all duration-300 ${l===n?"w-5 bg-blue-500":l<n?"w-1.5 bg-blue-300":"w-1.5 bg-gray-200"}`},l))}),e.jsx("button",{onClick:g,className:"p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors",children:e.jsx(U,{className:"w-4 h-4"})})]}),e.jsx(C.div,{initial:{scale:0,rotate:-180},animate:{scale:1,rotate:0},transition:{type:"spring",damping:15,stiffness:200},className:`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${p.id==="welcome"||p.id==="complete"?"bg-gradient-to-br from-blue-500 to-purple-600 text-white":"bg-blue-50 text-blue-600"}`,children:p.icon},p.id),e.jsxs(C.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},transition:{delay:.1},children:[e.jsx("h3",{className:"text-lg font-bold text-gray-900 mb-2",children:p.title}),e.jsx("p",{className:"text-sm text-gray-500 leading-relaxed mb-5",children:p.description})]},`content-${p.id}`),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("button",{onClick:g,className:"text-xs text-gray-400 hover:text-gray-600 transition-colors",children:"Skip tour"}),e.jsxs("div",{className:"flex items-center gap-2",children:[n>0&&e.jsx(C.button,{initial:{opacity:0,x:10},animate:{opacity:1,x:0},onClick:()=>{const r=P[n-1];r.targetPath&&s(r.targetPath),u(l=>l-1)},className:"px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors",children:"Back"}),e.jsx(C.button,{whileHover:{scale:1.02},whileTap:{scale:.98},onClick:E,className:"inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25",children:n===P.length-1?e.jsxs(e.Fragment,{children:[e.jsx(Q,{className:"w-3.5 h-3.5"}),"Get Started"]}):e.jsxs(e.Fragment,{children:["Next",e.jsx(Se,{className:"w-3.5 h-3.5"})]})})]})]})]}),e.jsx("div",{className:"absolute -top-16 -right-16 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"})]}),y&&e.jsxs(e.Fragment,{children:[e.jsx(C.div,{animate:{y:[0,-8,0],rotate:[0,5,0]},transition:{duration:3,repeat:1/0,ease:"easeInOut"},className:"absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-lg shadow-lg",children:"✨"}),e.jsx(C.div,{animate:{y:[0,8,0],rotate:[0,-5,0]},transition:{duration:4,repeat:1/0,ease:"easeInOut",delay:.5},className:"absolute -bottom-4 -left-4 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-base shadow-lg",children:"🚀"})]})]}),e.jsxs(C.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:.5},className:"fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-4 text-white/50 text-xs",children:[e.jsxs("span",{className:"flex items-center gap-1.5",children:[e.jsx("kbd",{className:"px-1.5 py-0.5 bg-white/10 rounded text-[10px]",children:"←"}),e.jsx("kbd",{className:"px-1.5 py-0.5 bg-white/10 rounded text-[10px]",children:"→"}),"Navigate"]}),e.jsxs("span",{className:"flex items-center gap-1.5",children:[e.jsx("kbd",{className:"px-1.5 py-0.5 bg-white/10 rounded text-[10px]",children:"Esc"}),"Skip"]})]})]})})};function ct(){const t=W(),[s,a]=o.useState(!1),[n,u]=o.useState("dashboard"),[m,x]=o.useState(!1),{socket:c}=fe(),{loggedInUser:f}=xe(),{activeStoreId:i}=Y(),{storeSubdomain:h,getByStoreId:k}=Z();o.useEffect(()=>{i&&k(i)},[i,k]);const p=h?.url?.trim()||void 0;o.useEffect(()=>{const d=()=>{x(!0)};return window.addEventListener("ziplofy-show-tour",d),()=>{window.removeEventListener("ziplofy-show-tour",d)}},[]);const N=o.useCallback(()=>{x(!1)},[]),w=o.useRef(null);o.useCallback(()=>{c&&c.connected?c.emit("hireDeveloper"):D.error("socket not connected")},[c]),o.useCallback(()=>{c&&c.connected?(c.emit(ge.EndMeeting),D.success("we have notified the developer to send requirements form, so that you can approve it")):D.error("Socket not connected")},[c,f?.assignedSupportDeveloperId?.id]),o.useCallback(()=>{a(!0)},[]);const E=o.useCallback(d=>{switch(d){case"items":t("/products");break;case"theme":t("/themes/all-themes");break;case"domain":t("/settings/domains");break;case"shipping":t("/settings/shipping-and-delivery");break;case"payment":t("/settings/payments");break;default:console.log("Step clicked:",d)}},[t]),g=o.useCallback(d=>{switch(d){case"taxes":t("/settings/taxes-and-duties");break;case"collections":t("/products/collections");break;case"coupons":t("/discounts");break;case"shipping":t("/settings/shipping-and-delivery");break;case"digital-downloads":t("/settings/digital-downloads");break;default:console.log("Improvement item clicked:",d)}},[t]),S=o.useMemo(()=>{if(!f?.assignedSupportDeveloperId)return console.log("No assigned developer found"),"https://calendly.com/default/30min";const d=f.assignedSupportDeveloperId?.email;console.log("Developer email:",d);const v="gibberish";console.log("Extracted username:",v);const L=`https://calendly.com/${v}/30min`;return console.log("Generated Calendly URL:",L),L},[f?.assignedSupportDeveloperId]),b=o.useCallback(()=>{a(!1)},[]),y=o.useCallback(d=>{w.current&&!w.current.contains(d.target)&&b()},[b]),r=o.useCallback(d=>{d.key==="Escape"&&s&&b()},[s,b]),l=o.useCallback(d=>{d.stopPropagation()},[]);o.useCallback(()=>{console.log("Ask AI clicked")},[]),o.useCallback(()=>{console.log("Get tasks updates clicked")},[]),o.useCallback(()=>{console.log("Create workspace clicked")},[]),o.useCallback(()=>{console.log("Connect apps clicked")},[]),o.useEffect(()=>(s&&(document.addEventListener("mousedown",y),document.body.style.overflow="hidden"),()=>{document.removeEventListener("mousedown",y),document.body.style.overflow="unset"}),[s,y]),o.useEffect(()=>(s&&document.addEventListener("keydown",r),()=>{document.removeEventListener("keydown",r)}),[s,r]);const j=f?.name?.split(" ")[0]||"User";return e.jsxs(e.Fragment,{children:[m&&e.jsx(Je,{onComplete:N}),e.jsx("div",{className:"min-h-[calc(100vh-48px)] w-full bg-dashboard-canvas",children:e.jsxs("div",{className:"mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8",children:[e.jsxs("div",{className:"mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between",children:[e.jsxs("div",{className:"min-w-0",children:[e.jsxs("h1",{className:"text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl",children:["Welcome back",j!=="User"?`, ${j}`:""]}),e.jsx("p",{className:"mt-2 text-base text-slate-500",children:"Here's what's happening with your store today."})]}),p?e.jsxs("a",{href:p,target:"_blank",rel:"noopener noreferrer",className:"inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800",children:[e.jsx(be,{className:"h-4 w-4","aria-hidden":!0}),"Open store"]}):null]}),e.jsxs("div",{className:"mb-8 space-y-6",children:[e.jsx(Be,{}),e.jsx("div",{className:"inline-flex w-fit items-center gap-0.5 rounded-full border border-slate-200/90 bg-white p-1 shadow-dashboard-card",role:"tablist","aria-label":"Home sections",children:["dashboard","getting-started"].map(d=>e.jsxs("button",{type:"button",role:"tab","aria-selected":n===d,onClick:()=>u(d),className:`${n===d?"":"text-slate-600 hover:bg-slate-50 hover:text-slate-900"} relative rounded-full px-5 py-2 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-blue-500/40`,style:{WebkitTapHighlightColor:"transparent"},children:[n===d&&e.jsx(C.span,{layoutId:"home-tab-bubble",className:"absolute inset-0 z-0 bg-blue-600 shadow-sm",style:{borderRadius:9999},transition:{type:"spring",bounce:.2,duration:.5}}),e.jsx("span",{className:`relative z-10 ${n===d?"text-white":""}`,children:d==="dashboard"?"Dashboard":"Getting started"})]},d))})]}),n==="dashboard"?e.jsxs("div",{className:"flex flex-col gap-8 animate-tab-fade",children:[e.jsx(ve,{}),e.jsx(Ve,{})]},"dashboard"):e.jsx("div",{className:"animate-tab-fade",children:e.jsx(Xe,{onStepClick:E,onImprovementClick:g})},"getting-started")]})}),s&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0 bg-black/50 backdrop-blur-sm z-[1400]",onClick:b,"aria-hidden":"true"}),e.jsx("div",{className:"fixed inset-0 z-[1500] flex items-center justify-center p-4 pointer-events-none",children:e.jsxs("div",{ref:w,className:"bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl pointer-events-auto",onClick:l,children:[e.jsx("button",{onClick:b,className:"absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white/90 rounded-lg transition-colors z-10","aria-label":"Close",children:e.jsx(U,{className:"w-5 h-5 text-gray-500"})}),e.jsx("div",{className:"relative h-[80vh] min-h-[600px]",children:e.jsx(We,{url:S,styles:{height:"100%",width:"100%"},pageSettings:{backgroundColor:"ffffff",hideEventTypeDetails:!1,hideLandingPageDetails:!1,primaryColor:"4caf50",textColor:"4d5055"},prefill:{name:f?.name||"",email:f?.email||""},utm:{utmCampaign:"developer-meeting",utmSource:"ziplofy",utmMedium:"website"}})})]})})]})]})}export{ct as default};
