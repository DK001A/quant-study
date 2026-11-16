/* ============================================================
   量化学习台 · 交互逻辑
   数据持久化：localStorage['quant-study-v1']
   ============================================================ */
(function(){
'use strict';
var KEY = 'quant-study-v1';
var TOTAL = 105;
var RING = 2 * Math.PI * 49;

/* ---------- utils ---------- */
function $(s,r){ return (r||document).querySelector(s); }
function $$(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function plain(s){ return window.plainText(s); }
function pad(n){ return n<10 ? '0'+n : ''+n; }
function fmt(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
function todayStr(){ return fmt(new Date()); }
function parseDate(s){ return new Date(s+'T00:00:00'); }
function addDays(s,n){ var d=parseDate(s); d.setDate(d.getDate()+n); return fmt(d); }
var WD = ['日','一','二','三','四','五','六'];
function dateLabel(i){
  var d = parseDate(S.settings.startDate); d.setDate(d.getDate()+i);
  return fmt(d)+' 周'+WD[d.getDay()];
}
function idx(w,d){ return (w-1)*7 + (d-1); }
function weekOf(i){ return Math.floor(i/7)+1; }
function dayOf(i){ return i%7+1; }
function phaseOf(w){ for(var k=0;k<window.PHASES.length;k++){ if(window.PHASES[k].weeks.indexOf(w)>=0) return window.PHASES[k]; } return window.PHASES[0]; }
function toast(msg){
  var t=$('#toast'); t.textContent=msg; t.classList.add('show');
  clearTimeout(t._tm); t._tm=setTimeout(function(){ t.classList.remove('show'); },1900);
}
function confirmBox(title,text,cb){
  $('#modalTitle').textContent=title; $('#modalText').textContent=text;
  $('#modalBg').classList.add('on');
  $('#modalOk').onclick=function(){ $('#modalBg').classList.remove('on'); cb(); };
  $('#modalCancel').onclick=function(){ $('#modalBg').classList.remove('on'); };
}

/* ---------- state ---------- */
var UIKEY = 'quant-study-ui-v1';
function fresh(){
  return { v:1, settings:{ startDate:todayStr(), focus:0, seenStart:false }, days:{}, tests:{}, gates:{}, fixed:{}, ui:{} };
}
var IS_NEW = true;
try { IS_NEW = !localStorage.getItem(KEY); } catch(e){ IS_NEW = false; }
var S;
try { S = JSON.parse(localStorage.getItem(KEY)||'null'); } catch(e){ S=null; }
if (!S || S.v!==1 || !S.days) S = fresh();
if (!S.settings) S.settings={startDate:todayStr()};
if (!S.settings.startDate) S.settings.startDate=todayStr();
if (!S.tests) S.tests={}; if(!S.gates) S.gates={}; if(!S.fixed) S.fixed={};
if (S.settings.seenStart==null) S.settings.seenStart = !IS_NEW;
/* 当前学习日：只由「你学到哪」决定，跟日历解耦。老用户按已完成天数推断，完成 Day1 → 自动指向 Day2 */
function inferFocus(){
  var last=-1;
  for(var k in S.days){ if(S.days[k] && S.days[k].done) last=Math.max(last,parseInt(k,10)||0); }
  return Math.min(TOTAL-1, Math.max(0,last+1));
}
if (typeof S.settings.focus!=='number' || S.settings.focus<0 || S.settings.focus>=TOTAL)
  S.settings.focus = inferFocus();
function focusIdx(){ return S.settings.focus; }
function setFocus(i, silent){
  if(i<0 || i>=TOTAL) return;
  S.settings.focus=i; saveNow(); renderFocusUI();
  if(!silent) toast('当前学习日 → Day '+(i+1));
}
/* 视图状态（tab / 周筛选 / 搜索词 / 滚动位置）单独持久化，刷新后原地继续 */
function loadUI(){ try{ return JSON.parse(localStorage.getItem(UIKEY)||'null')||{}; }catch(e){ return {}; } }
var U = loadUI();
var lastScroll = typeof U.scroll==='number' ? U.scroll : 0;
var saveTm, uiTm, scrTm;
function saveUI(){
  var o={ tab:ui.tab, week:ui.week, filter:ui.filter, q:ui.q,
          blocks:ui.blocks, gstepOpen:ui.gstepOpen, tmpl:ui.tmpl, wtOpen:ui.wtOpen,
          scroll:lastScroll };
  try{ localStorage.setItem(UIKEY,JSON.stringify(o)); }catch(e){}
}
function saveUILater(){ clearTimeout(uiTm); uiTm=setTimeout(saveUI,250); }
function save(){ clearTimeout(saveTm); saveTm=setTimeout(function(){
  try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){ toast('保存失败：浏览器存储不可用'); }
  saveUILater();
},160); }
function saveNow(){ clearTimeout(saveTm); try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }
window.addEventListener('scroll',function(){ lastScroll=window.scrollY||0; clearTimeout(scrTm); scrTm=setTimeout(saveUI,500); },{passive:true});
function D(i){
  if(!S.days[i]) S.days[i]={done:false,doneAt:'',level:'',note:'',ans:{},verdict:{},showAns:{},opened:{}};
  var d=S.days[i];
  if(!d.ans)d.ans={}; if(!d.verdict)d.verdict={}; if(!d.showAns)d.showAns={};
  if(!d.opened)d.opened={}; if(!d.guide)d.guide={};
  if(d.note==null)d.note=''; if(d.level==null)d.level='';
  return d;
}
function T(w){
  if(!S.tests[w]) S.tests[w]={ans:['','',''],mark:[null,null,null],show:false};
  var t=S.tests[w];
  if(!t.ans)t.ans=['','','']; if(!t.mark)t.mark=[null,null,null];
  return t;
}
function todayIdx(){
  var a=parseDate(S.settings.startDate), b=new Date(); b.setHours(0,0,0,0);
  var diff=Math.round((b-a)/86400000);
  return Math.min(TOTAL-1,Math.max(0,diff));
}
function doneCount(){ var n=0; for(var k in S.days){ if(S.days[k].done) n++; } return n; }
function streak(){
  var t=todayIdx(), start=D(t).done?t:t-1, n=0;
  for(var i=start;i>=0;i--){ if(D(i).done) n++; else break; }
  return n;
}
function wrongKeys(){
  var out=[];
  for(var k in S.days){
    var d=S.days[k], i=parseInt(k,10);
    for(var q in d.verdict){ if(d.verdict[q]==='bad' && !S.fixed['d'+i+':'+q]) out.push('d'+i+':'+q); }
  }
  for(var w in S.tests){
    var t=S.tests[w]; t.mark.forEach(function(m,j){ if(m==='bad'&&!S.fixed['t'+w+':'+j]) out.push('t'+w+':'+j); });
  }
  return out;
}
function quizCount(i){ var d=D(i),n=0; ['q1','q2','q3'].forEach(function(q){ if(d.verdict[q])n++; }); return n; }

/* ---------- ui state ---------- */
var ui = {
  tab: U.tab || (!S.settings.seenStart ? 'start' : 'days'),
  week: U.week !== undefined ? U.week : weekOf(focusIdx()),
  filter: U.filter || 'all',
  q: U.q || '',
  blocks: U.blocks || {},      // key: i+':links' / i+':quiz' / i+':guide' → true = 展开
  wtOpen: U.wtOpen || {},      // 周测展开
  gstepOpen: U.gstepOpen || {},// 步骤详情展开状态 key: i+':stepId'
  tmpl: U.tmpl || { errors:true, mastery:true, gitignore:false, readme:false, requirements:false },
  matShow:false,
  ledgerAll:false
};
if(['start','days','tests','gates','wrong','ledger','resources','method'].indexOf(ui.tab)<0) ui.tab='days';
S.settings.seenStart = true;
saveNow();  // 首次打开即落盘：避免下次仍被判为「新用户」而跳回新手页 / Day 1

var TABS = [
  {id:'start',n:'新手起步',badge:'Day 1'},{id:'days',n:'逐日计划'},
  {id:'tests',n:'周测题库'},{id:'gates',n:'阶段出口'},
  {id:'wrong',n:'错题本'},{id:'ledger',n:'掌握度台账'},{id:'resources',n:'全部资料'},{id:'method',n:'方法与速查'}
];

/* ---------- dashboard / tabs ---------- */
function renderFocusUI(){
  var f=focusIdx(), cal=todayIdx();
  if($('#stToday')) $('#stToday').textContent='Day '+(f+1);
  var sel=$('#focusSelect');
  if(sel){
    if(sel.options.length!==TOTAL){
      var html='';
      for(var i=0;i<TOTAL;i++){
        var ttl=plain(window.PLAN[i][0]).slice(0,24);
        html+='<option value="'+i+'">Day '+(i+1)+' · '+esc(ttl)+'…</option>';
      }
      sel.innerHTML=html;
    }
    sel.value=String(f);
  }
  var pv=$('#btnPrevDay'), nx=$('#btnNextDay');
  if(pv) pv.disabled=f===0;
  if(nx) nx.disabled=f===TOTAL-1;
  var bt=$('#btnCalToday');
  if(bt) bt.textContent='日历今天 · Day '+(cal+1);
}
function renderDash(){
  var n=doneCount(), pct=Math.round(n/TOTAL*100);
  $('#ringArc').setAttribute('stroke-dashoffset', String(RING*(1-n/TOTAL)));
  $('#ringPct').textContent=pct+'%';
  $('#stDone').textContent=n;
  renderFocusUI();
  $('#stStreak').textContent=streak();
  var wc=wrongKeys().length;
  $('#stWrong').textContent=wc;
  $('#stWrong').className='v'+(wc>0?' warn':'');
}
function renderTabs(){
  var wc=wrongKeys().length;
  $('#tabs').innerHTML=TABS.map(function(t){
    var badge = t.id==='wrong' && wc>0 ? '<span class="badge alert">'+wc+'</span>'
              : t.id==='tests' ? '<span class="badge">15</span>'
              : t.badge ? '<span class="badge">'+t.badge+'</span>' : '';
    return '<button class="tab'+(ui.tab===t.id?' on':'')+'" data-act="tab" data-t="'+t.id+'">'+t.n+badge+'</button>';
  }).join('');
}

/* ---------- beginner guide ---------- */
function guideProgress(i){
  var g=window.GUIDES[i]; if(!g) return {n:0,total:0,pct:0};
  var d=D(i), n=0;
  g.steps.forEach(function(s){ if(d.guide[s.id]) n++; });
  return { n:n, total:g.steps.length, pct:Math.round(n/g.steps.length*100) };
}
function updateGuideProgress(i){
  var p=guideProgress(i);
  $$('[data-gp="'+i+'"]').forEach(function(el){
    var n=el.querySelector('.n'), f=el.querySelector('.bar-fill'), pc=el.querySelector('.pc');
    if(n)n.textContent=p.n+'/'+p.total; if(f)f.style.width=p.pct+'%'; if(pc)pc.textContent=p.pct+'%';
  });
  var h=$('#day-'+i+' [data-b="guide"] .cnt');
  if(h) h.textContent=p.total+' 步 · 已完成 '+p.n;
  if(p.total && p.n===p.total) toast('全部步骤完成 ✓ 回到卡片勾选「标记完成」');
}
function copyToClipboard(txt, btn){
  function ok(){
    if(btn){ var old=btn.textContent; btn.textContent='已复制 ✓'; btn.classList.add('copied');
      setTimeout(function(){ btn.textContent=old; btn.classList.remove('copied'); },1400); }
    toast('已复制到剪贴板');
  }
  function legacy(){
    var ta=document.createElement('textarea');
    ta.value=txt; ta.setAttribute('readonly','');
    ta.style.position='fixed'; ta.style.top='-1000px'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select();
    var done=false; try{ done=document.execCommand('copy'); }catch(e){}
    ta.remove(); if(done) ok(); else toast('复制失败，请手动选中文本');
  }
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(ok, legacy);
  } else legacy();
}
function resChipHtml(list){
  return '<div class="links g-res">'+(list||[]).map(function(x){
    var ty=window.RES_TYPES[x.t]||window.RES_TYPES.search;
    return '<a class="lnk '+ty.cls+'" href="'+esc(x.u)+'" target="_blank" rel="noopener noreferrer" title="'+esc(x.d||'')+'">'+
      '<span class="ic">'+ty.icon+'</span><span class="nm">'+esc(x.n)+'</span></a>';
  }).join('')+'</div>';
}
function gstepHtml(i, s, k, scope, full){
  var d=D(i), key=i+':'+s.id, done=!!d.guide[s.id];
  var open = ui.gstepOpen[key]===undefined ? (full || i===0) : ui.gstepOpen[key];
  var cmds=(s.cmds||[]).map(function(c,j){
    var cid='gcmd-'+scope+'-'+i+'-'+k+'-'+j;
    return '<div class="cmd-group"><div class="cmd-os">'+esc(c.os)+'</div>'+
      '<div class="cmd-box"><button class="copy-btn" data-act="copy" data-target="'+cid+'">复制</button>'+
      '<pre class="cmd-code" id="'+cid+'">'+esc(c.code)+'</pre></div></div>';
  }).join('');
  var errs=(s.errs||[]).length
    ? '<div class="g-sec">常见报错与排查</div><div class="g-err">'+s.errs.map(function(x){
        return '<div class="row"><span class="eq">▸ '+esc(x.q)+'</span><br><span class="ea">'+esc(x.a)+'</span></div>';
      }).join('')+'</div>' : '';
  var res=(s.res||[]).length ? '<div class="g-sec">这一步配套的学习材料</div>'+resChipHtml(window.guideRes(s.res)) : '';
  return '<div class="gstep'+(open?' open':'')+(done?' is-done':'')+'" data-key="'+key+'">'+
    '<div class="gstep-head" data-act="gstep-toggle" data-key="'+key+'">'+
      '<span class="gstep-no">'+pad(k+1)+'</span>'+
      '<span class="gstep-t">'+esc(s.t)+'</span>'+
      '<span class="gstep-min">'+s.min+' min</span>'+
      '<label class="gstep-chk" data-act="gstep-check" data-i="'+i+'" data-s="'+s.id+'" title="做完勾掉，进度自动保存"><input type="checkbox" data-act="gstep-check" data-i="'+i+'" data-s="'+s.id+'"'+(done?' checked':'')+'>完成</label>'+
      '<span class="gstep-arrow">▾</span>'+
    '</div>'+
    '<div class="gstep-body">'+
      (s.why?'<div class="g-why"><b>为什么做这一步：</b>'+s.why+'</div>':'')+
      (s.body||'')+
      (cmds?'<div class="g-sec">可直接复制的命令</div>'+cmds:'')+
      (s.out?'<div class="g-sec">看到什么算成功</div><div class="g-out">'+s.out+'</div>':'')+
      errs+res+
      (s.check?'<div class="g-check">☐ 打勾条件：'+esc(s.check)+'</div>':'')+
    '</div></div>';
}
function guideHtml(i, opts){
  var g=window.GUIDES[i]; if(!g) return '';
  var full=!!opts.full, scope=opts.scope||'card', p=guideProgress(i);
  return '<div class="guide-wrap">'+
    '<div class="g-intro"><b>'+esc(g.title)+'</b> · '+esc(g.sub)+'<br>'+
      '<span style="font-family:var(--mono);font-size:11px;color:var(--soft)">预计 '+esc(g.mins)+' · 共 '+g.steps.length+' 步</span><br>'+esc(g.intro)+'</div>'+
    '<div class="g-progress" data-gp="'+i+'">步骤完成 <b class="n">'+p.n+'/'+p.total+'</b>'+
      '<div class="bar-bg"><div class="bar-fill" style="width:'+p.pct+'%"></div></div><span class="pc">'+p.pct+'%</span></div>'+
    (full?'<div class="tool-row"><button class="btn sm" data-act="gstep-all" data-v="open">展开全部步骤</button>'+
      '<button class="btn sm" data-act="gstep-all" data-v="close">收起全部步骤</button>'+
      '<span style="font-size:11.5px;color:var(--soft)">命令右上角「复制」可直接粘贴到终端；做完一步勾一步，进度自动保存</span></div>':'')+
    g.steps.map(function(s,k){ return gstepHtml(i,s,k,scope,full); }).join('')+
  '</div>';
}
function tmplHtml(scope){
  return window.GUIDE_TEMPLATES.map(function(t){
    var open=ui.tmpl[t.id]!==false, cid='gtmpl-'+scope+'-'+t.id;
    return '<div class="tmpl-card'+(open?' open':'')+'">'+
      '<div class="tmpl-head" data-act="tmpl-toggle" data-t="'+t.id+'">'+
        '<span class="file">'+esc(t.file)+'</span><b>'+esc(t.name)+'</b>'+
        '<span class="d">'+esc(t.desc)+'</span>'+
        '<button class="btn sm" data-act="copy" data-target="'+cid+'">复制全文</button>'+
        '<span class="gstep-arrow">▾</span></div>'+
      '<div class="tmpl-body"><div class="cmd-box"><button class="copy-btn" data-act="copy" data-target="'+cid+'">复制</button>'+
        '<pre class="cmd-code" id="'+cid+'">'+esc(t.text)+'</pre></div></div>'+
    '</div>';
  }).join('');
}
function mathHtml(){
  return '<div class="sec-desc">合上资料计时 20 分钟做完，再点「显示全部答案」自评。不会的题按标注的周次提前补前置即可，<b>不要现在死磕</b>；结果填进 notes/mastery.md 和卡片底部的 L 级按钮。</div>'+
    '<div class="tool-row"><button class="btn sm" data-act="mat-show">'+(ui.matShow?'隐藏全部答案':'显示全部答案')+'</button>'+
      '<span style="font-size:11.5px;color:var(--soft)">共 '+window.MATH_CHECK.length+' 题 · 覆盖后面 14 周真正会用到的高中数学</span></div>'+
    '<div class="mat-grid">'+window.MATH_CHECK.map(function(x,k){
      return '<div class="mat-q"><div class="n">第 '+pad(k+1)+' 题</div><div class="q">'+esc(x.q)+'</div>'+
        '<div class="a'+(ui.matShow?'':' hidden')+'"><b>答案：</b>'+esc(x.a)+
        '<div class="need">对应 '+esc(x.need)+' · '+esc(x.fix)+'</div></div></div>';
    }).join('')+'</div>';
}
function faqHtml(){
  return window.CLI_FAQ.map(function(x){
    return '<div class="faq-item"><div class="q">'+esc(x.q)+'</div><div class="a">'+esc(x.a)+'</div></div>';
  }).join('');
}
function startResHtml(){
  var all=window.BEGINNER_RES;
  var groups=[
    { n:'B 站视频 · 先看短的，长的当字典', ts:['bili'] },
    { n:'官方文档 / 教材 / 工具下载', ts:['doc','tool'] },
    { n:'图文教程 / 帖子 / 专栏', ts:['post'] },
    { n:'检索兜底 · 视频失效或报错时用', ts:['search'] }
  ];
  return groups.map(function(g){
    var ids=Object.keys(all).filter(function(k){ return g.ts.indexOf(all[k].t)>=0; });
    return '<h4 style="font-size:13px;margin:16px 0 7px">'+esc(g.n)+' <span style="font-family:var(--mono);font-size:11px;color:var(--soft);font-weight:400">'+ids.length+' 条</span></h4>'+
      resChipHtml(ids.map(function(k){ return all[k]; }));
  }).join('');
}
function startNavHtml(){
  var keys=Object.keys(window.GUIDES).filter(function(k){ return k!=='0'; }).sort(function(a,b){ return a-b; });
  var byWeek={}, totalSteps=0;
  keys.forEach(function(k){
    var w=Math.floor(Number(k)/7)+1;
    (byWeek[w]=byWeek[w]||[]).push(k);
    totalSteps += window.GUIDES[k].steps.length;
  });
  var head='<div class="g-tip" style="margin:4px 0 12px"><b>Day 2–105 共 '+keys.length+' 天</b>全部配好了分步拆解，合计 '+totalSteps+
    ' 步。每天 5 步：看地图 → 主线输入 → 动手产出 → 真实 A 股验证 → 验收闭环（验收日改成周测专用 5 步）。'+
    '在「逐日计划」里点卡片上的绿色横条展开，或直接点下面某一天跳过去。</div>';
  var rows=Object.keys(byWeek).sort(function(a,b){ return Number(a)-Number(b); }).map(function(w){
    var days=byWeek[w], wi=window.WEEKS[Number(w)-1], ph=phaseOf(Number(w));
    return '<div class="g-week-row"><div class="g-week-h"><b>W'+w+' · '+esc(wi.title)+'</b>'+
      '<span class="sub">阶段 '+ph.id+' · '+days.length+' 天 · '+esc(wi.sub)+'</span></div>'+
      '<div class="g-day-btns">'+days.map(function(k){
        var g=window.GUIDES[k], gp=guideProgress(Number(k));
        return '<button class="btn sm" data-act="jump" data-i="'+k+'" title="'+esc(g.sub)+' · '+g.steps.length+' 步">D'+(Number(k)+1)+(gp.pct===100?' ✓':'')+'</button>';
      }).join('')+'</div></div>';
  }).join('');
  return head+'<div class="g-week-nav">'+rows+'</div>';
}
function viewStart(){
  var g=window.GUIDES[0];
  return '<section class="view">'+
    '<div class="start-hero">'+
      '<div class="kicker">FIRST DAY · ZERO TO REPO</div>'+
      '<h2>第一天不用「知道怎么做」，照着做就行</h2>'+
      '<p>原计划把 Day 1 压缩成一行：Python 环境、Git、虚拟环境、Jupyter、目录骨架、两个笔记模板。这里把它拆成 '+g.steps.length+' 步：每一步都有<b>为什么</b>、<b>可复制的命令</b>、<b>预期输出</b>、<b>报错排查</b>和<b>配套视频 / 官方文档</b>。做完一步勾一步，进度自动保存。</p>'+
      '<div class="goal-grid">'+g.goal.map(function(x,k){
        return '<div><b>交付物 '+pad(k+1)+'</b>'+esc(x)+'</div>';
      }).join('')+'</div>'+
    '</div>'+
    '<div class="sec-nav">'+
      '<a href="#" data-act="anchor" data-id="sg0">① 命令行扫盲</a><a href="#" data-act="anchor" data-id="sg1">② '+g.steps.length+' 步实操</a>'+
      '<a href="#" data-act="anchor" data-id="sg2">③ 文件模板</a><a href="#" data-act="anchor" data-id="sg3">④ 数学摸底</a>'+
      '<a href="#" data-act="anchor" data-id="sg4">⑤ 今日验收</a><a href="#" data-act="anchor" data-id="sg5">⑥ 报错速查</a>'+
      '<a href="#" data-act="anchor" data-id="sg6">⑦ 全部学习材料</a><a href="#" data-act="anchor" data-id="sg7">⑧ Day 2–105 拆解索引</a>'+
    '</div>'+

    '<div class="sec-title" id="sg0">① 零基础先读：命令行到底怎么用</div>'+
    '<div class="sec-desc">下面所有操作都在「终端」里完成。它只是一个用打字代替鼠标点图标的窗口，<b>不会弄坏电脑</b>；看不懂的命令先照抄，原理后面 14 周慢慢补。</div>'+
    '<div class="card"><table class="g-table">'+
      '<tr><th>你要做什么</th><th>怎么做</th></tr>'+
      '<tr><td>打开终端</td><td>Windows：<code>Win+X</code> → 「终端 / Windows PowerShell」；<b>更快</b>：在项目文件夹的地址栏输入 <code>powershell</code> 回车，终端会直接开在这个目录。macOS：Spotlight 搜「终端」。</td></tr>'+
      '<tr><td>知道自己在哪</td><td><code>pwd</code>（PowerShell 用 <code>Get-Location</code>）；列出文件用 <code>dir</code> / Git Bash 的 <code>ls</code>。</td></tr>'+
      '<tr><td>切换目录</td><td><code>cd 路径</code>；Windows 跨盘符先输 <code>D:</code> 回车，或 <code>cd /d D:\\WorkBuddy\\quant-study</code>。</td></tr>'+
      '<tr><td>复制命令</td><td>点命令块右上角「复制」→ 回到终端 <code>Ctrl+V</code> 或右键粘贴。<b>一行一行执行</b>，不要整段一次贴。</td></tr>'+
      '<tr><td>看不懂的符号</td><td>教程里的 <code>$</code>、<code>&gt;</code> 是提示符，<b>不用打</b>；<code>#</code> 开头是注释，也不用打。</td></tr>'+
      '<tr><td>命令卡住 / 想中断</td><td><code>Ctrl+C</code>。Jupyter 启动后那个窗口<b>不要关</b>，关了服务就停；结束按两次 Ctrl+C。</td></tr>'+
      '<tr><td>遇到报错</td><td>复制<b>完整报错原文</b>去检索（本页底部有检索直达）。先看第一条错误行，不要从最后一行猜。</td></tr>'+
    '</table><div class="g-tip" style="margin-top:10px"><b>本计划写 Python 3.10，你机器上若是 3.12 也完全能用</b>，不必为了版本重装。Windows 上用 <code>py -0p</code> 可以看到所有已装版本。</div></div>'+

    '<h3 id="sg1">② 今天的 '+g.steps.length+' 步 · 照着做，做完勾掉</h3>'+
    '<div class="sec-desc">预计 '+esc(g.mins)+'。原计划的 60 分钟是熟练者节奏，第一次做超时很正常；卡住超过 25 分钟就记进 notes/errors.md，继续往下走。</div>'+
    guideHtml(0,{full:true,scope:'start'})+

    '<h3 id="sg2">③ 文件模板 · 一键复制就能用</h3>'+
    '<div class="sec-desc">点标题展开，点「复制全文」直接粘进编辑器。<b>notes/errors.md</b> 与 <b>notes/mastery.md</b> 是原计划点名要写的两个模板，已默认展开。</div>'+
    tmplHtml('start')+

    '<h3 id="sg3">④ 20 分钟数学摸底自测</h3>'+ mathHtml()+

    '<h3 id="sg4">⑤ 今日验收清单（逐条打勾，不靠感觉）</h3>'+
    '<ul class="final-list">'+g.final.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join('')+'</ul>'+
    '<div class="note"><div class="t">验收通过后回到逐日卡片</div><p>勾掉 12 步 → 做 3 道 Day 1 实操题（答案默认隐藏，先闭卷）→ 勾选「标记完成」→ 在笔记里写下卡住最久的一步。习题已换成 Git / venv / .gitignore 的实操题，不再是泛泛的默写。</p></div>'+

    '<h3 id="sg5">⑥ 卡住了怎么办 · 常见报错速查</h3>'+ faqHtml()+

    '<h3 id="sg6">⑦ 今日学习材料总清单</h3>'+
    '<div class="sec-desc">B 站视频按「先看短的」排序；官方文档用来查准确参数；帖子用来看别人的踩坑；「检索直达」是视频失效或遇到新报错时的兜底，点开就是精准搜索结果页。</div>'+
    startResHtml()+

    '<h3 id="sg7">⑧ Day 2–105 全部有逐步拆解 · 按周索引</h3>'+
    '<div class="sec-desc">Week 1 是环境 / 数据层，最容易卡住，D2–D7 配了命令级简版拆解；W2–W15 每天 5 步，含概念精讲、可复制代码、真实 A 股数据验证与常见坑。点任意 D 按钮会跳到那一天的卡片并自动展开拆解。</div>'+
    startNavHtml()+
  '</section>';
}

/* ---------- day card ---------- */
function linkHtml(i, links){
  var d=D(i);
  return '<div class="links">'+links.map(function(x,k){
    var ty=window.RES_TYPES[x.t]||window.RES_TYPES.search;
    var vis=d.opened[k]?' visited':'';
    return '<a class="lnk '+ty.cls+vis+'" href="'+esc(x.u)+'" target="_blank" rel="noopener noreferrer" '+
      'data-act="open-link" data-i="'+i+'" data-k="'+k+'" title="'+esc(x.n+(x.d?' · '+x.d:''))+'">'+
      '<span class="ic">'+ty.icon+'</span><span class="nm">'+esc(x.n)+'</span></a>';
  }).join('')+'</div>';
}
function quizHtml(i){
  var d=D(i), qs=window.buildDayQuiz(weekOf(i),dayOf(i),window.PLAN[i]);
  return qs.map(function(q){
    var v=d.verdict[q.id]||'', cls=v==='ok'?' ok':v==='bad'?' bad':'';
    var ans=d.ans[q.id]||'';
    return '<div class="quiz-item'+cls+'" data-q="'+q.id+'">'+
      '<div class="q-top"><span class="q-k">'+esc(q.k)+'</span><div class="q-text">'+q.q+'</div></div>'+
      '<textarea data-act="ans" data-i="'+i+'" data-q="'+q.id+'" placeholder="在这里作答 / 默写 / 贴代码…（自动保存）">'+esc(ans)+'</textarea>'+
      '<div class="q-actions">'+
        '<button class="mini" data-act="ans-toggle" data-i="'+i+'" data-q="'+q.id+'">'+(d.showAns[q.id]?'隐藏答案要点':'对照答案要点')+'</button>'+
        '<button class="mini'+(v==='ok'?' on-ok':'')+'" data-act="verdict" data-i="'+i+'" data-q="'+q.id+'" data-v="ok">✓ 掌握</button>'+
        '<button class="mini'+(v==='bad'?' on-bad':'')+'" data-act="verdict" data-i="'+i+'" data-q="'+q.id+'" data-v="bad">✗ 进错题本</button>'+
        '<span class="save-hint">作答自动保存</span>'+
      '</div>'+
      '<div class="q-ans'+(d.showAns[q.id]?'':' hidden')+'" id="ans-'+i+'-'+q.id+'">'+q.a+'</div>'+
    '</div>';
  }).join('');
}
function fillBlock(i,type){
  var el=$('#blk-'+type+'-'+i); if(!el || el.dataset.filled) return;
  if(type==='links') el.innerHTML=linkHtml(i,window.buildDayLinks(weekOf(i),dayOf(i),window.PLAN[i]));
  else if(type==='guide') el.innerHTML=guideHtml(i,{full:false,scope:'card'});
  else el.innerHTML=quizHtml(i);
  el.dataset.filled='1';
}
function cardHtml(i){
  var p=window.PLAN[i], w=weekOf(i), dd=dayOf(i), ph=phaseOf(w), d=D(i);
  var isAcc=dd===7, isFocus=i===focusIdx(), isCal=i===todayIdx();
  var links=window.buildDayLinks(w,dd,p);
  var openL=ui.blocks[i+':links']!==false;
  var openQ=ui.blocks[i+':quiz']===true || (isFocus && ui.blocks[i+':quiz']===undefined);
  var qn=quizCount(i);
  var g=window.GUIDES[i], gp=g?guideProgress(i):null;
  var openG = !!g && (ui.blocks[i+':guide']===true || ((isFocus||i===0) && ui.blocks[i+':guide']===undefined));
  var cls='day'+(isFocus?' today':'')+(d.done?' done':'')+(isAcc?' acc-day':'');
  return '<article class="'+cls+'" id="day-'+i+'">'+
    '<div class="day-head">'+
      '<span class="day-no">D'+dd+' · '+pad(i+1)+'</span>'+
      '<span class="day-date">'+esc(dateLabel(i))+'</span>'+
      '<span class="tag phase" style="background:'+ph.color+'">阶段 '+ph.id+'</span>'+
      '<span class="tag">W'+w+' · '+esc(window.WEEKS[w-1].title)+'</span>'+
      (isAcc?'<span class="tag acc-tag">验收日</span>':'')+
      (isFocus?'<span class="tag today-tag">当前学习日</span>':'')+
      (isCal&&!isFocus?'<span class="tag" title="按计划开始日推算，仅供参考">日历今天</span>':'')+
      '<span class="day-title">'+esc(plain(p[0]).slice(0,46))+(plain(p[0]).length>46?'…':'')+'</span>'+
      '<label class="done-box'+(d.done?' is-done':'')+'"><input type="checkbox" data-act="done" data-i="'+i+'"'+(d.done?' checked':'')+'>'+(d.done?'已完成':'标记完成')+'</label>'+
    '</div>'+
    '<div class="day-body">'+
      '<div class="tri">'+
        '<div class="tri-cell"><div class="lbl">① 主线输入 · 23 min</div><div class="txt">'+p[0]+'</div></div>'+
        '<div class="tri-cell out"><div class="lbl">② 动手产出 · 20 min</div><div class="txt">'+p[1]+'</div></div>'+
        '<div class="tri-cell chk"><div class="lbl">③ 验收动作 · 02 min</div><div class="txt">'+p[2]+'</div></div>'+
      '</div>'+
      '<div class="routine">'+window.DAY_ROUTINE.map(function(r){return '<span>'+r.m+' '+r.t+'</span>';}).join('')+'</div>'+

      (g?
      '<div class="gh'+(openG?'':' closed')+'" data-act="block" data-i="'+i+'" data-b="guide">'+
        '<span class="ttl">新手逐步拆解 · 不会做就点开照着敲</span>'+
        '<span class="cnt">'+gp.total+' 步 · 已完成 '+gp.n+'</span>'+
        '<span class="chev">▾</span></div>'+
      '<div class="blk'+(openG?'':' hidden')+'" id="blk-guide-'+i+'"></div>':'')+

      '<div class="blk-head'+(openL?'':' closed')+'" data-act="block" data-i="'+i+'" data-b="links">'+
        '<span class="ttl">学习资料 · 点击直达</span><span class="cnt">'+links.length+'</span>'+
        '<span class="chev">▾</span></div>'+
      '<div class="blk'+(openL?'':' hidden')+'" id="blk-links-'+i+'"></div>'+

      '<div class="blk-head'+(openQ?'':' closed')+'" data-act="block" data-i="'+i+'" data-b="quiz">'+
        '<span class="ttl">习题巩固 · 学完就练</span><span class="cnt">3 题 · 已判 '+qn+'/3</span>'+
        '<span class="chev">▾</span></div>'+
      '<div class="blk'+(openQ?'':' hidden')+'" id="blk-quiz-'+i+'"></div>'+

      '<div class="day-foot">'+
        '<div><span class="note-lbl">学习笔记 / 疑问（卡住 25 分钟就记下来，周日统一处理）</span>'+
        '<textarea data-act="note" data-i="'+i+'" placeholder="今天的推导、代码坑、疑问…（自动保存）" style="min-height:52px">'+esc(d.note)+'</textarea></div>'+
        '<div><span class="note-lbl">掌握度自评（写进台账）</span><div class="lv-row">'+
          window.LEVELS.map(function(l){ return '<button class="lv-btn'+(d.level===l.k?' on':'')+'" data-act="level" data-i="'+i+'" data-l="'+l.k+'" title="'+esc(l.how)+'">'+l.k+'</button>'; }).join('')+
        '</div></div>'+
        (i<TOTAL-1?'<div class="day-next"><button class="btn sm" data-act="next-from-card" data-i="'+i+'">→ 学完这天，去 Day '+(i+2)+'</button></div>':'')+
      '</div>'+
    '</div>'+
  '</article>';
}
function visibleDays(){
  var arr=[];
  for(var i=0;i<TOTAL;i++){
    var w=weekOf(i), dd=dayOf(i), d=D(i), p=window.PLAN[i];
    if(ui.week!=='all' && w!==ui.week && !ui.q) continue;   // 有搜索词时全库检索，不被当前周卡住
    if(ui.filter==='todo' && d.done) continue;
    if(ui.filter==='done' && !d.done) continue;
    if(ui.filter==='acc' && dd!==7) continue;
    if(ui.filter==='wrong'){
      var has=false; ['q1','q2','q3'].forEach(function(q){ if(d.verdict[q]==='bad'&&!S.fixed['d'+i+':'+q]) has=true; });
      if(!has) continue;
    }
    if(ui.q){
      var hay=(plain(p[0])+plain(p[1])+plain(p[2])+window.WEEKS[w-1].title+window.WEEKS[w-1].sub+' D'+dd+' W'+w).toLowerCase();
      if(window.GUIDES[i]){
        var g=window.GUIDES[i];
        hay += (' '+g.title+' '+g.sub+' '+g.steps.map(function(s){ return s.t+' '+s.why; }).join(' ')).toLowerCase();
      }
      if(hay.indexOf(ui.q.toLowerCase())<0) continue;
    }
    arr.push(i);
  }
  return arr;
}
/* DOM 重建会把滚动条推回顶部，看起来就像「页面自己跳回 Day 1」；统一在这里原样恢复 */
function restoreScroll(y){
  if(!y || y<=0){ if(window.scrollY>0) window.scrollTo({top:0,behavior:'auto'}); return; }
  window.scrollTo({top:y,behavior:'auto'});
  setTimeout(function(){ if(Math.abs(window.scrollY-y)>2) window.scrollTo({top:y,behavior:'auto'}); },40);
}
function renderDayList(){
  var y=lastScroll;
  var list=visibleDays();
  $('#dayList').innerHTML = list.length
    ? list.map(cardHtml).join('')
    : '<div class="empty">没有符合条件的任务。换个筛选条件，或点「展开全部 105 天」。</div>';
  list.forEach(function(i){
    if(ui.blocks[i+':links']!==false) fillBlock(i,'links');
    if(window.GUIDES[i] && (ui.blocks[i+':guide']===true || ((i===focusIdx()||i===0) && ui.blocks[i+':guide']===undefined))) fillBlock(i,'guide');
    var isFocus=i===focusIdx();
    if(ui.blocks[i+':quiz']===true || (isFocus && ui.blocks[i+':quiz']===undefined)) fillBlock(i,'quiz');
  });
  restoreScroll(y);
}
function viewDays(){
  var chips='<button class="wk'+(ui.week==='all'?' on':'')+'" data-act="week" data-w="all">全部 105 天</button>'+
    window.WEEKS.map(function(w){
      var ph=phaseOf(w.w), n=0;
      for(var d=1;d<=7;d++) if(D(idx(w.w,d)).done) n++;
      return '<button class="wk'+(ui.week===w.w?' on':'')+'" data-act="week" data-w="'+w.w+'" title="'+esc(w.sub)+'">'+
        '<span class="dot" style="background:'+ph.color+'"></span>W'+w.w+' '+esc(w.title)+' <span style="opacity:.7;font-family:var(--mono)">'+n+'/7</span></button>';
    }).join('');
  var cur=window.WEEKS[weekOf(focusIdx())-1];
  return '<section class="view">'+
    '<div class="sec-title">105 天逐日计划</div>'+
    '<div class="sec-desc">当前学习日：<b>Day '+(focusIdx()+1)+'</b> · 当前周：<b>W'+cur.w+' '+esc(cur.title)+'</b> · '+esc(cur.note)+
      '　每天固定结构：05 分钟闪卡 → 23 分钟主线 → 20 分钟动手 → 10 分钟真实 A 股数据验证 → 02 分钟验收三问。'+
      '<br><b>不会自动跳转</b>：完成当天只把顶部「当前学习日」推进到下一题，想继续学就点「→ 去学这一天」或卡片底部的「去 Day N」；刷新后仍停在你离开的位置。'+
      '<br><b>搜索是全库的</b>：输入关键词会跨全部 15 周查找，不受当前周筛选限制。'+
      '<br><b>105 天都带「新手逐步拆解」</b>：点卡片里绿色横条展开，含可复制命令、预期输出、报错排查与配套视频；Day 1 完整版在「新手起步」。</div>'+
    '<div class="weeks">'+chips+'</div>'+
    '<div class="filters">'+
      '<div class="search"><input id="searchBox" data-act="search" placeholder="搜索主题、函数、公式、周次… 如 OLS、PIT、Itô、SVD" value="'+esc(ui.q)+'"></div>'+
      '<select data-act="filter">'+
        '<option value="all"'+(ui.filter==='all'?' selected':'')+'>全部状态</option>'+
        '<option value="todo"'+(ui.filter==='todo'?' selected':'')+'>未完成</option>'+
        '<option value="done"'+(ui.filter==='done'?' selected':'')+'>已完成</option>'+
        '<option value="acc"'+(ui.filter==='acc'?' selected':'')+'>仅验收日</option>'+
        '<option value="wrong"'+(ui.filter==='wrong'?' selected':'')+'>有错题</option>'+
      '</select>'+
      '<button class="btn sm" data-act="openall">展开本页全部习题</button>'+
      '<button class="btn sm" data-act="closeall">收起全部区块</button>'+
    '</div>'+
    '<div id="dayList"></div>'+
  '</section>';
}

/* ---------- weekly tests ---------- */
function viewTests(){
  var passed=0; window.WEEKTEST.forEach(function(t){ if(T(t.w).mark.filter(function(x){return x==='ok';}).length>=2) passed++; });
  return '<section class="view">'+
    '<div class="sec-title">周测题库 · 15 套</div>'+
    '<div class="sec-desc">每周日闭卷 20 分钟，随机抽 3 题。<b>≥ 2/3 题正确 = 本周通过</b>；否则下周 D1–D2 改为补强，不学新内容。已通过 <b>'+passed+'/15</b>。答案要点不是标准答案，结论对、推导合理即判对。</div>'+
    '<div class="note"><div class="t">周日验收日 · 60 分钟固定三段</div><p>20 分钟闭卷小测 → 20 分钟代码验收（本周脚本加断言从头跑通）→ 20 分钟错题闭环（错题进错题本，次日晨检）。</p></div>'+
    window.WEEKTEST.map(function(t){
      var st=T(t.w), ok=st.mark.filter(function(x){return x==='ok';}).length;
      var done=st.mark.filter(function(x){return x!==null;}).length;
      var open=ui.wtOpen[t.w];
      var badge=done<3?'<span class="pass n">未判完</span>':(ok>=2?'<span class="pass y">通过</span>':'<span class="pass n">未通过 · 补强</span>');
      return '<div class="wt" id="wt-'+t.w+'">'+
        '<div class="wt-head"><b>周测 '+['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','⑪','⑫','⑬','⑭','⑮'][t.w-1]+' · Week '+t.w+'</b>'+
          '<span class="tag">'+esc(window.WEEKS[t.w-1].title)+'</span>'+badge+
          '<span class="score">'+ok+'/3 正确</span>'+
          '<button class="btn sm" data-act="wt-toggle" data-w="'+t.w+'">'+(open?'收起':'展开答题')+'</button></div>'+
        (open?'<div id="wtBody-'+t.w+'">'+t.q.map(function(q,j){
          var m=st.mark[j]||'';
          return '<div class="wt-q"><div class="qn">第 '+(j+1)+' 题</div><div class="qq">'+esc(q)+'</div>'+
            '<textarea data-act="tans" data-w="'+t.w+'" data-j="'+j+'" placeholder="闭卷作答…（自动保存）" style="min-height:52px">'+esc(st.ans[j]||'')+'</textarea>'+
            '<div class="q-actions">'+
              '<button class="mini" data-act="wt-show" data-w="'+t.w+'" data-j="'+j+'">判分标准</button>'+
              '<button class="mini'+(m==='ok'?' on-ok':'')+'" data-act="tmark" data-w="'+t.w+'" data-j="'+j+'" data-v="ok">✓ 答对</button>'+
              '<button class="mini'+(m==='bad'?' on-bad':'')+'" data-act="tmark" data-w="'+t.w+'" data-j="'+j+'" data-v="bad">✗ 答错</button>'+
            '</div><div class="q-ans'+(st.show?'':' hidden')+'" id="wtAns-'+t.w+'-'+j+'">'+esc(t.a[j])+'</div></div>';
        }).join('')+'</div>':'')+
      '</div>';
    }).join('')+
  '</section>';
}

/* ---------- gates ---------- */
function viewGates(){
  return '<section class="view">'+
    '<div class="sec-title">阶段出口清单 · 五道关</div>'+
    '<div class="sec-desc">判定标准是 <b>掌握度达到 L3（会用 + 知道失效边界）</b>，比周测严格。每关要求 <b>≥ 80% 达成</b>；未达标则下一周前两天全部补强。</div>'+
    window.GATES.map(function(g){
      var arr=S.gates[g.id]||[], n=arr.filter(Boolean).length, pct=Math.round(n/g.items.length*100);
      return '<div class="gate"><div class="gate-head"><b>'+esc(g.name)+'</b><span class="sub">'+esc(g.sub)+'</span>'+
        '<span class="gate-pct">'+n+' / '+g.items.length+' · '+pct+'%'+(pct>=80?' ✓ 达出口':'')+'</span></div>'+
        '<div class="bar-bg"><div class="bar-fill'+(pct>=80?'':' acc')+'" style="width:'+pct+'%"></div></div>'+
        '<div class="check">'+g.items.map(function(it,k){
          return '<label><input type="checkbox" data-act="gate" data-g="'+g.id+'" data-k="'+k+'"'+(arr[k]?' checked':'')+'><span>'+esc(it)+'</span></label>';
        }).join('')+'</div></div>';
    }).join('')+
  '</section>';
}

/* ---------- wrong book ---------- */
function wrongItem(key){
  var p=key.split(':');
  if(key[0]==='d'){
    var i=parseInt(p[0].slice(1),10), qid=p[1], d=D(i);
    var qs=window.buildDayQuiz(weekOf(i),dayOf(i),window.PLAN[i]);
    var q=qs.filter(function(x){return x.id===qid;})[0]||{k:'',q:'',a:''};
    return { src:'Day '+(i+1)+' · W'+weekOf(i)+' D'+dayOf(i), k:q.k, q:plain(q.q), a:plain(q.a), mine:d.ans[qid]||'', jump:i };
  }else{
    var w=parseInt(p[0].slice(1),10), j=parseInt(p[1],10), t=T(w), wt=window.WEEKTEST[w-1];
    return { src:'周测 '+w+' · 第 '+(j+1)+' 题', k:'周测', q:wt.q[j], a:wt.a[j], mine:t.ans[j]||'' };
  }
}
function viewWrong(){
  var keys=wrongKeys();
  var body=keys.length ? keys.map(function(k){
    var x=wrongItem(k);
    return '<div class="quiz-item bad" style="margin-bottom:12px">'+
      '<div class="q-top"><span class="q-k">'+esc(x.src)+'</span><div class="q-text"><b>'+esc(x.k)+'</b>　'+esc(x.q)+'</div></div>'+
      (x.mine?'<div class="q-ans" style="background:#fff"><b>我的作答：</b>'+esc(x.mine)+'</div>':'')+
      '<div class="q-ans"><b>答案要点 / 判分：</b>'+esc(x.a)+'</div>'+
      '<div class="q-actions">'+
        (x.jump!=null?'<button class="mini" data-act="jump" data-i="'+x.jump+'">→ 回到这一天重做</button>':'')+
        '<button class="mini on-fixed" data-act="fixed" data-key="'+esc(k)+'">✓ 已订正（移出错题本）</button>'+
      '</div></div>';
  }).join('') : '<div class="empty">错题本是空的。去逐日计划里做题，判为「✗ 进错题本」的题目会自动汇总到这里。</div>';
  return '<section class="view">'+
    '<div class="sec-title">错题本</div>'+
    '<div class="sec-desc">待订正 <b>'+keys.length+'</b> 题。规则：抄清「错在哪、正确结论、正确思路」，第二天晨检直接默写错题，连续两次答对才算过。</div>'+
    '<div class="callout"><div class="t">疑问清单 & 掌握度台账</div><p>卡住超过 25 分钟就记进当天笔记，周日统一处理并标注「已解决 / 挂起」；挂起超两周直接标「放弃」。每个知识点在卡片底部标一个 L 级别，长期维护这一张表即可。</p></div>'+
    '<h3>待订正题目</h3>'+body+
  '</section>';
}

/* ---------- mastery ledger ---------- */
function viewLedger(){
  var cnt={L0:0,L1:0,L2:0,L3:0,'':0};
  for(var k in S.days){ var l=S.days[k].level; cnt[l]=(cnt[l]||0)+1; }
  var rows=[];
  for(var i=0;i<TOTAL;i++){
    var d=D(i);
    if(!ui.ledgerAll && !d.level && !d.done) continue;
    rows.push('<tr><td class="mono">Day '+pad(i+1)+'</td><td class="mono">W'+weekOf(i)+' D'+dayOf(i)+'</td>'+
      '<td>'+esc(plain(window.PLAN[i][0]).slice(0,48))+'…</td>'+
      '<td class="mono">'+(d.level?'<b>'+d.level+'</b>':'—')+'</td>'+
      '<td>'+(d.done?'<span style="color:var(--primary)">✓ 已完成</span>':'—')+'</td>'+
      '<td class="mono">'+esc(d.doneAt||'—')+'</td>'+
      '<td><button class="mini" data-act="jump" data-i="'+i+'">打开</button></td></tr>');
  }
  return '<section class="view">'+
    '<div class="sec-title">掌握度台账</div>'+
    '<div class="sec-desc">知识点 | L 级 | 验收日期。这是唯一需要长期维护的表：<b>期末要求所有知识点 ≥ L2、阶段出口知识点 = L3</b>。</div>'+
    '<div class="grid3" style="margin-bottom:16px">'+window.LEVELS.map(function(l){
      return '<div class="card"><div class="lv-tag" style="font-family:var(--mono);font-size:12px;color:var(--primary)">'+l.k+' '+l.n+'</div>'+
        '<div style="font-family:var(--mono);font-size:22px;font-weight:600;margin:6px 0">'+(cnt[l.k]||0)+'</div>'+
        '<div style="font-size:12px;color:var(--soft)">'+esc(l.how)+'</div></div>';
    }).join('')+'</div>'+
    '<div class="filters"><button class="btn sm" data-act="ledger-all">'+(ui.ledgerAll?'只看已记录':'显示全部 105 天')+'</button>'+
      '<span style="font-size:12.5px;color:var(--soft)">尚未评级 '+(cnt['']||0)+' 天 · 已评级 '+(TOTAL-(cnt['']||0))+' 天</span></div>'+
    '<div class="tbl-wrap"><table><thead><tr><th>日</th><th>周·日</th><th>知识点</th><th>L 级</th><th>完成</th><th>验收日期</th><th></th></tr></thead>'+
      '<tbody>'+(rows.length?rows.join(''):'<tr><td colspan="7" style="text-align:center;color:var(--soft);padding:32px">还没有记录。去逐日计划里标 L 级或勾选完成。</td></tr>')+'</tbody></table></div>'+
  '</section>';
}

/* ---------- all resources ---------- */
function viewResources(){
  return '<section class="view">'+
    '<div class="sec-title">全部资料 · 可直达清单</div>'+
    '<div class="sec-desc">逐日卡片里的资料由这里按周次与主题自动装配。<b>「检索直达」</b>类会打开 B 站 / 知乎 / Semantic Scholar 的精准搜索结果页，用于兜底，避免失效死链。</div>'+
    window.RES_GROUPS.map(function(g){
      return '<h3>'+esc(g.name)+' <span style="font-family:var(--mono);font-size:11px;color:var(--soft);font-weight:400">'+g.ids.length+' 条</span></h3>'+
        '<div class="card"><ul class="res-list">'+g.ids.map(function(id){
          var r=window.RES[id]; if(!r) return '';
          var ty=window.RES_TYPES[r.t]||window.RES_TYPES.search;
          return '<li><a href="'+esc(r.u)+'" target="_blank" rel="noopener noreferrer">'+
            '<div class="n"><span class="ic" style="display:inline-flex;width:17px;height:17px;border-radius:4px;align-items:center;justify-content:center;color:#fff;font-family:var(--mono);font-size:10px;background:'+
              ({bili:'#c9506a',paper:'#3a6ea5',doc:'#2f6f5e',post:'#c97b3f',tool:'#8a63a8',search:'#7c7a72'}[r.t]||'#7c7a72')+';margin-right:7px">'+ty.icon+'</span>'+esc(r.n)+'</div>'+
            (r.d?'<div class="d">'+esc(r.d)+'</div>':'')+
            '<span class="u">'+esc(r.u)+'</span></a></li>';
        }).join('')+'</ul></div>';
    }).join('')+
  '</section>';
}

/* ---------- method ---------- */
function viewMethod(){
  return '<section class="view">'+
    '<div class="sec-title">方法、验收体系与 A 股速查</div>'+
    '<div class="sec-desc">整套计划的判定标准：数学自学最常见的失败不是不努力，而是把「看懂了」误当成「会用了」。</div>'+
    '<h3>掌握度四级</h3><div class="lv-cards">'+window.LEVELS.map(function(l){
      return '<div class="lv-card"><span class="tag2">'+l.k+' '+l.n+'</span><b>'+esc(l.d)+'</b><p>'+esc(l.how)+'</p></div>';
    }).join('')+'</div>'+
    '<h3>每日验收三问（当天结束前 2 分钟）</h3><div class="kv">'+window.DAILY_3Q.map(function(x){
      return '<div class="kv-row"><div class="kv-k">'+esc(x.k)+'</div><div class="kv-v">'+x.v+'</div></div>';
    }).join('')+'</div>'+
    '<h3>四种验收动作（每个知识点至少满足两种）</h3><div class="grid2">'+window.VERIFY_ACTS.map(function(a){
      return '<div class="card"><b style="font-size:13.5px">'+esc(a.n)+'</b><p style="font-size:12.8px;color:var(--muted);margin-top:5px">'+esc(a.d)+'</p></div>';
    }).join('')+'</div>'+
    '<h3>A 股硬约束与成本模型（回测必须建模）</h3><div class="kv">'+window.A_RULES.map(function(x){
      return '<div class="kv-row"><div class="kv-k">'+esc(x.k)+'</div><div class="kv-v">'+x.v+'</div></div>';
    }).join('')+'</div>'+
    '<div class="note"><div class="t">成本档位（费率取自 2025 年多家券商公示，以你的交割单为准）</div><p>乐观万 7 / 往返 · 中性万 10 / 往返 · 悲观万 15 / 往返。按中性档，年化双边换手 50 倍会吃掉约 2.5%–5% 年收益。</p></div>'+
    '<h3>最常杀死这个计划的八件事</h3><div class="card"><ul class="tick">'+window.FAIL_MODES.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul></div>'+
    '<div class="callout"><div class="t">三个必须写下来的机制</div><p><b>① 错题本</b>（本页自动汇总）　<b>② 疑问清单</b>（写在当天笔记，周日处理）　<b>③ 掌握度台账</b>（卡片底部标 L 级）。每周日记得 commit / push 一次代码——仓库记录本身就是简历。</p></div>'+
  '</section>';
}

/* ---------- render ---------- */
function render(){
  var y=lastScroll;
  renderDash(); renderTabs();
  var html;
  switch(ui.tab){
    case 'start': html=viewStart(); break;
    case 'days': html=viewDays(); break;
    case 'tests': html=viewTests(); break;
    case 'gates': html=viewGates(); break;
    case 'wrong': html=viewWrong(); break;
    case 'ledger': html=viewLedger(); break;
    case 'resources': html=viewResources(); break;
    case 'method': html=viewMethod(); break;
    default: html=viewDays();
  }
  $('#view').innerHTML=html;
  if(ui.tab==='days') renderDayList();
  $('#btnExpand').textContent = ui.week==='all' ? '只看当前周' : '展开全部 105 天';
  $('#startDate').value=S.settings.startDate;
  restoreScroll(y);
  saveUILater();
}

/* ---------- local updaters (avoid full re-render) ---------- */
function refreshMeta(){ renderDash(); renderTabs(); }
function updateCardChrome(i){
  var card=$('#day-'+i); if(!card) return;
  var d=D(i); card.classList.toggle('done',!!d.done);
  var box=card.querySelector('.done-box');
  if(box){ box.classList.toggle('is-done',!!d.done); box.lastChild.textContent=d.done?'已完成':'标记完成'; }
  var qh=card.querySelector('[data-b="quiz"] .cnt'); if(qh) qh.textContent='3 题 · 已判 '+quizCount(i)+'/3';
}

/* ---------- events ---------- */
/* 统一入口：切换当天并展开内容。任何手动跳转都会同步「当前学习日」，所以刷新后仍停在这一天 */
function goToDay(i, quiet){
  if(i<0 || i>=TOTAL) return;
  setFocus(i, !!quiet);
  ui.tab='days'; ui.week=weekOf(i); ui.filter='all'; ui.q='';
  ui.blocks[i+':quiz']=true; ui.blocks[i+':links']=true;
  if(window.GUIDES[i]) ui.blocks[i+':guide']=true;
  lastScroll=0;
  render();
  setTimeout(function(){
    var t=$('#day-'+i);
    if(t){
      t.scrollIntoView({behavior:'smooth',block:'start'});
      setTimeout(function(){ lastScroll=Math.max(0,t.getBoundingClientRect().top+window.scrollY-70); saveUI(); },750);
    }
  },60);
}
document.addEventListener('click',function(e){
  var el=e.target.closest('[data-act]'); if(!el) return;
  var a=el.dataset.act, i=parseInt(el.dataset.i,10), w=parseInt(el.dataset.w,10);

  /* 章节导航只滚动，不写 URL hash —— 否则刷新时浏览器会自动滚回锚点 */
  if(a==='anchor'){ e.preventDefault(); var tgt=$('#'+el.dataset.id); if(tgt) tgt.scrollIntoView({behavior:'smooth',block:'start'}); return; }
  if(a==='tab'){ ui.tab=el.dataset.t; lastScroll=0; render(); return; }
  if(a==='week'){
    ui.week=el.dataset.w==='all'?'all':parseInt(el.dataset.w,10);
    $$('#view .wk').forEach(function(b){ b.classList.toggle('on', b.dataset.w===String(ui.week)); });
    $('#btnExpand').textContent = ui.week==='all' ? '只看当前周' : '展开全部 105 天';
    renderDayList(); saveUILater(); return;
  }
  if(a==='filter') return;

  if(a==='copy'){
    var src=document.getElementById(el.dataset.target);
    if(src) copyToClipboard(src.textContent, el);
    return;
  }
  if(a==='gstep-check') return;   // 交给 change，避免勾一步就误收起详情
  if(a==='gstep-toggle'){
    var gk=el.dataset.key, gst=el.closest('.gstep');
    if(!gst) return;
    var gOpen=!gst.classList.contains('open');
    gst.classList.toggle('open',gOpen); ui.gstepOpen[gk]=gOpen; return;
  }
  if(a==='gstep-all'){
    var gAll=el.dataset.v==='open';
    $$('#view .gstep').forEach(function(x){
      x.classList.toggle('open',gAll);
      if(x.dataset.key) ui.gstepOpen[x.dataset.key]=gAll;
    });
    return;
  }
  if(a==='tmpl-toggle'){
    var tc=el.closest('.tmpl-card'); if(!tc) return;
    var tOpen=!tc.classList.contains('open');
    tc.classList.toggle('open',tOpen); ui.tmpl[el.dataset.t]=tOpen; return;
  }
  if(a==='mat-show'){
    ui.matShow=!ui.matShow;
    $$('#view .mat-q .a').forEach(function(x){ x.classList.toggle('hidden',!ui.matShow); });
    el.textContent=ui.matShow?'隐藏全部答案':'显示全部答案'; return;
  }

  if(a==='block'){
    var b=el.dataset.b, key=i+':'+b, blk=$('#blk-'+b+'-'+i);
    var opening=blk.classList.contains('hidden');
    ui.blocks[key]=opening;
    blk.classList.toggle('hidden',!opening); el.classList.toggle('closed',!opening);
    if(opening) fillBlock(i,b);
    return;
  }
  if(a==='open-link'){
    var d=D(i); d.opened[el.dataset.k]=1; save(); el.classList.add('visited'); return;
  }
  if(a==='ans-toggle'){
    var dd=D(i), qid=el.dataset.q, box=$('#ans-'+i+'-'+qid);
    dd.showAns[qid]=!dd.showAns[qid]; save();
    box.classList.toggle('hidden',!dd.showAns[qid]);
    el.textContent=dd.showAns[qid]?'隐藏答案要点':'对照答案要点'; return;
  }
  if(a==='verdict'){
    var v=D(i), q2=el.dataset.q, val=el.dataset.v;
    v.verdict[q2] = v.verdict[q2]===val ? '' : val; save();
    var item=el.closest('.quiz-item');
    item.className='quiz-item'+(v.verdict[q2]==='ok'?' ok':v.verdict[q2]==='bad'?' bad':'');
    $$('[data-act="verdict"]',item).forEach(function(btn){ btn.classList.remove('on-ok','on-bad'); });
    if(v.verdict[q2]==='ok') el.classList.add('on-ok');
    if(v.verdict[q2]==='bad') el.classList.add('on-bad');
    updateCardChrome(i); refreshMeta();
    if(v.verdict[q2]==='bad') toast('已加入错题本');
    return;
  }
  if(a==='level'){
    var dl=D(i); dl.level = dl.level===el.dataset.l ? '' : el.dataset.l; save();
    $$('[data-act="level"][data-i="'+i+'"]').forEach(function(b){ b.classList.toggle('on', b.dataset.l===dl.level); });
    toast('掌握度已记为 '+(dl.level||'未评级')); return;
  }
  if(a==='done') return; // handled by change
  if(a==='openall'){
    visibleDays().forEach(function(k){ ui.blocks[k+':links']=true; ui.blocks[k+':quiz']=true; if(window.GUIDES[k]) ui.blocks[k+':guide']=true; });
    renderDayList(); toast('已展开本页全部拆解、资料与习题'); return;
  }
  if(a==='closeall'){
    visibleDays().forEach(function(k){ ui.blocks[k+':links']=false; ui.blocks[k+':quiz']=false; ui.blocks[k+':guide']=false; });
    renderDayList(); return;
  }
  if(a==='jump'){ goToDay(i); return; }
  if(a==='next-from-card'){ goToDay(i+1); return; }
  if(a==='wt-toggle'){ ui.wtOpen[w]=!ui.wtOpen[w]; render(); return; }
  if(a==='wt-show'){
    var t=T(w), j=parseInt(el.dataset.j,10), ab=$('#wtAns-'+w+'-'+j);
    t.show=!t.show; save();
    $$('#wtBody-'+w+' .q-ans').forEach(function(x){ x.classList.toggle('hidden',!t.show); });
    return;
  }
  if(a==='tmark'){
    var tt=T(w), jj=parseInt(el.dataset.j,10), vv=el.dataset.v;
    tt.mark[jj]=tt.mark[jj]===vv?null:vv; save();
    $$('[data-act="tmark"][data-w="'+w+'"][data-j="'+jj+'"]').forEach(function(b){ b.classList.remove('on-ok','on-bad'); });
    if(tt.mark[jj]==='ok') el.classList.add('on-ok'); if(tt.mark[jj]==='bad') el.classList.add('on-bad');
    var ok=tt.mark.filter(function(x){return x==='ok';}).length;
    var head=$('#wt-'+w+' .score'); if(head) head.textContent=ok+'/3 正确';
    refreshMeta(); return;
  }
  if(a==='gate') return;
  if(a==='fixed'){ S.fixed[el.dataset.key]=true; save(); render(); toast('已移出错题本'); return; }
  if(a==='ledger-all'){ ui.ledgerAll=!ui.ledgerAll; render(); return; }
});

/* textarea / select / checkbox changes */
document.addEventListener('input',function(e){
  var el=e.target, a=el.dataset.act;
  if(a==='search'){ ui.q=el.value; renderDayList(); return; }
  if(a==='ans'){ D(parseInt(el.dataset.i,10)).ans[el.dataset.q]=el.value; save();
    var h=el.parentNode.querySelector('.save-hint'); if(h){ h.textContent='已保存 ✓'; clearTimeout(h._t); h._t=setTimeout(function(){h.textContent='作答自动保存';},1200); } return; }
  if(a==='note'){ D(parseInt(el.dataset.i,10)).note=el.value; save(); return; }
  if(a==='tans'){ T(parseInt(el.dataset.w,10)).ans[parseInt(el.dataset.j,10)]=el.value; save(); return; }
});
document.addEventListener('change',function(e){
  var el=e.target, a=el.dataset.act;
  if(a==='filter'){ ui.filter=el.value; renderDayList(); return; }
  if(a==='gstep-check'){
    if(el.tagName!=='INPUT') return;
    var gi=parseInt(el.dataset.i,10), gd=D(gi);
    gd.guide[el.dataset.s]=el.checked; save();
    var gst=el.closest('.gstep'); if(gst) gst.classList.toggle('is-done',el.checked);
    updateGuideProgress(gi); return;
  }
  if(a==='done'){
    var i=parseInt(el.dataset.i,10), d=D(i);
    d.done=el.checked; d.doneAt=el.checked?todayStr():''; save();
    updateCardChrome(i); refreshMeta();
    /* 完成当天后只推进焦点，绝不自动切 tab / 自动滚动 —— 想继续学下一天由你点按钮决定 */
    if(el.checked && focusIdx()<=i && i<TOTAL-1){
      S.settings.focus=i+1; saveNow(); renderFocusUI();
      if(ui.tab==='days') renderDayList();
      toast('Day '+(i+1)+' 完成 ✓ 当前学习日已推进到 Day '+(i+2)+'，点顶部「去学这一天」继续');
    } else if(el.checked){
      toast('Day '+(i+1)+' 完成 ✓ 累计 '+doneCount()+'/105');
    }
    return;
  }
  if(a==='gate'){
    var g=el.dataset.g, k=parseInt(el.dataset.k,10);
    if(!S.gates[g]) S.gates[g]=[]; S.gates[g][k]=el.checked; save();
    var gate=window.GATES.filter(function(x){return x.id===g;})[0];
    var arr=S.gates[g], n=arr.filter(Boolean).length, pct=Math.round(n/gate.items.length*100);
    var box=el.closest('.gate');
    if(box){ box.querySelector('.bar-fill').style.width=pct+'%'; box.querySelector('.bar-fill').className='bar-fill'+(pct>=80?'':' acc');
      box.querySelector('.gate-pct').textContent=n+' / '+gate.items.length+' · '+pct+'%'+(pct>=80?' ✓ 达出口':''); }
    return;
  }
});

/* toolbar */
$('#btnPrevDay').onclick=function(){ goToDay(focusIdx()-1, true); };
$('#btnNextDay').onclick=function(){ goToDay(focusIdx()+1, true); };
$('#focusSelect').onchange=function(){ goToDay(parseInt(this.value,10), true); };
$('#btnGoFocus').onclick=function(){ goToDay(focusIdx(), true); };
$('#btnCalToday').onclick=function(){ toast('日历今天 = Day '+(todayIdx()+1)+'（按开始日期推算，不影响当前学习日）'); };
$('#btnExpand').onclick=function(){ ui.week = ui.week==='all' ? weekOf(focusIdx()) : 'all'; ui.tab='days'; render(); };
$('#startDate').onchange=function(){
  S.settings.startDate=this.value||todayStr(); saveNow(); renderFocusUI();
  if(ui.tab==='days') renderDayList();
  toast('开始日期已更新，日历今天 = Day '+(todayIdx()+1)+'（当前学习日不变）');
};
$('#btnExport').onclick=function(){
  saveNow();
  var blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
  var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='quant-study-backup-'+todayStr()+'.json'; document.body.appendChild(a); a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},200);
  toast('备份已导出');
};
$('#btnImport').onclick=function(){ $('#fileInput').click(); };
$('#fileInput').onchange=function(){
  var f=this.files[0]; if(!f) return;
  var r=new FileReader();
  r.onload=function(){
    try{
      var o=JSON.parse(r.result);
      if(!o || o.v!==1 || !o.days) throw new Error('格式不符');
      confirmBox('导入备份','将覆盖当前所有进度与作答，确定继续？',function(){
        S=o; if(!S.settings)S.settings={startDate:todayStr()};
        if(!S.tests)S.tests={}; if(!S.gates)S.gates={}; if(!S.fixed)S.fixed={};
        saveNow(); ui.week=weekOf(focusIdx()); lastScroll=0; render(); toast('备份已导入');
      });
    }catch(err){ toast('导入失败：'+err.message); }
  };
  r.readAsText(f); this.value='';
};
$('#btnReset').onclick=function(){
  confirmBox('清空全部进度','将删除所有完成记录、作答、笔记、判分与台账，且不可撤销。建议先导出备份。',function(){
    S=fresh(); S.settings.seenStart=true; saveNow();
    ui.blocks={}; ui.wtOpen={}; ui.gstepOpen={}; ui.week=1; ui.tab='days'; lastScroll=0;
    render(); toast('进度已清空');
  });
};
$('#modalBg').onclick=function(e){ if(e.target===this) this.classList.remove('on'); };
document.addEventListener('keydown',function(e){ if(e.key==='Escape') $('#modalBg').classList.remove('on'); });

/* 章节锚点不再写 hash；旧的 #sgX 若留在地址栏，刷新时浏览器会自动滚回锚点，看着像「乱跳」，这里清掉 */
if(location.hash){
  try{ history.replaceState(null,'',location.pathname+location.search); }
  catch(e){ try{ location.hash=''; }catch(e2){} }
}
render();
/* 恢复上次离开时的滚动位置：刷新后原地继续，不回第一天 */
if(lastScroll>0) setTimeout(function(){ window.scrollTo({top:lastScroll,behavior:'auto'}); },80);
})();
