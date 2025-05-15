'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });



// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {

  testimonialsItem[i].addEventListener("click", function () {

    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

    testimonialsModalFunc();

  });

}

// add click event to modal close button
modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);


// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}


// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}

// Enhanced Certificate Carousel Functionality
function initCarousel() {
  const carousels = document.querySelectorAll('.certificate-carousel');
  if (!carousels) return;
  carousels.forEach(carousel => {
    setupCarousel(carousel);
  });
  function setupCarousel(carousel) {

    const slides = carousel.querySelectorAll('.carousel-slide');
    const dots = carousel.querySelectorAll('.dot');
    const prevBtn = carousel.querySelector('.prev-btn');
    const nextBtn = carousel.querySelector('.next-btn');

    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoplayTimer;
    let isHovering = false;

    function updateCarousel() {
      // Remove active class from all slides and dots
      slides.forEach(slide => slide.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));

      // Add active class to current slide and dot
      slides[currentIndex].classList.add('active');
      dots[currentIndex].classList.add('active');
    }

    function goToSlide(index) {
      currentIndex = (index + totalSlides) % totalSlides;
      updateCarousel();
    }

    function startAutoplay() {
      stopAutoplay(); // Clear any existing timer
      if (!isHovering) {
        autoplayTimer = setInterval(() => {
          goToSlide(currentIndex + 1);
        }, 5000);
      }
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
      }
    }

    // Event Listeners
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        goToSlide(currentIndex - 1);
        stopAutoplay();
        startAutoplay(); // Reset timer after manual navigation
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        goToSlide(currentIndex + 1);
        stopAutoplay();
        startAutoplay(); // Reset timer after manual navigation
      });
    }

    // Add click event to dots
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        goToSlide(index);
        stopAutoplay();
        startAutoplay(); // Reset timer after manual navigation
      });
    });

    // Pause autoplay on hover
    carousel.addEventListener('mouseenter', () => {
      isHovering = true;
      stopAutoplay();
    });

    carousel.addEventListener('mouseleave', () => {
      isHovering = false;
      startAutoplay();
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      if (touchEndX < touchStartX - 50) {
        // Swipe left, go to next slide
        goToSlide(currentIndex + 1);
      } else if (touchEndX > touchStartX + 50) {
        // Swipe right, go to previous slide
        goToSlide(currentIndex - 1);
      }
      stopAutoplay();
      startAutoplay();
    }

    // Initialize carousel
    updateCarousel();
    startAutoplay();
  }
}

// Initialize carousel when DOM is loaded or when page content changes
document.addEventListener('DOMContentLoaded', function () {
  // Initialize certificate carousel
  initCarousel();
});