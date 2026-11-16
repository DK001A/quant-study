/* ============================================================
   新手逐步拆解 · Day 1 手把手教程 + Week 1 每日操作指引
   - 逐日卡片中按「可勾选步骤」渲染，进度存 localStorage
   - 「新手起步」页提供完整通读版（含模板 / 摸底自测 / FAQ）
   - 所有大段文本用 String.raw，Windows 反斜杠无需转义
   ============================================================ */
(function(){
'use strict';

function bs(k){ return 'https://search.bilibili.com/all?keyword=' + encodeURIComponent(k); }
function zh(k){ return 'https://www.zhihu.com/search?type=content&q=' + encodeURIComponent(k); }
function bw(k){ return 'https://www.bing.com/search?q=' + encodeURIComponent(k); }

/* ---------- Day 1 专用资料库 ---------- */
window.BEGINNER_RES = {
  /* B 站视频 */
  biliGitQuick: { t:'bili', n:'B站 · Git 一节课入门（约 18 分钟，先看这个）', u:'https://www.bilibili.com/video/BV1s3411g7PS/', d:'最短路径搞懂仓库 / 暂存区 / commit，Day 1 首选' },
  biliGitKs:    { t:'bili', n:'B站 · 狂神说《Git 最新教程通俗易懂》', u:'https://www.bilibili.com/video/BV1FE411P7B3/?p=4', d:'P4 起是 Git 基础与实战，讲得慢、适合零基础' },
  biliGitSgg:   { t:'bili', n:'B站 · 尚硅谷 Git 全套教程（5h，当字典查）', u:'https://www.bilibili.com/video/BV1vy4y1s7k6/', d:'不用看完，卡在哪一步就跳哪一集' },
  biliGitVs:    { t:'bili', n:'B站 · VS Code + Git 协同工作流', u:'https://www.bilibili.com/video/BV1w14y1C7oi/', d:'不想敲命令时，用图形界面做 add / commit / push' },
  biliVenv:     { t:'bili', n:'B站 · Python venv 虚拟环境讲解', u:'https://www.bilibili.com/video/BV1V7411n7CM/', d:'搞懂「为什么每个项目要一个独立环境」' },
  biliVenvWin:  { t:'bili', n:'B站 · Windows 下 Python 环境搭建实操', u:'https://www.bilibili.com/video/BV1Gg411574z/', d:'含 Windows 特有的 py / PATH 问题' },
  biliVscode:   { t:'bili', n:'B站 · VS Code 安装（Windows）', u:'https://www.bilibili.com/video/BV1U94y1b7m6/', d:'编辑器安装与基本设置' },
  biliJupyter:  { t:'bili', n:'B站 · Anaconda / Jupyter 安装到启动演示', u:'https://www.bilibili.com/video/BV1y6XGYUEP7/', d:'看「浏览器自动打开、别关命令行窗口」这段即可' },

  /* 官方文档 / 教材 */
  progitFirst:  { t:'doc', n:'Pro Git 中文版 §1.6 初次运行 Git 前的配置', u:'https://git-scm.com/book/zh/v2/%e8%b5%b7%e6%ad%a5-%e5%88%9d%e6%ac%a1%e8%bf%90%e8%a1%8c-Git-%e5%89%8d%e7%9a%84%e9%85%8d%e7%bd%ae', d:'git config 的权威说明' },
  progitRepo:   { t:'doc', n:'Pro Git 中文版 §2.1 获取 Git 仓库', u:'https://git-scm.com/book/zh/v2/Git-%e5%9f%ba%e7%a1%80-%e8%8e%b7%e5%8f%96-Git-%e4%bb%93%e5%ba%93', d:'git init 到底做了什么' },
  progitRecord: { t:'doc', n:'Pro Git 中文版 §2.2 记录每次更新到仓库', u:'https://git-scm.com/book/zh/v2/Git-%e5%9f%ba%e7%a1%80-%e8%ae%b0%e5%bd%95%e6%af%8f%e6%ac%a1%e6%9b%b4%e6%96%b0%e5%88%b0%e4%bb%93%e5%ba%93', d:'工作区 / 暂存区 / 已提交 三态图解' },
  progitRemote: { t:'doc', n:'Pro Git 中文版 §2.5 远程仓库的使用', u:'https://git-scm.com/book/zh/v2/Git-%e5%9f%ba%e7%a1%80-%e8%bf%9c%e7%a8%8b%e4%bb%93%e5%ba%93%e7%9a%84%e4%bd%bf%e7%94%a8', d:'remote add / push / fetch 的区别' },
  gitDownload:  { t:'doc', n:'Git 官方下载页（Windows 安装包）', u:'https://git-scm.com/downloads', d:'装完会多出 Git Bash' },
  gitRefCn:     { t:'doc', n:'猴子都能懂的 Git 入门 · 命令参考', u:'https://backlog.com/git-tutorial/cn/reference/', d:'中文命令速查，忘了就查' },
  gitBranchGame:{ t:'tool', n:'Learn Git Branching（中文互动小游戏）', u:'https://learngitbranching.js.org/?locale=zh_CN', d:'用闯关理解 commit / branch，零基础强烈推荐' },
  lxfGit:       { t:'post', n:'廖雪峰 Git 教程（中文，最常被推荐）', u:'https://www.liaoxuefeng.com/wiki/896043488029600/', d:'从安装到远程仓库，逐节跟做即可' },
  pyVenv:       { t:'doc', n:'Python 官方文档 · venv 虚拟环境（中文）', u:'https://docs.python.org/zh-cn/3/library/venv.html', d:'官方说明创建 / 激活 / 原理' },
  pyDownload:   { t:'doc', n:'Python 官方下载（Windows）', u:'https://www.python.org/downloads/windows/', d:'安装时务必勾选 Add python.exe to PATH' },
  pipStart:     { t:'doc', n:'pip 官方入门 · 安装包与管理依赖', u:'https://pip.pypa.io/en/stable/getting-started/', d:'pip install / freeze 的权威说明' },
  tunaPypi:     { t:'doc', n:'清华 PyPI 镜像使用说明（国内加速）', u:'https://mirrors.tuna.tsinghua.edu.cn/help/pypi/', d:'pip 下载慢或超时时用 -i 换源' },
  jupyterInst:  { t:'doc', n:'Jupyter 官方安装页', u:'https://jupyter.org/install', d:'JupyterLab / Notebook 官方装法' },
  jupyterLab:   { t:'doc', n:'JupyterLab 官方安装文档', u:'https://jupyterlab.readthedocs.io/en/stable/getting_started/installation.html', d:'含 ipykernel 内核说明' },
  ipykernel:    { t:'doc', n:'IPython 官方 · 安装内核 kernelspec', u:'https://ipython.readthedocs.io/en/stable/install/kernel_install.html', d:'解释为什么 Jupyter 里选错内核会找不到包' },
  githubDocs:   { t:'doc', n:'GitHub 官方文档（中文）· 开始使用', u:'https://docs.github.com/zh/get-started', d:'创建仓库、HTTPS 认证的官方步骤' },
  githubPat:    { t:'doc', n:'GitHub 官方文档 · 个人访问令牌 PAT', u:'https://docs.github.com/zh/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens', d:'2021 年后 push 不能用账号密码，必须用 PAT 或 SSH' },
  gitignorePy:  { t:'tool', n:'GitHub 官方 Python.gitignore 模板', u:'https://github.com/github/gitignore/blob/main/Python.gitignore', d:'抄官方模板，别自己瞎写' },
  gitee:        { t:'doc', n:'Gitee 码云（GitHub 连不上时的国内备选）', u:'https://gitee.com/', d:'操作命令完全一样，只换 remote 地址' },
  vscode:       { t:'doc', n:'VS Code 官方下载', u:'https://code.visualstudio.com/', d:'写 Python / Markdown 的编辑器，可选' },

  /* 帖子 / 专栏 */
  postJupyter:  { t:'post', n:'B站专栏 · Jupyter Notebook 快速上手（图文）', u:'https://www.bilibili.com/read/cv21492692', d:'含启动、改默认目录、内核切换' },
  postJupyter2: { t:'post', n:'B站专栏 · Jupyter 安装、启动与自动补全', u:'https://m.bilibili.com/opus/676004839972405304', d:'比视频更快查命令' },
  postVenv:     { t:'post', n:'图文 · venv 虚拟环境使用教程（Windows / macOS 对照）', u:'https://blog.csdn.net/polarisrisingwar/article/details/139121596', d:'各系统激活命令对照表' },
  postGitNote:  { t:'post', n:'图文 · Git 精简笔记（含下载 / 视频 / 命令清单）', u:'https://blog.csdn.net/m0_64676711/article/details/136064229', d:'一份能当 checklist 用的中文笔记' },

  /* 检索兜底：视频失效时用这些 */
  searchGit:    { t:'search', n:'B站 · 检索「Git 入门 首次 push」', u:bs('Git 入门 教程 首次 push GitHub'), d:'上面的视频若失效，按最新热度挑一个' },
  searchVenv:   { t:'search', n:'B站 · 检索「Python venv 虚拟环境 激活」', u:bs('Python venv 虚拟环境 创建 激活 Windows'), d:'找不到对应版本时看最新教程' },
  searchJupyter:{ t:'search', n:'B站 · 检索「JupyterLab 安装 内核」', u:bs('JupyterLab 安装 ipykernel 内核 教程'), d:'内核相关问题的视频兜底' },
  searchErrGit: { t:'search', n:'知乎 · 检索「git push 报错」', u:zh('git push 报错 解决'), d:'把完整报错粘进搜索框最快' },
  searchErrAll: { t:'search', n:'全网 · 粘贴报错原文检索', u:bw('git python venv jupyter 常见报错 解决'), d:'报错类问题的通用查法' }
};

/* 把 Day 1 资料并入「全部资料」页 */
if (window.RES && window.RES_GROUPS){
  Object.keys(window.BEGINNER_RES).forEach(function(k){ window.RES['bg_'+k] = window.BEGINNER_RES[k]; });
  window.RES_GROUPS.unshift({
    name:'新手起步 · Day 1 专用（视频 / 官方文档 / 帖子）',
    ids: Object.keys(window.BEGINNER_RES).map(function(k){ return 'bg_'+k; })
  });
}

/* ---------- 可直接复制的文件模板 ---------- */
function T(id, name, file, desc, text){ return { id:id, name:name, file:file, desc:desc, text:text }; }
window.GUIDE_TEMPLATES = [
 T('gitignore','.gitignore','.gitignore','决定哪些文件不进仓库；Day 1 最容易漏的一步', String.raw`# ---- Python ----
.venv/
venv/
env/
__pycache__/
*.py[cod]
*.egg-info/
.pytest_cache/
.mypy_cache/

# ---- Jupyter ----
.ipynb_checkpoints/

# ---- 数据与密钥：原始数据体积大、且不该外传 ----
data/raw/
data/cache/
*.parquet
*.feather
*.pkl
*.h5
*.csv
.env
*.key
*.token
*.log

# ---- 编辑器 / 系统 ----
.DS_Store
.idea/
*.swp

# 注意：notes/ 与 docs/ 要提交，它们是学习资产
# 注意：空目录靠 .gitkeep 占位，不要忽略 .gitkeep
!**/.gitkeep`),

 T('errors','错题本模板','notes/errors.md','卡住 25 分钟就记；周日统一处理；连续两次重做答对才闭环', String.raw`# 错题本 · Errors & Pitfalls

> 使用规则
> 1. 只记四件事：错在哪 / 正确结论 / 正确思路 / 最小复现。
> 2. 卡住超过 25 分钟立刻记一条，不要死磕，继续往下走。
> 3. 第二天晨检默写错题；连续两次答对才把状态改成「已闭环」。
> 4. 挂起超过两周直接标「放弃」，不要让它一直占着注意力。
> 5. 网页「错题本」页是自动汇总版；这里记需要写代码复现的坑。

## 一条记录的标准格式（复制这一段）

### E001 | YYYY-MM-DD | 知识点 / 文件:行号
- 现象与报错原文：
- 我当时以为：
- 真正原因：
- 正确结论：
- 正确思路（下次遇到该怎么想）：
- 最小复现 / 验证命令：
- 关联：Day __ / 周测 __ / 文件 path:line
- 状态：待订正
- 重做记录：第 1 次 [日期] 结果 / 第 2 次 [日期] 结果

## 索引表

| 编号 | 类别 | 知识点 | 状态 | 订正日期 |
|---|---|---|---|---|
| E001 | 概念 / 代码 / 数据 / 未来函数 / A股规则 |  | 待订正 |  |

## 量化专属高频坑位（对照自查）

- 前视偏差：用了 t 时刻拿不到的数据（财报 PIT、成分股、前复权价）
- 幸存者偏差：股票池只含今天还活着的票
- 口径错配：复权 / 不复权、总价 / 收盘价、交易日 / 自然日
- 对齐错误：shift 方向写反、按行 merge 未对齐日期
- 规则漏建：停牌、涨跌停、ST、T+1、整手、退市
- 工程质量：随机种子未固定、时间戳时区、缓存没失效、浮点比较用 ==

## 疑问清单（周日统一处理）

| 编号 | 疑问 | 记录日 | 状态 | 结论 |
|---|---|---|---|---|
| Q001 |  |  | 待解决 / 已解决 / 挂起 / 放弃 |  |`),

 T('mastery','掌握度台账模板','notes/mastery.md','每个知识点标 L 级；期末要求全部 ≥ L2，阶段出口 = L3', String.raw`# 掌握度台账 · Mastery Ledger

> 四级判定看「合上资料能不能做出来」，不看「看懂没」
> L0 没听过 / L1 看得懂但写不出 / L2 能独立做对常规题 / L3 会用且说得出失效边界
> 期末要求：所有知识点 ≥ L2；阶段出口涉及的知识点必须 L3。

## 台账（每天收工前 2 分钟填一行）

| 日期 | Day | 知识点 | L 级 | 验收动作 | 证据（文件 / commit / 题号） | 下次复习 |
|---|---|---|---|---|---|---|
| YYYY-MM-DD | D1 | Git 三态与首次 push | L2 | 默写命令链 + push 成功 | git log --oneline | +1 天 |

## 复习节奏

- 当天：做完 3 题 + 标 L 级
- +1 天：晨检默写昨天的错题
- +7 天：周测覆盖本周知识点
- +30 天：阶段出口逐条复核

## 本周 L0 / L1 清单（下周 D1–D2 用来补强，不学新内容）

| 知识点 | 当前级别 | 卡在哪 | 补强动作 | 目标 |
|---|---|---|---|---|
|  | L1 |  |  | L2 |

## 阶段出口对照

| 出口 | 要求 | 状态 |
|---|---|---|
| A 环境与数据层 | 能拿到干净可信的 A 股数据 | 未达 |
| B 线性代数 | 矩阵语言成为母语 | 未达 |
| C 概率论 | 能算、能估、能判 | 未达 |
| D 微分方程与 SDE | 能建模连续时间、能推 BSM | 未达 |
| E 三大工程产物 | 产出能被逐行追问的仓库 | 未达 |`),

 T('readme','README 模板','README.md','仓库的门面，也让三个月后的自己知道每个目录放什么', String.raw`# A股量化开发 · 15 周 105 天

按照 v4.0 逐日验收计划推进。每天：05 分钟闪卡 → 23 分钟主线 →
20 分钟动手 → 10 分钟真实 A 股数据验证 → 02 分钟验收三问。

## 快速开始

python -m venv .venv
# Windows PowerShell: .\.venv\Scripts\Activate.ps1
# macOS / Linux:      source .venv/bin/activate
pip install -r requirements.txt
python -m ipykernel install --user --name quant --display-name "Python (quant)"
jupyter lab

## 目录约定

| 目录 | 放什么 |
|---|---|
| data/      | 原始行情与清洗后的数据（原始数据不进 Git） |
| factors/   | 因子定义、因子计算与 IC / 分层检验 |
| backtest/  | 事件驱动回测引擎、撮合、成本与绩效 |
| live/      | 实盘 / 模拟盘对接、下单与风控 |
| research/  | 实验性 notebook、草稿、可复现小实验 |
| docs/      | 规则 checklist、数据质量报告、设计文档 |
| notes/     | errors.md 错题本、mastery.md 掌握度台账 |

## 铁律

1. 回测只用 t 时刻可得的数据；财报用 PIT，成分股用历史快照。
2. 前复权价含未来信息，不能直接拿来算历史收益。
3. 每周日 commit / push 一次；commit 记录就是「哪版代码产出哪条净值曲线」的凭证。
4. 任何未解释的数据异常都要写进 data_quality_report.md，不放过。`),

 T('requirements','依赖清单','requirements.txt',' Day 1 先只装最小集合，后面按周往里加并固定版本', String.raw`# Day 1 最小环境（装完执行 pip freeze > requirements.txt 覆盖为精确版本）
jupyterlab
ipykernel
numpy
pandas
matplotlib
# W1 D2 起再加：akshare、tushare、pytest、scipy、sympy
`)
];

/* ---------- 20 分钟数学摸底自测 ---------- */
window.MATH_CHECK = [
 { q:'解 2x + 3 = 11；再解方程组 x + y = 5、2x − y = 1。', a:'x = 4；第二组 x = 2、y = 3。', need:'W2 高斯消元', fix:'不会解方程组 → W2 前先看 3Blue1Brown 第 1 集' },
 { q:'写出 f(x) = x² 在 x = 3 处的导数，并说出它的几何含义。', a:'f′(x)=2x，f′(3)=6；是曲线在该点切线斜率 / 瞬时变化率。', need:'W1 D5 梯度', fix:'不知道导数 → 先看《微积分的本质》第 1–2 集' },
 { q:'f(x,y)=x²y，求 ∂f/∂x 与 ∂f/∂y。', a:'∂f/∂x = 2xy；∂f/∂y = x²。', need:'W1 D5 偏导 / 雅可比', fix:'偏导就是把其它变量当常数，练 3 例即可' },
 { q:'向量 a=(1,2)、b=(3,−1)，求点积 a·b 与 |a|。', a:'a·b = 1×3 + 2×(−1) = 1；|a| = √5。', need:'W3 投影 / 正交', fix:'点积是后面所有投影、OLS、协方差的地基' },
 { q:'求二阶行列式 | 2 1 ; 3 4 |，并说明它等于 0 意味着什么。', a:'2×4 − 1×3 = 5；为 0 则矩阵不可逆、方程组无唯一解。', need:'W2 逆矩阵 / W4 特征值', fix:'行列式 = 面积缩放因子，配合 3Blue1Brown 第 5 集' },
 { q:'抛两枚公平硬币，已知至少一枚是正面，求两枚都是正面的概率。', a:'样本空间 {HH, HT, TH}，P = 1/3。', need:'W6 条件概率', fix:'这是条件概率最经典的坑，Stat 110 L4 会重讲' },
 { q:'X 等概率取 1、2、3，求 E[X] 与 Var(X)。', a:'E[X] = 2；E[X²] = 14/3；Var = 14/3 − 4 = 2/3。', need:'W7 期望 / 协方差', fix:'Var = E[X²] − (E[X])²，量化里天天用' },
 { q:'X ~ B(10, 0.5)，写出 E[X] 与 Var(X)。', a:'E = np = 5；Var = np(1−p) = 2.5。', need:'W6 二项 / W9 泊松', fix:'后面会用二项模型讨论「20 日内涨停天数」的失效' },
 { q:'写出 e^x 在 0 点的二阶 Taylor 展开，并说明余项阶。', a:'1 + x + x²/2 + O(x³)。', need:'W1 D6 Taylor / W12 Itô', fix:'Itô 引理本质就是保留到二阶项的 Taylor' },
 { q:'写出欧拉公式，并计算 e^(iπ) + 1。', a:'e^(iθ) = cosθ + i·sinθ；e^(iπ) + 1 = 0。', need:'W1 D6 复数 / W12 特征函数', fix:'特征函数与傅里叶方法会用到' },
 { q:'解微分方程 y′ = 2y，y(0)=1。', a:'y = e^(2x)。', need:'W10 ODE / W12 GBM', fix:'GBM 就是这个方程加上布朗运动噪声' },
 { q:'计算 ∫₀¹ x² dx，并说出它和「期望」的相似之处。', a:'1/3；都是对函数按权重求和/积分，只是离散 vs 连续。', need:'W9 测度论最小集', fix:'积分是连续版的加权平均，后面 E[X] 会写成积分' }
];

/* ---------- 命令行扫盲 / 常见报错 ---------- */
window.CLI_FAQ = [
 { q:'「终端 / 命令行」到底是什么？我从来没用过。', a:'就是一个用打字代替鼠标点图标的窗口。Windows 按 Win+X 选「终端 / PowerShell」；或在项目文件夹地址栏输入 powershell 回车，会直接开在这个目录。macOS 用 Spotlight 搜「终端」。本页所有命令都是一行一行粘贴、回车执行。' },
 { q:'命令前面的 $ 或 > 要打出来吗？', a:'不用。那是教程里表示「提示符」的符号，只复制它后面的内容。以 # 开头的是注释，也不用打。' },
 { q:'cd 切换目录 / 跨盘符怎么搞？', a:'Windows PowerShell 里先输入 D: 回车换盘，再 cd D:\WorkBuddy\quant-study；或者一步到位 cd /d D:\WorkBuddy\quant-study（cmd）。用 pwd（PowerShell 是 Get-Location）看当前在哪，用 dir / ls 看当前有什么。' },
 { q:'提示「python 不是内部或外部命令」？', a:'安装 Python 时没勾 Add python.exe to PATH。重装一次并勾选；或在 Windows 上用 py -0p 列出所有已装版本、用 py -3.12 -m venv .venv 指定版本。本计划写 Python 3.10，你机器上是 3.12 也完全能用，不必纠结版本。' },
 { q:'PowerShell 报「无法加载 Activate.ps1，因为在此系统上禁止运行脚本」？', a:'执行策略限制。只在当前窗口临时放开：Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass，回车后再激活。它不影响系统全局设置，关掉窗口就失效。也可以改用 .venv\Scripts\activate.bat（cmd）或 Git Bash 的 source .venv/Scripts/activate。' },
 { q:'怎么确认 pip 装进了虚拟环境而不是系统 Python？', a:'激活后运行 pip -V 和 python -c "import sys; print(sys.executable)"，路径里必须含 .venv。若不含，说明没激活成功，重新激活后再装。' },
 { q:'Jupyter 里 import pandas 报 No module named？', a:'多半是内核选错了。在 .venv 里执行 python -m ipykernel install --user --name quant --display-name "Python (quant)"，然后在 Jupyter 右上角把 Kernel 切成 Python (quant)。新建 notebook 时也要选这个内核。' },
 { q:'git commit 报 Author identity unknown？', a:'还没配身份。执行 git config --global user.name "你的名字" 和 git config --global user.email "你的邮箱"，邮箱建议与 GitHub 账号一致。' },
 { q:'git push 报 Authentication failed / 要密码？', a:'GitHub 2021 年起不接受账号密码，要用个人访问令牌 PAT（Settings → Developer settings → Personal access tokens）或 SSH key；文档见「GitHub PAT」链接。国内网络不稳时改用 Gitee，命令一模一样，只换 remote 地址。' },
 { q:'push 报 src refspec main does not match any？', a:'通常有两种：一次 commit 都没有，或本地分支叫 master。先 git status 看有无提交，再 git branch -M main 改名，然后重新 push -u origin main。' },
 { q:'空目录 push 上去后 GitHub 里看不到？', a:'Git 不跟踪空文件夹。在每个空目录放一个空的 .gitkeep 文件即可，这也是骨架步骤里要做的事。' },
 { q:'PowerShell 里 pip freeze > requirements.txt 生成的文件 pip 读不了？', a:'Windows PowerShell 5.1 的 > 默认写 UTF-16。改用 pip freeze | Out-File -Encoding utf8 requirements.txt，或用 Git Bash / cmd 执行重定向。' },
 { q:'pip 下载慢 / 超时？', a:'换国内镜像：pip install -i https://pypi.tuna.tsinghua.edu.cn/simple jupyterlab ipykernel。说明见「清华 PyPI 镜像」链接。' },
 { q:'不小心把 .venv 或数据文件 commit 进去了？', a:'先补进 .gitignore，再执行 git rm -r --cached .venv 从索引移除（不删本地文件），然后 git commit -m "chore: ignore venv"。' },
 { q:'卡住超过 25 分钟怎么办？', a:'按计划规则：在 notes/errors.md 记一条，写清报错原文与已试过的方法，然后继续下一步，周日统一处理。Day 1 的目标是把链路跑通，不是把每个原理都吃透。' }
];

/* ---------- 资料引用小工具（供步骤内使用） ---------- */
window.guideRes = function(ids){
  return (ids||[]).map(function(id){
    var r = window.BEGINNER_RES[id] || window.RES[id];
    return r || null;
  }).filter(Boolean);
};

/* ---------- Day 1 完整逐步拆解 ---------- */
var DAY1_STEPS = [
 { id:'g0', t:'先看地图：今天到底要交出什么', min:3,
   why:'原表只写了「Git、虚拟环境、Jupyter 初始化仓库与目录骨架」，一句话压了 5 件事。先把它们拆成能验收的实物，才知道自己在干什么。',
   body:String.raw`<p>把今天想成「开一家小店」：<b>仓库</b>是带时光机的账本，<b>虚拟环境</b>是只给这家店用的工具箱，<b>Jupyter</b>是可以边写边算的草稿本，<b>目录骨架</b>是货架，<b>两个笔记模板</b>是错题本和进度表。</p>
   <table class="g-table"><tr><th>要交出的东西</th><th>怎么算做出来了</th><th>对应验收</th></tr>
   <tr><td>① 本地 Git 仓库</td><td><code>git log --oneline</code> 至少 1 条 commit</td><td>仓库首次 commit 成功</td></tr>
   <tr><td>② 隔离的 .venv + 能跑的 Jupyter</td><td>notebook 里 <code>sys.executable</code> 指向 .venv</td><td>内核绑定成功</td></tr>
   <tr><td>③ 7 个目录骨架 + notes/</td><td>每个目录里有 .gitkeep，GitHub 上能看见</td><td>目录齐全</td></tr>
   <tr><td>④ 两个笔记模板 + README / .gitignore</td><td>notes/errors.md、notes/mastery.md 有内容</td><td>可直接开始记录</td></tr>
   <tr><td>⑤ 远程仓库</td><td>网页上能看到全部文件</td><td><b>push 成功</b></td></tr></table>
   <p class="g-tip"><b>时间预期：</b>计划写「每天 60 分钟」，那是熟练者节奏。第一次做按 <b>90–120 分钟</b> 算，拆成两天也完全正常，别为了赶进度跳过验收。</p>`,
   cmds:[], out:'能用自己的话把这 5 样东西说一遍，再往下走。', errs:[], res:[], check:'我清楚今天要交出 5 样东西，而不是「装一堆软件」' },

 { id:'g1', t:'装好三件工具，学会打开命令行', min:12,
   why:'后面所有步骤都在命令行里完成。先确认工具在、会打开终端、会看版本号，能排掉一半的坑。',
   body:String.raw`<p>需要：<b>Python 3.10+</b>（官方安装包，勾选 Add to PATH）、<b>Git for Windows</b>（装完会有 Git Bash）、可选 <b>VS Code</b>。Jupyter 不用单独装软件，等第 6 步用 pip 装进虚拟环境。</p>
   <p>打开终端：Windows 按 <code>Win+X</code> → 「终端 / Windows PowerShell」；更快的办法是<b>在项目文件夹的地址栏输入 <code>powershell</code> 回车</b>，终端会直接落在该目录。</p>
   <p>三条命令验证安装，看到版本号就是成功；任何一条报「不是内部或外部命令」，去下面 FAQ 找对应条目。</p>`,
   cmds:[
     { os:'Windows · PowerShell（通用）', code:String.raw`python --version
py -0p
git --version` },
     { os:'macOS / Linux', code:String.raw`python3 --version
git --version
which python3` }
   ],
   out:'看到类似 Python 3.12.5、git version 2.4x 的输出。<code>py -0p</code> 会列出机器上的所有 Python 版本和路径。',
   errs:[
     { q:'python 不是内部或外部命令', a:'重装 Python 并勾选 Add python.exe to PATH；或直接用 py -3.12 代替 python。' },
     { q:'py 不是命令，但 python 能用', a:'没关系，跳过 py -0p，后面所有 python 保持原样即可。' }
   ],
   res:['pyDownload','gitDownload','vscode','biliVscode','gitRefCn'],
   check:'三条版本命令都能跑出结果，且我会在项目目录打开终端' },

 { id:'g2', t:'建项目文件夹 + git init', min:5,
   why:'git init 就是给这个文件夹装上一台「时光机」：之后每一次 commit 都是一个可回退的快照。量化里「哪版代码跑出哪条净值曲线」全靠它。',
   body:String.raw`<p>建议路径全程<b>不要有中文和空格</b>，避免某些 Python 包在路径解析上翻车。本例用 <code>D:\WorkBuddy\quant-study</code>（你已经在 D 盘有工作区，正好沿用）。</p>
   <p><code>git init -b main</code> 里的 <code>-b main</code> 是把默认分支直接叫 main（GitHub 现在默认也是 main）。若你的 Git 较老不认这个参数，就先 <code>git init</code>，后面用 <code>git branch -M main</code> 改名。</p>`,
   cmds:[
     { os:'Windows · PowerShell', code:String.raw`New-Item -ItemType Directory -Force -Path D:\WorkBuddy\quant-study | Out-Null
cd D:\WorkBuddy\quant-study
git init -b main
git status -sb` },
     { os:'Git Bash / macOS / Linux', code:String.raw`mkdir -p ~/quant-study
cd ~/quant-study
git init -b main
git status -sb` }
   ],
   out:'出现 <code>Initialized empty Git repository in .../quant-study/.git/</code>，以及 <code>## No commits yet on main</code>。文件夹里多出一个隐藏的 <code>.git</code> 目录——别删它，整个时光机都在里面。',
   errs:[
     { q:'git init 后看不到 .git 文件夹', a:'它是隐藏项。PowerShell 用 Get-ChildItem -Force 查看，或开启「显示隐藏的项目」。' },
     { q:'unknown option: -b', a:'Git 版本太老，改用 git init，之后执行 git branch -M main。' }
   ],
   res:['progitRepo','biliGitQuick','lxfGit'],
   check:'git status -sb 显示当前在 main 分支，且尚无 commit' },

 { id:'g3', t:'配置身份 + 认识「三态」+ 第一次 commit', min:10,
   why:'新手最困惑的是「为什么 add 了还要 commit」。记住三态：工作区（你在改的文件）→ 暂存区（git add 挑选这次要拍的照）→ 仓库（git commit 真正拍下快照）。',
   body:String.raw`<p>第一次用 Git 必须先告诉它你是谁，否则 commit 会被拒绝。邮箱建议和 GitHub 账号一致，这样 commit 才会被算进贡献图。</p>
   <p>下面这组命令会：配身份 → 建一个 README → <b>看 status</b> → add 进暂存区 → <b>再看 status</b> → commit → 看日志。请务必在 add 前后各看一次 <code>git status</code>，这是理解三态最快的方法。</p>`,
   cmds:[
     { os:'通用（Git Bash / PowerShell 均可）', code:String.raw`git config --global user.name "你的名字"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main

echo "# A股量化 105 天" > README.md
git status
git add README.md
git status
git commit -m "chore: init repo"
git log --oneline` }
   ],
   out:'<code>git log --oneline</code> 出现一条类似 <code>a1b2c3d chore: init repo</code> 的记录；add 前的 status 显示红色 Untracked，add 后变成绿色 Changes to be committed。',
   errs:[
     { q:'Author identity unknown', a:'漏了前两条 git config，补上再 commit。' },
     { q:'PowerShell 生成的 README.md 打不开 / 乱码', a:'PS 5.1 的 > 默认 UTF-16。改成：Set-Content -Encoding utf8 README.md "# A股量化 105 天"，或用 Git Bash 的 echo。' }
   ],
   res:['progitFirst','progitRecord','biliGitKs','gitBranchGame','postGitNote'],
   check:'我能说出 add 和 commit 各干了什么，且 git log 里有第一条记录' },

 { id:'g4', t:'写 .gitignore：别把虚拟环境和原始数据传上去', min:6,
   why:'.venv 有几千个文件、几百 MB，原始数据可能上 GB 且不该外传，密钥更不能进仓库。.gitignore 就是「这些东西永远不用管」的名单。',
   body:String.raw`<p>直接复制下面「文件模板」里的 <b>.gitignore</b>，或用官方模板改。重点四组：<code>.venv/</code>、<code>__pycache__/</code>、<code>.ipynb_checkpoints/</code>、<code>data/raw/ + *.csv + *.parquet + .env</code>。</p>
   <p><b>反向注意：</b><code>notes/</code> 和 <code>docs/</code> 必须提交，它们是学习资产；空目录要靠 <code>.gitkeep</code> 占位，所以模板里写了 <code>!**/.gitkeep</code> 放行。</p>
   <p>改完 .gitignore 要再 commit 一次，这样规则本身也被版本记录下来。</p>`,
   cmds:[
     { os:'通用（先把模板内容存成 .gitignore）', code:String.raw`git add .gitignore
git commit -m "chore: add python gitignore"
git status -sb` }
   ],
   out:'<code>git status -sb</code> 干净（无未跟踪文件），且 .gitignore 已进版本库。之后建 .venv 时，status 里也不会冒出几千个文件。',
   errs:[
     { q:'我已经把 .venv commit 进去了', a:'补好 .gitignore 后执行 git rm -r --cached .venv，再 git commit -m "chore: ignore venv"。文件不会从本地删除。' },
     { q:'写了 .gitignore 但文件还是被跟踪', a:'.gitignore 只对「未被跟踪」的文件生效，已被 add 过的要先 git rm --cached。' }
   ],
   res:['gitignorePy','gitRefCn','progitRecord'],
   check:'.gitignore 已 commit，且我把 .venv / 原始数据 / 密钥都排除了' },

 { id:'g5', t:'创建并激活虚拟环境 .venv', min:8,
   why:'系统 Python 是「全机器共用的工具箱」，装多了会版本打架。虚拟环境是给这个项目单独开一个工具箱，换电脑时靠 requirements.txt 原样复现。',
   body:String.raw`<p><code>python -m venv .venv</code> 会在项目里生成 <code>.venv/</code>，里面是一份独立的 Python 解释器和 pip。名字前的点表示隐藏，是社区约定；VS Code 也能自动识别。</p>
   <p><b>激活</b>就是让当前终端的 python / pip 指向这份副本。激活成功的标志是提示符前面出现 <code>(.venv)</code>。<b>每次新开终端都要重新激活一次</b>。</p>
   <p>激活后立刻验证两件事：<code>pip -V</code> 的路径要含 .venv；<code>python -c "import sys; print(sys.executable)"</code> 也要指向 .venv。这两条能挡掉后面 80% 的「装了包却 import 不到」。</p>`,
   cmds:[
     { os:'Windows · PowerShell', code:String.raw`python -m venv .venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
pip -V
python -c "import sys; print(sys.executable)"` },
     { os:'Windows · cmd（PS 执行策略不便时）', code:String.raw`python -m venv .venv
.\.venv\Scripts\activate.bat
pip -V` },
     { os:'Git Bash / macOS / Linux', code:String.raw`python -m venv .venv
source .venv/bin/activate
pip -V
python -c "import sys; print(sys.executable)"` }
   ],
   out:'提示符前有 <code>(.venv)</code>，两条验证命令输出的路径都在项目内的 .venv 里。想退出就执行 <code>deactivate</code>。',
   errs:[
     { q:'禁止运行脚本 / Activate.ps1 无法加载', a:'执行上面的 Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass（只影响当前窗口），或改用 cmd 的 activate.bat。' },
     { q:'pip -V 路径不含 .venv', a:'没激活成功。重新激活；或直接用 .venv\Scripts\python.exe -m pip 显式调用。' },
     { q:'Git Bash 下 source .venv/bin/activate 找不到', a:'Windows 的虚拟环境脚本在 Scripts 目录：source .venv/Scripts/activate。' }
   ],
   res:['pyVenv','biliVenv','biliVenvWin','postVenv','searchVenv'],
   check:'激活后 pip 与 python 都指向 .venv，我知道每次开新终端要重新激活' },

 { id:'g6', t:'装 Jupyter 并绑定 quant 内核', min:12,
   why:'Jupyter 让你把「代码 + 结果 + 说明」放在一个文件里，适合做因子实验。但很多人装完发现 notebook 里 import 不到刚装的包——因为 Jupyter 用的是另一个内核，必须显式绑定。',
   body:String.raw`<p>顺序很重要：<b>先激活 .venv，再 pip install</b>。装 <code>jupyterlab</code>（界面）+ <code>ipykernel</code>（内核注册器）。国内网络慢就加清华源参数。</p>
   <p><code>python -m ipykernel install --user --name quant --display-name "Python (quant)"</code> 是给这个虚拟环境在 Jupyter 里登记一个名字。启动后<b>新建 notebook 时务必选 Python (quant)</b>，右上角也能切换 Kernel。</p>
   <p>启动 <code>jupyter lab</code> 后浏览器会自动打开；<b>那个命令行窗口不要关</b>，关了服务就停。结束按两次 Ctrl+C。验证单元格里跑下面两行，路径必须含 .venv。</p>`,
   cmds:[
     { os:'通用（确保已激活 .venv）', code:String.raw`python -m pip install --upgrade pip
python -m pip install jupyterlab ipykernel numpy pandas matplotlib
python -m ipykernel install --user --name quant --display-name "Python (quant)"
jupyter kernelspec list
jupyter lab` },
     { os:'国内加速版（第一步换源）', code:String.raw`python -m pip install -i https://pypi.tuna.tsinghua.edu.cn/simple jupyterlab ipykernel numpy pandas matplotlib` },
     { os:'在新建 notebook 的第一个单元格里跑', code:String.raw`import sys
print(sys.executable)
import pandas as pd
print(pd.__version__)` }
   ],
   out:'浏览器打开 JupyterLab；<code>jupyter kernelspec list</code> 里有 <code>quant</code>；notebook 打印出的 <code>sys.executable</code> 路径含 .venv，且 pandas 能 import。',
   errs:[
     { q:'ModuleNotFoundError: No module named pandas', a:'内核选错。切到 Python (quant)；若列表里没有，回到 .venv 重跑 ipykernel install 那行。' },
     { q:'jupyter 不是内部或外部命令', a:'没激活 .venv，或装到了别处。用 python -m jupyterlab 启动。' },
     { q:'端口 8888 被占用 / 浏览器没自动打开', a:'命令行会打印带 token 的 URL，手动复制到浏览器；或 jupyter lab --port 8890。' }
   ],
   res:['jupyterInst','jupyterLab','ipykernel','biliJupyter','postJupyter','postJupyter2','searchJupyter','tunaPypi'],
   check:'JupyterLab 能打开，内核是 Python (quant)，notebook 里 pandas 可用且解释器路径含 .venv' },

 { id:'g7', t:'建目录骨架 data/ factors/ backtest/ live/ research/ docs/ + notes/', min:6,
   why:'原表只给了 6 个目录名，但没说各放什么、也没说 Git 不跟踪空目录。先把货架搭好，后面 14 周每个产物才有固定位置。',
   body:String.raw`<table class="g-table"><tr><th>目录</th><th>放什么</th><th>第一次用</th></tr>
   <tr><td>data/</td><td>原始行情 / 清洗后数据 / 数据质量报告的数据部分</td><td>W1 D2</td></tr>
   <tr><td>factors/</td><td>因子定义、计算、中性化、IC 与分层检验</td><td>W3 / W13</td></tr>
   <tr><td>backtest/</td><td>事件驱动引擎、撮合、成本模型、绩效</td><td>W14</td></tr>
   <tr><td>live/</td><td>QMT / miniQMT 对接、下单、风控告警</td><td>W15</td></tr>
   <tr><td>research/</td><td>实验性 notebook、草稿、可复现小实验</td><td>W2 D5</td></tr>
   <tr><td>docs/</td><td>A 股规则 checklist、设计文档、data_quality_report.md</td><td>W1 D7</td></tr>
   <tr><td>notes/</td><td>errors.md 错题本、mastery.md 掌握度台账（原表点名要写）</td><td><b>今天</b></td></tr></table>
   <p>原表列了 6 个目录，但两个模板写在 <code>notes/</code> 下，所以要<b>额外建 notes/</b>。每个空目录放一个空的 <code>.gitkeep</code>，否则 push 后 GitHub 上这些目录会「消失」。</p>`,
   cmds:[
     { os:'Windows · PowerShell', code:String.raw`$dirs = 'data','factors','backtest','live','research','docs','notes'
New-Item -ItemType Directory -Force -Path $dirs | Out-Null
foreach ($d in $dirs) { New-Item -ItemType File -Force -Path "$d/.gitkeep" | Out-Null }
Get-ChildItem -Force -Name` },
     { os:'Git Bash / macOS / Linux', code:String.raw`mkdir -p data factors backtest live research docs notes
touch data/.gitkeep factors/.gitkeep backtest/.gitkeep live/.gitkeep research/.gitkeep docs/.gitkeep notes/.gitkeep
ls -a` }
   ],
   out:'7 个目录都在，每个里面有一个 .gitkeep；<code>git status</code> 能看到这些 .gitkeep 是未跟踪文件。',
   errs:[
     { q:'push 后 GitHub 上看不到目录', a:'Git 不跟踪空目录，补 .gitkeep 后重新 add / commit / push。' },
     { q:'PowerShell 里 $dirs 变量报错', a:'确认是 PowerShell 而不是 cmd；cmd 请改用 Git Bash 那条 mkdir + touch。' }
   ],
   res:['progitRecord','gitRefCn'],
   check:'7 个目录齐全且各有 .gitkeep，我知道每个目录将来放什么' },

 { id:'g8', t:'写 notes/errors.md 与 notes/mastery.md 两个模板', min:8,
   why:'这两个文件不是形式主义：错题本防「同一个坑栽三次」，掌握度台账防「看懂了误当成会用了」。网页里的错题本和 L0–L3 台账，就是这两个文件的电子化版本。',
   body:String.raw`<p>直接复制下面「文件模板」区里的两份内容，分别存成 <code>notes/errors.md</code> 和 <code>notes/mastery.md</code>。写不出内容没关系，<b>今天只要把骨架和字段建起来</b>。</p>
   <p><b>errors.md 关键字段：</b>现象与报错原文 / 我当时以为 / 真正原因 / 正确结论 / 正确思路 / 最小复现命令 / 状态 / 重做记录。末尾附「量化专属高频坑位」清单（前视偏差、幸存者偏差、复权口径、shift 方向、涨跌停规则、随机种子），以后踩坑直接归类。</p>
   <p><b>mastery.md 关键字段：</b>日期 / Day / 知识点 / L 级 / 验收动作 / 证据（文件或 commit）/ 下次复习。L 级定义写在文件开头，判定标准是「合上资料能不能做出来」。</p>
   <p>填第一行示例：今天的知识点「Git 三态与首次 push」，验收动作「默写命令链 + push 成功」，证据 <code>git log --oneline</code>。</p>`,
   cmds:[
     { os:'通用（复制模板内容保存后）', code:String.raw`# 用 VS Code 打开更方便，也可以命令行新建
code notes/errors.md
code notes/mastery.md
git add notes/
git commit -m "docs: add error & mastery templates"` }
   ],
   out:'两个 .md 文件有完整表头和一条示例记录，且已被 commit。',
   errs:[
     { q:'code 命令不存在', a:'VS Code 未加入 PATH；直接用记事本/编辑器打开这两个文件即可，命令只是 convenience。' },
     { q:'中文保存后乱码', a:'统一用 UTF-8 保存；PowerShell 用 Set-Content -Encoding utf8。' }
   ],
   res:['lxfGit','gitRefCn'],
   check:'两个模板已落地并 commit，我知道以后每天往哪里记' },

 { id:'g9', t:'补 README.md 与 requirements.txt', min:5,
   why:'README 是仓库的门面，也让三个月后的自己知道每个目录放什么；requirements.txt 让换电脑时一条命令复现环境。两者都是「可复现」的一部分。',
   body:String.raw`<p>把第 3 步那个一行 README 换成模板区里的完整版（含快速开始命令和目录约定表）。</p>
   <p>再导出依赖清单：<code>pip freeze > requirements.txt</code>。<b>Windows PowerShell 5.1 注意</b>：<code>&gt;</code> 会写成 UTF-16，pip 读不了，请用 <code>pip freeze | Out-File -Encoding utf8 requirements.txt</code>，或直接在 Git Bash 里执行。</p>`,
   cmds:[
     { os:'Windows · PowerShell', code:String.raw`pip freeze | Out-File -Encoding utf8 requirements.txt
git add README.md requirements.txt
git commit -m "docs: readme and pinned dependencies"` },
     { os:'Git Bash / macOS / Linux', code:String.raw`pip freeze > requirements.txt
git add README.md requirements.txt
git commit -m "docs: readme and pinned dependencies"` }
   ],
   out:'requirements.txt 里能看到 jupyterlab==x.y.z 等精确版本；README 里有目录约定表。',
   errs:[
     { q:'requirements.txt 里出现大量奇怪空字符', a:'UTF-16 问题，用 Out-File -Encoding utf8 重写。' },
     { q:'pip freeze 输出为空', a:'没激活 .venv；激活后重跑。' }
   ],
   res:['pipStart','pyVenv','postVenv'],
   check:'README 和 requirements.txt 已 commit，我知道换电脑怎么复现环境' },

 { id:'g10', t:'连远程仓库，完成首次 push（今天的硬验收）', min:12,
   why:'commit 只存在本机，push 才是「仓库首次 commit + push 成功」这条验收动作的终点，也是每周日要重复的动作。',
   body:String.raw`<p>先去 <b>GitHub → New repository</b> 建一个空仓库（名字如 <code>quant-study</code>），<b>不要勾选</b> Add README / .gitignore / license——我们本地已经有了，勾了会冲突。建好后复制它给出的 HTTPS 地址。</p>
   <p>然后三条命令：登记远程地址 → 把本地所有改动做一次总提交 → 推上去并记住上游分支（以后只要 <code>git push</code> 就行）。</p>
   <p><b>认证：</b>GitHub 已不支持账号密码，第一次 push 会要求登录，用个人访问令牌 PAT 或 SSH；国内网络不稳可用 Gitee，命令完全一样，只换 <code>origin</code> 地址。</p>`,
   cmds:[
     { os:'通用（把地址换成你自己的）', code:String.raw`git remote add origin https://github.com/你的用户名/quant-study.git
git add -A
git commit -m "chore: day1 setup - dirs, notes, env config"
git branch -M main
git push -u origin main
git remote -v
git log --oneline` },
     { os:'Gitee 备选（只换这一行）', code:String.raw`git remote add origin https://gitee.com/你的用户名/quant-study.git` }
   ],
   out:'终端出现 <code>Branch main set up to track origin/main</code>；刷新 GitHub 网页能看到 README、7 个目录、.gitignore、requirements.txt 和 notes/ 里两个 md 文件。',
   errs:[
     { q:'Authentication failed / Password authentication removed', a:'用 PAT 代替密码，或配 SSH key。见「GitHub PAT」官方文档链接。' },
     { q:'src refspec main does not match any', a:'没有 commit 或分支名还是 master：先 git add -A && git commit，再 git branch -M main。' },
     { q:'rejected / non-fast-forward（远程已有 README）', a:'建仓库时勾选了初始化文件。先 git pull --rebase origin main 再 push；或直接删掉重建一个空仓库。' },
     { q:'连不上 github.com / timeout', a:'换 Gitee，或检查代理；不要在没确认前反复重试。' }
   ],
   res:['githubDocs','githubPat','gitee','progitRemote','biliGitQuick','biliGitVs','searchErrGit'],
   check:'远程仓库网页上能看到今天建的所有文件（今日硬验收）' },

 { id:'g11', t:'最终验收：四条命令 + 摸底自评', min:5,
   why:'原表的验收是「摸底清单逐项自评，标出每个模块的 L 级；仓库首次 commit + push 成功」。把它变成可执行的检查，别靠感觉判断「应该做完了吧」。',
   body:String.raw`<p>逐条跑一遍下面的命令，再去「新手起步」页做 20 分钟数学摸底自测，把结果填进 <code>notes/mastery.md</code> 与网页底部的 L0–L3 按钮。</p>
   <p>最后回到逐日卡片：勾掉 12 个步骤 → 做 3 道习题（答案默认隐藏，先闭卷）→ 勾选「标记完成」→ 在笔记里写下卡住最久的一步。</p>`,
   cmds:[
     { os:'Windows · PowerShell', code:String.raw`git status -sb
git log --oneline
git remote -v
Get-ChildItem -Force -Name
.\.venv\Scripts\python.exe -c "import sys; print(sys.executable)"` },
     { os:'Git Bash / macOS / Linux', code:String.raw`git status -sb
git log --oneline
git remote -v
find . -maxdepth 2 -type d -not -path "*/.git*" | sort
.venv/bin/python -c "import sys; print(sys.executable)"` }
   ],
   out:'status 干净（无未提交改动）、log 里有 ≥ 3 条 commit、remote 指向你的仓库、目录清单齐全、解释器指向 .venv。',
   errs:[
     { q:'git status 里还有未跟踪文件', a:'看清楚是不是 .venv / 数据文件——若是，补 .gitignore；若该提交，git add -A && git commit。' },
     { q:'摸底自测一半不会', a:'正常。按题后标注的周次，在对应周开始前补前置即可，不要现在死磕。' }
   ],
   res:['progitRecord','gitRefCn','searchErrAll'],
   check:'四条命令全通过、摸底自评已填、网页上 Day 1 已标记完成' }
];

/* ---------- Week 1 其余 6 天：简版逐步拆解 ---------- */
function S(id,t,min,why,body,cmds,out,errs,res,check){
  return { id:id,t:t,min:min,why:why,body:body,cmds:cmds,out:out,errs:errs||[],res:res||[],check:check };
}
function C(os,code){ return { os:os, code:code }; }

window.GUIDES = {
 0: {
   title:'Day 1 · 从零搭起量化仓库',
   sub:'Git / 虚拟环境 / Jupyter / 目录骨架 / 两个笔记模板',
   mins:'90–120 分钟（新手节奏，可拆两天）',
   intro:'这一天的原计划只有一行字，实际压了 5 件事。下面 12 步全部给了可直接复制的命令、预期输出、常见报错和对应学习材料，照着做即可。',
   goal:['本地 Git 仓库 + 首次 commit','隔离的 .venv + 绑定 quant 内核的 Jupyter','7 个目录骨架 + notes/（各含 .gitkeep）','notes/errors.md 与 notes/mastery.md 两个模板','README / .gitignore / requirements.txt','远程仓库首次 push 成功'],
   steps: DAY1_STEPS,
   res: Object.keys(window.BEGINNER_RES),
   final:['git log --oneline 至少 3 条 commit','git status -sb 干净','GitHub / Gitee 网页能看到全部文件','Jupyter 内核是 Python (quant)','notes/errors.md 与 notes/mastery.md 有表头和第一行','数学摸底自测做完并标了 L 级']
 },

 1: { title:'Day 2 · AkShare 接入与第一次全市场下载', sub:'把「能拿到数据」变成可复现的脚本', mins:'60–80 分钟',
   intro:'今天不碰数学，只把数据管道打通：装库 → 取一只票 → 看懂字段 → 写 fetch_daily() → 出质量报告。',
   goal:['fetch_daily() 能跑','shape / 缺失率 / 重复率 三项报告','随机 3 只股票收盘价与外部来源一致'],
   steps:[
     S('d2s1','激活环境并装 akshare',5,'环境每天都要重新激活，包只装进 .venv。',
       String.raw`<p>打开终端 → cd 到项目 → 激活 .venv → 安装 akshare 与 pytest。国内源可加速。</p>`,
       [C('Windows · PowerShell',String.raw`cd D:\WorkBuddy\quant-study
.\.venv\Scripts\Activate.ps1
python -m pip install -i https://pypi.tuna.tsinghua.edu.cn/simple akshare pytest`)],
       'pip show akshare 能显示版本；python -c "import akshare; print(akshare.__version__)" 不报错。',
       [{q:'No module named akshare',a:'没激活 .venv 或装到了系统 Python，用 pip -V 确认路径。'}],
       ['akshare','tunaPypi','pyVenv'],'我知道包只装进 .venv'),
     S('d2s2','先取一只票，把字段看懂',12,'直接下全市场容易卡在字段理解上，先用一只票试通。',
       String.raw`<p>在 Jupyter（内核 Python (quant)）里跑 stock_zh_a_hist，打印 head()、dtypes、shape。重点确认：<b>日期、开盘、收盘、最高、最低、成交量、成交额、振幅、涨跌幅、换手率</b>；<code>period="daily"</code>、<code>adjust="hfq"</code>（后复权）与 <code>adjust="qfq"</code> 的区别今天先记在笔记里，D4 会专门验收。</p>`,
       [C('Jupyter 单元格',String.raw`import akshare as ak
df = ak.stock_zh_a_hist(symbol="600519", period="daily",
                        start_date="20200101", end_date="20261231", adjust="hfq")
print(df.shape)
print(df.head(3).to_string())
print(df.dtypes)`)],
       '拿到一个 DataFrame，行数约等于这些年交易日数，列名是中文且包含收盘 / 成交量。',
       [{q:'接口报错 / 连接超时',a:'先用 ak.stock_zh_a_spot_em() 试网络；换网络或稍后重试，别改代码。'}],
       ['akshare','tushare','postJupyter'],'我能说出至少 6 个字段的含义'),
     S('d2s3','写 fetch_daily() 并落盘',20,'把一次性探索变成可复现函数，是「工程产物」和「笔记本草稿」的分界线。',
       String.raw`<p>新建 <code>data/fetch_daily.py</code>：函数接收股票代码与日期区间，返回 DataFrame；用参数控制复权口径，<b>不要把复权写死</b>。先只对 3 只票跑，确认能存成文件再扩到全市场。原始数据放 <code>data/raw/</code>（已被 .gitignore 忽略）。</p>`,
       [C('文件 data/fetch_daily.py（骨架）',String.raw`import akshare as ak
from pathlib import Path

def fetch_daily(symbol: str, start: str, end: str, adjust: str = "hfq"):
    df = ak.stock_zh_a_hist(symbol=symbol, period="daily",
                            start_date=start, end_date=end, adjust=adjust)
    df = df.rename(columns={"日期": "date", "收盘": "close"})
    df["date"] = pd.to_datetime(df["date"])
    return df.sort_values("date").reset_index(drop=True)

if __name__ == "__main__":
    import pandas as pd
    out = Path("data/raw")
    out.mkdir(parents=True, exist_ok=True)
    for s in ["600519", "000001", "601318"]:
        fetch_daily(s, "20200101", "20261231").to_csv(out / f"{s}.csv", index=False)`)],
       'data/raw/ 下出现 3 个 csv，且函数签名里 adjust 可调。',
       [{q:'NameError: pd is not defined',a:'把 import pandas as pd 放到文件顶部，不要只放在 __main__ 里。'}],
       ['akshare','pipStart'],'函数可复用，不是一段一次性代码'),
     S('d2s4','出 shape / 缺失率 / 重复率 报告',15,'验收动作要求「覆盖 ≥ 4000 只、10 年、缺失率 < 5%」，先把度量写出来。',
       String.raw`<p>写一个 <code>quality_report(df)</code>：报告 shape、每列缺失率、<code>df.duplicated(subset=["symbol","date"]).sum()</code>、日期是否连续（对照交易日历，先粗略用工作日）。把结果打印并写进 <code>docs/data_quality_report.md</code> 的草稿，周日完善。</p>`,
       [C('Jupyter 单元格',String.raw`def quality_report(df):
    return {
        "shape": df.shape,
        "missing_rate": df.isna().mean().round(4).to_dict(),
        "dup_rows": int(df.duplicated().sum()),
        "date_min": str(df["date"].min()),
        "date_max": str(df["date"].max()),
    }
print(quality_report(df))`)],
       '四项指标都有具体数字，且重复率为 0 或能解释。',
       [{q:'缺失率异常高',a:'先确认不是列没对齐、不是停牌；任何未解释异常都写进笔记，D7 处理。'}],
       ['akshare','postPit'],'我知道重复行会怎样放大收益与权重'),
     S('d2s5','随机抽 3 只核对收盘价 + commit',8,'「和外部来源一致」是防数据源错配最便宜的检查。',
       String.raw`<p>挑 3 只（含 1 只近除权的），把某日收盘价与行情软件 / 交易所页面对照，把日期与价格记进笔记。然后 <code>git add -A && git commit -m "feat: fetch_daily and quality report" && git push</code>。</p>`,
       [C('通用',String.raw`git add -A
git commit -m "feat: fetch_daily and quality report"
git push`)],
       '3 条核对记录都一致，push 成功。',
       [],['akshare','progitRemote'],'核对记录已写进笔记且代码已 push')
   ],
   res:['akshare','tushare','tunaPypi','postPit'], final:['fetch_daily() 可复用','三项质量指标有数字','3 只票人工核对一致','代码已 push'] },

 2: { title:'Day 3 · A 股规则体系与 build_flags()', sub:'把规则写成 bool 列，而不是记在脑子里', mins:'60 分钟',
   intro:'交易日历、停牌、涨跌停分档、ST、退市——这些不是背景知识，是回测里必须建模的硬约束。',
   goal:['build_flags() 生成 4 个 bool 列','10 只 × 3 个涨跌停日 + 2 个停牌日人工核对 100% 一致'],
   steps:[
     S('d3s1','先查规则，列一张 checklist',15,'把「我以为的规则」写成可核对的条目，后面人工比对才有依据。',
       String.raw`<p>在 <code>docs/a_share_rules.md</code> 建表：主板 ±10%、ST ±5%、创业板/科创板 ±20%、北交所 ±30%、新股前 5 日不设限、T+1、最小 100 股、停牌不可交易、退市整理期。<b>涨停价是「前收 × (1+比例) 四舍五入到分」</b>，不是 pct_change > 0.095。</p>`,
       [C('Jupyter / 编辑器',String.raw`# docs/a_share_rules.md 里逐条写清「规则 / 依据 / 数据字段 / 验收用例」四列`)],
       '一张能逐条打勾的规则表。',[],['postRules','akshare'],'我能说出至少 5 条分档规则'),
     S('d3s2','取交易日历与名称变更数据',12,'涨跌停判定要基于交易日历与当日状态，不能用自然日。',
       String.raw`<p>用 <code>ak.tool_trade_date_hist_sina()</code> 拿交易日历；用 <code>ak.stock_zh_a_spot_em()</code> 看名称里的 ST 标记；停牌可用「当日无成交记录 + 状态字段」近似，先标注为近似，别假装精确。</p>`,
       [C('Jupyter 单元格',String.raw`import akshare as ak
cal = ak.tool_trade_date_hist_sina()
print(cal.tail(3))
spot = ak.stock_zh_a_spot_em()
print(spot.columns.tolist())`)],
       '交易日历是纯交易日序列，spot 里能找到名称列。',[],['akshare','postRules'],'我知道日历不能凭 weekday 猜'),
     S('d3s3','实现 build_flags()',20,'四个 bool 列是后面撮合器的输入。',
       String.raw`<p>新建 <code>factors/flags.py</code>。输入含 symbol / date / pre_close / close / name / volume 的 DataFrame，输出 is_st / is_suspended / limit_up / limit_down。涨停价务必用<b>四舍五入到分</b>并与交易所价格比对，而不是阈值判断。</p>`,
       [C('文件 factors/flags.py（关键行）',String.raw`def round_price(x):
    return round(x + 1e-9, 2)

def limit_price(pre_close, ratio, name):
    r = 0.05 if "ST" in str(name).upper() else ratio   # 分档按板块传入
    return round_price(pre_close * (1 + r))

def build_flags(df, ratio=0.10):
    df = df.copy()
    df["is_st"] = df["name"].str.contains("ST", case=False, na=False)
    df["is_suspended"] = df["volume"].fillna(0).eq(0)
    up, dn = limit_price(df["pre_close"], ratio, df["name"]), limit_price(df["pre_close"], -ratio, df["name"])
    df["limit_up"] = df["close"].eq(up)
    df["limit_down"] = df["close"].eq(dn)
    return df`)],
       '函数返回 4 个 bool 列，且能对一只涨停股标 True。',
       [{q:'ST 判定漏了 *ST',a:'用 str.contains("ST") 已覆盖；注意名称里的空格与大小写。'}],
       ['akshare','postRules'],'我知道为什么不能用固定阈值判涨停'),
     S('d3s4','人工核对 + commit',13,'验收要求 100% 一致，这一步不能省。',
       String.raw`<p>挑 10 只股票 × 3 个已知涨停日 + 2 个停牌日，把脚本标记与人工核对结果做成对照表写进 <code>docs/</code>，逐格打勾。然后 commit / push。</p>`,
       [C('通用',String.raw`git add -A
git commit -m "feat: build_flags with A-share rules"
git push`)],
       '对照表里没有不一致的格子；若有，说明原因并修函数。',[],['postRules','progitRemote'],'人工核对 100% 一致')
   ],
   res:['postRules','akshare','tushare'], final:['4 个 bool 列','规则 checklist','人工核对表 100% 一致','已 push'] },

 3: { title:'Day 4 · 复权与分红除权', sub:'前复权含未来信息，这是最容易漏的未来函数', mins:'60 分钟',
   intro:'今天只做一件事：把后复权序列做对，并说清为什么前复权不能直接拿去算历史收益。',
   goal:['后复权价格序列 + 独立 factor 列','除权日前后 5 日无跳点（收益率 < 15%）'],
   steps:[
     S('d4s1','找一只高分红股，观察除权日',10,'先看见现象，再谈公式。',
       String.raw`<p>用 <code>ak.stock_zh_a_hist(..., adjust="")</code>（不复权）与 <code>adjust="qfq"</code>、<code>adjust="hfq"</code> 各取一次，打印同一只票除权日前后 5 行的收盘价，横向对比。</p>`,
       [C('Jupyter 单元格',String.raw`import akshare as ak
for adj in ["", "qfq", "hfq"]:
    d = ak.stock_zh_a_hist(symbol="600519", period="daily",
                           start_date="20230601", end_date="20230715", adjust=adj)
    print(adj or "none", d[["日期","收盘"]].to_string(index=False))`)],
       '三列价格在同一天明显不同，能看到跳点。',[],['akshare','postPit'],'我能指出除权日那一行'),
     S('d4s2','构造后复权序列 + 独立 factor 列',20,'把复权因子单独存一列，才能随时切换口径而不丢信息。',
       String.raw`<p><code>factor = hfq_close / raw_close</code>，把 factor 与 raw_close 一起存，需要任意口径时相乘即可。<b>不要只存复权后的价格</b>。写进 <code>data/adjust.py</code>。</p>`,
       [C('文件 data/adjust.py（骨架）',String.raw`def attach_factor(raw, hfq, on="date"):
    m = raw.merge(hfq[["date", "close"]], on=on, suffixes=("_raw", "_hfq"))
    m["factor"] = m["close_hfq"] / m["close_raw"]
    m["close_hfq_check"] = m["close_raw"] * m["factor"]
    assert (m["close_hfq_check"] - m["close_hfq"]).abs().max() < 1e-6
    return m`)],
       'assert 通过，且 factor 列在除权日发生跳变。',[],['akshare','postPit'],'我知道 factor 列为什么必须独立保存'),
     S('d4s3','验收：除权日前后 5 日无跳点',15,'这是原表写死的量化验收条件。',
       String.raw`<p>对后复权序列算 pct_change()，检查除权日前后 5 日每一行绝对收益率都 &lt; 15%；不复权序列应该出现明显跳点，作为对照。</p>`,
       [C('Jupyter 单元格',String.raw`m["ret_hfq"] = m["close_hfq"].pct_change()
m["ret_raw"] = m["close_raw"].pct_change()
win = m.iloc[max(0, k-5):k+6]     # k = 除权日位置
assert win["ret_hfq"].abs().max() < 0.15
print(win[["date","close_raw","close_hfq","ret_raw","ret_hfq"]].to_string(index=False))`)],
       'assert 通过，对照表里 raw 有明显跳点而 hfq 平滑。',
       [{q:'后复权仍有跳点',a:'检查是否混用了不同数据源、或日期没对齐；别用 shift(-1) 掩盖。'}],
       ['akshare','postPit'],'我能解释前复权为什么会泄露未来分红'),
     S('d4s4','写进笔记 + commit',10,'把结论固化成以后能查的一句话。',
       String.raw`<p>在 notes/errors.md 记一条「未来函数」类：前复权以最新价为基准，历史价会随未来分红改变。然后 commit / push。</p>`,
       [C('通用',String.raw`git add -A
git commit -m "feat: hfq series with standalone factor"
git push`)],
       '笔记有记录，代码已 push。',[],['postPit','progitRemote'],'结论已写进错题本')
   ],
   res:['akshare','postPit','tushare'], final:['后复权序列 + factor 列','跳点断言通过','未来函数结论已记','已 push'] },

 4: { title:'Day 5 · 多元微积分补强', sub:'偏导、梯度、雅可比、黑塞、链式法则', mins:'60 分钟',
   intro:'W2 之后的 OLS、矩阵求导、BSM 全靠这一层。今天只求「能算 + 能对上数值」。',
   goal:['手算 3 例 + sympy 验证','数值差分实现与解析解误差 < 1e-6'],
   steps:[
     S('d5s1','看几何直觉，再手算 3 例',15,'先看动画建立直觉，再动笔，比直接背公式省力。',
       String.raw`<p>看《微积分的本质》前 3 集；手算：① f=x²y+sin y 的梯度与 Hessian；② g=Ax 的雅可比；③ 链式法则 z=f(u,v), u=u(t), v=v(t) 求 dz/dt。</p>`,
       [C('纸笔 + Jupyter',String.raw`import sympy as sp
x, y = sp.symbols("x y")
f = x**2*y + sp.sin(y)
print(sp.Matrix([f]).jacobian([x, y]))
print(sp.hessian(f, (x, y)))`)],
       '手算结果与 sympy 一致：∇f=(2xy, x²+cos y)。',[],['b3b1bcalc','cookbook'],'我能闭卷写出梯度定义'),
     S('d5s2','实现中心差分并与解析解比对',25,'数值梯度是后面检验矩阵求导是否写错的标准工具。',
       String.raw`<p>实现 <code>num_grad(f, x, h=1e-5)</code>：逐维用 (f(x+h eᵢ) − f(x−h eᵢ))/(2h)。在 research/la_lab.py 里对 3 个函数比对，断言误差 &lt; 1e-6。再扫 h 从 1e-1 到 1e-12，画误差曲线，理解截断误差与舍入误差的权衡。</p>`,
       [C('文件 research/calc_lab.py（骨架）',String.raw`import numpy as np

def num_grad(f, x, h=1e-5):
    x = np.asarray(x, dtype=float)
    g = np.zeros_like(x)
    for i in range(len(x)):
        e = np.zeros_like(x); e[i] = h
        g[i] = (f(x + e) - f(x - e)) / (2 * h)
    return g

f = lambda v: v[0]**2 * v[1] + np.sin(v[1])
x0 = np.array([1.3, 0.7])
ana = np.array([2*x0[0]*x0[1], x0[0]**2 + np.cos(x0[1])])
assert np.abs(num_grad(f, x0) - ana).max() < 1e-6`)],
       '断言通过；误差曲线呈 U 形，h≈1e-5~1e-6 附近最小。',
       [{q:'误差不随 h 下降',a:'函数有不可导点或 h 已小到浮点精度以下；打印中间值定位。'}],
       ['b3b1bcalc','cookbook','scipyivp'],'我知道 h 太小为什么会更差'),
     S('d5s3','验收三问 + commit',10,'闭卷写定义，才算 L2。',
       String.raw`<p>合上资料写出梯度、雅可比、Hessian 的定义与维度；把误差曲线图存进 research/，commit / push。</p>`,
       [C('通用',String.raw`git add -A
git commit -m "feat: numerical gradient lab"
git push`)],
       '三个定义都能闭卷写出且维度正确。',[],['cookbook','progitRemote'],'闭卷能写出定义与维度')
   ],
   res:['b3b1bcalc','cookbook','scipyivp'], final:['手算 3 例对上 sympy','数值梯度误差 < 1e-6','误差曲线已存','已 push'] },

 5: { title:'Day 6 · Taylor 展开、复数与极坐标', sub:'为 Itô 引理和特征函数做前置', mins:'60 分钟',
   intro:'Itô 引理本质就是「保留到二阶项的 Taylor」，今天先把确定性版本练熟。',
   goal:['一阶/二阶近似 e^x 与 sin x 并画误差曲线','闭卷写出 Taylor 式与误差阶'],
   steps:[
     S('d6s1','写出三个展开式并手算 2 例',12,'先背结构，再看代码。',
       String.raw`<p>闭卷写：e^x = 1 + x + x²/2 + O(x³)；sin x = x − x³/6 + O(x⁵)；cos x = 1 − x²/2 + O(x⁴)。手算 x=0.5 时 e^x 的一阶、二阶近似值。</p>`,
       [],'能写出余项阶，且知道下一项的量级。',[],['b3b1bcalc','cookbook'],'我能写出展开式与余项阶'),
     S('d6s2','画近似与误差曲线',25,'误差按数量级下降，必须亲眼看见。',
       String.raw`<p>在 research/taylor_lab.py 里对 x∈[−1,1] 画四条曲线：真值、一阶、二阶、三阶；再画 log-log 误差曲线，验证阶数每升一阶斜率变陡。</p>`,
       [C('Jupyter 单元格',String.raw`import numpy as np, matplotlib.pyplot as plt
x = np.linspace(-1, 1, 400)
for n, name in [(1,"1st"), (2,"2nd"), (3,"3rd")]:
    approx = sum(x**k / np.math.factorial(k) for k in range(n+1))
    plt.plot(x, np.abs(np.exp(x) - approx), label=name)
plt.yscale("log"); plt.legend(); plt.title("e^x Taylor error"); plt.show()`)],
       '误差曲线随阶数整体下移，且 |x| 越小误差越小。',[],['b3b1bcalc','scipyivp'],'我能解释误差为何按数量级下降'),
     S('d6s3','复数、欧拉公式与极坐标',13,'W12 特征函数与 BSM 会用到。',
       String.raw`<p>用 numpy 验证 e^(iθ) = cosθ + i sinθ；画出单位圆上几个点的极坐标与直角坐标转换；把 e^(iπ)+1=0 写进笔记。</p>`,
       [C('Jupyter 单元格',String.raw`import numpy as np
th = np.linspace(0, 2*np.pi, 5)
lhs = np.exp(1j*th)
rhs = np.cos(th) + 1j*np.sin(th)
print(np.abs(lhs - rhs).max())        # 应接近 0
print(np.exp(1j*np.pi) + 1)`)],
       '最大误差接近机器精度。',[],['b3b1bcalc','cookbook'],'我能说出欧拉公式在量化里的用处'),
     S('d6s4','commit / push',5,'每周日之前先养成每天提交的习惯。',
       String.raw`<p>commit / push，并在 notes/mastery.md 给今天的知识点标 L 级。</p>`,
       [C('通用',String.raw`git add -A
git commit -m "feat: taylor and complex lab"
git push`)],
       'push 成功，台账有一行新记录。',[],['progitRemote'],'代码与台账都已更新')
   ],
   res:['b3b1bcalc','cookbook','scipyivp'], final:['三条展开式闭卷可写','误差曲线已画','欧拉公式验证','已 push'] },

 6: { title:'Day 7 · 验收日：周测① + 数据层体检', sub:'本周唯一「算不算过」的一天', mins:'60 分钟',
   intro:'固定三段：20 分钟闭卷小测 → 20 分钟代码从头跑通 → 20 分钟错题闭环。',
   goal:['周测① ≥ 2/3','data_quality_report.md 无未解释异常','A 股规则 checklist 更新版','本周代码 push'],
   steps:[
     S('d7s1','20 分钟闭卷周测①',20,'答案默认隐藏，先做完再对照。',
       String.raw`<p>到「周测题库」展开 Week 1，闭卷答 3 题，再点「判分标准」自评 ≥ 2/3。答错的题点「✗ 进错题本」，会自动汇总。</p>`,
       [],'3 题都判完，且知道自己错在哪。',[],['akshare','postRules'],'周测① 已判分'),
     S('d7s2','20 分钟代码验收',20,'从空缓存开始跑，才算「能跑」而不是「当时跑过」。',
       String.raw`<p>重新激活 .venv，把 D2–D6 的脚本从头跑一遍：fetch_daily → quality_report → build_flags → attach_factor → num_grad → taylor_lab，所有 assert 全绿。任何失败记进 errors.md。</p>`,
       [C('通用',String.raw`.\.venv\Scripts\Activate.ps1     # Windows PowerShell；macOS 用 source .venv/bin/activate
python -m pytest -q              # 若有测试
python data/fetch_daily.py`)],
       '所有脚本无异常、assert 全绿。',[],['akshare','pyVenv'],'脚本从头跑通'),
     S('d7s3','写 data_quality_report.md + 规则 checklist',15,'把「无未解释异常」写成证据，不是感觉。',
       String.raw`<p>在 docs/data_quality_report.md 汇总：覆盖股票数、年份跨度、缺失率、重复率、停牌/涨跌停标记抽检、复权跳点检查，每一项给数字与结论。异常项写「已解释 / 未解释」；<b>未解释异常 = 本周不通过</b>。同步更新 docs/a_share_rules.md。</p>`,
       [],'报告里每项都有数字和明确结论。',[],['postPit','postRules'],'报告没有「应该没问题」这类措辞'),
     S('d7s4','错题闭环 + 周 commit / push',5,'周日固定动作，也是简历。',
       String.raw`<p>把错题本里的题目第二天晨检安排好，标 L 级，然后 commit / push。若周测 < 2/3，按计划把下周 D1–D2 改成补强，不学新内容。</p>`,
       [C('通用',String.raw`git add -A
git commit -m "chore: week1 acceptance - data quality report"
git push
git log --oneline`)],
       'push 成功，仓库里能看到本周完整产出一链。',[],['progitRemote','postPit'],'周测达标、报告齐、已 push')
   ],
   res:['akshare','postRules','postPit','amspbo'], final:['周测① ≥ 2/3','数据体检无未解释异常','规则 checklist 更新','已 push'] }
};

/* ---------- Day 1 专属习题（覆盖通用 3 题，改成可验收的实操题） ---------- */
window.DAY_QUIZ_OVERRIDE = {
  0: [
    { id:'q1', k:'默写题 · 闭卷', q:String.raw`合上资料，写出从「一个空文件夹」到「GitHub / Gitee 网页上能看到文件」的<b>完整命令链</b>（至少 8 条），并用一句话标出：<b>哪一步</b>把文件从工作区送进暂存区、<b>哪一步</b>真正生成快照、<b>哪一步</b>把快照送到远程。`,
      a:String.raw`参考链：<code>git init -b main</code> → <code>git config --global user.name/email</code> → 写 README / .gitignore → <code>git add .gitignore README.md</code>（工作区→暂存区） → <code>git commit -m "..."</code>（生成快照） → <code>git remote add origin URL</code> → <code>git branch -M main</code> → <code>git push -u origin main</code>（送远程）。<br><span class="qa-note">判分：三处角色说对即达标；漏了 git config 或 commit 前没有 add，说明三态还没理解，回去看第 3 步。</span>` },
    { id:'q2', k:'精编题 · 核心', q:String.raw`为什么量化项目必须用<b>虚拟环境 + Git</b>，而不是直接在系统 Python 里装包、把代码放在普通文件夹？<div class="qa-note">提示：各说一条「可复现」与「可追溯」的理由，并给出一个不这么做会真实翻车的场景。</div>`,
      a:String.raw`依赖版本可复现、多项目隔离（pandas 1.x / 2.x 行为差异会让同一份因子代码算出不同结果）；commit 记录是「哪版代码产出哪条净值曲线」的唯一凭证，回测结论才可追溯、可回滚。<br><span class="qa-note">翻车场景示例：升级了全局 numpy 后旧回测跑不出原结果，且没有 commit 可回退，无法判断是数据变了还是代码变了。</span>` },
    { id:'q3', k:'实操变式 · 防死记', q:String.raw`变式三连：① 如果把 <code>.venv/</code> 误提交进仓库，会发生什么、怎么补救？② 换一台电脑（macOS）时，今天的哪一条命令必须改、哪几条不用改？③ 为什么 <code>data/</code> 原始数据要被 .gitignore 忽略，而 <code>notes/</code> 反而必须提交？<div class="qa-note">今日产出：目录骨架 + 两个模板 + 首次 push</div>`,
      a:String.raw`① 几千个小文件、几百 MB 进仓库，clone 极慢且含平台相关的二进制；补救：补进 .gitignore 后 <code>git rm -r --cached .venv</code> 再 commit（本地文件不删）。<br>② 只有<b>激活命令</b>要改（Windows <code>.\.venv\Scripts\Activate.ps1</code> / <code>source .venv/Scripts/activate</code> → macOS <code>source .venv/bin/activate</code>）；git 命令、目录结构、模板内容都不用改；.venv 本身不跨机器，靠 requirements.txt 重建。<br>③ 原始数据体积大、可能含授权限制、可被脚本重新生成，且不同人数据版本不同会让回测不可比；notes/ 是人工产出的判断与错题，无法重建，是学习资产，必须版本化。<br><span class="qa-note">判分：③ 说清「可重建 vs 不可重建」才算 L3；只答「文件太大」算 L2。</span>` }
  ]
};

})();
