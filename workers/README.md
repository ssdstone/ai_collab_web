# AI 合作介绍网页生成器 - Cloudflare Workers 版本

这是项目的 Cloudflare Workers 版本，可以部署到 Cloudflare 的全球边缘网络。

## 前置要求

1. 安装 [Node.js](https://nodejs.org/) (v18 或更高版本)
2. 注册 [Cloudflare](https://dash.cloudflare.com/sign-up) 账号
3. 获取 DeepSeek 或智谱 AI 的 API Key

## 本地开发

```bash
# 进入 workers 目录
cd workers

# 安装依赖
npm install

# 启动本地开发服务器
npm run dev
```

本地服务器启动后，访问 http://localhost:8787

## 部署到 Cloudflare Workers

### 1. 登录 Cloudflare

```bash
npx wrangler login
```

这会打开浏览器让你授权 wrangler 访问你的 Cloudflare 账号。

### 2. 配置 API Key（推荐使用 Secrets）

为了安全，不要在代码中硬编码 API Key。使用 wrangler secrets 管理：

```bash
# 设置 DeepSeek API Key
npx wrangler secret put DEEPSEEK_API_KEY

# 设置智谱 API Key（可选）
npx wrangler secret put ZHIPU_API_KEY
```

执行后会提示你输入 API Key 的值。

### 3. 部署

```bash
npm run deploy
```

部署成功后，你会看到类似输出：

```
Published ai-collab-web (production)
  https://ai-collab-web.<your-subdomain>.workers.dev
```

### 4. 自定义域名（可选）

如果你想使用自己的域名：

1. 在 Cloudflare Dashboard 中添加你的域名
2. 在 `wrangler.toml` 中添加：

```toml
routes = [
  { pattern = "your-domain.com/*", zone_name = "your-domain.com" }
]
```

或者通过 Dashboard 设置自定义域名。

## 项目结构

```
workers/
├── src/
│   ├── index.ts           # Worker 入口文件
│   └── templates/
│       ├── index.ts       # 首页模板
│       └── result.ts      # 结果页模板
├── package.json
├── tsconfig.json
├── wrangler.toml          # Cloudflare Workers 配置
└── README.md
```

## 注意事项

1. **API Key 安全**：永远不要将 API Key 提交到代码仓库。使用 `wrangler secret` 管理。

2. **CORS 配置**：如果需要从其他域名访问，可以在 `src/index.ts` 中修改 CORS 配置。

3. **速率限制**：Cloudflare Workers 免费版有请求限制（每天 100,000 次），付费版无限制。

4. **冷启动**：Workers 在边缘节点运行，首次请求可能有轻微延迟。

## 常见问题

### Q: 部署后报错 "Script not found"

确保你在 `workers` 目录下执行 `npm run deploy`。

### Q: API 调用失败

检查是否正确设置了 API Key secrets：
```bash
npx wrangler secret list
```

### Q: 如何查看日志

```bash
npm run tail
```

这会实时显示 Workers 的日志输出。

## 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Hono 框架文档](https://hono.dev/)
