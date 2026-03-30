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

    // --- Form Submission Handler (WhatsApp Logic with Google Drive Upload) ---
    // PLACEHOLDER: Paste your Google Apps Script Web App URL between the quotes below
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw-c5TA3k53ib5zdWUafJZdMpuUWtu30ADan779Xg06VHNTnnTrULE71rin2jSvj8SzBQ/exec";

    window.handleApplicationSubmit = async function (event) {
        event.preventDefault();

        const submitBtn = document.querySelector('#career-form button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;

        try {
            // 1. Get form data
            const name = document.getElementById('applicant-name').value;
            const email = document.getElementById('applicant-email').value;
            const phone = document.getElementById('applicant-phone').value;
            const position = document.getElementById('position-applied').value;
            const message = document.getElementById('applicant-message').value;

            const resumeInput = document.getElementById('applicant-resume');
            const resumeFile = resumeInput.files[0];

            if (!resumeFile) {
                alert("Please attach your PDF resume first.");
                return;
            }

            // Show loading state visually
            submitBtn.innerHTML = 'Uploading Resume... Please wait ⏳';
            submitBtn.disabled = true;

            // 2. Convert File to Base64
            const base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64String = reader.result.split(',')[1];
                    resolve(base64String);
                };
                reader.onerror = error => reject(error);
                reader.readAsDataURL(resumeFile);
            });

            // 3. Send via POST to Google Apps Script
            let driveFileUrl = "";
            let alertWarning = false;

            if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== "YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE") {
                try {
                    const response = await fetch(GOOGLE_SCRIPT_URL, {
                        method: 'POST',
                        body: JSON.stringify({
                            fileName: `${name.replace(/\s+/g, '_')}_Resume.pdf`,
                            mimeType: resumeFile.type,
                            data: base64Data
                        }),
                        headers: {
                            "Content-Type": "text/plain;charset=utf-8",
                        }
                    });

                    const responseText = await response.text();
                    try {
                        const result = JSON.parse(responseText);
                        if (result.status === "success" && result.url) {
                            driveFileUrl = result.url;
                        } else {
                            console.error("Upload response error:", result);
                            alertWarning = "Upload failed. Your details will still be sent normally.";
                        }
                    } catch (parseErr) {
                        console.error("Failed to parse response:", responseText);
                        alertWarning = "Google Script did not return JSON. Ensure it is deployed with access 'Anyone'. Proceeding normally.";
                    }
                } catch (fetchError) {
                    console.error("Fetch Error (likely CORS because of Google Script settings):", fetchError);
                    alertWarning = "Network error while uploading (did you deploy script with access 'Anyone'?). Proceeding normally sending details.";
                }
            } else {
                alertWarning = "Setup Warning: We haven't set up the Google Apps Script URL yet! Proceeding normally.";
            }

            if (alertWarning) alert(alertWarning);

            // 4. Build the structured message text for WhatsApp (auto-formats with Drive URL if successful)
            const contactNumber = '7496846755';

            let applicationDetails = `*KSSPL Career Application*\n\n` +
                `*Position:* ${position}\n` +
                `*Applicant:* ${name}\n` +
                `*Email:* ${email}\n` +
                `*Phone:* ${phone}\n\n` +
                `*Message:* ${message || 'N/A'}\n\n`;

            if (driveFileUrl) {
                applicationDetails += `*Resume Link (Google Drive):* ${driveFileUrl}`;
            } else {
                applicationDetails += `*IMPORTANT:* Please attach your resume manually (automatic backup missing).`;
            }

            const encodedMessage = encodeURIComponent(applicationDetails);
            const whatsappUrl = `https://wa.me/${contactNumber}?text=${encodedMessage}`;

            // 5. Open WhatsApp link & Close Modal
            window.open(whatsappUrl, '_blank');
            closeApplicationModal();

        } catch (error) {
            console.error(error);
            alert("An error occurred: " + error.message + "\n\nPlease check the console for more details.");
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
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
        if (pages.length === 0) return; // Prevent routing errors on non-SPA pages like services.html and testimonials.html

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
    window.addEventListener('hashchange', () => {
        if (pages.length > 0) updateRoute();
    });

    // Initial route load (when the page first loads)
    window.addEventListener('load', () => {
        if (pages.length > 0) {
            // If no hash is set, set it to #home initially
            if (!window.location.hash) {
                window.location.hash = '#home';
            }
            updateRoute();
        }
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
    // --- Dynamic Career Page ---
    const jobs = [
        {
            id: 'pos-1',
            title: 'Software Developer (Backend)',
            location: 'On-Site/Sohna,Haryana',
            experience: '1+ Years'
        },
        {
            id: 'pos-2',
            title: 'MIS Executive',
            location: 'On-Site/Sohna,Haryana',
            experience: '1+ Years'
        },
        {
            id: 'pos-3',
            title: 'Frontend Developer (Angular)',
            location: 'On-Site/Sohna,Haryana',
            experience: '1+ Years'
        }
    ];

    function renderJobs() {
        const jobsContainer = document.getElementById('job-listings');
        if (!jobsContainer) return; // Not on the page

        jobsContainer.innerHTML = ''; // Clear container

        jobs.forEach(job => {
            const jobElement = document.createElement('div');
            jobElement.className = 'p-6 bg-gray-50 rounded-xl shadow-md flex justify-between items-center flex-wrap transform transition duration-200 hover:shadow-lg hover:-translate-y-1';

            jobElement.innerHTML = `
                <div class="text-left w-full sm:w-auto mb-4 sm:mb-0">
                    <h3 class="text-2xl font-semibold text-gray-800">${job.title}</h3>
                    <p class="text-gray-600" id="${job.id}">Location: ${job.location} | Experience: ${job.experience}</p>
                </div>
                <button onclick="openApplicationModal('${job.title}')"
                    class="mt-3 sm:mt-0 text-yellow-600 border border-yellow-600 px-4 py-2 rounded-lg hover:bg-yellow-50 transition duration-150 relative overflow-hidden group">
                    <span class="relative z-10">Apply Now</span>
                    <div class="absolute inset-0 h-full w-full scale-0 rounded-lg transition-all duration-300 group-hover:scale-100 group-hover:bg-yellow-50/50"></div>
                </button>
            `;
            jobsContainer.appendChild(jobElement);
        });
    }

    // Render the jobs on script run
    renderJobs();

})();