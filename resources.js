/* ============================================================
   学习资料库
   类型：bili=B站视频 | paper=论文 | doc=官方文档/教材 | post=帖子/专栏 | tool=代码库
   - 固定直链均为可打开的真实地址；不确定的论文一律走「检索直达」，避免死链
   - 每天由 buildDayLinks() 按周次 + 主题关键词动态装配
   ============================================================ */
window.RES_TYPES = {
  bili:  { label:'B站视频', icon:'▶', cls:'t-bili'  },
  paper: { label:'论文',    icon:'◈', cls:'t-paper' },
  doc:   { label:'官方文档', icon:'▤', cls:'t-doc'   },
  post:  { label:'帖子',    icon:'❝', cls:'t-post'  },
  tool:  { label:'代码库',  icon:'⌘', cls:'t-tool'  },
  search:{ label:'检索直达', icon:'⌕', cls:'t-search'}
};

function biliSearch(k){ return 'https://search.bilibili.com/all?keyword=' + encodeURIComponent(k); }
function zhihu(k){ return 'https://www.zhihu.com/search?type=content&q=' + encodeURIComponent(k); }
function scholar(k){ return 'https://www.semanticscholar.org/search?q=' + encodeURIComponent(k) + '&sort=relevance'; }
function web(k){ return 'https://www.bing.com/search?q=' + encodeURIComponent(k); }

/* 主线课程资源（真实地址） */
window.RES = {
  /* ── B站主线课 ── */
  mit1806:  { t:'bili', n:'MIT 18.06 线性代数 · Strang（35 讲中英字幕）', u:'https://www.bilibili.com/video/BV1zx411g7gq/', d:'线代主线，可用 ?p=N 直接跳到对应讲次' },
  mit1806b: { t:'bili', n:'MIT 18.06 线性代数（另一搬运 · 36 集）', u:'https://www.bilibili.com/video/BV183Tg6cEEn/', d:'上一个打不开时用这个备用' },
  b3b1b:    { t:'bili', n:'3Blue1Brown《线性代数的本质》官方双语合集', u:'https://www.bilibili.com/video/BV1ys411472E/', d:'16 集几何直觉，W2 D6 / W5 D6 阅读日' },
  b3b1bcn:  { t:'bili', n:'《线性代数的本质》中文配音版', u:'https://www.bilibili.com/video/BV1ib411t7YR/', d:'不用看字幕，适合快速建立直觉' },
  b3b1bcalc:{ t:'bili', n:'3Blue1Brown《微积分的本质》', u:'https://www.bilibili.com/video/BV1qW411N7FU/', d:'W1 多元微积分补强 / Taylor 展开' },
  stat110:  { t:'bili', n:'哈佛 Stat 110 概率论 · Blitzstein（全 35 讲中英字幕）', u:'https://www.bilibili.com/list/ml56376324?', d:'收藏夹合集，p1–p35 对应 Lecture 1–35' },
  mit1803:  { t:'bili', n:'MIT 18.03 微分方程（中英双语字幕）', u:'https://www.bilibili.com/video/BV1eM4y1g7De/', d:'W10–W11 主线' },
  mit1803b: { t:'bili', n:'MIT 18.03 微分方程（熟肉备用）', u:'https://www.bilibili.com/video/BV16Z4y1U7oU/', d:'上一个打不开时用这个' },
  qlibUp:   { t:'bili', n:'Qlib / 因子工程 视频合集（B站 UP 空间）', u:'https://space.bilibili.com/3494379350133362', d:'含「5 分钟搞定 Qlib 部署」「Alpha158 详解」「因子工程」等' },

  /* ── 官方文档 / 教材 ── */
  ocw1806:  { t:'doc', n:'MIT OCW 18.06SC 课程主页（讲义 / 习题 / 答案）', u:'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/', d:'lecture 编号以此版本为准' },
  ocw1803:  { t:'doc', n:'MIT OCW 18.03SC 微分方程（Unit I–III）', u:'https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/', d:'含讲义、习题与视频' },
  stat110site:{ t:'doc', n:'Harvard Stat 110 课程主页（讲义 + 250 道带解答习题）', u:'https://stat110.hsites.harvard.edu/', d:'概率主线官方资料' },
  probbook: { t:'doc', n:'《Introduction to Probability》Blitzstein & Hwang 免费 PDF', u:'https://probabilitybook.net', d:'教材在线版，W6–W9 阅读日' },
  cookbook: { t:'doc', n:'The Matrix Cookbook（矩阵求导速查 PDF）', u:'https://www.math.uwaterloo.ca/~hwolkowi/matrixcookbook.pdf', d:'W5 D3 必备，前 20 式' },
  b3site:   { t:'doc', n:'3Blue1Brown 线性代数专题（交互版讲义）', u:'https://www.3blue1brown.com/topics/linear-algebra', d:'按主题看几何解释' },
  mit18676: { t:'doc', n:'MIT 18.676 随机分析课程页（SDE 讲义 + 教材清单）', u:'https://math.mit.edu/~nsun/s20-18676.html', d:'Le Gall / Karatzas & Shreve' },
  axler:    { t:'doc', n:'Axler《Measure, Integration & Real Analysis》免费 PDF', u:'https://measure.axler.net/', d:'测度论最小集' },

  /* ── 数据与框架 ── */
  akshare:  { t:'doc', n:'AkShare 官方文档（A 股 / 期货 / 宏观数据接口）', u:'https://akshare.akfamily.xyz/', d:'W1 D2 取数主线，免 key' },
  tushare:  { t:'doc', n:'Tushare Pro 数据字典', u:'https://tushare.pro/', d:'财务与指数数据，免费额度有限' },
  qlib:     { t:'tool', n:'microsoft/qlib（GitHub）', u:'https://github.com/microsoft/qlib', d:'W13 因子引擎主线，Alpha158 / PIT / 回测' },
  qlibpit:  { t:'tool', n:'Qlib PIT 源码 qlib/data/pit.py', u:'https://github.com/microsoft/qlib/blob/main/qlib/data/pit.py', d:'W13 D6 精读：时间点数据怎么实现' },
  qlibdata: { t:'tool', n:'Qlib 表达式引擎 qlib/data/', u:'https://github.com/microsoft/qlib/tree/main/qlib/data', d:'Ref / Mean / Std / Corr 算子实现' },
  qlibex:   { t:'tool', n:'Qlib 撮合器 backtest/exchange.py', u:'https://github.com/microsoft/qlib/blob/main/qlib/backtest/exchange.py', d:'W14 D6：成交量约束 DayCumsum' },
  backtrader:{ t:'tool', n:'backtrader 事件循环源码', u:'https://github.com/mementum/backtrader', d:'W14 D6 读抽象，2019 后停更不用于生产' },
  vnpy:     { t:'tool', n:'vn.py 全栈交易平台', u:'https://github.com/vnpy/vnpy', d:'看实盘与工程设计' },
  qmt:      { t:'doc', n:'QMT / miniQMT 官方站', u:'https://www.xuntou.net/', d:'W15 实盘接口，XtQuant 三件套' },
  sklearnpca:{ t:'doc', n:'sklearn.decomposition.PCA 文档', u:'https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.PCA.html', d:'W5 D5 手写 PCA 的对照基准' },
  sklearnlw:{ t:'doc', n:'sklearn.covariance.LedoitWolf 文档', u:'https://scikit-learn.org/stable/modules/generated/sklearn.covariance.LedoitWolf.html', d:'W8 D4 收缩估计对照' },
  cvxpy:    { t:'tool', n:'cvxpy 凸优化', u:'https://www.cvxpy.org/', d:'W7 D5 最小方差组合对照' },
  quantstats:{ t:'tool', n:'quantstats 绩效报告', u:'https://github.com/ranahaani/quantstats', d:'W14 D4 夏普 / 回撤对照' },
  alphalens:{ t:'tool', n:'Alphalens 因子分析', u:'https://github.com/quantopian/alphalens', d:'IC / 分层 / 换手' },
  statsmodels:{ t:'doc', n:'statsmodels cov_hac（Newey-West）文档', u:'https://www.statsmodels.org/stable/generated/statsmodels.stats.sandwich_covariance.cov_hac.html', d:'W8 D5 显著性调整' },
  scipyivp: { t:'doc', n:'scipy.integrate.solve_ivp 文档', u:'https://docs.scipy.org/doc/scipy/reference/generated/scipy.integrate.solve_ivp.html', d:'W10 D5 RK4 对照' },
  networkx: { t:'doc', n:'networkx.pagerank 文档', u:'https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.link_analysis.pagerank_alg.pagerank.html', d:'W9 D3 幂迭代对照' },

  /* ── 论文（确定直链） ── */
  qlibpaper:{ t:'paper', n:'Qlib 论文（arXiv:2009.11189）', u:'https://arxiv.org/abs/2009.11189', d:'AI 量化平台架构，W15 D6 / W13 阅读' },
  amspbo:   { t:'paper', n:'Bailey et al. (2014) 回测过拟合 · Notices of the AMS', u:'https://www.ams.org/journals/notices/201405/rnoti-p458.pdf', d:'W15 D6 必读：PBO 与伪数学' },
  bs1973:   { t:'paper', n:'Black & Scholes (1973) 期权定价（检索直达）', u:'https://www.semanticscholar.org/search?q=The%20Pricing%20of%20Options%20and%20Corporate%20Liabilities%20Black%20Scholes&sort=relevance', d:'W12 D6 原论文' },
  famamac:  { t:'paper', n:'Fama & MacBeth (1973) 截面回归（检索直达）', u:'https://www.semanticscholar.org/search?q=Fama%20MacBeth%201973%20Risk%20Return%20and%20Equilibrium&sort=relevance', d:'W7 D6 阅读日' },
  lw2004:   { t:'paper', n:'Ledoit & Wolf (2004) 协方差收缩（检索直达）', u:'https://www.semanticscholar.org/search?q=Ledoit%20Wolf%202004%20A%20Well%20Conditioned%20Estimator%20for%20Large%20Dimensional%20Covariance%20Matrices&sort=relevance', d:'W4 D6 / W8 D4 主定理' },
  kelly2019:{ t:'paper', n:'Kelly, Pruitt & Su (2019) 特征定价（检索直达）', u:'https://www.semanticscholar.org/search?q=Characteristics%20Are%20Covariances%20Kelly%20Pruitt%20Su&sort=relevance', d:'W5 D6 阅读日' },
  hxz2020:  { t:'paper', n:'Hou, Xue & Zhang (2020) Replicating Anomalies（检索直达）', u:'https://www.semanticscholar.org/search?q=Replicating%20Anomalies%20Hou%20Xue%20Zhang&sort=relevance', d:'W8 D6 多重检验' },
  harvey2016:{ t:'paper', n:'Harvey, Liu & Zhu (2016) 多重检验门槛（检索直达）', u:'https://www.semanticscholar.org/search?q=and%20the%20Cross%20Section%20of%20Expected%20Returns%20Harvey%20Liu%20Zhu&sort=relevance', d:'为什么 t 值门槛要 > 3' },
  lsy2019:  { t:'paper', n:'Liu, Stambaugh & Yuan (2019) Size and Value in China（检索直达）', u:'https://www.semanticscholar.org/search?q=Size%20and%20Value%20in%20China%20Liu%20Stambaugh%20Yuan&sort=relevance', d:'A 股因子基线，小市值壳价值' },
  nw1987:   { t:'paper', n:'Newey & West (1987) HAC 标准误（检索直达）', u:'https://www.semanticscholar.org/search?q=Newey%20West%201987%20A%20Simple%20Positive%20Semi%20Definite%20Heteroskedasticity%20and%20Autocorrelation%20Consistent%20Covariance%20Matrix&sort=relevance', d:'W8 D6 摘要' },
  almgren:  { t:'paper', n:'Almgren & Chriss (2000) 最优执行（检索直达）', u:'https://www.semanticscholar.org/search?q=Optimal%20Execution%20of%20Portfolio%20Transactions%20Almgren%20Chriss&sort=relevance', d:'执行成本模型' },
  avellaned:{ t:'paper', n:'Avellaneda & Stoikov (2008) 做市（检索直达）', u:'https://www.semanticscholar.org/search?q=High%20Frequency%20Trading%20in%20a%20Limit%20Order%20Book%20Avellaneda%20Stoikov&sort=relevance', d:'泊松到达强度 λ(δ)' },
  merton:   { t:'paper', n:'Merton (1973) 连续时间模型（检索直达）', u:'https://www.semanticscholar.org/search?q=Merton%201973%20Theory%20of%20Rational%20Option%20Pricing&sort=relevance', d:'BSM 的另一条路线' },

  /* ── 精选帖子 / 专栏（真实地址） ── */
  postPit:  { t:'post', n:'回测踩坑清单：前视偏差、幸存者偏差与过拟合', u:'https://blog.gitcode.com/897230c62451dbd944cef355568cfb3d.html', d:'W13 三条前视检查的理论清单' },
  postQlib: { t:'post', n:'Qlib 实战：从数据到回测的全链路拆解', u:'https://www.hqwc.cn/a/2025092.html', d:'表达式引擎、PIT、IC 报告一篇讲透' },
  postStrang:{ t:'post', n:'B站专栏｜Strang 18.06 精髓 ② 方程组的几何意义', u:'https://m.bilibili.com/opus/623329393949946169', d:'W2 D1 行视角 / 列视角彩色笔记' },
  post3b1b: { t:'post', n:'3Blue1Brown《线性代数的本质》逐集学习指引', u:'https://blog.csdn.net/qq_25757181/article/details/156298231', d:'各集主题 + 配套 Python 验证代码' },
  postCourses:{ t:'post', n:'B站专栏｜110+ 国内外名校数学公开课整理', u:'https://www.bilibili.com/read/cv16211963', d:'找不到某讲时的备用课程索引' },
  postRules:{ t:'post', n:'A 股交易规则 / 涨跌停 / 复权 讨论（知乎检索）', u:'https://www.zhihu.com/search?type=content&q=A%E8%82%A1%20%E6%B6%A8%E8%B7%8C%E5%81%9C%20%E5%A4%8D%E6%9D%83%20T%2B1', d:'W1 规则体系' }
};

/* 每周主线视频 + 搜索关键词 */
window.WEEK_BASE = {
  1:  { links:['akshare','tushare','b3b1bcalc','postRules'], kw:'A股量化 环境搭建 AkShare' },
  2:  { links:['mit1806','ocw1806','b3b1b','postStrang','post3b1b'], kw:'MIT 18.06 线性代数 消元' },
  3:  { links:['mit1806','ocw1806','b3b1b','famamac'], kw:'线性代数 投影 最小二乘 OLS' },
  4:  { links:['mit1806','ocw1806','b3b1b','lw2004'], kw:'特征值 正定 协方差矩阵' },
  5:  { links:['mit1806','cookbook','b3b1b','sklearnpca','kelly2019'], kw:'SVD PCA 矩阵求导' },
  6:  { links:['stat110','stat110site','probbook'], kw:'Stat 110 条件概率 贝叶斯' },
  7:  { links:['stat110','probbook','famamac','cvxpy'], kw:'Stat 110 期望 协方差 条件期望' },
  8:  { links:['stat110','probbook','sklearnlw','hxz2020','harvey2016','nw1987','statsmodels'], kw:'中心极限定理 协方差收缩 IC t值' },
  9:  { links:['stat110','probbook','axler','mit18676','networkx'], kw:'马尔可夫链 鞅 泊松过程 测度论' },
  10: { links:['mit1803','ocw1803','mit1803b','b3b1bcalc','scipyivp'], kw:'MIT 18.03 微分方程 Euler RK4' },
  11: { links:['mit1803','ocw1803','scipyivp'], kw:'线性系统 矩阵指数 稳定性' },
  12: { links:['mit18676','axler','bs1973','merton','almgren','avellaned'], kw:'伊藤引理 布朗运动 BSM 几何布朗运动' },
  13: { links:['qlib','qlibpit','qlibdata','qlibUp','postPit','postQlib','lsy2019','alphalens'], kw:'Qlib PIT 前视偏差 因子中性化' },
  14: { links:['qlib','qlibex','backtrader','quantstats','vnpy','postPit'], kw:'事件驱动回测 T+1 涨跌停 成本模型' },
  15: { links:['qmt','vnpy','amspbo','qlibpaper','postPit','qlibUp'], kw:'miniQMT XtQuant 风控 回测过拟合' }
};

/* 主题关键词 → 追加资源 */
window.KW_RULES = [
  { re:/高斯消元|LU 分解|echelon|求逆/, ids:['mit1806','ocw1806'] },
  { re:/投影|最小二乘|正规方程|中性化|OLS|回归/, ids:['ocw1806','famamac','alphalens'] },
  { re:/Gram-Schmidt|QR|正交/, ids:['ocw1806'] },
  { re:/特征值|正定|协方差|风险分解/, ids:['lw2004','sklearnlw'] },
  { re:/SVD|PCA|低秩|伪逆/, ids:['cookbook','sklearnpca','b3b1b','kelly2019'] },
  { re:/矩阵微积分|Cookbook|求导/, ids:['cookbook'] },
  { re:/贝叶斯|条件概率|蒙提霍尔|辛普森/, ids:['probbook','stat110site'] },
  { re:/期望|方差|塔性质|条件期望/, ids:['probbook','cvxpy'] },
  { re:/CLT|中心极限|大数定律|不等式|收缩|显著性|Newey|ICIR/, ids:['statsmodels','sklearnlw','harvey2016','nw1987'] },
  { re:/马尔可夫|PageRank|平稳分布/, ids:['networkx','probbook'] },
  { re:/泊松|做市|到达强度/, ids:['avellaned','almgren'] },
  { re:/鞅|测度论|风险中性|布朗运动|二次变差|Itô|GBM|BSM|PDE/, ids:['mit18676','axler','bs1973','merton'] },
  { re:/Euler|RK4|数值解|ODE|阻尼|稳定性/, ids:['scipyivp','ocw1803'] },
  { re:/PIT|前视|复权|成分股|财报/, ids:['qlibpit','postPit','postQlib'] },
  { re:/因子|缓存|表达式|截面/, ids:['qlibdata','alphalens','qlibUp'] },
  { re:/撮合|T\+1|涨跌停|整手|停牌|订单/, ids:['qlibex','backtrader'] },
  { re:/成本|印花税|佣金|滑点|绩效|夏普|回撤/, ids:['quantstats','postRules'] },
  { re:/QMT|XtQuant|实盘|风控|告警/, ids:['qmt','vnpy'] },
  { re:/过拟合|README|PBO|期末/, ids:['amspbo','qlibpaper','harvey2016'] },
  { re:/A 股规则|交易日历|ST|退市|数据层|AkShare|Tushare/, ids:['akshare','tushare','postRules'] }
];

/* lecture 编号 → B站分P（MIT 18.06 合集 BV1zx411g7gq 共 35 讲） */
function lectureLinks(topic, week){
  var out = [];
  var nums = [], m, re = /L(\d+)/g;
  while ((m = re.exec(topic)) !== null) nums.push(parseInt(m[1],10));
  if (!nums.length) return out;
  var uniq = nums.filter(function(v,i,a){ return a.indexOf(v)===i; }).slice(0,2);
  uniq.forEach(function(n){
    if (week >= 2 && week <= 5) {
      var p = Math.min(Math.max(n,1),35);
      out.push({ t:'bili', n:'MIT 18.06 第 '+p+' 讲 · 直达（对应主题 L'+n+'）',
        u:'https://www.bilibili.com/video/BV1zx411g7gq/?p='+p,
        d:'Strang 中英字幕合集分 P 直达；若讲次与主题略有偏移，按标题找相邻 1–2 讲' });
      out.push({ t:'doc', n:'MIT OCW 18.06SC · Lecture '+n+' 讲义与习题',
        u:'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/lecture-videos/',
        d:'官方讲义/习题索引' });
    } else if (week >= 6 && week <= 9) {
      out.push({ t:'bili', n:'Stat 110 · Lecture '+n+' 视频（合集分 P）',
        u:'https://www.bilibili.com/list/ml56376324?', d:'收藏夹内 p'+n+' 即 Lecture '+n });
      out.push({ t:'search', n:'Stat 110 Lecture '+n+' · B站精准检索',
        u:'https://search.bilibili.com/all?keyword='+encodeURIComponent('Stat 110 Lecture '+n+' Blitzstein'),
        d:'合集失效时按讲次直接找单集' });
    }
  });
  return out;
}

/* 每天装配资源（week 1-15, day 1-7, plan=[t,o,c]） */
window.buildDayLinks = function(w, d, plan){
  var base = window.WEEK_BASE[w] || { links:[], kw:'' };
  var topic = (plan[0]||'').replace(/<[^>]+>/g,'');
  var text = topic + ' ' + (plan[1]||'').replace(/<[^>]+>/g,'');
  var list = [], seen = {};

  function push(x){ if (!x || !x.u || seen[x.u]) return; seen[x.u]=1; list.push(x); }
  function addId(id){ var r = window.RES[id]; if(r) push({ t:r.t, n:r.n, u:r.u, d:r.d }); }

  /* 1. 精确 lecture 分 P 置顶 */
  lectureLinks(plan[0]||'', w).forEach(push);

  /* 2. 本周主线资源 */
  base.links.slice(0, d===7 ? 5 : 5).forEach(addId);

  /* 3. 主题关键词追加（最多 3 条，避免刷屏） */
  var extra = 0;
  for (var i=0;i<window.KW_RULES.length && extra<3;i++){
    if (window.KW_RULES[i].re.test(text)) {
      window.KW_RULES[i].ids.forEach(function(id){
        if (extra<3){ var r=window.RES[id]; if(r && !seen[r.u]){ push({t:r.t,n:r.n,u:r.u,d:r.d}); extra++; } }
      });
    }
  }

  /* 4. 阅读日 / 编程日补论文与工具检索 */
  if (/阅读|文献|论文|源码/.test(topic)) {
    push({ t:'paper', n:'本周主题 · 论文检索直达（Semantic Scholar）', u:scholar(base.kw + ' paper'), d:'按主题找原始文献与 PDF' });
  }

  /* 5. 三条 100% 可用的检索兜底 */
  var shortKw = topic.replace(/L\d+/g,'').replace(/^[^\u4e00-\u9fa5A-Za-z0-9]+/,'').slice(0,16) || base.kw;
  push({ t:'search', n:'B站 · 当天主题视频检索', u:biliSearch(base.kw + ' ' + shortKw), d:'找不到对应讲次时，按当天主题找讲解视频' });
  push({ t:'search', n:'知乎 / 专栏 · 当天主题讨论', u:zhihu(shortKw + ' 量化'), d:'看别人的踩坑与解释，对应「帖子」类资料' });
  push({ t:'search', n:'全网 · 当天主题资料检索', u:web(shortKw + ' 教程 论文 pdf'), d:'PDF / 博客 / 讲义兜底' });

  return list;
};

/* 资源库分组（「全部资料」页用） */
window.RES_GROUPS = [
  { name:'B 站主线课程', ids:['mit1806','mit1806b','b3b1b','b3b1bcn','b3b1bcalc','stat110','mit1803','mit1803b','qlibUp'] },
  { name:'官方文档与教材', ids:['ocw1806','ocw1803','stat110site','probbook','cookbook','b3site','mit18676','axler','akshare','tushare','qmt','sklearnpca','sklearnlw','statsmodels','scipyivp','networkx'] },
  { name:'论文', ids:['qlibpaper','amspbo','bs1973','famamac','lw2004','kelly2019','hxz2020','harvey2016','lsy2019','nw1987','almgren','avellaned','merton'] },
  { name:'代码库与工具', ids:['qlib','qlibpit','qlibdata','qlibex','backtrader','vnpy','cvxpy','quantstats','alphalens'] },
  { name:'精选帖子 / 专栏', ids:['postPit','postQlib','postStrang','post3b1b','postCourses','postRules'] }
];
