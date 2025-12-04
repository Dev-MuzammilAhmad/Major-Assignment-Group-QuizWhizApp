/**
 * ============================================
 * DATA MANAGEMENT MODULE
 * Handles LocalStorage operations
 * ============================================
 */

const DataManager = {
    /**
     * Initialize default data
     */
    init() {
        if (!localStorage.getItem(CONFIG.STORAGE_KEYS.QUESTIONS)) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.QUESTIONS, JSON.stringify(DEFAULT_QUESTIONS));
        }
        if (!localStorage.getItem(CONFIG.STORAGE_KEYS.USERS)) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.USERS, JSON.stringify([]));
        }
        if (!localStorage.getItem(CONFIG.STORAGE_KEYS.LEADERBOARD)) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.LEADERBOARD, JSON.stringify([]));
        }
    },

    // ========== Question Operations ==========
    
    getAllQuestions() {
        return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.QUESTIONS)) || [];
    },

    getQuestions(category) {
        const questions = this.getAllQuestions();
        return questions.filter(q => q.category === category);
    },

    getQuizQuestions(category, count = CONFIG.QUESTIONS_PER_QUIZ) {
        const filtered = this.getQuestions(category);
        const shuffled = this.shuffleArray([...filtered]);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    },

    getQuestionCountByCategory() {
        const questions = this.getAllQuestions();
        const counts = {};
        CONFIG.CATEGORIES.forEach(cat => {
            counts[cat.id] = questions.filter(q => q.category === cat.id).length;
        });
        return counts;
    },

    // ========== User Operations ==========
    
    getAllUsers() {
        return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USERS)) || [];
    },

    findUser(username) {
        const users = this.getAllUsers();
        return users.find(u => u.username.toLowerCase() === username.toLowerCase());
    },

    createUser(username, password) {
        if (this.findUser(username)) {
            return null;
        }
        const users = this.getAllUsers();
        const newUser = {
            username,
            password,
            results: [],
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem(CONFIG.STORAGE_KEYS.USERS, JSON.stringify(users));
        return newUser;
    },

    addUserResult(username, result) {
        const users = this.getAllUsers();
        const user = users.find(u => u.username === username);
        if (user) {
            user.results.push({
                ...result,
                date: new Date().toISOString()
            });
            localStorage.setItem(CONFIG.STORAGE_KEYS.USERS, JSON.stringify(users));
        }
    },

    getUserHistory(username) {
        const user = this.findUser(username);
        return user ? user.results : [];
    },

    // ========== Leaderboard Operations ==========
    
    getLeaderboard(category = 'all') {
        let entries = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.LEADERBOARD)) || [];
        
        if (category !== 'all') {
            entries = entries.filter(e => e.category === category);
        }
        
        return entries.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.timeTaken - b.timeTaken;
        });
    },

    addLeaderboardEntry(entry) {
        const entries = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.LEADERBOARD)) || [];
        entries.push({
            ...entry,
            date: new Date().toISOString()
        });
        localStorage.setItem(CONFIG.STORAGE_KEYS.LEADERBOARD, JSON.stringify(entries));
    },

    // ========== Theme Operations ==========
    
    getTheme() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'light';
    },

    setTheme(theme) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);
    },

    // ========== Utilities ==========
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
};

// ========== Default Questions ==========
const DEFAULT_QUESTIONS = [
    // HTML Questions
    { id: 'h1', category: 'html', question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'], correct: 0 },
    { id: 'h2', category: 'html', question: 'Which tag is used for the largest heading?', options: ['<head>', '<h6>', '<h1>', '<header>'], correct: 2 },
    { id: 'h3', category: 'html', question: 'Which tag creates a hyperlink?', options: ['<link>', '<a>', '<href>', '<url>'], correct: 1 },
    { id: 'h4', category: 'html', question: 'Which tag is used for line break?', options: ['<break>', '<lb>', '<br>', '<newline>'], correct: 2 },
    { id: 'h5', category: 'html', question: 'Which attribute specifies an image source?', options: ['href', 'src', 'link', 'source'], correct: 1 },
    { id: 'h6', category: 'html', question: 'Which tag creates an unordered list?', options: ['<ol>', '<list>', '<ul>', '<li>'], correct: 2 },
    { id: 'h7', category: 'html', question: 'Which tag is used for table row?', options: ['<td>', '<tr>', '<th>', '<table>'], correct: 1 },
    { id: 'h8', category: 'html', question: 'Which input type creates a checkbox?', options: ['check', 'checkbox', 'box', 'tick'], correct: 1 },
    { id: 'h9', category: 'html', question: 'Which tag defines the document body?', options: ['<content>', '<main>', '<body>', '<section>'], correct: 2 },
    { id: 'h10', category: 'html', question: 'Which attribute provides alternative text for images?', options: ['title', 'alt', 'text', 'desc'], correct: 1 },

    // CSS Questions
    { id: 'c1', category: 'css', question: 'What does CSS stand for?', options: ['Cascading Style Sheets', 'Creative Style System', 'Computer Style Sheets', 'Colorful Style Sheets'], correct: 0 },
    { id: 'c2', category: 'css', question: 'Which property changes text color?', options: ['text-color', 'font-color', 'color', 'foreground'], correct: 2 },
    { id: 'c3', category: 'css', question: 'Which property changes background color?', options: ['bg-color', 'background-color', 'color-background', 'back-color'], correct: 1 },
    { id: 'c4', category: 'css', question: 'How do you select an element with id "demo"?', options: ['.demo', '#demo', 'demo', '*demo'], correct: 1 },
    { id: 'c5', category: 'css', question: 'How do you select elements with class "test"?', options: ['#test', '.test', 'test', '*test'], correct: 1 },
    { id: 'c6', category: 'css', question: 'Which property controls text size?', options: ['text-size', 'font-size', 'text-style', 'font-height'], correct: 1 },
    { id: 'c7', category: 'css', question: 'Which property adds space inside an element?', options: ['margin', 'spacing', 'padding', 'border'], correct: 2 },
    { id: 'c8', category: 'css', question: 'Which property adds space outside an element?', options: ['padding', 'margin', 'border', 'spacing'], correct: 1 },
    { id: 'c9', category: 'css', question: 'Which value makes an element invisible but keeps space?', options: ['display: none', 'visibility: hidden', 'opacity: 0', 'hidden: true'], correct: 1 },
    { id: 'c10', category: 'css', question: 'Which property creates flexbox layout?', options: ['display: flex', 'layout: flex', 'flex: true', 'flexbox: on'], correct: 0 },

    // JavaScript Questions
    { id: 'j1', category: 'javascript', question: 'Which keyword declares a variable?', options: ['var', 'variable', 'v', 'declare'], correct: 0 },
    { id: 'j2', category: 'javascript', question: 'Which method writes to the console?', options: ['console.write()', 'console.log()', 'log.console()', 'print()'], correct: 1 },
    { id: 'j3', category: 'javascript', question: 'Which operator checks strict equality?', options: ['==', '===', '=', '!='], correct: 1 },
    { id: 'j4', category: 'javascript', question: 'Which method adds an element to array end?', options: ['add()', 'append()', 'push()', 'insert()'], correct: 2 },
    { id: 'j5', category: 'javascript', question: 'Which keyword creates a function?', options: ['func', 'function', 'def', 'method'], correct: 1 },
    { id: 'j6', category: 'javascript', question: 'Which method selects an element by ID?', options: ['getElement()', 'querySelector()', 'getElementById()', 'findById()'], correct: 2 },
    { id: 'j7', category: 'javascript', question: 'Which event fires when a button is clicked?', options: ['onpress', 'onclick', 'onbutton', 'onactivate'], correct: 1 },
    { id: 'j8', category: 'javascript', question: 'Which keyword declares a constant?', options: ['constant', 'const', 'final', 'static'], correct: 1 },
    { id: 'j9', category: 'javascript', question: 'Which method converts string to integer?', options: ['toInteger()', 'parseInt()', 'convertInt()', 'int()'], correct: 1 },
    { id: 'j10', category: 'javascript', question: 'Which symbol is used for single-line comments?', options: ['#', '//', '/*', '--'], correct: 1 },

    // Python Questions
    { id: 'p1', category: 'python', question: 'Which keyword defines a function in Python?', options: ['function', 'func', 'def', 'define'], correct: 2 },
    { id: 'p2', category: 'python', question: 'Which function prints output?', options: ['echo()', 'print()', 'write()', 'output()'], correct: 1 },
    { id: 'p3', category: 'python', question: 'Which symbol is used for comments?', options: ['//', '#', '/*', '--'], correct: 1 },
    { id: 'p4', category: 'python', question: 'Which keyword creates a loop?', options: ['loop', 'repeat', 'for', 'iterate'], correct: 2 },
    { id: 'p5', category: 'python', question: 'Which data type stores True/False?', options: ['boolean', 'bool', 'bit', 'binary'], correct: 1 },
    { id: 'p6', category: 'python', question: 'Which method adds item to list?', options: ['add()', 'push()', 'append()', 'insert()'], correct: 2 },
    { id: 'p7', category: 'python', question: 'Which keyword handles exceptions?', options: ['catch', 'except', 'handle', 'error'], correct: 1 },
    { id: 'p8', category: 'python', question: 'Which function gets user input?', options: ['get()', 'read()', 'input()', 'scan()'], correct: 2 },
    { id: 'p9', category: 'python', question: 'Which keyword imports a module?', options: ['include', 'require', 'import', 'use'], correct: 2 },
    { id: 'p10', category: 'python', question: 'Which function returns list length?', options: ['size()', 'count()', 'length()', 'len()'], correct: 3 },

    // C++ Questions
    { id: 'cpp1', category: 'cpp', question: 'Which header is needed for cout?', options: ['<stdio.h>', '<iostream>', '<output>', '<console>'], correct: 1 },
    { id: 'cpp2', category: 'cpp', question: 'Which symbol outputs to console?', options: ['>>', '<<', '->', '<-'], correct: 1 },
    { id: 'cpp3', category: 'cpp', question: 'Which keyword starts the main function?', options: ['void', 'main', 'int', 'start'], correct: 2 },
    { id: 'cpp4', category: 'cpp', question: 'Which operator allocates memory?', options: ['malloc', 'alloc', 'new', 'create'], correct: 2 },
    { id: 'cpp5', category: 'cpp', question: 'Which keyword defines a class?', options: ['struct', 'object', 'class', 'type'], correct: 2 },
    { id: 'cpp6', category: 'cpp', question: 'Which access specifier allows public access?', options: ['open', 'public', 'global', 'extern'], correct: 1 },
    { id: 'cpp7', category: 'cpp', question: 'Which symbol is used for pointers?', options: ['&', '*', '@', '#'], correct: 1 },
    { id: 'cpp8', category: 'cpp', question: 'Which keyword returns a value from function?', options: ['give', 'output', 'return', 'send'], correct: 2 },
    { id: 'cpp9', category: 'cpp', question: 'Which loop checks condition first?', options: ['do-while', 'while', 'for', 'repeat'], correct: 1 },
    { id: 'cpp10', category: 'cpp', question: 'Which namespace contains cout?', options: ['system', 'std', 'io', 'console'], correct: 1 },

    // Java Questions
    { id: 'jv1', category: 'java', question: 'Which keyword creates an object?', options: ['create', 'object', 'new', 'make'], correct: 2 },
    { id: 'jv2', category: 'java', question: 'Which method prints to console?', options: ['print()', 'System.out.println()', 'console.log()', 'echo()'], correct: 1 },
    { id: 'jv3', category: 'java', question: 'Which keyword defines a class?', options: ['type', 'struct', 'class', 'object'], correct: 2 },
    { id: 'jv4', category: 'java', question: 'Which access modifier is most restrictive?', options: ['public', 'protected', 'private', 'default'], correct: 2 },
    { id: 'jv5', category: 'java', question: 'Which keyword inherits a class?', options: ['inherits', 'extends', 'implements', 'derives'], correct: 1 },
    { id: 'jv6', category: 'java', question: 'Which data type stores whole numbers?', options: ['float', 'double', 'int', 'char'], correct: 2 },
    { id: 'jv7', category: 'java', question: 'Which keyword defines a constant?', options: ['const', 'final', 'static', 'constant'], correct: 1 },
    { id: 'jv8', category: 'java', question: 'Which interface implements a list?', options: ['List', 'Array', 'Collection', 'Set'], correct: 0 },
    { id: 'jv9', category: 'java', question: 'Which keyword handles exceptions?', options: ['except', 'catch', 'handle', 'error'], correct: 1 },
    { id: 'jv10', category: 'java', question: 'Which method is the entry point?', options: ['start()', 'run()', 'main()', 'init()'], correct: 2 }
];