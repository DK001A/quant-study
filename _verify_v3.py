import json, os
from playwright.sync_api import sync_playwright

OUT = []
def log(s): OUT.append(str(s))
URL = 'file:///D:/WorkBuddy/quant-study/index.html'
D = 'D:/WorkBuddy/quant-study/'

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={'width': 1500, 'height': 940}, accept_downloads=True)
    page = ctx.new_page()
    errs = []
    page.on('pageerror', lambda e: errs.append(str(e)))

    page.goto(URL)
    page.evaluate('() => localStorage.clear()')
    # 模拟主子现状：Day1 已完成，旧数据没有 focus / fromFocus
    page.evaluate("""() => {
      localStorage.setItem('quant-study-v1', JSON.stringify({
        v:1,
        settings:{startDate:'2026-11-15', done:true},
        days:{'0':{done:true,doneAt:'2026-11-15',level:'L2',note:'',ans:{},verdict:{},showAns:{},opened:{},guide:{}}},
        tests:{}, gates:{}, fixed:{}
      }));
      localStorage.removeItem('quant-study-ui-v1');
    }""")
    page.reload()
    page.wait_for_timeout(700)

    # ---------- 1. 首屏不再出现 Day1 ----------
    cards = page.evaluate("() => [...document.querySelectorAll('#dayList .day')].map(e=>e.id)")
    log('1 first card = ' + (cards[0] if cards else 'NONE') + ' | day1 present = ' + str('day-0' in cards))
    log('1 fromFocus btn = ' + page.locator('[data-act="from-focus"]').inner_text())
    log('1 stToday = ' + page.locator('#stToday').inner_text())

    # ---------- 2. 刷新不回第一天 ----------
    page.evaluate("() => window.scrollTo({top:600,behavior:'auto'})")
    page.wait_for_timeout(400)
    y0 = page.evaluate('() => window.scrollY')
    page.reload(); page.wait_for_timeout(700)
    log('2 reload: first=' + page.evaluate("() => document.querySelector('#dayList .day')?.id || 'NONE'") +
        ' stToday=' + page.locator('#stToday').inner_text() +
        ' scroll ' + str(y0) + '->' + str(page.evaluate('() => window.scrollY')))

    # ---------- 3. 双 KEY 已合并 ----------
    st = page.evaluate("""() => ({
      hasOld: !!localStorage.getItem('quant-study-ui-v1'),
      uiInMain: !!(JSON.parse(localStorage.getItem('quant-study-v1')).ui || {}).fromFocus,
      focus: JSON.parse(localStorage.getItem('quant-study-v1')).settings.focus
    })""")
    log('3 oldKEY=' + str(st['hasOld']) + ' uiInMain=' + str(st['uiInMain']) + ' focus=' + str(st['focus']))

    # ---------- 4. 跨标签同步 ----------
    page2 = ctx.new_page()
    page2.on('pageerror', lambda e: errs.append('tab2:' + str(e)))
    page2.goto(URL); page2.wait_for_timeout(500)
    log('4 tab2 before = ' + page2.locator('#stToday').inner_text())
    page.locator('#btnNextDay').click()
    page.wait_for_timeout(600)
    log('4 tab1 after next = ' + page.locator('#stToday').inner_text() +
        ' | tab2 = ' + page2.locator('#stToday').inner_text())
    page2.close()

    # ---------- 5. 卡片填写 → 台账显示 → 导出 ----------
    page.evaluate("() => { const b=[...document.querySelectorAll('[data-act=from-focus]')][0]; if(b && document.querySelector('#day-1')) {} }")
    # 第 4 步把焦点推到了 Day3，这里用下拉切回 Day2 保证卡片存在
    page.locator('#focusSelect').select_option('1'); page.wait_for_timeout(900)
    d2 = page.locator('#day-1')
    log('5 day2 exists = ' + str(d2.count()))
    if d2.count():
        d2.locator('[data-act="evidence"]').fill('data/quality_report.md')
        d2.locator('[data-act="deviation"]').fill('教程用 akshare，本机字段变了，改用 Tushare pro_bar')
        d2.locator('[data-act="journal"]').fill('第一次拿到真实 A 股数据，停牌日要单独处理')
        d2.locator('[data-act="review"]').fill('2026-11-17')
        page.wait_for_timeout(400)
        log('5 persisted fields = ' + str(page.evaluate("""() => {
          const d=JSON.parse(localStorage.getItem('quant-study-v1')).days['1']||{};
          return [!!d.evidence,!!d.deviation,!!d.journal,d.review].join(',');
        }""")))

    page.evaluate("() => { const b=[...document.querySelectorAll('.tab')].find(x=>x.textContent.includes('掌握度台账')); if(b) b.click(); }")
    page.wait_for_timeout(400)
    log('6 ledger rows = ' + str(page.locator('#view table tbody tr').count()))
    log('6 ledger has filled text = ' + str('Tushare pro_bar' in page.locator('#view').inner_text()))
    try:
        page.locator('[data-act="ledger-edit"][data-i="1"]').first.click(timeout=6000)
        page.wait_for_timeout(350)
        log('6 editor open = ' + str(page.locator('.ledger-editor').count()))
    except Exception as ex:
        log('6 editor click FAILED ' + str(ex)[:150])

    for kind, expect in [('mastery','Tushare pro_bar'), ('deviations','Tushare pro_bar'), ('journal','停牌日')]:
        try:
            with page.expect_download(timeout=8000) as di:
                page.locator('[data-act="export-ledger"][data-k="'+kind+'"]').click()
            dl = di.value
            txt = open(dl.path(), encoding='utf-8').read()
            log('6 export ' + kind + ' = ' + dl.suggested_filename + ' bytes=' + str(len(txt)) + ' hasContent=' + str(expect in txt))
        except Exception as ex:
            log('6 export ' + kind + ' FAILED ' + str(ex)[:120])

    # ---------- 7. 模板数量 ----------
    page.evaluate("() => { const b=[...document.querySelectorAll('.tab')].find(x=>x.textContent.includes('新手起步')); if(b) b.click(); }")
    page.wait_for_timeout(300)
    log('7 templates = ' + str(page.locator('.tmpl-card').count()) +
        ' names=' + str(page.evaluate("() => window.GUIDE_TEMPLATES.map(t=>t.file).join(' | ')")))

    # ---------- 8. 仍可正常切回逐日计划 ----------
    page.evaluate("() => { const b=[...document.querySelectorAll('.tab')].find(x=>x.textContent.includes('逐日计划')); if(b) b.click(); }")
    page.wait_for_timeout(300)
    log('8 days first card = ' + page.evaluate("() => document.querySelector('#dayList .day')?.id || 'NONE'"))

    page.screenshot(path=D + '_v3_ledger.png', full_page=False)
    log('PAGEERRORS = ' + json.dumps(errs, ensure_ascii=False))
    browser.close()

open(D + '_verify_v3_out.txt', 'w', encoding='utf-8').write('\n'.join(OUT))
print('done')
