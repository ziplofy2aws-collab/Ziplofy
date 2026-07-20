document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('prev-slide-btn');
  const nextBtn = document.getElementById('next-slide-btn');
  
  if (slides.length === 0) return;

  let currentSlide = 0;
  const slideCount = slides.length;
  let slideInterval;
  const intervalTime = 6000; // Auto-slide every 6 seconds

  /**
   * Updates the slider active classes for slides and dot indicators
   * @param {number} index - Index of the slide to display
   */
  function updateSlider(index) {
    // Remove active class from currently active elements
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    // Calculate new current index wrapping around slideCount bounds
    currentSlide = (index + slideCount) % slideCount;
    
    // Add active class to new active elements
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }
  
  function nextSlide() {
    updateSlider(currentSlide + 1);
  }
  
  function prevSlide() {
    updateSlider(currentSlide - 1);
  }
  
  // Right arrow click event
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      nextSlide();
      resetTimer();
    });
  }
  
  // Left arrow click event
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      prevSlide();
      resetTimer();
    });
  }
  
  // Dot indicators click events
  dots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const targetIndex = parseInt(dot.getAttribute('data-slide-index'), 10);
      if (!isNaN(targetIndex)) {
        updateSlider(targetIndex);
        resetTimer();
      }
    });
  });
  
  // Start the auto-slide rotation
  function startTimer() {
    slideInterval = setInterval(nextSlide, intervalTime);
  }
  
  // Reset the timer when a manual interaction occurs
  function resetTimer() {
    clearInterval(slideInterval);
    startTimer();
  }
  
  // Pause slider on hover for better UX
  const sliderElement = document.querySelector('.hero-slider');
  if (sliderElement) {
    sliderElement.addEventListener('mouseenter', () => {
      clearInterval(slideInterval);
    });
    
    sliderElement.addEventListener('mouseleave', () => {
      startTimer();
    });
  }
  
  // Initialize
  startTimer();

  // --- BEST SELLER PRODUCT CAROUSEL CODE ---
  const track = document.getElementById('bestseller-track');
  const nextProdBtn = document.getElementById('next-prod-btn');
  const prevProdBtn = document.getElementById('prev-prod-btn');
  
  if (track && nextProdBtn && prevProdBtn) {
    const cards = track.querySelectorAll('.product-card');
    const totalCards = cards.length;
    let carouselIndex = 0;
    
    /**
     * Calculates the number of visible cards based on CSS breakpoints
     * @returns {number}
     */
    function getVisibleCardsCount() {
      const width = window.innerWidth;
      if (width > 1200) return 5;
      if (width > 992) return 4;
      return 3;
    }
    
    /**
     * Translates the carousel track based on the current index
     */
    function slideCarousel() {
      if (totalCards === 0) return;
      const visibleCount = getVisibleCardsCount();
      const maxIndex = Math.max(0, totalCards - visibleCount);
      
      // Ensure current index is within bounds
      if (carouselIndex > maxIndex) carouselIndex = maxIndex;
      if (carouselIndex < 0) carouselIndex = 0;
      
      // Read card size on-the-fly to handle fluid responsive layouts
      const cardWidth = cards[0].offsetWidth;
      const gap = 20; // Matches CSS gap
      const translateXVal = -carouselIndex * (cardWidth + gap);
      
      track.style.transform = `translateX(${translateXVal}px)`;
      
      // Update navigation button states
      prevProdBtn.style.opacity = carouselIndex === 0 ? '0.4' : '1';
      prevProdBtn.style.pointerEvents = carouselIndex === 0 ? 'none' : 'auto';
      
      nextProdBtn.style.opacity = carouselIndex === maxIndex ? '0.4' : '1';
      nextProdBtn.style.pointerEvents = carouselIndex === maxIndex ? 'none' : 'auto';
    }
    
    nextProdBtn.addEventListener('click', (e) => {
      e.preventDefault();
      carouselIndex++;
      slideCarousel();
    });
    
    prevProdBtn.addEventListener('click', (e) => {
      e.preventDefault();
      carouselIndex--;
      slideCarousel();
    });
    
    // Recalculate track position when screen sizes adjust
    window.addEventListener('resize', () => {
      slideCarousel();
    });
    
    // Initialize carousel layout states
    setTimeout(slideCarousel, 200); // Small delay to guarantee layout calculations run after rendering
  }

  // --- CELEBRITY EDIT SLIDER CODE ---
  const celebritySlides = document.querySelectorAll('.celebrity-slide');
  const celebrityDots = document.querySelectorAll('.celebrity-dot');
  const celebrityPrevBtn = document.getElementById('celebrity-prev-btn');
  const celebrityNextBtn = document.getElementById('celebrity-next-btn');

  if (celebritySlides.length > 0) {
    let activeIndex = 0;
    const totalSlides = celebritySlides.length;

    function showSlide(index) {
      // Wrap around bounds
      const targetIndex = (index + totalSlides) % totalSlides;

      // Transition slide active classes
      celebritySlides[activeIndex].classList.remove('active');
      celebritySlides[targetIndex].classList.add('active');

      // Synchronize dots across all cards
      celebrityDots.forEach(dot => {
        const dotIndex = parseInt(dot.getAttribute('data-dot'), 10);
        if (dotIndex === targetIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });

      activeIndex = targetIndex;
    }

    if (celebrityNextBtn) {
      celebrityNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showSlide(activeIndex + 1);
      });
    }

    if (celebrityPrevBtn) {
      celebrityPrevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showSlide(activeIndex - 1);
      });
    }

    // Add click events to indicators
    celebrityDots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        const targetIndex = parseInt(dot.getAttribute('data-dot'), 10);
        if (!isNaN(targetIndex)) {
          showSlide(targetIndex);
        }
      });
    });
  }

  // --- TESTIMONIAL CAROUSEL CODE ---
  const testiTrack = document.getElementById('testimonial-track');
  const testiPrev = document.getElementById('testi-prev-btn');
  const testiNext = document.getElementById('testi-next-btn');
  const testiBar = document.getElementById('testimonial-progress-bar');

  if (testiTrack && testiBar) {
    function updateTestiProgressBar() {
      const maxScroll = testiTrack.scrollWidth - testiTrack.clientWidth;
      const scrollPercentage = maxScroll > 0 ? (testiTrack.scrollLeft / maxScroll) : 0;
      const containerWidth = testiBar.parentElement.clientWidth;
      const barWidth = testiBar.clientWidth;
      const maxTranslate = containerWidth - barWidth;
      const translateX = scrollPercentage * maxTranslate;
      testiBar.style.transform = `translateX(${translateX}px)`;
    }

    testiTrack.addEventListener('scroll', updateTestiProgressBar);
    window.addEventListener('resize', updateTestiProgressBar);

    // Initial update
    setTimeout(updateTestiProgressBar, 200);

    if (testiPrev && testiNext) {
      const scrollAmount = 310; // card width (280) + gap (30)

      testiNext.addEventListener('click', (e) => {
        e.preventDefault();
        testiTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });

      testiPrev.addEventListener('click', (e) => {
        e.preventDefault();
        testiTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });
    }
  }

  // --- PROMO COLLECTION CAROUSEL DOTS (MOBILE) ---
  const promoRow = document.querySelector('.promo-row');
  const promoDots = document.querySelectorAll('.promo-dot');

  if (promoRow && promoDots.length > 0) {
    function updateActivePromoDot() {
      const scrollLeft = promoRow.scrollLeft;
      const cardWidth = promoRow.querySelector('.promo-card')?.offsetWidth || promoRow.clientWidth;
      const gap = 12; // Gap matches CSS gap
      const index = Math.round(scrollLeft / (cardWidth + gap));
      
      promoDots.forEach((dot, idx) => {
        if (idx === index) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    promoRow.addEventListener('scroll', updateActivePromoDot);
    
    // Support clicking on dots to scroll to corresponding card
    promoDots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        const index = parseInt(dot.getAttribute('data-index'), 10);
        if (!isNaN(index)) {
          const cardWidth = promoRow.querySelector('.promo-card')?.offsetWidth || promoRow.clientWidth;
          const gap = 12;
          promoRow.scrollTo({
            left: index * (cardWidth + gap),
            behavior: 'smooth'
          });
        }
      });
    });
  }
});


