import{_ as s,bC as o,K as r,J as i}from"./index.458653eb.js";const c={name:"Activate",data(){return{loading:!0}},methods:{},watch:{},computed:{},mounted(){o(this.$route.params.token).then(()=>{this.loading=!1,this.$q.dialog({title:this.$t("auth.account_activated"),message:this.$t("auth.account_acctivated_msg"),color:"primary"}).onOk(()=>{this.$router.replace("/login")}).onCancel(()=>{this.$router.replace("/login")}).onDismiss(()=>{this.$router.replace("/login")})}).catch(a=>{let t="",e="";a.response.status===400?(t=this.$t("auth.account_already_activated_error_tilte"),e=this.$t("auth.account_already_activated_error_msg")):(t=this.$t("auth.account_activate_error_title"),e=this.$t("auth.account_activate_error_msg")),this.$q.dialog({title:t,message:e,color:"primary",ok:!1}).onOk(()=>{this.$router.push("/login")}).onCancel(()=>{this.$router.push("/login")}).onDismiss(()=>{this.$router.push("/login")})})}};function n(a,t,e,_,l,u){return i(),r("div")}var d=s(c,[["render",n],["__scopeId","data-v-76e07578"]]);export{d as default};
