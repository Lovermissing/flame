// scripts/main.js - Fire Safety Laboratory
document.addEventListener('DOMContentLoaded', () => {
    // Element references
    const aiBubble = document.getElementById('aiBubble');
    const aiMessage = document.getElementById('aiMessage');
    const moduleDetail = document.getElementById('moduleDetail');
    const subModuleDetail = document.getElementById('subModuleDetail');
    const closeDetail = document.getElementById('closeDetail');
    const closeSubDetail = document.getElementById('closeSubDetail');
    const backToModule = document.getElementById('backToModule');
    const moduleContent = document.getElementById('moduleContent');
    const moduleTitle = document.getElementById('moduleTitle');
    const subTitle = document.getElementById('subTitle');
    const subContent = document.getElementById('subContent');
    const nextLabBtn = document.getElementById('nextLabBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    // Chat interface elements
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    
    // Current state
    let currentState = 'main'; // main, module, subModule
    let currentModule = null;
    let currentSubModule = null;
    let aiChat = null;
    
    // Module configuration
    const moduleConfig = {
        'fire-causes': {
            title: '🔥 Common Fire Causes',
            description: 'Learn what starts fires at home and how to prevent them.',
            subs: [
                { id: 'overload', title: 'Electrical Overload', image: 'images/1.1.jpg', desc: 'Plugging too many devices into one outlet can cause overheating and fire.' },
                { id: 'kitchen', title: 'Kitchen Oil Fire', image: 'images/1.2.jpg', desc: 'Unattended cooking oil can ignite quickly. Never leave the kitchen!' },
                { id: 'ev-battery', title: 'EV Battery Charging', image: 'images/1.3.jpg', desc: 'Charging electric vehicles indoors is extremely dangerous.' },
                { id: 'clutter', title: 'Cluttered Storage', image: 'images/1.4.jpg', desc: 'Piles of cardboard, paper, and fabric fuel fires rapidly.' },
                { id: 'power-strip', title: 'Power Strip Overload', image: 'images/1.5.jpg', desc: 'Daisy-chaining power strips creates serious electrical hazards.' }
            ]
        },
        'smoke-basics': {
            title: '💨 Fire & Smoke Basics',
            description: 'Understand why smoke is more deadly than flames.',
            content: `<div class="smoke-info">
                <div class="info-card">
                    <h4>🔥 Flame Speed</h4>
                    <p>A small flame can become a large fire in less than 30 seconds.</p>
                </div>
                <div class="info-card">
                    <h4>💀 Smoke Kills Faster</h4>
                    <p>Most fire deaths are caused by smoke inhalation, not burns. Smoke contains toxic gases that can incapacitate you in minutes.</p>
                </div>
                <div class="info-card">
                    <h4>🌡️ Heat Danger</h4>
                    <p>Temperatures in a fire can reach 600°C at eye level. Just one breath of superheated air can damage your lungs.</p>
                </div>
                <div class="info-card">
                    <h4>⏰ Golden Time</h4>
                    <p>You have approximately 3 minutes to escape a house fire. Every second counts!</p>
                </div>
            </div>`
        },
        'extinguisher': {
            title: '🧯 Use a Fire Extinguisher',
            description: 'Simple PASS method guide for using a dry chemical extinguisher.',
            subs: [
                { id: 'pull', title: 'PULL the Pin', image: 'images/2.1.jpg', desc: 'Pull the pin at the top of the extinguisher to break the seal.' },
                { id: 'aim', title: 'AIM at the Base', image: 'images/2.2.jpg', desc: 'Aim the nozzle at the base of the fire, not the flames.' },
                { id: 'squeeze', title: 'SQUEEZE the Handle', image: 'images/2.3.jpg', desc: 'Squeeze the handle slowly and evenly to release the agent.' },
                { id: 'sweep', title: 'SWEEP Side to Side', image: 'images/2.4.jpg', desc: 'Sweep the nozzle from side to side until the fire is out.' }
            ]
        },
        'misconceptions': {
            title: '❌ Common Misconceptions',
            description: 'Debunk popular fire myths that could cost lives.',
            items: [
                { myth: 'Water puts out all fires.', fact: 'NEVER use water on grease fires or electrical fires. Water spreads grease fires and conducts electricity.' },
                { myth: 'Open windows for fresh air during a fire.', fact: 'Opening windows feeds oxygen to the fire, making it grow faster. Close doors and windows.' },
                { myth: 'Elevators are safe for escape.', fact: 'Elevators can trap you if power fails or act as chimneys for smoke. Always use stairs.' },
                { myth: 'A little smoke is harmless.', fact: 'Even small amounts of smoke contain carbon monoxide and toxic chemicals that harm your health.' }
            ]
        },
        'first-aid': {
            title: '🏥 Emergency First Aid',
            description: 'Basic treatment for minor burns and smoke inhalation.',
            content: `<div class="first-aid-guide">
                <h4>For Minor Burns:</h4>
                <ol>
                    <li><strong>Cool</strong> the burn under cool running water for 10-20 minutes</li>
                    <li><strong>Remove</strong> jewelry or tight items near the burned area</li>
                    <li><strong>Cover</strong> with a sterile gauze bandage loosely</li>
                    <li><strong>Do NOT</strong> apply ice, butter, or toothpaste</li>
                </ol>
                <h4>For Smoke Inhalation:</h4>
                <ol>
                    <li><strong>Move</strong> to fresh air immediately</li>
                    <li><strong>Sit upright</strong> to help breathing</li>
                    <li><strong>Call emergency services</strong> if coughing persists</li>
                    <li><strong>Watch for symptoms</strong>: dizziness, confusion, blue lips</li>
                </ol>
                <p class="warning">⚠️ For severe burns or difficulty breathing, seek medical help immediately!</p>
            </div>`
        },
        'emergency-call': {
            title: '📞 Emergency Call Guide',
            description: 'Practice reporting a fire clearly and calmly.',
            content: `<div class="call-guide">
                <h4>When calling emergency services:</h4>
                <div class="call-steps">
                    <p><strong>1. Stay calm</strong> — Take a deep breath before speaking</p>
                    <p><strong>2. Give your location</strong> — Address, building, floor, room number</p>
                    <p><strong>3. Describe the emergency</strong> — What is burning? How big is the fire?</p>
                    <p><strong>4. Report people</strong> — Is anyone trapped or injured?</p>
                    <p><strong>5. Follow instructions</strong> — Do what the operator says</p>
                </div>
                <div class="practice-section">
                    <h4>🎯 Practice with AI:</h4>
                    <p>Ask Dr. Qian to simulate an emergency call scenario with you!</p>
                </div>
            </div>`
        },
        'quiz': {
            title: '📝 Fire Safety Quiz',
            description: 'Test your knowledge with a quick quiz!',
            questions: [
                { q: 'What should you do if a grease fire starts in the kitchen?', options: ['Pour water on it', 'Cover with a lid', 'Fan it with a towel', 'Run away'], correct: 1 },
                { q: 'Why is smoke more dangerous than fire?', options: ['It smells bad', 'It blocks vision', 'It contains toxic gases', 'It makes you cough'], correct: 2 },
                { q: 'What does the P in PASS stand for?', options: ['Push', 'Pull', 'Press', 'Point'], correct: 1 },
                { q: 'Should you use an elevator during a fire?', options: ['Yes, it\'s faster', 'No, use stairs', 'Only if ground floor', 'If no smoke'], correct: 1 },
                { q: 'How long do you typically have to escape a house fire?', options: ['10 minutes', '3 minutes', '1 minute', '30 seconds'], correct: 1 }
            ]
        },
        'qa': {
            title: '💬 Free Q&A',
            description: 'Ask anything about fire safety. Dr. Qian will answer!',
            content: `<div class="qa-welcome">
                <h4>🤖 Ask Dr. Qian Anything About Fire Safety!</h4>
                <p>Examples:</p>
                <ul>
                    <li>"How do I prevent electrical fires at home?"</li>
                    <li>"What should I do if my clothes catch fire?"</li>
                    <li>"Is it safe to use extension cords permanently?"</li>
                    <li>"How often should I replace my smoke detector?"</li>
                </ul>
                <p class="hint">Type your question below and press "Ask AI"!</p>
            </div>`
        }
    };
    
    // ==================== INITIALIZATION ====================
    
    function init() {
        console.log('Initializing Fire Safety Laboratory...');
        
        setTimeout(() => {
            showWelcomeMessage();
        }, 500);
        
        setTimeout(() => {
            setupEventListeners();
        }, 1000);
        
        setTimeout(() => {
            initAIChat();
        }, 1500);
        
        setTimeout(() => {
            if (loadingOverlay) {
                loadingOverlay.style.opacity = '0';
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                }, 500);
            }
        }, 2000);
    }
    
    // ==================== EVENT LISTENERS ====================
    
    function setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Module card clicks
        document.querySelectorAll('.module-card').forEach(card => {
            card.addEventListener('click', () => {
                const module = card.dataset.module;
                if (module && currentState === 'main') {
                    showModuleDetail(module);
                }
            });
        });
        
        // Close detail
        if (closeDetail) {
            closeDetail.addEventListener('click', closeModuleDetail);
        }
        
        // Close sub detail
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
        
        // Next lab button
        if (nextLabBtn) {
            nextLabBtn.addEventListener('click', () => {
                alert('Next laboratory coming soon!');
            });
        }
        
        // Chat send button
        if (sendBtn) {
            sendBtn.addEventListener('click', sendMessage);
        }
        
        // Enter key to send message
        if (userInput) {
            userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
        }
        
        console.log('Event listeners set up successfully');
    }
    
    // ==================== AI CHAT ====================
    
    function initAIChat() {
        console.log('Initializing AI chat...');
        
        aiChat = {
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
                messageDiv.innerHTML = `<p>${this.escapeHtml(content)}</p>`;
                
                const timeDiv = document.createElement('div');
                timeDiv.className = 'message-time';
                timeDiv.textContent = new Date().toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                messageDiv.appendChild(timeDiv);
                
                chatMessages.appendChild(messageDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            },
            
            sendMessage: async function(message) {
                this.addMessage(message, 'user');
                if (sendBtn) sendBtn.disabled = true;
                
                try {
                    const response = await this.callAI(message);
                    this.addMessage(response, 'ai');
                } catch (error) {
                    console.error('AI Error:', error);
                    this.addMessage("I apologize, but I'm having trouble connecting right now. Please try again.", 'ai');
                } finally {
                    if (sendBtn) sendBtn.disabled = false;
                    if (userInput) userInput.focus();
                }
            },
            
            callAI: async function(message) {
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
                
                this.chatHistory.push({ 
                    role: 'user', 
                    content: message 
                });
                this.chatHistory.push({ 
                    role: 'assistant', 
                    content: data.content 
                });
                
                return data.content;
            },
            
            escapeHtml: function(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }
        };
        
        console.log('AI chat initialized successfully');
    }
    
    // ==================== SEND MESSAGE ====================
    
    function sendMessage() {
        if (!userInput || !aiChat) return;
        
        const message = userInput.value.trim();
        if (!message) return;
        
        userInput.value = '';
        
        if (aiChat && currentModule) {
            aiChat.sendMessage(message);
        } else {
            if (chatMessages) {
                const tempMsg = document.createElement('div');
                tempMsg.className = 'message ai';
                tempMsg.innerHTML = '<p>Please select a module first to start asking questions.</p>';
                chatMessages.appendChild(tempMsg);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
    }
    
    // ==================== WELCOME MESSAGE ====================
    
    function showWelcomeMessage() {
        console.log('Showing welcome message...');
        
        if (aiMessage) {
            aiMessage.textContent = "Welcome to the Fire Safety Laboratory! I'm Dr. Qian Xuesen. Click any module to learn about fire prevention and safety!";
        }
        
        setTimeout(() => {
            if (aiBubble) {
                aiBubble.style.animation = 'none';
                setTimeout(() => {
                    aiBubble.style.animation = 'bubbleAppear 0.5s';
                }, 10);
            }
        }, 500);
        
        console.log('Welcome message displayed');
    }
    
    // ==================== SHOW MODULE DETAIL ====================
    
    function showModuleDetail(module) {
        console.log('Showing module detail:', module);
        currentState = 'module';
        currentModule = module;
        
        const config = moduleConfig[module];
        if (!config) return;
        
        if (moduleTitle) {
            moduleTitle.textContent = config.title;
        }
        
        if (moduleDetail) {
            moduleDetail.style.display = 'flex';
        }
        
        // Set AI chat module
        if (aiChat) {
            aiChat.setModule(module);
        }
        
        // Generate content based on module type
        generateModuleContent(module);
        
        // Clear chat
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
        
        // Add welcome message
        setTimeout(() => {
            if (aiChat) {
                aiChat.addMessage(`Welcome to "${config.title}"! I'm Dr. Qian. What would you like to know about this topic?`, 'ai');
            }
        }, 800);
        
        console.log('Module detail displayed');
    }
    
    // ==================== GENERATE MODULE CONTENT ====================
    
    function generateModuleContent(module) {
        const config = moduleConfig[module];
        if (!moduleContent || !config) return;
        
        let html = '';
        
        switch(module) {
            case 'fire-causes':
                html = `<div class="module-intro"><p>${config.description}</p></div>
                <div class="sub-modules-grid">
                    ${config.subs.map((sub, index) => `
                        <div class="sub-module-item" data-sub="${sub.id}" data-module="${module}">
                            <img src="${sub.image}" alt="${sub.title}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22><rect fill=%22%23ff8c00%22 width=%22200%22 height=%22150%22/><text fill=%22white%22 font-size=%2220%22 x=%2250%22 y=%2280%22>${sub.title}</text></svg>'">
                            <h4>${index + 1}. ${sub.title}</h4>
                            <p>${sub.desc}</p>
                            <span class="click-hint">Click for AI explanation →</span>
                        </div>
                    `).join('')}
                </div>`;
                break;
                
            case 'extinguisher':
                html = `<div class="module-intro"><p>${config.description}</p></div>
                <div class="pass-steps">
                    ${config.subs.map((sub, index) => `
                        <div class="pass-step" data-sub="${sub.id}" data-module="${module}">
                            <div class="step-number">${index + 1}</div>
                            <img src="${sub.image}" alt="${sub.title}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22><rect fill=%22%23ff6347%22 width=%22200%22 height=%22150%22/><text fill=%22white%22 font-size=%2220%22 x=%2250%22 y=%2280%22>${sub.title}</text></svg>'">
                            <h4>${sub.title}</h4>
                            <p>${sub.desc}</p>
                            <span class="click-hint">Click for details →</span>
                        </div>
                    `).join('')}
                </div>`;
                break;
                
            case 'misconceptions':
                html = `<div class="module-intro"><p>${config.description}</p></div>
                <div class="myths-list">
                    ${config.items.map((item, index) => `
                        <div class="myth-item">
                            <div class="myth-badge">Myth ${index + 1}</div>
                            <h4>❌ "${item.myth}"</h4>
                            <p>✅ <strong>Truth:</strong> ${item.fact}</p>
                        </div>
                    `).join('')}
                </div>`;
                break;
                
            case 'quiz':
                html = `<div class="module-intro"><p>${config.description}</p></div>
                <div class="quiz-container" id="quizContainer">
                    ${config.questions.map((q, index) => `
                        <div class="quiz-question" data-q="${index}">
                            <h4>Q${index + 1}: ${q.q}</h4>
                            <div class="quiz-options">
                                ${q.options.map((opt, optIndex) => `
                                    <label class="quiz-option">
                                        <input type="radio" name="q${index}" value="${optIndex}">
                                        <span>${opt}</span>
                                    </label>
                                `).join('')}
                            </div>
                            <div class="quiz-result" id="result${index}"></div>
                        </div>
                    `).join('')}
                    <button class="quiz-submit-btn" id="submitQuiz">Submit Answers</button>
                    <div class="quiz-score" id="quizScore"></div>
                </div>`;
                break;
                
            default:
                html = `<div class="module-intro"><p>${config.description}</p></div>
                <div class="module-default-content">${config.content || ''}</div>`;
        }
        
        moduleContent.innerHTML = html;
        
        // Attach event listeners for sub-module items
        attachSubModuleListeners(module);
        
        // Attach quiz listener
        if (module === 'quiz') {
            attachQuizListener();
        }
    }
    
    // ==================== ATTACH SUB MODULE LISTENERS ====================
    
    function attachSubModuleListeners(module) {
        const config = moduleConfig[module];
        if (!config || !config.subs) return;
        
        document.querySelectorAll('.sub-module-item, .pass-step').forEach(item => {
            item.addEventListener('click', () => {
                const subId = item.dataset.sub;
                const parentModule = item.dataset.module;
                const subConfig = moduleConfig[parentModule].subs.find(s => s.id === subId);
                if (subConfig) {
                    showSubModule(subConfig, parentModule);
                }
            });
        });
    }
    
    // ==================== SHOW SUB MODULE ====================
    
    function showSubModule(subConfig, parentModule) {
        console.log('Showing sub module:', subConfig.id);
        currentState = 'subModule';
        currentSubModule = subConfig.id;
        
        if (subTitle) {
            subTitle.textContent = subConfig.title;
        }
        
        if (subContent) {
            subContent.innerHTML = `
                <div class="sub-module-detail">
                    <img src="${subConfig.image}" alt="${subConfig.title}" class="sub-module-image" onerror="this.style.display='none'">
                    <div class="sub-module-text">
                        <h3>${subConfig.title}</h3>
                        <p>${subConfig.desc}</p>
                        <div class="ai-explain-section">
                            <h4>🤖 Ask Dr. Qian:</h4>
                            <p>Want to learn more? Type your question in the chat below!</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (subModuleDetail) {
            subModuleDetail.style.display = 'flex';
        }
    }
    
    // ==================== CLOSE MODULE DETAIL ====================
    
    function closeModuleDetail() {
        console.log('Closing module detail...');
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
            aiMessage.textContent = "Welcome back! Click any module to learn about fire safety.";
        }
    }
    
    // ==================== CLOSE SUB MODULE DETAIL ====================
    
    function closeSubModuleDetail() {
        console.log('Closing sub module detail...');
        currentState = 'module';
        currentSubModule = null;
        
        if (subModuleDetail) {
            subModuleDetail.style.display = 'none';
        }
    }
    
    // ==================== QUIZ FUNCTIONALITY ====================
    
    function attachQuizListener() {
        const submitBtn = document.getElementById('submitQuiz');
        if (submitBtn) {
            submitBtn.addEventListener('click', evaluateQuiz);
        }
    }
    
    function evaluateQuiz() {
        const config = moduleConfig['quiz'];
        if (!config) return;
        
        let score = 0;
        
        config.questions.forEach((q, index) => {
            const selected = document.querySelector(`input[name="q${index}"]:checked`);
            const resultDiv = document.getElementById(`result${index}`);
            
            if (selected) {
                const answer = parseInt(selected.value);
                if (answer === q.correct) {
                    score++;
                    if (resultDiv) {
                        resultDiv.innerHTML = '<span class="correct">✅ Correct!</span>';
                        resultDiv.style.color = '#4CAF50';
                    }
                } else {
                    if (resultDiv) {
                        resultDiv.innerHTML = `<span class="wrong">❌ Wrong. Correct answer: ${q.options[q.correct]}</span>`;
                        resultDiv.style.color = '#FF5252';
                    }
                }
            } else {
                if (resultDiv) {
                    resultDiv.innerHTML = '<span class="no-answer">⚠️ Please select an answer</span>';
                    resultDiv.style.color = '#FF9800';
                }
            }
        });
        
        const scoreDiv = document.getElementById('quizScore');
        if (scoreDiv) {
            const percentage = Math.round((score / config.questions.length) * 100);
            let grade = '';
            if (percentage >= 80) grade = '🌟 Excellent! You are fire-safe!';
            else if (percentage >= 60) grade = '👍 Good! But review the topics you missed.';
            else grade = '📚 Keep learning! Review the modules above.';
            
            scoreDiv.innerHTML = `
                <div class="score-card">
                    <h3>Your Score: ${score}/${config.questions.length} (${percentage}%)</h3>
                    <p>${grade}</p>
                </div>
            `;
        }
    }
    
    // ==================== START APPLICATION ====================
    
    init();
    console.log('Fire Safety Laboratory initialized successfully');
});