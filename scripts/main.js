// scripts/main.js - Fire Safety Laboratory
// Core JavaScript for interactive fire safety education

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔥 Fire Safety Laboratory initializing...');
    
    // ==================== ELEMENT REFERENCES ====================
    
    // Main elements
    const aiBubble = document.getElementById('aiBubble');
    const aiMessage = document.getElementById('aiMessage');
    const circleContainer = document.getElementById('circleContainer');
    const moduleCards = document.querySelectorAll('.module-card');
    
    // Module detail overlay
    const moduleDetail = document.getElementById('moduleDetail');
    const moduleTitle = document.getElementById('moduleTitle');
    const moduleContent = document.getElementById('moduleContent');
    const closeDetail = document.getElementById('closeDetail');
    
    // Sub module overlay
    const subModuleDetail = document.getElementById('subModuleDetail');
    const subTitle = document.getElementById('subTitle');
    const subContent = document.getElementById('subContent');
    const closeSubDetail = document.getElementById('closeSubDetail');
    const backToModule = document.getElementById('backToModule');
    
    // Chat interface
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    
    // Navigation
    const nextLabBtn = document.getElementById('nextLabBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    // ==================== STATE MANAGEMENT ====================
    
    let currentState = 'main'; // 'main', 'module', 'subModule'
    let currentModule = null;
    let currentSubModule = null;
    let aiChatInstance = null;
    let isProcessing = false;
    
    // ==================== MODULE CONFIGURATION ====================
    
    const moduleConfig = {
        'fire-causes': {
            title: '🔥 Common Fire Causes',
            subtitle: 'Everyday fire risks at home',
            description: 'Learn what starts fires in daily life and how to prevent them.',
            scenes: [
                { 
                    id: 'overload', 
                    title: 'Electrical Overload', 
                    image: 'images/1.1.jpg',
                    desc: 'Plugging too many high-power devices into one outlet can overheat wires and cause fire.',
                    prevention: 'Use power strips with surge protection. Never plug multiple high-wattage appliances into one outlet.',
                    aiPrompt: 'Explain why electrical overload causes fires and how to prevent it.'
                },
                { 
                    id: 'kitchen', 
                    title: 'Kitchen Oil Fire', 
                    image: 'images/1.2.jpg',
                    desc: 'Hot cooking oil can ignite in seconds if left unattended. Never leave the kitchen while frying!',
                    prevention: 'Stay in the kitchen when cooking with oil. Keep a lid nearby to smother flames.',
                    aiPrompt: 'Explain why kitchen oil fires happen and the correct way to handle them.'
                },
                { 
                    id: 'ev-battery', 
                    title: 'EV Battery Charging', 
                    image: 'images/1.3.jpg',
                    desc: 'Charging electric bikes or devices indoors can lead to battery fires from overheating.',
                    prevention: 'Always charge batteries in open, ventilated areas. Use manufacturer-approved chargers.',
                    aiPrompt: 'Explain the dangers of indoor battery charging and safety tips.'
                },
                { 
                    id: 'clutter', 
                    title: 'Cluttered Storage', 
                    image: 'images/1.4.jpg',
                    desc: 'Piles of cardboard, paper, old furniture, and fabrics near heat sources fuel fires rapidly.',
                    prevention: 'Keep storage areas clean and organized. Store flammable items away from heaters and outlets.',
                    aiPrompt: 'Explain how clutter contributes to fire spread and how to organize safely.'
                },
                { 
                    id: 'power-strip', 
                    title: 'Power Strip Overload', 
                    image: 'images/1.5.jpg',
                    desc: 'Daisy-chaining power strips or plugging heavy appliances into light-duty strips is very dangerous.',
                    prevention: 'Plug high-power appliances directly into wall outlets. Never connect power strips in series.',
                    aiPrompt: 'Explain the risks of power strip overload and proper usage guidelines.'
                }
            ]
        },
        'smoke-basics': {
            title: '💨 Fire & Smoke Basics',
            subtitle: 'Why smoke kills faster than fire',
            description: 'Understanding fire and smoke behavior can save your life.',
            facts: [
                {
                    icon: '🔥',
                    title: 'Flame Spread Speed',
                    content: 'A small flame can become a large fire in less than 30 seconds. Fire doubles in size every minute.'
                },
                {
                    icon: '💀',
                    title: 'Smoke Kills Faster',
                    content: 'Most fire deaths are caused by smoke inhalation, not burns. Toxic gases like carbon monoxide can incapacitate you in just 1-2 minutes.'
                },
                {
                    icon: '🌡️',
                    title: 'Heat Danger',
                    content: 'Temperatures at eye level during a fire can reach 600°C (1112°F). One breath of superheated air can damage your lungs instantly.'
                },
                {
                    icon: '⏰',
                    title: 'Golden Escape Time',
                    content: 'You typically have only 3 minutes to escape a house fire. Every second counts — have an escape plan ready.'
                }
            ],
            aiPrompt: 'Explain why smoke is more dangerous than fire in simple terms for beginners.'
        },
        'extinguisher': {
            title: '🧯 Use a Fire Extinguisher',
            subtitle: 'Simple PASS method guide',
            description: 'Learn the 4 simple steps to use a dry chemical fire extinguisher.',
            steps: [
                {
                    id: 'pull',
                    title: 'PULL the Pin',
                    image: 'images/2.1.jpg',
                    desc: 'Pull the pin at the top of the extinguisher to break the tamper seal.',
                    detail: 'Hold the extinguisher firmly. Pull the ring pin straight out. This unlocks the handle.'
                },
                {
                    id: 'aim',
                    title: 'AIM at the Base',
                    image: 'images/2.2.jpg',
                    desc: 'Aim the nozzle at the base of the fire, NOT at the flames.',
                    detail: 'The base is where the fuel source is. Aiming at flames wastes extinguishing agent.'
                },
                {
                    id: 'squeeze',
                    title: 'SQUEEZE the Handle',
                    image: 'images/2.3.jpg',
                    desc: 'Squeeze the handle slowly and evenly to release the extinguishing agent.',
                    detail: 'Stand 6-8 feet away. Squeeze gently at first, then increase pressure steadily.'
                },
                {
                    id: 'sweep',
                    title: 'SWEEP Side to Side',
                    image: 'images/2.4.jpg',
                    desc: 'Sweep the nozzle from side to side until the fire is completely out.',
                    detail: 'Move slowly and deliberately. Watch for re-ignition after extinguishing.'
                }
            ],
            aiPrompt: 'Teach the PASS method for using a fire extinguisher in simple steps.'
        },
        'misconceptions': {
            title: '❌ Common Misconceptions',
            subtitle: 'Debunk popular fire myths',
            description: 'These dangerous myths could cost lives. Learn the truth!',
            myths: [
                {
                    myth: 'Water puts out all fires.',
                    truth: 'NEVER use water on grease fires or electrical fires! Water makes grease fires explode and conducts electricity, causing shocks.',
                    icon: '💧'
                },
                {
                    myth: 'Open windows during a fire for fresh air.',
                    truth: 'Opening windows feeds oxygen to the fire, making it grow much faster. Always close doors and windows behind you.',
                    icon: '🪟'
                },
                {
                    myth: 'Elevators are safe to use during a fire.',
                    truth: 'Elevators can trap you if power fails. They also act like chimneys, filling with smoke. Always use stairs!',
                    icon: '🛗'
                },
                {
                    myth: 'A little smoke is harmless.',
                    truth: 'Even small amounts of smoke contain carbon monoxide and toxic chemicals. If you see or smell smoke, get out immediately!',
                    icon: '💭'
                }
            ],
            aiPrompt: 'Explain why these common fire safety myths are dangerous and what the correct actions are.'
        },
        'emergency': {
            title: '🏥 Emergency & First Aid',
            subtitle: 'Burn care & emergency call guide',
            description: 'Know what to do in a fire emergency — it could save a life.',
            sections: [
                {
                    id: 'burn-care',
                    title: '🔥 Minor Burn Care',
                    icon: '🩹',
                    steps: [
                        'Cool the burn under cool running water for 10-20 minutes',
                        'Remove jewelry or tight items near the burned area',
                        'Cover loosely with a sterile gauze bandage',
                        'Take over-the-counter pain reliever if needed',
                        'NEVER apply ice, butter, toothpaste, or ointments'
                    ],
                    warning: 'For severe burns (larger than palm, blistering, charred skin), seek immediate medical help!'
                },
                {
                    id: 'smoke-inhalation',
                    title: '💨 Smoke Inhalation',
                    icon: '😮‍💨',
                    steps: [
                        'Move to fresh air immediately',
                        'Sit upright to help breathing',
                        'Loosen tight clothing around neck',
                        'If coughing persists, call emergency services',
                        'Watch for symptoms: dizziness, confusion, blue lips'
                    ],
                    warning: 'If person is unconscious or not breathing, call emergency services immediately!'
                },
                {
                    id: 'emergency-call',
                    title: '📞 Making an Emergency Call',
                    icon: '📱',
                    steps: [
                        'Stay calm — take a deep breath before speaking',
                        'Give your exact location: address, building, floor, room number',
                        'Describe what is burning and how big the fire is',
                        'Report any people trapped or injured',
                        'Follow the operator\'s instructions carefully',
                        'Do NOT hang up until told to do so'
                    ],
                    warning: 'Practice with Dr. Qian! Ask him to simulate an emergency call with you.'
                }
            ],
            aiPrompt: 'Guide users on basic fire first aid and how to make an emergency call.'
        }
    };
    
    // ==================== INITIALIZATION ====================
    
    function init() {
        console.log('🔥 Initializing Fire Safety Laboratory...');
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize AI chat
        initAIChat();
        
        // Show welcome message
        setTimeout(showWelcomeMessage, 500);
        
        // Hide loading overlay
        setTimeout(hideLoading, 2000);
        
        console.log('✅ Fire Safety Laboratory initialized successfully');
    }
    
    // ==================== EVENT LISTENERS ====================
    
    function setupEventListeners() {
        // Module card clicks
        moduleCards.forEach(card => {
            card.addEventListener('click', () => {
                const module = card.getAttribute('data-module');
                if (module && currentState === 'main') {
                    showModuleDetail(module);
                }
            });
        });
        
        // Close module detail
        if (closeDetail) {
            closeDetail.addEventListener('click', closeModuleDetail);
        }
        
        // Close sub module detail
        if (closeSubDetail) {
            closeSubDetail.addEventListener('click', closeSubModuleDetail);
        }
        
        // Back to module from sub
        if (backToModule) {
            backToModule.addEventListener('click', () => {
                if (currentSubModule) {
                    closeSubModuleDetail();
                }
            });
        }
        
        // Send message
        if (sendBtn) {
            sendBtn.addEventListener('click', sendMessage);
        }
        
        // Enter key to send
        if (userInput) {
            userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
        }
        
        // Next lab button
        if (nextLabBtn) {
            nextLabBtn.addEventListener('click', () => {
                // Will be updated with actual URL later
                alert('Next laboratory coming soon!');
            });
        }
        
        // Close overlays on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (currentState === 'subModule') {
                    closeSubModuleDetail();
                } else if (currentState === 'module') {
                    closeModuleDetail();
                }
            }
        });
        
        // Close overlays on background click
        if (moduleDetail) {
            moduleDetail.addEventListener('click', (e) => {
                if (e.target === moduleDetail) {
                    closeModuleDetail();
                }
            });
        }
        
        if (subModuleDetail) {
            subModuleDetail.addEventListener('click', (e) => {
                if (e.target === subModuleDetail) {
                    closeSubModuleDetail();
                }
            });
        }
        
        console.log('✅ Event listeners set up');
    }
    
    // ==================== AI CHAT SYSTEM ====================
    
    function initAIChat() {
        aiChatInstance = {
            currentModule: null,
            chatHistory: [],
            
            setModule: function(module) {
                this.currentModule = module;
                this.chatHistory = [];
            },
            
            addMessage: function(content, sender) {
                if (!chatMessages) return;
                
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${sender}`;
                messageDiv.innerHTML = `
                    <p>${escapeHtml(content)}</p>
                    <div class="message-time">${getCurrentTime()}</div>
                `;
                
                chatMessages.appendChild(messageDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            },
            
            sendMessage: async function(message) {
                if (isProcessing) return;
                isProcessing = true;
                
                this.addMessage(message, 'user');
                if (sendBtn) sendBtn.disabled = true;
                if (userInput) userInput.disabled = true;
                
                try {
                    const response = await this.callAI(message);
                    this.addMessage(response, 'ai');
                } catch (error) {
                    console.error('AI Error:', error);
                    this.addMessage(getFallbackResponse(this.currentModule), 'ai');
                } finally {
                    isProcessing = false;
                    if (sendBtn) sendBtn.disabled = false;
                    if (userInput) {
                        userInput.disabled = false;
                        userInput.focus();
                    }
                }
            },
            
            callAI: async function(message) {
                try {
                    const response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            type: 'question',
                            module: this.currentModule,
                            message: message,
                            history: this.chatHistory.slice(-5)
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`API Error: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    this.chatHistory.push({ role: 'user', content: message });
                    this.chatHistory.push({ role: 'assistant', content: data.content });
                    
                    return data.content;
                } catch (error) {
                    console.error('API call failed:', error);
                    throw error;
                }
            }
        };
        
        console.log('✅ AI Chat system initialized');
    }
    
    // ==================== SEND MESSAGE ====================
    
    function sendMessage() {
        if (!userInput || !aiChatInstance || isProcessing) return;
        
        const message = userInput.value.trim();
        if (!message) return;
        
        userInput.value = '';
        
        if (currentModule) {
            aiChatInstance.sendMessage(message);
        } else {
            // If no module selected, add a temporary message
            if (chatMessages) {
                const tempMsg = document.createElement('div');
                tempMsg.className = 'message ai';
                tempMsg.innerHTML = `
                    <p>Please select a module first by clicking one of the circular buttons above. Then I can help you with specific fire safety topics!</p>
                    <div class="message-time">${getCurrentTime()}</div>
                `;
                chatMessages.appendChild(tempMsg);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
    }
    
    // ==================== WELCOME MESSAGE ====================
    
    function showWelcomeMessage() {
        if (aiMessage) {
            aiMessage.textContent = "Welcome to the Fire Science Laboratory! I'm Dr. Qian Xuesen. Click any module around the circle to learn about fire prevention and safety!";
        }
        
        // Re-trigger bubble animation
        if (aiBubble) {
            aiBubble.style.animation = 'none';
            setTimeout(() => {
                aiBubble.style.animation = 'bubbleAppear 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards';
            }, 10);
        }
    }
    
    // ==================== SHOW MODULE DETAIL ====================
    
    function showModuleDetail(module) {
        console.log(`📖 Opening module: ${module}`);
        currentState = 'module';
        currentModule = module;
        
        const config = moduleConfig[module];
        if (!config) {
            console.error(`Module config not found: ${module}`);
            return;
        }
        
        // Set title
        if (moduleTitle) {
            moduleTitle.textContent = `${config.title} — ${config.subtitle}`;
        }
        
        // Generate content
        if (moduleContent) {
            moduleContent.innerHTML = generateModuleHTML(module);
        }
        
        // Show overlay
        if (moduleDetail) {
            moduleDetail.style.display = 'flex';
        }
        
        // Set AI chat module
        if (aiChatInstance) {
            aiChatInstance.setModule(module);
        }
        
        // Clear chat and add welcome message
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
        
        setTimeout(() => {
            if (aiChatInstance) {
                aiChatInstance.addMessage(`Welcome to "${config.title}"! I'm Dr. Qian. What would you like to learn about this topic?`, 'ai');
            }
        }, 600);
        
        // Attach event listeners for sub-items
        setTimeout(() => {
            attachSubItemListeners(module);
        }, 100);
    }
    
    // ==================== GENERATE MODULE HTML ====================
    
    function generateModuleHTML(module) {
        const config = moduleConfig[module];
        if (!config) return '<p>Module content not available.</p>';
        
        let html = `<div class="module-description"><p>${config.description}</p></div>`;
        
        switch(module) {
            case 'fire-causes':
                html += `
                    <div class="scene-grid">
                        ${config.scenes.map((scene, index) => `
                            <div class="scene-card" data-scene="${scene.id}" data-module="${module}">
                                <div class="scene-number">${index + 1}</div>
                                <img src="${scene.image}" alt="${scene.title}" 
                                     onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22><rect fill=%22%23ff8c00%22 width=%22200%22 height=%22150%22/><text fill=%22white%22 font-size=%2218%22 x=%2230%22 y=%2280%22>${scene.title}</text></svg>'">
                                <h4>${scene.title}</h4>
                                <p>${scene.desc}</p>
                                <span class="click-hint">👆 Click for AI explanation</span>
                            </div>
                        `).join('')}
                    </div>
                `;
                break;
                
            case 'smoke-basics':
                html += `
                    <div class="facts-grid">
                        ${config.facts.map(fact => `
                            <div class="fact-card">
                                <div class="fact-icon">${fact.icon}</div>
                                <h4>${fact.title}</h4>
                                <p>${fact.content}</p>
                            </div>
                        `).join('')}
                    </div>
                    <div class="ai-prompt-section">
                        <p>💡 <strong>Ask Dr. Qian:</strong> "${config.aiPrompt}"</p>
                    </div>
                `;
                break;
                
            case 'extinguisher':
                html += `
                    <div class="steps-grid">
                        ${config.steps.map((step, index) => `
                            <div class="step-card" data-step="${step.id}" data-module="${module}">
                                <div class="step-badge">Step ${index + 1}</div>
                                <div class="step-letter">${step.title.charAt(0)}</div>
                                <img src="${step.image}" alt="${step.title}"
                                     onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22100%22><rect fill=%22%23ff6347%22 width=%22150%22 height=%22100%22/><text fill=%22white%22 font-size=%2216%22 x=%2230%22 y=%2255%22>${step.title}</text></svg>'">
                                <h4>${step.title}</h4>
                                <p>${step.desc}</p>
                                <span class="click-hint">👆 Learn more</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="pass-summary">
                        <p><strong>Remember PASS:</strong> <span class="pass-word">P</span>ull · <span class="pass-word">A</span>im · <span class="pass-word">S</span>queeze · <span class="pass-word">S</span>weep</p>
                    </div>
                `;
                break;
                
            case 'misconceptions':
                html += `
                    <div class="myths-list">
                        ${config.myths.map((myth, index) => `
                            <div class="myth-card">
                                <div class="myth-header">
                                    <span class="myth-icon">${myth.icon}</span>
                                    <span class="myth-label">Myth ${index + 1}</span>
                                </div>
                                <div class="myth-statement">
                                    <span class="myth-mark">❌</span>
                                    <p>"${myth.myth}"</p>
                                </div>
                                <div class="truth-statement">
                                    <span class="truth-mark">✅</span>
                                    <p><strong>Truth:</strong> ${myth.truth}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
                break;
                
            case 'emergency':
                html += `
                    <div class="sections-list">
                        ${config.sections.map(section => `
                            <div class="section-card" data-section="${section.id}" data-module="${module}">
                                <div class="section-header">
                                    <span class="section-icon">${section.icon}</span>
                                    <h4>${section.title}</h4>
                                </div>
                                <ol class="section-steps">
                                    ${section.steps.map(step => `<li>${step}</li>`).join('')}
                                </ol>
                                <div class="section-warning">
                                    ⚠️ ${section.warning}
                                </div>
                                <span class="click-hint">👆 Ask Dr. Qian</span>
                            </div>
                        `).join('')}
                    </div>
                `;
                break;
        }
        
        return html;
    }
    
    // ==================== ATTACH SUB ITEM LISTENERS ====================
    
    function attachSubItemListeners(module) {
        const config = moduleConfig[module];
        if (!config) return;
        
        // Fire causes scene cards
        document.querySelectorAll('.scene-card').forEach(card => {
            card.addEventListener('click', () => {
                const sceneId = card.dataset.scene;
                const scene = config.scenes.find(s => s.id === sceneId);
                if (scene) {
                    showSceneDetail(scene, module);
                }
            });
        });
        
        // Extinguisher step cards
        document.querySelectorAll('.step-card').forEach(card => {
            card.addEventListener('click', () => {
                const stepId = card.dataset.step;
                const step = config.steps.find(s => s.id === stepId);
                if (step) {
                    showStepDetail(step, module);
                }
            });
        });
        
        // Emergency section cards
        document.querySelectorAll('.section-card').forEach(card => {
            card.addEventListener('click', () => {
                const sectionId = card.dataset.section;
                const section = config.sections.find(s => s.id === sectionId);
                if (section) {
                    showSectionDetail(section, module);
                }
            });
        });
    }
    
    // ==================== SHOW SUB DETAILS ====================
    
    function showSceneDetail(scene, module) {
        currentState = 'subModule';
        currentSubModule = scene.id;
        
        if (subTitle) {
            subTitle.textContent = `🔥 ${scene.title}`;
        }
        
        if (subContent) {
            subContent.innerHTML = `
                <div class="sub-detail">
                    <img src="${scene.image}" alt="${scene.title}" class="sub-image"
                         onerror="this.style.display='none'">
                    <div class="sub-text">
                        <h3>${scene.title}</h3>
                        <p class="sub-description">${scene.desc}</p>
                        <div class="prevention-box">
                            <h4>🛡️ Prevention Tips</h4>
                            <p>${scene.prevention}</p>
                        </div>
                        <div class="ai-question-box">
                            <h4>🤖 Ask Dr. Qian</h4>
                            <p>Click "Ask AI" below and type: <em>"${scene.aiPrompt}"</em></p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (subModuleDetail) {
            subModuleDetail.style.display = 'flex';
        }
        
        // Send AI prompt automatically
        if (aiChatInstance && chatMessages) {
            chatMessages.innerHTML = '';
            setTimeout(() => {
                aiChatInstance.sendMessage(scene.aiPrompt);
            }, 500);
        }
    }
    
    function showStepDetail(step, module) {
        currentState = 'subModule';
        currentSubModule = step.id;
        
        if (subTitle) {
            subTitle.textContent = `🧯 ${step.title}`;
        }
        
        if (subContent) {
            subContent.innerHTML = `
                <div class="sub-detail">
                    <img src="${step.image}" alt="${step.title}" class="sub-image"
                         onerror="this.style.display='none'">
                    <div class="sub-text">
                        <h3>${step.title}</h3>
                        <p class="sub-description">${step.detail}</p>
                        <div class="tip-box">
                            <h4>💡 Pro Tip</h4>
                            <p>${step.desc}</p>
                        </div>
                        <div class="ai-question-box">
                            <h4>🤖 Practice with Dr. Qian</h4>
                            <p>Ask: <em>"Can you walk me through the ${step.title.toLowerCase()} step?"</em></p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (subModuleDetail) {
            subModuleDetail.style.display = 'flex';
        }
    }
    
    function showSectionDetail(section, module) {
        currentState = 'subModule';
        currentSubModule = section.id;
        
        if (subTitle) {
            subTitle.textContent = `${section.icon} ${section.title}`;
        }
        
        if (subContent) {
            subContent.innerHTML = `
                <div class="sub-detail">
                    <div class="sub-text">
                        <h3>${section.title}</h3>
                        <div class="steps-list">
                            <h4>Steps to follow:</h4>
                            <ol>
                                ${section.steps.map(step => `<li>${step}</li>`).join('')}
                            </ol>
                        </div>
                        <div class="warning-box">
                            <h4>⚠️ Important Warning</h4>
                            <p>${section.warning}</p>
                        </div>
                        <div class="ai-question-box">
                            <h4>🤖 Practice with Dr. Qian</h4>
                            <p>Ask: <em>"Can you help me practice what to say in an emergency call?"</em></p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (subModuleDetail) {
            subModuleDetail.style.display = 'flex';
        }
    }
    
    // ==================== CLOSE FUNCTIONS ====================
    
    function closeModuleDetail() {
        console.log('Closing module detail');
        currentState = 'main';
        currentModule = null;
        
        if (moduleDetail) {
            moduleDetail.style.display = 'none';
        }
        
        if (userInput) {
            userInput.value = '';
        }
        
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
        
        if (aiMessage) {
            aiMessage.textContent = "Welcome back! Click any module around the circle to continue learning about fire safety.";
        }
    }
    
    function closeSubModuleDetail() {
        console.log('Closing sub module detail');
        currentState = 'module';
        currentSubModule = null;
        
        if (subModuleDetail) {
            subModuleDetail.style.display = 'none';
        }
    }
    
    // ==================== LOADING ====================
    
    function hideLoading() {
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }
    }
    
    // ==================== UTILITY FUNCTIONS ====================
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function getCurrentTime() {
        return new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    function getFallbackResponse(module) {
        const fallbacks = {
            'fire-causes': "Common fire causes include electrical overload, kitchen accidents, and improper battery charging. The key is prevention: don't overload outlets, never leave cooking unattended, and charge devices in open areas. What specific situation concerns you?",
            'smoke-basics': "Smoke is actually more dangerous than fire because it contains toxic gases like carbon monoxide. Most fire deaths are from smoke inhalation, not burns. That's why staying low and crawling to exit is so important. Would you like to know more?",
            'extinguisher': "The PASS method is simple: Pull the pin, Aim at the base, Squeeze the handle, Sweep side to side. Remember: only fight small fires. If the fire grows, get out and call for help. Which step would you like me to explain more?",
            'misconceptions': "One of the biggest myths is that water works on all fires. Actually, water makes grease fires explode and conducts electricity in electrical fires. Always use a lid for grease fires and a Class C extinguisher for electrical ones. What other myths have you heard?",
            'emergency': "For minor burns, cool under running water for 10-20 minutes. Never use ice or butter! For smoke inhalation, get to fresh air immediately. When calling for help, stay calm and give your exact location first. What specific situation are you preparing for?"
        };
        
        return fallbacks[module] || "Welcome to the Fire Safety Laboratory! I'm Dr. Qian Xuesen. I'm here to help you learn about fire safety in simple terms. What would you like to know?";
    }
    
    // ==================== START APPLICATION ====================
    
    init();
    console.log('🔥 Fire Safety Laboratory fully loaded');
});
