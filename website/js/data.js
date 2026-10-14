/* SAGE ONE — Data decoded from the design board */
window.SAGE = window.SAGE || {};
(function (S) {
  'use strict';

  /* ===== The 13 Evolutions (material accents from board) ===== */
  S.DATA = {};
  S.DATA.EVOLUTIONS = [
    { n:1,  name:'Bronze',              title:'Initiate',        desc:'Build the Foundation',      accent:'#c98a4b', glow:'#e0a56b', soft:'rgba(201,138,75,.16)', material:'Bronze/Copper',     icon:'i-bronze' },
    { n:2,  name:'Silver',              title:'Seeker',          desc:'Sharpen the Skill',         accent:'#c7d3e6', glow:'#eaf2ff', soft:'rgba(199,211,230,.16)', material:'Silver/White',       icon:'i-silver' },
    { n:3,  name:'Gold',                title:'Adept',           desc:'Proof of Craft',            accent:'#f2c14e', glow:'#ffd97a', soft:'rgba(242,193,78,.16)',  material:'Gold',               icon:'i-gold' },
    { n:4,  name:'Platinum',            title:'Professional',    desc:'Trusted Expert',            accent:'#9fd8e8', glow:'#cfeffa', soft:'rgba(159,216,232,.16)', material:'Platinum/Iridescent',icon:'i-plat' },
    { n:5,  name:'Jade',                title:'Vanguard',        desc:'Lead the Field',            accent:'#2fbf71', glow:'#5fe3a0', soft:'rgba(47,191,113,.16)',  material:'Jade Green',         icon:'i-jade' },
    { n:6,  name:'Ruby',                title:'Virtuoso',        desc:'Mastery Displayed',         accent:'#e0335c', glow:'#ff6f91', soft:'rgba(224,51,92,.16)',   material:'Ruby Red',           icon:'i-ruby' },
    { n:7,  name:'Sapphire',            title:'Luminary',        desc:'Guide Others',              accent:'#2e7bff', glow:'#6fb6ff', soft:'rgba(46,123,255,.16)',  material:'Sapphire Blue',      icon:'i-sapph' },
    { n:8,  name:'Emerald',             title:'Paragon',         desc:'Standard of Excellence',    accent:'#00c48c', glow:'#4ce7be', soft:'rgba(0,196,140,.16)',   material:'Emerald Green',      icon:'i-emer' },
    { n:9,  name:'Diamond Sovereign',   title:'Sovereign',       desc:'Rule Your Domain',          accent:'#e9f4ff', glow:'#ffffff', soft:'rgba(233,244,255,.18)', material:'Diamond/White',      icon:'i-dia' },
    { n:10, name:'Black Opal Realm',    title:'Opal Warden',     desc:'Beyond the Veil',           accent:'#8fa6c8', glow:'#b7d2f5', soft:'rgba(143,166,200,.18)', material:'Opalescent',         icon:'i-opal' },
    { n:11, name:'Painite Core',        title:'Painite Core',    desc:'Rare Power Awakened',       accent:'#ff6b3d', glow:'#ffa46b', soft:'rgba(255,107,61,.16)',  material:'Rare Red/Orange',    icon:'i-pain' },
    { n:12, name:'Void Matter',         title:'Void Walker',     desc:'Master of the Unknown',     accent:'#7b3fe4', glow:'#a97bff', soft:'rgba(123,63,228,.18)',  material:'Cosmic/Void',        icon:'i-void' },
    { n:13, name:'Californium Overlord',title:'Overlord',        desc:'The Apex of SAGE',          accent:'#ffd76a', glow:'#fff0b8', soft:'rgba(255,215,106,.18)', material:'Ultra-rare/Cosmic',  icon:'i-cal' }
  ];

  /* ===== i18n (नेपाली / English) ===== */
  S.DATA.I18N = {
    'onb.welcome':   { en:'Welcome to SAGE ONE', ne:'साज ONE मा स्वागत छ' },
    'onb.mentor':    { en:'Your AI assistant, Job Finder, Research Partner, and more — all in one app.', ne:'तपाईंको AI सहयोगी, जागिर खोज्ने, अनुसन्धान साथी — सबै एउटै एपमा।' },
    'onb.getstarted':{ en:'Get Started', ne:'सुरु गर्नुहोस्' },
    'onb.haveacc':   { en:'I already have an account', ne:'मेरो पहिले नै खाता छ' },
    'onb.chooseLang':{ en:'Choose Your Language', ne:'आफ्नो भाषा छान्नुहोस्' },
    'onb.continue':  { en:'Continue', ne:'अगाडि बढ्नुहोस्' },
    'nav.home':      { en:'Home', ne:'गृह' },
    'nav.apps':      { en:'Apps', ne:'एप्स' },
    'nav.activity':  { en:'Activity', ne:'गतिविधि' },
    'nav.profile':   { en:'Profile', ne:'प्रोफाइल' },
    'nav.sage':      { en:'SAGE', ne:'साज' },
    'home.stage':    { en:'Stage', ne:'चरण' },
    'home.evolution':{ en:'Evolution', ne:'विकास' },
    'home.apps':     { en:'SAGE Apps', ne:'साज एप्स' },
    'home.allapps':  { en:'All Apps', ne:'सबै एप्स' },
    'home.quick':    { en:'Quick Actions', ne:'छिटो कार्यहरू' },
    'chat.placeholder':{ en:'Type a message…', ne:'सन्देश लेख्नुहोस्…' },
    'chat.online':   { en:'Online', ne:'अनलाइन' }
  };

  /* ===== The Flow (Learn → … → Evolution) ===== */
  S.DATA.FLOW = [
    { k:'Learn', ic:'i-learn' }, { k:'Practice', ic:'i-practice' }, { k:'Evidence', ic:'i-evidence' },
    { k:'Skill', ic:'i-skill' }, { k:'Opportunity', ic:'i-opp' }, { k:'Work Earn', ic:'i-work' },
    { k:'Lifetime\nAchievement', ic:'i-award' }, { k:'Evolution', ic:'i-evo' }
  ];

  /* ===== Key Rules (verbatim from board) ===== */
  S.DATA.RULES = [
    'Evolution is <b>lifetime achievement</b> (withdrawal does not reduce it).',
    'Spark is <b>separate</b> from Evolution (it\'s the platform economy).',
    'Money supports the journey, but <b>skill &amp; achievement define Evolution</b>.',
    'The UI stays the same — <b>only visual layers evolve</b>.',
    'The SAGE <b>blue + black identity never disappears</b>.'
  ];

  /* ===== Core Concept: two progression paths ===== */
  S.DATA.CORE = {
    skill: ['Knowledge', 'Skills', 'Performance', 'Capability', 'Completed Achievements', 'Demonstrated Progress'],
    money: ['Earning', 'Economic Achievement', 'System Capability', 'Access to Higher-Level Functions']
  };

  /* ===== 9-Step Transition (Bronze High → Silver Low) ===== */
  S.DATA.TRANSITION = [
    'Particles accelerate', 'Energy concentrates', 'Screen darkens', 'Shockwave / burst',
    'Old material breaks', 'New material forms', 'New particles appear', 'New rank crystallizes', 'Interface settles'
  ];

  /* ===== Design Principles (board) ===== */
  S.DATA.PRINCIPLES = [
    'Keep the original artwork composition.', 'Maintain the SAGE blue and black identity.',
    'Use cosmic/mountain-inspired atmosphere.', 'Show Clear Low / Mid / High variations.',
    'Use particle/glow effects.', 'Keep UI clean and readable.',
    'No color takeover — only accent layers.', 'Maintain the Spiritual + futuristic balance.'
  ];

  /* ===== SAGE Identity colors (permanent) ===== */
  S.DATA.IDENTITY = [
    { n:'Black', c:'#03060f' }, { n:'Deep Blue', c:'#081229' }, { n:'Electric Blue', c:'#2e86ff' },
    { n:'White', c:'#eaf2ff' }, { n:'Subtle Gold', c:'#f5c86b' }
  ];

  /* ===== Fees (board section 14) ===== */
  S.DATA.FEES = {
    market: [
      { label:'Under NPR 10,000', pct:8 },
      { label:'Under NPR 50,000', pct:6 },
      { label:'Under NPR 100,000', pct:5 },
      { label:'Under NPR 500,000', pct:3 },
      { label:'Under NPR 1,000,000', pct:2 },
      { label:'Above NPR 1,000,000', pct:1 }
    ],
    tx: [
      { label:'Under 100,000', pct:1 },
      { label:'Under 1,000,000', pct:0.9 },
      { label:'Under 10,000,000 (Sale Withdraw)', pct:0.7 },
      { label:'Under 100,000,000 (Sale Withdraw)', pct:0.5 },
      { label:'Above 100,000,000', pct:0.3 }
    ]
  };
  S.marketFeePct = function (amount) {
    const t = S.DATA.FEES.market;
    if (amount < 10000) return t[0].pct;
    if (amount < 50000) return t[1].pct;
    if (amount < 100000) return t[2].pct;
    if (amount < 500000) return t[3].pct;
    if (amount < 1000000) return t[4].pct;
    return t[5].pct;
  };
  S.txFeePct = function (amount) {
    if (amount < 100000) return 1;
    if (amount < 1000000) return 0.9;
    if (amount < 10000000) return 0.7;
    if (amount < 100000000) return 0.5;
    return 0.3;
  };

  /* ===== Payment methods (Nepal Phase 1) ===== */
  S.DATA.PAYMENTS = [
    { id:'esewa',   name:'eSewa',    sub:'Digital Wallet',    c:'#60bb46', short:'eSewa' },
    { id:'khalti',  name:'Khalti',   sub:'Digital Wallet',    c:'#5c2d91', short:'Khalti' },
    { id:'fonepay', name:'FonePay',  sub:'Recommended',       c:'#e2231a', short:'FONE' },
    { id:'bank',    name:'Bank Transfer', sub:'Direct banking', c:'#1b5cff', short:'BANK' }
  ];

  /* ===== Marketplace listings ===== */
  S.DATA.LISTINGS = [
    { id:'l1', title:'Honda Dio Scooter', price:180000, cat:'vehicles',   loc:'Kathmandu', when:'2 days ago', ph:'ph-veh',  emoji:'🛵', desc:'2022 model, single owner, all documents clear. New tyres, serviced last month.' },
    { id:'l2', title:'iPhone 14',         price:65000,  cat:'electronics',loc:'Kathmandu', when:'2 days ago', ph:'ph-elec', emoji:'📱', desc:'128GB, Midnight, battery health 91%. Box and bill available.' },
    { id:'l3', title:'House (For Sale)',  price:8500000,cat:'property',   loc:'Pokhara',   when:'3 days ago', ph:'ph-prop', emoji:'🏠', desc:'2.5 aana plot, 3BHK, lake view, RCC structure, road access 16ft.' },
    { id:'l4', title:'Land (For Sale)',   price:4500000,cat:'property',   loc:'Chitwan',   when:'1 day ago',  ph:'ph-land', emoji:'🌳', desc:'8 aana south-facing land, fertile, near highway, great for farmhouse.' },
    { id:'l5', title:'MacBook Air M2',    price:145000, cat:'electronics',loc:'Lalitpur',  when:'5 hours ago',ph:'ph-elec', emoji:'💻', desc:'8GB/256GB, space grey, 112 charge cycles, AppleCare till 2025.' },
    { id:'l6', title:'Royal Enfield Classic 350', price:310000, cat:'vehicles', loc:'Pokhara', when:'4 days ago', ph:'ph-veh', emoji:'🏍️', desc:'2021 gunmetal grey, 12,000 km, first owner, recently serviced.' }
  ];
  S.DATA.CATS = [
    { id:'all',   name:'All',      ic:'i-grid' },
    { id:'vehicles', name:'Vehicles', ic:'i-car' },
    { id:'electronics', name:'Electronics', ic:'i-phone' },
    { id:'property', name:'Property', ic:'i-home' },
    { id:'services', name:'Services', ic:'i-brief' }
  ];

  /* ===== Jobs ===== */
  S.DATA.JOBS = [
    { id:'j1', title:'Frontend Developer', company:'TechNova', pay:'NPR 25K–40K', loc:'Kathmandu', type:'Full-time', logo:'TN', c:'#1b5cff', tags:['React','Remote-friendly'] },
    { id:'j2', title:'Graphic Designer', company:'PixelKathmandu', pay:'NPR 20K–35K', loc:'Lalitpur', type:'Part-time', logo:'PK', c:'#8b3fe4', tags:['Figma','Branding'] },
    { id:'j3', title:'IT Support Specialist', company:'HimalTech', pay:'NPR 15K–25K', loc:'Pokhara', type:'Full-time', logo:'HT', c:'#00a86b', tags:['Hardware','Windows'] },
    { id:'j4', title:'Flutter Developer', company:'Sage Labs', pay:'NPR 30K–50K', loc:'Remote', type:'Full-time', logo:'SL', c:'#e0335c', tags:['Flutter','Dart'] }
  ];

  /* ===== Learning ===== */
  S.DATA.COURSES = [
    { id:'c1', title:'Complete Flutter Development', meta:'12 modules · Beginner', prog:40, emoji:'📱', g:'linear-gradient(135deg,#1b5cff,#0b2f7a)' },
    { id:'c2', title:'Digital Marketing', meta:'8 modules · Intermediate', prog:0, emoji:'📈', g:'linear-gradient(135deg,#8b3fe4,#2a1060)' },
    { id:'c3', title:'English for Professionals', meta:'10 modules · All levels', prog:15, emoji:'🗣️', g:'linear-gradient(135deg,#00a86b,#073a28)' },
    { id:'c4', title:'UI/UX Design Fundamentals', meta:'6 modules · Beginner', prog:0, emoji:'🎨', g:'linear-gradient(135deg,#e0335c,#4a0a1e)' }
  ];

  /* ===== Community ===== */
  S.DATA.GROUPS = [
    { id:'g1', name:'Tech Nepal', meta:'12.5K members · 2 new posts', emoji:'💻', c:'linear-gradient(135deg,#1b5cff,#0b2f7a)' },
    { id:'g2', name:'Freelancers Hub', meta:'8.2K members · 3 new posts', emoji:'🤝', c:'linear-gradient(135deg,#8b3fe4,#2a1060)' },
    { id:'g3', name:'Study & Career', meta:'5.6K members · 1 new post', emoji:'📚', c:'linear-gradient(135deg,#00a86b,#073a28)' },
    { id:'g4', name:'Nepal Startup', meta:'4.3K members · 5 new posts', emoji:'🚀', c:'linear-gradient(135deg,#e0335c,#4a0a1e)' }
  ];

  /* ===== Files ===== */
  S.DATA.FILES = [
    { id:'f1', name:'Resume.pdf', size:'2.4 MB', kind:'pdf', when:'2 days ago' },
    { id:'f2', name:'Project_Proposal.docx', size:'1.2 MB', kind:'doc', when:'1 day ago' },
    { id:'f3', name:'Images', size:'128 items', kind:'img', when:'Today' },
    { id:'f4', name:'Videos', size:'12 items', kind:'vid', when:'Yesterday' }
  ];

  /* ===== AI Studio tools ===== */
  S.DATA.TOOLS = [
    { id:'image', name:'Image Generation', sub:'5 Spark', ic:'i-image', g:'linear-gradient(135deg,#1b5cff,#0b2f7a)', live:true },
    { id:'video', name:'Video Generation', sub:'Dynamic (length, density, complexity)', ic:'i-video', g:'linear-gradient(135deg,#8b3fe4,#2a1060)', live:true },
    { id:'code',  name:'Code Generation', sub:'Coming soon', ic:'i-code', g:'linear-gradient(135deg,#00a86b,#073a28)', live:false }
  ];

  /* ===== Spark usage (board) ===== */
  S.DATA.SPARK_USAGE = [
    { k:'Image Generation', v:'5 Spark' },
    { k:'Video Generation', v:'Dynamic (length, density, complexity)' },
    { k:'Marketplace Fees', v:'8% → 1% (based on volume)' },
    { k:'Transaction Fee', v:'≈ 0.3% (based on volume)' }
  ];

  /* ===== SAGE LOGO STATES & ANIMATIONS (9 states, board 2) ===== */
  S.DATA.LOGO_STATES = [
    { id:'idle',      name:'IDLE',      sub:'Calm & Ready',          c:'#4fa8ff', c2:'#8fd4ff' },
    { id:'searching', name:'SEARCHING', sub:'Collecting Sources',    c:'#00b4ff', c2:'#6fd2ff' },
    { id:'analyzing', name:'ANALYZING', sub:'Processing Info',       c:'#a855f7', c2:'#d0a6ff' },
    { id:'verifying', name:'VERIFYING', sub:'Checking Accuracy',     c:'#22d3ee', c2:'#8ef0ff' },
    { id:'success',   name:'SUCCESS',   sub:'Task Completed',        c:'#34d399', c2:'#8ff5c8' },
    { id:'failure',   name:'FAILURE',   sub:'Research Failed',       c:'#ff6b6b', c2:'#ff9f6b' },
    { id:'recovery',  name:'RECOVERY',  sub:'Rebuilding Systems',    c:'#d0b3ff', c2:'#70d3fc' },
    { id:'earning',   name:'EARNING',   sub:'Money Earned',          c:'#f5a623', c2:'#ffd97a' },    { id:'premium',   name:'PREMIUM',   sub:'Unlocking Features',     c:'#9d7bff', c2:'#c9b3ff' },
    { id:'listening', name:'LISTENING', sub:'Awaiting Your Words',    c:'#1f9dff', c2:'#7fe9ff' },
    { id:'speaking',  name:'SPEAKING',  sub:'Voice Reply Active',     c:'#2fe0b7', c2:'#8ef0ff' },
    { id:'thinking',  name:'THINKING',  sub:'Reasoning In Depth',     c:'#14b8ff', c2:'#a06bff' }
  ];

  /* ===== AGENT WORKSPACE (boards 5-8: mission control, marketplace, workflow, integrations) ===== */
  S.DATA.AGENTS = [
    { id:'aris',  name:'Arc Research',    cat:'Research',    emoji:'🔮', c:'#2f86ff', tag:'Popular',
      desc:'Web-scale research with cited sources and structured briefs.', price:0.004, rating:4.9, runs:'18.2k', tags:['Deep search','Citations'] },
    { id:'lex',   name:'LegalEase',       cat:'Legal',       emoji:'⚖️', c:'#9d7bff', tag:'Verified',
      desc:'Contract review, clause extraction and plain-language summaries.', price:0.012, rating:4.8, runs:'9.4k', tags:['Contracts','NDA review'] },
    { id:'neuro', name:'NeuroMind',       cat:'Analytics',   emoji:'🧠', c:'#22d3ee', tag:'',
      desc:'Turns raw data into dashboards, forecasts and clear decisions.', price:0.018, rating:4.7, runs:'12.1k', tags:['Forecasting','BI'] },
    { id:'forge', name:'CodeForge',       cat:'Development', emoji:'⚒️', c:'#f5a623', tag:'Verified',
      desc:'Writes, reviews and refactors code across 40+ languages.', price:0.02, rating:4.9, runs:'27.6k', tags:['Code review','Refactor'] },
    { id:'urban', name:'UrbanCraft',      cat:'Automation',  emoji:'🏙️', c:'#34d399', tag:'',
      desc:'Automates busywork: filing, syncing, scheduling, chasing.', price:0.008, rating:4.6, runs:'7.9k', tags:['RPA','Sync'] },
    { id:'shield',name:'SecureScan',      cat:'Security',    emoji:'🛡️', c:'#ff6b6b', tag:'Popular',
      desc:'Vulnerability scanning, leak checks and hardening plans.', price:0.014, rating:4.8, runs:'11.3k', tags:['Pentest','OSINT'] },
    { id:'data',  name:'DataStream',      cat:'Analytics',   emoji:'📊', c:'#4fa8ff', tag:'',
      desc:'Live data pipelines, cleaning and automated reporting.', price:0.011, rating:4.5, runs:'6.2k', tags:['ETL','Reports'] },
    { id:'fin',   name:'Finlight',        cat:'Finance',     emoji:'📈', c:'#ffd97a', tag:'Verified',
      desc:'Market briefs, portfolio notes and risk alerts in real time.', price:0.016, rating:4.7, runs:'14.8k', tags:['Markets','Risk'] },
    { id:'harmony',name:'HarmonyArts',    cat:'Writing',     emoji:'🖌️', c:'#ff9f6b', tag:'',
      desc:'Brand-safe copy, long-form articles and tone matching.', price:0.006, rating:4.6, runs:'21.0k', tags:['Copywriting','SEO'] },
    { id:'flow',  name:'FlowOps',         cat:'Automation',  emoji:'🔁', c:'#22d3ee', tag:'',
      desc:'Cross-app orchestration with retries, guards and audit logs.', price:0.009, rating:4.7, runs:'8.7k', tags:['Orchestration','Retries'] },
    { id:'pulse', name:'NewsSignal',       cat:'Support',    emoji:'🎧', c:'#8ff5c8', tag:'Popular',
      desc:'Watches your feeds, triages tickets and drafts replies.', price:0.005, rating:4.5, runs:'16.4k', tags:['Triage','Replies'] },
    { id:'poly',  name:'Polyglot',        cat:'Language',    emoji:'🌐', c:'#c9b3ff', tag:'',
      desc:'Nuanced translation across 90+ languages, idiom aware.', price:0.007, rating:4.8, runs:'19.9k', tags:['Translate','Locate'] }
  ];
  S.DATA.AGENT_CATS = ['All','Research','Development','Analytics','Writing','Support','Sales','Legal','Automation','Finance','Healthcare','Language','Security'];

  S.DATA.AGENT_RUNS = [
    { id:'run-3841', agent:'Arc Research',  emoji:'🔮', status:'running',   task:'Nepal fintech market scan',   progress:62, started:'2m ago', cost:0.11, steps:['Fetching sources','Reading pages','Cross-checking','Drafting brief'] },
    { id:'run-3840', agent:'CodeForge',     emoji:'⚒️', status:'running',   task:'Refactor payments module',   progress:34, started:'6m ago', cost:0.22, steps:['Parsing repo','Mapping deps','Patch plan','Applying'] },
    { id:'run-3839', agent:'Finlight',      emoji:'📈', status:'queued',    task:'Morning market brief',       progress:0,  started:'—',      cost:0.00, steps:['Load watchlist','Fetch quotes','Summarize'] },
    { id:'run-3836', agent:'SecureScan',    emoji:'🛡️', status:'done',      task:'Perimeter vulnerability scan',progress:100,started:'1h ago', cost:0.34, steps:['Port sweep','CVE match','Report'] },
    { id:'run-3834', agent:'HarmonyArts',   emoji:'🖌️', status:'done',      task:'Landing page copy v3',       progress:100,started:'3h ago', cost:0.09, steps:['Brief','Draft','Tone pass'] }
  ];
  S.DATA.APPROVALS = [
    { id:'ap-9',  agent:'CodeForge',  emoji:'⚒️', act:'Push commit to main',            risk:'high',   when:'2m ago', meta:'payments/charge.js · +42 −17' },
    { id:'ap-8',  agent:'SecureScan', emoji:'🛡️', act:'Block IP 203.0.113.44',           risk:'medium', when:'14m ago', meta:'Rate-limit policy · auto 30m' },
    { id:'ap-7',  agent:'Finlight',   emoji:'📈', act:'Rebalance portfolio 12%',        risk:'high',   when:'40m ago', meta:'NPR 84,000 → ETF basket' },
    { id:'ap-6',  agent:'HarmonyArts',emoji:'🖌️', act:'Publish article to blog',        risk:'low',    when:'1h ago',  meta:'“Freelancing in Nepal 2026”' }
  ];
  S.DATA.FLEET = [
    { n:'Research Cluster',  agents:['🔮','📊','📈'], health:98, load:64, state:'healthy' },
    { n:'Build Cluster',     agents:['⚒️','🔁'],       health:95, load:41, state:'healthy' },
    { n:'Growth Cluster',    agents:['🖌️','🎧','🌐'], health:91, load:78, state:'degraded' }
  ];

  /* integrations catalog — fields are stored as env-style vars; secrets stay in this browser */
  S.DATA.INTEGRATIONS = [
    { id:'openai',  name:'OpenAI',    ic:'i-sparkles', c:'#10a37f', test:'openai',
      hint:'Create an API key at platform.openai.com/api-keys', portal:'platform.openai.com/api-keys',
      fields:[{ k:'OPENAI_API_KEY', secret:true, ph:'sk-…' }] },
    { id:'telegram',name:'Telegram',  ic:'i-send',    c:'#2aabee', test:'telegram',
      hint:'Create a bot via @BotFather, then paste the token', portal:'t.me/BotFather',
      fields:[{ k:'TELEGRAM_BOT_TOKEN', secret:true, ph:'123456:ABC-DEF…' }] },
    { id:'discord', name:'Discord',   ic:'i-users',   c:'#5865f2', test:'discord',
      hint:'Create a bot in the Developer Portal → Bot → Token', portal:'discord.com/developers/applications',
      fields:[{ k:'DISCORD_BOT_TOKEN', secret:true, ph:'MTA…' }] },
    { id:'supabase',name:'Supabase',  ic:'i-layers',  c:'#3ecf8e', test:'supabase',
      hint:'Project Settings → API → URL + anon key', portal:'supabase.com/dashboard/account/tokens',
      fields:[{ k:'SUPABASE_URL', ph:'https://xxx.supabase.co' }, { k:'SUPABASE_ANON_KEY', secret:true, ph:'eyJ…' }] },
    { id:'github',  name:'GitHub',    ic:'i-code',    c:'#e6edf3', test:'github',
      hint:'Settings → Developer settings → Personal access token', portal:'github.com/settings/tokens',
      fields:[{ k:'GITHUB_TOKEN', secret:true, ph:'ghp_…' }] },
    { id:'webhook', name:'Custom Webhook', ic:'i-link', c:'#4fa8ff', test:'http',
      hint:'Any HTTPS endpoint agents can call (n8n, Make, your API)', portal:'',
      fields:[{ k:'WEBHOOK_URL', ph:'https://hooks.example.com/…' }, { k:'WEBHOOK_SECRET', secret:true, ph:'optional signing secret' }] }
  ];

  /* ===== RESEARCH STATE MACHINE (board 4) ===== */
  S.DATA.RS = [
    { id:'idle',        label:'Idle',        cap:'Calm. Ready. Always on.',
      title:'', sub:'Your Personal AI Mentor &\nExecution Partner', c:'#ebeaf0', pct:0, stats:[] },
    { id:'researching', label:'Researching', cap:'Sources, data, real-time info.',
      title:'Researching…', sub:'Scanning trusted sources for the best information', c:'#00b4ff', pct:62,
      stats:[ ['Sources Found','14'], ['Sources Verified','9'], ['Analyzing','6'] ] },
    { id:'analyzing',   label:'Analyzing',   cap:'Processing. Comparing. Thinking.',
      title:'Analyzing…', sub:'Comparing information from multiple sources for accuracy and relevance', c:'#a855f7', pct:78,
      stats:[ ['Cross-checking facts','12'], ['Finding contradictions','3'], ['Extracting key points','8'] ] },
    { id:'verifying',   label:'Verifying',   cap:'Checking. Validating. Ensuring accuracy.',
      title:'Verifying…', sub:'Confirming sources and validating information', c:'#22d3ee', pct:86,
      stats:[ ['Fact-checking','12/12'], ['Source verification','9/12'], ['Bias detection','4/4'] ] },
    { id:'success',     label:'Success',     cap:'Complete. Accurate. Ready.',
      title:'Research Complete', sub:'Here\'s what I found for you.', c:'#34d399', pct:100, stats:[] }
  ];
  S.DATA.RS_CHIPS = ['Google','YouTube','Wikipedia','Reddit','GitHub','X','+ More'];
  S.DATA.RS_NAV = ['Home','Research','Memory','Tools'];

  /* Source panel (during research) */
  S.DATA.LIVE_SOURCES = [
    { n:'Google',       t:'Web Search',      pages:7, used:5, c:'#4285f4', g:'G',  verified:true },
    { n:'YouTube',      t:'Videos',          pages:3, used:2, c:'#ff0000', g:'▶',  verified:true },
    { n:'Wikipedia',    t:'General knowledge',pages:4, used:3, c:'#f1f3f4', g:'W',  verified:true, dark:true },
    { n:'Reddit',       t:'Discussions',     pages:2, used:1, c:'#ff4500', g:'●',  verified:true },
    { n:'GitHub',       t:'Technical Docs',  pages:1, used:1, c:'#24292f', g:'GH', verified:true },
    { n:'X (Twitter)',  t:'Latest Updates',  pages:2, used:1, c:'#000000', g:'X',  verified:true }
  ];
  S.DATA.SOURCE_PAGES = [
    { n:'techcrunch.com', s:'Latest AI trends in 2025…', ok:true,  g:'TC', c:'#0aad0a' },
    { n:'wikipedia.org',  s:'Artificial intelligence…',  ok:true,  g:'W',  c:'#f1f3f4', dark:true },
    { n:'forbes.com',    s:'The future of AI assistants…', ok:true, g:'F', c:'#00b3e6' },
    { n:'reddit.com',    s:'r/ChatGPT | User experiences…', ok:true, g:'●', c:'#ff4500' },
    { n:'youtube.com',   s:'AI tools in 2025 - Full Guide…', ok:true, g:'▶', c:'#ff0000' },
    { n:'medium.com',    s:'The evolution of personal AI…',  ok:false, g:'M', c:'#000000' }
  ];

  /* Failure Sequence (10–30 seconds) */
  S.DATA.FAIL_SEQ = [
    { n:1, name:'Glitch',     t:'0–4s',   d:'System detects an issue.',   c:'#ff6b6b', st:'failure' },
    { n:2, name:'Smoke',      t:'4–8s',   d:'Searching for recovery…',    c:'#ff8f6b', st:'failure' },
    { n:3, name:'Crack',      t:'8–12s',  d:'Partial system failure.',    c:'#ff6b6b', st:'failure' },
    { n:4, name:'Recovery',   t:'12–18s', d:'Rebuilding connection…',     c:'#a855f7', st:'recovery' },
    { n:5, name:'Reconnect',  t:'18–25s', d:'Reconnecting sources…',      c:'#70d3fc', st:'recovery' },
    { n:6, name:'Stabilized', t:'25–30s', d:'Back online!',               c:'#34d399', st:'success' }
  ];
  /* Recovery Sequence: purple → light sky blue → green */
  S.DATA.REC_SEQ = [
    { name:'Failure',     sub:'System unstable',   c:'#ff6b6b' },
    { name:'Rebuilding',  sub:'Reconnecting…',     c:'#a855f7' },
    { name:'Restoring',   sub:'Data syncing…',     c:'#4fa8ff' },
    { name:'Stabilizing', sub:'Almost there…',     c:'#22d3ee' },
    { name:'Success',     sub:'Operation complete',c:'#34d399' }
  ];
  /* Color Palette (Meaningful. Consistent.) */
  S.DATA.PALETTE = [
    { n:'Idle / Neutral',                c:'#ebeaf0' },
    { n:'Researching (Blue)',            c:'#00b4ff' },
    { n:'Analyzing (Purple)',            c:'#a855f7' },
    { n:'Verifying (Cyan)',              c:'#22d3ee' },
    { n:'Recovery (Purple → Sky Blue)',  c:'#ddb4fc', c2:'#70d3fc' },
    { n:'Success (Green)',               c:'#34d399' },
    { n:'Warning (Amber)',               c:'#f59e0b' },
    { n:'Failure (Red/Orange)',          c:'#ff6b6b' }
  ];
  S.DATA.RS_ACTIONS = ['Deep Research','Summarize','Create','More'];

  /* ===== EARNING ANIMATION — 7 stages (board 3) ===== */
  S.DATA.EARN_STAGES = [
    { n:1, name:'RECOGNITION',       t:'0–2s',   ms:2000, d:'SAGE detects a successful transaction / payment received.',       chip:'Analyzing payment details…' },
    { n:2, name:'ENERGY BURST',      t:'2–4s',   ms:2000, d:'Energy rings expand, preparing for the value transfer.',           chip:'Processing…' },
    { n:3, name:'VALUE PARTICLES',   t:'4–7s',   ms:3000, d:'Value particles flow into SAGE and transform into wealth energy.', chip:'Receiving funds…' },
    { n:4, name:'CORE TRANSFORMATION',t:'7s',    ms:3000, d:'SAGE core brightens with golden energy.',                          chip:'Finalizing…' },
    { n:5, name:'AMOUNT REVEAL',     t:'10–13s', ms:3000, d:'Amount is counted up with smooth animation.',                      chip:'Payment received!' },
    { n:6, name:'CELEBRATION',       t:'13–15s', ms:2000, d:'A subtle golden wave confirms your earnings.',                    chip:'You\'re doing great!' },
    { n:7, name:'STABILIZE',         t:'15–17s', ms:2000, d:'SAGE returns to normal state, ready for your next command.',       chip:'Earning complete.' }
  ];
  S.DATA.EARN_TIERS = [
    { id:'small',     name:'SMALL EARNING',       range:'NPR 500 – 2,000',     amount:1250,  c:'#22d3ee', c2:'#8ef0ff',
      d:'Quick pulse + light particles. (No full transformation)',        use:'Perfect for small tasks, commissions, or tips.' },
    { id:'medium',    name:'MEDIUM EARNING',      range:'NPR 2,001 – 10,000',  amount:5000,  c:'#8b5cf6', c2:'#c9b3ff',
      d:'Full animation sequence (with golden particles)',                use:'For client payments, sales, or project income.' },
    { id:'major',     name:'MAJOR MILESTONE',     range:'NPR 10,001 – 100,000',amount:25000, c:'#f5a623', c2:'#ffd97a',
      d:'Extended cinematic effect with light beams and particles',       use:'Big project, long-term client, or multiple payments.' },
    { id:'legendary', name:'LEGENDARY MILESTONE', range:'NPR 100,000+',        amount:100000,c:'#ffd76a', c2:'#fff0b8',
      d:'Epic animation with 3D elements, particles and sound boost',     use:'Rare. Life changing. A new chapter.' }
  ];
  S.DATA.EARN_SUMMARY = {
    title:'Money Earned', amount:5000, when:'Today · 10:24 AM',
    from:'Client: Digital Marketing Project', pid:'#DBM-7824',
    points:['Project completed','Client payment received','Added to your balance']
  };
  S.tierFor = function (amount) {
    if (amount >= 100000) return S.DATA.EARN_TIERS[3];
    if (amount >= 10001) return S.DATA.EARN_TIERS[2];
    if (amount >= 2001) return S.DATA.EARN_TIERS[1];
    return S.DATA.EARN_TIERS[0];
  };

  /* ===== WALLET / PREMIUM / DASHBOARD (board 2) ===== */
  S.DATA.WALLET_TX = [
    { n:'Client Payment',  when:'Today · 10:24 AM',      v:5000,  ic:'i-case' },
    { n:'Premium Feature', when:'Yesterday · 05:21 PM',  v:-2000, ic:'i-crown' },
    { n:'Research Credits',when:'Sep 18 · 11:12 AM',     v:-500,  ic:'i-search' },
    { n:'Subscription',    when:'Sep 15 · 09:10 AM',     v:-1000, ic:'i-lock' }
  ];
  S.DATA.PREMIUM_FEATURES = ['Advanced Research','Unlimited Access','Custom AI Models','Priority Processing','API Access','Exclusive Tools'];
  S.DATA.LIVE_ACTIVITY = [
    { n:'Google',    s:12, when:'2m', c:'#4285f4', g:'G'  },
    { n:'YouTube',   s:8,  when:'3m', c:'#ff0000', g:'▶'  },
    { n:'Wikipedia', s:6,  when:'4m', c:'#f1f3f4', g:'W', dark:true },
    { n:'Reddit',    s:5,  when:'5m', c:'#ff4500', g:'●'  },
    { n:'GitHub',    s:3,  when:'6m', c:'#24292f', g:'GH' }
  ];
  S.DATA.RECENT = [
    { n:'Best AI video tools (free)', when:'2 hours ago', ic:'i-video' },
    { n:'GROE brand strategy',        when:'5 hours ago', ic:'i-sparkles' },
    { n:'Nepal market analysis',      when:'7 hours ago', ic:'i-trend' },
    { n:'Content plan - Dhun Barsa',  when:'1 day ago',   ic:'i-bookmark' }
  ];
  S.DATA.DESK_NAV = [
    { id:'home',     name:'Home',     ic:'i-home' },
    { id:'agents',   name:'Agents',   ic:'i-hex' },
    { id:'chat',     name:'Chat',     ic:'i-chat' },
    { id:'research', name:'Research', ic:'i-search' },
    { id:'aistudio', name:'Tools',    ic:'i-grid' },
    { id:'memory',   name:'Memory',   ic:'i-layers' },
    { id:'files',    name:'Files',    ic:'i-folder' },
    { id:'wallet',   name:'Wallet',   ic:'i-wallet' },
    { id:'settings', name:'Settings', ic:'i-gear' }
  ];
  S.DATA.MEMORY = [
    { k:'You are based in', v:'Kathmandu, Nepal', ic:'i-pin' },
    { k:'Learning path', v:'Complete Flutter Development (40%)', ic:'i-book' },
    { k:'Current focus', v:'Freelancing & client work', ic:'i-target' },
    { k:'Preferred language', v:'English · नेपाली', ic:'i-globe' },
    { k:'Saved research', v:'Nepal market analysis · 12 sources', ic:'i-search' },
    { k:'Last goal', v:'Reach Stage 1 MID intensity', ic:'i-diamond' }
  ];
  S.DATA.TAGLINE = ['THINK','RESEARCH','CREATE','EXECUTE','EARN'];

  /* ===== Chat brain ===== */
  S.DATA.CHAT_QS = [
    'Best place to visit in Nepal?',
    'How do I start freelancing?',
    'What skill should I learn in 2026?',
    'Explain SAGE Evolution to me'
  ];
  S.DATA.SOURCES = [
    { n:'Nepal Tourism Board', u:'www.ntb.gov.np' },
    { n:'Lonely Planet', u:'www.lonelyplanet.com' },
    { n:'Wikipedia', u:'www.wikipedia.org' }
  ];
  S.DATA.RESEARCH_STEPS = [
    'Searching reliable sources…',
    'Reading and analyzing content…',
    'Comparing information…',
    'Preparing final answer…'
  ];
  S.answerFor = function (q) {
    const t = q.toLowerCase();
    if (/visit|place|nepal|trek|travel|pokhara/.test(t)) return {
      research: true,
      text: 'Nepal offers many amazing places! Here are some top destinations:',
      list: ['Poona Hill — Stunning sunrise views', 'Panchasaur — Lakeside peace', 'Lumbini — Birthplace of Buddha', 'Kathmandu — History & temples'],
      extra: 'Would you like a detailed travel plan or a budget-friendly option?',
      actions: ['Show me affordable hotels in Pokhara', 'Create a travel plan', 'Find travel guides']
    };
    if (/skill|learn|2026|course/.test(t)) return {
      text: 'Top skills with demand in Nepal right now:',
      list: ['Flutter / Mobile Development', 'UI/UX Design', 'Digital Marketing', 'AI & Automation workflows'],
      extra: 'Start with Complete Flutter Development — 12 modules, beginner friendly.',
      actions: ['Open Learning']
    };
    if (/freelanc|money|\bearn|\bjob|\bwork/.test(t)) return {
      text: 'Here\'s the fastest path to freelancing with SAGE:',
      list: ['Pick one skill from Learning (Flutter or Design)', 'Complete a course + earn a Certificate', 'Build 2 portfolio files in Files', 'Apply via the Jobs app + list a service on Marketplace'],
      extra: 'Every completed step raises your Evolution — money alone never does.',
      actions: ['Open Learning', 'Browse Jobs']
    };
    if (/evolution|stage|spark|rank/.test(t)) return {
      text: 'SAGE Evolution is your lifetime achievement layer:',
      list: ['13 ranks — Bronze → Californium Overlord', 'Each rank has Low / Mid / High intensity', 'Driven by skill & achievement, never by withdrawals', 'Spark is separate — it\'s the platform economy'],
      extra: 'The blue + black SAGE identity never disappears — only accent layers evolve.',
      actions: ['Open Evolution']
    };
    return {
      text: 'I can help with that. I\'m your mentor and execution partner — I can research topics, plan your learning, find jobs, and track your Evolution.',
      extra: 'Try asking about visiting Nepal, freelancing, or which skill to learn next.',
      actions: ['Open Learning', 'Browse Jobs']
    };
  };

})(window.SAGE);
