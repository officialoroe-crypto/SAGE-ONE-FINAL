/* SAGE ONE — local utility helpers and structured answer rendering.
   Live inference is routed through authenticated SAGE Core; never call paid providers from the browser. */
window.SAGE = window.SAGE || {};
(function (S) {
  'use strict';

  /* ---------- provider config: server-managed only ---------- */
  const CFG_KEY = 'sage-ai-cfg-v1';
  const DEF = { mode: 'core', provider: 'core', key: '', model: 'server-managed', base: '' };
  let cfg = Object.assign({}, DEF);
  // Remove the legacy browser-stored provider key/config. Secrets belong on the server, never in localStorage.
  try { localStorage.removeItem(CFG_KEY); } catch (e) {}

  const AI = S.AI = {};
  AI.cfg = function () { return Object.assign({}, cfg, { key: '', mode: 'core', provider: 'core' }); };
  AI.setCfg = function () { cfg = Object.assign({}, DEF); };
  AI.isLive = function () { return !!(S.backend && S.backend.isOwnerAuthenticated && S.backend.isOwnerAuthenticated()); };

  /* ---------- helpers ---------- */
  const list = (a) => a.map(x => ({ t: 'ul', v: [x] }));
  function steps(a) { return { t: 'ol', v: a }; }
  function head(v) { return { t: 'h', v: v }; }
  function note(v) { return { t: 'note', v: v }; }
  function kv(pairs) { return { t: 'kv', v: pairs.map(p => ({ k: p[0], v: p[1] })) }; }

  /* ---------- knowledge base ---------- */
  const KB = [
    {
      id: 'skills', research: true,
      re: /\b(skills?|learn(ing)?|course|upskill|2026|in demand|what should i (learn|study)|which skill|new skill)\b/,
      kw: ['skill', 'learn', '2026', 'course', 'in demand', 'upskill', 'what to learn'],
      build: () => ({
        title: 'Top skills to learn in 2026',
        intro: 'In 2026 the highest-leverage skills sit where AI meets execution — the people who can build with AI, sell with content, and be trusted with money. Pick ONE lane below and go deep: breadth without proof does not get hired.',
        blocks: [
          head('Fastest to earn money (0–6 months)'),
          { t: 'ul', v: [
            'AI automation & agent workflows — build tools that cut a real business cost. Sellable in weeks, not years.',
            'Short-form video + content systems — every brand needs Reels and TikToks that actually convert.',
            'Performance marketing (Meta + Google ads) — it is measured in revenue, so it is easy to prove.'
          ] },
          head('Highest long-term ceiling (6–18 months)'),
          { t: 'ul', v: [
            'AI engineering — LLM apps, retrieval, evals and agents. The hardest role to hire for right now.',
            'Data engineering & analytics — most companies have AI tools but no clean data to feed them.',
            'Cloud + DevOps — unglamorous, always in demand, and it pays well remotely.'
          ] },
          head('Best fit for the Nepal market'),
          { t: 'ul', v: [
            'Flutter / mobile development — local startups and diaspora clients both buy it.',
            'UI/UX design — low startup cost, high leverage, and it pairs with every other skill here.',
            'Bookkeeping & financial ops for overseas clients — recurring income, timezone friendly.'
          ] },
          head('How to choose in 60 seconds'),
          steps([
            'Which list made you lean in? That is your lane — interest beats hype every time.',
            'Can you picture doing it for 12 months once it gets boring? If not, take the next one.',
            'Commit to 30 days, not forever. You can always switch after one sprint.'
          ]),
          note('Rule of thumb: do not collect certificates. Ship 3 real projects, publish them, and charge — that is what actually gets you hired in 2026.')
        ],
        sources: [
          { n: 'WEF Future of Jobs Report', u: 'weforum.org/reports/future-of-jobs' },
          { n: 'LinkedIn Workplace Learning Report', u: 'learning.linkedin.com/resources/workplace-learning-report' },
          { n: 'Coursera Job Skills Report', u: 'coursera.org/skills-reports' }
        ],
        followups: ['Build me a 30-day learning plan', 'Which skill fits my current background?', 'Show me courses in Learning'],
        confidence: 0.93
      })
    },
    {
      id: 'travel', research: true,
      re: /\b(nepal|visit|travel|trek|pokhara|lumbini|kathmandu|tourist|place to|holiday|trip)\b/,
      kw: ['nepal', 'visit', 'travel', 'pokhara', 'trek', 'lumbini', 'kathmandu', 'place'],
      build: () => ({
        title: 'Best places to visit in Nepal',
        intro: 'Nepal packs eight of the world fourteen highest peaks, a living Himalayan culture, and a subtropical lowland — all within a few hours of Kathmandu. Here is how to choose based on how much time you have.',
        blocks: [
          head('If you have 3–4 days'),
          { t: 'ul', v: [
            'Pokhara — Phewa Tal, Sarangkot sunrise, and the World Peace Pagoda. The easiest trip with the biggest payoff.',
            'Kathmandu Valley — Bhaktapur, Patan and Swayambhunath. Best if you like history and craft over altitude.',
            'Nagarkot or Dhulikhel — a short escape for a Himalaya horizon without a trek.'
          ] },
          head('If you have 7–14 days'),
          { t: 'ul', v: [
            'Annapurna Base Camp or Poon Hill — tea-house trekking, well trodden, good for a first multi-day trek.',
            'Lumbini — the birthplace of Buddha, quiet and under-visited. Pair it with Chitwan for wildlife.',
            'Chitwan or Bardia — jungle safaris, one-horned rhino and (in Bardia) tigers.'
          ] },
          head('Practical notes'),
          steps([
            'Best season: October–November for clear peaks, March–April for rhododendron and warmer trails.',
            'Fly Kathmandu–Pokhara instead of the 6–7 hour road if your days are limited.',
            'Carry cash outside Kathmandu — card acceptance stops at the district town.'
          ]),
          note('Tell me your dates and budget and I will turn this into a day-by-day plan.')
        ],
        sources: [
          { n: 'Nepal Tourism Board', u: 'ntb.gov.np' },
          { n: 'Lonely Planet — Nepal', u: 'lonelyplanet.com/nepal' },
          { n: 'Visit Nepal', u: 'visitnepal.com' }
        ],
        followups: ['Create a 7-day Nepal travel plan', 'Show me affordable hotels in Pokhara', 'What is the best trek for beginners?'],
        confidence: 0.92
      })
    },
    {
      id: 'freelance', research: true,
      re: /\b(freelanc\w*|upwork|fiverr|side hustle|client work|charge for|make money online|income)\b/,
      kw: ['freelance', 'upwork', 'fiverr', 'client', 'side hustle', 'income'],
      build: () => ({
        title: 'How to start freelancing (and get your first client)',
        intro: 'Most people fail at freelancing at step one: they join a platform before they have something to sell. Flip it — pick one narrow service, prove it three times, then go looking for buyers.',
        blocks: [
          head('The path that actually works'),
          steps([
            'Pick one service, not five. "Flutter app fixes" beats "all development work".',
            'Build 3 proof pieces — even if they are unpaid or for your own app. Show, do not claim.',
            'Package a price: a fixed starter offer beats an hourly rate for first-time freelancers.',
            'Go where buyers already are — Upwork, Fiverr, LinkedIn, or Kathmandu-based agencies first.',
            'Deliver early, ask for a testimonial, and turn every project into a case study.'
          ]),
          head('What to charge in your first 90 days'),
          { t: 'ul', v: [
            'Start at roughly 60–70% of your target rate so you buy reviews fast.',
            'Raise prices after every 3 completed jobs — momentum matters more than negotiation.',
            'Always take a 50% advance; it filters out non-serious clients.'
          ] },
          note('Every completed project raises your Evolution. Money never does — skill and demonstrated results are what move your rank.')
        ],
        sources: [
          { n: 'Upwork Freelance Guide', u: 'upwork.com/resources' },
          { n: 'Fiverr Learn', u: 'learn.fiverr.com' },
          { n: 'SAGE Learning', u: 'app · Learning' }
        ],
        followups: ['Open Learning', 'Browse Jobs', 'Help me write my profile bio'],
        confidence: 0.9
      })
    },
    {
      id: 'evolution',
      re: /\b(evolution|rank|stage|spark|bronze|silver|gold|diamond|sovereign|overlord|level up|progress)\b/,
      kw: ['evolution', 'rank', 'stage', 'spark', 'level'],
      build: () => ({
        title: 'How SAGE Evolution works',
        intro: 'Evolution is your lifetime achievement layer. It tracks what you can actually do — not what you can afford — so it only ever moves forward. Spark is the separate platform currency you spend.',
        blocks: [
          kv([['Ranks', '13 — Bronze → Californium Overlord'], ['Intensity', 'Low → Mid → High per rank'], ['Driver', 'Skill & achievement'], ['Never reduced by', 'Withdrawals or spending']]),
          head('The two progression paths'),
          { t: 'ul', v: [
            'Skill upgrade — knowledge, practice, evidence, capability. This changes your visual identity (theme + accents).',
            'Money upgrade — earning and system capability. This unlocks features and access only.'
          ] },
          head('The flow'),
          { t: 'ul', v: ['Learn → Practice → Evidence → Skill → Opportunity → Work & Earn → Lifetime Achievement → Evolution'] },
          note('The UI stays the same as you rank up — only visual layers evolve, and the SAGE blue + black identity never disappears.')
        ],
        sources: [{ n: 'SAGE ONE · Unified 13 Evolution System', u: 'app · Evolution' }],
        followups: ['Open Evolution', 'Show me the transition animation', 'How do I earn skill points?'],
        confidence: 0.95
      })
    },
    {
      id: 'ai', research: true,
      re: /\b(a\.?i\.?|artificial intelligence|llm|chatgpt|gpt|prompt(ing)?|machine learning|neural|agent|automation)\b/,
      kw: ['ai', 'artificial intelligence', 'llm', 'prompt', 'machine learning', 'agent', 'automation'],
      build: () => ({
        title: 'Working with AI in 2026',
        intro: 'The useful mental model is not "AI replaces you" — it is that AI collapses the cost of the first draft. People who win with it are the ones who can judge the output and steer it.',
        blocks: [
          head('Where AI genuinely saves time'),
          { t: 'ul', v: [
            'Drafting and rewriting — emails, proposals, JDs, product copy.',
            'Research synthesis — turning 12 sources into a one-page brief.',
            'Code — scaffolding, tests, refactors, and explaining unfamiliar codebases.',
            'Repetition — anything with a clear input → output rule can be automated.'
          ] },
          head('How to prompt well'),
          steps([
            'Give role + context + constraint + format. "You are a hiring manager. Rewrite this JD for a junior Flutter dev. Max 120 words. Bullet list."',
            'Show one good example — examples beat adjectives.',
            'Ask for the answer in the shape you need (table, JSON, checklist) so you can use it directly.',
            'Iterate on the worst line, not the whole thing — partial rewrites are cheaper and better.'
          ]),
          note('Where AI is weak: current events, exact figures without sources, and anything needing local judgement. Verify those before you ship.')
        ],
        sources: [
          { n: 'Stanford HAI AI Index', u: 'hai.stanford.edu/ai-index' },
          { n: 'Google AI Guides', u: 'ai.google/guides' }
        ],
        followups: ['Write me a prompt template', 'Show me AI Studio', 'How do I automate a repeated task?'],
        confidence: 0.9
      })
    },
    {
      id: 'dev', research: true,
      re: /\b(coding|programming|javascript|typescript|python|flutter|react|app development|software|developer|code|web dev|backend)\b/,
      kw: ['code', 'coding', 'programming', 'javascript', 'python', 'flutter', 'react', 'developer', 'software'],
      build: () => ({
        title: 'Where to start with programming',
        intro: 'Do not choose a language first — choose a thing you want to exist. Motivation survives syntax; syntax does not survive boredom.',
        blocks: [
          head('Pick by what you want to build'),
          { t: 'ul', v: [
            'Mobile apps → Flutter (Dart) — one codebase, strong freelance demand.',
            'Websites & dashboards → JavaScript + React, then Node for the backend.',
            'Data, scripts, AI → Python — shortest path to something useful.',
            'Automation and internal tools → Python or TypeScript + a small database.'
          ] },
          head('The first 8 weeks'),
          steps([
            'Week 1–2: variables, functions, arrays, loops. Nothing else.',
            'Week 3–4: build a CLI or a page that does one real thing for you.',
            'Week 5–6: add a second data source — an API or a file.',
            'Week 7–8: ship it, put it on GitHub, write 5 lines about what it does.'
          ]),
          note('One project you finished teaches more than ten tutorials you watched. Ship ugly, then improve.')
        ],
        sources: [{ n: 'MDN Web Docs', u: 'developer.mozilla.org' }, { n: 'Flutter Docs', u: 'docs.flutter.dev' }],
        followups: ['Open Learning', 'Build me a 30-day learning plan', 'What should I build first?'],
        confidence: 0.9
      })
    },
    {
      id: 'marketing', research: true,
      re: /\b(marketing|seo|social media|instagram|tiktok|reels|ads?|growth|audience|brand(ing)?|content strategy)\b/,
      kw: ['marketing', 'seo', 'instagram', 'social media', 'ads', 'growth', 'brand'],
      build: () => ({
        title: 'A marketing plan that actually moves numbers',
        intro: 'Most marketing fails because it optimises for reach instead of a single next step. Fix the offer and the call to action first — the channels matter much less.',
        blocks: [
          head('The order that works'),
          steps([
            'Define one offer and one audience. "Social media for Kathmandu restaurants", not "marketing for everyone".',
            'Write the outcome, not the feature — what changes for the customer in 30 days?',
            'Pick ONE channel and post where your buyers already scroll.',
            'Measure saves, replies and site clicks — not likes.',
            'Turn every result into a case study and run it again.'
          ]),
          head('Fastest wins'),
          { t: 'ul', v: [
            'Local SEO — Google Business Profile with real photos and replies to every review.',
            'Short-form video — one hook, one idea, under 20 seconds, three times a week.',
            'Email/SMS list — the only audience you actually own.'
          ] },
          note('Track everything in one sheet: spend, leads, closed. If a channel cannot be traced to rupees after 30 days, cut it.')
        ],
        sources: [{ n: 'Google Digital Garage', u: 'learndigital.withgoogle.com' }, { n: 'Meta Business Help', u: 'business.help.facebook.com' }],
        followups: ['Create a 30-day content plan', 'Write me 10 hooks for my niche', 'Show me the Marketplace'],
        confidence: 0.88
      })
    },
    {
      id: 'jobs', research: true, p: 1,
      re: /\b(job|hiring|resume|cv|interview|apply|vacancy|recruit|get hired|career)\b/,
      kw: ['job', 'resume', 'cv', 'interview', 'hire', 'vacancy', 'career'],
      build: () => ({
        title: 'Getting hired faster',
        intro: 'Recruiters give a CV about seven seconds before deciding. You are not being judged on everything you have done — only on whether the top third matches the role.',
        blocks: [
          head('Fix the CV first'),
          steps([
            'Lead with a 2-line summary that names the role and your strongest proof.',
            'Rewrite duties as results — "cut load time from 4.2s to 1.1s" beats "responsible for performance".',
            'Add links: GitHub, portfolio, live apps. Proof outranks adjectives.',
            'One page until you have 8+ years of experience.'
          ]),
          head('Where to apply in Nepal'),
          { t: 'ul', v: [
            'SAGE Jobs — matched to your skills and Evolution.',
            'Company career pages directly — higher hit rate than job boards.',
            'LinkedIn with a specific message to the hiring manager, not "I am interested".'
          ] },
          note('For every 10 applications, track responses in a sheet. If nobody replies, the CV is the problem — not the market.')
        ],
        sources: [{ n: 'SAGE Jobs', u: 'app · Jobs' }, { n: 'LinkedIn Careers', u: 'linkedin.com/jobs' }],
        followups: ['Browse Jobs', 'Review my resume', 'Prepare me for an interview'],
        confidence: 0.9
      })
    },
    {
      id: 'study', research: true,
      re: /\b(study abroad|scholarship|visa|masters?|degree|abroad|university| australia| usa| europe| canada)\b/,
      kw: ['scholarship', 'study abroad', 'visa', 'masters', 'degree', 'university'],
      build: () => ({
        title: 'Studying abroad from Nepal',
        intro: 'The real competition is not marks — it is a coherent story: why this course, why this country, and what you will do after. Build that first, then the paperwork becomes easy.',
        blocks: [
          head('What actually decides it'),
          { t: 'ul', v: [
            'Statement of purpose — specific, honest, and tied to one career direction.',
            'English test — IELTS/PTE timelines move faster than you expect; book early.',
            'Funds evidence — plan the bank balance and sponsorship papers before offers arrive.',
            'Scholarship deadlines — most open 8–12 months before intake.'
          ] },
          head('Typical route'),
          steps([
            'Shortlist 3 countries by post-study work rights and total cost, not rankings.',
            'Take the English test and start applications 10 months out.',
            'Apply to scholarships in the same window as admissions.',
            'Prepare the visa interview around one clear study-and-return plan.'
          ]),
          note('Keep a single tracker: university, deadline, documents, status, cost. Most rejections come from missed dates, not merit.')
        ],
        sources: [{ n: 'University Grants Commission Nepal', u: 'ugc.gov.np' }, { n: 'British Council Nepal', u: 'britishcouncil.org.np' }],
        followups: ['Help me write my statement of purpose', 'Which country fits my budget?', 'Create an application timeline'],
        confidence: 0.87
      })
    },
    {
      id: 'business', research: true,
      re: /\b(business|startup|start a|company|entrepreneur|register|llc|pvt ltd|sell online|shop)\b/,
      kw: ['business', 'startup', 'start a', 'company', 'entrepreneur', 'register'],
      build: () => ({
        title: 'Starting a business in Nepal',
        intro: 'Validate before you incorporate. Registration is cheap and fast now — a business with no customers is the expensive part.',
        blocks: [
          head('Order of operations'),
          steps([
            'Sell manually to 5 people first — WhatsApp and a payment number are enough.',
            'Write down what they bought and why; that becomes your positioning.',
            'Register (Pvt Ltd or sole proprietorship) once revenue is repeatable.',
            'Open a business current account and separate your money immediately.',
            'Add one system: invoicing, inventory, or a simple CRM.'
          ]),
          head('Costs worth knowing'),
          kv([['Registration', 'OCR company registration, online'], ['Payments', 'eSewa / Khalti / FonePay merchant'], ['First year focus', 'Retention over reach']]),
          note('Do not spend the first six months on a logo and an office. Spend them on the tenth paying customer.')
        ],
        sources: [{ n: 'Office of the Company Registrar', u: 'ocr.gov.np' }, { n: 'Inland Revenue Department', u: 'ird.gov.np' }],
        followups: ['Create a lean business plan', 'What should I charge?', 'Show me the Marketplace'],
        confidence: 0.86
      })
    },
    {
      id: 'money',
      re: /\b(earn|earning|withdraw|payment|wallet|passive income|balance|npr|rupees|income sources)\b/,
      kw: ['earn', 'withdraw', 'wallet', 'payment', 'income', 'balance'],
      build: () => ({
        title: 'Ways to earn with SAGE',
        intro: 'Your earning routes split into marketplace work, client projects, referral income and content rewards. Money improves your access — it never changes your rank.',
        blocks: [
          head('Where the money comes from'),
          { t: 'ul', v: [
            'Marketplace — sell a product or service, the largest share of most earnings.',
            'Jobs & client projects — highest value per hour, slower to start.',
            'Content rewards — smaller, recurring, and it compounds with your audience.',
            'Referrals — one-time, but free once your network is warm.'
          ] },
          head('Getting paid out'),
          steps([
            'Complete KYC (face + NID) — withdrawals are blocked without it.',
            'Pick a partner: eSewa, Khalti, FonePay or bank transfer.',
            'Watch the fee tier — the percentage drops as the amount rises.'
          ]),
          note('Key rule: withdrawing never reduces Evolution. It is a lifetime achievement, separate from Spark.')
        ],
        sources: [{ n: 'SAGE Wallet', u: 'app · Wallet' }, { n: 'Transaction & Fees', u: 'app · Fees' }],
        followups: ['Open Wallet', 'Show me the earning tiers', 'How do I withdraw to bank?'],
        confidence: 0.9
      })
    },
    {
      id: 'health',
      re: /\b(health|fitness|sleep|diet|exercise|workout|weight|stress|mental health|meditat|energy)\b/,
      kw: ['health', 'fitness', 'sleep', 'diet', 'exercise', 'stress', 'weight'],
      build: () => ({
        title: 'Feeling better with four boring habits',
        intro: 'Almost every low-energy, low-focus week traces back to the same four inputs. Fix those before you buy anything.',
        blocks: [
          head('The four that matter'),
          { t: 'ul', v: [
            'Sleep — same wake time seven days a week beats a perfect bedtime.',
            'Movement — 30 minutes of brisk walking, most days. Consistency outperforms intensity.',
            'Protein and plants — one palm of protein and something green at each meal.',
            'Daylight in the morning — 10 minutes outside resets your clock faster than caffeine.'
          ] },
          head('If focus is the problem'),
          steps([
            'One task per 90-minute block, phone in another room.',
            'Write tomorrow\'s single most important task before you close the laptop.',
            'Stop caffeine after 2pm — it is the most common hidden sleep thief.'
          ]),
          note('This is general wellbeing guidance, not medical advice. If something persists, see a clinician.')
        ],
        sources: [{ n: 'WHO Physical Activity Guidelines', u: 'who.int/news-room/fact-sheets' }],
        followups: ['Build me a weekly routine', 'How do I fix my sleep schedule?', 'Create a beginner workout plan'],
        confidence: 0.8
      })
    },
    {
      id: 'invest',
      re: /\b(invest(ing|ment)?|share market|stock|mutual fund|bank (rate|interest)|savings|fixed deposit|ipo)\b/,
      kw: ['invest', 'investment', 'share', 'stock', 'mutual fund', 'saving'],
      build: () => ({
        title: 'Investing basics',
        intro: 'Order matters more than product: emergency fund first, then debt, then long-horizon investing. The best return early on is usually just a higher income.',
        blocks: [
          head('The sequence'),
          steps([
            'Emergency fund covering 3–6 months of expenses in something instantly accessible.',
            'Clear high-interest debt — it beats any realistic market return.',
            'Then invest regularly and boringly — amount and consistency beat timing.',
            'Only then consider individual shares or concentrated bets.'
          ]),
          head('What to look at'),
          { t: 'ul', v: [
            'Fee drag — a 1% annual fee can eat a quarter of a lifetime balance.',
            'Horizon — money you need in 2 years does not belong in equities.',
            'Diversification — one employer\'s shares plus one index is not diversification.'
          ] },
          note('General information only, not financial advice. Check current rates and tax with a licensed adviser before committing.')
        ],
        sources: [{ n: 'Nepal Stock Exchange', u: 'nepalstock.com' }, { n: 'Securities Board of Nepal', u: 'sebon.gov.np' }],
        followups: ['Compare saving options', 'How much should I save each month?', 'Explain mutual funds simply'],
        confidence: 0.8
      })
    },
    {
      id: 'writing',
      re: /\b(write|writing|essay|email|cover letter|blog|post|caption|copywriting|grammar)\b/,
      kw: ['write', 'writing', 'essay', 'email', 'cover letter', 'blog', 'caption'],
      build: () => ({
        title: 'Writing that gets read',
        intro: 'Good writing is mostly structure. Get the order right and the sentences take care of themselves.',
        blocks: [
          head('The structure'),
          steps([
            'Start with the single thing the reader should do — write that last, put it first.',
            'One idea per paragraph, and the first line carries all the weight.',
            'Cut every sentence that does not change the reader\'s next action.',
            'Read it aloud once — anything you stumble over, rewrite.'
          ]),
          head('Fast formulas'),
          { t: 'ul', v: [
            'Email: context in one line → request → deadline → easy out.',
            'Post: hook → tension → shift → takeaway → question.',
            'Cover letter: why them → proof you can do it → the specific role → close.'
          ] },
          note('Paste your draft into chat and I will rewrite it — tell me the audience and the outcome you want.')
        ],
        sources: [{ n: 'SAGE Chat', u: 'app · Chat' }],
        followups: ['Rewrite my email', 'Write a cover letter for me', 'Give me 10 post hooks'],
        confidence: 0.88
      })
    },
    {
      id: 'identity',
      re: /\b(who are you|what can you do|about you|your name|what are you|introduce yourself|help me)\b/,
      kw: ['who are you', 'what can you do', 'about you', 'your name'],
      build: () => ({
        title: 'Hi — I am SAGE',
        intro: 'I am your personal AI mentor and execution partner, built in Nepal. I do not just answer — I route you into the part of the app that gets the job done.',
        blocks: [
          head('What I can do right now'),
          { t: 'ul', v: [
            'Research a topic and show you the sources behind it.',
            'Plan your learning, career, business or travel.',
            'Track your Evolution, wallet and skill progress.',
            'Run deep research, analysis and content creation flows.'
          ] },
          kv([['Ranks', '13-stage Evolution'], ['Currency', 'Spark (separate from Evolution)'], ['Languages', 'English · नेपाली']]),
          note('Try: "What skill should I learn in 2026?" or "Best place to visit in Nepal?"')
        ],
        sources: [{ n: 'SAGE ONE', u: 'app · Home' }],
        followups: ['Explain SAGE Evolution to me', 'What skill should I learn in 2026?', 'How do I start freelancing?'],
        confidence: 0.99
      })
    },
    {
      id: 'greeting',
      re: /^\s*(?:hi|hello|hey|namaste|yo|hola|good (?:morning|evening|afternoon)|how are you)\b|^\s*(?:thanks|thank you|ok|okay|yes|no|cool|great|fine)\b[\s!.?]*$/i,
      kw: ['hello', 'hi', 'namaste', 'hey', 'how are you'],
      build: (q) => ({
        title: /^(hi|hello|hey|namaste|yo|hola)/i.test(q) ? 'Namaste 🙏' : 'Happy to help',
        intro: 'Good to see you. I am ready when you are — ask me anything, or pick one of these to get moving.',
        blocks: [note('I work best with specifics: the more context you give, the more useful the answer.')],
        sources: [],
        followups: ['What skill should I learn in 2026?', 'Best place to visit in Nepal?', 'How do I start freelancing?'],
        confidence: 0.99
      })
    }
  ];

  /* ---------- non-knowledge handlers ---------- */
  function mathOut(exprText, val) {
    const shown = Math.round(val * 1e10) / 1e10;
    return {
      title: '= ' + Number(shown).toLocaleString('en-US'),
      intro: 'Here is the step-by-step: ' + exprText + ' = ' + shown + '.',
      blocks: [kv([['Expression', exprText], ['Result', String(shown)], ['Exact', String(val)]])],
      sources: [],
      followups: ['Show me the steps in detail', 'Convert this to NPR', 'Another calculation'],
      confidence: 1
    };
  }

  function tryMath(q) {
    const raw = q.replace(/[=?]|what is|calculate|solve/gi, ' ').replace(/\s+/g, ' ').trim();
    /* "15% of 4000" — the guard below rejects letters, so handle it first */
    const pct = raw.match(/^(\d+(?:\.\d+)?)\s*(?:%|percent)\s+of\s+([\d,]+(?:\.\d+)?)$/i);
    if (pct) {
      const val = (parseFloat(pct[1]) / 100) * parseFloat(pct[2].replace(/,/g, ''));
      if (isFinite(val)) return mathOut(pct[1] + '% of ' + pct[2], val);
    }
    if (!/[0-9]/.test(raw) || !/[+\-*/^%]/.test(raw)) return null;
    if (!/^[0-9+\-*/(). %^]+$/.test(raw)) return null;
    let expr = raw.replace(/\^/g, '**');
    let val;
    try { val = Function('"use strict";return (' + expr + ')')(); } catch (e) { return null; }
    if (typeof val !== 'number' || !isFinite(val)) return null;
    return mathOut(raw, val);
  }

  function tryClock(q) {
    if (!/\b(time|date|today|day is it|what day)\b/i.test(q)) return null;
    const d = new Date();
    const t = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const day = d.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return {
      title: t,
      intro: 'It is ' + t + ' on ' + day + ' — your local device time.',
      blocks: [kv([['Time', t], ['Date', day], ['Timezone', Intl.DateTimeFormat().resolvedOptions().timeZone]])],
      sources: [],
      followups: ['Plan my day', 'Set a study schedule', 'How many hours until tonight?'],
      confidence: 1
    };
  }

  function tryWeather(q) {
    if (!/\b(weather|rain|temperature|forecast|is it going to)\b/i.test(q)) return null;
    return {
      title: 'Weather — I need a live source',
      intro: 'I do not have a live weather feed wired in, so I will not guess at a number you might act on. Here is how to get it instantly, and what is typical.',
      blocks: [
        head('Get it now'),
        { t: 'ul', v: ['Search "weather in Pokhara" — the answer box is enough.', 'Open your phone\'s built-in weather app.', 'desibroadcast / local TV for valley alerts during monsoon.'] },
        head('General pattern (Nepal)'),
        { t: 'ul', v: ['Monsoon Jun–Sep: humid, heavy rain, landslides on hill roads.', 'Post-monsoon Oct–Nov: clearest skies, best trekking.', 'Winter Dec–Feb: cold mornings, dry and clear.', 'Pre-monsoon Mar–May: warm, hazy, rhododendron season.'] }
      ],
      sources: [{ n: 'Department of Hydrology & Meteorology', u: 'dhm.gov.np' }],
      followups: ['Best time to visit Nepal?', 'Plan a trek for October', 'What should I pack?'],
      confidence: 0.7
    };
  }

  /* ---------- generic reasoner (fallback) ---------- */
  function generic(q) {
    const t = q.trim().replace(/\s+/g, ' ');
    const lower = t.toLowerCase();
    let kind = 'a question';
    if (/^why\b/.test(lower)) kind = 'a "why" question — so the answer is about causes and trade-offs';
    else if (/^how\b/.test(lower)) kind = 'a "how" question — so the answer is a sequence of steps';
    else if (/^(what|which|where|who)\b/.test(lower)) kind = 'a definitional question — so the answer is a clear explanation plus options';
    else if (/^(can|should|would|is|do|does|will)\b/.test(lower)) kind = 'a yes/no question — so the answer needs a direct verdict first, then reasoning';
    else if (/\?$/.test(t)) kind = 'an open question';
    return {
      title: 'Let me break that down',
      intro: 'You are asking ' + kind + '. Here is how I would approach "' + t.replace(/\s+/g, ' ').slice(0, 90) + (t.length > 90 ? '…' : '') + '":',
      blocks: [
        head('1. Sharpen the question'),
        { t: 'ul', v: [
          'Name the outcome you want and by when — "better" becomes a number.',
          'Say who this is for and what you have already tried.',
          'Add your constraint (budget, time, skill) so the advice is actually usable.'
        ] },
        head('2. The working answer'),
        { t: 'ul', v: [
          'Start from the smallest version that can be wrong quickly, then improve it.',
          'Prefer the option you can reverse — speed of correction beats perfection.',
          'Define what "done" looks like before you begin, so you can stop.'
        ] },
        head('3. Make it specific'),
        note('Give me two lines of context — your goal, your constraints, and where you are starting from — and I will turn this into a concrete, numbered plan instead of general advice.')
      ],
      sources: [],
      followups: ['Research this deeply', 'Build me a step-by-step plan', 'What should I do first?'],
      confidence: 0.55
    };
  }

  /* ---------- classification ---------- */
  function classify(q) {
    const raw = q.toLowerCase();
    const t = ' ' + raw.replace(/[^a-z0-9\s/+-]/g, ' ').replace(/\s+/g, ' ') + ' ';
    let best = null, bestScore = 0, bestRank = 0;
    for (const k of KB) {
      let s = 0;
      if (k.re && k.re.test(raw)) s += 3;
      for (const w of (k.kw || [])) if (t.indexOf(' ' + w) !== -1 || t.indexOf(w + ' ') !== -1) s += 1;
      /* p breaks ties between overlapping topics (e.g. "a job in Kathmandu" → jobs, not travel) */
      const rank = s + (k.p || 0);
      if (s && rank > bestRank) { bestRank = rank; bestScore = s; best = k; }
    }
    return bestScore >= 2 ? best : null;
  }

  AI.topicOf = function (q) { const k = classify(q); return k ? k.id : null; };
  AI.isResearch = function (q) { const k = classify(q); return !!(k && k.research); };

  AI.builtin = function (q) {
    const m = tryMath(q) || tryClock(q) || tryWeather(q);
    if (m) { m.engine = 'builtin'; m.topic = 'utility'; return m; }
    const k = classify(q);
    const ans = (k ? k.build(q) : generic(q));
    ans.engine = 'builtin';
    ans.topic = k ? k.id : 'general';
    return ans;
  };

  /* ---------- live model ---------- */
  const SYS = 'You are SAGE, a warm, precise AI mentor and execution partner built in Nepal. ' +
    'Answer the user directly and usefully. Format strictly as plain text:\n' +
    'LINE 1: a short title in **double asterisks**\n' +
    'LINE 2: blank\n' +
    'A paragraph of 40-90 words.\n' +
    'Then optional sections: a line starting with "## " as a heading, then lines starting with "- " as bullets.\n' +
    'Optionally a line "STEPS:" then numbered lines "1. ".\n' +
    'End with "SOURCES:" then one "Name | url" per line, then "FOLLOWUPS:" then one suggested question per line.\n' +
    'No markdown other than described. No code fences.';

  AI.askLive = function (q) {
    if (!S.backend || !S.backend.isOwnerAuthenticated || !S.backend.isOwnerAuthenticated()) {
      return Promise.reject(new Error('Sign in with the configured SAGE owner account to use live AI.'));
    }
    return S.backend.chat(q);
  };

  AI.parseLive = function (text) {
    const lines = String(text).replace(/\r/g, '').split('\n');
    let title = '', intro = '', inSrc = false, inFup = false, cur = null;
    const blocks = [], sources = [], followups = [];
    for (let raw of lines) {
      const line = raw.trim();
      if (!line) { cur = null; continue; }
      if (/^SOURCES?:/i.test(line)) { inSrc = true; inFup = false; continue; }
      if (/^FOLLOW-?UPS?:/i.test(line)) { inFup = true; inSrc = false; continue; }
      if (inSrc) { const p = line.replace(/^-\s*/, '').split('|'); if (p.length > 1) sources.push({ n: p[0].trim(), u: p.slice(1).join('|').trim() }); else sources.push({ n: p[0].trim(), u: '' }); continue; }
      if (inFup) { followups.push(line.replace(/^-\s*/, '')); continue; }
      if (!title) { title = line.replace(/\*\*/g, ''); continue; }
      if (/^##\s*/.test(line)) { cur = { t: 'h', v: line.replace(/^##\s*/, '') }; blocks.push(cur); continue; }
      if (/^-\s*/.test(line)) {
        const item = line.replace(/^-\s*/, '');
        const last = blocks[blocks.length - 1];
        if (last && last.t === 'ul') last.v.push(item);
        else { cur = { t: 'ul', v: [item] }; blocks.push(cur); }
        continue;
      }
      if (/^\d+[.)]\s*/.test(line)) {
        const item = line.replace(/^\d+[.)]\s*/, '');
        const last = blocks[blocks.length - 1];
        if (last && last.t === 'ol') last.v.push(item);
        else { cur = { t: 'ol', v: [item] }; blocks.push(cur); }
        continue;
      }
      if (!intro) { intro = line; continue; }
      const last = blocks[blocks.length - 1];
      if (last && last.t === 'note') last.v += ' ' + line;
      else { cur = { t: 'note', v: line }; blocks.push(cur); }
    }
    if (!title) title = 'SAGE';
    if (!intro) intro = 'Here is what I found.';
    if (!followups.length) followups.push('Tell me more about this', 'Give me a step-by-step plan');
    return { title, intro, blocks, sources, followups, confidence: 0.9, engine: 'live', topic: 'live' };
  };

  AI.answer = function (q) {
    if (!S.backend || !S.backend.isOwnerAuthenticated || !S.backend.isOwnerAuthenticated()) {
      return Promise.resolve({
        title: 'Sign in to SAGE Core',
        intro: 'Live AI and research are not available until you sign in with the configured SAGE owner account. No sample answer was substituted.',
        blocks: [], sources: [], followups: [], confidence: null, engine: 'authentication-required', topic: 'auth'
      });
    }
    return S.backend.chat(q).then(function (text) {
      return AI.parseLive('**SAGE Core**\\n\\n' + String(text || 'SAGE Core returned an empty response.'));
    });
  };

  /* ---------- rendering ---------- */
  AI.blockHTML = function (b) {
    if (b.t === 'h') return '<div class="ai-h">' + S.esc(b.v) + '</div>';
    if (b.t === 'ul') return '<ul class="ai-ul">' + b.v.map(x => '<li>' + S.esc(x) + '</li>').join('') + '</ul>';
    if (b.t === 'ol') return '<ol class="ai-ol">' + b.v.map(x => '<li>' + S.esc(x) + '</li>').join('') + '</ol>';
    if (b.t === 'note') return '<div class="ai-note">' + S.esc(b.v) + '</div>';
    if (b.t === 'kv') return '<div class="ai-kv">' + b.v.map(x => '<div><span>' + S.esc(x.k) + '</span><b>' + S.esc(x.v) + '</b></div>').join('') + '</div>';
    return '';
  };
  AI.tailHTML = function (ans) {
    let h = '';
    if (ans.sources && ans.sources.length) {
      h += '<div class="ai-srcs"><div class="ai-h">Sources</div>' + ans.sources.map(s =>
        '<div class="src">' + S.icon('i-link') + '<div><b>' + S.esc(s.n) + '</b>' +
        (s.u ? '<div class="tiny muted">' + S.esc(s.u) + '</div>' : '') + '</div></div>').join('') + '</div>';
    }
    if (ans.confidence != null) {
      h += '<div class="ai-conf"><span>Confidence</span><i><b style="width:' + Math.round(ans.confidence * 100) + '%"></b></i><em>' + Math.round(ans.confidence * 100) + '%</em></div>';
    }
    return h;
  };
  AI.fuHTML = function (ans) {
    if (!ans.followups || !ans.followups.length) return '';
    return '<div class="ai-fu"><div class="tiny muted">Continue</div>' + ans.followups.map(f =>
      '<button class="qp" data-act="chat-quick" data-arg="' + S.esc(f) + '">' + S.esc(f) + '</button>').join('') + '</div>';
  };
  AI.badge = function (ans) {
    const live = ans.engine === 'live';
    return '<div class="ai-badge' + (live ? ' live' : '') + '">' + (live ? '⚡ Live model' : '◈ SAGE engine') + '</div>';
  };

})(window.SAGE);
