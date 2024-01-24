import{aE as b,ao as u,bA as V,as as q,_ as h,J as n,K as d,L as s,V as o,M as l,Q as C,a7 as y,am as k,I as c,U as m,X as $,Z as p,z as v,$ as U,a5 as A,a6 as E,ah as I,a4 as D}from"./index.458653eb.js";const S={methods:{...b(u,["logout"]),showDeleteAccountDialog(){this.$q.dialog({title:this.$t("manage_account.delete_account"),message:this.$t("manage_account.delete_account_confirm"),color:"primary",cancel:!0}).onOk(()=>{this.deleteAccount()})},deleteAccount(){const e=this.$q.dialog({title:this.$t("manage_account.deleting_account"),message:this.$t("manage_account.no_way_back"),color:"primary",progress:!0,cancel:!1,persistent:!0,ok:!1});V(this.currentUser.id),setTimeout(()=>{e.hide(),setTimeout(()=>{this.currentUser=null,this.$router.push({name:"Explore"})},350)},3e3)}},computed:{...q(u,["currentUser"])}},L={class:"flex column"},R={class:"sticky-header flex row wrap items-center"},x={class:"text-large inter bolder t1 q-mb-md q-mt-md"},B={class:"flex column q-pt-md"},M={class:"t2"};function T(e,r,w,g,t,a){return n(),d("div",L,[s("div",R,[s("p",x,o(e.$t("manage_account.delete_account")),1)]),s("div",B,[s("div",M,o(e.$t("manage_account.delete_account_msg")),1),s("div",null,[l(C,{"no-caps":"",class:"soft-button-shadow q-mt-lg",onClick:a.showDeleteAccountDialog,color:"red",label:e.$t("manage_account.delete_account")},null,8,["onClick","label"])])])])}var z=h(S,[["render",T]]);const N={components:{InnerLoading:y},data(){return{email:"",loading:!1,email_taken:!1}},methods:{...b(u,["editUser"]),async updateEmail(){this.loading=!0;try{await this.editUser({email:this.email}),this.$q.dialog({title:this.$t("manage_account.email_verification"),message:this.$t("manage_account.email_verification_msg"),color:"primary"}),this.email="",this.loading=!1}catch{this.loading=!1,error.response.data.error.code==="EMAIL_ALREADY_REGISTERED"&&(this.email_taken=!0)}}},watch:{},computed:{...k(u,["currentUser"]),emailValidation(){return this.email_taken?this.$t("error_codes.EMAIL_ALREADY_REGISTERED"):/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.email)?!0:this.$t("validation.email_invalid")}},mounted(){var e;(e=this.currentUser)!=null&&e.email&&(this.email=this.currentUser.email)}},Q=e=>(A("data-v-7054ed02"),e=e(),E(),e),Y={class:"flex column"},Z={class:"sticky-header flex row wrap items-center"},G={class:"text-large inter bolder t1 q-mb-md q-mt-md"},F={class:"flex column q-pt-md"},J={key:0},K=Q(()=>s("br",null,null,-1)),O={key:1},W={class:"t2"},X={class:"q-mt-sm"},j={class:"flex row q-mt-md"};function H(e,r,w,g,t,a){var i;const _=c("InnerLoading");return n(),d("div",Y,[s("div",Z,[s("p",G,o(e.$t("manage_account.email_address")),1)]),s("div",F,[e.currentUser&&!e.currentUser.pw_enabled?(n(),d("div",J,[m(o(e.$t("manage_account.facebook_login_message_1"))+" ",1),K,m(" "+o(e.$t("manage_account.facebook_login_message_2")),1)])):e.currentUser&&e.currentUser.pw_enabled&&e.currentUser.oauth?(n(),d("div",O,[s("div",W,[m(" You can log in with Facebook Login or your email address, "),s("b",null,o((i=e.currentUser)==null?void 0:i.email),1)])])):$("",!0),s("div",X,[s("div",j,[l(v,{outlined:"",filled:"",modelValue:t.email,"onUpdate:modelValue":r[0]||(r[0]=f=>t.email=f),class:"email-field",label:e.$t("manage_account.email_address"),error:a.emailValidation!=!0&&t.email.length>0},{error:p(()=>[m(o(a.emailValidation),1)]),_:1},8,["modelValue","label","error"])]),l(C,{class:"soft-button-shadow",onClick:a.updateEmail,"no-caps":"",color:"primary",disable:t.email.length==0||a.emailValidation!=!0,label:e.$t("manage_account.update_email"),type:"a"},null,8,["onClick","disable","label"])])]),t.loading?(n(),U(_,{key:0,solid:!0})):$("",!0)])}var ee=h(N,[["render",H],["__scopeId","data-v-7054ed02"]]);const se={components:{InnerLoading:y},data(){return{newPassword:"",newPasswordConfirm:"",loading:!1}},methods:{...b(u,["editUser"]),async updatePassword(){this.loading=!0;try{await this.editUser({password:this.newPassword,password_confirm:this.newPasswordConfirm}),this.$q.notify(this.$t("manage_account.password_updated")),this.loading=!1,this.newPassword="",this.newPasswordConfirm=""}catch{this.loading=!1}}},watch:{},computed:{...k(u,["currentUser"]),passwordValidation(){return this.newPassword.length>72?this.$t("validation.password_too_long"):this.newPassword.length<8?this.$t("validation.password_too_short"):!0},passwordConfirmValidation(){return this.newPassword!==this.newPasswordConfirm?this.$t("validation.password_must_match"):!0}}},te={class:"flex column"},ae={class:"sticky-header flex row wrap items-center"},oe={class:"text-large inter bolder t1 q-mb-md q-mt-md"},ne={class:"flex column q-pt-md"},re={key:0},le={class:"t2"},ie={key:1,class:"t2"},de={class:"q-mt-md"},ce={class:"flex row"};function me(e,r,w,g,t,a){const _=c("InnerLoading");return n(),d("div",te,[s("div",ae,[s("p",oe,o(e.$t("manage_account.password")),1)]),s("div",ne,[e.currentUser&&!e.currentUser.pw_enabled?(n(),d("div",re,[s("div",le,o(e.$t("manage_account.no_password_message")),1)])):(n(),d("div",ie,"Change your password here.")),s("div",de,[s("div",ce,[l(v,{outlined:"",type:"password",filled:"",class:"q-mr-md",modelValue:t.newPassword,"onUpdate:modelValue":r[0]||(r[0]=i=>t.newPassword=i),label:e.$t("manage_account.new_password"),error:a.passwordValidation!=!0&&t.newPassword.length>0},{error:p(()=>[m(o(a.passwordValidation),1)]),_:1},8,["modelValue","label","error"]),l(v,{outlined:"",filled:"",type:"password",class:"",modelValue:t.newPasswordConfirm,"onUpdate:modelValue":r[1]||(r[1]=i=>t.newPasswordConfirm=i),label:e.$t("manage_account.confirm_password"),error:a.passwordConfirmValidation!=!0&&t.newPasswordConfirm.length>0},{error:p(()=>[m(o(a.passwordConfirmValidation),1)]),_:1},8,["modelValue","label","error"])]),l(C,{class:"soft-button-shadow",onClick:a.updatePassword,"no-caps":"",color:"primary",disable:t.newPassword.length===0||!a.passwordValidation||!a.passwordConfirmValidation,label:e.$t("manage_account.update_password"),type:"a"},null,8,["onClick","disable","label"])])]),t.loading?(n(),U(_,{key:0,solid:!0})):$("",!0)])}var ue=h(se,[["render",me],["__scopeId","data-v-e3fd6688"]]);const _e={components:{UpdatePasswordComponent:ue,UpdateEmailAddressComponent:ee,DeleteAccountComponent:z,SolidPage:I},data(){return{}},methods:{},watch:{},computed:{}},pe=s("div",null,"Manage Account",-1);function he(e,r,w,g,t,a){const _=c("UpdateEmailAddressComponent"),i=c("UpdatePasswordComponent"),f=c("DeleteAccountComponent"),P=c("SolidPage");return n(),U(P,null,{title:p(()=>[pe]),default:p(()=>[s("div",{class:D(["flex column",e.$q.screen.lt.sm?"q-mt-sm":"q-mt-lg"])},[l(_),l(i,{class:"q-mt-lg"}),l(f,{class:"q-mt-lg q-mb-xl"})],2)]),_:1})}var ge=h(_e,[["render",he]]);export{ge as default};
