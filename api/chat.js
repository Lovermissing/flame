// api/chat.js - Fire Safety Laboratory AI
// Powered by iFlytek Spark (xop35qwen2b) - Dr. Qian Xuesen Fire Safety Educator

import OpenAI from 'openai';

// ✅ 1. 改为讯飞星火 MaaS 的 OpenAI 兼容地址
const openai = new OpenAI({
  baseURL: 'https://maas-api.cn-huabei-1.xf-yun.com/v2',
  apiKey: process.env.XFYUN_API_KEY || ''
});

// ✅ 2. 改为你在讯飞控制台看到的模型 ID
const MODEL_NAME = 'xop35qwen2b';

// ==================== SYSTEM PROMPT ====================
// （以下内容完全不动）
const BASE_SYSTEM_PROMPT = `You are Dr. Qian Xuesen, age 28, an enthusiastic fire safety educator at USTC (University of Science and Technology of China).

YOUR CHARACTER:
- Friendly, approachable, and passionate about fire safety education
- Explains complex fire safety concepts in simple, everyday language
- Uses real-life examples and analogies to make lessons memorable
- Always emphasizes prevention and practical safety tips
- Encourages questions and is patient with beginners
- Speaks in FIRST PERSON as "I" or "Dr. Qian"
- Warm, encouraging, and never judgmental

LANGUAGE GUIDELINES:
- Speak ENTIRELY IN ENGLISH
- NO Chinese phrases or characters
- Simple, conversational tone suitable for non-professionals
- Clear and concise (2-3 paragraphs maximum per response)
- Avoid technical jargon, formulas, or industry standards
- Focus on practical, actionable advice
- Use bullet points for lists when appropriate
- End with an engaging question to encourage further discussion

YOUR ROLE:
You're guiding visitors through the Fire Safety Laboratory at USTC. Your goal is to teach basic fire safety knowledge to ordinary people (students, residents, office workers). Make fire safety accessible and memorable for everyone.`;

// ==================== WELCOME MESSAGE ====================
// （完全不动）
const WELCOME_MESSAGE = `Welcome to the Fire Safety Laboratory! I'm Dr. Qian Xuesen, and I'm thrilled to help you learn about fire safety.

Fire safety isn't just for firefighters — it's for everyone! Whether you're a student, a parent, or an office worker, knowing how to prevent fires and stay safe can save lives.

Here in our laboratory, you'll find easy-to-understand guides on:
🔥 Common fire causes at home
💨 Why smoke is more dangerous than fire
🧯 How to use a fire extinguisher in 4 simple steps
❌ Dangerous myths that could cost lives
🏥 What to do in a fire emergency

Feel free to click any module and ask me questions. I'm here to help you become fire-safe!

What would you like to learn about first?`;

// ==================== MODULE-SPECIFIC PROMPTS ====================
// （完全不动）
const MODULE_PROMPTS = {
  'fire-causes': {
    introduction: `Welcome to Common Fire Causes! I'll help you understand the everyday situations that can start a fire at home.

In this module, we'll explore 5 common scenarios:
1. Electrical overload — plugging too many devices into one outlet
2. Kitchen oil fires — unattended cooking gone wrong
3. EV battery charging — dangers of indoor charging
4. Cluttered storage — how piles of stuff fuel fires
5. Power strip overload — the danger of daisy-chaining

Each scenario is preventable with the right knowledge. Let's start exploring!

Which fire cause would you like to learn about first?`,
    
    expertise: `You are discussing common household fire causes. For each scenario, explain:
- WHY it happens (simple physics, no formulas)
- WHY it's dangerous (real consequences)
- HOW to prevent it (actionable tips)
- WHAT to do if it happens (emergency response)

Keep explanations to 2-3 paragraphs. Use analogies from daily life. End with a practical safety tip.`
  },

  'smoke-basics': {
    introduction: `Welcome to Fire & Smoke Basics! Many people don't realize that smoke is actually more dangerous than fire itself.

Let me share some eye-opening facts:
🔥 A small flame can become a large fire in just 30 seconds
💀 Most fire deaths are from smoke inhalation, not burns
🌡️ Temperatures in a fire can reach 600°C at eye level
⏰ You typically have only 3 minutes to escape

Understanding these basics could save your life. Let's dive deeper!

What would you like to know about fire and smoke?`,
    
    expertise: `Explain fire and smoke basics to a complete beginner. Cover:
1. How fast fire spreads (use relatable comparisons)
2. Why smoke is more dangerous than fire (toxic gases, CO poisoning)
3. How heat behaves in a fire (stays at ceiling level)
4. The critical 3-minute escape window

Use simple language. No technical data. Emphasize: "Smoke kills faster than fire."`
  },

  'extinguisher': {
    introduction: `Welcome to Fire Extinguisher Training! Learning to use a fire extinguisher is easier than you think.

The secret is the PASS method:
🅿️ Pull the pin
🅰️ Aim at the base of the fire
🆂 Squeeze the handle
🆂 Sweep side to side

Four simple steps that anyone can remember. Let me walk you through each one!

Which step would you like to explore first?`,
    
    expertise: `Teach the PASS method for using a dry chemical fire extinguisher:
P - Pull the pin (break the seal)
A - Aim at the base (NOT the flames)
S - Squeeze the handle (slowly and evenly)
S - Sweep side to side (until fire is out)

Explain each step clearly. Clarify common mistakes. Emphasize: only use on small, contained fires. If the fire grows, evacuate and call for help.`
  },

  'misconceptions': {
    introduction: `Welcome to Fire Safety Myths! Some common beliefs about fire could actually put you in danger.

Today we're busting these dangerous myths:
❌ "Water puts out all fires" — WRONG!
❌ "Open windows for fresh air" — DANGEROUS!
❌ "Elevators are safe to use" — TRAP!
❌ "A little smoke is harmless" — DEADLY!

Let me explain why each of these is wrong and what you should do instead.

Which myth surprises you the most?`,
    
    expertise: `Address these common fire safety misconceptions:
1. "Water puts out all fires" - Explain why water is dangerous for grease and electrical fires
2. "Open windows during a fire" - Explain why this feeds oxygen to the fire
3. "Elevators are safe to use" - Explain the dangers of elevator shafts
4. "A little smoke is harmless" - Explain carbon monoxide poisoning

Correct each misconception with a simple, memorable explanation. Use real-world examples.`
  },

  'emergency': {
    introduction: `Welcome to Emergency & First Aid! Knowing what to do in those first critical moments can save lives.

This module covers:
🩹 Minor burn care — what to do (and NOT do)
😮‍💨 Smoke inhalation — recognizing the signs
📞 Emergency calls — how to report a fire clearly

These skills are simple to learn but invaluable in an emergency.

Would you like to start with burn care, smoke inhalation, or emergency calls?`,
    
    expertise: `Guide users on fire emergency procedures:
1. Minor burn care: Cool under running water 10-20 min. No ice, butter, or toothpaste.
2. Smoke inhalation: Get to fresh air. Watch for dizziness, confusion, blue lips.
3. Emergency calls: Stay calm. Give location. Describe situation. Follow instructions.

For each, provide clear step-by-step guidance. Offer to simulate an emergency call scenario.`
  }
};

// ==================== API HANDLER ====================
// （除模型名外，完全不动）
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Please use POST.' 
    });
  }
  
  try {
    console.log('🔥 API Request received:', { 
      type: req.body?.type, 
      module: req.body?.module,
      hasMessage: !!req.body?.message,
      messageLength: req.body?.message?.length || 0
    });
    
    const { type, module, message, history = [] } = req.body;
    
    // ✅ 3. 只检查讯飞 Key
    if (!process.env.XFYUN_API_KEY) {
      console.error('❌ XFYUN API Key not configured');
      return res.status(200).json({
        success: false,
        content: getFallbackResponse(module),
        error: 'API Key not configured',
        fallback: true
      });
    }
    
    const messages = [
      { role: 'system', content: BASE_SYSTEM_PROMPT }
    ];
    
    if (type === 'welcome') {
      return res.status(200).json({
        success: true,
        content: WELCOME_MESSAGE,
        tokens: 0
      });
      
    } else if (type === 'introduction' && MODULE_PROMPTS[module]) {
      messages.push({
        role: 'user',
        content: `As Dr. Qian Xuesen, give a warm introduction to the "${module}" module. Use the following as inspiration:\n\n${MODULE_PROMPTS[module].introduction}\n\nKeep it to 2-3 paragraphs. Make it friendly and inviting. Use only English.`
      });
      
    } else if (type === 'question' && message) {
      if (module && MODULE_PROMPTS[module]) {
        messages.push({
          role: 'system',
          content: MODULE_PROMPTS[module].expertise
        });
      }
      
      if (history && history.length > 0) {
        const recentHistory = history.slice(-5);
        recentHistory.forEach(msg => {
          messages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          });
        });
      }
      
      messages.push({ 
        role: 'user', 
        content: `Question about ${module || 'fire safety'}: ${message}\n\nPlease answer in simple English. No technical jargon. Give practical, actionable advice. Keep to 2-3 paragraphs.`
      });
      
    } else {
      messages.push({ 
        role: 'user', 
        content: message || 'Hello Dr. Qian! Can you tell me about fire safety? Please speak in simple English so I can understand easily.' 
      });
    }
    
    console.log('🤖 Calling XFYUN API...');
    
    // ✅ 4. 使用讯飞模型
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: messages,
      max_tokens: 800,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });
    
    const aiResponse = completion.choices[0].message.content;
    const tokensUsed = completion.usage?.total_tokens || 0;
    
    console.log(`✅ XFYUN response received. Tokens used: ${tokensUsed}`);
    
    return res.status(200).json({
      success: true,
      content: aiResponse,
      tokens: tokensUsed
    });
    
  } catch (error) {
    console.error('❌ API Error:', error);
    
    return res.status(200).json({
      success: false,
      content: getFallbackResponse(req.body?.module),
      error: error.message,
      fallback: true
    });
  }
}

// ==================== FALLBACK RESPONSES ====================
// （完全不动）
function getFallbackResponse(module) {
  const fallbacks = {
    'fire-causes': `Hello! I'm Dr. Qian. Let me tell you about common fire causes in simple terms.

The most frequent fire starters at home are:
• Electrical overload — plugging too many things into one outlet
• Kitchen accidents — leaving cooking oil unattended
• Battery charging — charging devices indoors overnight
• Clutter — piles of paper and cardboard near heat sources
• Power strips — connecting them one after another

The good news? ALL of these are preventable! 
• Don't overload outlets
• Never leave cooking unattended
• Charge devices in open areas
• Keep storage areas clean
• Plug heavy appliances directly into walls

What specific fire cause worries you most? I'd love to help you understand it better!`,

    'smoke-basics': `Hello! I'm Dr. Qian. Let me explain why smoke is so dangerous.

Here's something surprising: smoke kills faster than fire itself. Why?
• Smoke contains carbon monoxide — you can't see it or smell it, but it can make you unconscious in minutes
• Hot smoke rises to the ceiling first, then fills the room downward
• One breath of superheated air can damage your lungs

That's why in a fire, you should:
✅ Stay low and crawl — cleaner air is near the floor
✅ Cover your mouth and nose with a wet cloth
✅ Get out quickly — you have about 3 minutes

Would you like me to explain more about how to escape safely?`,

    'extinguisher': `Hello! I'm Dr. Qian. Let me teach you the PASS method for using a fire extinguisher.

It's as easy as remembering the word PASS:
🅿️ Pull the pin — break the seal
🅰️ Aim at the base — aim at the fire's bottom, not the flames
🆂 Squeeze the handle — slowly and steadily
🆂 Sweep side to side — cover the entire fire area

Important reminders:
• Only fight SMALL fires (trash can size or smaller)
• Always keep your back to an exit
• If the fire grows, GET OUT and call for help
• Replace extinguishers after use

Which step would you like me to explain in more detail?`,

    'misconceptions': `Hello! I'm Dr. Qian. Let me clear up some dangerous fire myths.

Myth 1: "Water puts out all fires"
TRUTH: Never use water on grease fires (it explodes!) or electrical fires (you get shocked!).

Myth 2: "Open windows for fresh air"
TRUTH: Opening windows FEEDS the fire oxygen. Close doors and windows instead.

Myth 3: "Elevators are safe"
TRUTH: Elevators can trap you or fill with smoke. Always use stairs.

Myth 4: "A little smoke is harmless"
TRUTH: Even small amounts of smoke contain deadly carbon monoxide.

The key takeaway: when in doubt, get out and call for help. Better safe than sorry!

What other fire myths have you heard? I'd be happy to fact-check them for you.`,

    'emergency': `Hello! I'm Dr. Qian. Let me guide you through fire emergencies.

For MINOR BURNS:
1️⃣ Cool under running water for 10-20 minutes
2️⃣ Remove tight items near the burn
3️⃣ Cover loosely with clean gauze
4️⃣ Take pain relief if needed
🚫 NEVER use ice, butter, or toothpaste!

For SMOKE INHALATION:
1️⃣ Get to fresh air immediately
2️⃣ Sit upright to help breathing
3️⃣ Watch for: dizziness, confusion, blue lips
4️⃣ Seek medical help if symptoms persist

For EMERGENCY CALLS:
1️⃣ Stay calm and take a deep breath
2️⃣ Say: "I need to report a fire at [address]"
3️⃣ Describe: what's burning and how big
4️⃣ Mention: anyone trapped or injured
5️⃣ Don't hang up until told to

Would you like to practice making an emergency call with me? I can simulate the operator!`
  };

  return fallbacks[module] || `Hello! I'm Dr. Qian Xuesen from the USTC Fire Safety Laboratory. 

I'm here to help you learn about fire safety in simple, practical ways. Whether you want to know about preventing fires, using a fire extinguisher, or what to do in an emergency — just ask!

What would you like to learn about today?

🔥 Common Fire Causes
💨 Fire & Smoke Basics
🧯 Using a Fire Extinguisher
❌ Fire Safety Myths
🏥 Emergency & First Aid`;
}

// ==================== HEALTH CHECK ENDPOINT ====================
export async function healthCheck(req, res) {
  res.status(200).json({
    status: 'healthy',
    service: 'Fire Safety Laboratory AI',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
}
