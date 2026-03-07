// script.js

// IIFE for scope isolation
(function () {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page-content');
    const modal = document.getElementById('application-modal');
    const displayPosition = document.getElementById('display-position');
    const positionInput = document.getElementById('position-applied');
    const careerForm = document.getElementById('career-form');

    // --- Mobile Menu Toggle ---
    mobileMenuButton.addEventListener('click', () => {
        const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true' || false;
        mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
        mobileMenu.classList.toggle('hidden', isExpanded);
    });

    // --- Modal Functions ---
    window.openApplicationModal = function (position) {
        // Set the position in the visible text and the hidden input
        displayPosition.textContent = position;
        positionInput.value = position;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    window.closeApplicationModal = function () {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        careerForm.reset(); // Clear the form on close
    }

    // --- Form Submission Handler (WhatsApp Logic) ---
    window.handleApplicationSubmit = function (event) {
        event.preventDefault();

        // 1. Get form data
        const name = document.getElementById('applicant-name').value;
        const email = document.getElementById('applicant-email').value;
        const phone = document.getElementById('applicant-phone').value;
        const position = document.getElementById('position-applied').value;
        const message = document.getElementById('applicant-message').value;

        // Note: Resume file path is irrelevant for WhatsApp text content
        const resumeInput = document.getElementById('applicant-resume');
        const resumeFile = resumeInput.files[0];

        // WhatsApp target number from the original JS: '7496846755'
        const contactNumber = '7496846755';

        // 2. Build the structured message text (URL encoded)
        // Using URL-friendly line breaks (%0A) and bold markers (*)
        const applicationDetails = `*KSSPL Career Application*\n%0A%0A` +
            `*Position:* ${position}%0A` +
            `*Applicant:* ${name}%0A` +
            `*Email:* ${email}%0A` +
            `*Phone:* ${phone}%0A%0A` +
            `*Message:* ${message || 'N/A'}%0A%0A` +
            `*IMPORTANT:* Please attach your resume file now.`;

        const encodedMessage = encodeURIComponent(applicationDetails);

        // 3. Construct the WhatsApp URL
        const whatsappUrl = `https://wa.me/${contactNumber}?text=${encodedMessage}`;

        // 4. Confirmation (Custom Dialog)
        const confirmationDialog = document.createElement('div');
        confirmationDialog.innerHTML = `
            <div class="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-[200]">
                <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center">
                    <h4 class="text-xl font-bold text-green-600 mb-3">Application Process Step 2/2</h4>
                    <p class="text-gray-700 mb-4">You will now be redirected to WhatsApp to send the message.</p>
                    <p class="text-red-600 font-semibold mb-6">*** IMPORTANT ***</p>
                    <p class="text-sm text-gray-700 mb-6">Once WhatsApp opens, you **MUST manually attach your PDF resume** (the file you selected: <strong>${resumeFile ? resumeFile.name : 'None Selected'}</strong>) and then click 'Send'.</p>
                    <button id="proceed-btn" class="w-full py-2 px-4 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition duration-150">
                        Proceed to WhatsApp
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(confirmationDialog);

        document.getElementById('proceed-btn').addEventListener('click', () => {
            // Open WhatsApp link
            window.open(whatsappUrl, '_blank');
            // Clean up and close modal
            document.body.removeChild(confirmationDialog);
            closeApplicationModal();
        });
    }

    // --- Contact Form Submission Handler ---
    window.handleContactSubmit = function (event) {
        event.preventDefault();

        // 1. Get form data
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        // WhatsApp target number
        const contactNumber = '7496846755';

        // 2. Build the structured message text
        const contactDetails = `*KSSPL Demo/Contact Request*\n\n` +
            `*Name:* ${name}\n` +
            `*Email:* ${email}\n` +
            `*Message:* ${message}`;

        const encodedMessage = encodeURIComponent(contactDetails);

        // 3. Construct the WhatsApp URL
        const whatsappUrl = `https://wa.me/${contactNumber}?text=${encodedMessage}`;

        // 4. Open WhatsApp link
        window.open(whatsappUrl, '_blank');

        // 5. Reset form
        document.getElementById('contact-form').reset();
    }

    // --- Routing Logic ---
    function updateRoute() {
        // Get the current hash from the URL, default to #home
        const currentHash = window.location.hash || '#home';
        const targetPageId = currentHash.replace('#', 'page-');

        // 1. Hide all pages
        pages.forEach(page => {
            page.classList.add('hidden');
        });

        // 2. Show the target page
        const targetPage = document.getElementById(targetPageId);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            // Scroll to top of the page content
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Fallback to Home page if hash is invalid
            document.getElementById('page-home').classList.remove('hidden');
            window.location.hash = '#home';
        }

        // 3. Update active navigation link styling
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentHash) {
                link.classList.add('active');
            }
        });

        // 4. Close mobile menu on route change
        mobileMenu.classList.add('hidden');
        mobileMenuButton.setAttribute('aria-expanded', 'false');
    }

    // Listen for hash changes (when user clicks a navigation link)
    window.addEventListener('hashchange', updateRoute);

    // Initial route load (when the page first loads)
    window.addEventListener('load', () => {
        // If no hash is set, set it to #home initially
        if (!window.location.hash) {
            window.location.hash = '#home';
        }
        updateRoute();
    });

    // Handle mobile link clicks to close the menu
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Wait for routing to complete before checking state
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
            }, 50);
        });
    });
    // Function to handle the counting animation for a single element
    function animateCounter(element, targetValue) {
        let startValue = 0;
        const duration = 2000; // 2000ms = 2 seconds
        const startTime = performance.now();

        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1); // Clamp progress between 0 and 1
            const currentValue = Math.floor(progress * targetValue);

            element.textContent = currentValue + '%';

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = targetValue + '%'; // Ensure final value is exactly the target
            }
        }

        requestAnimationFrame(step);
    }

    // Function to find all counters and start the animation
    function startCounters() {
        const counters = document.querySelectorAll('#page-testimonials [data-target]');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            animateCounter(counter, target);
        });
    }

    // Intersection Observer to run the animation when the section comes into view
    const testimonialsSection = document.getElementById('page-testimonials');
    let hasAnimated = false; // Flag to ensure animation runs only once

    if (testimonialsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    // When the section is visible and hasn't animated yet
                    startCounters();
                    hasAnimated = true; // Set flag to true
                    observer.unobserve(testimonialsSection); // Stop observing
                }
            });
        }, {
            threshold: 0.5 // Trigger when 50% of the element is visible
        });

        observer.observe(testimonialsSection);
    }
    //     document.addEventListener('DOMContentLoaded', function() {
    //     const mobileMenuButton = document.getElementById('mobile-menu-button');
    //     const mobileMenu = document.getElementById('mobile-menu');
    // 
    //     if (mobileMenuButton && mobileMenu) {
    //         mobileMenuButton.addEventListener('click', function() {
    //             // Get the current expanded state
    //             const isExpanded = this.getAttribute('aria-expanded') === 'true' || false;
    // 
    //             // Toggle the expanded state
    //             this.setAttribute('aria-expanded', !isExpanded);
    //             
    //             // Toggle visibility using Tailwind's 'hidden' class
    //             mobileMenu.classList.toggle('hidden');
    //         });
    //     } else {
    //         console.error('Mobile menu elements not found in the DOM.');
    //     }
    // });

})();