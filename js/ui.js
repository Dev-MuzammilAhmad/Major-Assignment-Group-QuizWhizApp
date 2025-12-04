/**
 * ============================================
 * UI MODULE
 * Handles all UI rendering and updates
 * ============================================
 */

const UI = {
    currentScreen: 'auth',
    selectedCategory: null,

    /**
     * Initialize UI
     */
    init() {
        this.applyTheme();
        this.setupThemeToggle();
    },

    /**
     * Apply saved theme
     */
    applyTheme() {
        const theme = DataManager.getTheme();
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeIcon(theme);
    },

    /**
     * Setup theme toggle
     */
    setupThemeToggle() {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                const current = DataManager.getTheme();
                const newTheme = current === 'light' ? 'dark' : 'light';
                DataManager.setTheme(newTheme);
                document.documentElement.setAttribute('data-theme', newTheme);
                this.updateThemeIcon(newTheme);
            });
        }
    },

    /**
     * Update theme icon
     */
    updateThemeIcon(theme) {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.textContent = theme === 'light' ? '🌙' : '☀️';
        }
    },

    /**
     * Show a screen
     */
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });

        const targetScreen = document.getElementById(`${screenId}-screen`);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            this.currentScreen = screenId;
        }

        this.updateNavigation(screenId);
    },

    /**
     * Update navigation
     */
    updateNavigation(activeScreen) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.screen === activeScreen);
        });
    },

    /**
     * Update header with user info
     */
    updateHeader() {
        const userDisplay = document.getElementById('user-display');
        const logoutBtn = document.getElementById('logout-btn');
        const mainNav = document.getElementById('main-nav');

        if (Auth.getCurrentUser()) {
            const user = Auth.getCurrentUser();
            userDisplay.textContent = user.isGuest ? '👤 Guest' : `👤 ${user.username}`;
            logoutBtn.classList.remove('hidden');
            mainNav.classList.remove('hidden');
        } else {
            userDisplay.textContent = '';
            logoutBtn.classList.add('hidden');
            mainNav.classList.add('hidden');
        }
    },

    /**
     * Render home screen
     */
    renderHome() {
        const statsContainer = document.getElementById('user-stats');
        
        if (!statsContainer) return;

        if (Auth.isLoggedIn()) {
            const history = DataManager.getUserHistory(Auth.getUsername());
            const totalQuizzes = history.length;
            const avgScore = totalQuizzes > 0 
                ? Math.round(history.reduce((sum, r) => sum + r.percentage, 0) / totalQuizzes)
                : 0;
            const bestScore = totalQuizzes > 0
                ? Math.max(...history.map(r => r.score))
                : 0;

            statsContainer.innerHTML = `
                <div class="stat-card">
                    <div class="value">${totalQuizzes}</div>
                    <div class="label">Quizzes</div>
                </div>
                <div class="stat-card">
                    <div class="value">${avgScore}%</div>
                    <div class="label">Avg Score</div>
                </div>
                <div class="stat-card">
                    <div class="value">${bestScore}</div>
                    <div class="label">Best</div>
                </div>
            `;
        } else {
            statsContainer.innerHTML = `
                <p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">
                    Login to track your progress!
                </p>
            `;
        }
    },

    /**
     * Render category selection
     */
    renderCategories() {
        const grid = document.getElementById('category-grid');
        if (!grid) return;

        const counts = DataManager.getQuestionCountByCategory();

        grid.innerHTML = CONFIG.CATEGORIES.map(cat => `
            <div class="category-card" data-category="${cat.id}">
                <div class="icon">${cat.icon}</div>
                <div class="name">${cat.name}</div>
                <div class="count">${counts[cat.id] || 0} questions</div>
            </div>
        `).join('');

        // Add click handlers
        grid.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectedCategory = card.dataset.category;
                App.startQuiz(this.selectedCategory);
            });
        });
    },

    /**
     * Render current question
     */
    renderQuestion() {
        const question = QuizEngine.getCurrentQuestion();
        const progress = QuizEngine.getProgress();

        if (!question) return;

        // Update badge
        document.getElementById('quiz-category-badge').textContent = QuizEngine.getCategoryName();

        // Update progress
        document.getElementById('progress-fill').style.width = `${progress.percentage}%`;
        document.getElementById('progress-text').textContent = `${progress.current} / ${progress.total}`;

        // Update question
        document.getElementById('question-text').textContent = question.question;

        // Render options
        const container = document.getElementById('options-container');
        container.innerHTML = question.shuffledOptions.options.map((opt, idx) => `
            <button class="option-btn" data-index="${idx}">
                <span class="option-letter">${String.fromCharCode(65 + idx)}.</span>
                ${this.escapeHtml(opt)}
            </button>
        `).join('');

        // Add click handlers
        container.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                QuizEngine.selectOption(idx);
            });
        });

        // Reset submit button
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
    },

    /**
     * Highlight selected option
     */
    highlightSelectedOption(index) {
        // Remove previous selection
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Add selection to clicked
        const selectedBtn = document.querySelector(`.option-btn[data-index="${index}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }

        // Enable submit button
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = false;
    },

    /**
     * Show answer feedback
     */
    showAnswerFeedback(selectedIndex, correctIndex) {
        const buttons = document.querySelectorAll('.option-btn');
        buttons.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === correctIndex) {
                btn.classList.add('correct');
            }
            if (idx === selectedIndex && selectedIndex !== correctIndex) {
                btn.classList.add('incorrect');
            }
        });

        // Disable submit button
        document.getElementById('submit-btn').disabled = true;
    },

    /**
     * Render results screen
     */
    renderResults(results) {
        const resultMsg = getResultMessage(results.percentage);
        
        document.getElementById('results-title').textContent = resultMsg.title;
        document.getElementById('score-value').textContent = results.score;
        document.getElementById('correct-count').textContent = results.correct;
        document.getElementById('wrong-count').textContent = results.wrong;
        
        // Format time
        const mins = Math.floor(results.timeTaken / 60);
        const secs = results.timeTaken % 60;
        document.getElementById('time-taken').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

        // Update score circle color
        const circle = document.getElementById('score-circle');
        if (results.percentage >= 70) {
            circle.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        } else if (results.percentage >= 50) {
            circle.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
        } else {
            circle.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        }

        this.showScreen('results');
    },

    /**
     * Render review screen
     */
    renderReview() {
        const container = document.getElementById('review-container');
        const reviewData = QuizEngine.getReviewData();

        container.innerHTML = reviewData.map((item, idx) => `
            <div class="review-item ${item.isCorrect ? 'correct' : 'incorrect'}">
                <div class="review-question">
                    <strong>Q${idx + 1}:</strong> ${this.escapeHtml(item.question)}
                </div>
                <div class="review-answer">
                    <span class="${item.isCorrect ? 'correct-answer' : 'your-answer'}">
                        Your answer: ${item.wasSkipped ? 'Not answered' : this.escapeHtml(item.userAnswer)}
                        ${item.isCorrect ? '✓' : '✗'}
                    </span>
                    ${!item.isCorrect ? `
                        <span class="correct-answer">
                            Correct answer: ${this.escapeHtml(item.correctAnswer)}
                        </span>
                    ` : ''}
                </div>
            </div>
        `).join('');

        this.showScreen('review');
    },

    /**
     * Render history modal
     */
    renderHistory() {
        const container = document.getElementById('history-list');
        const history = DataManager.getUserHistory(Auth.getUsername());

        if (history.length === 0) {
            container.innerHTML = `
                <p style="text-align: center; color: var(--text-muted);">
                    No quiz history yet. Start playing!
                </p>
            `;
        } else {
            const sorted = [...history].reverse();
            
            container.innerHTML = sorted.map(entry => {
                const cat = CONFIG.CATEGORIES.find(c => c.id === entry.category);
                const date = new Date(entry.date).toLocaleDateString();
                
                return `
                    <div class="review-item ${entry.percentage >= 50 ? 'correct' : 'incorrect'}">
                        <div class="review-question">
                            ${cat ? cat.icon : '📝'} ${cat ? cat.name : entry.category}
                        </div>
                        <div class="review-answer">
                            <span>Score: <strong>${entry.score}</strong> (${entry.correct}/${entry.total})</span>
                            <span style="color: var(--text-muted);">${date}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        document.getElementById('history-modal').classList.remove('hidden');
    },

    /**
     * Close history modal
     */
    closeHistoryModal() {
        document.getElementById('history-modal').classList.add('hidden');
    },

    /**
     * Show success popup
     */
    showSuccessPopup() {
        document.getElementById('success-popup').classList.remove('hidden');
    },

    /**
     * Hide success popup
     */
    hideSuccessPopup() {
        document.getElementById('success-popup').classList.add('hidden');
    },

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};