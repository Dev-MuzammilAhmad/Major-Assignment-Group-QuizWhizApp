/**
 * ============================================
 * AUTHENTICATION MODULE
 * Handles login, signup, and sessions
 * ============================================
 */

const Auth = {
    currentUser: null,
    
    /**
     * Initialize - restore session if exists
     */
    init() {
        const savedUser = localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    },

    /**
     * Login user
     */
    login(username, password) {
        const user = DataManager.findUser(username);
        
        if (!user || user.password !== password) {
            return { 
                success: false, 
                message: CONFIG.MESSAGES.LOGIN_FAILED 
            };
        }

        const sessionUser = {
            username: user.username,
            isGuest: false
        };
        
        this.setCurrentUser(sessionUser);
        
        return { 
            success: true, 
            message: CONFIG.MESSAGES.LOGIN_SUCCESS,
            user: sessionUser
        };
    },

    /**
     * Register new user
     */
    signup(username, password, confirmPassword) {
        // Validate password match
        if (password !== confirmPassword) {
            return { 
                success: false, 
                message: CONFIG.MESSAGES.PASSWORDS_MISMATCH 
            };
        }

        // Check minimum length
        if (username.length < 3) {
            return {
                success: false,
                message: 'Username must be at least 3 characters'
            };
        }

        if (password.length < 4) {
            return {
                success: false,
                message: 'Password must be at least 4 characters'
            };
        }

        // Create user
        const newUser = DataManager.createUser(username, password);
        
        if (!newUser) {
            return { 
                success: false, 
                message: CONFIG.MESSAGES.SIGNUP_FAILED 
            };
        }

        return { 
            success: true, 
            message: CONFIG.MESSAGES.SIGNUP_SUCCESS 
        };
    },

    /**
     * Login as guest
     */
    loginAsGuest() {
        const guestUser = {
            username: 'Guest',
            isGuest: true
        };
        
        this.setCurrentUser(guestUser);
        return guestUser;
    },

    /**
     * Logout
     */
    logout() {
        this.currentUser = null;
        localStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
    },

    /**
     * Set current user and save to storage
     */
    setCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem(CONFIG.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    },

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    },

    /**
     * Check if logged in (not guest)
     */
    isLoggedIn() {
        return this.currentUser !== null && !this.currentUser.isGuest;
    },

    /**
     * Check if guest
     */
    isGuest() {
        return this.currentUser !== null && this.currentUser.isGuest === true;
    },

    /**
     * Get username
     */
    getUsername() {
        return this.currentUser ? this.currentUser.username : 'Guest';
    }
};