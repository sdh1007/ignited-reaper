// IgNited Reaper - Interactive JavaScript

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const contactForm = document.querySelector('.contact-form');
const heroButtons = document.querySelectorAll('.hero-buttons .btn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initScrollEffects();
    initContactForm();
    initAnimations();
    initParticleSystem();
});

// Navigation functionality
function initNavigation() {
    // Mobile menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active navigation
                updateActiveNav(this);
                
                // Close mobile menu if open
                if (navMenu.classList.contains('active')) {
                    toggleMobileMenu();
                }
            }
        });
    });

    // Update active navigation on scroll
    window.addEventListener('scroll', updateNavOnScroll);
}

function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
}

function updateActiveNav(activeLink) {
    navLinks.forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
}

function updateNavOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            if (activeLink) {
                updateActiveNav(activeLink);
            }
        }
    });
}

// Scroll effects and animations
function initScrollEffects() {
    // Parallax effect for background flames
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const flames = document.querySelectorAll('.flame');
        
        flames.forEach((flame, index) => {
            const speed = 0.5 + (index * 0.1);
            flame.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe sections for animations
    const animateElements = document.querySelectorAll('.service-card, .about-content, .contact-content');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// Contact form functionality
function initContactForm() {
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmission(this);
        });
    }
}

function handleFormSubmission(form) {
    const formData = new FormData(form);
    const submitBtn = form.querySelector('.btn-primary');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Igniting...';
    submitBtn.disabled = true;
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        showFormSuccess();
        form.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

function showFormSuccess() {
    // Create success message
    const successMessage = document.createElement('div');
    successMessage.className = 'form-success';
    successMessage.innerHTML = `
        <div class="success-content">
            <span class="success-icon">🔥</span>
            <h3>Message Ignited!</h3>
            <p>Your project inquiry has been sent. We'll be in touch soon!</p>
        </div>
    `;
    
    // Add styles for success message
    successMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(10, 10, 10, 0.95);
        border: 2px solid #ff6b35;
        border-radius: 20px;
        padding: 2rem;
        text-align: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
        animation: successPop 0.5s ease-out;
    `;
    
    document.body.appendChild(successMessage);
    
    // Remove success message after 3 seconds
    setTimeout(() => {
        successMessage.style.animation = 'successFade 0.5s ease-out forwards';
        setTimeout(() => {
            document.body.removeChild(successMessage);
        }, 500);
    }, 3000);
}

// Initialize animations
function initAnimations() {
    // Add CSS animations dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes successPop {
            0% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
            100% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }
        
        @keyframes successFade {
            to {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
        }
        
        .animate-in {
            animation: fadeInUp 0.8s ease-out forwards;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .hamburger.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
        
        @media (max-width: 768px) {
            .nav-menu {
                position: fixed;
                top: 80px;
                left: -100%;
                width: 100%;
                height: calc(100vh - 80px);
                background: rgba(10, 10, 10, 0.98);
                flex-direction: column;
                justify-content: flex-start;
                align-items: center;
                padding-top: 2rem;
                transition: left 0.3s ease;
                backdrop-filter: blur(10px);
            }
            
            .nav-menu.active {
                left: 0;
            }
            
            .nav-menu li {
                margin: 1rem 0;
            }
            
            .nav-link {
                font-size: 1.2rem;
            }
        }
    `;
    document.head.appendChild(style);
}

// Particle system for enhanced visual effects
function initParticleSystem() {
    createFloatingParticles();
}

function createFloatingParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
    `;
    
    document.body.appendChild(particleContainer);
    
    // Create floating particles
    for (let i = 0; i < 20; i++) {
        createParticle(particleContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const size = Math.random() * 4 + 1;
    const startX = Math.random() * window.innerWidth;
    const duration = Math.random() * 20 + 10;
    const delay = Math.random() * 5;
    
    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, #ff6b35, transparent);
        border-radius: 50%;
        top: 100vh;
        left: ${startX}px;
        animation: floatUp ${duration}s linear ${delay}s infinite;
        opacity: 0.6;
    `;
    
    container.appendChild(particle);
    
    // Add floating animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 0.6;
            }
            90% {
                opacity: 0.6;
            }
            100% {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Hero button interactions
heroButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (this.textContent.includes('Get Started')) {
            // Scroll to contact section
            document.querySelector('#contact').scrollIntoView({
                behavior: 'smooth'
            });
        } else if (this.textContent.includes('Portfolio')) {
            // Show portfolio modal or navigate
            showPortfolioPreview();
        }
    });
});

function showPortfolioPreview() {
    const modal = document.createElement('div');
    modal.className = 'portfolio-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <h3>🔥 Portfolio Coming Soon</h3>
            <p>Our blazing portfolio is currently being forged in the digital fires. Check back soon to see our latest creations!</p>
            <div class="modal-flames">
                <span>🔥</span>
                <span>⚡</span>
                <span>🔥</span>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        background: rgba(10, 10, 10, 0.95);
        border: 2px solid #ff6b35;
        border-radius: 20px;
        padding: 3rem;
        text-align: center;
        max-width: 500px;
        backdrop-filter: blur(10px);
        position: relative;
    `;
    
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.style.cssText = `
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        color: #ff6b35;
        font-size: 2rem;
        cursor: pointer;
    `;
    
    const flames = modal.querySelector('.modal-flames');
    flames.style.cssText = `
        font-size: 2rem;
        margin-top: 1rem;
        display: flex;
        justify-content: center;
        gap: 1rem;
        animation: flicker 2s ease-in-out infinite;
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized scroll handler
const optimizedScrollHandler = debounce(updateNavOnScroll, 100);
window.addEventListener('scroll', optimizedScrollHandler);

// Console welcome message
console.log(`
🔥 Welcome to IgNited Reaper! 🔥
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 
Where creativity meets technology and digital innovation is ignited!

Interested in working with us? Contact us at hello@ignitedreaper.com
Visit our website: https://ignitedreaper.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

// Add some easter eggs
document.addEventListener('keydown', function(e) {
    // Konami code easter egg
    const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    if (!window.konamiProgress) window.konamiProgress = 0;
    
    if (e.keyCode === konamiCode[window.konamiProgress]) {
        window.konamiProgress++;
        if (window.konamiProgress === konamiCode.length) {
            triggerFireworks();
            window.konamiProgress = 0;
        }
    } else {
        window.konamiProgress = 0;
    }
});

function triggerFireworks() {
    const fireworksContainer = document.createElement('div');
    fireworksContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
    `;
    
    document.body.appendChild(fireworksContainer);
    
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            createFirework(fireworksContainer);
        }, i * 200);
    }
    
    setTimeout(() => {
        document.body.removeChild(fireworksContainer);
    }, 3000);
}

function createFirework(container) {
    const firework = document.createElement('div');
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    
    firework.innerHTML = '🎆';
    firework.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        font-size: 2rem;
        animation: explode 1s ease-out forwards;
        transform-origin: center;
    `;
    
    container.appendChild(firework);
    
    const explodeStyle = document.createElement('style');
    explodeStyle.textContent = `
        @keyframes explode {
            0% {
                transform: scale(0) rotate(0deg);
                opacity: 1;
            }
            50% {
                transform: scale(1.5) rotate(180deg);
                opacity: 1;
            }
            100% {
                transform: scale(3) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(explodeStyle);
    
    setTimeout(() => {
        container.removeChild(firework);
    }, 1000);
}












