import os
import re
import json
import uuid
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_file
from openai import OpenAI

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-please-change-in-production')

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'output')
os.makedirs(OUTPUT_DIR, exist_ok=True)


# ── API Client ───────────────────────────────────────────────────────────────
def get_client(provider="deepseek", api_key=None):
    """获取AI客户端，支持DeepSeek和智谱API"""
    if provider == "zhipu":
        key = api_key or os.environ.get("ZHIPU_API_KEY", "")
        return OpenAI(api_key=key, base_url="https://open.bigmodel.cn/api/paas/v4/"), "glm-4-flash"
    else:  # deepseek
        key = api_key or os.environ.get("DEEPSEEK_API_KEY", "")
        return OpenAI(api_key=key, base_url="https://api.deepseek.com"), "deepseek-chat"


# ── 视觉风格主题 ─────────────────────────────────────────────────────────────
STYLE_THEMES = {
    "business": {
        "primary": "#1a2a4a",
        "secondary": "#2c3e50",
        "accent": "#d4af37",
        "bg": "#f8f9fa",
        "bg_card": "#ffffff",
        "text": "#1a1a2e",
        "text_muted": "#6c757d",
        "gradient": "linear-gradient(135deg, #1a2a4a 0%, #2c3e50 50%, #1a2a4a 100%)",
        "navbar_rgb": "26, 42, 74",
        "font_family": "Playfair Display:wght@400;600;700"
    },
    "tech": {
        "primary": "#6c63ff",
        "secondary": "#00d4aa",
        "accent": "#ff6b6b",
        "bg": "#0a0a1a",
        "bg_card": "#12122a",
        "text": "#f0f0f5",
        "text_muted": "#8b8ba3",
        "gradient": "linear-gradient(135deg, #6c63ff 0%, #00d4aa 100%)",
        "navbar_rgb": "10, 10, 26",
        "font_family": "Space Grotesk:wght@400;500;700"
    },
    "medical": {
        "primary": "#00b894",
        "secondary": "#0984e3",
        "accent": "#74b9ff",
        "bg": "#f8fffe",
        "bg_card": "#ffffff",
        "text": "#2d3436",
        "text_muted": "#636e72",
        "gradient": "linear-gradient(135deg, #00b894 0%, #0984e3 100%)",
        "navbar_rgb": "255, 255, 255",
        "font_family": "Nunito:wght@400;600;700"
    },
    "education": {
        "primary": "#ff6b6b",
        "secondary": "#4ecdc4",
        "accent": "#ffe66d",
        "bg": "#fffaf5",
        "bg_card": "#ffffff",
        "text": "#2d3436",
        "text_muted": "#636e72",
        "gradient": "linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #ffe66d 100%)",
        "navbar_rgb": "255, 107, 107",
        "font_family": "Poppins:wght@400;500;600;700"
    },
    "industrial": {
        "primary": "#ff6b35",
        "secondary": "#1a1a1a",
        "accent": "#8b4513",
        "bg": "#1a1a1a",
        "bg_card": "#2d2d2d",
        "text": "#f5f5f5",
        "text_muted": "#a0a0a0",
        "gradient": "linear-gradient(135deg, #ff6b35 0%, #8b4513 100%)",
        "navbar_rgb": "26, 26, 26",
        "font_family": "Oswald:wght@400;500;700"
    },
    "retail": {
        "primary": "#e17055",
        "secondary": "#2d3436",
        "accent": "#fdcb6e",
        "bg": "#faf9f7",
        "bg_card": "#ffffff",
        "text": "#2d3436",
        "text_muted": "#636e72",
        "gradient": "linear-gradient(135deg, #e17055 0%, #fdcb6e 100%)",
        "navbar_rgb": "225, 112, 85",
        "font_family": "Montserrat:wght@400;500;600;700"
    },
    "generic": {
        "primary": "#6c5ce7",
        "secondary": "#0984e3",
        "accent": "#00b894",
        "bg": "#f5f6fa",
        "bg_card": "#ffffff",
        "text": "#2d3436",
        "text_muted": "#636e72",
        "gradient": "linear-gradient(135deg, #6c5ce7 0%, #0984e3 100%)",
        "navbar_rgb": "108, 92, 231",
        "font_family": "Inter:wght@400;500;600;700"
    }
}


def get_style_theme(visual_style):
    """根据视觉风格获取颜色主题"""
    return STYLE_THEMES.get(visual_style, STYLE_THEMES["generic"])


# ── Prompt Templates ─────────────────────────────────────────────────────────
OUTLINE_SYSTEM_PROMPT = """你是一位资深商业分析师，擅长为企业合作撰写专业的介绍材料。
你需要根据企业信息，生成详实、专业、有说服力的内容大纲。
输出必须是严格的JSON格式，不要有任何额外文字或markdown代码块标记。

重要要求：
1. 所有描述必须详实具体，避免空洞的表述
2. 合作场景要结合乙方行业特点，给出切实可行的AI应用方案
3. 预期效果要包含量化指标（如提升xx%、降低xx%等）
4. 禁止使用"Lorem ipsum"等占位符"""


def build_outline_prompt(party_a_name, party_a_ai, party_b_name):
    return f"""请为以下企业合作生成详细的内容大纲，以JSON格式输出：

【甲方】{party_a_name}
【甲方AI产品】{party_a_ai}
【乙方】{party_b_name}

请根据乙方公司名称推断其所属行业，生成以下JSON结构：

{{
  "industry_type": "行业类型（如：教育、金融、医疗、制造、零售等）",
  "visual_style": "根据行业选择：education/business/medical/industrial/retail/tech/generic 之一",
  "party_a": {{
    "company_name": "{party_a_name}",
    "overview": "企业概况（100字以上，包含成立背景、发展历程、核心业务、市场地位）",
    "vision": "企业愿景与使命（50字以上）",
    "values": "核心价值观（3-4个关键词及简要解释）",
    "ai_product": {{
      "name": "{party_a_ai}",
      "description": "产品整体介绍（80字以上，说明技术原理和核心能力）",
      "features": [
        {{"name": "核心功能1", "desc": "功能详述（40字以上，说明功能原理和应用场景）"}},
        {{"name": "核心功能2", "desc": "功能详述（40字以上）"}},
        {{"name": "核心功能3", "desc": "功能详述（40字以上）"}},
        {{"name": "核心功能4", "desc": "功能详述（40字以上）"}}
      ],
      "advantages": ["技术优势1（具体说明）", "技术优势2（具体说明）", "技术优势3（具体说明）"],
      "cases": ["成功案例1（具体行业和效果）", "成功案例2（具体行业和效果）"]
    }},
    "tech_team": "研发团队介绍（50字以上，规模、背景、技术实力）",
    "partners": ["合作伙伴1", "合作伙伴2", "合作伙伴3"]
  }},
  "party_b": {{
    "company_name": "{party_b_name}",
    "overview": "企业概况（100字以上，包含成立时间、发展历程、规模、行业地位）",
    "scale": "企业规模（员工数、分支机构、业务覆盖范围等具体数据）",
    "vision": "企业愿景与战略目标（50字以上）",
    "business_lines": [
      {{"name": "业务板块1", "desc": "业务详述（50字以上，说明服务内容、市场规模）", "clients": "目标客户群体"}},
      {{"name": "业务板块2", "desc": "业务详述（50字以上）", "clients": "目标客户群体"}},
      {{"name": "业务板块3", "desc": "业务详述（50字以上）", "clients": "目标客户群体"}}
    ],
    "advantages": ["核心优势1（具体说明）", "核心优势2（具体说明）", "核心优势3（具体说明）"],
    "representative_clients": ["代表客户1", "代表客户2", "代表客户3"],
    "honors": ["荣誉奖项1", "荣誉奖项2"]
  }},
  "cooperation": {{
    "vision": "合作愿景（双方合作的战略意义，50字以上）",
    "scenarios": [
      {{
        "name": "场景1：智能客服升级",
        "background": "场景背景（当前业务现状和挑战）",
        "pain_points": ["具体痛点1", "具体痛点2"],
        "solution": "AI解决方案详述（80字以上，具体说明技术实现和应用方式）",
        "expected_value": "预期效果（包含量化指标，如：响应速度提升50%，人工成本降低30%）"
      }},
      {{
        "name": "场景2：智能内容生成",
        "background": "场景背景",
        "pain_points": ["具体痛点1", "具体痛点2"],
        "solution": "AI解决方案详述（80字以上）",
        "expected_value": "预期效果（包含量化指标）"
      }},
      {{
        "name": "场景3：智能数据分析",
        "background": "场景背景",
        "pain_points": ["具体痛点1", "具体痛点2"],
        "solution": "AI解决方案详述（80字以上）",
        "expected_value": "预期效果（包含量化指标）"
      }},
      {{
        "name": "场景4：智能运营优化",
        "background": "场景背景",
        "pain_points": ["具体痛点1", "具体痛点2"],
        "solution": "AI解决方案详述（80字以上）",
        "expected_value": "预期效果（包含量化指标）"
      }},
      {{
        "name": "场景5：智能决策支持",
        "background": "场景背景",
        "pain_points": ["具体痛点1", "具体痛点2"],
        "solution": "AI解决方案详述（80字以上）",
        "expected_value": "预期效果（包含量化指标）"
      }}
    ],
    "cooperation_model": {{
      "tech_integration": "技术对接方式（API对接/私有化部署/混合模式等，30字以上）",
      "data_security": "数据安全措施（加密、脱敏、合规等，30字以上）",
      "rd_mechanism": "联合研发机制（团队协作、迭代计划等，30字以上）"
    }},
    "expected_results": {{
      "efficiency": "效率提升XX%",
      "cost": "成本降低XX%",
      "growth": "业务增长XX%"
    }},
    "roadmap": {{
      "short_term": "短期目标（1-3个月，具体里程碑）",
      "mid_term": "中期目标（3-6个月，具体里程碑）",
      "long_term": "长期愿景（1年以上，具体目标）"
    }}
  }}
}}

【关键要求】
1. visual_style 必须根据乙方行业选择正确的值
2. 所有描述必须结合乙方行业特点，体现专业性
3. 合作场景必须切实可行，符合乙方业务需求
4. 预期效果必须包含量化指标

请直接输出JSON，不要有任何其他文字。"""


# ── Routes ────────────────────────────────────────────────────────────────────
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    party_a_name = data.get('party_a_name', '').strip()
    party_a_ai   = data.get('party_a_ai', '').strip()
    party_b_name = data.get('party_b_name', '').strip()
    provider     = data.get('provider', 'deepseek').strip()

    if not all([party_a_name, party_a_ai, party_b_name]):
        return jsonify({'error': '请填写所有必填字段'}), 400

    api_key = data.get('api_key', '').strip()
    if not api_key:
        env_key = os.environ.get("ZHIPU_API_KEY", "") if provider == "zhipu" else os.environ.get("DEEPSEEK_API_KEY", "")
        api_key = env_key
    if not api_key:
        provider_name = "智谱" if provider == "zhipu" else "DeepSeek"
        return jsonify({'error': f'请提供 {provider_name} API Key'}), 400

    try:
        client, model = get_client(provider, api_key)

        # 调用AI生成内容大纲
        outline_response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": OUTLINE_SYSTEM_PROMPT},
                {"role": "user", "content": build_outline_prompt(party_a_name, party_a_ai, party_b_name)},
            ],
            temperature=0.8,
            max_tokens=6000,
        )

        outline_text = outline_response.choices[0].message.content.strip()

        # 清理可能的markdown代码块标记
        if outline_text.startswith("```"):
            lines = outline_text.split('\n')
            outline_text = '\n'.join(lines[1:-1]) if lines[-1].strip() == '```' else '\n'.join(lines[1:])

        # 解析JSON大纲
        try:
            outline_json = json.loads(outline_text)
        except json.JSONDecodeError as e:
            return jsonify({'error': f'内容生成失败，请重试：JSON解析错误'}), 500

        # 获取视觉风格主题
        visual_style = outline_json.get("visual_style", "generic")
        colors = get_style_theme(visual_style)

        # 准备模板数据
        template_data = {
            "party_a": outline_json.get("party_a", {}),
            "party_b": outline_json.get("party_b", {}),
            "cooperation": outline_json.get("cooperation", {}),
            "colors": colors,
            "font_family": colors["font_family"],
            "generate_date": datetime.now().strftime('%Y年%m月%d日')
        }

        # 使用模板渲染HTML
        html_content = render_template('result.html', **template_data)

        # Save to output directory
        filename = f"collab_{party_b_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}.html"
        filepath = os.path.join(OUTPUT_DIR, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)

        return jsonify({
            'html':     html_content,
            'filename': filename,
        })

    except Exception as e:
        return jsonify({'error': f'生成失败：{str(e)}'}), 500


def is_safe_filename(filename):
    """检查文件名是否安全，防止路径遍历攻击"""
    return bool(re.match(r'^[\w\-\.]+$', filename))


@app.route('/download/<filename>')
def download(filename):
    if not is_safe_filename(filename):
        return '无效的文件名', 400
    filepath = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(filepath):
        return '文件不存在', 404
    return send_file(filepath, as_attachment=True, download_name=filename, mimetype='text/html')


@app.route('/preview/<filename>')
def preview(filename):
    if not is_safe_filename(filename):
        return '无效的文件名', 400
    filepath = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(filepath):
        return '文件不存在', 404
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read(), 200, {'Content-Type': 'text/html; charset=utf-8'}


if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_DEBUG', 'true').lower() == 'true'
    print("🚀 AI 合作介绍生成器已启动 → http://127.0.0.1:5000")
    app.run(debug=debug_mode, port=5000)
