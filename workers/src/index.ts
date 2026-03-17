import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

// 类型定义
interface Env {
  DEEPSEEK_API_KEY?: string
  ZHIPU_API_KEY?: string
}

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

interface GenerateRequest {
  party_a_name: string
  party_a_ai: string
  party_b_name: string
  api_key?: string
  provider?: string
}

// 视觉风格主题
const STYLE_THEMES: Record<string, StyleTheme> = {
  business: {
    primary: "#1a2a4a",
    secondary: "#2c3e50",
    accent: "#d4af37",
    bg: "#f8f9fa",
    bg_card: "#ffffff",
    text: "#1a1a2e",
    text_muted: "#6c757d",
    gradient: "linear-gradient(135deg, #1a2a4a 0%, #2c3e50 50%, #1a2a4a 100%)",
    navbar_rgb: "26, 42, 74",
    font_family: "Playfair Display:wght@400;600;700"
  },
  tech: {
    primary: "#6c63ff",
    secondary: "#00d4aa",
    accent: "#ff6b6b",
    bg: "#0a0a1a",
    bg_card: "#12122a",
    text: "#f0f0f5",
    text_muted: "#8b8ba3",
    gradient: "linear-gradient(135deg, #6c63ff 0%, #00d4aa 100%)",
    navbar_rgb: "10, 10, 26",
    font_family: "Space Grotesk:wght@400;500;700"
  },
  medical: {
    primary: "#00b894",
    secondary: "#0984e3",
    accent: "#74b9ff",
    bg: "#f8fffe",
    bg_card: "#ffffff",
    text: "#2d3436",
    text_muted: "#636e72",
    gradient: "linear-gradient(135deg, #00b894 0%, #0984e3 100%)",
    navbar_rgb: "255, 255, 255",
    font_family: "Nunito:wght@400;600;700"
  },
  education: {
    primary: "#ff6b6b",
    secondary: "#4ecdc4",
    accent: "#ffe66d",
    bg: "#fffaf5",
    bg_card: "#ffffff",
    text: "#2d3436",
    text_muted: "#636e72",
    gradient: "linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #ffe66d 100%)",
    navbar_rgb: "255, 107, 107",
    font_family: "Poppins:wght@400;500;600;700"
  },
  industrial: {
    primary: "#ff6b35",
    secondary: "#1a1a1a",
    accent: "#8b4513",
    bg: "#1a1a1a",
    bg_card: "#2d2d2d",
    text: "#f5f5f5",
    text_muted: "#a0a0a0",
    gradient: "linear-gradient(135deg, #ff6b35 0%, #8b4513 100%)",
    navbar_rgb: "26, 26, 26",
    font_family: "Oswald:wght@400;500;700"
  },
  retail: {
    primary: "#e17055",
    secondary: "#2d3436",
    accent: "#fdcb6e",
    bg: "#faf9f7",
    bg_card: "#ffffff",
    text: "#2d3436",
    text_muted: "#636e72",
    gradient: "linear-gradient(135deg, #e17055 0%, #fdcb6e 100%)",
    navbar_rgb: "225, 112, 85",
    font_family: "Montserrat:wght@400;500;600;700"
  },
  generic: {
    primary: "#6c5ce7",
    secondary: "#0984e3",
    accent: "#00b894",
    bg: "#f5f6fa",
    bg_card: "#ffffff",
    text: "#2d3436",
    text_muted: "#636e72",
    gradient: "linear-gradient(135deg, #6c5ce7 0%, #0984e3 100%)",
    navbar_rgb: "108, 92, 231",
    font_family: "Inter:wght@400;500;600;700"
  }
}

function getStyleTheme(visualStyle: string): StyleTheme {
  return STYLE_THEMES[visualStyle] || STYLE_THEMES["generic"]
}

// Prompt 模板
const OUTLINE_SYSTEM_PROMPT = `你是一位资深商业分析师，擅长为企业合作撰写专业的介绍材料。
你需要根据企业信息，生成详实、专业、有说服力的内容大纲。
输出必须是严格的JSON格式，不要有任何额外文字或markdown代码块标记。

重要要求：
1. 所有描述必须详实具体，避免空洞的表述
2. 合作场景要结合乙方行业特点，给出切实可行的AI应用方案
3. 预期效果要包含量化指标（如提升xx%、降低xx%等）
4. 禁止使用"Lorem ipsum"等占位符`

function buildOutlinePrompt(partyAName: string, partyAAI: string, partyBName: string): string {
  return `请为以下企业合作生成详细的内容大纲，以JSON格式输出：

【甲方】${partyAName}
【甲方AI产品】${partyAAI}
【乙方】${partyBName}

请根据乙方公司名称推断其所属行业，生成以下JSON结构：

{
  "industry_type": "行业类型（如：教育、金融、医疗、制造、零售等）",
  "visual_style": "根据行业选择：education/business/medical/industrial/retail/tech/generic 之一",
  "party_a": {
    "company_name": "${partyAName}",
    "overview": "企业概况（100字以上，包含成立背景、发展历程、核心业务、市场地位）",
    "vision": "企业愿景与使命（50字以上）",
    "values": "核心价值观（3-4个关键词及简要解释）",
    "ai_product": {
      "name": "${partyAAI}",
      "description": "产品整体介绍（80字以上，说明技术原理和核心能力）",
      "features": [
        {"name": "核心功能1", "desc": "功能详述（40字以上，说明功能原理和应用场景）"},
        {"name": "核心功能2", "desc": "功能详述（40字以上）"},
        {"name": "核心功能3", "desc": "功能详述（40字以上）"},
        {"name": "核心功能4", "desc": "功能详述（40字以上）"}
      ],
      "advantages": ["技术优势1（具体说明）", "技术优势2（具体说明）", "技术优势3（具体说明）"],
      "cases": ["成功案例1（具体行业和效果）", "成功案例2（具体行业和效果）"]
    },
    "tech_team": "研发团队介绍（50字以上，规模、背景、技术实力）",
    "partners": ["合作伙伴1", "合作伙伴2", "合作伙伴3"]
  },
  "party_b": {
    "company_name": "${partyBName}",
    "overview": "企业概况（100字以上，包含成立时间、发展历程、规模、行业地位）",
    "scale": "企业规模（员工数、分支机构、业务覆盖范围等具体数据）",
    "vision": "企业愿景与战略目标（50字以上）",
    "business_lines": [
      {"name": "业务板块1", "desc": "业务详述（50字以上，说明服务内容、市场规模）", "clients": "目标客户群体"},
      {"name": "业务板块2", "desc": "业务详述（50字以上）", "clients": "目标客户群体"},
      {"name": "业务板块3", "desc": "业务详述（50字以上）", "clients": "目标客户群体"}
    ],
    "advantages": ["核心优势1（具体说明）", "核心优势2（具体说明）", "核心优势3（具体说明）"],
    "representative_clients": ["代表客户1", "代表客户2", "代表客户3"],
    "honors": ["荣誉奖项1", "荣誉奖项2"]
  },
  "cooperation": {
    "vision": "合作愿景（双方合作的战略意义，50字以上）",
    "scenarios": [
      {
        "name": "场景1：智能客服升级",
        "background": "场景背景（当前业务现状和挑战）",
        "pain_points": ["具体痛点1", "具体痛点2"],
        "solution": "AI解决方案详述（80字以上，具体说明技术实现和应用方式）",
        "expected_value": "预期效果（包含量化指标，如：响应速度提升50%，人工成本降低30%）"
      },
      {
        "name": "场景2：智能内容生成",
        "background": "场景背景",
        "pain_points": ["具体痛点1", "具体痛点2"],
        "solution": "AI解决方案详述（80字以上）",
        "expected_value": "预期效果（包含量化指标）"
      },
      {
        "name": "场景3：智能数据分析",
        "background": "场景背景",
        "pain_points": ["具体痛点1", "具体痛点2"],
        "solution": "AI解决方案详述（80字以上）",
        "expected_value": "预期效果（包含量化指标）"
      },
      {
        "name": "场景4：智能运营优化",
        "background": "场景背景",
        "pain_points": ["具体痛点1", "具体痛点2"],
        "solution": "AI解决方案详述（80字以上）",
        "expected_value": "预期效果（包含量化指标）"
      },
      {
        "name": "场景5：智能决策支持",
        "background": "场景背景",
        "pain_points": ["具体痛点1", "具体痛点2"],
        "solution": "AI解决方案详述（80字以上）",
        "expected_value": "预期效果（包含量化指标）"
      }
    ],
    "cooperation_model": {
      "tech_integration": "技术对接方式（API对接/私有化部署/混合模式等，30字以上）",
      "data_security": "数据安全措施（加密、脱敏、合规等，30字以上）",
      "rd_mechanism": "联合研发机制（团队协作、迭代计划等，30字以上）"
    },
    "expected_results": {
      "efficiency": "效率提升XX%",
      "cost": "成本降低XX%",
      "growth": "业务增长XX%"
    },
    "roadmap": {
      "short_term": "短期目标（1-3个月，具体里程碑）",
      "mid_term": "中期目标（3-6个月，具体里程碑）",
      "long_term": "长期愿景（1年以上，具体目标）"
    }
  }
}

【关键要求】
1. visual_style 必须根据乙方行业选择正确的值
2. 所有描述必须结合乙方行业特点，体现专业性
3. 合作场景必须切实可行，符合乙方业务需求
4. 预期效果必须包含量化指标

请直接输出JSON，不要有任何其他文字。`
}

// API 客户端配置
function getClientConfig(provider: string, apiKey: string) {
  if (provider === "zhipu") {
    return {
      baseUrl: "https://open.bigmodel.cn/api/paas/v4/",
      model: "glm-4-flash"
    }
  }
  return {
    baseUrl: "https://api.deepseek.com",
    model: "deepseek-chat"
  }
}

// 调用 AI API
async function callAI(
  provider: string,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const config = getClientConfig(provider, apiKey)

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 6000
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API 调用失败: ${response.status} - ${errorText}`)
  }

  const data = await response.json() as any
  return data.choices[0].message.content.trim()
}

// 生成日期
function getGenerateDate(): string {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
}

// 创建 Hono 应用
const app = new Hono<{ Bindings: Env }>()

// 中间件
app.use('*', logger())
app.use('*', cors())

// 首页
app.get('/', async (c) => {
  return c.html(getIndexHtml())
})

// 生成接口
app.post('/generate', async (c) => {
  try {
    const data = await c.req.json<GenerateRequest>()

    const partyAName = data.party_a_name?.trim() || ''
    const partyAAI = data.party_a_ai?.trim() || ''
    const partyBName = data.party_b_name?.trim() || ''
    const provider = data.provider?.trim() || 'deepseek'

    if (!partyAName || !partyAAI || !partyBName) {
      return c.json({ error: '请填写所有必填字段' }, 400)
    }

    let apiKey = data.api_key?.trim() || ''
    if (!apiKey) {
      const envKey = provider === 'zhipu' ? c.env.ZHIPU_API_KEY : c.env.DEEPSEEK_API_KEY
      apiKey = envKey || ''
    }

    if (!apiKey) {
      const providerName = provider === 'zhipu' ? '智谱' : 'DeepSeek'
      return c.json({ error: `请提供 ${providerName} API Key` }, 400)
    }

    // 调用 AI 生成内容大纲
    const outlineText = await callAI(
      provider,
      apiKey,
      OUTLINE_SYSTEM_PROMPT,
      buildOutlinePrompt(partyAName, partyAAI, partyBName)
    )

    // 清理可能的 markdown 代码块标记
    let cleanedText = outlineText
    if (cleanedText.startsWith('```')) {
      const lines = cleanedText.split('\n')
      cleanedText = lines[lines.length - 1].trim() === '```'
        ? lines.slice(1, -1).join('\n')
        : lines.slice(1).join('\n')
    }

    // 解析 JSON
    let outlineJson: any
    try {
      outlineJson = JSON.parse(cleanedText)
    } catch (e) {
      return c.json({ error: '内容生成失败，请重试：JSON解析错误' }, 500)
    }

    // 获取视觉风格
    const visualStyle = outlineJson.visual_style || 'generic'
    const colors = getStyleTheme(visualStyle)

    // 生成文件名
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)
    const randomSuffix = Math.random().toString(36).slice(2, 8)
    const filename = `collab_${partyBName}_${timestamp}_${randomSuffix}.html`

    // 渲染 HTML
    const htmlContent = renderResultHtml({
      partyA: outlineJson.party_a || {},
      partyB: outlineJson.party_b || {},
      cooperation: outlineJson.cooperation || {},
      colors,
      fontFamily: colors.font_family,
      generateDate: getGenerateDate()
    })

    return c.json({
      html: htmlContent,
      filename
    })

  } catch (error) {
    console.error('Generate error:', error)
    return c.json({ error: `生成失败：${error instanceof Error ? error.message : String(error)}` }, 500)
  }
})

// 导出
export default app

// 导入模板函数
import { getIndexHtml } from './templates/index'
import { renderResultHtml } from './templates/result'
