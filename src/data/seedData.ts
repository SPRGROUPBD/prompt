import { PromptCategory, PromptItem, RewardAdConfig } from '../types';

export const DEFAULT_AD_CONFIG: RewardAdConfig = {
  provider: 'custom_video',
  placementId: 'ca-app-pub-3940256099942544/5224354917',
  enabled: true,
  customVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  customVideoDurationSec: 15,
  customVideoType: 'youtube',
  dailyUnlockLimit: 20,
  unlockDurationMs: 24 * 60 * 60 * 1000, // 24 hours
};

export const INITIAL_CATEGORIES: PromptCategory[] = [
  {
    id: 'cat_image',
    name: 'AI Image & Art',
    icon: 'Image',
    description: 'Prompts for Midjourney, Flux.1, and Stable Diffusion photorealism and conceptual art.',
    displayOrder: 1,
    enabled: true,
    color: 'indigo',
  },
  {
    id: 'cat_video',
    name: 'Cinematic Video',
    icon: 'Video',
    description: 'Camera direction, motion cues, and lighting prompts for Runway Gen-3, Luma, and Kling.',
    displayOrder: 2,
    enabled: true,
    color: 'purple',
  },
  {
    id: 'cat_code',
    name: 'Coding & Architecture',
    icon: 'Code2',
    description: 'System design, refactoring, full-stack debugging, and algorithmic prompt suites.',
    displayOrder: 3,
    enabled: true,
    color: 'emerald',
  },
  {
    id: 'cat_writing',
    name: 'Creative Writing',
    icon: 'BookOpen',
    description: 'Narrative storytelling, world-building, dialogue generation, and editorial drafting.',
    displayOrder: 4,
    enabled: true,
    color: 'amber',
  },
  {
    id: 'cat_marketing',
    name: 'Marketing & Copy',
    icon: 'Sparkles',
    description: 'High-converting landing page headlines, hook frameworks, and SaaS value propositions.',
    displayOrder: 5,
    enabled: true,
    color: 'pink',
  },
  {
    id: 'cat_business',
    name: 'Business & Strategy',
    icon: 'TrendingUp',
    description: 'Executive summaries, competitive moat analysis, OKR planning, and product briefs.',
    displayOrder: 6,
    enabled: true,
    color: 'sky',
  },
];

export const INITIAL_PROMPTS: PromptItem[] = [
  {
    id: 'p_tokyo_cyberpunk',
    title: 'Cinematic Tokyo Rain Architecture',
    categoryId: 'cat_image',
    description: 'Hyper-detailed architectural photograph of Shibuya crossing at midnight drenched in neon reflections.',
    fullContent: `Medium format street photography of Shibuya Crossing at 2 AM in torrential rain. Solitary pedestrian in dark minimalist trench coat holding transparent umbrella under glowing amber and ultramarine neon signs. Pavement reflection with specular highlights, shallow depth of field with 85mm f/1.4 lens, natural chromatic haze, rich deep blacks, Fuji Pro 400H color grading --ar 16:9 --style raw --v 6.1`,
    negativePrompt: 'blurry, cartoon, 3d render, oversaturated, deformed hands, extra limbs, watermark, text banner',
    recommendedModel: 'Midjourney v6.1 / Flux.1 Schnell',
    type: 'Image',
    accessType: 'Reward Locked',
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
    displayOrder: 1,
    featured: true,
    popular: true,
    published: true,
    views: 3420,
    copies: 1240,
    tags: ['Street Photography', 'Cyberpunk', 'Architecture', 'Midjourney v6'],
    createdAt: Date.now() - 86400000 * 14,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'p_fullstack_auth',
    title: 'Production-Grade RBAC Authentication Architecture',
    categoryId: 'cat_code',
    description: 'Complete architecture blueprint prompt for secure multi-tenant role-based access control with refresh token rotation.',
    fullContent: `Act as a Principal Security Architect. Design a production-ready authentication and authorization architecture for a multi-tenant React + Node.js (TypeScript) enterprise SaaS application.

Requirements to specify with exact code samples:
1. JWT + HTTP-Only secure cookie strategy with sliding window refresh token rotation and token family reuse detection.
2. Fine-grained RBAC + ABAC policy engine checking permissions (e.g., 'org:projects:write') rather than hardcoded role strings.
3. Database schema in PostgreSQL (using UUIDv7 primary keys, tenant_id partition key, and row-level security policies).
4. Middleware implementation in Express/NestJS with tenant isolation guarantees.
5. Error handling schema masking internal IDs while logging actionable audit trails.`,
    recommendedModel: 'Claude 3.5 Sonnet / GPT-4o',
    type: 'Coding',
    accessType: 'Free',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    displayOrder: 1,
    featured: true,
    popular: true,
    published: true,
    views: 4890,
    copies: 2150,
    tags: ['Security', 'TypeScript', 'Node.js', 'PostgreSQL', 'RBAC'],
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'p_fpv_drone_alps',
    title: 'FPV Cinematic Drone Flythrough over Alpine Ridge',
    categoryId: 'cat_video',
    description: 'Dynamic camera motion prompt for high-speed mountain ridge flybys with golden hour rim lighting.',
    fullContent: `Extreme high-speed FPV drone shot tracing a razor-sharp snow-dusted alpine ridge in the Swiss Alps during late afternoon golden hour. The camera swoops 2 meters above jagged granite rocks before diving vertically down a 600m sheer glacier cliff. Volumetric sun rays cutting through cold mountain mist, micro-snow particles swirling in propeller wake. Motion blur on periphery, stabilized horizon, photorealistic 35mm IMAX camera aesthetics.`,
    recommendedModel: 'Runway Gen-3 Alpha / Kling AI 1.5',
    type: 'Video',
    accessType: 'Reward Locked',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    displayOrder: 1,
    featured: true,
    popular: false,
    published: true,
    views: 2180,
    copies: 730,
    tags: ['Drone', 'Cinematography', 'Runway Gen-3', 'Landscape'],
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'p_saas_hero_copy',
    title: 'B2B SaaS Conversion Hero Section Framework',
    categoryId: 'cat_marketing',
    description: 'Formulaic copywriting prompt for technical founders turning complex infrastructure into crisp buyer value.',
    fullContent: `You are an elite B2B conversion copywriter (like April Dunford meets Julian Shapiro). We are writing the hero section for a developer infrastructure tool.

Inputs:
- Product: [Insert tool description, e.g. Distributed SQLite sync engine]
- Ideal Customer Profile: [e.g. Senior mobile engineers building offline-first apps]
- Primary Pain Point: [e.g. Conflict resolution logic takes 3 months to build]

Output 4 distinct variations:
1. Category Creator ("The first [noun] engineered for [outcome]")
2. Direct Pain-Relief ("Stop [miserable manual task]. Ship [feature] in 10 minutes.")
3. Speed & Superpower ("Build offline-first apps without touching sync algorithms")
4. Provocative Contrast ("Why your sync engine is costing you 40% of dev velocity")

For each variation, provide:
- H1 Headline (max 8 words, punchy, no jargon)
- Subheadline (max 22 words explaining concrete mechanism)
- Primary CTA label & micro-friction reliever underneath
- Social proof kicker copy`,
    recommendedModel: 'Claude 3.5 Sonnet / Gemini 2.0 Flash',
    type: 'Marketing',
    accessType: 'Free',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    displayOrder: 1,
    featured: false,
    popular: true,
    published: true,
    views: 3120,
    copies: 1640,
    tags: ['Copywriting', 'Landing Page', 'B2B SaaS', 'Conversion'],
    createdAt: Date.now() - 86400000 * 18,
    updatedAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'p_scifi_worldbuilding',
    title: 'Hard Sci-Fi Subterranean Colony Genesis',
    categoryId: 'cat_writing',
    description: 'Deep worldbuilding prompt generating plausible political, thermodynamic, and social ecosystems.',
    fullContent: `Generate a comprehensive Hard Sci-Fi Worldbuilding Bible for a human civilization living 3 kilometers underneath the basalt crust of Europa (Jupiter's moon).

Ensure strict adherence to thermodynamics, tidal heating, and radiation shielding:
1. Energy & Heat Economics: Describe how geothermal hydrothermal vents are harnessed, how heat dissipation is managed into the frozen ice ceiling, and the currency system backed by joules/kilowatt-hours.
2. Societal Castes & Guilds: The Hydroponic Algae Farmers, the Sealing Welders who maintain pressure airlocks, and the Acoustic Navigators listening to Jovian seismic quakes.
3. Vernacular & Slang: 10 everyday colloquial phrases and curses derived from pressure leaks, nitrogen narcosis, and synthetic light cycles.
4. Inciting Crisis: A sudden 0.4 Hz harmonic frequency echoing through the ice crust indicating an anomaly.`,
    recommendedModel: 'Claude 3.5 Sonnet / GPT-4o',
    type: 'Text',
    accessType: 'Reward Locked',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    displayOrder: 1,
    featured: false,
    popular: false,
    published: true,
    views: 1850,
    copies: 620,
    tags: ['Sci-Fi', 'Worldbuilding', 'Fiction', 'Creative Writing'],
    createdAt: Date.now() - 86400000 * 12,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'p_executive_moat',
    title: 'Defensible Moat & Unit Economics Stress Test',
    categoryId: 'cat_business',
    description: 'Executive strategy prompt interrogating switching costs, network effects, and margin durability.',
    fullContent: `Act as a Managing Partner at a top tier technology venture fund and former enterprise COO. Conduct a ruthless strategic moat and unit economics audit on the following business concept:

[Describe Business Model, TAM, and Core Product]

Structure your analysis into 5 rigorous sections:
1. 7 Powers Diagnostic: Evaluate the business against Hamilton Helmer's 7 Powers (Network Effects, Switching Costs, Counter-Positioning, Scale Economies, Cornered Resource, Process Power, Branding). Give each a score (1-5) with concrete vulnerabilities.
2. CAC/LTV & Payback Trajectory: Calculate required payback period under 3 churn scenarios (0.8% monthly logo churn, 2.5% monthly churn, 5% monthly churn).
3. AI Disintermediation Vector: How could commodity LLM agents replicate 80% of this product's workflow in 24 months? Where is the proprietary proprietary data asset?
4. Key Counter-Strategy: 3 unfair advantages the company must engineer immediately.`,
    recommendedModel: 'GPT-4o / Claude 3.5 Sonnet',
    type: 'Text',
    accessType: 'Free',
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    displayOrder: 1,
    featured: true,
    popular: true,
    published: true,
    views: 2980,
    copies: 1410,
    tags: ['Strategy', 'Venture Capital', 'Moats', 'Unit Economics'],
    createdAt: Date.now() - 86400000 * 25,
    updatedAt: Date.now() - 86400000 * 7,
  },
  {
    id: 'p_product_photography',
    title: 'Nordic Minimalist Luxury Watch Studio Shot',
    categoryId: 'cat_image',
    description: 'Clean commercial studio photography prompt on textured travertine marble with natural diffused light.',
    fullContent: `High-end commercial product photography of a matte titanium chronograph watch with sapphire crystal dial resting on a warm rough-hewn travertine stone slab. Crisp shadows, diffused north-facing window light, subtle reflection of architectural skylight on watch glass, dry eucalyptus sprig in soft focus in background. Shot on Hasselblad H6D-100c with 120mm macro lens, f/8 aperture, ISO 64, extreme micro-texture detail on bezel, editorial luxury campaign aesthetic --ar 4:3 --v 6.1`,
    negativePrompt: 'smudges, dust on lens, scratches, plastic texture, cheap, oversaturated yellow, bad lighting',
    recommendedModel: 'Midjourney v6.1 / Flux.1 Dev',
    type: 'Image',
    accessType: 'Free',
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    displayOrder: 2,
    featured: false,
    popular: true,
    published: true,
    views: 4120,
    copies: 1890,
    tags: ['Product Photography', 'Luxury', 'Minimalist', 'Commercial'],
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 6,
  },
  {
    id: 'p_react_performance_audit',
    title: 'React 19 & Next.js Performance Profiler & Memory Leak Fixer',
    categoryId: 'cat_code',
    description: 'Systematic prompt for diagnosing re-render cascades, memory leaks in useEffect, and bundle bloat.',
    fullContent: `You are a Principal Frontend Performance Engineer specializing in React 19 concurrent features and Chrome DevTools profiler traces.

Analyze the provided component hierarchy and state architecture:
[Paste React Code / Component Tree]

Deliver:
1. Re-render Cascade Identification: Identify which props or callbacks are breaking referential stability and causing child subtrees to re-render.
2. React 19 Migration: Rewrite legacy useEffect-driven data synchronization patterns using modern Actions, useActionState, useOptimistic, or Server Components.
3. Memory Leak Audit: Check for uncleaned event listeners, dangling abort controllers, or closures capturing stale closures in long-lived subscriptions.
4. Benchmark: Expected frame-budget savings (target < 16ms main thread execution during rapid user input).`,
    recommendedModel: 'Claude 3.5 Sonnet',
    type: 'Coding',
    accessType: 'Reward Locked',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80',
    displayOrder: 2,
    featured: true,
    popular: false,
    published: true,
    views: 3740,
    copies: 1980,
    tags: ['React 19', 'Performance', 'TypeScript', 'Frontend'],
    createdAt: Date.now() - 86400000 * 8,
    updatedAt: Date.now() - 86400000 * 1,
  },
];
