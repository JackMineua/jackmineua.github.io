document.addEventListener('DOMContentLoaded', () => {
    const langButtons = document.querySelectorAll('.lang-btn');
    let currentLang = 'en';

    function setLang(lang) {
        currentLang = lang;
        document.querySelectorAll('[data-ua]').forEach(el => {
            const val = el.dataset[lang] || el.dataset.ua || '';
            const tag = (el.tagName || '').toLowerCase();
            if (tag === 'input' || tag === 'textarea') {
                el.placeholder = val;
            } else if (tag === 'button') {
                el.innerHTML = val;
            } else {
                el.innerHTML = val;
            }
        });
        langButtons.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    }

    langButtons.forEach(btn => {
        btn.addEventListener('click', () => setLang(btn.dataset.lang));
    });

    setLang('en');


    const messages = {
        ua: { success: 'Дякую! Повідомлення прийнято (відправка буде реалізована пізніше).', error: 'Будь ласка, заповніть Ім\'я та Telegram.' },
        en: { success: 'Thanks! Message received (sending will be implemented later).', error: 'Please fill in Name and Telegram.' },
        ru: { success: 'Спасибо! Сообщение принято (отправка будет реализована позже).', error: 'Пожалуйста, заполните Имя и Telegram.' }
    };


    const form = document.getElementById('contact-form');
    const formMsg = document.getElementById('form-msg');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = form.name.value.trim();
            const tg = form.tg.value.trim();
            if (!name || !tg) {
                formMsg.textContent = messages[currentLang].error;
                formMsg.style.color = '#b91c1c';
                return;
            }

            formMsg.textContent = messages[currentLang].success;
            formMsg.style.color = 'green';
            form.reset();
        });
    }

    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');

    let DPR = Math.max(1, window.devicePixelRatio || 1);
    function resizeCanvas() {
        DPR = Math.max(1, window.devicePixelRatio || 1);
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width = Math.floor(w * DPR);
        canvas.height = Math.floor(h * DPR);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    window.addEventListener('resize', () => {
        resizeCanvas();
    });
    resizeCanvas();

    const mouse = { x: null, y: null };
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });

    class Node {
        constructor(w, h) {
            this.reset(w, h);
        }
        reset(w, h) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.r = 1.8 + Math.random() * 2.8;
        }
        step(w, h) {
            this.x += this.vx;
            this.y += this.vy;

            this.vx *= 0.995;
            this.vy *= 0.995;

            if (this.x < -10) this.x = w + 10;
            if (this.x > w + 10) this.x = -10;
            if (this.y < -10) this.y = h + 10;
            if (this.y > h + 10) this.y = -10;

            if (mouse.x !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const d = Math.sqrt(dx * dx + dy * dy) || 0.0001;
                const influence = 140;
                if (d < influence) {
                    const f = (influence - d) / influence;
                    this.vx += (dx / d) * f * 1.2;
                    this.vy += (dy / d) * f * 1.2;
                }
            }
        }
    }

    let nodes = [];
    function initWeb() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const count = Math.min(100, Math.max(28, Math.round((w * h) / 30000)));
        nodes = Array.from({ length: count }, () => new Node(w, h));
    }
    initWeb();

    let lastT = performance.now();
    function draw(t) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const dt = Math.min(40, t - lastT);
        lastT = t;


        ctx.clearRect(0, 0, w, h);

        const threshold = 160;
        ctx.lineWidth = 1;
        for (let i = 0; i < nodes.length; i++) {
            const a = nodes[i];
            a.step(w, h);
        }


        for (let i = 0; i < nodes.length; i++) {
            const a = nodes[i];
            for (let j = i + 1; j < nodes.length; j++) {
                const b = nodes[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < threshold) {
                    const alpha = (1 - d / threshold) * 0.35;
                    ctx.strokeStyle = `rgba(20,30,40,${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }


        if (mouse.x !== null) {
            for (const n of nodes) {
                const dx = n.x - mouse.x;
                const dy = n.y - mouse.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < 200) {
                    const alpha = (1 - d / 200) * 0.45;
                    ctx.strokeStyle = `rgba(10,20,30,${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(n.x, n.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }


        for (const n of nodes) {
            ctx.beginPath();
            ctx.fillStyle = 'rgba(250,250,250,0.95)';
            ctx.strokeStyle = 'rgba(30,40,50,0.06)';
            ctx.lineWidth = 0.6;
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);


    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resizeCanvas();
            initWeb();
        }, 250);
    });


    (function carousel() {
        const track = document.querySelector('.carousel-track');
        const wrapper = document.querySelector('.carousel-track-wrapper');
        const slides = Array.from(track.children);
        const prevBtn = document.querySelector('.carousel-btn.prev');
        const nextBtn = document.querySelector('.carousel-btn.next');
        const dotsContainer = document.querySelector('.carousel-dots');

        let currentIndex = 0;

        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            dot.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel();
            });
            dotsContainer.appendChild(dot);
        });

        const dots = Array.from(dotsContainer.children);

        function updateCarousel() {
            const wrapperWidth = wrapper.clientWidth;
            const slide = slides[currentIndex];
            const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
            let target = slideCenter - wrapperWidth / 2;

            const maxTarget = Math.max(0, track.scrollWidth - wrapperWidth);
            if (target < 0) target = 0;
            if (target > maxTarget) target = maxTarget;

            track.style.transform = `translateX(-${target}px)`;

            slides.forEach((slide, index) => {
                slide.classList.remove('center', 'left', 'right');

                if (index === currentIndex) slide.classList.add('center');
                else if (index === currentIndex - 1) slide.classList.add('left');
                else if (index === currentIndex + 1) slide.classList.add('right');
            });

            dots.forEach(dot => dot.classList.remove('active'));
            dots[currentIndex].classList.add('active');

            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex === slides.length - 1;
        }

        prevBtn.onclick = () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        };

        nextBtn.onclick = () => {
            if (currentIndex < slides.length - 1) {
                currentIndex++;
                updateCarousel();
            }
        };

        window.addEventListener('resize', updateCarousel);
        updateCarousel();
    }())

    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.card, .project, .skill-card').forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = "all 0.6s ease-out";
        observer.observe(el);
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
