"use strict";(self.webpackChunkberry_free_material_react_cra=self.webpackChunkberry_free_material_react_cra||[]).push([[970],{6970:function(e,r,t){t.r(r),t.d(r,{default:function(){return M}});var n=t(7313),a=t(4631),o=t(9019),s=t(3497),i=t(4813),c=t(1113),l=t(1727),d=t(2247),h=t(6104),u=t(1095),m=t(9860),p=t(8165),v=t(9632),x=t(5919),f=t(6305),Z=t(2018),g=t(4090),j=t(8400),b=t(6287),S=t(7122),y=t(1163),C=t(2322),_=t(3463),k=t(9429),w=t(659),P=t(7114),z=t.n(P),B=t(1399),A=t.n(B),T=t(5281),E=t(6417);function M(){const e=(0,m.Z)(),{user:r}=(0,S.E)(),{logout:t}=(0,w.a)(),P=(0,i.Z)(e.breakpoints.down("md")),[B,M]=(0,n.useState)([]),[N,I]=(0,n.useState)([]),$=(new Date).toISOString().split("T")[0],V=A()(z().mixin({toast:!0,position:"bottom-end",iconColor:"white",customClass:{popup:"colored-toast"},showConfirmButton:!1,timer:3500,timerProgressBar:!0})),D=()=>{V.fire({icon:"success",title:"Lead Added Successfully."})},H=e=>{V.fire({icon:"error",title:e||"Error Adding Lead."})},[q,L]=(0,n.useState)({name:"",nic:"",dob:"",email:"",contact_no:"",address:"",date:$,scheduled_to:"",course:"",branch:""});(0,n.useEffect)((()=>{(async()=>{try{const e=await fetch(b.Z.apiUrl+"api/courses",{method:"GET",headers:{Authorization:`Bearer ${r.token}`}});if(!e.ok){if(401===res.status)console.error("Unauthorized access. Logging out."),t();else{if(500===res.status)return console.error("Internal Server Error."),void t();console.error("Error fetching courses:",e.statusText)}return}{const r=await e.json();I(r)}}catch(e){console.error("Error fetching courses:",e.message)}})(),(async()=>{try{const e=await fetch(b.Z.apiUrl+"api/branches",{method:"GET",headers:{Authorization:`Bearer ${r.token}`}});if(e.ok){const r=await e.json();M(r)}else if(401===e.status)console.error("Unauthorized access. Logging out."),t();else{if(500===e.status)return console.error("Internal Server Error."),void t();console.error("Error fetching branches:",e.statusText)}}catch(e){console.error("Error fetching branches:",e.message)}})(),(async()=>{try{const e=await fetch(b.Z.apiUrl+"api/status",{method:"GET",headers:{Authorization:`Bearer ${r.token}`}});if(e.ok){const r=await e.json();setStatuses(r)}else if(401===e.status)console.error("Unauthorized access. Logging out."),t();else{if(500===e.status)return console.error("Internal Server Error."),void t();console.error("Error fetching statuses:",e.statusText)}}catch(e){console.error("Error fetching statuses:",e.message)}})(),console.log($)}),[]);return(0,E.jsx)(E.Fragment,{children:(0,E.jsx)(s.Z,{title:"Add Lead",children:(0,E.jsx)(k.J9,{initialValues:{name:q.name||"",nic:q.nic||"",address:q.address||"",contact_no:q.contact_no||"",email:q.email||"",course:q.course||"",date:q.date||"",branch:q.branch||"",dob:q.dob||"",scheduled_to:q.scheduled_to||""},validationSchema:_.Ry().shape({name:_.Z_().required("Name is required"),nic:_.Z_().matches(/^(?:\d{9}[vVxX]|\d{12})$/,"NIC should either contain 9 digits with an optional last character as a letter (v/V/x/X) or have exactly 12 digits").required("NIC is required"),dob:_.Z_().required("Date of birth is required"),contact_no:_.Z_().matches(/^\+?\d{10,12}$/,"Contact No should be 10 to 12 digits with an optional leading + sign").required("Contact No is required"),email:_.Z_().email("Invalid email format").required("Email is required"),address:_.Z_().required("Address is required"),course:_.Z_().required("Course is required"),branch:_.Z_().required("Branch is required")}),onSubmit:async(e,t)=>{let{setSubmitting:n,setFieldError:a}=t;console.log("Submitting form with values:",e);try{const t=await fetch(b.Z.apiUrl+`api/checkLead?courseName=${e.course}&branchName=${e.branch}&studentNIC=${e.nic}`,{method:"GET",headers:{Authorization:`Bearer ${r.token}`}});if(!t.ok)return void console.error("Error checking duplicates",t.statusText);const a=await t.json();if(console.log("Check",a.isDuplicate),a.isDuplicate)return console.log("Lead already exists"),void H("Lead with the same student's NIC, course and branch already exists.");const o=await fetch(b.Z.apiUrl+`api/students?nic=${e.nic}&email=${e.email}`,{method:"GET",headers:{Authorization:`Bearer ${r.token}`}});if(!o.ok)return void console.error("Error checking existing student",o.statusText);const s=(await o.json()).find((r=>r.nic===e.nic||r.email===e.email));if(s){console.log("Matched Student:",s);const{isConfirmed:t}=await z().fire({title:"Student already exists",text:`Student ${s.name} already exists. Do you want to proceed with the existing student?`,icon:"warning",showCancelButton:!0,confirmButtonText:"Yes",cancelButtonText:"No"});if(!t)return void console.log("User chose not to add lead to existing student");{const t=await fetch(b.Z.apiUrl+"api/leadswithstudent",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${r.token}`},body:JSON.stringify({date:e.date,scheduled_to:e.scheduled_to,course_name:e.course,branch_name:e.branch,student_id:s._id,user_id:null===r||void 0===r?void 0:r._id})});if(!t.ok)return void console.error("Error inserting data to the lead table",t.statusText);console.log("Data inserted successfully!"),D()}}else{const t=await fetch(b.Z.apiUrl+"api/leads",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${r.token}`},body:JSON.stringify({date:e.date,scheduled_to:e.scheduled_to,course_name:e.course,branch_name:e.branch,user_id:null===r||void 0===r?void 0:r._id,name:e.name,dob:e.dob,contact_no:e.contact_no,email:e.email,address:e.address,nic:e.nic})});if(!t.ok)return void console.error("Error inserting data to the lead table",t.statusText);console.log("Data inserted successfully!"),D()}L({name:"",dob:"",email:"",contact_no:"",address:"",date:$,scheduled_to:"",course:"Computer Science",branch:"Colombo"})}catch(o){console.error("Error during data insertion:",o.message),H(),a("submit",o.message)}finally{n(!1)}},children:e=>{let{errors:r,handleBlur:t,handleChange:n,handleSubmit:s,isSubmitting:i,touched:m,values:b}=e;return(0,E.jsx)("form",{autoComplete:"off",noValidate:!0,onSubmit:s,children:(0,E.jsxs)(o.ZP,{container:!0,direction:"column",justifyContent:"center",children:[(0,E.jsxs)(o.ZP,{container:!0,sx:{p:3},spacing:P?0:2,children:[(0,E.jsxs)(o.ZP,{item:!0,xs:12,sm:6,children:[(0,E.jsx)(c.Z,{variant:"h5",component:"h5",children:"Name"}),(0,E.jsx)(a.Z,{fullWidth:!0,margin:"normal",name:"name",type:"text",onChange:n,onBlur:t,value:b.name,error:Boolean(m.name&&r.name),helperText:m.name&&r.name,InputProps:{startAdornment:(0,E.jsx)(l.Z,{position:"start",children:(0,E.jsx)(y.Z,{})})}})]}),(0,E.jsxs)(o.ZP,{item:!0,xs:12,sm:6,children:[(0,E.jsx)(c.Z,{variant:"h5",component:"h5",children:"NIC"}),(0,E.jsx)(a.Z,{fullWidth:!0,margin:"normal",name:"nic",type:"text",onChange:n,onBlur:t,value:b.nic,error:Boolean(m.nic&&r.nic),helperText:m.nic&&r.nic,InputProps:{startAdornment:(0,E.jsx)(l.Z,{position:"start",children:(0,E.jsx)(C.Z,{})})}})]}),(0,E.jsxs)(o.ZP,{item:!0,xs:12,sm:6,children:[(0,E.jsx)(c.Z,{variant:"h5",component:"h5",children:"Date of birth"}),(0,E.jsx)(a.Z,{fullWidth:!0,margin:"normal",name:"dob",type:"date",onChange:n,value:b.dob,onBlur:t,error:Boolean(m.dob&&r.dob),helperText:m.dob&&r.dob,InputProps:{startAdornment:(0,E.jsx)(l.Z,{position:"start",children:(0,E.jsx)(p.Z,{})})}})]}),(0,E.jsxs)(o.ZP,{item:!0,xs:12,sm:6,children:[(0,E.jsx)(c.Z,{variant:"h5",component:"h5",children:"Email"}),(0,E.jsx)(a.Z,{fullWidth:!0,margin:"normal",name:"email",type:"email",onBlur:t,onChange:n,value:b.email,error:Boolean(m.email&&r.email),helperText:m.email&&r.email,InputProps:{startAdornment:(0,E.jsx)(l.Z,{position:"start",children:(0,E.jsx)(v.Z,{})})}})]}),(0,E.jsxs)(o.ZP,{item:!0,xs:12,sm:6,children:[(0,E.jsx)(c.Z,{variant:"h5",component:"h5",children:"Contact Number"}),(0,E.jsx)(a.Z,{fullWidth:!0,margin:"normal",name:"contact_no",type:"text",onChange:n,onBlur:t,value:b.contact_no,error:Boolean(m.contact_no&&r.contact_no),helperText:m.contact_no&&r.contact_no,InputProps:{startAdornment:(0,E.jsx)(l.Z,{position:"start",children:(0,E.jsx)(f.Z,{})})}})]}),(0,E.jsxs)(o.ZP,{item:!0,xs:12,sm:12,children:[(0,E.jsx)(c.Z,{variant:"h5",component:"h5",children:"Address"}),(0,E.jsx)(a.Z,{fullWidth:!0,margin:"normal",name:"address",type:"text",onChange:n,value:b.address,onBlur:t,error:Boolean(m.address&&r.address),helperText:m.address&&r.address,InputProps:{startAdornment:(0,E.jsx)(l.Z,{position:"start",children:(0,E.jsx)(x.Z,{})})}})]}),(0,E.jsxs)(o.ZP,{item:!0,xs:12,sm:6,children:[(0,E.jsx)(c.Z,{variant:"h5",component:"h5",children:"Date"}),(0,E.jsx)(a.Z,{fullWidth:!0,margin:"normal",name:"date",type:"text",disabled:!0,onChange:n,value:b.date,InputProps:{startAdornment:(0,E.jsx)(l.Z,{position:"start",children:(0,E.jsx)(p.Z,{})})}})]}),(0,E.jsxs)(o.ZP,{item:!0,xs:12,sm:6,children:[(0,E.jsx)(c.Z,{variant:"h5",component:"h5",children:"Scheduled To"}),(0,E.jsx)(a.Z,{fullWidth:!0,margin:"normal",name:"scheduled_to",type:"date",onChange:n,value:b.scheduled_to,InputProps:{startAdornment:(0,E.jsx)(l.Z,{position:"start",children:(0,E.jsx)(Z.Z,{})})}})]}),(0,E.jsxs)(o.ZP,{item:!0,xs:12,sm:6,children:[(0,E.jsx)(c.Z,{variant:"h5",component:"h5",children:"Select Course"}),(0,E.jsxs)(a.Z,{fullWidth:!0,margin:"normal",name:"course",select:!0,onChange:n,onBlur:t,SelectProps:{native:!0},value:b.course,error:Boolean(m.course&&r.course),helperText:m.course&&r.course,InputProps:{startAdornment:(0,E.jsx)(l.Z,{position:"start",children:(0,E.jsx)(g.Z,{})})},children:[""==b.course?(0,E.jsx)("option",{value:"",disabled:!0,children:"Select Course"}):(0,E.jsx)(E.Fragment,{}),N&&N.length>0?N.map((e=>(0,E.jsx)("option",{value:e.name,children:e.name},e._id))):(0,E.jsx)("option",{value:"",disabled:!0,children:"No Courses available"})]})]}),(0,E.jsxs)(o.ZP,{item:!0,xs:12,sm:6,children:[(0,E.jsx)(c.Z,{variant:"h5",component:"h5",children:"Select Branch"}),(0,E.jsxs)(a.Z,{fullWidth:!0,margin:"normal",name:"branch",select:!0,SelectProps:{native:!0},value:b.branch,onBlur:t,onChange:n,error:Boolean(m.branch&&r.branch),helperText:m.branch&&r.branch,InputProps:{startAdornment:(0,E.jsx)(l.Z,{position:"start",children:(0,E.jsx)(j.Z,{})})},children:[""==b.branch?(0,E.jsx)("option",{value:"",disabled:!0,children:"Select Branch"}):(0,E.jsx)(E.Fragment,{}),B&&B.length>0?B.map((e=>(0,E.jsx)("option",{value:e.name,children:e.name},e._id))):(0,E.jsx)("option",{value:"",disabled:!0,children:"No Branches available"})]})]})]}),(0,E.jsx)(d.Z,{sx:{mt:3,mb:2}}),(0,E.jsx)(h.Z,{sx:{justifyContent:"flex-end"},children:(0,E.jsx)(u.Z,{variant:"contained",type:"submit",disabled:i,endIcon:i?(0,E.jsx)(T.Z,{size:20,color:"inherit"}):null,children:"Add Lead"})})]})})}})})})}},4090:function(e,r,t){var n=t(4836);r.Z=void 0;var a=n(t(5045)),o=t(6417),s=(0,a.default)((0,o.jsx)("path",{d:"M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"}),"Assignment");r.Z=s},8400:function(e,r,t){var n=t(4836);r.Z=void 0;var a=n(t(5045)),o=t(6417),s=(0,a.default)([(0,o.jsx)("path",{d:"M17 8c.7 0 1.38.1 2.02.27L12 3 4 9v12h6.76C9.66 19.63 9 17.89 9 16c0-4.42 3.58-8 8-8zm0 6.75c-.69 0-1.25.56-1.25 1.25 0 .4.2.75.5.97V22h1.5v-5.03c.3-.23.5-.57.5-.97 0-.69-.56-1.25-1.25-1.25z"},"0"),(0,o.jsx)("path",{d:"M17 12c-2.21 0-4 1.79-4 4 0 1.1.45 2.1 1.17 2.83l1.06-1.06c-.45-.45-.73-1.08-.73-1.77 0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5c0 .69-.28 1.31-.73 1.76l1.06 1.06C20.55 18.1 21 17.1 21 16c0-2.21-1.79-4-4-4z"},"1"),(0,o.jsx)("path",{d:"M17 9.5c-3.59 0-6.5 2.91-6.5 6.5 0 1.79.73 3.42 1.9 4.6l1.06-1.06C12.56 18.63 12 17.38 12 16c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.37-.56 2.62-1.46 3.52l1.07 1.06c1.17-1.18 1.89-2.8 1.89-4.58 0-3.59-2.91-6.5-6.5-6.5z"},"2")],"BroadcastOnPersonal");r.Z=s},6305:function(e,r,t){var n=t(4836);r.Z=void 0;var a=n(t(5045)),o=t(6417),s=(0,a.default)((0,o.jsx)("path",{d:"M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"}),"Call");r.Z=s},8165:function(e,r,t){var n=t(4836);r.Z=void 0;var a=n(t(5045)),o=t(6417),s=(0,a.default)((0,o.jsx)("path",{d:"M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"}),"DateRange");r.Z=s},9632:function(e,r,t){var n=t(4836);r.Z=void 0;var a=n(t(5045)),o=t(6417),s=(0,a.default)((0,o.jsx)("path",{d:"M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"}),"Email");r.Z=s},2018:function(e,r,t){var n=t(4836);r.Z=void 0;var a=n(t(5045)),o=t(6417),s=(0,a.default)((0,o.jsx)("path",{d:"M16.53 11.06 15.47 10l-4.88 4.88-2.12-2.12-1.06 1.06L10.59 17l5.94-5.94zM19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"}),"EventAvailable");r.Z=s},1163:function(e,r,t){var n=t(4836);r.Z=void 0;var a=n(t(5045)),o=t(6417),s=(0,a.default)((0,o.jsx)("path",{d:"M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"}),"Person");r.Z=s},2322:function(e,r,t){var n=t(4836);r.Z=void 0;var a=n(t(5045)),o=t(6417),s=(0,a.default)((0,o.jsx)("path",{d:"M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 6h1v12H4V6zm16 12h-1V6h1v12z"}),"WidthFull");r.Z=s},6104:function(e,r,t){t.d(r,{Z:function(){return x}});var n=t(3366),a=t(7462),o=t(7313),s=t(2197),i=t(1921),c=t(7592),l=t(7342),d=t(7430),h=t(2298);function u(e){return(0,h.ZP)("MuiCardActions",e)}(0,d.Z)("MuiCardActions",["root","spacing"]);var m=t(6417);const p=["disableSpacing","className"],v=(0,c.ZP)("div",{name:"MuiCardActions",slot:"Root",overridesResolver:(e,r)=>{const{ownerState:t}=e;return[r.root,!t.disableSpacing&&r.spacing]}})((e=>{let{ownerState:r}=e;return(0,a.Z)({display:"flex",alignItems:"center",padding:8},!r.disableSpacing&&{"& > :not(style) ~ :not(style)":{marginLeft:8}})}));var x=o.forwardRef((function(e,r){const t=(0,l.Z)({props:e,name:"MuiCardActions"}),{disableSpacing:o=!1,className:c}=t,d=(0,n.Z)(t,p),h=(0,a.Z)({},t,{disableSpacing:o}),x=(e=>{const{classes:r,disableSpacing:t}=e,n={root:["root",!t&&"spacing"]};return(0,i.Z)(n,u,r)})(h);return(0,m.jsx)(v,(0,a.Z)({className:(0,s.Z)(x.root,c),ownerState:h,ref:r},d))}))},5281:function(e,r,t){t.d(r,{Z:function(){return P}});var n=t(3366),a=t(7462),o=t(7313),s=t(2197),i=t(1921),c=t(686),l=t(1615),d=t(7342),h=t(7592),u=t(7430),m=t(2298);function p(e){return(0,m.ZP)("MuiCircularProgress",e)}(0,u.Z)("MuiCircularProgress",["root","determinate","indeterminate","colorPrimary","colorSecondary","svg","circle","circleDeterminate","circleIndeterminate","circleDisableShrink"]);var v=t(6417);const x=["className","color","disableShrink","size","style","thickness","value","variant"];let f,Z,g,j,b=e=>e;const S=44,y=(0,c.F4)(f||(f=b`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`)),C=(0,c.F4)(Z||(Z=b`
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }

  100% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -125px;
  }
`)),_=(0,h.ZP)("span",{name:"MuiCircularProgress",slot:"Root",overridesResolver:(e,r)=>{const{ownerState:t}=e;return[r.root,r[t.variant],r[`color${(0,l.Z)(t.color)}`]]}})((e=>{let{ownerState:r,theme:t}=e;return(0,a.Z)({display:"inline-block"},"determinate"===r.variant&&{transition:t.transitions.create("transform")},"inherit"!==r.color&&{color:(t.vars||t).palette[r.color].main})}),(e=>{let{ownerState:r}=e;return"indeterminate"===r.variant&&(0,c.iv)(g||(g=b`
      animation: ${0} 1.4s linear infinite;
    `),y)})),k=(0,h.ZP)("svg",{name:"MuiCircularProgress",slot:"Svg",overridesResolver:(e,r)=>r.svg})({display:"block"}),w=(0,h.ZP)("circle",{name:"MuiCircularProgress",slot:"Circle",overridesResolver:(e,r)=>{const{ownerState:t}=e;return[r.circle,r[`circle${(0,l.Z)(t.variant)}`],t.disableShrink&&r.circleDisableShrink]}})((e=>{let{ownerState:r,theme:t}=e;return(0,a.Z)({stroke:"currentColor"},"determinate"===r.variant&&{transition:t.transitions.create("stroke-dashoffset")},"indeterminate"===r.variant&&{strokeDasharray:"80px, 200px",strokeDashoffset:0})}),(e=>{let{ownerState:r}=e;return"indeterminate"===r.variant&&!r.disableShrink&&(0,c.iv)(j||(j=b`
      animation: ${0} 1.4s ease-in-out infinite;
    `),C)}));var P=o.forwardRef((function(e,r){const t=(0,d.Z)({props:e,name:"MuiCircularProgress"}),{className:o,color:c="primary",disableShrink:h=!1,size:u=40,style:m,thickness:f=3.6,value:Z=0,variant:g="indeterminate"}=t,j=(0,n.Z)(t,x),b=(0,a.Z)({},t,{color:c,disableShrink:h,size:u,thickness:f,value:Z,variant:g}),y=(e=>{const{classes:r,variant:t,color:n,disableShrink:a}=e,o={root:["root",t,`color${(0,l.Z)(n)}`],svg:["svg"],circle:["circle",`circle${(0,l.Z)(t)}`,a&&"circleDisableShrink"]};return(0,i.Z)(o,p,r)})(b),C={},P={},z={};if("determinate"===g){const e=2*Math.PI*((S-f)/2);C.strokeDasharray=e.toFixed(3),z["aria-valuenow"]=Math.round(Z),C.strokeDashoffset=`${((100-Z)/100*e).toFixed(3)}px`,P.transform="rotate(-90deg)"}return(0,v.jsx)(_,(0,a.Z)({className:(0,s.Z)(y.root,o),style:(0,a.Z)({width:u,height:u},P,m),ownerState:b,ref:r,role:"progressbar"},z,j,{children:(0,v.jsx)(k,{className:y.svg,ownerState:b,viewBox:"22 22 44 44",children:(0,v.jsx)(w,{className:y.circle,style:C,ownerState:b,cx:S,cy:S,r:(S-f)/2,fill:"none",strokeWidth:f})})}))}))}}]);