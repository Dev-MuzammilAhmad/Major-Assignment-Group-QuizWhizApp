/**
 * ============================================
 * CONFIGURATION FILE
 * App-wide settings and constants
 * ============================================
 */

const CONFIG = {
    // App Info
    APP_NAME: 'Code Quiz',
    VERSION: '2.0.0',
    
    // Quiz Settings
    QUESTIONS_PER_QUIZ: 10,
    TIME_PER_QUESTION_MINUTES: 1, // 1 minute per question (total quiz time = questions * this)
    
    // Scoring
    POINTS_CORRECT: 10,
    
    // Storage Keys
    STORAGE_KEYS: {
        USERS: 'codequiz_users',
        CURRENT_USER: 'codequiz_current_user',
        QUESTIONS: 'codequiz_questions',
        LEADERBOARD: 'codequiz_leaderboard',
        THEME: 'codequiz_theme'
    },
    
    // Programming Language Categories
    CATEGORIES: [
        { id: 'html', name: 'HTML', icon: '🌐' },
        { id: 'css', name: 'CSS', icon: '🎨' },
        { id: 'javascript', name: 'JavaScript', icon: '⚡' },
        { id: 'python', name: 'Python', icon: '🐍' },
        { id: 'cpp', name: 'C++', icon: '⚙️' },
        { id: 'java', name: 'Java', icon: '☕' }
    ],
    
    // Messages
    MESSAGES: {
        LOGIN_SUCCESS: 'Welcome back!',
        LOGIN_FAILED: 'Invalid username or password',
        SIGNUP_SUCCESS: 'Account created successfully!',
        SIGNUP_FAILED: 'Username already exists',
        PASSWORDS_MISMATCH: 'Passwords do not match',
        NO_QUESTIONS: 'No questions available for this selection'
    },
    
    // Result Messages
    RESULT_MESSAGES: {
        EXCELLENT: { min: 90, title: '🏆 Excellent!' },
        GREAT: { min: 70, title: '🌟 Great Job!' },
        GOOD: { min: 50, title: '👍 Good Effort!' },
        POOR: { min: 0, title: '📚 Keep Learning!' }
    }
};

/**
 * Get result message based on percentage
 */
function getResultMessage(percentage) {
    if (percentage >= CONFIG.RESULT_MESSAGES.EXCELLENT.min) {
        return CONFIG.RESULT_MESSAGES.EXCELLENT;
    } else if (percentage >= CONFIG.RESULT_MESSAGES.GREAT.min) {
        return CONFIG.RESULT_MESSAGES.GREAT;
    } else if (percentage >= CONFIG.RESULT_MESSAGES.GOOD.min) {
        return CONFIG.RESULT_MESSAGES.GOOD;
    } else {
        return CONFIG.RESULT_MESSAGES.POOR;
    }
}

Object.freeze(CONFIG);