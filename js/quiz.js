/**
 * ============================================
 * QUIZ ENGINE MODULE
 * Handles quiz logic, timing, and scoring
 * ============================================
 */

const QuizEngine = {
    state: {
        category: null,
        questions: [],
        currentIndex: 0,
        answers: [],
        selectedOption: null,  // Currently selected but not submitted
        score: 0,
        startTime: null,
        endTime: null,
        totalTime: 0,          // Total quiz time in seconds
        timeRemaining: 0,      // Remaining time in seconds
        timerInterval: null,
        isActive: false
    },

    /**
     * Reset quiz state
     */
    reset() {
        this.stopTimer();
        this.state = {
            category: null,
            questions: [],
            currentIndex: 0,
            answers: [],
            selectedOption: null,
            score: 0,
            startTime: null,
            endTime: null,
            totalTime: 0,
            timeRemaining: 0,
            timerInterval: null,
            isActive: false
        };
    },

    /**
     * Setup quiz with category
     */
    setup(category) {
        this.reset();
        
        const questions = DataManager.getQuizQuestions(category);
        
        if (questions.length === 0) {
            return false;
        }

        // Shuffle options for each question
        this.state.questions = questions.map(q => ({
            ...q,
            shuffledOptions: this.shuffleOptions(q.options, q.correct)
        }));

        this.state.category = category;
        this.state.answers = new Array(this.state.questions.length).fill(null);
        
        // Calculate total time (1 minute per question)
        this.state.totalTime = this.state.questions.length * CONFIG.TIME_PER_QUESTION_MINUTES * 60;
        this.state.timeRemaining = this.state.totalTime;
        
        return true;
    },

    /**
     * Shuffle options and track correct answer position
     */
    shuffleOptions(options, correctIndex) {
        const optionsWithIndex = options.map((opt, idx) => ({
            text: opt,
            isCorrect: idx === correctIndex
        }));

        // Shuffle
        for (let i = optionsWithIndex.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [optionsWithIndex[i], optionsWithIndex[j]] = [optionsWithIndex[j], optionsWithIndex[i]];
        }

        return {
            options: optionsWithIndex.map(opt => opt.text),
            correctIndex: optionsWithIndex.findIndex(opt => opt.isCorrect)
        };
    },

    /**
     * Start the quiz
     */
    start() {
        this.state.startTime = Date.now();
        this.state.isActive = true;
        this.startTimer();
    },

    /**
     * Start the countdown timer for entire quiz
     */
    startTimer() {
        this.updateTimerDisplay();
        
        this.state.timerInterval = setInterval(() => {
            this.state.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.state.timeRemaining <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    },

    /**
     * Stop the timer
     */
    stopTimer() {
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
        }
    },

    /**
     * Update timer display
     */
    updateTimerDisplay() {
        const timerEl = document.getElementById('timer-display');
        const timerContainer = document.getElementById('quiz-timer');
        
        if (timerEl) {
            const minutes = Math.floor(this.state.timeRemaining / 60);
            const seconds = this.state.timeRemaining % 60;
            timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (timerContainer) {
            timerContainer.classList.remove('warning', 'danger');
            
            // Warning at 2 minutes
            if (this.state.timeRemaining <= 120 && this.state.timeRemaining > 60) {
                timerContainer.classList.add('warning');
            }
            // Danger at 1 minute
            if (this.state.timeRemaining <= 60) {
                timerContainer.classList.add('danger');
            }
        }
    },

    /**
     * Handle time up - end quiz immediately
     */
    handleTimeUp() {
        // Mark remaining questions as not answered
        for (let i = this.state.currentIndex; i < this.state.questions.length; i++) {
            if (this.state.answers[i] === null) {
                this.state.answers[i] = -1;
            }
        }
        this.endQuiz();
    },

    /**
     * Select an option (doesn't submit yet)
     */
    selectOption(index) {
        this.state.selectedOption = index;
        UI.highlightSelectedOption(index);
    },

    /**
     * Submit the selected answer
     */
    submitAnswer() {
        if (this.state.selectedOption === null) {
            return false;
        }

        const currentQ = this.getCurrentQuestion();
        const correctIndex = currentQ.shuffledOptions.correctIndex;
        const isCorrect = this.state.selectedOption === correctIndex;
        
        // Record the answer
        this.state.answers[this.state.currentIndex] = this.state.selectedOption;
        
        // Add points if correct
        if (isCorrect) {
            this.state.score += CONFIG.POINTS_CORRECT;
        }

        // Show feedback
        UI.showAnswerFeedback(this.state.selectedOption, correctIndex);

        // Move to next question after delay
        setTimeout(() => {
            this.state.selectedOption = null;
            this.nextQuestion();
        }, 1000);

        return true;
    },

    /**
     * Move to next question or end quiz
     */
    nextQuestion() {
        if (this.state.currentIndex < this.state.questions.length - 1) {
            this.state.currentIndex++;
            UI.renderQuestion();
        } else {
            this.endQuiz();
        }
    },

    /**
     * End quiz and calculate results
     */
    endQuiz() {
        this.stopTimer();
        this.state.isActive = false;
        this.state.endTime = Date.now();
        
        const results = this.calculateResults();
        
        // Save to history if logged in
        if (Auth.isLoggedIn()) {
            DataManager.addUserResult(Auth.getUsername(), results);
            
            DataManager.addLeaderboardEntry({
                username: Auth.getUsername(),
                category: this.state.category,
                score: results.score,
                timeTaken: results.timeTaken,
                correct: results.correct,
                total: results.total
            });
        }

        UI.renderResults(results);
        return results;
    },

    /**
     * Calculate quiz results
     */
    calculateResults() {
        let correct = 0;
        let wrong = 0;
        
        this.state.answers.forEach((answer, idx) => {
            if (answer === -1 || answer === null) {
                wrong++;
            } else {
                const correctIdx = this.state.questions[idx].shuffledOptions.correctIndex;
                if (answer === correctIdx) {
                    correct++;
                } else {
                    wrong++;
                }
            }
        });

        const total = this.state.questions.length;
        const percentage = Math.round((correct / total) * 100);
        const timeTaken = this.state.totalTime - this.state.timeRemaining;

        return {
            score: this.state.score,
            correct,
            wrong,
            total,
            percentage,
            timeTaken,
            category: this.state.category
        };
    },

    /**
     * Get current question
     */
    getCurrentQuestion() {
        return this.state.questions[this.state.currentIndex];
    },

    /**
     * Get progress info
     */
    getProgress() {
        return {
            current: this.state.currentIndex + 1,
            total: this.state.questions.length,
            percentage: ((this.state.currentIndex + 1) / this.state.questions.length) * 100
        };
    },

    /**
     * Get review data
     */
    getReviewData() {
        return this.state.questions.map((q, idx) => {
            const userAnswer = this.state.answers[idx];
            const correctIdx = q.shuffledOptions.correctIndex;
            const isCorrect = userAnswer === correctIdx;
            
            return {
                question: q.question,
                options: q.shuffledOptions.options,
                userAnswer: userAnswer >= 0 ? q.shuffledOptions.options[userAnswer] : 'Not answered',
                correctAnswer: q.shuffledOptions.options[correctIdx],
                isCorrect,
                wasSkipped: userAnswer === -1 || userAnswer === null
            };
        });
    },

    /**
     * Check if quiz is active
     */
    isActive() {
        return this.state.isActive;
    },

    /**
     * Get category name
     */
    getCategoryName() {
        const cat = CONFIG.CATEGORIES.find(c => c.id === this.state.category);
        return cat ? cat.name : this.state.category;
    }
};