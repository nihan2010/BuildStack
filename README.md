# ⚡ BuildStack

> **Discover the technology behind any website** — paste a URL and instantly see the frameworks, infrastructure, analytics, and tools powering it.

![BuildStack](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

---

## 📁 Project Structure

```
buildstack/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts          # POST /api/analyze — scan endpoint
│   ├── globals.css               # Global styles, animations, fonts
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Main page (state machine: idle/scanning/results/error)
│
├── components/
│   ├── Navbar.tsx                # Top navigation bar
│   ├── Hero.tsx                  # Landing hero with URL input
│   ├── ScanningAnimation.tsx     # Animated terminal scan steps
│   ├── Results.tsx               # Full results layout orchestrator
│   ├── TechBadge.tsx             # Individual technology card/badge
│   ├── ScoreRing.tsx             # Animated SVG score ring
│   ├── ArchDiagram.tsx           # Visual architecture flow diagram
│   ├── Blueprint.tsx             # Developer blueprint accordion
│   └── RawOutput.tsx             # Syntax-highlighted JSON panel
│
├── lib/
│   ├── scanner.ts                # Core HTTP scanner engine
│   ├── utils.ts                  # Helpers, formatters, blueprint generator
│   └── detectors/
│       └── rules.ts              # 40+ technology detection rules
│
├── types/
│   └── index.ts                  # All TypeScript type definitions
│
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🧠 How Detection Works

### 1. HTTP Fetch
The scanner sends a request to the target URL with a browser-like `User-Agent` and captures:
- Full HTML body
- All HTTP response headers
- Response time

### 2. Artifact Extraction
From the HTML, we extract:
- **Script URLs** — all `<script src="...">` tags
- **Meta tags** — `name`, `property`, `content` attributes
- **Page title** and meta description
- **Cookies** from `Set-Cookie` headers

### 3. Detection Rules Engine
Each technology has a `DetectionRule` with a `detect(context)` function that returns a confidence score (0–100) and evidence list.

**Example detection patterns:**
| Technology | Signal |
|---|---|
| Next.js | `__NEXT_DATA__` in HTML, `_next/static` paths, `x-powered-by: Next.js` header |
| React | `data-reactroot` attribute, `react.js` script, `__reactInternalInstance` |
| Cloudflare | `CF-Ray` header, `server: cloudflare` header |
| Stripe | `js.stripe.com` script, `pk_live_` / `pk_test_` keys, `Stripe()` call |
| WordPress | `/wp-content/`, `/wp-includes/` paths, `generator` meta tag |
| Google Analytics | `google-analytics.com` script, `ga('create'`, `gtag('config'` |

### 4. Scoring
- **Performance**: Based on response time and number of scripts
- **Security**: Counts presence of 6 key security headers
- **SEO**: Checks 8 SEO best practices (title, meta, OG, canonical, etc.)

---

## 🔧 Adding New Technology Detectors

Add a new rule to `lib/detectors/rules.ts`:

```typescript
{
  name: "My Technology",
  category: "frontend", // See TechCategory type
  description: "Short description",
  icon: "🔧",
  color: "#FF6B6B",
  website: "https://example.com",
  detect: (ctx: DetectionContext): DetectionResult | null => {
    const evidence: string[] = [];
    let confidence = 0;

    // Check HTML content
    if (ctx.html.includes("my-tech-marker")) {
      evidence.push("Marker found in HTML");
      confidence += 50;
    }

    // Check script URLs
    if (ctx.scripts.some(s => /my-tech\.js/.test(s))) {
      evidence.push("my-tech.js script loaded");
      confidence += 40;
    }

    // Check headers
    if (ctx.headers["x-powered-by"]?.includes("MyTech")) {
      evidence.push("X-Powered-By header");
      confidence += 70;
    }

    return confidence > 0 
      ? { confidence: Math.min(confidence, 99), evidence }
      : null;
  },
},
```

---

## 🌐 API Usage

### POST `/api/analyze`

**Request:**
```json
{
  "url": "https://stripe.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://stripe.com",
    "scannedAt": "2024-01-15T10:30:00Z",
    "technologies": [
      {
        "name": "React",
        "category": "frontend",
        "confidence": 95,
        "description": "A JavaScript library for building user interfaces",
        "icon": "⚛️",
        "color": "#61DAFB",
        "website": "https://react.dev"
      }
    ],
    "scripts": ["https://js.stripe.com/v3/"],
    "serverInfo": {
      "provider": "Cloudflare",
      "serverSoftware": "cloudflare"
    },
    "performance": {
      "responseTime": 234,
      "performanceScore": 95,
      "securityScore": 83,
      "seoScore": 88
    },
    "statusCode": 200
  }
}
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Fonts | Syne (display) · DM Sans (body) · JetBrains Mono |
| HTTP Client | Native `fetch` with timeout/abort |
| Icons | Lucide React |
| Deployment | Vercel (recommended) |

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
npx vercel --prod
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📝 Notes

- **CORS**: The scanner runs server-side in API routes, so there are no CORS issues
- **Rate limiting**: Add rate limiting middleware for production use
- **Puppeteer**: For SPAs that need JavaScript execution, replace the `fetchWithTimeout` in `lib/scanner.ts` with a Puppeteer/Playwright call
- **DNS records**: For real DNS lookups, add `dns.promises.resolve()` calls in the API route (Node.js only)

---

## 📄 License

MIT — build freely, ship fast.
