document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Click zoom effect nos icones de servicos
    const triggerZoom = (el) => {
        if (!el) return;
        el.classList.remove('click-zoom');
        void el.offsetWidth; // reflow para reiniciar animacao
        el.classList.add('click-zoom');
        el.addEventListener('animationend', () => el.classList.remove('click-zoom'), { once: true });
    };

    // Tabs de solucoes: zoom no icone ao clicar na tab
    document.querySelectorAll('.sol-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const icon = tab.querySelector('.tab-icon');
            triggerZoom(icon);
        });
    });

    // Cards de diferenciais: zoom no icone ao clicar no card
    document.querySelectorAll('.diff-card').forEach(card => {
        card.addEventListener('click', () => {
            const icon = card.querySelector('.diff-icon');
            triggerZoom(icon);
        });
    });

    // 2. Mobile Menu Navigation Toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            // Toggle hamburger icon animation
            const spans = mobileToggle.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Close menu on clicking link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const spans = mobileToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }

    // 3. Scroll Header Effect & Active Link Highlighting
    const header = document.getElementById('header');
    const sections = document.querySelectorAll('section');

    const handleScroll = () => {
        const scrollPos = window.scrollY;

        // Header style on scroll
        if (scrollPos > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active link tracking
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial run on load

    // 4. Scroll-Bound Circle Highlights & Responsive Scroll Reveal (Up/Down)
    const revealElements = document.querySelectorAll('.reveal');
    const sketchHighlights = document.querySelectorAll('.sketch-highlight:not(.navbar-sketch)');

    // Direct mapping function between scroll and stroke-dashoffset for hand-drawn circles
    const updateSketchProgression = () => {
        sketchHighlights.forEach(element => {
            const path = element.querySelector('.sketch-svg path');
            if (!path) return;

            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Start drawing circle when element enters at 98% viewport height
            // Finish drawing only when it reaches 10% viewport height — longo range = desenha devagar
            const startY = windowHeight * 0.98;
            const endY = windowHeight * 0.10;

            // Calculate progression from 0 to 1 based on page scroll direction and depth
            let progress = 0;
            if (rect.top < startY && rect.top > endY) {
                progress = (startY - rect.top) / (startY - endY);
            } else if (rect.top <= endY) {
                progress = 1;
            }

            progress = Math.max(0, Math.min(1, progress));

            // Map the calculated progress to the 2000px stroke offset (scroll down = draws, scroll up = undraws)
            const strokeDash = 2000;
            const offset = strokeDash * (1 - progress);

            path.style.strokeDasharray = strokeDash;
            path.style.strokeDashoffset = offset;
        });
    };

    // Responsive trigger that adds class on enter and removes it on exit (working on both down scroll and up scroll)
    const checkScrollEffects = () => {
        const windowHeight = window.innerHeight;

        revealElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            // Active zone: top is below 92% of screen height AND bottom is above -100px (leaving top edge completely)
            if (rect.top < windowHeight * 0.92 && rect.bottom > -100) {
                if (!element.classList.contains('active')) {
                    element.classList.add('active');
                }
            } else {
                // Reset state when it leaves the active viewport zone in either direction
                element.classList.remove('active');
            }
        });

        // Run the scroll-bound circle progression updates
        updateSketchProgression();
    };

    // Advanced bidirectional IntersectionObserver for 120 FPS hardware acceleration
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                } else {
                    // Reset elements when scrolled completely out of the viewport in either direction
                    entry.target.classList.remove('active');
                }
            });
        }, {
            threshold: 0.05, // Trigger when 5% is visible
            rootMargin: '-5% 0px -5% 0px' // Elegant viewport insets for enter/exit triggers
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    }

    // Bind listeners to scroll and resize for immediate responsive rendering
    window.addEventListener('scroll', checkScrollEffects, { passive: true });
    window.addEventListener('resize', checkScrollEffects, { passive: true });

    // Initial run on page load
    checkScrollEffects();

    // 5. Solutions Tab Swapper
    const tabs = document.querySelectorAll('.sol-tab');
    const panes = document.querySelectorAll('.sol-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');

            // Deactivate active tab & activate clicked
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Hide active pane & reveal targeted pane
            panes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.getAttribute('id') === `pane-${targetTab}`) {
                    pane.classList.add('active');
                }
            });
        });
    });

    // 6. Dynamic AI Agent Terminal Simulator (Hero Section)
    const chatBody = document.getElementById('chatBody');
    const agentLogs = [
        { type: 'input', text: 'aguardar_conexao_whatsapp' },
        { type: 'system', text: '[CONECTADO] Sessão WhatsApp estabelecida com Rodrigo Santos.' },
        { type: 'other', text: 'Olá! Queria entender o que a SixtySix faz e quais serviços oferecem.' },
        { type: 'system', text: '[PROCESSANDO] Análise de intenção com IA ativa...' },
        { type: 'success', text: 'Olá, Rodrigo! Somos uma software house premium de alta performance. Desenvolvemos Agentes de IA inteligentes, sistemas corporativos sob medida e automações de processos para escalar sua operação.' },
        { type: 'other', text: 'Que bacana! Vocês criam robôs de atendimento e ERPs personalizados?' },
        { type: 'system', text: '[MAPEAR] Serviços de alta relevância selecionados.' },
        { type: 'success', text: 'Exatamente! Criamos desde chatbots avançados de WhatsApp integrados ao seu banco de dados, até ERPs robustos, CRMs e dashboards completos. Tudo 100% sob medida para sua empresa.' },
        { type: 'other', text: 'Legal! Como faço para falar com a equipe e agendar uma demonstração?' },
        { type: 'system', text: '[CONVERSÃO] Intenção de compra alta (98.2%) identificada!' },
        { type: 'success', text: 'Excelente! Vou liberar nosso calendário do Calendly para você escolher o melhor dia.' },
        { type: 'system', text: '[AGENDA] Buscando horários disponíveis na agenda SixtySix...' },
        { type: 'system', text: '[OK] Reunião agendada: Terça-feira às 14h. Confirmação enviada por e-mail e SMS!' },
        { type: 'success', text: 'Tudo pronto, Rodrigo! Sua reunião foi agendada para terça às 14h. Um abraço!' },
        { type: 'system', text: '[FIM] Atendimento via WhatsApp concluído. Status: Concluído.' }
    ];

    let currentLogIndex = 0; // Start at 0 to feed the initial connection workflow

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const appendTerminalLine = (type, text) => {
        if (!chatBody) return;

        // Get current time formatted (e.g. "16:55")
        const now = new Date();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;

        if (type === 'system') {
            const badge = document.createElement('div');
            badge.className = 'chat-system-badge';
            badge.innerHTML = `<span>${text}</span>`;
            chatBody.appendChild(badge);
        } else if (type === 'input') {
            const badge = document.createElement('div');
            badge.className = 'chat-system-badge';
            badge.innerHTML = `<span>&gt; ${text}</span>`;
            chatBody.appendChild(badge);
        } else if (type === 'success') {
            const msgRow = document.createElement('div');
            msgRow.className = 'chat-message incoming';
            msgRow.innerHTML = `
                <div class="message-bubble">
                    <span class="message-sender">SixtySix AI</span>
                    <p class="message-text">${text}</p>
                    <span class="message-time">${timeStr}</span>
                </div>
            `;
            chatBody.appendChild(msgRow);
        } else {
            const msgRow = document.createElement('div');
            msgRow.className = 'chat-message outgoing';
            msgRow.innerHTML = `
                <div class="message-bubble">
                    <p class="message-text">${text}</p>
                    <span class="message-time">${timeStr} <span style="color: var(--primary); font-weight: bold; margin-left: 2px;">✓✓</span></span>
                </div>
            `;
            chatBody.appendChild(msgRow);
        }

        // Smooth scroll to bottom
        chatBody.scrollTo({
            top: chatBody.scrollHeight,
            behavior: 'smooth'
        });
    };

    const runTerminalSimulation = async () => {
        if (!chatBody) return;

        while (true) {
            await sleep(2200); // interval between logs

            if (currentLogIndex >= agentLogs.length) {
                // Reset terminal with dynamic clear
                await sleep(5000);
                chatBody.innerHTML = `
                    <div class="chat-system-badge">
                        <span>Hoje</span>
                    </div>
                    <div class="chat-system-badge">
                        <span>[SIXTYSIX-CHAT] Agente de atendimento ativo na API WhatsApp.</span>
                    </div>
                `;
                currentLogIndex = 0;
                continue;
            }

            const currentLog = agentLogs[currentLogIndex];
            appendTerminalLine(currentLog.type, currentLog.text);
            currentLogIndex++;
        }
    };

    // Delay start of simulator slightly
    setTimeout(runTerminalSimulation, 1000);

    // 7. Dynamic Inline Meeting Scheduler Widget
    const calendarDays = document.getElementById('calendarDays');
    const timeSlots = document.getElementById('timeSlots');
    const selectedDateInput = document.getElementById('selectedDate');
    const selectedTimeInput = document.getElementById('selectedTime');

    if (calendarDays && timeSlots) {
        // Generate next 5 working days (Monday - Friday)
        const getNextWorkingDays = () => {
            const days = [];
            let date = new Date();

            // Loop until we have 5 working days
            while (days.length < 5) {
                date.setDate(date.getDate() + 1); // Get tomorrow
                const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                    days.push(new Date(date));
                }
            }
            return days;
        };

        const weekdaysPT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
        const workingDays = getNextWorkingDays();

        // Render calendar days
        calendarDays.innerHTML = '';
        workingDays.forEach((day, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'day-btn';
            if (index === 0) btn.classList.add('active'); // Select first day by default

            const wday = weekdaysPT[day.getDay()];
            const num = day.getDate();
            const formattedDate = day.toISOString().split('T')[0];

            btn.innerHTML = `
                <span class="wday">${wday}</span>
                <span class="num">${num}</span>
            `;

            btn.addEventListener('click', () => {
                document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedDateInput.value = formattedDate;
            });

            calendarDays.appendChild(btn);

            // Set initial value
            if (index === 0) {
                selectedDateInput.value = formattedDate;
            }
        });

        // Available times
        const times = ['09:30', '11:00', '14:00', '15:30', '17:00'];
        timeSlots.innerHTML = '';
        times.forEach((time, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'time-btn';
            if (index === 0) btn.classList.add('active'); // Select first slot by default

            btn.textContent = time;

            btn.addEventListener('click', () => {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedTimeInput.value = time;
            });

            timeSlots.appendChild(btn);

            // Set initial value
            if (index === 0) {
                selectedTimeInput.value = time;
            }
        });
    }

    // 8. Contact Form Submission Handler
    const contactForm = document.getElementById('contactForm');
    const formFeedback = document.getElementById('formFeedback');
    const submitBtn = document.getElementById('submitBtn');

    if (contactForm && formFeedback && submitBtn) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Disable buttons and show processing indicator
            submitBtn.disabled = true;
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = `
                Processando solicitação... 
                <i data-lucide="loader-2" class="animate-spin" style="width: 16px; height: 16px;"></i>
            `;

            if (typeof lucide !== 'undefined') {
                lucide.createIcons({
                    node: submitBtn
                });
            }

            // Gather values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const solution = document.getElementById('solution').value;
            const selectedDate = selectedDateInput.value;
            const selectedTime = selectedTimeInput.value;
            const message = document.getElementById('message').value;

            // Log data for local verification/systems integration
            console.log('--- ENTRADA DE LEAD (SIXTYSIX) ---');
            console.log('Nome:', name);
            console.log('E-mail:', email);
            console.log('WhatsApp:', phone);
            console.log('Necessidade:', solution);
            console.log('Data Agendada:', selectedDate);
            console.log('Hora Agendada:', selectedTime);
            console.log('Mensagem:', message);
            console.log('-----------------------------------------');

            // ==========================================
            // CONFIGURAÇÃO DA API UZAPI (WHATSAPP)
            // ==========================================
            // IMPORTANTE: Insira abaixo suas credenciais da UZAPI.
            const UZAPI_USERNAME = 'assnz';
            const UZAPI_PHONE_NUMBER_ID = '490341186052608';
            const UZAPI_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwNDNjMzcyMS05NjNiLTRhNDYtYTIyMi0zZDRkYzIxZWIwYzciLCJ1c2VybmFtZSI6ImFzc256IiwiaW5zdGFuY2VJZCI6IjM1OWIwNzRiLWNjMWItNGRhYi05YzVhLTA1YTdiMzFiMjViOSIsInBob25lX251bWJlcl9pZCI6IjQ5MDM0MTE4NjA1MjYwOCIsImlhdCI6MTc3OTEyMTgwNywiZXhwIjoxNzc5MTIxODY3fQ.i8a2FQGE8KsTnDv6Uruw9Q3JnOfsPpkhE6QXdxKABUg';

            // Traduz a solução para um formato mais legível no WhatsApp
            const solutionLabels = {
                'delivery': 'Plataforma de Delivery',
                'ia': 'Automações com Agentes de IA',
                'custom': 'Sistemas / Software Sob Medida',
                'other': 'Outra necessidade técnica'
            };
            const selectedSolution = solutionLabels[solution] || 'Solicitação de Orçamento';

            // Formata a data de AAAA-MM-DD para DD/MM/AAAA
            const formattedDate = selectedDate ? selectedDate.split('-').reverse().join('/') : '';

            // Mensagem elegante e personalizada que será enviada para o WhatsApp do usuário
            const whatsappMessage = `Olá, *${name}*! 🚀\n\n` +
                `Recebemos a sua solicitação no site da *SixtySix*!\n\n` +
                `Aqui está o resumo da sua solicitação:\n` +
                `📂 *Solução desejada:* ${selectedSolution}\n` +
                `📅 *Conversa estratégica agendada:* ${formattedDate} às ${selectedTime}\n\n` +
                `Um de nossos especialistas em engenharia e inteligência artificial entrará em contato com você em breve para alinhar os detalhes!\n\n` +
                `Caso precise adiantar alguma informação, você pode nos responder por aqui.\n\n` +
                `Atenciosamente,\n` +
                `*Equipe SixtySix ⚡*`;

            // Verifica se a API está configurada antes de enviar
            if (UZAPI_TOKEN !== 'SEU_TOKEN_AQUI' && UZAPI_USERNAME !== 'SEU_USERNAME_AQUI' && UZAPI_PHONE_NUMBER_ID !== 'SEU_PHONE_NUMBER_ID_AQUI') {
                try {
                    // Limpar o número do celular (remover parênteses, espaços, traços)
                    let cleanPhone = phone.replace(/\D/g, '');

                    // Se o número não contiver o DDI do Brasil (55), e tiver 10 ou 11 dígitos, adicionamos 55 no início
                    if (cleanPhone.length === 11 || cleanPhone.length === 10) {
                        cleanPhone = '55' + cleanPhone;
                    }

                    console.log('Enviando mensagem de WhatsApp via UZAPI para:', cleanPhone);

                    const UZAPI_URL = `https://api.uzapi.com.br/${UZAPI_USERNAME}/v1/${UZAPI_PHONE_NUMBER_ID}/messages`;

                    const response = await fetch(UZAPI_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${UZAPI_TOKEN}` // UZAPI utiliza autenticação Bearer Token
                        },
                        body: JSON.stringify({
                            to: cleanPhone, // Destinatário formatado
                            delayMessage: 0,
                            delayTyping: 3, // Simula digitação por 3 segundos no WhatsApp
                            type: 'text',
                            text: {
                                body: whatsappMessage
                            }
                        })
                    });

                    if (response.ok) {
                        console.log('Sucesso: Mensagem de WhatsApp enviada via UZAPI!');
                    } else {
                        const errText = await response.text();
                        console.error('Erro retornado pela API UZAPI:', errText);
                    }
                } catch (error) {
                    console.error('Erro de conexão ao tentar se comunicar com a UZAPI:', error);
                }
            } else {
                console.warn('Aviso: Integração UZAPI não configurada no arquivo js/main.js.');
                // Simula latência de rede em ambiente de teste
                await sleep(1500);
            }

            // Success feedback
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons({
                    node: submitBtn
                });
            }

            // Reveal feedback dialog
            formFeedback.style.display = 'flex';
            formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            // Clear inputs
            contactForm.reset();

            // Re-render scheduling buttons defaults
            const dayBtns = document.querySelectorAll('.day-btn');
            const timeBtns = document.querySelectorAll('.time-btn');
            if (dayBtns.length > 0 && timeBtns.length > 0) {
                dayBtns.forEach((b, idx) => {
                    b.classList.remove('active');
                    if (idx === 0) {
                        b.classList.add('active');
                        selectedDateInput.value = b.querySelector('.num').parentElement.getAttribute('data-date') || new Date().toISOString().split('T')[0];
                    }
                });
                timeBtns.forEach((b, idx) => {
                    b.classList.remove('active');
                    if (idx === 0) {
                        b.classList.add('active');
                        selectedTimeInput.value = b.textContent;
                    }
                });
            }

            // Auto fadeout feedback alert after 8 seconds
            setTimeout(() => {
                formFeedback.style.opacity = '0';
                setTimeout(() => {
                    formFeedback.style.display = 'none';
                    formFeedback.style.opacity = '1';
                }, 400);
            }, 8000);
        });
    }

    // 9. Scroll Progress Bar Indicator
    const scrollProgress = document.getElementById('scrollProgress');
    const updateScrollProgress = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        if (scrollProgress) {
            scrollProgress.style.width = `${scrollPercent}%`;
        }
    };

    // 10. Scroll-To-Top Floating Button Logic
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const handleScrollTopBtn = () => {
        if (scrollTopBtn) {
            if (window.scrollY > 400) {
                scrollTopBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
            }
        }
    };

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Unified scroll event listener for performance
    window.addEventListener('scroll', () => {
        updateScrollProgress();
        handleScrollTopBtn();
    });

    // Run on initial load
    updateScrollProgress();
    handleScrollTopBtn();

    // 12. Active Solutions Showcase Live Mockup Animations

    // -- Delivery Mockup Animation --
    const deliveryOrderList = document.querySelector('.delivery-order-list');
    const deliveryOrders = [
        { name: '#1045 - Smash Burger Duplo', status: 'Recebido', class: 'recebido' },
        { name: '#1046 - Pizza Quatro Queijos', status: 'Preparando', class: 'preparando' },
        { name: '#1047 - Combo Família Super', status: 'Recebido', class: 'recebido' },
        { name: '#1048 - Wrap de Frango + Suco', status: 'Preparando', class: 'preparando' },
        { name: '#1049 - Milkshake Chocolate', status: 'Recebido', class: 'recebido' }
    ];
    let deliveryOrderIdx = 0;
    let totalOrders = 142;
    let totalRevenue = 8200;

    const animateDelivery = () => {
        if (!deliveryOrderList) return;

        // Count up stats randomly to simulate real activity
        totalOrders += 1;
        totalRevenue += parseFloat((Math.random() * 20 + 10).toFixed(2));

        const orderStat = document.querySelector('.stat-box:nth-child(1) .stat-val');
        const revStat = document.querySelector('.stat-box:nth-child(2) .stat-val');

        if (orderStat) orderStat.textContent = totalOrders;
        if (revStat) revStat.textContent = `R$ ${(totalRevenue / 1000).toFixed(1)}k`;

        // Cycle through dynamic order database
        const nextOrder = deliveryOrders[deliveryOrderIdx];
        deliveryOrderIdx = (deliveryOrderIdx + 1) % deliveryOrders.length;

        // Create new order row
        const newRow = document.createElement('div');
        newRow.className = 'order-row new-order';
        newRow.innerHTML = `
            <span>${nextOrder.name}</span>
            <span class="order-status-badge ${nextOrder.class}">${nextOrder.status}</span>
        `;

        // Insert at top of list
        deliveryOrderList.insertBefore(newRow, deliveryOrderList.firstChild);

        // Limit list size to 3 rows
        const currentRows = deliveryOrderList.querySelectorAll('.order-row');
        if (currentRows.length > 3) {
            deliveryOrderList.removeChild(currentRows[currentRows.length - 1]);
        }

        // Periodically upgrade status badges from 'Recebido' -> 'Preparando' -> 'Entregue'
        setTimeout(() => {
            const badges = deliveryOrderList.querySelectorAll('.order-status-badge');
            if (badges[0] && badges[0].classList.contains('recebido')) {
                badges[0].classList.remove('recebido');
                badges[0].classList.add('preparando');
                badges[0].textContent = 'Preparando';
            }
            if (badges[1] && badges[1].classList.contains('preparando')) {
                badges[1].classList.remove('preparando');
                badges[1].classList.add('entregue');
                badges[1].textContent = 'Entregue';
                badges[1].style.background = 'rgba(255,255,255,0.05)';
                badges[1].style.color = 'var(--text-muted)';
            }
        }, 2200);
    };

    // Run delivery updates every 4.5 seconds
    setInterval(animateDelivery, 4500);

    // -- AI Agents Flow Mockup Animation --
    const iaFlowSteps = document.querySelectorAll('.ia-agent-visual .flow-step');
    let iaStepIdx = 0;

    const animateIAFlow = () => {
        if (!iaFlowSteps || iaFlowSteps.length === 0) return;

        iaFlowSteps.forEach(step => step.classList.remove('active'));

        // Activate current step
        iaFlowSteps[iaStepIdx].classList.add('active');

        // Move to next step or reset
        iaStepIdx = (iaStepIdx + 1) % iaFlowSteps.length;
    };

    // Cycle steps every 1.8 seconds for an engaging processing loop
    setInterval(animateIAFlow, 1800);
    animateIAFlow(); // initial run

    // -- Custom SaaS Chart Mockup Animation --
    const chartBars = document.querySelectorAll('#pane-custom .chart-bar');

    const animateChart = () => {
        if (!chartBars || chartBars.length === 0) return;

        chartBars.forEach(bar => {
            // Generate subtle fluctuation around the original value
            const randomVal = Math.floor(Math.random() * 30) + 40; // values between 40% and 70%
            bar.style.height = `${randomVal}%`;
        });
    };

    // Fluctuate chart bars every 2.5 seconds
    setInterval(animateChart, 2500);
    animateChart(); // initial run



    // 11. Mobile Touch Feedback System
    // Enables ultra-responsive active states on mobile touch screens
    document.body.addEventListener('touchstart', () => { }, { passive: true });

    const touchSelectors = '.glass-card, .btn-primary, .btn-secondary, .sol-tab, .diff-card, .timeline-item, .day-btn, .time-btn, .footer-links-list a';
    document.querySelectorAll(touchSelectors).forEach(el => {
        el.addEventListener('touchstart', () => {
            el.classList.add('touched');
        }, { passive: true });

        el.addEventListener('touchend', () => {
            setTimeout(() => {
                el.classList.remove('touched');
            }, 100);
        }, { passive: true });

        el.addEventListener('touchmove', () => {
            el.classList.remove('touched');
        }, { passive: true });

        el.addEventListener('touchcancel', () => {
            el.classList.remove('touched');
        }, { passive: true });
    });
});
