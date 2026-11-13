const $ = id => document.getElementById(id);
const names = ['环保管理','职业健康','安全组织与人员配备','安全目标与承诺','规章制度','风险分级管控','隐患排查治理','安全作业管理','安全教育培训','现场管理','设备设施管理','物联网监测','视频监测','承包商管理','智能巡检','事故管理','应急管理','施工安全管理','井下矿人员监测中心','边坡尾矿库监测预警'];
const groups = [
  ['全部', names.map((_, i) => i)],
  ['智能监测模块',[11,12,18,19]], ['智能监测巡检',[14]], ['安全防控',[0,1,2,3,4,5,6,7,8,9,10,13,15,16,17]]
];
const changed = new Set([6,13]);
const notices = [['集团通知公告','2026-07-30 10:07:26'],['测试消息','2026-07-29 17:04:15']];
const releases = [['第四批需求-应急部领导检查第三批需求-应急部领导检查第三批需求','2025-04-11'],['第三批需求-应急部领导检查第三批需求-应急部领导检查第三批需求','2025-04-10'],['第二批需求','2025-04-09']];
const tasks = [
  ['隐患复查','2026-11-11 19:53:40','【鞍钢集团矿业有限公司】在【w测试11.11】的隐患需要尽快复查。'],
  ['培训计划待实施','2026-11-10 17:22:06','']
];
let tab = 0;
let date = new Date(2026,10,11);
const stamp = d => [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
function renderModules() {
  $('tabs').innerHTML = groups.map(([name], i) => `<button id="tab-${i}" role="tab" aria-controls="modules" aria-selected="${i===tab}" data-tab="${i}">${name}</button>`).join('');
  $('modules').setAttribute('aria-labelledby','tab-'+tab);
  $('modules').innerHTML = groups[tab][1].map(i => `<button class="module${changed.has(i)?' changed':''}" data-open="${names[i]}" ${changed.has(i)?'title="本次评审改动入口"':''}><img src="workbench-assets/module-${i}.png" alt=""><span>${names[i]}</span></button>`).join('');
}
const row = ([name, time], i, version = false) => `<button class="overview-row" data-${version?'release':'notice'}="${i}"><span class="${version?'version':'notice-icon'}">${version?'V1.0.'+(3-i):'◀'}</span><b class="ellipsis">${name}</b>${version?'':' <span class="read">已读</span>'}<time>${time}</time></button>`;
$('notices').innerHTML = notices.map((item,i)=>row(item,i)).join('');
$('releases').innerHTML = releases.map((item,i)=>row(item,i,true)).join('');
function taskRow([name,time,desc],i) {
  return `<button class="task ${i===1?'green':''}" data-task="${i}"><time>${time}</time><b>${name}</b> &nbsp;<span class="read">已读</span>${desc?'<p>'+desc+'</p>':''}</button>`;
}
function renderCalendar() {
  const monday = new Date(date);
  monday.setDate(date.getDate()-(date.getDay()+6)%7);
  $('month-label').textContent = `${date.getFullYear()}年${date.getMonth()+1}月`;
  document.querySelector('.month input').value=stamp(date).slice(0,7);
  const week = Array.from({length:7},(_,i)=>new Date(monday.getFullYear(),monday.getMonth(),monday.getDate()+i));
  $('days').innerHTML = week.map((d,i)=> {
    const key=stamp(d), active=key===stamp(date), marked=tasks.some(t=>t[1].startsWith(key));
    return `<button class="day${active?' active':''}${marked?' marked':''}" data-date="${key}" aria-label="${key}" aria-pressed="${active}"><span>${'一二三四五六日'[i]}</span><strong>${d.getDate()}</strong></button>`;
  }).join('');
  const matches = tasks.map((t,i)=>t[1].startsWith(stamp(date))?i:-1).filter(i=>i>=0);
  const visible = stamp(date)==='2026-11-11'?[0,1]:matches;
  $('task-list').innerHTML = visible.length?visible.map(i=>taskRow(tasks[i],i)).join(''):'<p class="placeholder">暂无待办任务</p>';
}
const boardItems = [['tasks','待办任务'],['hazards','隐患排查治理']];
function boards() {
  for(const [id] of boardItems) $(id).hidden = localStorage.getItem('workbench:'+id)==='off';
}
function dialog(title, body) {
  $('modal-title').textContent=title;
  $('modal-body').innerHTML=body;
  if (!$('modal').open) $('modal').showModal();
}
const pending = '<p class="placeholder">原系统的交互细节待确认。</p>';
function open(name) {
  switch(name) {
    case '通知公告': return dialog(name,notices.map((item,i)=>row(item,i)).join(''));
    case '待办任务':
    case '通知任务': return dialog(name,tasks.map(taskRow).join(''));
    case '看板配置': return dialog(name,`<p class="placeholder">演示配置 · 原系统配置项待确认</p><form id="board-form">${boardItems.map(([id,label])=>`<label class="config-option"><input type="checkbox" name="${id}" ${$(id).hidden?'':'checked'}> ${label}</label>`).join('')}<button class="primary" type="submit">保存</button></form>`);
    case '项目信息': return dialog(name,'<p>鞍钢集团矿业有限公司</p><p>安全生产鞍钢项目 / superadmin-271</p>');
    case '承包商管理': return window.location.assign('https://wang6122546.github.io/agxgf/');
    case '隐患排查治理': return window.location.assign('https://wang6122546.github.io/agyh');
    case '隐患排查治理看板': return dialog(name,`<p>排查任务排名：暂无数据</p><p>未整改隐患 0 · 超期未整改 0</p>${pending}`);
    case '未整改隐患':
    case '超期未整改': return dialog(name,`<p>暂无数据</p>${pending}`);
    case '退出': return dialog(name,'<p>当前为本地评审原型，无登录会话。</p>');
    default: return dialog(name,pending);
  }
}
document.addEventListener('click', e=>{
  if(e.target===$('modal')) {$('modal').close();return;}
  const btn=e.target.closest('button'); if(!btn) return;
  const {open:name,tab:index,notice,release,task,date:key}=btn.dataset;
  if(name) open(name);
  if(index!==undefined){tab=Number(index);renderModules();$('tab-'+tab).focus();}
  if(notice!==undefined){const [name,time]=notices[notice];dialog(name,`<p>${time}　<span class="read">已读</span></p>${pending}`);}
  if(release!==undefined){const [name,time]=releases[release];dialog('系统动态 · V1.0.'+(3-release),`<p>${name}</p><p>${time}</p>${pending}`);}
  if(task!==undefined){const [name,time,desc]=tasks[task];dialog(name,`<p>${time}</p><p>${desc}</p>${pending}`);}
  if(key){date=new Date(key+'T00:00:00');renderCalendar();document.querySelector('[data-date="'+key+'"]').focus();}
  if(btn.id==='close') $('modal').close();
  if(btn.id==='home'){tab=0;renderModules();window.scrollTo(0,0);}
  if(btn.id==='collapse') btn.setAttribute('aria-expanded',String(!document.body.classList.toggle('collapsed')));
});
document.querySelector('.month input').addEventListener('change',e=>{if(e.target.value){date=new Date(e.target.value+'-01T00:00:00');renderCalendar();}});
document.addEventListener('submit',e=>{
  if(e.target.id!=='board-form') return;
  e.preventDefault();
  const form = new FormData(e.target);
  for(const [id] of boardItems) localStorage.setItem('workbench:'+id,form.has(id)?'on':'off');
  boards();
  $('modal').close();
});
renderModules();renderCalendar();boards();
