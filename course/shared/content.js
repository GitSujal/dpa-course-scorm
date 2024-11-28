// Quiz handling
function initializeQuizzes() {
    // Find all quiz questions
    const quizQuestions = document.querySelectorAll('.quiz-question');
    
    quizQuestions.forEach(question => {
        // Get the check answer button for this question
        const checkButton = question.querySelector('.action-button');
        if (checkButton) {
            checkButton.addEventListener('click', () => {
                const questionId = question.id;
                const correctAnswer = question.dataset.correct;
                const explanation = question.dataset.explanation;
                checkQuizAnswer(questionId, correctAnswer, explanation);
            });
        }
    });
}

function checkQuizAnswer(questionId, correctAnswer, explanation) {
    // Find the selected answer
    const selectedInput = document.querySelector(`input[name="${questionId}"]:checked`);
    const feedbackDiv = document.getElementById(`${questionId}_feedback`);
    
    if (!selectedInput) {
        feedbackDiv.innerHTML = '<div class="feedback-message warning">Please select an answer.</div>';
        return;
    }

    const selectedAnswer = selectedInput.value;
    const isCorrect = selectedAnswer === correctAnswer;
    
    // Create feedback message
    let feedbackMessage = '';
    if (isCorrect) {
        feedbackMessage = '<div class="feedback-message correct">';
        feedbackMessage += '<span class="icon">✓</span> ';
        feedbackMessage += 'Correct! ';
    } else {
        feedbackMessage = '<div class="feedback-message incorrect">';
        feedbackMessage += '<span class="icon">✗</span> ';
        feedbackMessage += 'Incorrect. ';
    }
    
    // Add explanation if provided
    if (explanation) {
        feedbackMessage += explanation;
    }
    feedbackMessage += '</div>';
    
    // Display feedback
    feedbackDiv.innerHTML = feedbackMessage;
    
    // Disable radio buttons and check button after answer is checked
    const radioButtons = document.querySelectorAll(`input[name="${questionId}"]`);
    radioButtons.forEach(radio => {
        radio.disabled = true;
        // Add visual indication of correct answer
        const label = radio.parentElement;
        if (radio.value === correctAnswer) {
            label.classList.add('correct-answer');
        }
        if (radio.checked && !isCorrect) {
            label.classList.add('incorrect-answer');
        }
    });
    
    // Disable check button
    const checkButton = document.querySelector(`#${questionId} .action-button`);
    if (checkButton) {
        checkButton.disabled = true;
    }
}

// Reflection handling
function initializeReflections() {
    const reflectionContainers = document.querySelectorAll('.reflection-container');
    
    reflectionContainers.forEach(container => {
        const textarea = container.querySelector('.reflection-box');
        const saveButton = container.querySelector('.action-button');
        
        if (textarea && saveButton) {
            const reflectionId = textarea.id;
            
            // Load any saved reflection
            const savedText = localStorage.getItem(`reflection_${reflectionId}`);
            if (savedText) {
                textarea.value = savedText;
                textarea.disabled = true;
                saveButton.disabled = true;
            }
            
            // Add click handler for save button
            saveButton.addEventListener('click', () => saveReflection(reflectionId));
        }
    });
}

function saveReflection(reflectionId) {
    const textarea = document.getElementById(reflectionId);
    const reflectionText = textarea.value.trim();
    
    if (!reflectionText) {
        showReflectionFeedback(reflectionId, 'Please enter your reflection before saving.', 'warning');
        return;
    }
    
    // Save to localStorage for persistence
    try {
        localStorage.setItem(`reflection_${reflectionId}`, reflectionText);
        showReflectionFeedback(reflectionId, 'Reflection saved successfully!', 'success');
        
        // Disable the textarea and save button to indicate saved state
        textarea.disabled = true;
        const saveButton = textarea.parentElement.querySelector('.action-button');
        if (saveButton) {
            saveButton.disabled = true;
        }
    } catch (error) {
        showReflectionFeedback(reflectionId, 'Failed to save reflection. Please try again.', 'error');
    }
}

function showReflectionFeedback(reflectionId, message, type) {
    const textarea = document.getElementById(reflectionId);
    const container = textarea.parentElement;
    
    // Create or get feedback div
    let feedbackDiv = container.querySelector('.reflection-feedback');
    if (!feedbackDiv) {
        feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'reflection-feedback';
        container.appendChild(feedbackDiv);
    }
    
    // Show feedback message
    feedbackDiv.innerHTML = `<div class="feedback-message ${type}">${message}</div>`;
    
    // Clear feedback after 3 seconds if it's a success message
    if (type === 'success') {
        setTimeout(() => {
            feedbackDiv.innerHTML = '';
        }, 3000);
    }
}

// Add some basic styles for quiz feedback
const style = document.createElement('style');
style.textContent = `
    .feedback-message {
        margin-top: 10px;
        padding: 10px;
        border-radius: 4px;
    }
    .feedback-message.correct {
        background-color: #e7f6e7;
        color: #0a5f0a;
        border: 1px solid #b7e1b7;
    }
    .feedback-message.incorrect {
        background-color: #fde7e7;
        color: #a42e2e;
        border: 1px solid #f5c2c2;
    }
    .feedback-message.warning {
        background-color: #fff3cd;
        color: #856404;
        border: 1px solid #ffeeba;
    }
    .quiz-option {
        margin: 10px 0;
    }
    .correct-answer {
        color: #0a5f0a;
        font-weight: bold;
    }
    .incorrect-answer {
        color: #a42e2e;
        text-decoration: line-through;
    }
    .icon {
        font-weight: bold;
        margin-right: 5px;
    }
`;
document.head.appendChild(style);

// Initialize interactive elements when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeQuizzes();
    initializeReflections();
});
