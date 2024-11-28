/* SCORM API Integration */
let API = null;
let findAPITries = 0;

function findAPI(win) {
    while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
        findAPITries++;
        if (findAPITries > 500) {
            alert("Error finding API -- too deeply nested.");
            return null;
        }
        win = win.parent;
    }
    return win.API;
}

function getAPI() {
    if (API == null) {
        API = findAPI(window);
        if ((API == null) && (window.opener != null) && (typeof(window.opener) != "undefined")) {
            API = findAPI(window.opener);
        }
        if (API == null) {
            alert("Unable to find SCORM API adapter");
        }
    }
    return API;
}

/* SCORM Functions */
function initializeSCORM() {
    const api = getAPI();
    if (api) {
        api.LMSInitialize("");
        api.LMSSetValue("cmi.core.lesson_status", "incomplete");
        api.LMSSetValue("cmi.core.score.min", "0");
        api.LMSSetValue("cmi.core.score.max", "100");
        api.LMSCommit("");
    }
}

function setSCORMScore(score) {
    const api = getAPI();
    if (api) {
        api.LMSSetValue("cmi.core.score.raw", score.toString());
        if (score >= 80) {
            api.LMSSetValue("cmi.core.lesson_status", "completed");
        }
        api.LMSCommit("");
    }
}

function setSCORMComplete() {
    const api = getAPI();
    if (api) {
        api.LMSSetValue("cmi.core.lesson_status", "completed");
        api.LMSCommit("");
    }
}

function terminateSCORM() {
    const api = getAPI();
    if (api) {
        api.LMSFinish("");
    }
}

/* Quiz and Progress Tracking */
let quizScore = 0;

function checkAnswer(questionId, correctAnswer) {
    const selected = document.querySelector(`input[name="${questionId}"]:checked`);
    if (!selected) return;
    
    const feedback = document.querySelector(`#${questionId}_feedback`);
    feedback.style.display = 'block';
    
    if (selected.value === correctAnswer) {
        feedback.textContent = "Correct!";
        feedback.className = "feedback correct";
        quizScore += 1;
    } else {
        feedback.textContent = "Incorrect. Try again!";
        feedback.className = "feedback incorrect";
    }
    
    const totalQuestions = document.querySelectorAll('.quiz-question').length;
    const finalScore = (quizScore / totalQuestions) * 100;
    setSCORMScore(finalScore);
}

function checkDataTypeAnswer(scenarioId, answer) {
    const feedback = document.querySelector(`#${scenarioId}_feedback`);
    feedback.style.display = 'block';
    
    const correctAnswers = {
        'scenario1': 'unstructured',
        'scenario2': 'structured',
        'scenario3': 'unstructured'
    };
    
    if (answer === correctAnswers[scenarioId]) {
        feedback.textContent = "Correct! That's the right data type for this scenario.";
        feedback.className = "feedback correct";
    } else {
        feedback.textContent = "Not quite. Think about the format and organization of this type of data.";
        feedback.className = "feedback incorrect";
    }
}

function saveReflection(reflectionId) {
    const reflection = document.querySelector(`#${reflectionId}`).value;
    // In a real implementation, this would save to the LMS
    alert("Your reflection has been saved!");
}

function updateRating(skillId, value) {
    document.querySelector(`#${skillId}_value`).textContent = value;
}

function saveAssessment() {
    // In a real implementation, this would save to the LMS
    alert("Your self-assessment has been saved!");
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    initializeSCORM();
    
    // Ensure all sections are visible
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = 'block';
        section.style.visibility = 'visible';
        section.style.opacity = '1';
        console.log('Section initialized:', section.querySelector('.section-title').textContent);
    });
});

window.addEventListener('unload', terminateSCORM);