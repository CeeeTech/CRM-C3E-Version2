"use strict";(self.webpackChunkberry_free_material_react_cra=self.webpackChunkberry_free_material_react_cra||[]).push([[842],{3842:function(e,r,s){s.r(r),s.d(r,{default:function(){return _}});var n=s(7313),o=s(4631),a=s(9019),i=s(3497),t=s(4813),l=s(1113),c=s(1727),d=s(2247),u=s(6104),m=s(1095),p=s(9860),h=s(8711),f=s(4281),v=s(9632),x=s(3463),Z=s(9429),g=s(7122),w=s(6287),j=s(7114),S=s.n(j),b=s(1399),y=s.n(b),P=s(659),C=s(6417);function _(){const e=(0,p.Z)(),r=(0,t.Z)(e.breakpoints.down("md")),{user:s}=(0,g.E)(),[j,b]=(0,n.useState)({}),[_,E]=(0,n.useState)({}),{logout:z}=(0,P.a)();(0,n.useEffect)((()=>{if(s){const e={name:null===s||void 0===s?void 0:s.userName,email:null===s||void 0===s?void 0:s.userEmail};b(e)}}),[s]),(0,n.useEffect)((()=>{if(s){E({password:"",confirm_password:""})}}),[s]);const B=y()(S().mixin({toast:!0,position:"bottom-end",iconColor:"white",customClass:{popup:"colored-toast"},showConfirmButton:!1,timer:3500,timerProgressBar:!0})),A=()=>{B.fire({icon:"error",title:"Error While Saving Profile Details."})},M=()=>{B.fire({icon:"error",title:"Error While Saving Password."})};return(0,C.jsxs)(C.Fragment,{children:[(0,C.jsx)(i.Z,{title:"Manage My Profile",children:(0,C.jsx)(Z.J9,{enableReinitialize:!0,initialValues:{name:j.name||"",email:j.email||""},validationSchema:x.Ry().shape({name:x.Z_().required("Name is required"),email:x.Z_().email("Invalid email address").required("Email is required")}),onSubmit:async(e,r)=>{const n={name:e.name,email:e.email};console.log(n);try{const e=null===s||void 0===s?void 0:s._id,o=await fetch(w.Z.apiUrl+`api/updatePassword/${e}`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${s.token}`},body:JSON.stringify(n)});if(!o.ok)return void(401===o.status?(console.error("Unauthorized access. Logging out."),z()):500===o.status?(console.error("Internal Server Error."),z()):(console.error("Server response:",o),A()));const a=await o.json();console.log("Server response:",a),B.fire({icon:"success",title:"Profile Details Saved Successfully."}),z()}catch(o){console.error("Error submitting form:",o),A(),r.setErrors({submit:o.message})}finally{r.setSubmitting(!1)}},children:e=>{let{errors:s,handleBlur:n,handleChange:i,handleSubmit:t,isSubmitting:p,touched:h,values:x}=e;return(0,C.jsx)("form",{onSubmit:t,children:(0,C.jsxs)(a.ZP,{container:!0,direction:"column",justifyContent:"center",children:[(0,C.jsxs)(a.ZP,{container:!0,sx:{p:3},spacing:r?0:2,children:[(0,C.jsxs)(a.ZP,{item:!0,xs:12,sm:6,children:[(0,C.jsx)(l.Z,{variant:"h5",component:"h5",children:"Name"}),(0,C.jsx)(o.Z,{fullWidth:!0,margin:"normal",name:"name",onBlur:e=>{n(e),i(e)},onChange:i,defaultValue:j.name,value:x.name,variant:"outlined",error:Boolean(h.name&&s.name),helperText:h.name&&s.name,InputProps:{startAdornment:(0,C.jsx)(c.Z,{position:"start",children:(0,C.jsx)(f.Z,{})})}})]}),(0,C.jsxs)(a.ZP,{item:!0,xs:12,sm:6,children:[(0,C.jsx)(l.Z,{variant:"h5",component:"h5",children:"Email"}),(0,C.jsx)(o.Z,{fullWidth:!0,margin:"normal",name:"email",onBlur:n,onChange:i,value:j.email,variant:"outlined",disabled:!0,InputProps:{startAdornment:(0,C.jsx)(c.Z,{position:"start",children:(0,C.jsx)(v.Z,{})})}})]})]}),(0,C.jsx)(d.Z,{sx:{mt:3,mb:2}}),(0,C.jsx)(u.Z,{sx:{justifyContent:"flex-end"},children:(0,C.jsx)(m.Z,{type:"submit",variant:"contained",color:"primary",disabled:p,children:"Save Details"})})]})})}})}),(0,C.jsx)("div",{style:{marginTop:"20px"}}),(0,C.jsx)(i.Z,{title:"Manage My Password",children:(0,C.jsx)(Z.J9,{enableReinitialize:!0,initialValues:{password:_.password,confirm_password:_.confirm_password},validationSchema:x.Ry().shape({password:x.Z_().min(5,"Password must be at least 5 characters").required("Password is required"),confirm_password:x.Z_().oneOf([x.iH("password"),null],"Passwords must match").required("Confirm Password is required")}),onSubmit:async(e,r)=>{const n={password:e.password};try{const e=null===s||void 0===s?void 0:s._id,o=await fetch(w.Z.apiUrl+`api/update-user-password/${e}`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${s.token}`},body:JSON.stringify(n)});if(!o.ok)return void(401===o.status?(console.error("Unauthorized access. Logging out."),z()):500===o.status?(console.error("Internal Server Error."),z()):(console.error("Server response:",o),M()));const a=await o.json();console.log("Server response:",a),B.fire({icon:"success",title:"Password Saved Successfully."}),z()}catch(o){console.error("Error submitting form:",o),M(),r.setErrors({submit:o.message})}finally{r.setSubmitting(!1)}},children:e=>{let{errors:s,handleBlur:n,handleChange:i,handleSubmit:t,isSubmitting:p,touched:f,values:v}=e;return(0,C.jsx)("form",{onSubmit:t,children:(0,C.jsxs)(a.ZP,{container:!0,direction:"column",justifyContent:"center",children:[(0,C.jsxs)(a.ZP,{container:!0,sx:{p:3},spacing:r?0:2,children:[(0,C.jsxs)(a.ZP,{item:!0,xs:12,sm:6,children:[(0,C.jsx)(l.Z,{variant:"h5",component:"h5",children:"New Password"}),(0,C.jsx)(o.Z,{fullWidth:!0,type:"password",margin:"normal",name:"password",onBlur:n,onChange:i,value:v.password,variant:"outlined",error:Boolean(f.password&&s.password),helperText:f.password&&s.password,InputProps:{startAdornment:(0,C.jsx)(c.Z,{position:"start",children:(0,C.jsx)(h.Z,{})})}})]}),(0,C.jsxs)(a.ZP,{item:!0,xs:12,sm:6,children:[(0,C.jsx)(l.Z,{variant:"h5",component:"h5",children:"Confirm Password"}),(0,C.jsx)(o.Z,{fullWidth:!0,type:"password",margin:"normal",name:"confirm_password",onBlur:n,onChange:i,value:v.confirm_password,variant:"outlined",error:Boolean(f.confirm_password&&s.confirm_password),helperText:f.confirm_password&&s.confirm_password,InputProps:{startAdornment:(0,C.jsx)(c.Z,{position:"start",children:(0,C.jsx)(h.Z,{})})}})]})]}),(0,C.jsx)(d.Z,{sx:{mt:3,mb:2}}),(0,C.jsx)(u.Z,{sx:{justifyContent:"flex-end"},children:(0,C.jsx)(m.Z,{type:"submit",variant:"contained",color:"primary",disabled:p,children:"Save Password"})})]})})}})})]})}},4281:function(e,r,s){var n=s(4836);r.Z=void 0;var o=n(s(5045)),a=s(6417),i=(0,o.default)((0,a.jsx)("path",{d:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z"}),"AccountCircle");r.Z=i},9632:function(e,r,s){var n=s(4836);r.Z=void 0;var o=n(s(5045)),a=s(6417),i=(0,o.default)((0,a.jsx)("path",{d:"M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"}),"Email");r.Z=i},8711:function(e,r,s){var n=s(4836);r.Z=void 0;var o=n(s(5045)),a=s(6417),i=(0,o.default)((0,a.jsx)("path",{d:"M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"}),"Lock");r.Z=i},6104:function(e,r,s){s.d(r,{Z:function(){return v}});var n=s(3366),o=s(7462),a=s(7313),i=s(2197),t=s(1921),l=s(7592),c=s(7342),d=s(7430),u=s(2298);function m(e){return(0,u.ZP)("MuiCardActions",e)}(0,d.Z)("MuiCardActions",["root","spacing"]);var p=s(6417);const h=["disableSpacing","className"],f=(0,l.ZP)("div",{name:"MuiCardActions",slot:"Root",overridesResolver:(e,r)=>{const{ownerState:s}=e;return[r.root,!s.disableSpacing&&r.spacing]}})((e=>{let{ownerState:r}=e;return(0,o.Z)({display:"flex",alignItems:"center",padding:8},!r.disableSpacing&&{"& > :not(style) ~ :not(style)":{marginLeft:8}})}));var v=a.forwardRef((function(e,r){const s=(0,c.Z)({props:e,name:"MuiCardActions"}),{disableSpacing:a=!1,className:l}=s,d=(0,n.Z)(s,h),u=(0,o.Z)({},s,{disableSpacing:a}),v=(e=>{const{classes:r,disableSpacing:s}=e,n={root:["root",!s&&"spacing"]};return(0,t.Z)(n,m,r)})(u);return(0,p.jsx)(f,(0,o.Z)({className:(0,i.Z)(v.root,l),ownerState:u,ref:r},d))}))}}]);