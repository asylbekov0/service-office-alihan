"use strict";
const PREFIX="ali.office.2026.";
const SEED={
deployments:[
{id:"DEP-001",client:"Медцентр «Ала-Тоо»",product:"Электронная очередь",version:"v1.1.0",stage:"training",owner:"Азамат Н.",plannedDate:"2026-11-19",done:7,total:9},
{id:"DEP-002",client:"Типография «Смена»",product:"Портал заказов",version:"v1.0.0",stage:"setup",owner:"Жазгуль Т.",plannedDate:"2026-11-24",done:3,total:8},
{id:"DEP-003",client:"Спортклуб «Атлет»",product:"Система абонементов",version:"v1.1.0",stage:"planning",owner:"Данияр К.",plannedDate:"2026-12-04",done:2,total:7},
{id:"DEP-004",client:"Сервис «Экспресс»",product:"Управление заявками",version:"v1.0.0",stage:"production",owner:"Арсен М.",plannedDate:"2026-11-10",done:10,total:10}],
incidents:[
{id:"INC-001",title:"Не отправляется SMS-подтверждение",priority:"critical",status:"in_progress",createdAt:"2026-11-12T09:35:00+06:00",resolvedAt:null},
{id:"INC-002",title:"Не обновляется статус заказа",priority:"high",status:"resolved",createdAt:"2026-11-11T10:20:00+06:00",resolvedAt:"2026-11-11T15:30:00+06:00"},
{id:"INC-003",title:"Ошибка поиска по фамилии",priority:"medium",status:"new",createdAt:"2026-11-12T08:10:00+06:00",resolvedAt:null},
{id:"INC-004",title:"Неверное количество свободных мест",priority:"high",status:"new",createdAt:"2026-11-11T17:15:00+06:00",resolvedAt:null},
{id:"INC-005",title:"Кнопка печати исчезает на телефоне",priority:"low",status:"resolved",createdAt:"2026-11-09T12:00:00+06:00",resolvedAt:"2026-11-10T13:00:00+06:00"},
{id:"INC-006",title:"Не открывается профиль оператора",priority:"critical",status:"resolved",createdAt:"2026-11-10T11:05:00+06:00",resolvedAt:"2026-11-10T12:22:00+06:00"},
{id:"INC-007",title:"Неправильный формат даты в квитанции",priority:"medium",status:"new",createdAt:"2026-11-12T12:00:00+06:00",resolvedAt:null}],
requests:[
{id:"REQ-001",title:"Восстановить отправку уведомлений",type:"corrective",status:"planned",targetVersion:"v1.1.1"},
{id:"REQ-002",title:"Проверить работу в Firefox 160",type:"adaptive",status:"new",targetVersion:"v1.2.0"},
{id:"REQ-003",title:"Добавить выгрузку заявок в CSV",type:"perfective",status:"planned",targetVersion:"v1.2.0"},
{id:"REQ-004",title:"Удалить устаревшие зависимости",type:"preventive",status:"done",targetVersion:"v1.1.0"},
{id:"REQ-005",title:"Уточнить подсказки в мобильной форме",type:"perfective",status:"new",targetVersion:"v1.2.0"}],
releases:[
{id:"REL-001",version:"v1.0.0",date:"2026-11-09",level:"major",changes:["Первый рабочий выпуск панели","Реестр внедрений и журнал обращений","Сохранение изменений в браузере"]},
{id:"REL-002",version:"v1.1.0",date:"2026-11-12",level:"minor",changes:["Проверка SLA при смене статуса","Фильтрация заявок и обращений","Два графика аналитики и мобильная вёрстка"]}]
};
const SLA={critical:4,high:8,medium:24,low:72};
const LABEL={
stage:{planning:"Планирование",setup:"Настройка",training:"Обучение",production:"Запуск"},
priority:{critical:"Критический",high:"Высокий",medium:"Средний",low:"Низкий"},
incidentStatus:{new:"Новый",in_progress:"В работе",resolved:"Решён"},
type:{corrective:"Корректирующее",adaptive:"Адаптивное",perfective:"Совершенствующее",preventive:"Профилактическое"},
requestStatus:{new:"Новая",planned:"Запланирована",done:"Выполнена"},
level:{major:"Крупный выпуск",minor:"Улучшения",patch:"Исправления"},
sla:{on_track:"В срок",breached:"Просрочен",met:"Решён вовремя"}
};
const $=s=>document.querySelector(s);
function escapeHTML(x){return String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function label(group,x){return LABEL[group]?.[x]??String(x??"—")}
function load(type){try{const value=localStorage.getItem(PREFIX+type);if(value===null)return JSON.parse(JSON.stringify(SEED[type]));const data=JSON.parse(value);return Array.isArray(data)?data.filter(x=>x&&typeof x.id==="string"):JSON.parse(JSON.stringify(SEED[type]))}catch(e){console.warn("Используются исходные записи",e);return JSON.parse(JSON.stringify(SEED[type]))}}
function save(type,data){try{localStorage.setItem(PREFIX+type,JSON.stringify(data));return true}catch(e){console.error(e);toast("Ошибка сохранения данных");return false}}
function nextId(prefix,rows){const nums=rows.map(x=>Number(String(x.id).split("-").pop())).filter(Number.isFinite);return prefix+"-"+String(Math.max(0,...nums)+1).padStart(3,"0")}
function fmt(v,withTime=false){const d=new Date(v);if(!Number.isFinite(d.getTime()))return "—";return new Intl.DateTimeFormat("ru-RU",withTime?{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}:{day:"2-digit",month:"short",year:"numeric"}).format(d)}
function slaState(i,now=Date.now()){const start=Date.parse(i.createdAt),hours=SLA[i.priority];if(!Number.isFinite(start)||!hours)return "breached";const due=start+hours*3600000;if(i.status==="resolved"){const finish=Date.parse(i.resolvedAt);return Number.isFinite(finish)&&finish<=due?"met":"breached"}return now>due?"breached":"on_track"}
function slaPct(all){const solved=all.filter(x=>x.status==="resolved");return solved.length?Math.round(solved.filter(x=>slaState(x)==="met").length*100/solved.length):100}
function versionCompare(a,b){const x=String(a).replace(/^v/,"").split(".").map(Number),y=String(b).replace(/^v/,"").split(".").map(Number);for(let n=0;n<3;n++){const d=(x[n]||0)-(y[n]||0);if(d)return d}return 0}
function nextVersion(v,type){const m=/^v?(\d+)\.(\d+)\.(\d+)$/.exec(v);if(!m)throw Error("Некорректная версия");let [a,b,c]=m.slice(1).map(Number);if(type==="major")return `v${a+1}.0.0`;if(type==="minor")return `v${a}.${b+1}.0`;if(type==="patch")return `v${a}.${b}.${c+1}`;throw Error("Некорректный уровень")}
function current(){return load("releases").sort((a,b)=>versionCompare(b.version,a.version))[0]?.version||"v0.0.0"}
function chip(t,color="dark"){return `<span class="chip ${color}">${escapeHTML(t)}</span>`}
let toastTimer;
function toast(t){const el=$("#toast");if(!el)return;el.textContent=t;el.classList.add("on");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("on"),3000)}
function boot(){let selected="light";try{selected=localStorage.getItem(PREFIX+"theme")==="dark"?"dark":"light"}catch{}document.documentElement.dataset.theme=selected;const btn=$("#themeButton");if(btn){btn.textContent=selected==="dark"?"Светлая тема":"Тёмная тема";btn.onclick=()=>{const next=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=next;localStorage.setItem(PREFIX+"theme",next);btn.textContent=next==="dark"?"Светлая тема":"Тёмная тема"}}$("#latestVersion").textContent=current();$("#today").textContent=new Intl.DateTimeFormat("ru-RU",{day:"numeric",month:"long",year:"numeric"}).format(new Date());const view=document.body.dataset.view;({dashboard,deployments:deploymentsPage,incidents:incidentsPage,maintenance:maintenancePage,releases:releasesPage})[view]?.()}
function dashboard(){
const inc=load("incidents"),dep=load("deployments"),req=load("requests"),opened=inc.filter(x=>x.status!=="resolved");
$("#kpiDeploy").textContent=dep.filter(x=>x.stage!=="production").length;$("#kpiInc").textContent=opened.length;$("#kpiSla").textContent=slaPct(inc)+"%";$("#kpiVersion").textContent=current();$("#lateCount").textContent=opened.filter(x=>slaState(x)==="breached").length;
$("#miniInc").innerHTML=[...inc].sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt)).slice(0,4).map(x=>`<li><span class="name">${escapeHTML(x.title)}</span><span class="sub">${escapeHTML(x.id)} · ${fmt(x.createdAt,true)} · ${label("incidentStatus",x.status)}</span></li>`).join("");
$("#miniDep").innerHTML=dep.slice(0,4).map(x=>`<li><span class="name">${escapeHTML(x.client)}</span><span class="sub">${escapeHTML(x.product)} · ${label("stage",x.stage)} · ${Math.round(x.done/x.total*100)}%</span></li>`).join("");
if(typeof Chart==="undefined"){document.querySelectorAll(".chart-area").forEach(x=>x.classList.add("no-chart"));return}
const cat=["critical","high","medium","low"],type=["corrective","adaptive","perfective","preventive"];
Chart.defaults.font.family="Segoe UI,Arial,sans-serif";Chart.defaults.font.size=11;
new Chart($("#priorityChart"),{type:"bar",data:{labels:cat.map(x=>label("priority",x)),datasets:[{data:cat.map(x=>inc.filter(i=>i.priority===x).length),backgroundColor:["#b94c32","#d39a71","#436f72","#97b2aa"],borderRadius:0,maxBarThickness:45}]},options:{animation:false,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0,stepSize:1}},x:{grid:{display:false}}}}});
new Chart($("#typeChart"),{type:"doughnut",data:{labels:type.map(x=>label("type",x)),datasets:[{data:type.map(x=>req.filter(r=>r.type===x).length),backgroundColor:["#b94c32","#436f72","#cba06b","#91a99c"],borderWidth:0}]},options:{animation:false,maintainAspectRatio:false,cutout:"65%",plugins:{legend:{position:"bottom",labels:{usePointStyle:true,boxWidth:8,padding:14,font:{size:10}}}}}});
}
function deploymentsPage(){
let list=load("deployments");const table=$("#deployTable");
function draw(){table.innerHTML=list.map(x=>{const pct=x.total?Math.min(100,Math.round(x.done/x.total*100)):0;return `<tr><td><strong>${escapeHTML(x.client)}</strong><span class="subtext">${escapeHTML(x.id)} · ${escapeHTML(x.product)} · ${escapeHTML(x.version)}</span></td><td>${escapeHTML(x.owner)}</td><td>${chip(label("stage",x.stage),x.stage==="production"?"green":"dark")}</td><td class="nowrap">${fmt(x.plannedDate)}</td><td><span class="progress-cell"><span class="progress"><i style="width:${pct}%"></i></span><b>${pct}%</b></span><span class="subtext">${x.done} / ${x.total} шагов</span></td><td><div class="row-actions"><button class="tiny" data-do="advance" data-id="${escapeHTML(x.id)}" ${x.stage==="production"?"disabled":""}>Этап →</button><button class="tiny green" data-do="plus" data-id="${escapeHTML(x.id)}" ${x.done>=x.total?"disabled":""}>+ шаг</button></div></td></tr>`}).join("")||'<tr><td colspan="6" class="empty">Нет внедрений</td></tr>';$("#deployCount").textContent=list.length+" внедрений"}
draw();table.onclick=e=>{const b=e.target.closest("button[data-do]");if(!b)return;const x=list.find(v=>v.id===b.dataset.id);if(!x)return;if(b.dataset.do==="plus")x.done=Math.min(x.total,x.done+1);if(b.dataset.do==="advance"){const chain=["planning","setup","training","production"];x.stage=chain[Math.min(3,chain.indexOf(x.stage)+1)]}if(save("deployments",list)){draw();toast("Запись обновлена")}};
$("#deployForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),client=String(f.get("client")).trim(),product=String(f.get("product")).trim(),owner=String(f.get("owner")).trim(),total=Number(f.get("total")),done=Number(f.get("done"));$("#deployError").textContent="";if(!client||!product||!owner||!Number.isInteger(total)||!Number.isInteger(done)||total<1||done<0||done>total){$("#deployError").textContent="Проверьте поля и число шагов";return}list.unshift({id:nextId("DEP",list),client,product,owner,version:String(f.get("version")).trim(),stage:f.get("stage"),plannedDate:f.get("plannedDate"),done,total});if(save("deployments",list)){draw();e.target.reset();toast("Внедрение сохранено")}}
}
function incidentsPage(){
let list=load("incidents");const table=$("#incTable"),s=$("#incFilter"),p=$("#priorityFilter"),q=$("#incSearch");
function draw(){const query=q.value.trim().toLocaleLowerCase("ru"),filtered=list.filter(x=>(s.value==="all"||s.value===x.status)&&(p.value==="all"||p.value===x.priority)&&(!query||(x.title+" "+x.id).toLocaleLowerCase("ru").includes(query)));$("#incCount").textContent=`Показано ${filtered.length} из ${list.length}`;table.innerHTML=filtered.map(x=>{const sla=slaState(x);return `<tr><td><strong>${escapeHTML(x.title)}</strong><span class="subtext">${escapeHTML(x.id)}</span></td><td>${chip(label("priority",x.priority),x.priority==="critical"?"red":x.priority==="high"?"orange":"dark")}</td><td>${chip(label("incidentStatus",x.status),x.status==="resolved"?"green":"dark")}</td><td class="nowrap">${fmt(x.createdAt,true)}</td><td>${chip(label("sla",sla),sla==="breached"?"red":sla==="met"?"green":"dark")}<span class="subtext">Лимит ${SLA[x.priority]} ч</span></td><td><div class="row-actions">${x.status==="new"?`<button class="tiny" data-do="start" data-id="${escapeHTML(x.id)}">В работу</button>`:""}${x.status!=="resolved"?`<button class="tiny green" data-do="solve" data-id="${escapeHTML(x.id)}">Решить</button>`:"—"}</div></td></tr>`}).join("")||'<tr><td colspan="6" class="empty">Совпадений нет</td></tr>'}
draw();s.onchange=p.onchange=draw;q.oninput=draw;
table.onclick=e=>{const b=e.target.closest("button[data-do]");if(!b)return;const x=list.find(v=>v.id===b.dataset.id);if(!x||x.status==="resolved")return;if(b.dataset.do==="start")x.status="in_progress";if(b.dataset.do==="solve"){x.status="resolved";x.resolvedAt=new Date().toISOString()}if(save("incidents",list)){draw();toast("Статус изменён")}};
$("#incForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),title=String(f.get("title")).trim();$("#incError").textContent="";if(!title){$("#incError").textContent="Укажите проблему";$("#incTitle").focus();return}list.unshift({id:nextId("INC",list),title,priority:f.get("priority"),status:"new",createdAt:new Date().toISOString(),resolvedAt:null});if(save("incidents",list)){e.target.reset();s.value="all";p.value="all";q.value="";draw();toast("Обращение создано")}}
}
function maintenancePage(){
let list=load("requests");const table=$("#reqTable"),type=$("#typeFilter"),status=$("#reqStatus");
function draw(){const filtered=list.filter(x=>(type.value==="all"||x.type===type.value)&&(status.value==="all"||x.status===status.value));$("#reqCount").textContent=`Показано ${filtered.length} из ${list.length}`;table.innerHTML=filtered.map(x=>`<tr><td><strong>${escapeHTML(x.title)}</strong><span class="subtext">${escapeHTML(x.id)}</span></td><td>${chip(label("type",x.type))}</td><td>${chip(label("requestStatus",x.status),x.status==="done"?"green":"dark")}</td><td>${escapeHTML(x.targetVersion)}</td><td><div class="row-actions">${x.status==="new"?`<button class="tiny" data-do="plan" data-id="${escapeHTML(x.id)}">В план</button>`:""}${x.status!=="done"?`<button class="tiny green" data-do="done" data-id="${escapeHTML(x.id)}">Выполнено</button>`:"—"}</div></td></tr>`).join("")||'<tr><td colspan="5" class="empty">Заявок нет</td></tr>'}
draw();type.onchange=status.onchange=draw;
table.onclick=e=>{const b=e.target.closest("button[data-do]");if(!b)return;const x=list.find(v=>v.id===b.dataset.id);if(!x)return;if(b.dataset.do==="plan")x.status="planned";if(b.dataset.do==="done")x.status="done";if(save("requests",list)){draw();toast("Заявка обновлена")}};
$("#reqForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),title=String(f.get("title")).trim(),targetVersion=String(f.get("targetVersion")).trim();$("#reqError").textContent="";if(!title||!/^v\d+\.\d+\.\d+$/.test(targetVersion)){$("#reqError").textContent="Нужны название и версия вида v1.2.0";return}list.unshift({id:nextId("REQ",list),title,type:f.get("type"),status:"new",targetVersion});if(save("requests",list)){e.target.reset();type.value=status.value="all";draw();toast("Заявка создана")}}
}
function releasesPage(){
let list=load("releases");const level=$("#releaseLevel"),block=$("#releaseList");
function currentLocal(){return [...list].sort((a,b)=>versionCompare(b.version,a.version))[0]?.version||"v0.0.0"}
function preview(){try{$("#nextRelease").textContent=nextVersion(currentLocal(),level.value)}catch{$("#nextRelease").textContent="—"}}
function draw(){block.innerHTML=[...list].sort((a,b)=>versionCompare(b.version,a.version)).map(x=>`<article class="release-entry"><span class="rel-date">${fmt(x.date)} · ${escapeHTML(x.id)}</span><h3>${escapeHTML(x.version)} ${chip(label("level",x.level))}</h3><ul>${x.changes.map(v=>`<li>${escapeHTML(v)}</li>`).join("")}</ul></article>`).join("")||'<p class="empty">Пока нет выпусков</p>';$("#releaseCount").textContent=list.length+" версии";$("#latestVersion").textContent=currentLocal();preview()}
draw();level.onchange=preview;$("#relDate").value=new Date().toLocaleDateString("en-CA");
$("#relForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),changes=String(f.get("changes")).split(/\r?\n/).map(x=>x.trim()).filter(Boolean);$("#relError").textContent="";if(!changes.length){$("#relError").textContent="Перечислите изменения";return}const v=nextVersion(currentLocal(),f.get("level"));list.unshift({id:nextId("REL",list),version:v,date:f.get("date"),level:f.get("level"),changes});if(save("releases",list)){draw();e.target.reset();$("#relDate").value=new Date().toLocaleDateString("en-CA");toast("Версия "+v+" добавлена")}}
}
document.addEventListener("DOMContentLoaded",()=>{try{boot()}catch(err){console.error(err);toast("Ошибка запуска интерфейса")}});
if(typeof module!=="undefined"&&module.exports)module.exports={SEED,SLA,slaState,slaPct,nextVersion,versionCompare,nextId};
