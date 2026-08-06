// Sticky Navbar Behavior
document.addEventListener('DOMContentLoaded', function() {
    const header = document.getElementById('main-header');
    let lastScroll = 0;
    
    if (header) {
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        }, { passive: true });
    }
});

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const headerContent = document.querySelector('.header-content');
    const header = document.getElementById('main-header');
    const drawer = document.querySelector('.header-drawer');
    const overlay = document.querySelector('.mobile-drawer-overlay');
    
    if (mobileToggle && header && drawer) {
        const hamburgerIcon = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
        `;
        const closeIcon = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        
        // Set initial icon
        mobileToggle.innerHTML = hamburgerIcon;

        function setMenuState(isOpen) {
            header.classList.toggle('menu-open', isOpen);
            document.body.classList.toggle('menu-open', isOpen);
            mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            mobileToggle.innerHTML = isOpen ? closeIcon : hamburgerIcon;
        }

        // Safety: if menu-open class gets stuck, unlock scroll
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && header.classList.contains('menu-open')) {
                setMenuState(false);
            }
        }, { passive: true });

        // Safety: touching/scrolling outside drawer should never keep body locked
        window.addEventListener('scroll', function() {
            if (header.classList.contains('menu-open')) {
                setMenuState(false);
            }
        }, { passive: true });
        
        // Toggle menu on click
        mobileToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const willOpen = !header.classList.contains('menu-open');
            setMenuState(willOpen);
        });
        
        // Close menu when clicking overlay
        if (overlay) {
            overlay.addEventListener('click', function() {
                setMenuState(false);
            });
        }

        // Close menu when clicking outside (fallback)
        document.addEventListener('click', function(e) {
            if (headerContent && !headerContent.contains(e.target) && header.classList.contains('menu-open')) {
                setMenuState(false);
            }
        });

        // Close menu on Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && header.classList.contains('menu-open')) {
                setMenuState(false);
            }
        });
        
        // Close menu when clicking a nav link
        drawer.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                setMenuState(false);
            });
        });
    }
});

// Smooth scroll for navigation links (only for anchor links, not page navigation)
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            // Only prevent default for anchor links (starting with #) or empty hrefs
            if (href && (href.startsWith('#') || href === '')) {
                e.preventDefault();
                // Add smooth scroll behavior if needed
                if (href.startsWith('#')) {
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
            // Allow default behavior for page navigation links (like ./index.html, ./price.html, etc.)
        });
    });

    // Button interactions
    // Get Started button is now a link, no JavaScript needed

    const btnStartTrial = document.querySelector('.btn-start-trial');
    if (btnStartTrial) {
        btnStartTrial.addEventListener('click', function() {
            console.log('Start Free Trial clicked');
            // Add your action here
        });
    }
});

// Add parallax effect to floating cards
document.addEventListener('DOMContentLoaded', function() {
    // Disable parallax on mobile to avoid scroll jank / content "sticking"
    const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isMobile || reduceMotion) return;

    const cards = Array.from(document.querySelectorAll('.floating-card'));
    if (!cards.length) return;

    let ticking = false;
    let lastY = 0;

    function update() {
        ticking = false;
        const y = lastY;
        cards.forEach((card, index) => {
            const speed = 0.12 + index * 0.03; // lower intensity for smoother scroll
            card.style.transform = `translate3d(0, ${Math.round(y * speed)}px, 0)`;
        });
    }

    // Optimized scroll listener with throttling to prevent lag
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        lastY = window.pageYOffset || 0;
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(function() {
                update();
                ticking = false;
            });
        }
    }, { passive: true });
});

// Intersection Observer for animations - Optimized to prevent scroll lag
const observerOptions = {
    threshold: 0.15, // Higher threshold to trigger later
    rootMargin: '0px 0px -100px 0px' // Larger margin to prevent constant checking
};

const observer = new IntersectionObserver(function(entries) {
    // Batch all updates in a single requestAnimationFrame
    requestAnimationFrame(() => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translate3d(0, 0, 0)';
                entry.target.style.willChange = 'auto'; // Remove will-change after animation
                // Unobserve after animation to prevent re-triggering and scroll lag
                observer.unobserve(entry.target);
            }
        });
    });
}, observerOptions);

// Hero elements - Use CSS-only animations (no IntersectionObserver to prevent scroll lag)
// Hero-left already has CSS fadeUp animation, hero-right will use CSS animation too
// document.addEventListener('DOMContentLoaded', function() {
//     // Don't use IntersectionObserver for hero elements - they're visible on load
//     // This prevents scroll lag between hero and AI sections
//     const heroLeft = document.querySelector('.hero-left');
//     const heroRight = document.querySelector('.hero-right');
    
//     // Just ensure they're visible immediately (CSS handles animation)
//     if (heroLeft) {
//         // Remove any inline styles that might conflict
//         heroLeft.style.opacity = '';
//         heroLeft.style.transform = '';
//         heroLeft.style.transition = '';
//     }
    
//     if (heroRight) {
//         // Remove any inline styles that might conflict
//         heroRight.style.opacity = '';
//         heroRight.style.transform = '';
//         heroRight.style.transition = '';
//     }
// });

// Enhanced floating animation for cards
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.floating-card').forEach((card, index) => {
        const randomDelay = Math.random() * 2;
        const randomDuration = 3 + Math.random() * 2;
        
        card.style.animationDelay = `${randomDelay}s`;
        card.style.animationDuration = `${randomDuration}s`;
    });
});

// AI Section Interactions
document.addEventListener('DOMContentLoaded', function() {
    // Generate Design with AI button
    const btnGenerateAI = document.querySelector('.btn-generate-ai');
    if (btnGenerateAI) {
        btnGenerateAI.addEventListener('click', function() {
            console.log('Generate design with AI clicked');
            // Add your action here
        });
    }

    // Color palette selection
    const colorSquares = document.querySelectorAll('.color-square');
    colorSquares.forEach(square => {
        square.addEventListener('click', function() {
            // Remove selected class from all squares
            colorSquares.forEach(sq => sq.classList.remove('color-selected'));
            // Add selected class to clicked square
            this.classList.add('color-selected');
        });
    });

    // Sneaker preview selection
    const sneakerPreviews = document.querySelectorAll('.sneaker-preview');
    sneakerPreviews.forEach(preview => {
        preview.addEventListener('click', function() {
            // Remove selected class from all previews
            sneakerPreviews.forEach(p => p.classList.remove('preview-selected'));
            // Add selected class to clicked preview
            this.classList.add('preview-selected');
        });
    });

    // Add to cart button
    const btnAddToCart = document.querySelector('.btn-add-to-cart');
    if (btnAddToCart) {
        btnAddToCart.addEventListener('click', function() {
            console.log('Add to cart clicked');
            // Add your action here
        });
    }

    // Quantity selector buttons
    const qtyButtons = document.querySelectorAll('.qty-btn');
    qtyButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const qtyValue = this.parentElement.querySelector('.qty-value');
            let currentValue = parseInt(qtyValue.textContent);
            
            if (this.textContent === '+') {
                currentValue++;
            } else if (this.textContent === '-' && currentValue > 1) {
                currentValue--;
            }
            
            qtyValue.textContent = currentValue;
        });
    });

    // AI Section fade-in animation - Optimized to prevent scroll lag
    const aiLeft = document.querySelector('.ai-left');
    const aiRight = document.querySelector('.ai-right');
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Skip animations on mobile or if user prefers reduced motion
    if (!isMobile && !prefersReducedMotion) {
        // Use requestAnimationFrame to batch DOM updates
        requestAnimationFrame(() => {
            if (aiLeft) {
                aiLeft.style.opacity = '0';
                aiLeft.style.transform = 'translate3d(-20px, 0, 0)';
                aiLeft.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                aiLeft.style.willChange = 'opacity, transform';
                observer.observe(aiLeft);
            }
            if (aiRight) {
                aiRight.style.opacity = '0';
                aiRight.style.transform = 'translate3d(20px, 0, 0)';
                aiRight.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                aiRight.style.willChange = 'opacity, transform';
                observer.observe(aiRight);
            }
        });
    } else {
        // Mobile: No animations to prevent scroll lag
        if (aiLeft) {
            aiLeft.style.opacity = '';
            aiLeft.style.transform = '';
            aiLeft.style.willChange = 'auto';
        }
        if (aiRight) {
            aiRight.style.opacity = '';
            aiRight.style.transform = '';
            aiRight.style.willChange = 'auto';
        }
    }
 
    // When resizing to mobile, clear AI section inline styles so heading stays visible
    window.matchMedia('(max-width: 768px)').addEventListener('change', function(e) {
        if (e.matches && aiLeft) {
            aiLeft.style.opacity = '';
            aiLeft.style.transform = '';
        }
        if (e.matches && aiRight) {
            aiRight.style.opacity = '';
            aiRight.style.transform = '';
        }
    });

    // Performance Section Interactions
    const btnLaunchStore = document.querySelector('.btn-launch-store');
    if (btnLaunchStore) {
        btnLaunchStore.addEventListener('click', function() {
            console.log('Launch Your Store clicked');
            // Add your action here
        });
    }

    // Performance Section fade-in animation
    const performanceLeft = document.querySelector('.performance-left');
    const performanceRight = document.querySelector('.performance-right');
    
    if (performanceLeft) {
        performanceLeft.style.opacity = '0';
        performanceLeft.style.transform = 'translateX(-20px)';
        performanceLeft.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(performanceLeft);
    }
    
    if (performanceRight) {
        performanceRight.style.opacity = '0';
        performanceRight.style.transform = 'translateX(20px)';
        performanceRight.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(performanceRight);
    }

    // Card hover animations
    const infoCards = document.querySelectorAll('.info-card');
    infoCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Features Section fade-in animation
    const featuresHeader = document.querySelector('.features-header');
    const featureCards = document.querySelectorAll('.feature-card');
    
    if (featuresHeader) {
        featuresHeader.style.opacity = '0';
        featuresHeader.style.transform = 'translateY(20px)';
        featuresHeader.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(featuresHeader);
    }
    
    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.8s ease ${index * 0.2}s, transform 0.8s ease ${index * 0.2}s`;
        observer.observe(card);
    });

    // Automation Section fade-in animation
    const automationLeft = document.querySelector('.automation-left');
    const automationRight = document.querySelector('.automation-right');
    
    if (automationLeft) {
        automationLeft.style.opacity = '0';
        automationLeft.style.transform = 'translateX(-20px)';
        automationLeft.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(automationLeft);
    }
    
    if (automationRight) {
        automationRight.style.opacity = '0';
        automationRight.style.transform = 'translateX(20px)';
        automationRight.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(automationRight);
    }

    // Get Started Automation button is now a link, no JavaScript needed

    // Automation Navigation Tabs - Direct implementation
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (navTabs.length > 0 && tabContents.length > 0) {
        navTabs.forEach(function(tab) {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const targetTab = this.getAttribute('data-tab');
                if (!targetTab) return;
                
                // Remove active from all tabs
                navTabs.forEach(function(t) {
                    t.classList.remove('active');
                });
                
                // Add active to clicked tab
                this.classList.add('active');
                
                // Hide all tab contents
                tabContents.forEach(function(content) {
                    content.classList.remove('active');
                });
                
                // Show selected tab content
                const targetContent = document.getElementById('tab-' + targetTab);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    // Themes Carousel - Now using pure CSS marquee animations (no JavaScript needed)

    // Explore Themes button
    const btnExploreThemes = document.querySelector('.btn-explore-themes');
    if (btnExploreThemes) {
        btnExploreThemes.addEventListener('click', function() {
            console.log('Explore all themes clicked');
            // Add your action here
        });
    }

    // Themes Section fade-in animation
    const themesLeft = document.querySelector('.themes-left');
    const themesRight = document.querySelector('.themes-right');
    
    if (themesLeft) {
        themesLeft.style.opacity = '0';
        themesLeft.style.transform = 'translateX(-20px)';
        themesLeft.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(themesLeft);
    }
    
    if (themesRight) {
        themesRight.style.opacity = '0';
        themesRight.style.transform = 'translateX(20px)';
        themesRight.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(themesRight);
    }

    // Selling Section fade-in animation
    const sellingHeader = document.querySelector('.selling-header');
    const sellingLeft = document.querySelector('.selling-left');
    const sellingCards = document.querySelectorAll('.selling-card');
    
    if (sellingHeader) {
        sellingHeader.style.opacity = '0';
        sellingHeader.style.transform = 'translateY(20px)';
        sellingHeader.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(sellingHeader);
    }
    
    if (sellingLeft) {
        sellingLeft.style.opacity = '0';
        sellingLeft.style.transform = 'translateX(-20px)';
        sellingLeft.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(sellingLeft);
    }
    
    sellingCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateX(20px)';
        card.style.transition = `opacity 0.8s ease ${index * 0.1}s, transform 0.8s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Testimonials Carousel Functionality (works on index, about, price – dots or progress bar)
    const testimonialsCarousel = document.getElementById('testimonialsCarousel');
    const testimonialPrev = document.getElementById('testimonialPrev');
    const testimonialNext = document.getElementById('testimonialNext');
    const testimonialProgress = document.getElementById('testimonialProgress');
    const testimonialCards = testimonialsCarousel ? testimonialsCarousel.querySelectorAll('.testimonial-card') : [];
    const carouselGap = 28;

    let currentTestimonialIndex = 0;
    const activeFromDom = Array.from(testimonialCards).findIndex(function(c) { return c.classList.contains('active'); });
    if (activeFromDom !== -1) currentTestimonialIndex = activeFromDom;

    function updateTestimonialsCarousel() {
        if (!testimonialCards.length) return;

        testimonialCards.forEach(function(card, index) {
            card.classList.remove('active', 'side-left', 'side-right', 'far-left', 'far-right');
            if (index === currentTestimonialIndex) {
                card.classList.add('active');
            } else if (index === currentTestimonialIndex - 1) {
                card.classList.add('side-left');
            } else if (index === currentTestimonialIndex + 1) {
                card.classList.add('side-right');
            } else if (index < currentTestimonialIndex - 1) {
                card.classList.add('far-left');
            } else if (index > currentTestimonialIndex + 1) {
                card.classList.add('far-right');
            }
        });

        document.querySelectorAll('.testimonial-dots .dot').forEach(function(dot, index) {
            if (index === currentTestimonialIndex) dot.classList.add('active');
            else dot.classList.remove('active');
        });

        if (testimonialProgress) {
            const pct = testimonialCards.length > 0 ? ((currentTestimonialIndex + 1) / testimonialCards.length) * 100 : 0;
            testimonialProgress.style.width = pct + '%';
        }

        if (testimonialsCarousel && testimonialCards[currentTestimonialIndex]) {
            const activeCard = testimonialCards[currentTestimonialIndex];
            const cardWidth = activeCard.offsetWidth;
            const containerWidth = testimonialsCarousel.offsetWidth;
            const cardLeft = activeCard.offsetLeft;
            const scrollPosition = cardLeft - (containerWidth / 2) + (cardWidth / 2);
            testimonialsCarousel.scrollTo({ left: Math.max(0, scrollPosition), behavior: 'smooth' });
        }
    }

    if (testimonialPrev) {
        testimonialPrev.addEventListener('click', function() {
            if (!testimonialCards.length) return;
            currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonialCards.length) % testimonialCards.length;
            updateTestimonialsCarousel();
        });
    }

    if (testimonialNext) {
        testimonialNext.addEventListener('click', function() {
            if (!testimonialCards.length) return;
            currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonialCards.length;
            updateTestimonialsCarousel();
        });
    }

    document.querySelectorAll('.testimonial-dots .dot').forEach(function(dot, index) {
        dot.addEventListener('click', function() {
            if (index < testimonialCards.length) {
                currentTestimonialIndex = index;
                updateTestimonialsCarousel();
            }
        });
    });

    if (testimonialsCarousel && testimonialCards.length > 0) {
        updateTestimonialsCarousel();
        testimonialsCarousel.addEventListener('scroll', function() {
            if (!testimonialCards[0]) return;
            const cardWidth = testimonialCards[0].offsetWidth;
            const scrollLeft = testimonialsCarousel.scrollLeft;
            const newIndex = Math.round((scrollLeft + (testimonialsCarousel.offsetWidth / 2)) / (cardWidth + carouselGap));
            if (newIndex >= 0 && newIndex < testimonialCards.length && newIndex !== currentTestimonialIndex) {
                currentTestimonialIndex = newIndex;
                updateTestimonialsCarousel();
            }
        });
    }

    // Testimonials Section fade-in animation
    const testimonialsHeader = document.querySelector('.testimonials-header');
    const testimonialsCarouselWrapper = document.querySelector('.testimonials-carousel-wrapper');
    
    if (testimonialsHeader) {
        testimonialsHeader.style.opacity = '0';
        testimonialsHeader.style.transform = 'translateY(20px)';
        testimonialsHeader.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(testimonialsHeader);
    }
    
    if (testimonialsCarouselWrapper) {
        testimonialsCarouselWrapper.style.opacity = '0';
        testimonialsCarouselWrapper.style.transform = 'translateY(30px)';
        testimonialsCarouselWrapper.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(testimonialsCarouselWrapper);
    }

    // Testimonials Price Slider Functionality
    const testimonialsPriceCarousel = document.getElementById('testimonialsPriceCarousel');
    const testimonialsPricePrev = document.getElementById('testimonialsPricePrev');
    const testimonialsPriceNext = document.getElementById('testimonialsPriceNext');
    
    if (testimonialsPriceCarousel && testimonialsPricePrev && testimonialsPriceNext) {
        let currentSlide = 0;
        const slides = testimonialsPriceCarousel.querySelectorAll('.testimonial-price-card');
        const totalSlides = slides.length;

        function updateCarousel() {
            const translateX = -currentSlide * 100;
            testimonialsPriceCarousel.style.transform = `translateX(${translateX}%)`;
        }

        function goToNext() {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        }

        function goToPrev() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateCarousel();
        }

        testimonialsPriceNext.addEventListener('click', goToNext);
        testimonialsPricePrev.addEventListener('click', goToPrev);

        // Initialize
        updateCarousel();
    }
});

// Terms of Use Table of Contents Navigation with Active Scroll Indicators
document.addEventListener('DOMContentLoaded', function() {
    const tocLinks = document.querySelectorAll('.terms-toc .toc-link, .toc-link');
    const termsSections = document.querySelectorAll('.terms-section, .privacy-card');
    
    if (tocLinks.length > 0 && termsSections.length > 0) {
        // Smooth scroll on TOC link click
        tocLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href')?.substring(1) || this.getAttribute('data-section');
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // Remove active class from all links
                    tocLinks.forEach(l => l.classList.remove('active'));
                    // Add active class to clicked link
                    this.classList.add('active');
                    
                    // Smooth scroll to target
                    const headerOffset = 120;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Update active TOC link on scroll with Intersection Observer
        const observerOptions = {
            rootMargin: '-120px 0px -60% 0px',
            threshold: [0, 0.25, 0.5, 0.75, 1]
        };
        
        const observer = new IntersectionObserver(function(entries) {
            // Find the section that's most visible
            let mostVisible = null;
            let maxVisibility = 0;
            
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const visibility = entry.intersectionRatio;
                    if (visibility > maxVisibility) {
                        maxVisibility = visibility;
                        mostVisible = entry.target;
                    }
                }
            });
            
            if (mostVisible) {
                const id = mostVisible.id;
                tocLinks.forEach(link => {
                    const linkId = link.getAttribute('href')?.substring(1) || link.getAttribute('data-section');
                    link.classList.remove('active');
                    if (linkId === id) {
                        link.classList.add('active');
                    }
                });
            }
        }, observerOptions);
        
        // Observe all terms sections
        termsSections.forEach(section => {
            if (section.id) {
                observer.observe(section);
            }
        });
        
        // Also handle scroll for better UX
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    // Find the section currently in view
                    let currentSection = null;
                    const scrollPosition = window.scrollY + 180;
                    
                    termsSections.forEach(section => {
                        if (section.id) {
                            const sectionTop = section.offsetTop;
                            const sectionHeight = section.offsetHeight;
                            
                            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                                currentSection = section;
                            }
                        }
                    });
                    
                    if (currentSection) {
                        const id = currentSection.id;
                        tocLinks.forEach(link => {
                            const linkId = link.getAttribute('href')?.substring(1) || link.getAttribute('data-section');
                            link.classList.remove('active');
                            if (linkId === id) {
                                link.classList.add('active');
                            }
                        });
                    }
                    
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
});

// Contact Form Handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const formData = new FormData(contactForm);
            const name = contactForm.querySelector('input[type="text"]').value;
            const email = contactForm.querySelector('input[type="email"]').value;
            const phone = contactForm.querySelector('input[type="tel"]').value;
            const message = contactForm.querySelector('textarea').value;
            
            // Basic validation
            if (name && email && phone && message) {
                // Here you would typically send the data to a server
                console.log('Form submitted:', { name, email, phone, message });
                
                // Show success message (you can customize this)
                alert('Thank you for your message! We will get back to you soon.');
                
                // Reset form
                contactForm.reset();
            } else {
                alert('Please fill in all fields.');
            }
        });
    }
});

// Notification Overlap Animation - One at a time, faster speed
document.addEventListener('DOMContentLoaded', function() {
    const notificationsContainer = document.querySelector('.notifications-container');
    if (!notificationsContainer) return;
    
    const notificationCards = Array.from(notificationsContainer.querySelectorAll('.notification-card'));
    if (notificationCards.length < 3) return;
    
    // Notification data pool - varied content
    const notificationData = [
        {
            icon: '✓',
            iconClass: 'notification-icon-success',
            title: 'New Order Received',
            subtitle: '+12 today',
            subtitleColor: 'color-orange'
        },
        {
            icon: '✓',
            iconClass: 'notification-icon-success',
            title: 'Payment Successful',
            subtitle: '₹32,500',
            subtitleColor: 'color-green'
        },
        {
            icon: '📊',
            iconClass: 'notification-icon-analytics',
            title: 'Analytics Updated',
            subtitle: 'Visitors +5.6%',
            subtitleColor: 'color-blue'
        },
        {
            icon: '✓',
            iconClass: 'notification-icon-success',
            title: 'New Order Received',
            subtitle: '+8 today',
            subtitleColor: 'color-orange'
        },
        {
            icon: '✓',
            iconClass: 'notification-icon-success',
            title: 'Payment Successful',
            subtitle: '₹28,900',
            subtitleColor: 'color-green'
        },
        {
            icon: '📊',
            iconClass: 'notification-icon-analytics',
            title: 'Analytics Updated',
            subtitle: 'Visitors +4.8%',
            subtitleColor: 'color-blue'
        },
        {
            icon: '✓',
            iconClass: 'notification-icon-success',
            title: 'New Order Received',
            subtitle: '+5 today',
            subtitleColor: 'color-orange'
        },
        {
            icon: '✓',
            iconClass: 'notification-icon-success',
            title: 'Payment Successful',
            subtitle: '₹12,400',
            subtitleColor: 'color-green'
        }
    ];
    
    let currentDataIndex = 0;
    const rotationInterval = 1500; // Faster rotation - 1.5 seconds
    
    function updateNotificationContent(card, data) {
        const iconElement = card.querySelector('.notification-icon');
        const titleElement = card.querySelector('.notification-title');
        const subtitleElement = card.querySelector('.notification-subtitle');
        
        if (iconElement) {
            iconElement.className = `notification-icon ${data.iconClass}`;
            iconElement.textContent = data.icon;
        }
        if (titleElement) titleElement.textContent = data.title;
        if (subtitleElement) {
            subtitleElement.textContent = data.subtitle;
            subtitleElement.className = 'notification-subtitle ' + data.subtitleColor;
        }
    }
    
    // Initialize - show first notification
    function initializePositions() {
        notificationCards.forEach((card, cardIndex) => {
            // Remove all position classes
            card.classList.remove('position-front', 'position-moving-down', 'position-behind', 'position-hidden', 'position-slide-in', 'position-burst-in', 'position-stack-1', 'position-stack-2', 'position-stack-3', 'position-stack-4', 'position-stack-5', 'position-stack-6', 'position-stack-7', 'position-stack-8');
            
            if (cardIndex === 0) {
                // First card shows first notification
                updateNotificationContent(card, notificationData[currentDataIndex]);
                card.classList.add('position-front');
            } else {
                // Others are hidden
                card.classList.add('position-hidden');
            }
        });
    }
    
    function rotateNotifications() {
        // Find current front card
        const currentFrontCard = Array.from(notificationCards).find(card => 
            card.classList.contains('position-front')
        );
        
        if (!currentFrontCard) return;
        
        // Find next hidden card to use
        const nextCard = Array.from(notificationCards).find(card => 
            card.classList.contains('position-hidden') || card.classList.contains('position-behind')
        );
        
        if (!nextCard) return;
        
        // Get next notification data
        currentDataIndex = (currentDataIndex + 1) % notificationData.length;
        const nextNotificationData = notificationData[currentDataIndex];
        
        // Update next card content
        updateNotificationContent(nextCard, nextNotificationData);
        
        // Step 1: Move current front card down (going behind)
        currentFrontCard.classList.remove('position-front');
        currentFrontCard.classList.add('position-moving-down');
        
        // Step 2: Prepare next card to slide in from top
        nextCard.classList.remove('position-hidden', 'position-behind');
        nextCard.classList.add('position-slide-in');
        
        // Step 3: After a brief delay, animate next card to front
        setTimeout(() => {
            nextCard.classList.remove('position-slide-in');
            nextCard.classList.add('position-front');
        }, 30);
        
        // Step 4: Move previous card completely behind after animation
        setTimeout(() => {
            currentFrontCard.classList.remove('position-moving-down');
            currentFrontCard.classList.add('position-behind');
        }, 300);
        
        // Step 5: After animation completes, hide the behind card
        setTimeout(() => {
            currentFrontCard.classList.remove('position-behind');
            currentFrontCard.classList.add('position-hidden');
        }, 800);
    }
    
    // Initialize
    initializePositions();
    
    // Start rotation after initial delay
    setTimeout(() => {
        setInterval(rotateNotifications, rotationInterval);
    }, 500);
});

// FAQ Toggle Functionality (index/other pages - skip on FAQ help center)
document.addEventListener('DOMContentLoaded', function() {
    if (document.body.classList.contains('faq-page')) return;

    const faqItems = document.querySelectorAll('.faq-item');
    
    if (faqItems.length === 0) {
        return;
    }

    faqItems.forEach(function(item) {
        const question = item.querySelector('.faq-question');
        const toggle = item.querySelector('.faq-toggle');
        const icon = item.querySelector('.faq-icon');
        const answer = item.querySelector('.faq-answer');

        if (!question || !toggle || !icon || !answer) {
            console.warn('FAQ item missing required elements', item);
            return;
        }

        function toggleFAQ(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            const isActive = item.classList.contains('active');

            // Close all other FAQ items
            faqItems.forEach(function(i) {
                if (i !== item) {
                    i.classList.remove('active');
                    const toggleBtn = i.querySelector('.faq-toggle');
                    if (toggleBtn) toggleBtn.classList.remove('active');
                }
            });

            // Toggle current item
            if (isActive) {
                // Close current item
                item.classList.remove('active');
                toggle.classList.remove('active');
            } else {
                // Open current item
                item.classList.add('active');
                toggle.classList.add('active');
            }
        }

        // Add event listener to the question div
        question.addEventListener('click', function(e) {
            // Don't trigger if clicking directly on the toggle button (it has its own handler)
            if (e.target === toggle || toggle.contains(e.target)) {
                return;
            }
            toggleFAQ(e);
        });

        // Add separate handler for toggle button
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleFAQ(e);
        });
    });
});

// Blog Load More Functionality
document.addEventListener('DOMContentLoaded', function() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const blogGrid = document.getElementById('blog-grid-container');
    
    if (loadMoreBtn && blogGrid) {
        // Initially hide cards beyond the first 9 (featured + 8 regular)
        const allCards = blogGrid.querySelectorAll('.blog-card');
        const cardsToShow = 9; // Featured + 8 regular cards
        
        if (allCards.length > cardsToShow) {
            // Hide cards beyond the initial set
            for (let i = cardsToShow; i < allCards.length; i++) {
                allCards[i].style.display = 'none';
            }
            
            loadMoreBtn.style.display = 'inline-flex';
            
            loadMoreBtn.addEventListener('click', function() {
                // Show next batch of cards
                let visibleCount = 0;
                allCards.forEach(card => {
                    if (card.style.display !== 'none') {
                        visibleCount++;
                    }
                });
                
                const nextBatch = Math.min(visibleCount + 6, allCards.length);
                
                for (let i = visibleCount; i < nextBatch; i++) {
                    if (allCards[i]) {
                        allCards[i].style.display = 'flex';
                        // Fade in animation
                        allCards[i].style.opacity = '0';
                        allCards[i].style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            allCards[i].style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                            allCards[i].style.opacity = '1';
                            allCards[i].style.transform = 'translateY(0)';
                        }, 10);
                    }
                }
                
                // Hide button if all cards are shown
                if (nextBatch >= allCards.length) {
                    loadMoreBtn.style.display = 'none';
                }
            });
        } else {
            // Hide button if there are no more cards to load
            loadMoreBtn.style.display = 'none';
        }
    }
});

// ============================================
// BLOG DETAIL PAGE FUNCTIONALITY
// ============================================

// Reading Progress Bar
function initReadingProgress() {
    const progressBar = document.getElementById('readingProgress');
    if (!progressBar) return;

    function updateProgress() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
        progressBar.style.width = Math.min(scrollPercent, 100) + '%';
    }

    window.addEventListener('scroll', updateProgress);
    updateProgress();
}

// Table of Contents Active Highlighting
function initTOCHighlighting() {
    const tocLinks = document.querySelectorAll('.toc-link');
    const sections = document.querySelectorAll('.article-section, .platform-card-section, .comparison-table-section, .recommendation-section');
    
    if (tocLinks.length === 0 || sections.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                tocLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}` || link.getAttribute('data-section') === id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        if (section.id) {
            observer.observe(section);
        }
    });

    // Smooth scroll for TOC links
    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href')?.substring(1) || link.getAttribute('data-section');
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerOffset = 100;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Sticky Floating CTA
function initFloatingCTA() {
    const floatingCta = document.getElementById('floatingCta');
    if (!floatingCta) return;

    let lastScrollTop = 0;
    const scrollThreshold = 500; // Show after scrolling 500px

    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > scrollThreshold && scrollTop < lastScrollTop) {
            // Scrolling up
            floatingCta.classList.add('show');
        } else if (scrollTop < scrollThreshold) {
            // Near top
            floatingCta.classList.remove('show');
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Hide on mobile when scrolling down
    if (window.innerWidth <= 768) {
        let mobileLastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            if (currentScroll > mobileLastScroll && currentScroll > scrollThreshold) {
                floatingCta.classList.remove('show');
            }
            mobileLastScroll = currentScroll <= 0 ? 0 : currentScroll;
        }, { passive: true });
    }
}

// Initialize blog detail page features
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on blog detail page
    const isBlogDetailPage = document.querySelector('.blog-article-section') !== null;
    
    if (isBlogDetailPage) {
        initReadingProgress();
        initTOCHighlighting();
        initFloatingCTA();
    }
});

// Smooth scroll for comparison hero CTAs
document.addEventListener('DOMContentLoaded', function() {
    const comparisonLinks = document.querySelectorAll('a[href^="#"]');
    comparisonLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#') && href.length > 1) {
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    const headerOffset = 100;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});

// Core Principles Accordion - Mobile Touch Support
document.addEventListener('DOMContentLoaded', function() {
    const principleRows = document.querySelectorAll('.core-principle-row');
    
    if (principleRows.length > 0) {
        // Check if device is touch-enabled
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        principleRows.forEach(row => {
            // Handle click/tap
            row.addEventListener('click', function(e) {
                // On mobile/touch devices, toggle accordion behavior
                if (isTouchDevice || window.innerWidth <= 768) {
                    e.preventDefault();
                    const isActive = row.classList.contains('active');
                    
                    // Close all other rows
                    principleRows.forEach(otherRow => {
                        if (otherRow !== row) {
                            otherRow.classList.remove('active');
                        }
                    });
                    
                    // Toggle current row
                    row.classList.toggle('active', !isActive);
                }
            });
            
            // Handle hover for desktop (CSS handles this, but we ensure it works)
            if (!isTouchDevice && window.innerWidth > 768) {
                row.addEventListener('mouseenter', function() {
                    row.classList.add('active');
                });
                
                row.addEventListener('mouseleave', function() {
                    row.classList.remove('active');
                });
            }
        });
        
        // Close accordion when clicking outside on mobile
        if (isTouchDevice || window.innerWidth <= 768) {
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.core-principle-row')) {
                    principleRows.forEach(row => {
                        row.classList.remove('active');
                    });
                }
            });
        }
    }
});

// Why Brands Choose Codiic - Premium Interactive Spotlight Section
document.addEventListener('DOMContentLoaded', function() {
    const featurePills = document.querySelectorAll('.why-choose-feature-pill');
    const spotlightTitle = document.querySelector('.why-choose-spotlight-title');
    const spotlightDescription = document.querySelector('.why-choose-spotlight-description');
    const proofItems = document.querySelectorAll('.why-choose-proof-item');
    
    if (featurePills.length === 0) return;
    
    // Content data for each feature
    const featureContent = {
        1: {
            title: 'Built for Indian D2C',
            description: 'Built from the ground up for Indian D2C brands — with GST-compliant workflows, seamless UPI & COD support, and infrastructure designed for local regulations and scale.'
        },
        2: {
            title: 'Scales with Growth',
            description: 'From early-stage brands to enterprise scale, the infrastructure grows seamlessly with your business without compromise.'
        },
        3: {
            title: 'Seamless Integrations',
            description: 'Easily connect payments, shipping, analytics, and marketing tools without complex setup or technical overhead.'
        },
        4: {
            title: 'Enterprise Security',
            description: 'Bank-grade encryption, compliance standards, and security practices you can rely on for your business and customers.'
        },
        5: {
            title: 'Transparent Pricing',
            description: 'Clear, predictable pricing with no hidden charges, built to scale fairly with your success and growth trajectory.'
        }
    };
    
    // Animation timing constants
    const ANIMATION_DURATION = 300; // 300ms for smooth premium feel
    const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
    
    // Function to update spotlight content with smooth fade + slide animation
    function updateSpotlight(featureNumber) {
        const content = featureContent[featureNumber];
        if (!content) return;
        
        // Update title with fade + slide animation
        if (spotlightTitle) {
            // Phase 1: Fade out + slide up
            spotlightTitle.classList.add('animating-out');
            
            setTimeout(() => {
                // Phase 2: Update content
                spotlightTitle.textContent = content.title;
                spotlightTitle.classList.remove('animating-out');
                spotlightTitle.classList.add('animating-in');
                
                // Force reflow
                spotlightTitle.offsetHeight;
                
                // Phase 3: Fade in + slide from below
                setTimeout(() => {
                    spotlightTitle.classList.remove('animating-in');
                }, 10);
            }, ANIMATION_DURATION / 2);
        }
        
        // Update description with fade + slide animation
        if (spotlightDescription) {
            // Phase 1: Fade out + slide up
            spotlightDescription.classList.add('animating-out');
            
            setTimeout(() => {
                // Phase 2: Update content
                spotlightDescription.textContent = content.description;
                spotlightDescription.classList.remove('animating-out');
                spotlightDescription.classList.add('animating-in');
                
                // Force reflow
                spotlightDescription.offsetHeight;
                
                // Phase 3: Fade in + slide from below
                setTimeout(() => {
                    spotlightDescription.classList.remove('animating-in');
                }, 10);
            }, ANIMATION_DURATION / 2);
        }
        
        // Update proof items with smooth fade + slide transition
        proofItems.forEach(item => {
            const proofNumber = parseInt(item.getAttribute('data-proof'));
            if (proofNumber === featureNumber) {
                // Fade out current active item first
                const currentActive = document.querySelector('.why-choose-proof-item.active');
                if (currentActive && currentActive !== item) {
                    currentActive.classList.remove('active');
                    setTimeout(() => {
                        item.classList.add('active');
                    }, 150);
                } else {
                    item.classList.add('active');
                }
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    // Set default state (first feature active)
    if (featurePills.length > 0) {
        const firstPill = featurePills[0];
        const firstFeatureNumber = parseInt(firstPill.getAttribute('data-feature'));
        updateSpotlight(firstFeatureNumber);
    }
    
    // Handle hover/click interactions
    featurePills.forEach(pill => {
        const featureNumber = parseInt(pill.getAttribute('data-feature'));
        
        // Desktop hover
        pill.addEventListener('mouseenter', function() {
            // Remove active from all pills
            featurePills.forEach(p => p.classList.remove('active'));
            // Add active to current pill
            pill.classList.add('active');
            // Update spotlight
            updateSpotlight(featureNumber);
        });
        
        // Mobile/touch click
        pill.addEventListener('click', function(e) {
            if (window.innerWidth <= 1024) {
                e.preventDefault();
                // Remove active from all pills
                featurePills.forEach(p => p.classList.remove('active'));
                // Add active to current pill
                pill.classList.add('active');
                // Update spotlight
                updateSpotlight(featureNumber);
            }
        });
    });
});

// Grow Section - Capability Cards Interaction
document.addEventListener('DOMContentLoaded', function() {
    const capabilityCards = document.querySelectorAll('.grow-capability-card');
    
    if (capabilityCards.length === 0) return;
    
    // Check if device is touch-enabled
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Handle interactions
    capabilityCards.forEach(card => {
        // Desktop hover
        if (!isTouchDevice && window.innerWidth > 768) {
            card.addEventListener('mouseenter', function() {
                // Remove active from all cards
                capabilityCards.forEach(c => c.classList.remove('active'));
                // Add active to current card
                card.classList.add('active');
            });
        }
        
        // Mobile/touch click
        card.addEventListener('click', function(e) {
            if (isTouchDevice || window.innerWidth <= 768) {
                e.preventDefault();
                const isActive = card.classList.contains('active');
                
                // Toggle active state
                if (isActive) {
                    card.classList.remove('active');
                } else {
                    // Remove active from all cards
                    capabilityCards.forEach(c => c.classList.remove('active'));
                    // Add active to current card
                    card.classList.add('active');
                }
            }
        });
    });
    
    // Ensure first card is active by default
    if (capabilityCards.length > 0) {
        const firstCard = capabilityCards[0];
        if (!firstCard.classList.contains('active')) {
            firstCard.classList.add('active');
        }
    }
});

// Use Cases Cards - Tap Interaction only for legacy reveal layout (not used in new reference layout)
document.addEventListener('DOMContentLoaded', function() {
    const useCaseCards = document.querySelectorAll('.use-case-card');
    const hasRevealPanel = document.querySelector('.use-case-card-reveal');
    if (!hasRevealPanel || useCaseCards.length === 0) return;

    const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!supportsHover) {
        useCaseCards.forEach(card => {
            card.addEventListener('click', function(e) {
                if (e.target.closest('.use-case-link')) return;
                e.preventDefault();
                e.stopPropagation();
                const isActive = card.classList.contains('active');
                if (isActive) card.classList.remove('active');
                else card.classList.add('active');
            });
        });
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.use-case-card')) {
                useCaseCards.forEach(card => card.classList.remove('active'));
            }
        });
    }
});

// ============================================
// THEMES PAGE FUNCTIONALITY
// ============================================

// Theme Filter Functionality - Themes Marketplace Page
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on themes page
    const themesFilterSection = document.querySelector('.themes-filter-section');
    const themesMarketplaceGrid = document.getElementById('themes-grid');
    
    if (!themesFilterSection || !themesMarketplaceGrid) return;
    
    const filterTabs = document.querySelectorAll('.filter-tab');
    const themeCards = themesMarketplaceGrid.querySelectorAll('.theme-card');
    
    if (filterTabs.length === 0 || themeCards.length === 0) return;
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            themeCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = '';
                } else if (filter === 'industry') {
                    // For industry-specific, show cards that might have industry category
                    // Since we don't have industry-specific cards yet, hide all for now
                    card.style.display = 'none';
                } else {
                    const category = card.getAttribute('data-category');
                    if (category === filter) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });
});

// Quality Engine Connecting Lines - Themes Page Benefits Section
document.addEventListener('DOMContentLoaded', function() {
    // Check if quality engine exists on page
    const qualityEngineContainer = document.querySelector('.quality-engine-container');
    if (!qualityEngineContainer) return;
    
    const svg = qualityEngineContainer.querySelector('.connection-lines');
    const core = qualityEngineContainer.querySelector('.quality-engine-core');
    const cards = qualityEngineContainer.querySelectorAll('.orbiting-card');
    
    if (!svg || !core || cards.length === 0) return;
    
    // Only draw lines on desktop (where radial layout is used)
    function shouldDrawLines() {
        return window.innerWidth >= 1024;
    }
    
    function drawQualityEngineConnectingLines() {
        // Only draw on desktop
        if (!shouldDrawLines()) {
            // Clear lines on mobile/tablet
            if (svg) {
                svg.innerHTML = '<defs><linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(87, 0, 153, 0.2);stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(87, 0, 153, 0.05);stop-opacity:1" /></linearGradient></defs>';
            }
            return;
        }
        
        const containerRect = qualityEngineContainer.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        // Core is at exact center (50%, 50%)
        const coreX = containerWidth / 2;
        const coreY = containerHeight / 2;
        
        // Set SVG dimensions
        svg.setAttribute('width', containerWidth);
        svg.setAttribute('height', containerHeight);
        
        // Clear existing lines
        svg.innerHTML = '<defs><linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(87, 0, 153, 0.2);stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(87, 0, 153, 0.05);stop-opacity:1" /></linearGradient></defs>';
        
        // Card positions relative to center (340px radius for better spacing)
        const cardPositions = [
            { x: 0, y: -340 },           // Card 1: Top (0°)
            { x: 170, y: -294 },         // Card 2: Top-right (60°)
            { x: -170, y: -294 },        // Card 3: Top-left (120°)
            { x: 0, y: 340 },           // Card 4: Bottom (180°)
            { x: -170, y: 294 },        // Card 5: Bottom-left (240°)
            { x: 170, y: 294 }          // Card 6: Bottom-right (300°)
        ];
        
        cardPositions.forEach((pos, index) => {
            if (index >= cards.length) return;
            
            const cardX = coreX + pos.x;
            const cardY = coreY + pos.y;
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', coreX);
            line.setAttribute('y1', coreY);
            line.setAttribute('x2', cardX);
            line.setAttribute('y2', cardY);
            line.setAttribute('stroke', 'rgba(87, 0, 153, 0.15)');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('stroke-dasharray', '4, 4');
            svg.appendChild(line);
        });
    }
    
    // Draw lines on load
    drawQualityEngineConnectingLines();
    
    // Redraw on resize (with debounce)
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            drawQualityEngineConnectingLines();
        }, 150);
    }, { passive: true });
});

// ============================================
// FAQ HELP CENTER PAGE (faq.html)
// Runs only when body has class faq-page
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    if (!document.body.classList.contains('faq-page')) return;

    var searchInput = document.getElementById('faq-search');
    var searchBtn = document.querySelector('.faq-search-btn');
    var faqItems = document.querySelectorAll('.faq-accordion-content .faq-item');
    var faqSections = document.querySelectorAll('.faq-accordion-section');
    var sidebarLinks = document.querySelectorAll('.faq-sidebar-link');
    var mobileSelect = document.getElementById('faq-mobile-select');
    var noResults = document.getElementById('faq-no-results');
    var popularCards = document.querySelectorAll('.faq-popular-card');
    var feedbackBtns = document.querySelectorAll('.faq-accordion-content .faq-feedback-btn');

    function doSearch(query) {
        var q = (query || '').trim().toLowerCase();
        var visibleCount = 0;
        faqItems.forEach(function(item) {
            var questionEl = item.querySelector('.faq-item-question');
            var answerEl = item.querySelector('.faq-item-content p');
            var question = questionEl ? questionEl.textContent.toLowerCase() : '';
            var answer = answerEl ? answerEl.textContent.toLowerCase() : '';
            var category = (item.dataset.category || '').toLowerCase();
            var match = !q || question.indexOf(q) !== -1 || answer.indexOf(q) !== -1 || category.indexOf(q) !== -1;
            item.classList.toggle('hidden-by-search', !match);
            if (match) visibleCount++;
        });
        faqSections.forEach(function(section) {
            var hasVisible = section.querySelectorAll('.faq-item:not(.hidden-by-search)').length > 0;
            section.style.display = hasVisible ? '' : 'none';
        });
        if (noResults) noResults.classList.toggle('visible', q && visibleCount === 0);
    }

    if (searchInput) {
        searchInput.addEventListener('input', function() { doSearch(this.value); });
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                doSearch(this.value);
            }
        });
    }
    if (searchBtn) searchBtn.addEventListener('click', function() { doSearch(searchInput ? searchInput.value : ''); });

    document.querySelectorAll('.faq-tag').forEach(function(tag) {
        tag.addEventListener('click', function() {
            var term = this.dataset.search || '';
            if (searchInput) {
                searchInput.value = term;
                searchInput.focus();
            }
            doSearch(term);
            var mainSection = document.querySelector('.faq-main');
            if (mainSection) mainSection.scrollIntoView({ behavior: 'smooth' });
        });
    });

    var faqFadeObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

    faqItems.forEach(function(item) {
        faqFadeObserver.observe(item);
        var btn = item.querySelector('.faq-item-header');
        var body = item.querySelector('.faq-item-body');
        if (!btn || !body) return;
        btn.addEventListener('click', function() {
            var isOpen = item.classList.contains('is-open');
            faqItems.forEach(function(i) {
                i.classList.remove('is-open');
                var h = i.querySelector('.faq-item-header');
                var b = i.querySelector('.faq-item-body');
                if (h) h.setAttribute('aria-expanded', 'false');
                if (b) b.style.maxHeight = '';
            });
            if (!isOpen) {
                item.classList.add('is-open');
                btn.setAttribute('aria-expanded', 'true');
                body.style.maxHeight = body.scrollHeight + 'px';
            }
        });
    });

    function setActiveSection(id) {
        sidebarLinks.forEach(function(link) {
            var href = link.getAttribute('href');
            link.classList.toggle('active', href === '#' + id);
        });
        if (mobileSelect) mobileSelect.value = id;
    }

    var sections = Array.prototype.slice.call(faqSections);
    var faqSectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
    }, { rootMargin: '-120px 0px -60% 0px', threshold: 0 });

    sections.forEach(function(s) { faqSectionObserver.observe(s); });

    sidebarLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var id = this.getAttribute('href').slice(1);
            var target = document.getElementById(id);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    if (mobileSelect) {
        mobileSelect.addEventListener('change', function() {
            var id = this.value;
            var target = document.getElementById(id);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    popularCards.forEach(function(card) {
        card.addEventListener('click', function() {
            var id = this.dataset.scrollTo;
            var target = document.getElementById(id);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                var btn = target.querySelector('.faq-item-header');
                if (btn) setTimeout(function() { btn.click(); }, 500);
            }
        });
    });

    feedbackBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var block = this.closest('.faq-item-feedback');
            if (!block) return;
            var thanks = block.querySelector('.faq-feedback-thanks');
            var btns = block.querySelectorAll('.faq-feedback-btn');
            if (thanks) thanks.classList.add('visible');
            btns.forEach(function(b) { b.disabled = true; });
            setTimeout(function() {
                if (thanks) thanks.classList.remove('visible');
                btns.forEach(function(b) { b.disabled = false; });
            }, 3000);
        });
    });

    var ctaBox = document.querySelector('.faq-cta-box');
    if (ctaBox && 'IntersectionObserver' in window) {
        var ctaObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) ctaBox.classList.add('visible');
            });
        }, { threshold: 0.2 });
        ctaObserver.observe(ctaBox);
    }
});


// ============================================= //
// FAQ Accordion - Premium Version (runs on all pages that have .faq-question-premium)
// ============================================= //
document.querySelectorAll('.faq-question-premium').forEach(button => {
    button.addEventListener('click', () => {
        const item = button.parentElement;
        const isActive = item.classList.contains('active');

        // Close all items
        document.querySelectorAll('.faq-item-premium').forEach(faq => {
            faq.classList.remove('active');
        });

        // Open clicked item if it wasn't active
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// ============================================= //
// Affiliate Page Scripts                        //
// ============================================= //

// Only run on affiliate page
if (document.body.classList.contains('affiliate-page')) {

        // Sticky CTA on scroll
        const stickyCta = document.getElementById('stickyCta');
        const hero = document.getElementById('hero');

        window.addEventListener('scroll', () => {
            const heroBottom = hero.offsetTop + hero.offsetHeight;

            if (window.scrollY > heroBottom) {
                stickyCta.classList.add('visible');
            } else {
                stickyCta.classList.remove('visible');
            }
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Counter Animation Function
        function animateCounter(element, target, duration = 2000) {
            let start = 0;
            const increment = target / (duration / 16);
            const counter = element.querySelector('.counter');
            
            if (!counter) return;
            
            function updateCounter() {
                start += increment;
                if (start < target) {
                    counter.textContent = Math.floor(start);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            }
            
            updateCounter();
        }

        // Commission Cards Observer with Counter Animation
        const commissionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    const delay = parseInt(card.dataset.delay) || 0;
                    
                    setTimeout(() => {
                        card.classList.add('visible');
                        
                        // Animate counter if present
                        const numberEl = card.querySelector('.commission-number[data-target]');
                        if (numberEl) {
                            const target = parseInt(numberEl.dataset.target);
                            animateCounter(numberEl, target, 1500);
                        }
                    }, delay);
                    
                    commissionObserver.unobserve(card);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.commission-card').forEach(card => {
            commissionObserver.observe(card);
        });

        // Step Cards Observer with Staggered Animation
        const stepObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    const delay = parseInt(card.dataset.delay) || 0;
                    
                    setTimeout(() => {
                        card.classList.add('visible');
                    }, delay);
                    
                    stepObserver.unobserve(card);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.step-card').forEach(card => {
            stepObserver.observe(card);
        });

        // Audience Cards Observer with Staggered Animation
        const audienceObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    const delay = parseInt(card.dataset.delay) || 0;
                    
                    setTimeout(() => {
                        card.classList.add('visible');
                    }, delay);
                    
                    audienceObserver.unobserve(card);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -30px 0px'
        });

        document.querySelectorAll('.audience-card').forEach(card => {
            audienceObserver.observe(card);
        });

        // Benefits Cards Observer with Staggered Animation
        const benefitsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    const delay = parseInt(card.dataset.delay) || 0;
                    
                    setTimeout(() => {
                        card.classList.add('visible');
                    }, delay);
                    
                    benefitsObserver.unobserve(card);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -30px 0px'
        });

        document.querySelectorAll('.benefit-featured, .benefit-card').forEach(card => {
            benefitsObserver.observe(card);
        });

        // Dashboard section animations
        const dashboardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                        
                        // Animate counters inside dashboard badges
                        const counters = entry.target.querySelectorAll('.counter');
                        counters.forEach(counter => {
                            if (!counter.classList.contains('animated')) {
                                counter.classList.add('animated');
                                animateCounter(counter);
                            }
                        });
                    }, parseInt(delay));
                    dashboardObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -30px 0px'
        });

        document.querySelectorAll('.dashboard-feature, .dashboard-badge').forEach(el => {
            dashboardObserver.observe(el);
        });

        // Resources section animations
        const resourcesObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, parseInt(delay));
                    resourcesObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -30px 0px'
        });

        document.querySelectorAll('.resource-card-premium').forEach(card => {
            resourcesObserver.observe(card);
        });

        // Payments section animations
        const paymentsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, parseInt(delay));
                    paymentsObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -30px 0px'
        });

        document.querySelectorAll('.payment-feature-card').forEach(card => {
            paymentsObserver.observe(card);
        });

        // Testimonials section animations
        const testimonialsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, parseInt(delay));
                    testimonialsObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -30px 0px'
        });

        document.querySelectorAll('.testimonial-card-premium').forEach(card => {
            testimonialsObserver.observe(card);
        });

        // General elements animation on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.audience-item, .benefit-card, .resource-card, .testimonial-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(el);
        });

    // Header scroll effect for affiliate page
    const affiliateHeader = document.querySelector('.header');
    if (affiliateHeader) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                affiliateHeader.classList.add('scrolled');
            } else {
                affiliateHeader.classList.remove('scrolled');
            }
        });
    }
} // End of affiliate page scripts

// Demo page interactions (merged from demo.js)
document.addEventListener('DOMContentLoaded', function () {
  // Scroll reveal for demo cards
  var revealEls = document.querySelectorAll('.demo-reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add('demo-reveal-visible');
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) {
      revealObs.observe(el);
    });
  } else if (revealEls.length) {
    revealEls.forEach(function (el) {
      el.classList.add('demo-reveal-visible');
    });
  }

  // Time slot selection
  var timeSlots = document.querySelectorAll('.demo-time-slot');
  timeSlots.forEach(function (btn) {
    btn.addEventListener('click', function () {
      timeSlots.forEach(function (b) { b.classList.remove('demo-time-selected'); });
      btn.classList.add('demo-time-selected');
    });
  });

  const items = document.querySelectorAll('.demo-faq-item[data-faq]');

  items.forEach(function (item) {
    const btn = item.querySelector('.demo-faq-question');
    const answer = item.querySelector('.demo-faq-answer');

    if (!btn || !answer) return;

    btn.addEventListener('click', function () {
      const isOpen = item.hasAttribute('data-open');

      // Close all others
      items.forEach(function (other) {
        other.removeAttribute('data-open');
        const otherBtn = other.querySelector('.demo-faq-question');
        const otherAnswer = other.querySelector('.demo-faq-answer');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        if (otherAnswer) otherAnswer.style.maxHeight = null;
      });

      if (!isOpen) {
        item.setAttribute('data-open', '');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
});

// Careers page interactions (merged from careers.js)
document.addEventListener('DOMContentLoaded', function () {
  // Scroll reveal
  var revealEls = document.querySelectorAll('.careers-hero-reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else if (revealEls.length) {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // Job filters
  var filterContainer = document.querySelector('[data-careers-filters]');
  var jobList = document.querySelector('[data-careers-jobs]');

  if (filterContainer && jobList) {
    var filterButtons = Array.prototype.slice.call(
      filterContainer.querySelectorAll('.careers-jobs-filter')
    );
    var jobCards = Array.prototype.slice.call(
      jobList.querySelectorAll('.careers-job-card')
    );

    filterContainer.addEventListener('click', function (event) {
      var target = event.target;
      if (!target || !target.matches('.careers-jobs-filter')) return;

      var filter = target.getAttribute('data-filter') || 'all';

      filterButtons.forEach(function (btn) {
        btn.classList.toggle('is-active', btn === target);
      });

      jobCards.forEach(function (card) {
        var dept = card.getAttribute('data-dept') || '';
        var shouldShow = filter === 'all' || dept === filter;
        card.style.display = shouldShow ? '' : 'none';
      });
    });
  }

  // Testimonials slider
  var slider = document.querySelector('[data-careers-slider]');
  if (slider) {
    var track = slider.querySelector('[data-careers-track]');
    var slides = track ? Array.prototype.slice.call(track.querySelectorAll('.careers-testimonial')) : [];
    var prevBtn = slider.querySelector('[data-careers-prev]');
    var nextBtn = slider.querySelector('[data-careers-next]');
    var current = 0;
    var autoplayId = null;

    var updateSlider = function (index) {
      if (!track || !slides.length) return;
      current = (index + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + current * 100 + '%)';

      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
    };

    var startAutoplay = function () {
      if (!slides.length) return;
      if (autoplayId) window.clearInterval(autoplayId);
      autoplayId = window.setInterval(function () {
        updateSlider(current + 1);
      }, 6500);
    };

    var stopAutoplay = function () {
      if (autoplayId) {
        window.clearInterval(autoplayId);
        autoplayId = null;
      }
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        updateSlider(current - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        updateSlider(current + 1);
      });
    }

    slider.addEventListener('mouseenter', function () {
      stopAutoplay();
    });

    slider.addEventListener('mouseleave', function () {
      startAutoplay();
    });

    // Initial state
    updateSlider(0);
    startAutoplay();
  }
});

// Enterprise page interactions (merged from enterprise.js)
document.addEventListener('DOMContentLoaded', function () {
  // Multisite brand tabs
  var tabs = document.querySelectorAll('.ent-multisite-tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
    });
  });

  var revealEls = document.querySelectorAll('.ent-reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('ent-reveal-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else if (revealEls.length) {
    revealEls.forEach(function (el) {
      el.classList.add('ent-reveal-visible');
    });
  }
});

// Features page interactions (merged from features.js)
document.addEventListener('DOMContentLoaded', function () {
  // Scroll reveal for feature cards
  var revealEls = document.querySelectorAll('.feat-reveal');
  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('feat-reveal-visible');
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );
      revealEls.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      revealEls.forEach(function (el) {
        el.classList.add('feat-reveal-visible');
      });
    }
  }

  const slides = document.querySelectorAll('.feat-tour-slide');
  const dots = document.querySelectorAll('.feat-tour-dot');

  if (!slides.length || !dots.length) return;

  function goToSlide(index) {
    index = Math.max(0, Math.min(index, slides.length - 1));

    slides.forEach(function (s, i) {
      s.classList.toggle('active', i === index);
    });

    dots.forEach(function (d, i) {
      d.classList.toggle('active', i === index);
      d.setAttribute('aria-label', 'Slide ' + (i + 1));
      d.setAttribute('aria-current', i === index ? 'true' : 'false');
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      goToSlide(i);
    });
  });
});

// Use-cases page interactions (merged from use-cases.js)
(function() {
  'use strict';

  var sections = ['ecommerce', 'agencies', 'startups', 'enterprise', 'creators', 'local'];
  var pills = document.querySelectorAll('.uc-pill');
  var sidebarLinks = document.querySelectorAll('.uc-sidebar-link');
  var headerHeight = 72;

  function scrollToSection(id) {
    var el = document.getElementById(id);
    if (el) {
      var top = el.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  }

  function setActivePill(hash) {
    pills.forEach(function(p) {
      var href = (p.getAttribute('href') || '').replace('#', '');
      p.classList.toggle('uc-pill-active', href === hash);
    });
  }

  function setActiveSidebar(hash) {
    sidebarLinks.forEach(function(link) {
      var href = (link.getAttribute('href') || '').replace('#', '');
      link.classList.toggle('uc-sidebar-active', href === hash);
    });
  }

  function updateActiveFromScroll() {
    var scrollY = window.pageYOffset + headerHeight + 120;
    var active = sections[0];
    sections.forEach(function(id) {
      var el = document.getElementById(id);
      if (el && el.offsetTop <= scrollY) {
        active = id;
      }
    });
    setActivePill(active);
    setActiveSidebar(active);
  }

  if (pills.length) {
    pills.forEach(function(p) {
      p.addEventListener('click', function(e) {
        e.preventDefault();
        var id = (p.getAttribute('href') || '').replace('#', '');
        scrollToSection(id);
        setActivePill(id);
        setActiveSidebar(id);
      });
    });
  }

  if (sidebarLinks.length) {
    sidebarLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var id = (link.getAttribute('href') || '').replace('#', '');
        scrollToSection(id);
        setActiveSidebar(id);
        setActivePill(id);
      });
    });
  }

  var ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(function() {
        updateActiveFromScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  var hash = (window.location.hash || '').replace('#', '');
  if (hash && sections.indexOf(hash) >= 0) {
    setActivePill(hash);
    setActiveSidebar(hash);
  } else {
    updateActiveFromScroll();
  }
})();

// Mouse-follow glow effect for Startups section (from use-cases.js)
(function() {
  'use strict';
  var section = document.getElementById('startups');
  var glow = document.getElementById('uc-startup-mouse-glow');
  if (!section || !glow) return;

  var ticking = false;
  var targetX = 0;
  var targetY = 0;

  function updateGlowPosition() {
    var rect = section.getBoundingClientRect();
    glow.style.left = targetX - rect.left + 'px';
    glow.style.top = targetY - rect.top + 'px';
    ticking = false;
  }

  section.addEventListener('mouseenter', function() {
    glow.classList.add('is-active');
  });

  section.addEventListener('mouseleave', function() {
    glow.classList.remove('is-active');
  });

  section.addEventListener('mousemove', function(e) {
    var rect = section.getBoundingClientRect();
    targetX = e.clientX - rect.left;
    targetY = e.clientY - rect.top;
    if (!ticking) {
      requestAnimationFrame(updateGlowPosition);
      ticking = true;
    }
  });
})();

// Use-cases enterprise / creators fades (from use-cases.js)
(function() {
  'use strict';
  var section = document.getElementById('enterprise');
  if (!section) return;

  var animEls = section.querySelectorAll('.uc-enterprise-anim');
  if (!animEls.length) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { rootMargin: '0px 0px -80px 0px', threshold: 0.1 });

  animEls.forEach(function(el) {
    observer.observe(el);
  });
})();

(function() {
  'use strict';
  var section = document.getElementById('creators');
  if (!section) return;

  var animEls = section.querySelectorAll('.uc-creators-anim');
  if (!animEls.length) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { rootMargin: '0px 0px -80px 0px', threshold: 0.1 });

  animEls.forEach(function(el) {
    observer.observe(el);
  });
})();

// Codiic landing hero - subtle parallax on dashboard
(function() {
  'use strict';
  var visual = document.getElementById('hero-mockup-parallax');
  if (!visual) return;

  var strength = 10;

  visual.addEventListener('mousemove', function(e) {
    var rect = visual.getBoundingClientRect();
    var x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    var y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    visual.style.transform = 'translate3d(' + (x * strength) + 'px,' + (y * strength) + 'px,0)';
  });

  visual.addEventListener('mouseleave', function() {
    visual.style.transform = '';
  });
})();

// Testimonials infinite scroll: duplicate cards in track for seamless loop
(function() {
  'use strict';
  var tracks = document.querySelectorAll('.testimonials-saas-section .testimonial-track');
  tracks.forEach(function(track) {
    var cards = track.querySelectorAll('.testimonial-saas-card');
    if (!cards.length) return;
    cards.forEach(function(card) {
      var clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  });
})();

// Hero product carousel - 3-card perspective, auto-advance every 3s
(function() {
  'use strict';
  var stage = document.querySelector('.hero-carousel__stage');
  if (!stage) return;

  var cards = stage.querySelectorAll('.hero-carousel__card');
  if (!cards.length) return;

  var total = cards.length;
  var activeIndex = 0;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateCarousel() {
    var prevIndex = (activeIndex - 1 + total) % total;
    var nextIndex = (activeIndex + 1) % total;

    cards.forEach(function(card, i) {
      card.classList.remove('hero-carousel__card--left', 'hero-carousel__card--center', 'hero-carousel__card--right', 'hero-carousel__card--hidden');
      if (i === prevIndex) {
        card.classList.add('hero-carousel__card--left');
      } else if (i === activeIndex) {
        card.classList.add('hero-carousel__card--center');
      } else if (i === nextIndex) {
        card.classList.add('hero-carousel__card--right');
      } else {
        card.classList.add('hero-carousel__card--hidden');
      }
    });
  }

  updateCarousel();

  if (!reduceMotion) {
    setInterval(function() {
      activeIndex = (activeIndex + 1) % total;
      updateCarousel();
    }, 3000);
  }
})();

// ------------------------------------------------------------
// Font Awesome conversion (replace Lucide placeholders)
// ------------------------------------------------------------
// Many pages use: <i data-lucide="...">...</i>
// If Lucide doesn't render fast enough, it can leave empty icon boxes.
// This converts all remaining lucide placeholders to Font Awesome icons.
(function () {
  'use strict';

  var FA_CSS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';

  function ensureFontAwesomeLoaded() {
    // Don't load multiple times.
    if (document.querySelector('link[data-fontawesome="true"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FA_CSS_URL;
    link.setAttribute('data-fontawesome', 'true');
    document.head.appendChild(link);
  }

  // Minimal mapping for icons used across the Codiic HTML templates.
  var lucideToFa = {
    menu: 'fa-solid fa-bars',
    'chevron-right': 'fa-solid fa-chevron-right',
    'chevrons-down': 'fa-solid fa-chevron-down',
    play: 'fa-solid fa-play',
    'shopping-bag': 'fa-solid fa-bag-shopping',
    'shopping-cart': 'fa-solid fa-cart-shopping',
    'credit-card': 'fa-solid fa-credit-card',
    check: 'fa-solid fa-check',
    'shield-check': 'fa-solid fa-shield-halved',
    shield: 'fa-solid fa-shield',
    'shield-x': 'fa-solid fa-shield-xmark',
    lock: 'fa-solid fa-lock',
    key: 'fa-solid fa-key',
    globe: 'fa-solid fa-globe',
    users: 'fa-solid fa-users',
    user: 'fa-solid fa-user',
    layers: 'fa-solid fa-layer-group',
    store: 'fa-solid fa-store',
    plug: 'fa-solid fa-plug',
    code: 'fa-solid fa-code',
    'code-2': 'fa-solid fa-code',
    workflow: 'fa-solid fa-diagram-project',
    target: 'fa-solid fa-bullseye',
    repeat: 'fa-solid fa-arrows-rotate',
    search: 'fa-solid fa-magnifying-glass',
    calendar: 'fa-solid fa-calendar-days',
    clock: 'fa-solid fa-clock',
    smartphone: 'fa-solid fa-mobile-screen',
    zap: 'fa-solid fa-bolt',
    bot: 'fa-solid fa-robot',
    'bar-chart-3': 'fa-solid fa-chart-column',
    'line-chart': 'fa-solid fa-chart-line',
    'trending-up': 'fa-solid fa-chart-line',
    sliders: 'fa-solid fa-sliders',
    'building-2': 'fa-solid fa-building',
    package: 'fa-solid fa-box',
    cloud: 'fa-solid fa-cloud',
    sparkles: 'fa-solid fa-wand-magic-sparkles',
    rocket: 'fa-solid fa-rocket',
    database: 'fa-solid fa-database',
    brain: 'fa-solid fa-brain',
    info: 'fa-solid fa-circle-info',
    mail: 'fa-solid fa-envelope',
    'map-pin': 'fa-solid fa-location-dot',
    'message-square': 'fa-solid fa-message',
    'file-text': 'fa-solid fa-file-lines',
    'message-square': 'fa-solid fa-message',
    repeat: 'fa-solid fa-arrows-rotate',
    plus: 'fa-solid fa-plus',
    'x-circle': 'fa-solid fa-xmark-circle',
    'life-buoy': 'fa-solid fa-life-ring',
    eye: 'fa-solid fa-eye',
    file: 'fa-solid fa-file',
    wrench: 'fa-solid fa-wrench',
    palette: 'fa-solid fa-palette',
    'shopping-cart': 'fa-solid fa-cart-shopping',
    'dollar-sign': 'fa-solid fa-dollar-sign',
    'circle-dollar-sign': 'fa-solid fa-circle-dollar-sign',
    handshake: 'fa-solid fa-handshake',
    phone: 'fa-solid fa-phone',
    video: 'fa-solid fa-video',
    'monitor-play': 'fa-solid fa-desktop',
    send: 'fa-solid fa-paper-plane',
    'arrow-right': 'fa-solid fa-arrow-right',
    'arrow-up-right': 'fa-solid fa-arrow-up-right-from-square',
    'arrow-up-right': 'fa-solid fa-arrow-up-right-from-square',
    'arrow-up-right': 'fa-solid fa-arrow-up-right-from-square',
    'arrow-up-right': 'fa-solid fa-arrow-up-right-from-square',
    'arrow-up-right': 'fa-solid fa-arrow-up-right-from-square',
    // Brand icons
    instagram: 'fa-brands fa-instagram',
    twitter: 'fa-brands fa-x-twitter',
    linkedin: 'fa-brands fa-linkedin',
    facebook: 'fa-brands fa-facebook-f',
    youtube: 'fa-brands fa-youtube',

    // Extra Lucide icons seen in templates
    'check-circle': 'fa-solid fa-circle-check',
    'shield-check-circle': 'fa-solid fa-shield-halved',
    repeat2: 'fa-solid fa-arrows-rotate',
    'target': 'fa-solid fa-bullseye',
    'clock': 'fa-solid fa-clock',
    'rocket': 'fa-solid fa-rocket',

    // Pricing / misc
    'badge-check': 'fa-solid fa-badge-check',
    'clipboard-list': 'fa-solid fa-clipboard-list',
    'layout-grid': 'fa-solid fa-grip',
    'layout-dashboard': 'fa-solid fa-gauge-high',
    'cloud': 'fa-solid fa-cloud',
    line: 'fa-solid fa-minus',
    'book-open': 'fa-solid fa-book-open',
    'headphones': 'fa-solid fa-headphones',
    'smartphone': 'fa-solid fa-mobile-screen',
    'sparkles': 'fa-solid fa-wand-magic-sparkles',
    'search': 'fa-solid fa-magnifying-glass',
    'message-square': 'fa-solid fa-message',
    'message-square-plus': 'fa-solid fa-message',
    'file-text': 'fa-solid fa-file-lines',
    'monitor-play': 'fa-solid fa-desktop',
    'video': 'fa-solid fa-video',
    'handshake': 'fa-solid fa-handshake',
    'life-buoy': 'fa-solid fa-life-ring',
    'smartphone': 'fa-solid fa-mobile-screen',
    'shopping-cart': 'fa-solid fa-cart-shopping',
    'shopping-bag': 'fa-solid fa-bag-shopping',

    // Fallbacks for less-known lucide names used in templates
    'shield-check': 'fa-solid fa-shield-halved',
    'shield-x': 'fa-solid fa-shield-xmark',
  };

  function convertLucideIcons() {
    var nodes = document.querySelectorAll('i[data-lucide]');
    nodes.forEach(function (el) {
      var lucideName = (el.getAttribute('data-lucide') || '').trim();
      var faClasses = lucideToFa[lucideName];

      if (!faClasses) {
        // Generic fallback to avoid empty boxes.
        faClasses = 'fa-solid fa-circle-dot';
      }

      // Keep existing layout classes like: icon, icon-md, icon-lg, icon-success, etc.
      // Replace Lucide-only data attribute and inject font-awesome classes.
      el.removeAttribute('data-lucide');
      el.setAttribute('aria-hidden', 'true');

      var currentClasses = Array.prototype.slice.call(el.classList);
      currentClasses.forEach(function (c) {
        // Avoid keeping any existing lucide-related marker (rare) or old fontawesome.
        if (c === 'lucide') return;
        if (c.indexOf('fa-') === 0) el.classList.remove(c);
        if (c === 'fa') el.classList.remove(c);
      });

      faClasses.split(' ').forEach(function (c) {
        if (c) el.classList.add(c);
      });

      // If some templates override icon size via inline width/height styles,
      // Font Awesome needs a matching font-size to keep the glyph centered.
      // (Lucide used SVG width/height; Font Awesome is font-based.)
      try {
        var rect = el.getBoundingClientRect();
        if (rect && rect.height > 0 && isFinite(rect.height)) {
          el.style.fontSize = rect.height + 'px';
        }
      } catch (e) {
        // ignore
      }
    });
  }

  ensureFontAwesomeLoaded();
  // Run immediately; inline Lucide createIcons scripts run after `script.js` in templates.
  convertLucideIcons();
})();
