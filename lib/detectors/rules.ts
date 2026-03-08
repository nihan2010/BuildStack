// ============================================================
// BuildStack – Technology Detection Rules
// Each rule defines how to detect a specific technology
// by inspecting HTML, headers, scripts, meta tags, etc.
// ============================================================

import type { DetectionRule, DetectionContext, DetectionResult } from "@/types";

// --------------- Helper Utilities ---------------

/** Check if HTML contains a pattern */
const inHTML = (html: string, pattern: RegExp | string): boolean =>
  typeof pattern === "string"
    ? html.includes(pattern)
    : pattern.test(html);

/** Check if any script URL matches a pattern */
const inScripts = (scripts: string[], pattern: RegExp | string): boolean =>
  scripts.some((s) =>
    typeof pattern === "string" ? s.includes(pattern) : pattern.test(s)
  );

/** Check if a header exists and optionally matches a value */
const hasHeader = (
  headers: Record<string, string>,
  name: string,
  value?: RegExp | string
): boolean => {
  const h = headers[name.toLowerCase()];
  if (!h) return false;
  if (!value) return true;
  return typeof value === "string" ? h.includes(value) : value.test(h);
};

/** Extract version from a string using a regex */
const extractVersion = (str: string, pattern: RegExp): string | undefined => {
  const match = str.match(pattern);
  return match?.[1];
};

// ============================================================
// DETECTION RULES ARRAY
// ============================================================

export const DETECTION_RULES: DetectionRule[] = [
  // ───────────────────────────────────────────────
  // FRONTEND FRAMEWORKS
  // ───────────────────────────────────────────────

  {
    name: "React",
    category: "frontend",
    description: "A JavaScript library for building user interfaces",
    icon: "⚛️",
    color: "#61DAFB",
    website: "https://react.dev",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      // data-reactroot is a strong signal
      if (inHTML(ctx.html, "data-reactroot")) {
        evidence.push("data-reactroot attribute detected");
        confidence += 40;
      }
      // __NEXT_DATA__ means Next.js (which uses React) – give partial credit
      if (inHTML(ctx.html, "__NEXT_DATA__") || inHTML(ctx.html, "__next")) {
        evidence.push("Next.js marker (React-based)");
        confidence += 30;
      }
      if (inScripts(ctx.scripts, /react(\.min)?\.js/)) {
        evidence.push("react.js script loaded");
        confidence += 35;
      }
      if (inHTML(ctx.html, "data-react") || inHTML(ctx.html, "_reactFiber")) {
        evidence.push("React fiber/data-react attribute");
        confidence += 25;
      }
      if (inHTML(ctx.html, "__reactInternalInstance")) {
        evidence.push("React internal instance");
        confidence += 30;
      }
      if (inScripts(ctx.scripts, "react-dom")) {
        evidence.push("react-dom loaded");
        confidence += 20;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 98), evidence } : null;
    },
  },

  {
    name: "Next.js",
    category: "frontend",
    description: "The React framework for production",
    icon: "▲",
    color: "#FFFFFF",
    website: "https://nextjs.org",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inHTML(ctx.html, "__NEXT_DATA__")) {
        evidence.push("__NEXT_DATA__ global");
        confidence += 50;
      }
      if (inHTML(ctx.html, "_next/static")) {
        evidence.push("_next/static asset path");
        confidence += 35;
      }
      if (hasHeader(ctx.headers, "x-powered-by", /next\.js/i)) {
        evidence.push("x-powered-by: Next.js header");
        confidence += 40;
      }
      if (inScripts(ctx.scripts, /_next\/static/)) {
        evidence.push("Next.js bundled script");
        confidence += 25;
      }

      // Try extracting version from __NEXT_DATA__
      const versionMatch = ctx.html.match(/"nextExport":|"buildId":"([^"]+)"/);
      const version = versionMatch ? undefined : undefined;

      return confidence > 0 ? { confidence: Math.min(confidence, 99), evidence, version } : null;
    },
  },

  {
    name: "Vue.js",
    category: "frontend",
    description: "The progressive JavaScript framework",
    icon: "💚",
    color: "#42B883",
    website: "https://vuejs.org",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inHTML(ctx.html, "__vue_app__") || inHTML(ctx.html, "__VUE__")) {
        evidence.push("Vue app global");
        confidence += 50;
      }
      if (inHTML(ctx.html, "data-v-")) {
        evidence.push("Vue scoped CSS attribute");
        confidence += 35;
      }
      if (inScripts(ctx.scripts, /vue(\.min|\.runtime)?\.js/i)) {
        evidence.push("vue.js script");
        confidence += 40;
      }
      if (inHTML(ctx.html, "v-cloak") || inHTML(ctx.html, ":class=") || inHTML(ctx.html, "@click=")) {
        evidence.push("Vue template directives");
        confidence += 20;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 97), evidence } : null;
    },
  },

  {
    name: "Nuxt.js",
    category: "frontend",
    description: "The intuitive Vue framework",
    icon: "💚",
    color: "#00DC82",
    website: "https://nuxt.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inHTML(ctx.html, "__NUXT__") || inHTML(ctx.html, "window.__NUXT__")) {
        evidence.push("__NUXT__ global");
        confidence += 60;
      }
      if (inScripts(ctx.scripts, /_nuxt\//)) {
        evidence.push("_nuxt/ asset path");
        confidence += 40;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 97), evidence } : null;
    },
  },

  {
    name: "Angular",
    category: "frontend",
    description: "Platform for building mobile and desktop web applications",
    icon: "🔴",
    color: "#DD0031",
    website: "https://angular.io",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inHTML(ctx.html, "ng-version=") || inHTML(ctx.html, "_nghost-")) {
        evidence.push("Angular ng-version / _nghost attribute");
        confidence += 55;
      }
      if (inHTML(ctx.html, "ng-app") || inHTML(ctx.html, "ng-controller")) {
        evidence.push("AngularJS directive");
        confidence += 40;
      }
      if (inScripts(ctx.scripts, /angular(\.min)?\.js/i)) {
        evidence.push("angular.js script");
        confidence += 35;
      }

      const version = extractVersion(ctx.html, /ng-version="([^"]+)"/);
      return confidence > 0 ? { confidence: Math.min(confidence, 97), evidence, version } : null;
    },
  },

  {
    name: "Svelte",
    category: "frontend",
    description: "Cybernetically enhanced web apps",
    icon: "🟠",
    color: "#FF3E00",
    website: "https://svelte.dev",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inHTML(ctx.html, "__svelte") || inHTML(ctx.html, "svelte-")) {
        evidence.push("Svelte marker in HTML");
        confidence += 50;
      }
      if (inScripts(ctx.scripts, /svelte/i)) {
        evidence.push("Svelte script reference");
        confidence += 35;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 95), evidence } : null;
    },
  },

  {
    name: "Gatsby",
    category: "frontend",
    description: "React-based static site generator",
    icon: "💜",
    color: "#663399",
    website: "https://gatsbyjs.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inHTML(ctx.html, "___gatsby") || inHTML(ctx.html, "__gatsby")) {
        evidence.push("Gatsby global object");
        confidence += 55;
      }
      if (inHTML(ctx.html, "gatsby-")) {
        evidence.push("Gatsby CSS class prefix");
        confidence += 30;
      }
      if (inScripts(ctx.scripts, /gatsby/i)) {
        evidence.push("Gatsby script reference");
        confidence += 25;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 95), evidence } : null;
    },
  },

  {
    name: "Remix",
    category: "frontend",
    description: "Full stack web framework",
    icon: "💿",
    color: "#E8F2FF",
    website: "https://remix.run",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inHTML(ctx.html, "__remix_router__") || inHTML(ctx.html, "window.__remixContext")) {
        evidence.push("Remix router context");
        confidence += 60;
      }
      if (inScripts(ctx.scripts, /\/build\/root-/)) {
        evidence.push("Remix build path pattern");
        confidence += 30;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 95), evidence } : null;
    },
  },

  {
    name: "Astro",
    category: "frontend",
    description: "The web framework for content-driven websites",
    icon: "🚀",
    color: "#FF5D01",
    website: "https://astro.build",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inHTML(ctx.html, "astro-island") || inHTML(ctx.html, "data-astro-")) {
        evidence.push("Astro island / data-astro attribute");
        confidence += 60;
      }
      if (hasHeader(ctx.headers, "x-powered-by", /astro/i)) {
        evidence.push("X-Powered-By: Astro");
        confidence += 40;
      }
      if (inScripts(ctx.scripts, /_astro\//)) {
        evidence.push("_astro/ asset path");
        confidence += 35;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 96), evidence } : null;
    },
  },

  // ───────────────────────────────────────────────
  // CSS FRAMEWORKS
  // ───────────────────────────────────────────────

  {
    name: "Tailwind CSS",
    category: "frontend",
    description: "A utility-first CSS framework",
    icon: "🎨",
    color: "#06B6D4",
    website: "https://tailwindcss.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      // Tailwind's utility classes are very distinctive
      const tailwindPatterns = [
        /class="[^"]*\b(flex|grid|gap-|p-\d|m-\d|text-\w+-\d{3}|bg-\w+-\d{3}|rounded-|shadow-|border-|w-\d|h-\d)\b/,
      ];
      if (tailwindPatterns.some((p) => p.test(ctx.html))) {
        evidence.push("Tailwind utility classes detected");
        confidence += 40;
      }
      if (inScripts(ctx.scripts, /tailwind/i) || inHTML(ctx.html, "tailwind")) {
        evidence.push("Tailwind script/reference");
        confidence += 35;
      }
      // Tailwind CDN
      if (inScripts(ctx.scripts, /cdn\.tailwindcss\.com/)) {
        evidence.push("Tailwind CDN");
        confidence += 55;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 90), evidence } : null;
    },
  },

  {
    name: "Bootstrap",
    category: "frontend",
    description: "The most popular CSS framework",
    icon: "🅱️",
    color: "#7952B3",
    website: "https://getbootstrap.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inScripts(ctx.scripts, /bootstrap(\.min)?\.js/i) || inScripts(ctx.scripts, /bootstrap/i)) {
        evidence.push("Bootstrap script detected");
        confidence += 45;
      }
      if (inHTML(ctx.html, "bootstrap.min.css") || inHTML(ctx.html, "bootstrap.css")) {
        evidence.push("Bootstrap CSS link");
        confidence += 50;
      }
      // Bootstrap class patterns
      if (/class="[^"]*\b(col-md-|col-lg-|container-fluid|navbar-expand|btn-primary|form-control)\b/.test(ctx.html)) {
        evidence.push("Bootstrap grid/component classes");
        confidence += 35;
      }

      const version = extractVersion(ctx.html, /bootstrap[/@]([0-9]+\.[0-9]+)/);
      return confidence > 0 ? { confidence: Math.min(confidence, 95), evidence, version } : null;
    },
  },

  // ───────────────────────────────────────────────
  // CMS PLATFORMS
  // ───────────────────────────────────────────────

  {
    name: "WordPress",
    category: "cms",
    description: "The world's most popular CMS",
    icon: "📝",
    color: "#21759B",
    website: "https://wordpress.org",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inHTML(ctx.html, "/wp-content/") || inHTML(ctx.html, "/wp-includes/")) {
        evidence.push("wp-content / wp-includes paths");
        confidence += 60;
      }
      if (ctx.metaTags["generator"]?.toLowerCase().includes("wordpress")) {
        evidence.push("WordPress generator meta tag");
        confidence += 70;
      }
      if (hasHeader(ctx.headers, "x-powered-by", /wordpress/i)) {
        evidence.push("X-Powered-By WordPress header");
        confidence += 50;
      }
      if (inHTML(ctx.html, "wp-json") || inHTML(ctx.html, "wp-emoji")) {
        evidence.push("WordPress REST API / emoji detection");
        confidence += 30;
      }

      const version = extractVersion(ctx.html, /wordpress ([0-9]+\.[0-9]+)/i) ||
        extractVersion(ctx.metaTags["generator"] || "", /wordpress ([0-9.]+)/i);
      return confidence > 0 ? { confidence: Math.min(confidence, 99), evidence, version } : null;
    },
  },

  {
    name: "Shopify",
    category: "cms",
    description: "E-commerce platform",
    icon: "🛍️",
    color: "#96BF48",
    website: "https://shopify.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inHTML(ctx.html, "Shopify.theme") || inHTML(ctx.html, "window.Shopify")) {
        evidence.push("Shopify global object");
        confidence += 65;
      }
      if (inScripts(ctx.scripts, /cdn\.shopify\.com/)) {
        evidence.push("Shopify CDN scripts");
        confidence += 60;
      }
      if (inHTML(ctx.html, "/checkout") && inHTML(ctx.html, "shopify")) {
        evidence.push("Shopify checkout reference");
        confidence += 30;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 99), evidence } : null;
    },
  },

  {
    name: "Wix",
    category: "cms",
    description: "Cloud-based website builder",
    icon: "🌐",
    color: "#FBBD04",
    website: "https://wix.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inHTML(ctx.html, "wix.com") && (inHTML(ctx.html, "wixstatic") || inHTML(ctx.html, "wix-code"))) {
        evidence.push("Wix platform references");
        confidence += 70;
      }
      if (inHTML(ctx.html, "wixsite.com") || inHTML(ctx.html, "wixstatic.com")) {
        evidence.push("Wix static/site domain");
        confidence += 60;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 97), evidence } : null;
    },
  },

  {
    name: "Squarespace",
    category: "cms",
    description: "Website builder and hosting",
    icon: "⬛",
    color: "#FFFFFF",
    website: "https://squarespace.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inHTML(ctx.html, "squarespace") || inScripts(ctx.scripts, /squarespace/i)) {
        evidence.push("Squarespace reference");
        confidence += 70;
      }
      if (ctx.metaTags["generator"]?.toLowerCase().includes("squarespace")) {
        evidence.push("Squarespace generator meta");
        confidence += 75;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 98), evidence } : null;
    },
  },

  {
    name: "Webflow",
    category: "cms",
    description: "Visual web development platform",
    icon: "🌊",
    color: "#4353FF",
    website: "https://webflow.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inHTML(ctx.html, "webflow") || inScripts(ctx.scripts, /webflow/i)) {
        evidence.push("Webflow reference");
        confidence += 60;
      }
      if (inHTML(ctx.html, "data-wf-page") || inHTML(ctx.html, "data-wf-site")) {
        evidence.push("Webflow data attributes");
        confidence += 70;
      }
      if (inScripts(ctx.scripts, /assets\.website-files\.com/)) {
        evidence.push("Webflow asset CDN");
        confidence += 65;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 98), evidence } : null;
    },
  },

  {
    name: "Ghost",
    category: "cms",
    description: "Open source publishing platform",
    icon: "👻",
    color: "#738A94",
    website: "https://ghost.org",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (ctx.metaTags["generator"]?.toLowerCase().includes("ghost")) {
        evidence.push("Ghost generator meta");
        confidence += 75;
      }
      if (inHTML(ctx.html, "ghost.io") || inHTML(ctx.html, "/ghost/") || inScripts(ctx.scripts, /ghost/i)) {
        evidence.push("Ghost reference in HTML/scripts");
        confidence += 50;
      }

      const version = extractVersion(ctx.metaTags["generator"] || "", /ghost ([0-9.]+)/i);
      return confidence > 0 ? { confidence: Math.min(confidence, 96), evidence, version } : null;
    },
  },

  // ───────────────────────────────────────────────
  // HOSTING & CDN
  // ───────────────────────────────────────────────

  {
    name: "Vercel",
    category: "hosting",
    description: "Platform for frontend frameworks and static sites",
    icon: "▲",
    color: "#FFFFFF",
    website: "https://vercel.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (hasHeader(ctx.headers, "x-vercel-id") || hasHeader(ctx.headers, "x-vercel-cache")) {
        evidence.push("Vercel response headers");
        confidence += 75;
      }
      if (ctx.url.includes("vercel.app")) {
        evidence.push("vercel.app domain");
        confidence += 80;
      }
      if (hasHeader(ctx.headers, "server", /vercel/i)) {
        evidence.push("Server: Vercel header");
        confidence += 65;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 99), evidence } : null;
    },
  },

  {
    name: "Netlify",
    category: "hosting",
    description: "Web hosting and serverless backend services",
    icon: "🟢",
    color: "#00C7B7",
    website: "https://netlify.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (hasHeader(ctx.headers, "x-nf-request-id") || hasHeader(ctx.headers, "server", /netlify/i)) {
        evidence.push("Netlify response headers");
        confidence += 75;
      }
      if (ctx.url.includes("netlify.app") || ctx.url.includes("netlify.com")) {
        evidence.push("Netlify domain");
        confidence += 80;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 99), evidence } : null;
    },
  },

  {
    name: "Cloudflare",
    category: "cdn",
    description: "Global network security and CDN",
    icon: "🔶",
    color: "#F38020",
    website: "https://cloudflare.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (hasHeader(ctx.headers, "cf-ray") || hasHeader(ctx.headers, "cf-cache-status")) {
        evidence.push("Cloudflare CF-Ray header");
        confidence += 80;
      }
      if (hasHeader(ctx.headers, "server", /cloudflare/i)) {
        evidence.push("Server: cloudflare header");
        confidence += 70;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 99), evidence } : null;
    },
  },

  {
    name: "AWS",
    category: "hosting",
    description: "Amazon Web Services cloud platform",
    icon: "☁️",
    color: "#FF9900",
    website: "https://aws.amazon.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (hasHeader(ctx.headers, "x-amzn-requestid") || hasHeader(ctx.headers, "x-amz-cf-id")) {
        evidence.push("AWS request ID / CloudFront header");
        confidence += 70;
      }
      if (inScripts(ctx.scripts, /amazonaws\.com/)) {
        evidence.push("amazonaws.com script URL");
        confidence += 50;
      }
      if (hasHeader(ctx.headers, "server", /AmazonS3|AmazonEC2/i)) {
        evidence.push("Amazon server header");
        confidence += 60;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 95), evidence } : null;
    },
  },

  {
    name: "GitHub Pages",
    category: "hosting",
    description: "Static site hosting from GitHub repos",
    icon: "🐙",
    color: "#24292F",
    website: "https://pages.github.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      if (ctx.url.includes("github.io")) {
        return { confidence: 98, evidence: ["github.io domain"] };
      }
      return null;
    },
  },

  // ───────────────────────────────────────────────
  // ANALYTICS & TRACKING
  // ───────────────────────────────────────────────

  {
    name: "Google Analytics",
    category: "analytics",
    description: "Web analytics service by Google",
    icon: "📊",
    color: "#E37400",
    website: "https://analytics.google.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inScripts(ctx.scripts, /google-analytics\.com/)) {
        evidence.push("google-analytics.com script");
        confidence += 70;
      }
      if (inScripts(ctx.scripts, /googletagmanager\.com\/gtag/)) {
        evidence.push("Google Tag Manager gtag script");
        confidence += 65;
      }
      if (inHTML(ctx.html, "ga('create'") || inHTML(ctx.html, "gtag('config'")) {
        evidence.push("GA initialization code");
        confidence += 55;
      }
      if (inHTML(ctx.html, "UA-") || inHTML(ctx.html, "G-")) {
        evidence.push("GA tracking ID pattern");
        confidence += 30;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 99), evidence } : null;
    },
  },

  {
    name: "Google Tag Manager",
    category: "analytics",
    description: "Tag management system by Google",
    icon: "🏷️",
    color: "#4285F4",
    website: "https://tagmanager.google.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inScripts(ctx.scripts, /googletagmanager\.com\/gtm/)) {
        evidence.push("GTM script URL");
        confidence += 75;
      }
      if (inHTML(ctx.html, "GTM-")) {
        evidence.push("GTM container ID (GTM-)");
        confidence += 60;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 97), evidence } : null;
    },
  },

  {
    name: "Hotjar",
    category: "analytics",
    description: "Heatmaps and behavior analytics",
    icon: "🔥",
    color: "#FD3A5C",
    website: "https://hotjar.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inScripts(ctx.scripts, /hotjar\.com/) || inHTML(ctx.html, "hotjar")) {
        evidence.push("Hotjar script / reference");
        confidence += 75;
      }
      if (inHTML(ctx.html, "hjSiteSettings") || inHTML(ctx.html, "_hjSettings")) {
        evidence.push("Hotjar settings object");
        confidence += 80;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 98), evidence } : null;
    },
  },

  {
    name: "Mixpanel",
    category: "analytics",
    description: "Product analytics platform",
    icon: "📈",
    color: "#7856FF",
    website: "https://mixpanel.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inScripts(ctx.scripts, /mixpanel/) || inHTML(ctx.html, "mixpanel")) {
        evidence.push("Mixpanel reference");
        confidence += 70;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 95), evidence } : null;
    },
  },

  {
    name: "Segment",
    category: "analytics",
    description: "Customer data infrastructure",
    icon: "🔵",
    color: "#52BD94",
    website: "https://segment.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inScripts(ctx.scripts, /cdn\.segment\.com/) || inHTML(ctx.html, "analytics.identify") || inHTML(ctx.html, "analytics.track")) {
        evidence.push("Segment analytics reference");
        confidence += 70;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 95), evidence } : null;
    },
  },

  // ───────────────────────────────────────────────
  // TRACKING
  // ───────────────────────────────────────────────

  {
    name: "Facebook Pixel",
    category: "tracking",
    description: "Meta advertising analytics pixel",
    icon: "🔵",
    color: "#1877F2",
    website: "https://business.facebook.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inScripts(ctx.scripts, /connect\.facebook\.net/) || inHTML(ctx.html, "fbq('init'")) {
        evidence.push("Facebook Pixel script / fbq init");
        confidence += 80;
      }
      if (inHTML(ctx.html, "_fbq") || inHTML(ctx.html, "facebook-jssdk")) {
        evidence.push("Facebook SDK markers");
        confidence += 50;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 98), evidence } : null;
    },
  },

  {
    name: "Twitter/X Pixel",
    category: "tracking",
    description: "X (Twitter) ad conversion tracking",
    icon: "🐦",
    color: "#000000",
    website: "https://ads.twitter.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      if (inScripts(ctx.scripts, /static\.ads-twitter\.com/) || inHTML(ctx.html, "twq('init'")) {
        return { confidence: 90, evidence: ["Twitter/X pixel script detected"] };
      }
      return null;
    },
  },

  {
    name: "Intercom",
    category: "tracking",
    description: "Customer messaging platform",
    icon: "💬",
    color: "#1F8DED",
    website: "https://intercom.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inScripts(ctx.scripts, /intercom/) || inHTML(ctx.html, "Intercom(")) {
        evidence.push("Intercom reference");
        confidence += 75;
      }
      if (inHTML(ctx.html, "intercomSettings")) {
        evidence.push("Intercom settings object");
        confidence += 70;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 97), evidence } : null;
    },
  },

  // ───────────────────────────────────────────────
  // PAYMENTS
  // ───────────────────────────────────────────────

  {
    name: "Stripe",
    category: "payments",
    description: "Payment processing platform",
    icon: "💳",
    color: "#635BFF",
    website: "https://stripe.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inScripts(ctx.scripts, /js\.stripe\.com/)) {
        evidence.push("Stripe.js loaded");
        confidence += 85;
      }
      if (inHTML(ctx.html, "pk_live_") || inHTML(ctx.html, "pk_test_")) {
        evidence.push("Stripe public API key");
        confidence += 70;
      }
      if (inHTML(ctx.html, "Stripe(") || inHTML(ctx.html, "stripe.createToken")) {
        evidence.push("Stripe JS API call");
        confidence += 60;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 99), evidence } : null;
    },
  },

  {
    name: "PayPal",
    category: "payments",
    description: "Online payment system",
    icon: "🅿️",
    color: "#003087",
    website: "https://paypal.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      if (inScripts(ctx.scripts, /paypal\.com\/sdk/) || inHTML(ctx.html, "paypal.Buttons")) {
        return { confidence: 90, evidence: ["PayPal SDK detected"] };
      }
      return null;
    },
  },

  // ───────────────────────────────────────────────
  // JAVASCRIPT LIBRARIES
  // ───────────────────────────────────────────────

  {
    name: "jQuery",
    category: "javascript",
    description: "Fast, small JavaScript library",
    icon: "🔷",
    color: "#0769AD",
    website: "https://jquery.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inScripts(ctx.scripts, /jquery(\.min)?\.js/i)) {
        evidence.push("jQuery script loaded");
        confidence += 55;
      }
      if (inHTML(ctx.html, "jQuery.fn.") || inHTML(ctx.html, "$(document).ready")) {
        evidence.push("jQuery API usage");
        confidence += 40;
      }
      if (inHTML(ctx.html, "window.jQuery") || inHTML(ctx.html, "window.$")) {
        evidence.push("jQuery global reference");
        confidence += 35;
      }

      const version = extractVersion(
        ctx.scripts.find((s) => /jquery/i.test(s)) || "",
        /jquery[/@-]([0-9]+\.[0-9]+\.[0-9]+)/i
      );
      return confidence > 0 ? { confidence: Math.min(confidence, 90), evidence, version } : null;
    },
  },

  {
    name: "Lodash",
    category: "javascript",
    description: "Utility library delivering modularity, performance & extras",
    icon: "🔧",
    color: "#3492FF",
    website: "https://lodash.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      if (inScripts(ctx.scripts, /lodash(\.min)?\.js/i) || inHTML(ctx.html, "window._")) {
        return { confidence: 80, evidence: ["Lodash detected"] };
      }
      return null;
    },
  },

  {
    name: "Moment.js",
    category: "javascript",
    description: "Date manipulation library",
    icon: "⏰",
    color: "#CE4B4B",
    website: "https://momentjs.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      if (inScripts(ctx.scripts, /moment(\.min)?\.js/i)) {
        return { confidence: 85, evidence: ["moment.js script"] };
      }
      return null;
    },
  },

  // ───────────────────────────────────────────────
  // BACKEND / SERVER
  // ───────────────────────────────────────────────

  {
    name: "Node.js",
    category: "backend",
    description: "JavaScript runtime built on Chrome's V8 engine",
    icon: "🟢",
    color: "#339933",
    website: "https://nodejs.org",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (hasHeader(ctx.headers, "x-powered-by", /express/i)) {
        evidence.push("Express.js X-Powered-By header");
        confidence += 55;
      }
      if (hasHeader(ctx.headers, "x-powered-by", /node/i)) {
        evidence.push("Node X-Powered-By header");
        confidence += 60;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 88), evidence } : null;
    },
  },

  {
    name: "PHP",
    category: "backend",
    description: "General-purpose scripting language",
    icon: "🐘",
    color: "#777BB4",
    website: "https://php.net",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (hasHeader(ctx.headers, "x-powered-by", /php/i)) {
        evidence.push("X-Powered-By PHP header");
        confidence += 75;
      }
      if (ctx.url.includes(".php")) {
        evidence.push(".php in URL path");
        confidence += 50;
      }
      if (inHTML(ctx.html, "PHPSESSID") || inHTML(ctx.html, "<?php")) {
        evidence.push("PHPSESSID or PHP tag");
        confidence += 40;
      }

      const version = extractVersion(
        ctx.headers["x-powered-by"] || "",
        /php\/([0-9.]+)/i
      );
      return confidence > 0 ? { confidence: Math.min(confidence, 95), evidence, version } : null;
    },
  },

  {
    name: "Ruby on Rails",
    category: "backend",
    description: "Server-side web application framework",
    icon: "💎",
    color: "#CC0000",
    website: "https://rubyonrails.org",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (hasHeader(ctx.headers, "x-powered-by", /rails/i) || hasHeader(ctx.headers, "server", /passenger/i)) {
        evidence.push("Rails / Passenger header");
        confidence += 70;
      }
      if (inHTML(ctx.html, "csrf-token") && inHTML(ctx.html, "authenticity_token")) {
        evidence.push("Rails CSRF token pattern");
        confidence += 50;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 90), evidence } : null;
    },
  },

  {
    name: "Django",
    category: "backend",
    description: "High-level Python web framework",
    icon: "🐍",
    color: "#0C4B33",
    website: "https://djangoproject.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inHTML(ctx.html, "csrfmiddlewaretoken") || inHTML(ctx.html, "__django")) {
        evidence.push("Django CSRF middleware token");
        confidence += 60;
      }
      if (hasHeader(ctx.headers, "x-frame-options", /sameorigin/i) && inHTML(ctx.html, "django")) {
        evidence.push("Django security headers + reference");
        confidence += 30;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 88), evidence } : null;
    },
  },

  // ───────────────────────────────────────────────
  // DATABASE
  // ───────────────────────────────────────────────

  {
    name: "Firebase",
    category: "database",
    description: "Google's app development platform",
    icon: "🔥",
    color: "#FFCA28",
    website: "https://firebase.google.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      const evidence: string[] = [];
      let confidence = 0;

      if (inScripts(ctx.scripts, /firebase/) || inHTML(ctx.html, "firebaseapp.com")) {
        evidence.push("Firebase script / domain");
        confidence += 70;
      }
      if (inHTML(ctx.html, "initializeApp") || inHTML(ctx.html, "firebase.initializeApp")) {
        evidence.push("Firebase initialization");
        confidence += 55;
      }

      return confidence > 0 ? { confidence: Math.min(confidence, 96), evidence } : null;
    },
  },

  {
    name: "Supabase",
    category: "database",
    description: "Open source Firebase alternative",
    icon: "⚡",
    color: "#3ECF8E",
    website: "https://supabase.com",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      if (inScripts(ctx.scripts, /supabase/) || inHTML(ctx.html, "supabase")) {
        return { confidence: 85, evidence: ["Supabase reference detected"] };
      }
      return null;
    },
  },

  // ───────────────────────────────────────────────
  // DEVTOOLS / BUILD
  // ───────────────────────────────────────────────

  {
    name: "Webpack",
    category: "devtools",
    description: "Module bundler for JavaScript",
    icon: "📦",
    color: "#8DD6F9",
    website: "https://webpack.js.org",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      if (inHTML(ctx.html, "__webpack_require__") || inHTML(ctx.html, "webpackJsonp")) {
        return { confidence: 90, evidence: ["Webpack runtime detected"] };
      }
      return null;
    },
  },

  {
    name: "Vite",
    category: "devtools",
    description: "Next generation frontend tooling",
    icon: "⚡",
    color: "#646CFF",
    website: "https://vitejs.dev",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      if (inHTML(ctx.html, "/@vite/") || inScripts(ctx.scripts, /@vite/) || inHTML(ctx.html, "__vite_is_modern_browser")) {
        return { confidence: 90, evidence: ["Vite build markers detected"] };
      }
      return null;
    },
  },

  {
    name: "Sentry",
    category: "devtools",
    description: "Application monitoring and error tracking",
    icon: "🛡️",
    color: "#F55138",
    website: "https://sentry.io",
    detect: (ctx: DetectionContext): DetectionResult | null => {
      if (inScripts(ctx.scripts, /sentry/) || inHTML(ctx.html, "Sentry.init(") || inHTML(ctx.html, "@sentry/")) {
        return { confidence: 90, evidence: ["Sentry SDK detected"] };
      }
      return null;
    },
  },
];
