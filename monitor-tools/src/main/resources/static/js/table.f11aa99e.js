"use strict";(self["webpackChunkopengauss"]=self["webpackChunkopengauss"]||[]).push([[986],{7769:function(e,a,t){t.r(a),t.d(a,{default:function(){return V}});t(7658);var l=t(3396),o=t(4870),r=t(9242),d=t(7139),n=t(2748),u=t(7178),i=t(2655);const s={class:"layout"},p={id:"header"},m=(0,l._)("span",{class:"dataStyle"},"指标发布",-1),c={style:{"padding-bottom":"16px"}},g={id:"layoutCss"},w=(0,l._)("p",{class:"tipck"},"发布指标：对已生成的SQL指标进行发布，支持按指标分组、监控平台进行指标筛选，同时回显已发布过的SQL指标，选中指标即可发布到主机",-1),f=(0,l._)("p",{class:"tipck"},"修改主机：对主机信息进行修改",-1),b=(0,l._)("p",{class:"tipck"},"删除主机：对主机进行删除，同时该主机上所有已发布指标也一同删除",-1),h=(0,l._)("p",{class:"tipck"},"批量发布：可选中多台主机进行批量发布，支持按指标分组、监控平台进行指标筛选，选中指标即可批量发布到主机",-1),v=(0,l._)("p",{class:"tipck"},"批量删除：删除选中的主机，同时对应主机所有已发布的指标也一同删除",-1),_={class:"dialog-footer"},y={style:{height:"56vh"}},S={class:"el-table-filter__checkbox-group"},W=(0,l._)("span",{class:"demonstration"},"时间区间：",-1),x={class:"el-table-filter__bottom"},U={class:"el-table__column-filter-trigger"},k={class:"dialog-footer"};var z={__name:"IndexRelease",setup(e){const{proxy:a}=(0,l.FN)(),t=(0,o.iH)(null),z=(0,o.iH)(localStorage.getItem("opengauss-theme"));let I=(0,o.iH)(!1),V=(0,o.iH)(0),C=(0,o.iH)(!0),j=(0,o.iH)(!1),N=(0,o.iH)(!1),H=(0,o.iH)(null),$=(0,o.iH)(1),G=(0,o.iH)(0),O=(0,o.iH)(20),T=(0,o.iH)(1),q=(0,o.iH)(0),F=(0,o.iH)(20),J=(0,o.iH)([]),R=(0,o.iH)([]),P=(0,o.qj)({connectName:"",userName:"",password:"",port:"",ip:"",platform:"Prometheus",dataSourceId:""}),D=(0,o.qj)([]),Y=(0,o.iH)([]),L=(0,o.iH)(!0),Q=(0,o.iH)([]),M=(0,o.iH)([]),B=(0,o.qj)({timeInterval:null,platform:"",targetGroup:"",dataSourceId:"",isManagement:!0});const A=(0,o.qj)({connectName:[{required:!0,message:"请输入实例名称",trigger:"blur"},{pattern:/^[0-9A-Za-z_]{2,16}$/g,message:"连接名称只支持英文、下划线、数字组合2-16个字符"}],userName:[{required:!0,message:"请输入只读用户",trigger:"blur"},{min:1,max:100,message:"长度在 1 到 100 个字符",trigger:"blur"}],password:[{required:!0,message:"请输入登录密码",trigger:"blur"},{min:1,max:100,message:"长度在 1 到 100 个字符",trigger:"blur"}],ip:[{required:!0,message:"请输入主机地址",trigger:"blur"},{pattern:/^(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/,message:"只允许输入IP地址"}],port:[{required:!0,message:"请输入主机端口",trigger:"blur"},{pattern:/^((6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])|[0-5]?\d{0,4})$/g,message:"只允许输入端口号"}]});(0,l.bv)((()=>{ee(),window.$wujie?.bus.$on("opengauss-theme-change",(()=>{z.value=localStorage.getItem("opengauss-theme")}))})),(0,l.YP)(N,(e=>{0==e&&(B.platform="",B.targetGroup="",B.timeInterval=null,D=[],q.value=0,M.value=[])})),(0,l.YP)(j,(e=>{0==e&&(I.value=!1)}));const K=e=>{e["platform"]?(B.platform=e.platform.join(","),ue()):(B.targetGroup=e.targetGroup.join(","),ue())},Z=()=>{B.timeInterval&&(ue(),H.value.hide())},E=()=>{B.timeInterval=null,ue()},X=e=>{const a=new Map;return e.filter((e=>!a.has(e.jobId)&&a.set(e.jobId,1)))},ee=()=>{a.$http.get("/data/list/source/"+$.value+"/"+O.value).then((e=>{200==e.data.code?(Q.value=e.data.data,G.value=e.data.total,0!=e.data.sql_num&&(L.value=!1)):u.z8.warning("查询失败")})).catch((()=>{u.z8.warning("查询失败")}))},ae=e=>{e.targets.length>0&&(I.value=!0),j.value=!0,P.connectName=e.connectName,P.userName=e.userName,P.port=e.port,P.ip=e.ip,P.dataSourceId=e.dataSourceId},te=e=>{$.value=e,ee()},le=e=>{O.value=e,ee()},oe=e=>{F.value=e},re=e=>{T.value=e},de=()=>{},ne=e=>e.jobId,ue=()=>{a.$http.post("/monitor/job/list/"+T.value+"/"+F.value,JSON.stringify(B)).then((e=>{200==e.data.code?(M.value=e.data.data.tableData,q.value=e.data.total,R.value=e.data.data.targetGroup,J.value=e.data.data.platForm,e.data.data.tableData.filter((e=>{!e.isPbulish||B.platform||B.targetGroup||B.timeInterval||(0,l.Y3)((()=>{a.$refs["indexTable"].toggleRowSelection(e,!0)}))}))):u.z8.warning("查询失败")})).catch((()=>{u.z8.warning("查询失败")}))},ie=e=>{if(a.$unFocus(),0==a.$refs["table"].getSelectionRows().length&&""==e)return u.z8.warning("请至少选中一台主机信息"),!1;N.value=!0,a.$refs["table"].getSelectionRows().length>0&&""==e?(a.$refs["table"].getSelectionRows().filter((e=>{D.push(e.dataSourceId)})),1==a.$refs["table"].getSelectionRows().length?B.dataSourceId=a.$refs["table"].getSelectionRows().dataSourceId:B.dataSourceId=""):(D.push(e.dataSourceId),B.dataSourceId=e.dataSourceId),ue()},se=e=>{a.$refs[e].validate((e=>{if(!e)return!1;a.$http.post("/data/update/config",JSON.stringify(P)).then((e=>{200==e.data.code?(j.value=!1,ee(),u.z8.success("保存成功")):400==e.data.code&&u.z8.warning(e.data.message)})).catch((()=>{u.z8.warning("保存失败")}))}))},pe=(e,t,l)=>{a.$unFocus();let o,r=[];if(l){if(0==a.$refs["table"].getSelectionRows().length)return u.z8.warning("请至少选中一台主机信息"),!1;a.$refs["table"].getSelectionRows().filter((e=>{r.push(e.dataSourceId),e.targets.length>0&&(C.value=!1)})),o=C.value?"确认批量删除多台主机, 是否继续?":"该主机下存在已发布指标, 是否继续删除?"}else V.value=t[e].targets.length,r=[t[e].dataSourceId],o=V.value>0?"该主机下存在已发布指标, 是否继续删除?":"确认删除该主机, 是否继续?";i.T.confirm(o,"提示",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then((()=>{a.$http.post("/data/delete",JSON.stringify(r)).then((e=>{200==e.data.code?(u.z8.success("删除成功"),ee()):400==e.data.code&&u.z8.warning(e.data.message),C.value=!0,V.value=0})).catch((()=>{u.z8.warning("删除失败"),C.value=!0,V.value=0}))})).catch((()=>{(0,u.z8)({type:"info",message:"已取消删除"})}))},me=(e,t)=>{i.T.confirm("确认删除该指标, 是否继续?","提示",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then((()=>{let l={dataSourceId:t.dataSourceId,jobIds:[t.targets[e].jobId]};a.$http.post("/monitor/job/single/publish/pause",JSON.stringify(l)).then((e=>{200==e.data.code?(u.z8.success("删除成功"),ee()):400==e.data.code&&u.z8.warning(e.data.message)})).catch((()=>{u.z8.warning("删除失败")}))})).catch((()=>{(0,u.z8)({type:"info",message:"已取消删除"})})),a.$unFocus()},ce=()=>{if(0==X(a.$refs["indexTable"].getSelectionRows()).length)return u.z8.warning("请至少选中一条指标"),!1;X(a.$refs["indexTable"].getSelectionRows()).filter((e=>{Y.value.push(e.jobId)}));let e={dataSourceId:D,jobIds:Y.value};a.$http.post("/monitor/job/batch/publish",JSON.stringify(e)).then((e=>{200==e.data.code?(u.z8.success("发布成功"),N.value=!1,Y.value=[],D=[],ee()):400==e.data.code&&(Y.value=[],u.z8.warning(e.data.message))})).catch((()=>{u.z8.warning("发布失败")}))};return(e,a)=>{const u=(0,l.up)("el-button"),i=(0,l.up)("el-icon"),z=(0,l.up)("el-col"),V=(0,l.up)("el-row"),C=(0,l.up)("el-card"),D=(0,l.up)("el-table-column"),Y=(0,l.up)("el-table"),L=(0,l.up)("el-pagination"),X=(0,l.up)("el-input"),ee=(0,l.up)("el-form-item"),ue=(0,l.up)("el-form"),ge=(0,l.up)("el-dialog"),we=(0,l.up)("el-date-picker"),fe=(0,l.up)("el-popover");return(0,l.wg)(),(0,l.iD)("div",s,[(0,l._)("header",p,[m,(0,l._)("div",c,[(0,l.Wm)(u,{size:"large",type:"primary",onClick:a[0]||(a[0]=e=>ie(""))},{default:(0,l.w5)((()=>[(0,l.Uk)("批量发布")])),_:1}),(0,l.Wm)(u,{size:"large",class:"buttonColor",onClick:a[1]||(a[1]=e=>pe("","","all"))},{default:(0,l.w5)((()=>[(0,l.Uk)("批量删除")])),_:1})])]),(0,l._)("div",g,[(0,l.Wm)(C,{shadow:"never",style:{"margin-bottom":"16px"}},{default:(0,l.w5)((()=>[(0,l.Wm)(V,{class:"rowColor"},{default:(0,l.w5)((()=>[(0,l.Wm)(z,{span:1,style:{"text-align":"center","padding-top":"16px"}},{default:(0,l.w5)((()=>[(0,l.Wm)(i,{style:{"font-size":"20px"}},{default:(0,l.w5)((()=>[(0,l.Wm)((0,o.SU)(n.Rrw))])),_:1})])),_:1}),(0,l.Wm)(z,{span:23,style:{"font-size":"14px"}},{default:(0,l.w5)((()=>[w,f,b,h,v])),_:1})])),_:1})])),_:1}),(0,l.Wm)(Y,{data:(0,o.SU)(Q),style:{width:"100%"},ref:"table","header-cell-style":{fontWeight:"normal",textAlign:"center"},"cell-style":{padding:"4px 0px",textAlign:"center"},"row-key":"dataSourceId"},{default:(0,l.w5)((()=>[(0,l.Wm)(D,{type:"selection",width:"55",align:"center","reserve-selection":!0}),(0,l.Wm)(D,{type:"expand"},{default:(0,l.w5)((e=>[(0,l.Wm)(Y,{data:e.row.targets,"cell-style":{padding:"4px 0px",textAlign:"center"},"header-cell-style":{fontWeight:"normal",textAlign:"center"},style:{width:"calc(100% - 103px)","margin-left":"103px"}},{default:(0,l.w5)((()=>[(0,l.Wm)(D,{prop:"createTime",label:"生成时间",width:"150"}),(0,l.Wm)(D,{label:"SQL详情",prop:"target","show-overflow-tooltip":""}),(0,l.Wm)(D,{label:"指标分组",prop:"targetGroup","show-overflow-tooltip":"",width:"100"}),(0,l.Wm)(D,{label:"监控平台",prop:"platform","show-overflow-tooltip":"",width:"150"}),(0,l.Wm)(D,{label:"操作",width:"220"},{default:(0,l.w5)((a=>[(0,l.Wm)(u,{onClick:(0,r.iM)((t=>me(a.$index,e.row,"")),["prevent"]),link:"",type:"primary",size:"small"},{default:(0,l.w5)((()=>[(0,l.Uk)(" 删除指标 ")])),_:2},1032,["onClick"])])),_:2},1024)])),_:2},1032,["data"])])),_:1}),(0,l.Wm)(D,{prop:"connectName",label:"实例名称","show-overflow-tooltip":"",width:"150"}),(0,l.Wm)(D,{label:"主机地址",prop:"ip","show-overflow-tooltip":""}),(0,l.Wm)(D,{label:"主机端口",prop:"port","show-overflow-tooltip":"",width:"100"}),(0,l.Wm)(D,{label:"最后发布时间",prop:"lastReleaseTime","show-overflow-tooltip":"",width:"150"}),(0,l.Wm)(D,{label:"操作",width:"220"},{default:(0,l.w5)((e=>[(0,l.Wm)(u,{onClick:(0,r.iM)((a=>ie(e.row)),["prevent"]),link:"",type:"primary",size:"small"},{default:(0,l.w5)((()=>[(0,l.Uk)(" 发布指标 ")])),_:2},1032,["onClick"]),(0,l.Wm)(u,{onClick:(0,r.iM)((a=>ae(e.row)),["prevent"]),link:"",type:"primary",size:"small"},{default:(0,l.w5)((()=>[(0,l.Uk)(" 修改主机 ")])),_:2},1032,["onClick"]),(0,l.Wm)(u,{onClick:(0,r.iM)((a=>pe(e.$index,(0,o.SU)(Q),"")),["prevent"]),link:"",type:"primary",size:"small"},{default:(0,l.w5)((()=>[(0,l.Uk)(" 删除主机 ")])),_:2},1032,["onClick"])])),_:1})])),_:1},8,["data"]),(0,l.Wm)(L,{background:"","pager-count":5,total:(0,o.SU)(G),onCurrentChange:te,"current-page":(0,o.SU)($),style:{"text-align":"end",padding:"16px 0px 16px 16px"},onSizeChange:le,"page-sizes":[20,50,100],"page-size":(0,o.SU)(O),layout:"->,total, sizes, prev, pager, next, jumper"},null,8,["total","current-page","page-size"])]),(0,l.Wm)(ge,{title:"主机配置修改",modelValue:(0,o.SU)(j),"onUpdate:modelValue":a[9]||(a[9]=e=>(0,o.dq)(j)?j.value=e:j=e),width:"33%",top:"25vh",class:"indexClass","destroy-on-close":"","close-on-click-modal":!1},{footer:(0,l.w5)((()=>[(0,l._)("span",_,[(0,l.Wm)(u,{class:"buttonColor",onClick:a[7]||(a[7]=e=>(0,o.dq)(j)?j.value=!1:j=!1)},{default:(0,l.w5)((()=>[(0,l.Uk)("取 消")])),_:1}),(0,l.Wm)(u,{type:"primary",onClick:a[8]||(a[8]=e=>se("updateForm"))},{default:(0,l.w5)((()=>[(0,l.Uk)("保 存")])),_:1})])])),default:(0,l.w5)((()=>[(0,l._)("div",null,[(0,l.Wm)(ue,{model:(0,o.SU)(P),"label-position":"left",rules:A,ref_key:"updateForm",ref:t,"label-width":"82px",class:"demo-ruleForm",style:{"margin-top":"14px"}},{default:(0,l.w5)((()=>[(0,l.Wm)(ee,{label:"实例名称",prop:"connectName"},{default:(0,l.w5)((()=>[(0,l.Wm)(X,{modelValue:(0,o.SU)(P).connectName,"onUpdate:modelValue":a[2]||(a[2]=e=>(0,o.SU)(P).connectName=e),placeholder:"示例：业务名_master",readonly:(0,o.SU)(I)},null,8,["modelValue","readonly"])])),_:1}),(0,l.Wm)(ee,{label:"主机地址",prop:"ip"},{default:(0,l.w5)((()=>[(0,l.Wm)(X,{modelValue:(0,o.SU)(P).ip,"onUpdate:modelValue":a[3]||(a[3]=e=>(0,o.SU)(P).ip=e),placeholder:"示例：192.168.0.10",readonly:!0},null,8,["modelValue"])])),_:1}),(0,l.Wm)(ee,{label:"主机端口",prop:"port"},{default:(0,l.w5)((()=>[(0,l.Wm)(X,{modelValue:(0,o.SU)(P).port,"onUpdate:modelValue":a[4]||(a[4]=e=>(0,o.SU)(P).port=e),placeholder:"示例：5432"},null,8,["modelValue"])])),_:1}),(0,l.Wm)(ee,{label:"只读用户",prop:"userName"},{default:(0,l.w5)((()=>[(0,l.Wm)(X,{modelValue:(0,o.SU)(P).userName,"onUpdate:modelValue":a[5]||(a[5]=e=>(0,o.SU)(P).userName=e),placeholder:"示例：zabbix_readonly"},null,8,["modelValue"])])),_:1}),(0,l.Wm)(ee,{label:"登录密码",prop:"password"},{default:(0,l.w5)((()=>[(0,l.Wm)(X,{type:"password",modelValue:(0,o.SU)(P).password,"onUpdate:modelValue":a[6]||(a[6]=e=>(0,o.SU)(P).password=e),placeholder:"示例：d(*dS1"},null,8,["modelValue"])])),_:1})])),_:1},8,["model","rules"])])])),_:1},8,["modelValue"]),(0,l.Wm)(ge,{title:"指标发布",modelValue:(0,o.SU)(N),"onUpdate:modelValue":a[15]||(a[15]=e=>(0,o.dq)(N)?N.value=e:N=e),width:"60%",class:"indexClass","destroy-on-close":"","close-on-click-modal":!1},{footer:(0,l.w5)((()=>[(0,l._)("span",k,[(0,l.Wm)(u,{class:"buttonColor",onClick:a[13]||(a[13]=e=>(0,o.dq)(N)?N.value=!1:N=!1)},{default:(0,l.w5)((()=>[(0,l.Uk)("取 消")])),_:1}),(0,l.Wm)(u,{type:"primary",onClick:a[14]||(a[14]=e=>ce())},{default:(0,l.w5)((()=>[(0,l.Uk)("发 布")])),_:1})])])),default:(0,l.w5)((()=>[(0,l._)("div",y,[(0,l.Wm)(Y,{data:(0,o.SU)(M).slice(((0,o.SU)(T)-1)*(0,o.SU)(F),((0,o.SU)(T)-1)*(0,o.SU)(F)+(0,o.SU)(F)),style:{width:"100%"},class:"indexClass",ref:"indexTable","header-cell-style":{fontWeight:"normal"},"cell-style":{padding:"8px 0px"},onFilterChange:K,"row-key":ne,onSelectionChange:de},{default:(0,l.w5)((()=>[(0,l.Wm)(D,{type:"selection",width:"55",align:"center","reserve-selection":!0}),(0,l.Wm)(D,{prop:"createTime",label:"生成时间",width:"150"},{header:(0,l.w5)((()=>[(0,l._)("span",{style:(0,d.j5)({color:(0,o.SU)(B).timeInterval?"#e41d1d":""})},"生成时间",4),(0,l.Wm)(fe,{ref_key:"setRemovePop",ref:H,placement:"bottom-start",width:"auto",trigger:"click","popper-options":{boundariesElement:"viewport",removeOnDestroy:!0}},{reference:(0,l.w5)((()=>[(0,l._)("span",U,[(0,l.Wm)(i,null,{default:(0,l.w5)((()=>[(0,l.Wm)((0,o.SU)(n.olm))])),_:1})])])),default:(0,l.w5)((()=>[(0,l._)("div",S,[W,(0,l.Wm)(we,{modelValue:(0,o.SU)(B).timeInterval,"onUpdate:modelValue":a[10]||(a[10]=e=>(0,o.SU)(B).timeInterval=e),type:"daterange",teleported:!1,editable:!1,clearable:!1,"start-placeholder":"开始时间","end-placeholder":"结束时间","value-format":"YYYY-MM-DD HH:mm:ss"},null,8,["modelValue"])]),(0,l._)("div",x,[(0,l._)("button",{class:(0,d.C_)((0,o.SU)(B).timeInterval?"":"is-disabled"),type:"button",onClick:a[11]||(a[11]=e=>Z())},"确定",2),(0,l._)("button",{type:"button",onClick:a[12]||(a[12]=e=>E())},"重置")])])),_:1},512)])),_:1}),(0,l.Wm)(D,{label:"SQL详情",prop:"target","show-overflow-tooltip":""}),(0,l.Wm)(D,{label:"指标分组",prop:"targetGroup","show-overflow-tooltip":"",width:"200","column-key":"targetGroup",filters:(0,o.SU)(R)},null,8,["filters"]),(0,l.Wm)(D,{label:"监控平台",prop:"platform",width:"200","show-overflow-tooltip":"","column-key":"platform",filters:(0,o.SU)(J)},null,8,["filters"])])),_:1},8,["data"]),(0,l.Wm)(L,{background:"","pager-count":5,total:(0,o.SU)(q),onCurrentChange:re,"current-page":(0,o.SU)(T),style:{"text-align":"end",padding:"16px 0px 16px 16px"},onSizeChange:oe,"page-sizes":[20,50,100],"page-size":(0,o.SU)(F),layout:"->,total, sizes, prev, pager, next, jumper"},null,8,["total","current-page","page-size"])])])),_:1},8,["modelValue"])])}}};const I=z;var V=I},3633:function(e,a,t){t.r(a),t.d(a,{default:function(){return T}});t(541);var l=t(3396),o=t(4870),r=t(7139),d=t(9242),n=t(2748),u=t(7178),i=t(2655),s=t(2483);const p={class:"layout"},m={id:"header"},c=(0,l._)("p",{class:"tipck"},"监控平台：选择对应的监控平台，当前支持三种：Prometheus、Zabbix、Nagios",-1),g=(0,l._)("p",{class:"tipck"},"指标分组：可以手动输入或者选择历史分组，分组可方便管理与发布",-1),w=(0,l._)("p",{class:"tipck"},"采集间隔：对指标数据采集间隔时间设置",-1),f=(0,l._)("p",{class:"tipck"},"实例名称：在生成指标时，会在所选实例上进行权限与可执行性校验",-1),b=(0,l._)("p",{class:"tipck"},"SQL语句：输入需要监控的SQL语句，会进行权限校验与监控分析",-1),h=(0,l._)("p",{class:"tipck"},"生成指标：根据不同监控平台，将已通过检验的SQL语句生成对应监控平台的指标文件",-1),v={id:"layout-body"},_={id:"main"},y=["onClick"],S={style:{"padding-left":"5px","padding-right":"5px"}},W={id:"footer"},x={id:"layout-body"},U=(0,l._)("p",{class:"tipck"},"修改：对已生成指标文件数据进行修改",-1),k=(0,l._)("p",{class:"tipck"},"删除：删除指标文件数据及相应的配置文件",-1),z=(0,l._)("p",{class:"tipck",style:{"font-style":"italic"}},"注：指标管理中包含150条默认指标，每个监控平台（Prometheus\\Zabbix\\Nagios）各50条，不支持对默认指标的删除操作",-1),I=["onClick"],V={style:{height:"340px","overflow-y":"auto"}},C=(0,l._)("span",{class:"dialog-footer"},null,-1),j={style:{height:"100%","overflow-y":"auto"}},N=["onClick"],H={style:{"padding-left":"5px","padding-right":"5px"}},$={class:"dialog-footer"};var G={__name:"fileGeneration",setup(e){const a=(0,s.tv)(),{proxy:t}=(0,l.FN)(),G=(0,o.iH)(null),O=(0,o.iH)(null);let T=(0,o.iH)(localStorage.getItem("opengauss-theme")),q=(0,o.iH)(!1),F=(0,o.iH)(!1),J=(0,o.iH)(""),R=(0,o.iH)(localStorage.getItem("activeNameFile")?localStorage.getItem("activeNameFile"):"first"),P=(0,o.iH)(1),D=(0,o.iH)(0),Y=(0,o.iH)(20),L=(0,o.iH)(!1),Q=(0,o.iH)(null),M=(0,o.iH)([]),B=(0,o.iH)([]),A=(0,o.qj)({jobId:null,isFalse:!1,target:"",num:5,timeType:"second",targetGroup:"",platform:"Prometheus",dataSourceId:""});const K=(0,o.qj)({data:{jobId:null,isFalse:!1,target:"",num:5,timeType:"second",targetGroup:"",platform:"Prometheus",dataSourceId:"",isCanUpdate:!0}}),Z=(0,o.iH)([]),E=(0,o.qj)([{value:"second",label:"秒"},{value:"minute",label:"分"},{value:"hour",label:"时"},{value:"day",label:"日"},{value:"week",label:"周"},{value:"month",label:"月"},{value:"year",label:"年"}]),X=(0,o.qj)({platform:[{required:!0,message:"请选择监控平台",trigger:"blur"}],targetGroup:[{required:!0,message:"请输入或选择指标分组",trigger:"blur"}],target:[{required:!0,message:"请输入SQL语句",trigger:"blur"}],num:[{required:!0,message:"请输入采集间隔时间",trigger:"blur"},{pattern:/^[0-9]{1,3}$/,message:"只能输入1~3位数字",trigger:"blur"}],dataSourceId:[{required:!0,message:"请选择实例名称",trigger:"blur"}]});(0,l.bv)((()=>{de(),le(),ee(),"second"==R.value&&pe(),window.$wujie?.bus.$on("opengauss-theme-change",(()=>{console.log("fileGeneration"),T.value=localStorage.getItem("opengauss-theme")}))})),(0,l.YP)(R,(e=>{localStorage.setItem("activeNameFile",e)})),(0,l.YP)((()=>a.currentRoute.value.path),(()=>{localStorage.removeItem("activeNameFile")}));const ee=()=>{t.$http.get("/data/source/name").then((e=>{200==e.data.code&&e.data.data&&(Z.value=e.data.data)})).catch((()=>{u.z8.warning("请求失败")}))},ae=e=>{let a=e.target.value;a&&(A.targetGroup=a)},te=e=>{let a=e.target.value;a&&(K.targetGroup=a)},le=()=>{t.$http.get("/data/zabbix/config").then((e=>{if(200==e.data.code)e.data.data&&e.data.data.ip&&(A.platform="Zabbix");else if(400==e.data.code)return!1})).catch((()=>{u.z8.warning("请求失败")}))},oe=e=>{"second"==e.props.name&&pe()},re=(e,a,...t)=>{let l=this;if(Q.value)return;let o=!Q.value;Q.value=setTimeout((()=>{Q.value=null}),a),o&&e.apply(l,t)},de=()=>{t.$http.get("/monitor/job/group").then((e=>{if(200==e.data.code)null!==window.localStorage.getItem("jobOptions")?B.value=JSON.parse(window.localStorage.getItem("jobOptions")):(B.value=e.data.data,window.localStorage.setItem("jobOptions",JSON.stringify(B.value)));else if(400==e.data.code)return!1})).catch((()=>{u.z8.warning("指标分组查询失败")}))},ne=e=>{q.value=!0,J.value=e.target},ue=e=>{B.value=JSON.parse(window.localStorage.getItem("jobOptions")),B.value.splice(B.value.indexOf(e),1),window.localStorage.setItem("jobOptions",JSON.stringify(B.value))},ie=e=>{P.value=e,pe()},se=e=>{Y.value=e,pe()},pe=()=>{t.$http.post("/monitor/job/list/"+P.value+"/"+Y.value,{}).then((e=>{200==e.data.code?(M.value=e.data.data.tableData,D.value=e.data.total):u.z8.warning("查询失败")})).catch((()=>{u.z8.warning("查询失败")}))},me=e=>{F.value=!0,Object.assign(K,e)},ce=(e,a)=>{let l;t.$http.post("/monitor/job/check",JSON.stringify([a[e].jobId])).then((o=>{l=200==o.data.code&&o.data.message?o.data.message:"确认删除该指标, 是否继续?",i.T.confirm(l,"提示",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then((()=>{t.$http.post("/monitor/job/delete",JSON.stringify([a[e].jobId])).then((e=>{200==e.data.code?(u.z8.success("删除成功"),pe()):400==e.data.code&&u.z8.warning(e.data.message)})).catch((()=>{u.z8.warning("删除失败")}))})).catch((()=>{(0,u.z8)({type:"info",message:"已取消删除"})}))})).catch((()=>{u.z8.warning("查询失败")})),t.$unFocus()},ge=e=>{L.value=0==e},we=()=>{0!=A.num?L.value=!1:u.z8.warning("采集间隔时间不能为0")},fe=e=>{t.$refs[e].validate((e=>{if(!e)return!1;{let e,a;"first"==R.value?(e=A,a="/monitor/job/create"):(e=K,a="/monitor/job/update"),t.$http.post(a,JSON.stringify(e)).then((a=>{200==a.data.code?(L.value=!0,A.jobId="",F.value=!1,"first"==R.value?u.z8.success("生成成功"):u.z8.success("修改成功"),B.value=JSON.parse(window.localStorage.getItem("jobOptions")),-1==B.value.indexOf(e.targetGroup)&&B.value.unshift(e.targetGroup),window.localStorage.setItem("jobOptions",JSON.stringify(B.value)),pe()):300==a.data.code?a.data.err_message&&(0,u.z8)({showClose:!0,duration:0,message:a.data.err_message,type:"warning"}):400==a.data.code?u.z8.warning(a.data.message):600==a.data.code&&i.T.confirm("该SQL可能无法生成指标，是否强制执行?","提示",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then((()=>{A.isFalse=!0,t.$http.post("/monitor/job/create",JSON.stringify(A)).then((a=>{200==a.data.code&&(A.isFalse=!1,F.value=!1,u.z8.success("生成成功"),B.value=JSON.parse(window.localStorage.getItem("jobOptions")),-1==B.value.indexOf(e.targetGroup)&&B.value.unshift(e.targetGroup),window.localStorage.setItem("jobOptions",JSON.stringify(B.value)),pe())})).catch((()=>{A.isFalse=!1,u.z8.warning("生成失败")}))})).catch((()=>{(0,u.z8)({type:"info",message:"已取消生成"})}))})).catch((()=>{u.z8.warning("生成失败")}))}}))};return(e,a)=>{const t=(0,l.up)("el-icon"),u=(0,l.up)("el-col"),i=(0,l.up)("el-row"),s=(0,l.up)("el-card"),T=(0,l.up)("el-radio-button"),Q=(0,l.up)("el-radio-group"),ee=(0,l.up)("el-form-item"),le=(0,l.up)("el-option"),de=(0,l.up)("el-select"),pe=(0,l.up)("el-input"),be=(0,l.up)("el-form"),he=(0,l.up)("el-button"),ve=(0,l.up)("el-tab-pane"),_e=(0,l.up)("el-table-column"),ye=(0,l.up)("el-table"),Se=(0,l.up)("el-pagination"),We=(0,l.up)("el-tabs"),xe=(0,l.up)("el-dialog"),Ue=(0,l.up)("el-popover");return(0,l.wg)(),(0,l.iD)("div",p,[(0,l.Wm)(We,{modelValue:(0,o.SU)(R),"onUpdate:modelValue":a[7]||(a[7]=e=>(0,o.dq)(R)?R.value=e:R=e),onTabClick:oe},{default:(0,l.w5)((()=>[(0,l.Wm)(ve,{label:"生成指标",name:"first",style:{"font-size":"16px"}},{default:(0,l.w5)((()=>[(0,l._)("header",m,[(0,l.Wm)(s,{shadow:"never"},{default:(0,l.w5)((()=>[(0,l.Wm)(i,{class:"rowColor"},{default:(0,l.w5)((()=>[(0,l.Wm)(u,{span:1,style:{"text-align":"center","padding-top":"16px"}},{default:(0,l.w5)((()=>[(0,l.Wm)(t,{style:{"font-size":"20px"}},{default:(0,l.w5)((()=>[(0,l.Wm)((0,o.SU)(n.Rrw))])),_:1})])),_:1}),(0,l.Wm)(u,{span:23,style:{"font-size":"14px"}},{default:(0,l.w5)((()=>[c,g,w,f,b,h])),_:1})])),_:1})])),_:1})]),(0,l._)("div",v,[(0,l._)("main",_,[(0,l.Wm)(be,{model:(0,o.SU)(A),"label-position":"left",rules:X,ref_key:"openForm",ref:G,"label-width":"",class:"demo-ruleForm",style:{margin:"16px 0px 0px 0px"}},{default:(0,l.w5)((()=>[(0,l.Wm)(i,null,{default:(0,l.w5)((()=>[(0,l.Wm)(u,{span:7},{default:(0,l.w5)((()=>[(0,l.Wm)(ee,{label:"监控平台",prop:"platform"},{default:(0,l.w5)((()=>[(0,l.Wm)(Q,{modelValue:(0,o.SU)(A).platform,"onUpdate:modelValue":a[0]||(a[0]=e=>(0,o.SU)(A).platform=e)},{default:(0,l.w5)((()=>[(0,l.Wm)(T,{label:"Prometheus"}),(0,l.Wm)(T,{label:"Zabbix"}),(0,l.Wm)(T,{label:"Nagios"})])),_:1},8,["modelValue"])])),_:1})])),_:1}),(0,l.Wm)(u,{span:6},{default:(0,l.w5)((()=>[(0,l.Wm)(ee,{label:"指标分组",prop:"targetGroup"},{default:(0,l.w5)((()=>[(0,l.Wm)(de,{style:{width:"230px"},modelValue:(0,o.SU)(A).targetGroup,"onUpdate:modelValue":a[1]||(a[1]=e=>(0,o.SU)(A).targetGroup=e),filterable:"","allow-create":"","default-first-option":"",onBlur:ae,teleported:!1,placeholder:"请输入或选择指标分组"},{default:(0,l.w5)((()=>[((0,l.wg)(!0),(0,l.iD)(l.HY,null,(0,l.Ko)((0,o.SU)(B),(e=>((0,l.wg)(),(0,l.j4)(le,{key:e,label:e,value:e},{default:(0,l.w5)((()=>[(0,l._)("span",null,(0,r.zw)(e),1),(0,l._)("span",{style:{float:"right"},onClick:(0,d.iM)((a=>ue(e)),["stop"])},[(0,l._)("div",S,[(0,l.Wm)(t,null,{default:(0,l.w5)((()=>[(0,l.Wm)((0,o.SU)(n.x8P))])),_:1})])],8,y)])),_:2},1032,["label","value"])))),128))])),_:1},8,["modelValue"])])),_:1})])),_:1}),(0,l.Wm)(u,{span:6},{default:(0,l.w5)((()=>[(0,l.Wm)(ee,{label:"采集间隔",prop:"num"},{default:(0,l.w5)((()=>[(0,l.Wm)(pe,{style:{width:"120px"},modelValue:(0,o.SU)(A).num,"onUpdate:modelValue":a[2]||(a[2]=e=>(0,o.SU)(A).num=e),onChange:ge},null,8,["modelValue"]),(0,l.Wm)(de,{modelValue:(0,o.SU)(A).timeType,"onUpdate:modelValue":a[3]||(a[3]=e=>(0,o.SU)(A).timeType=e),teleported:!1,style:{width:"120px"},prop:"timeType",placeholder:""},{default:(0,l.w5)((()=>[((0,l.wg)(!0),(0,l.iD)(l.HY,null,(0,l.Ko)(E,(e=>((0,l.wg)(),(0,l.j4)(le,{key:e.value,label:e.label,value:e.value},null,8,["label","value"])))),128))])),_:1},8,["modelValue"])])),_:1})])),_:1}),(0,l.Wm)(u,{span:5},{default:(0,l.w5)((()=>[(0,l.Wm)(ee,{label:"实例名称",prop:"dataSourceId"},{default:(0,l.w5)((()=>[(0,l.Wm)(de,{modelValue:(0,o.SU)(A).dataSourceId,"onUpdate:modelValue":a[4]||(a[4]=e=>(0,o.SU)(A).dataSourceId=e),teleported:!1,style:{width:"180px"},prop:"dataSourceId",placeholder:""},{default:(0,l.w5)((()=>[((0,l.wg)(!0),(0,l.iD)(l.HY,null,(0,l.Ko)(Z.value,(e=>((0,l.wg)(),(0,l.j4)(le,{key:e.dataSourceId,label:e.connectName,value:e.dataSourceId},null,8,["label","value"])))),128))])),_:1},8,["modelValue"])])),_:1})])),_:1})])),_:1}),(0,l.Wm)(i,null,{default:(0,l.w5)((()=>[(0,l.Wm)(u,{span:24},{default:(0,l.w5)((()=>[(0,l.Wm)(ee,{label:"SQL语句",prop:"target"},{default:(0,l.w5)((()=>[(0,l.Wm)(pe,{type:"textarea",rows:21,modelValue:(0,o.SU)(A).target,"onUpdate:modelValue":a[5]||(a[5]=e=>(0,o.SU)(A).target=e),onChange:we},null,8,["modelValue"])])),_:1})])),_:1})])),_:1})])),_:1},8,["model","rules"])]),(0,l._)("footer",W,[(0,l.Wm)(he,{size:"large",type:"primary",disabled:(0,o.SU)(L),onClick:a[6]||(a[6]=e=>re(fe,1e3,"openForm"))},{default:(0,l.w5)((()=>[(0,l.Uk)("生成指标")])),_:1},8,["disabled"])])])])),_:1}),(0,l.Wm)(ve,{label:"指标管理",name:"second",style:{"font-size":"16px"}},{default:(0,l.w5)((()=>[(0,l._)("div",x,[(0,l.Wm)(s,{shadow:"never",style:{"margin-bottom":"16px"}},{default:(0,l.w5)((()=>[(0,l.Wm)(i,{class:"rowColor"},{default:(0,l.w5)((()=>[(0,l.Wm)(u,{span:1,style:{"text-align":"center","padding-top":"16px"}},{default:(0,l.w5)((()=>[(0,l.Wm)(t,{style:{"font-size":"20px"}},{default:(0,l.w5)((()=>[(0,l.Wm)((0,o.SU)(n.Rrw))])),_:1})])),_:1}),(0,l.Wm)(u,{span:23,style:{"font-size":"14px"}},{default:(0,l.w5)((()=>[U,k,z])),_:1})])),_:1})])),_:1}),(0,l.Wm)(ye,{data:(0,o.SU)(M),style:{width:"100%"},id:"indexId","header-cell-style":{fontWeight:"normal",textAlign:"center"},"cell-style":{padding:"4px 0px"}},{default:(0,l.w5)((()=>[(0,l.Wm)(_e,{prop:"jobName",label:"SQLID",width:"80",align:"center"}),(0,l.Wm)(_e,{label:"SQL详情",prop:"target","show-overflow-tooltip":"",align:"left"},{default:(0,l.w5)((e=>[(0,l._)("a",{onClick:a=>ne(e.row),style:{cursor:"pointer","font-size":"14px"}},(0,r.zw)(e.row.target),9,I)])),_:1}),(0,l.Wm)(_e,{label:"指标分组",prop:"targetGroup","show-overflow-tooltip":"",width:"120",align:"center"}),(0,l.Wm)(_e,{label:"监控平台",prop:"platform",width:"100",align:"center"}),(0,l.Wm)(_e,{prop:"createTime",label:"生成时间",width:"150",align:"center"}),(0,l.Wm)(_e,{label:"操作",width:"120",align:"center"},{default:(0,l.w5)((e=>[(0,l.Wm)(he,{onClick:(0,d.iM)((a=>me(e.row)),["prevent"]),link:"",type:"primary",size:"small"},{default:(0,l.w5)((()=>[(0,l.Uk)(" 修改 ")])),_:2},1032,["onClick"]),(0,l.Wm)(he,{onClick:(0,d.iM)((a=>ce(e.$index,(0,o.SU)(M))),["prevent"]),link:"",type:"primary",size:"small",disabled:"system_default"==e.row.targetGroup},{default:(0,l.w5)((()=>[(0,l.Uk)(" 删除 ")])),_:2},1032,["onClick","disabled"])])),_:1})])),_:1},8,["data"]),(0,l.Wm)(Se,{background:"","pager-count":5,total:(0,o.SU)(D),onCurrentChange:ie,"current-page":(0,o.SU)(P),style:{"text-align":"end",padding:"16px 0px 16px 16px"},onSizeChange:se,"page-sizes":[20,50,100],"page-size":(0,o.SU)(Y),layout:"->,total, sizes, prev, pager, next, jumper"},null,8,["total","current-page","page-size"])])])),_:1})])),_:1},8,["modelValue"]),(0,l.Wm)(xe,{title:"SQL详情",modelValue:(0,o.SU)(q),"onUpdate:modelValue":a[8]||(a[8]=e=>(0,o.dq)(q)?q.value=e:q=e),width:"50%",top:"25vh","destroy-on-close":""},{footer:(0,l.w5)((()=>[C])),default:(0,l.w5)((()=>[(0,l._)("div",V,[(0,l._)("span",null,(0,r.zw)((0,o.SU)(J)),1)])])),_:1},8,["modelValue"]),(0,l.Wm)(xe,{title:"system_default"!=K.targetGroup?"指标修改":"默认指标修改",modelValue:(0,o.SU)(F),"onUpdate:modelValue":a[17]||(a[17]=e=>(0,o.dq)(F)?F.value=e:F=e),width:"80%",top:"8vh",class:"indexClass","destroy-on-close":"","close-on-click-modal":!1},{footer:(0,l.w5)((()=>[(0,l._)("span",$,[(0,l.Wm)(he,{class:"buttonColor",onClick:a[15]||(a[15]=e=>(0,o.dq)(F)?F.value=!1:F=!1)},{default:(0,l.w5)((()=>[(0,l.Uk)("取 消")])),_:1}),(0,l.Wm)(he,{type:"primary",onClick:a[16]||(a[16]=e=>re(fe,1e3,"updateForm"))},{default:(0,l.w5)((()=>[(0,l.Uk)("保 存")])),_:1})])])),default:(0,l.w5)((()=>[(0,l._)("div",j,[(0,l.Wm)(be,{model:K,"label-position":"left",rules:X,ref_key:"updateForm",ref:O,"label-width":"auto",class:"demo-ruleForm",style:{margin:"16px 0px 0px 0px"}},{default:(0,l.w5)((()=>[(0,l.Wm)(i,null,{default:(0,l.w5)((()=>[(0,l.Wm)(u,{span:7},{default:(0,l.w5)((()=>[(0,l.Wm)(ee,{label:"监控平台",prop:"platform"},{default:(0,l.w5)((()=>[(0,l.Wm)(Ue,{placement:"top-start",title:"",width:200,trigger:"hover",teleported:!1,content:"system_default"==K.targetGroup?"默认指标不允许修改监控平台":"已发布的指标不允许修改监控平台",disabled:K.isCanUpdate&&"system_default"!=K.targetGroup},{reference:(0,l.w5)((()=>[(0,l.Wm)(Q,{modelValue:K.platform,"onUpdate:modelValue":a[9]||(a[9]=e=>K.platform=e),disabled:!K.isCanUpdate||"system_default"==K.targetGroup},{default:(0,l.w5)((()=>[(0,l.Wm)(T,{label:"Prometheus"}),(0,l.Wm)(T,{label:"Zabbix"}),(0,l.Wm)(T,{label:"Nagios"})])),_:1},8,["modelValue","disabled"])])),_:1},8,["content","disabled"])])),_:1})])),_:1}),(0,l.Wm)(u,{span:6},{default:(0,l.w5)((()=>[(0,l.Wm)(ee,{label:"指标分组",prop:"targetGroup"},{default:(0,l.w5)((()=>[(0,l.Wm)(de,{style:{width:"250px"},modelValue:K.targetGroup,"onUpdate:modelValue":a[10]||(a[10]=e=>K.targetGroup=e),disabled:"system_default"==K.targetGroup,filterable:"","allow-create":"","default-first-option":"",onBlur:te,teleported:!1,placeholder:"请输入或选择指标分组"},{default:(0,l.w5)((()=>[((0,l.wg)(!0),(0,l.iD)(l.HY,null,(0,l.Ko)((0,o.SU)(B),((e,a)=>((0,l.wg)(),(0,l.j4)(le,{key:a,label:e,value:e},{default:(0,l.w5)((()=>[(0,l._)("span",null,(0,r.zw)(e),1),(0,l._)("span",{style:{float:"right"},onClick:(0,d.iM)((e=>ue((0,o.SU)(B)[a])),["stop"])},[(0,l._)("div",H,[(0,l.Wm)(t,null,{default:(0,l.w5)((()=>[(0,l.Wm)((0,o.SU)(n.x8P))])),_:1})])],8,N)])),_:2},1032,["label","value"])))),128))])),_:1},8,["modelValue","disabled"])])),_:1})])),_:1}),(0,l.Wm)(u,{span:6},{default:(0,l.w5)((()=>[(0,l.Wm)(ee,{label:"采集间隔",prop:"num"},{default:(0,l.w5)((()=>[(0,l.Wm)(pe,{style:{width:"120px"},modelValue:K.num,"onUpdate:modelValue":a[11]||(a[11]=e=>K.num=e),onChange:ge},null,8,["modelValue"]),(0,l.Wm)(de,{modelValue:K.timeType,"onUpdate:modelValue":a[12]||(a[12]=e=>K.timeType=e),teleported:!1,style:{width:"120px"},prop:"timeType",placeholder:""},{default:(0,l.w5)((()=>[((0,l.wg)(!0),(0,l.iD)(l.HY,null,(0,l.Ko)(E,(e=>((0,l.wg)(),(0,l.j4)(le,{key:e.value,label:e.label,value:e.value},null,8,["label","value"])))),128))])),_:1},8,["modelValue"])])),_:1})])),_:1}),"system_default"!=K.targetGroup?((0,l.wg)(),(0,l.j4)(u,{key:0,span:5},{default:(0,l.w5)((()=>[(0,l.Wm)(ee,{label:"实例名称",prop:"dataSourceId"},{default:(0,l.w5)((()=>[(0,l.Wm)(de,{modelValue:K.dataSourceId,"onUpdate:modelValue":a[13]||(a[13]=e=>K.dataSourceId=e),teleported:!1,style:{width:"180px"},prop:"dataSourceId",placeholder:""},{default:(0,l.w5)((()=>[((0,l.wg)(!0),(0,l.iD)(l.HY,null,(0,l.Ko)(Z.value,(e=>((0,l.wg)(),(0,l.j4)(le,{key:e.dataSourceId,label:e.connectName,value:e.dataSourceId},null,8,["label","value"])))),128))])),_:1},8,["modelValue"])])),_:1})])),_:1})):(0,l.kq)("",!0)])),_:1}),(0,l.Wm)(i,null,{default:(0,l.w5)((()=>[(0,l.Wm)(u,{span:24},{default:(0,l.w5)((()=>[(0,l.Wm)(ee,{label:"SQL语句",prop:"target"},{default:(0,l.w5)((()=>[(0,l.Wm)(pe,{type:"textarea",rows:26,modelValue:K.target,"onUpdate:modelValue":a[14]||(a[14]=e=>K.target=e),onChange:we,disabled:"system_default"==K.targetGroup},null,8,["modelValue","disabled"])])),_:1})])),_:1})])),_:1})])),_:1},8,["model","rules"])])])),_:1},8,["title","modelValue"])])}}};const O=G;var T=O}}]);
//# sourceMappingURL=table.f11aa99e.js.map