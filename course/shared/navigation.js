// Initialize section index
let currentSectionIndex = 0;
let sections = [];

// Function to extract title from HTML content
function extractTitle(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const titleElement = doc.querySelector('h2');
    return titleElement ? titleElement.textContent : 'Untitled Section';
}

// Function to check if a file exists
function fileExists(url) {
    const xhr = new XMLHttpRequest();
    xhr.open('HEAD', url, false);
    try {
        xhr.send();
        return xhr.status !== 404;
    } catch (e) {
        console.error('Error checking file:', url, e);
        return false;
    }
}

// Function to discover sections
function discoverSections() {
    sections = [];
    let sectionIndex = 1;
    
    // Keep checking for sections until we find one that doesn't exist
    while (true) {
        const sectionPath = `sections/section${sectionIndex}.html`;
        console.log('Checking section:', sectionPath);
        if (!fileExists(sectionPath)) {
            break;
        }
        sections.push(sectionPath);
        sectionIndex++;
    }
    
    console.log('Discovered sections:', sections);
    return sections;
}

// Function to initialize navigation
async function initializeNavigation() {
    try {
        // Discover available sections first
        sections = discoverSections();
        
        if (sections.length === 0) {
            console.error('No sections found');
            return;
        }

        console.log('Initializing navigation with sections:', sections);

        // Create timeline dots
        const timelineDots = document.querySelector('.timeline-dots');
        timelineDots.innerHTML = ''; // Clear existing dots

        // Load each section to get its title and create dots
        for (let i = 0; i < sections.length; i++) {
            const response = await fetch(sections[i]);
            const html = await response.text();
            const title = extractTitle(html);

            const dot = document.createElement('button');
            dot.className = 'timeline-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('data-section', i);
            dot.onclick = () => {
                currentSectionIndex = i;
                loadSection(sections[i]);
            };

            const label = document.createElement('span');
            label.className = 'dot-label';
            label.textContent = title;

            dot.appendChild(label);
            timelineDots.appendChild(dot);
        }

        // Load first section
        if (sections.length > 0) {
            loadSection(sections[0]);
        }
    } catch (error) {
        console.error('Error initializing navigation:', error);
    }
}

// Load section content
async function loadSection(url) {
    console.log('Loading section:', url);
    try {
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Get the main content elements
        const title = doc.querySelector('h2');
        const content = doc.querySelector('.section.learning-section');
        
        if (content) {
            // Create a wrapper div for the content
            const contentWrapper = document.createElement('div');
            
            // Add the title if it exists
            if (title) {
                contentWrapper.appendChild(title.cloneNode(true));
            }
            
            // Add the main content
            contentWrapper.appendChild(content.cloneNode(true));
            
            // Update the container
            document.getElementById('content-container').innerHTML = contentWrapper.innerHTML;
            
            // Initialize interactive elements after content is loaded
            if (typeof initializeQuizzes === 'function') {
                initializeQuizzes();
            }
            if (typeof initializeReflections === 'function') {
                initializeReflections();
            }
            
            updateUI();
        } else {
            console.error('No content found in section:', url);
        }
    } catch (error) {
        console.error('Error loading section:', error);
    }
}

// Navigation functions
function nextSection() {
    console.log('Next button clicked. Current index:', currentSectionIndex, 'Total sections:', sections.length);
    if (currentSectionIndex < sections.length - 1) {
        currentSectionIndex++;
        loadSection(sections[currentSectionIndex]);
    }
}

function previousSection() {
    console.log('Previous button clicked. Current index:', currentSectionIndex);
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

    console.log('Updated navigation buttons. Current index:', currentSectionIndex);
    console.log('Prev button disabled:', prevButton ? prevButton.disabled : 'not found');
    console.log('Next button disabled:', nextButton ? nextButton.disabled : 'not found');
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

// Add event listeners
window.addEventListener('scroll', debounce(checkScroll, 50));
window.addEventListener('resize', debounce(checkScroll, 50));

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing navigation');
    initializeNavigation();
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
