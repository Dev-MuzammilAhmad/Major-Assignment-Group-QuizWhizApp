/**
 * ============================================
 * MAIN APPLICATION MODULE
 * Initializes app and handles all events
 * ============================================
 */

const App = {
    /**
     * Initialize the application
     */
    init() {
        console.log(`${CONFIG.APP_NAME} v${CONFIG.VERSION} initializing...`);
        
        // Initialize modules
        DataManager.init();
        Auth.init();
        UI.init();
        Leaderboard.init();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check if user is logged in
        if (Auth.getCurrentUser()) {
            this.onLoginSuccess();
        } else {
            UI.showScreen('auth');
        }
        
        console.log(`${CONFIG.APP_NAME} initialized!`);
    },

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchAuthTab(tab.dataset.tab));
        });

        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Signup form
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Guest login
        const guestBtn = document.getElementById('guest-login');
        if (guestBtn) {
            guestBtn.addEventListener('click', () => this.handleGuestLogin());
        }

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => this.navigateTo(btn.dataset.screen));
        });

        // Home screen buttons
        const startQuizBtn = document.getElementById('start-quiz-btn');
        if (startQuizBtn) {
            startQuizBtn.addEventListener('click', () => this.showCategorySelection());
        }

        const viewHistoryBtn = document.getElementById('view-history-btn');
        if (viewHistoryBtn) {
            viewHistoryBtn.addEventListener('click', () => this.viewHistory());
        }

        const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');
        if (viewLeaderboardBtn) {
            viewLeaderboardBtn.addEventListener('click', () => this.navigateTo('leaderboard'));
        }

        // Category screen back button
        const backToHome = document.getElementById('back-to-home');
        if (backToHome) {
            backToHome.addEventListener('click', () => this.navigateTo('home'));
        }

        // Quiz submit button
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => QuizEngine.submitAnswer());
        }

        // Results screen buttons
        const reviewBtn = document.getElementById('review-btn');
        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => UI.renderReview());
        }

        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.retryQuiz());
        }

        const newQuizBtn = document.getElementById('new-quiz-btn');
        if (newQuizBtn) {
            newQuizBtn.addEventListener('click', () => this.showCategorySelection());
        }

        // Review screen back button
        const backToResults = document.getElementById('back-to-results');
        if (backToResults) {
            backToResults.addEventListener('click', () => UI.showScreen('results'));
        }

        // History modal close
        const closeHistory = document.getElementById('close-history');
        if (closeHistory) {
            closeHistory.addEventListener('click', () => UI.closeHistoryModal());
        }

        // Success popup OK button
        const popupOkBtn = document.getElementById('popup-ok-btn');
        if (popupOkBtn) {
            popupOkBtn.addEventListener('click', () => {
                UI.hideSuccessPopup();
                this.switchAuthTab('login');
            });
        }

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });

        // Close popup on outside click
        const successPopup = document.getElementById('success-popup');
        if (successPopup) {
            successPopup.addEventListener('click', (e) => {
                if (e.target === successPopup) {
                    UI.hideSuccessPopup();
                    this.switchAuthTab('login');
                }
            });
        }
    },

    /**
     * Switch auth tabs
     */
    switchAuthTab(tab) {
        document.querySelectorAll('.auth-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });

        document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
        document.getElementById('signup-form').classList.toggle('hidden', tab !== 'signup');
        
        // Clear messages
        document.getElementById('auth-message').className = 'message';
        document.getElementById('auth-message').textContent = '';
    },

    /**
     * Handle login
     */
    handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        const messageEl = document.getElementById('auth-message');

        const result = Auth.login(username, password);

        if (result.success) {
            messageEl.textContent = result.message;
            messageEl.className = 'message success';
            
            setTimeout(() => {
                this.onLoginSuccess();
            }, 500);
        } else {
            messageEl.textContent = result.message;
            messageEl.className = 'message error';
        }
    },

    /**
     * Handle signup
     */
    handleSignup(e) {
        e.preventDefault();
        
        const username = document.getElementById('signup-username').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;
        const messageEl = document.getElementById('auth-message');

        const result = Auth.signup(username, password, confirm);

        if (result.success) {
            // Clear form
            document.getElementById('signup-form').reset();
            // Show success popup
            UI.showSuccessPopup();
        } else {
            messageEl.textContent = result.message;
            messageEl.className = 'message error';
        }
    },

    /**
     * Handle guest login
     */
    handleGuestLogin() {
        Auth.loginAsGuest();
        this.onLoginSuccess();
    },

    /**
     * Handle logout
     */
    handleLogout() {
        Auth.logout();
        QuizEngine.reset();
        UI.updateHeader();
        UI.showScreen('auth');
        
        // Clear forms
        document.getElementById('login-form').reset();
        document.getElementById('signup-form').reset();
        document.getElementById('auth-message').className = 'message';
    },

    /**
     * Called after successful login
     */
    onLoginSuccess() {
        UI.updateHeader();
        UI.renderHome();
        UI.showScreen('home');
    },

    /**
     * Navigate to screen
     */
    navigateTo(screen) {
        switch (screen) {
            case 'home':
                UI.renderHome();
                UI.showScreen('home');
                break;
            case 'leaderboard':
                Leaderboard.render();
                UI.showScreen('leaderboard');
                break;
            default:
                UI.showScreen(screen);
        }
    },

    /**
     * Show category selection
     */
    showCategorySelection() {
        QuizEngine.reset();
        UI.renderCategories();
        UI.showScreen('category');
    },

    /**
     * Start quiz with selected category
     */
    startQuiz(category) {
        const success = QuizEngine.setup(category);
        
        if (!success) {
            alert(CONFIG.MESSAGES.NO_QUESTIONS);
            return;
        }

        QuizEngine.start();
        UI.showScreen('quiz');
        UI.renderQuestion();
    },

    /**
     * Retry same quiz
     */
    retryQuiz() {
        const category = QuizEngine.state.category;
        this.startQuiz(category);
    },

    /**
     * View history
     */
    viewHistory() {
        if (Auth.isLoggedIn()) {
            UI.renderHistory();
        } else {
            alert('Please login to view history');
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});