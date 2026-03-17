// 结果页面模板

interface StyleTheme {
  primary: string
  secondary: string
  accent: string
  bg: string
  bg_card: string
  text: string
  text_muted: string
  gradient: string
  navbar_rgb: string
  font_family: string
}

interface Feature {
  name?: string
  desc?: string
}

interface BusinessLine {
  name?: string
  desc?: string
  clients?: string
}

interface Scenario {
  name?: string
  background?: string
  pain_points?: string[]
  solution?: string
  expected_value?: string
}

interface AIProduct {
  name?: string
  description?: string
  features?: Feature[]
  advantages?: string[]
  cases?: string[]
}

interface PartyA {
  company_name?: string
  overview?: string
  vision?: string
  values?: string
  ai_product?: AIProduct
  tech_team?: string
  partners?: string[]
}

interface PartyB {
  company_name?: string
  overview?: string
  scale?: string
  vision?: string
  business_lines?: BusinessLine[]
  advantages?: string[]
  representative_clients?: string[]
  honors?: string[]
}

interface CooperationModel {
  tech_integration?: string
  data_security?: string
  rd_mechanism?: string
}

interface ExpectedResults {
  efficiency?: string
  cost?: string
  growth?: string
}

interface Roadmap {
  short_term?: string
  mid_term?: string
  long_term?: string
}

interface Cooperation {
  vision?: string
  scenarios?: Scenario[]
  cooperation_model?: CooperationModel
  expected_results?: ExpectedResults
  roadmap?: Roadmap
}

interface TemplateData {
  partyA: PartyA
  partyB: PartyB
  cooperation: Cooperation
  colors: StyleTheme
  fontFamily: string
  generateDate: string
}

// 辅助函数
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function truncate(str: string, len: number): string {
  if (!str) return ''
  return str.length > len ? str.substring(0, len) + '...' : str
}

export function renderResultHtml(data: TemplateData): string {
  const { partyA, partyB, cooperation, colors, fontFamily, generateDate } = data

  const partyAName = partyA.company_name || '甲方'
  const partyBName = partyB.company_name || '乙方'
  const aiProductName = partyA.ai_product?.name || 'AI 产品'

  // 生成功能列表
  const featureItems = (partyA.ai_product?.features || []).slice(0, 4).map(f => `
    <li>
      <div class="feature-icon">⚡</div>
      <div class="feature-content">
        <h4>${escapeHtml(f.name || '功能特性')}</h4>
        <p>${escapeHtml(f.desc || '功能描述')}</p>
      </div>
    </li>
  `).join('')

  // 生成优势列表
  const advantageItems = (partyA.ai_product?.advantages || []).map(adv => `
    <div class="advantage-item">
      <div class="check"></div>
      <span>${escapeHtml(adv)}</span>
    </div>
  `).join('') || `
    <div class="advantage-item"><div class="check"></div><span>技术领先，性能卓越</span></div>
    <div class="advantage-item"><div class="check"></div><span>安全可靠，数据保障</span></div>
    <div class="advantage-item"><div class="check"></div><span>灵活部署，快速集成</span></div>
  `

  // 生成业务板块
  const businessCards = (partyB.business_lines || []).slice(0, 3).map(line => `
    <div class="party-card">
      <div class="party-card-header">
        <div class="party-icon">📊</div>
        <h3>${escapeHtml(line.name || '业务板块')}</h3>
      </div>
      <p class="party-overview">${escapeHtml(line.desc || '业务描述')}</p>
      ${line.clients ? `<div class="party-meta"><div class="party-meta-item">目标客户：${escapeHtml(line.clients)}</div></div>` : ''}
    </div>
  `).join('')

  // 生成场景卡片
  const scenarioCards = (cooperation.scenarios || []).slice(0, 5).map(s => `
    <div class="scenario-card">
      <div class="scenario-header">
        <h4>${escapeHtml(s.name || '应用场景')}</h4>
        <p>${escapeHtml(s.background || '场景背景')}</p>
      </div>
      <div class="scenario-body">
        ${s.pain_points && s.pain_points.length > 0 ? `
        <div class="scenario-pain">
          <h5>痛点分析</h5>
          <ul>
            ${s.pain_points.slice(0, 3).map(p => `<li>${escapeHtml(p)}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        <div class="scenario-solution">
          <h5>AI 解决方案</h5>
          <p>${escapeHtml(s.solution || '智能化解决方案')}</p>
        </div>
        ${s.expected_value ? `<div class="scenario-value">📈 ${escapeHtml(s.expected_value)}</div>` : ''}
      </div>
    </div>
  `).join('')

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(partyAName)} × ${escapeHtml(partyBName)} 战略合作</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${colors.primary};
      --secondary: ${colors.secondary};
      --accent: ${colors.accent};
      --bg: ${colors.bg};
      --bg-card: ${colors.bg_card};
      --text: ${colors.text};
      --text-muted: ${colors.text_muted};
      --gradient: ${colors.gradient};
      --navbar-rgb: ${colors.navbar_rgb};
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    html { scroll-behavior: smooth; }

    body {
      font-family: "${fontFamily.split(':')[0]}", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.7;
    }

    /* Navbar */
    .navbar {
      position: fixed; top: 0; left: 0; right: 0;
      background: rgba(var(--navbar-rgb), 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      padding: 16px 40px;
      display: flex; justify-content: space-between; align-items: center;
      z-index: 1000;
      box-shadow: 0 2px 20px rgba(0,0,0,0.08);
    }
    .navbar-brand {
      font-weight: 700;
      font-size: 18px;
      color: var(--bg-card);
      display: flex; align-items: center; gap: 10px;
    }
    .navbar-brand .dot {
      width: 8px; height: 8px; background: var(--accent);
      border-radius: 50%;
    }
    .navbar-nav {
      display: flex; gap: 32px;
      list-style: none;
    }
    .navbar-nav a {
      color: rgba(255,255,255,0.85);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.2s;
    }
    .navbar-nav a:hover { color: #fff; }

    /* Hero Section */
    .hero {
      min-height: 100vh;
      display: flex; flex-direction: column;
      justify-content: center; align-items: center;
      text-align: center;
      padding: 120px 24px 80px;
      background: var(--gradient);
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute; inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      opacity: 0.6;
    }
    .hero-content { position: relative; z-index: 1; max-width: 900px; }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 999px;
      padding: 8px 20px;
      font-size: 13px;
      font-weight: 500;
      color: #fff;
      margin-bottom: 32px;
    }
    .hero h1 {
      font-size: clamp(2.2rem, 5vw, 3.6rem);
      font-weight: 800;
      color: #fff;
      line-height: 1.2;
      margin-bottom: 24px;
    }
    .hero h1 .highlight {
      display: block;
      font-size: 0.5em;
      font-weight: 500;
      opacity: 0.9;
      margin-top: 8px;
    }
    .hero p {
      font-size: 18px;
      color: rgba(255,255,255,0.9);
      max-width: 600px;
      margin: 0 auto 40px;
    }
    .hero-companies {
      display: flex; justify-content: center; align-items: center; gap: 20px;
      flex-wrap: wrap;
    }
    .hero-company {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 12px;
      padding: 16px 28px;
      color: #fff;
      font-weight: 600;
      font-size: 15px;
    }
    .hero-company span {
      display: block;
      font-size: 11px;
      font-weight: 400;
      opacity: 0.7;
      margin-bottom: 4px;
    }

    /* Section Base */
    .section {
      padding: 80px 24px;
    }
    .section-alt { background: var(--bg-card); }
    .container {
      max-width: 1100px;
      margin: 0 auto;
    }
    .section-header {
      text-align: center;
      margin-bottom: 56px;
    }
    .section-label {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 12px;
    }
    .section-title {
      font-size: clamp(1.6rem, 4vw, 2.2rem);
      font-weight: 700;
      color: var(--primary);
    }

    /* Party Cards */
    .party-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 32px;
    }
    .party-card {
      background: var(--bg-card);
      border-radius: 20px;
      padding: 36px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
      border: 1px solid rgba(0,0,0,0.05);
    }
    .party-card-header {
      display: flex; align-items: center; gap: 14px;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(0,0,0,0.08);
    }
    .party-icon {
      width: 52px; height: 52px;
      background: var(--gradient);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px;
    }
    .party-card h3 {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--primary);
    }
    .party-card h3 small {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-muted);
      margin-top: 4px;
    }
    .party-overview {
      color: var(--text);
      font-size: 15px;
      margin-bottom: 24px;
    }
    .party-meta {
      display: flex; flex-wrap: wrap; gap: 12px;
    }
    .party-meta-item {
      background: rgba(var(--navbar-rgb), 0.08);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      color: var(--primary);
      font-weight: 500;
    }

    /* AI Product */
    .ai-section {
      background: linear-gradient(180deg, var(--bg) 0%, var(--bg-card) 100%);
    }
    .product-showcase {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      align-items: start;
    }
    @media (max-width: 768px) {
      .product-showcase { grid-template-columns: 1fr; }
    }
    .product-info h3 {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 16px;
    }
    .product-info p {
      color: var(--text);
      font-size: 15px;
      margin-bottom: 24px;
    }
    .feature-list {
      list-style: none;
    }
    .feature-list li {
      display: flex; gap: 14px;
      padding: 16px 0;
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }
    .feature-list li:last-child { border-bottom: none; }
    .feature-icon {
      width: 40px; height: 40px;
      background: var(--gradient);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      font-size: 18px;
    }
    .feature-content h4 {
      font-size: 15px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 4px;
    }
    .feature-content p {
      font-size: 13px;
      color: var(--text-muted);
      margin: 0;
    }

    .advantages-card {
      background: var(--bg-card);
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
    }
    .advantages-card h4 {
      font-size: 14px;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 20px;
      display: flex; align-items: center; gap: 8px;
    }
    .advantage-item {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 12px 0;
    }
    .advantage-item .check {
      width: 20px; height: 20px;
      background: var(--accent);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .advantage-item .check::after {
      content: '✓';
      color: #fff;
      font-size: 12px;
      font-weight: 700;
    }
    .advantage-item span {
      font-size: 14px;
      color: var(--text);
    }

    /* Scenarios */
    .scenarios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 24px;
    }
    .scenario-card {
      background: var(--bg-card);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border: 1px solid rgba(0,0,0,0.05);
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .scenario-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.1);
    }
    .scenario-header {
      background: var(--gradient);
      padding: 24px;
      color: #fff;
    }
    .scenario-header h4 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .scenario-header p {
      font-size: 13px;
      opacity: 0.85;
    }
    .scenario-body {
      padding: 24px;
    }
    .scenario-pain {
      margin-bottom: 16px;
    }
    .scenario-pain h5 {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .scenario-pain ul {
      list-style: none;
      font-size: 13px;
      color: var(--text);
    }
    .scenario-pain li {
      padding: 4px 0;
      padding-left: 16px;
      position: relative;
    }
    .scenario-pain li::before {
      content: '•';
      position: absolute; left: 0;
      color: var(--accent);
    }
    .scenario-solution {
      background: rgba(var(--navbar-rgb), 0.05);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .scenario-solution h5 {
      font-size: 12px;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 8px;
    }
    .scenario-solution p {
      font-size: 13px;
      color: var(--text);
      margin: 0;
    }
    .scenario-value {
      display: inline-flex; align-items: center; gap: 6px;
      background: linear-gradient(135deg, var(--accent), var(--secondary));
      color: #fff;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
    }

    /* Cooperation Model */
    .model-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    @media (max-width: 768px) {
      .model-grid { grid-template-columns: 1fr; }
    }
    .model-card {
      background: var(--bg-card);
      border-radius: 16px;
      padding: 28px;
      text-align: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.05);
      border: 1px solid rgba(0,0,0,0.05);
    }
    .model-icon {
      width: 56px; height: 56px;
      background: var(--gradient);
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 20px;
      font-size: 26px;
    }
    .model-card h4 {
      font-size: 15px;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 12px;
    }
    .model-card p {
      font-size: 13px;
      color: var(--text-muted);
      margin: 0;
    }

    /* Results */
    .results-banner {
      background: var(--gradient);
      border-radius: 24px;
      padding: 48px;
      text-align: center;
      color: #fff;
    }
    .results-banner h3 {
      font-size: 1.4rem;
      font-weight: 700;
      margin-bottom: 32px;
    }
    .results-metrics {
      display: flex;
      justify-content: center;
      gap: 48px;
      flex-wrap: wrap;
    }
    .metric-item {
      text-align: center;
    }
    .metric-value {
      font-size: 2.4rem;
      font-weight: 800;
      margin-bottom: 8px;
    }
    .metric-label {
      font-size: 13px;
      opacity: 0.85;
    }

    /* Roadmap */
    .roadmap {
      display: flex;
      justify-content: space-between;
      position: relative;
      padding: 0 20px;
    }
    .roadmap::before {
      content: '';
      position: absolute;
      top: 30px;
      left: 60px;
      right: 60px;
      height: 3px;
      background: linear-gradient(90deg, var(--accent), var(--primary), var(--secondary));
      border-radius: 2px;
    }
    @media (max-width: 768px) {
      .roadmap { flex-direction: column; gap: 24px; }
      .roadmap::before { display: none; }
    }
    .roadmap-item {
      flex: 1;
      text-align: center;
      position: relative;
    }
    .roadmap-dot {
      width: 60px; height: 60px;
      background: var(--bg-card);
      border: 4px solid var(--primary);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 20px;
      font-size: 24px;
      position: relative;
      z-index: 1;
    }
    .roadmap-item h4 {
      font-size: 15px;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 8px;
    }
    .roadmap-item p {
      font-size: 13px;
      color: var(--text-muted);
      max-width: 200px;
      margin: 0 auto;
    }

    /* Footer */
    .footer {
      background: var(--primary);
      color: rgba(255,255,255,0.9);
      padding: 48px 24px;
      text-align: center;
    }
    .footer p {
      font-size: 14px;
      margin-bottom: 8px;
    }
    .footer .date {
      font-size: 12px;
      opacity: 0.7;
    }

    /* Utilities */
    .text-center { text-align: center; }
    .mt-4 { margin-top: 32px; }
    .mb-4 { margin-bottom: 32px; }

    @media (max-width: 600px) {
      .navbar { padding: 12px 20px; }
      .navbar-nav { display: none; }
      .section { padding: 60px 16px; }
      .hero { padding: 100px 16px 60px; }
      .party-card { padding: 24px; }
      .results-banner { padding: 32px 20px; }
      .results-metrics { gap: 24px; }
      .metric-value { font-size: 1.8rem; }
    }
  </style>
</head>
<body>

  <!-- Navbar -->
  <nav class="navbar">
    <div class="navbar-brand">
      <span class="dot"></span>
      ${escapeHtml(partyAName)} × ${escapeHtml(partyBName)}
    </div>
    <ul class="navbar-nav">
      <li><a href="#about">关于双方</a></li>
      <li><a href="#product">AI 产品</a></li>
      <li><a href="#scenarios">合作场景</a></li>
      <li><a href="#roadmap">合作路线</a></li>
    </ul>
  </nav>

  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content">
      <div class="hero-badge">战略合作</div>
      <h1>
        ${escapeHtml(partyAName)} × ${escapeHtml(partyBName)}
        <span class="highlight">AI 赋能 · 智创未来</span>
      </h1>
      <p>${escapeHtml(cooperation.vision || '携手共创，以人工智能技术驱动业务创新，实现互利共赢的战略合作。')}</p>
      <div class="hero-companies">
        <div class="hero-company">
          <span>AI 技术提供方</span>
          ${escapeHtml(partyAName)}
        </div>
        <div class="hero-company">
          <span>行业合作伙伴</span>
          ${escapeHtml(partyBName)}
        </div>
      </div>
    </div>
  </section>

  <!-- About Section -->
  <section class="section section-alt" id="about">
    <div class="container">
      <div class="section-header">
        <div class="section-label">About Partners</div>
        <h2 class="section-title">关于合作双方</h2>
      </div>

      <div class="party-grid">
        <!-- Party A -->
        <div class="party-card">
          <div class="party-card-header">
            <div class="party-icon">🤖</div>
            <h3>
              ${escapeHtml(partyAName)}
              <small>AI 技术提供方</small>
            </h3>
          </div>
          <p class="party-overview">${escapeHtml(partyA.overview || '企业概况信息')}</p>
          ${partyA.vision ? `<div class="party-meta"><div class="party-meta-item">愿景：${escapeHtml(truncate(partyA.vision, 50))}</div></div>` : ''}
        </div>

        <!-- Party B -->
        <div class="party-card">
          <div class="party-card-header">
            <div class="party-icon">🏢</div>
            <h3>
              ${escapeHtml(partyBName)}
              <small>行业合作伙伴</small>
            </h3>
          </div>
          <p class="party-overview">${escapeHtml(partyB.overview || '企业概况信息')}</p>
          ${partyB.scale ? `<div class="party-meta"><div class="party-meta-item">规模：${escapeHtml(partyB.scale)}</div></div>` : ''}
        </div>
      </div>
    </div>
  </section>

  <!-- AI Product Section -->
  <section class="section ai-section" id="product">
    <div class="container">
      <div class="section-header">
        <div class="section-label">AI Product</div>
        <h2 class="section-title">${escapeHtml(aiProductName)}</h2>
      </div>

      <div class="product-showcase">
        <div class="product-info">
          <h3>${escapeHtml(aiProductName)}</h3>
          <p>${escapeHtml(partyA.ai_product?.description || '先进的 AI 技术产品，为企业提供智能化解决方案。')}</p>

          ${featureItems ? `<ul class="feature-list">${featureItems}</ul>` : ''}
        </div>

        <div class="advantages-card">
          <h4>🎯 核心优势</h4>
          ${advantageItems}

          ${partyA.tech_team ? `
          <div class="mt-4" style="padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.08);">
            <h4 style="margin-bottom: 12px;">👨‍💻 研发团队</h4>
            <p style="font-size: 13px; color: var(--text-muted); margin: 0;">${escapeHtml(partyA.tech_team)}</p>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  </section>

  ${businessCards ? `
  <!-- Party B Business -->
  <section class="section section-alt">
    <div class="container">
      <div class="section-header">
        <div class="section-label">Business</div>
        <h2 class="section-title">${escapeHtml(partyBName)} 业务板块</h2>
      </div>

      <div class="party-grid">
        ${businessCards}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Scenarios Section -->
  <section class="section" id="scenarios">
    <div class="container">
      <div class="section-header">
        <div class="section-label">Cooperation</div>
        <h2 class="section-title">AI 合作应用场景</h2>
      </div>

      <div class="scenarios-grid">
        ${scenarioCards}
      </div>
    </div>
  </section>

  ${cooperation.cooperation_model ? `
  <!-- Cooperation Model -->
  <section class="section section-alt">
    <div class="container">
      <div class="section-header">
        <div class="section-label">Model</div>
        <h2 class="section-title">合作模式</h2>
      </div>

      <div class="model-grid">
        <div class="model-card">
          <div class="model-icon">🔗</div>
          <h4>技术对接</h4>
          <p>${escapeHtml(cooperation.cooperation_model.tech_integration || 'API 对接 / 私有化部署')}</p>
        </div>
        <div class="model-card">
          <div class="model-icon">🔒</div>
          <h4>数据安全</h4>
          <p>${escapeHtml(cooperation.cooperation_model.data_security || '加密传输 / 数据脱敏 / 合规保障')}</p>
        </div>
        <div class="model-card">
          <div class="model-icon">🤝</div>
          <h4>联合研发</h4>
          <p>${escapeHtml(cooperation.cooperation_model.rd_mechanism || '协同开发 / 敏捷迭代')}</p>
        </div>
      </div>
    </div>
  </section>
  ` : ''}

  ${cooperation.expected_results ? `
  <!-- Expected Results -->
  <section class="section">
    <div class="container">
      <div class="results-banner">
        <h3>预期合作成果</h3>
        <div class="results-metrics">
          ${cooperation.expected_results.efficiency ? `
          <div class="metric-item">
            <div class="metric-value">${escapeHtml(cooperation.expected_results.efficiency)}</div>
            <div class="metric-label">效率提升</div>
          </div>
          ` : ''}
          ${cooperation.expected_results.cost ? `
          <div class="metric-item">
            <div class="metric-value">${escapeHtml(cooperation.expected_results.cost)}</div>
            <div class="metric-label">成本优化</div>
          </div>
          ` : ''}
          ${cooperation.expected_results.growth ? `
          <div class="metric-item">
            <div class="metric-value">${escapeHtml(cooperation.expected_results.growth)}</div>
            <div class="metric-label">业务增长</div>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  </section>
  ` : ''}

  ${cooperation.roadmap ? `
  <!-- Roadmap -->
  <section class="section section-alt" id="roadmap">
    <div class="container">
      <div class="section-header">
        <div class="section-label">Roadmap</div>
        <h2 class="section-title">合作路线图</h2>
      </div>

      <div class="roadmap">
        <div class="roadmap-item">
          <div class="roadmap-dot">🚀</div>
          <h4>短期目标</h4>
          <p>${escapeHtml(cooperation.roadmap.short_term || '1-3个月：完成技术对接与试点上线')}</p>
        </div>
        <div class="roadmap-item">
          <div class="roadmap-dot">📈</div>
          <h4>中期目标</h4>
          <p>${escapeHtml(cooperation.roadmap.mid_term || '3-6个月：规模化推广与效果验证')}</p>
        </div>
        <div class="roadmap-item">
          <div class="roadmap-dot">🎯</div>
          <h4>长期愿景</h4>
          <p>${escapeHtml(cooperation.roadmap.long_term || '1年以上：深度合作与生态共建')}</p>
        </div>
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Footer -->
  <footer class="footer">
    <p>${escapeHtml(partyAName)} × ${escapeHtml(partyBName)} 战略合作</p>
    <p class="date">本页面由 AI 自动生成 · ${escapeHtml(generateDate)}</p>
  </footer>

</body>
</html>`
}
