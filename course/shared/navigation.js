// Initialize section index and paths
let currentSectionIndex = 0;
const sections = [
    'sections/section1.html',
    'sections/section2.html',
    'sections/section3.html',
    'sections/section4.html',
    'sections/section5.html'
];

// Load section content
async function loadSection(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const content = doc.querySelector('.section');
        
        if (content) {
            document.getElementById('content-container').innerHTML = content.innerHTML;
            currentSectionIndex = sections.indexOf(url);
            updateUI();
        }
    } catch (error) {
        console.error('Error loading section:', error);
    }
}

// Navigation functions
function nextSection() {
    if (currentSectionIndex < sections.length - 1) {
        currentSectionIndex++;
        loadSection(sections[currentSectionIndex]);
    }
}

function previousSection() {
    if (currentSectionIndex > 0) {
        currentSectionIndex--;
        loadSection(sections[currentSectionIndex]);
    }
}

// UI update functions
function updateUI() {
    updateProgress();
    updateNavigationButtons();
    updateTimelineDots();
    window.scrollTo(0, 0);
}

function updateProgress() {
    const progress = ((currentSectionIndex + 1) / sections.length) * 100;
    const progressBar = document.querySelector('.progress');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
}

function updateNavigationButtons() {
    const prevButton = document.querySelector('.timeline-nav .nav-button.prev');
    const nextButton = document.querySelector('.timeline-nav .nav-button.next');
    
    if (prevButton) {
        prevButton.disabled = currentSectionIndex === 0;
    }
    if (nextButton) {
        nextButton.disabled = currentSectionIndex === sections.length - 1;
    }
}

function updateTimelineDots() {
    const dots = document.querySelectorAll('.timeline-dot');
    dots.forEach((dot, index) => {
        if (index === currentSectionIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadSection(sections[0]);
    if (typeof initializeSCORM === 'function') {
        initializeSCORM();
    }
});

// Handle page unload
window.addEventListener('beforeunload', function() {
    if (typeof terminateSCORM === 'function') {
        terminateSCORM();
    }
});

// Debounce function
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

// Check scroll function
function checkScroll() {
    const nextButton = document.querySelector('.nav-button.next');
    if (!nextButton || currentSectionIndex === sections.length - 1) return;

    const scrollPosition = window.innerHeight + window.pageYOffset;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollThreshold = 100;

    nextButton.disabled = documentHeight - scrollPosition >= scrollThreshold;
}

// Add event listener for scroll and resize
window.addEventListener('scroll', debounce(checkScroll, 50));
window.addEventListener('resize', debounce(checkScroll, 50));
