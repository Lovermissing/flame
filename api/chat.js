// api/chat.js - Fire Safety Laboratory AI
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY || ''
});

// System prompt for fire safety expert
const BASE_SYSTEM_PROMPT = `You are the young Qian Xuesen, age 28, an enthusiastic fire safety educator at USTC.

Your character:
- Friendly, approachable, and passionate about fire safety education
- Explains complex fire safety concepts in simple, everyday language
- Uses real-life examples and analogies to make lessons memorable
- Always emphasizes prevention and practical safety tips
- Encourages questions and patient with beginners
- Speaks in FIRST PERSON as "I"

Language Guidelines:
- Speak ENTIRELY IN ENGLISH
- NO Chinese phrases or characters
- Simple, conversational tone suitable for non-professionals
- Clear and concise (2-3 paragraphs maximum)
- Avoid technical jargon, formulas, or industry standards
- Focus on practical, actionable advice

Role: You're guiding visitors through the Fire Safety Laboratory at USTC. Your goal is to teach basic fire safety knowledge to ordinary people.`;

// Welcome message
const WELCOME_MESSAGE = `Welcome to the Fire Safety Laboratory! I'm Dr. Qian Xuesen, and I'm here to help you learn about fire safety in a simple, practical way.

Fire safety isn't just for firefighters - it's for everyone! Whether you're a student, a parent, or an office worker, knowing how to prevent fires and stay safe can save lives.

Here you'll find easy-to-understand guides on common fire causes, how to use a fire extinguisher, debunking popular myths, and what to do in an emergency. Feel free to click any module and ask me questions!

What would you like to learn about first?`;

// Module-specific prompts
const MODULE_PROMPTS = {
  'fire-causes': `You are discussing common household fire causes with a visitor. Cover these scenarios:

1. Electrical overload - plugging too many devices into one outlet
2. Kitchen oil fires - unattended cooking
3. EV battery charging indoors
4. Cluttered storage areas
5. Power strip daisy-chaining

For each, explain:
- Why it's dangerous (simple terms)
- How to prevent it
- What to do if it happens

Keep it practical and easy to remember. End with a safety tip.`,

  'smoke-basics': `Explain fire and smoke basics to a complete beginner:

1. How fast fire spreads (a small flame becomes a large fire in 30 seconds)
2. Why smoke is more dangerous than fire (toxic gases, carbon monoxide)
3. How heat rises and affects breathing
4. The "golden 3 minutes" for escape

Use simple comparisons. No technical data. Emphasize: "Smoke kills faster than fire."`,

  'extinguisher': `Teach the PASS method for using a dry chemical fire extinguisher:

P - Pull the pin
A - Aim at the base of the fire
S - Squeeze the handle
S - Sweep side to side

Explain each step simply. Clarify common mistakes. Emphasize: only use on small, contained fires. If the fire grows, evacuate and call for help.`,

  'misconceptions': `Address these common fire safety misconceptions:

1. "Water puts out all fires" - Explain why water is dangerous for grease and electrical fires
2. "Open windows during a fire" - Explain why this feeds oxygen to the fire
3. "Elevators are safe to use" - Explain the dangers of elevator shafts
4. "A little smoke is harmless" - Explain carbon monoxide poisoning

Correct each misconception with a simple, memorable explanation.`,

  'first-aid': `Provide simple first aid guidance for:

Minor burns:
- Cool under running water for 10-20 minutes
- Remove tight items near the burn
- Cover loosely with sterile gauze
- NEVER use ice, butter, or toothpaste

Smoke inhalation:
- Move to fresh air immediately
- Sit upright to breathe easier
- Watch for symptoms: dizziness, confusion, blue lips
- Seek medical help if symptoms persist

Emphasize: For severe burns or breathing difficulty, call emergency services immediately.`,

  'emergency-call': `Guide someone on how to make an emergency call:

1. Stay calm - take a deep breath
2. Give exact location - address, building, floor, room
3. Describe what's happening - what's burning, how big
4. Report people - anyone trapped or injured
5. Follow operator instructions

Offer to practice a simulated emergency call scenario with the user.`,

  'quiz': `You are helping someone review their fire safety quiz answers. Be encouraging and educational. If they got something wrong, explain the correct answer simply. If they did well, praise them and offer additional tips.`
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    console.log('API Request received:', { 
      type: req.body?.type, 
      module: req.body?.module,
      hasMessage: !!req.body?.message 
    });
    
    const { type, module, message, history = [] } = req.body;
    
    if (!process.env.DEEPSEEK_API_KEY) {
      console.error('DeepSeek API Key not configured');
      throw new Error('API Key not configured');
    }
    
    const messages = [
      { role: 'system', content: BASE_SYSTEM_PROMPT }
    ];
    
    if (type === 'welcome') {
      res.status(200).json({
        success: true,
        content: WELCOME_MESSAGE,
        tokens: 0
      });
      return;
      
    } else if (type === 'introduction' && MODULE_PROMPTS[module]) {
      messages.push({
        role: 'user',
        content: `As Young Qian Xuesen, introduce the topic of "${module}" to a visitor who knows nothing about fire safety.\n\n${MODULE_PROMPTS[module]}\n\nKeep it to 3-4 paragraphs maximum. Use only English. Make it friendly and easy to understand.`
      });
      
    } else if (type === 'question' && message) {
      if (history && history.length > 0) {
        messages.push(...history.slice(-5));
      }
      messages.push({ 
        role: 'user', 
        content: `Question about ${module || 'fire safety'}: ${message}\n\nPlease answer in simple English. No technical jargon. Give practical advice.`
      });
      
    } else {
      messages.push({ 
        role: 'user', 
        content: message || 'Hello, can you tell me about fire safety? Please speak in simple English.' 
      });
    }
    
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: messages,
      max_tokens: 600,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });
    
    const aiResponse = completion.choices[0].message.content;
    const tokensUsed = completion.usage?.total_tokens || 0;
    
    console.log(`DeepSeek response received. Tokens used: ${tokensUsed}`);
    
    res.status(200).json({
      success: true,
      content: aiResponse,
      tokens: tokensUsed
    });
    
  } catch (error) {
    console.error('API Error:', error);
    
    const FALLBACK_RESPONSES = {
      'fire-causes': "Common fire causes include electrical overload, kitchen accidents, and improper battery charging. The key is prevention: don't overload outlets, never leave cooking unattended, and charge devices in open areas. What specific situation concerns you?",
      'smoke-basics': "Smoke is actually more dangerous than fire because it contains toxic gases like carbon monoxide. Most fire deaths are from smoke inhalation, not burns. That's why staying low and crawling to exit is so important. Would you like to know more?",
      'extinguisher': "The PASS method is simple: Pull the pin, Aim at the base, Squeeze the handle, Sweep side to side. Remember: only fight small fires. If the fire grows, get out and call for help. Which step would you like me to explain more?",
      'misconceptions': "One of the biggest myths is that water works on all fires. Actually, water makes grease fires explode and conducts electricity in electrical fires. Always use a lid for grease fires and a Class C extinguisher for electrical ones. What other myths have you heard?",
      'first-aid': "For minor burns, cool under running water for 10-20 minutes. Never use ice or butter! For smoke inhalation, get to fresh air immediately. If symptoms persist, seek medical help. What specific injury are you asking about?",
      'emergency-call': "When calling for help, stay calm and give your exact location first. Then describe what's happening and if anyone is trapped. Want to practice with me? I can simulate an emergency call scenario.",
      'quiz': "Great job taking the quiz! Fire safety knowledge can save lives. Would you like me to explain any answers you got wrong, or give you more tips on a specific topic?"
    };
    
    res.status(200).json({
      success: false,
      content: FALLBACK_RESPONSES[req.body?.module] || "Welcome to the Fire Safety Laboratory! I'm Dr. Qian Xuesen. I'm here to help you learn about fire safety in simple terms. What would you like to know?",
      error: error.message,
      fallback: true
    });
  }
}