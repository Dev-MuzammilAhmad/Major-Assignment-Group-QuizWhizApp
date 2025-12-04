/**
 * ============================================
 * LEADERBOARD MODULE
 * Handles leaderboard display and filtering
 * ============================================
 */

const Leaderboard = {
    filters: {
        category: 'all'
    },

    /**
     * Initialize leaderboard
     */
    init() {
        this.populateFilters();
        this.setupEventListeners();
    },

    /**
     * Populate category filter dropdown
     */
    populateFilters() {
        const categorySelect = document.getElementById('lb-category-filter');
        
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="all">All Categories</option>';
            
            CONFIG.CATEGORIES.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = `${cat.icon} ${cat.name}`;
                categorySelect.appendChild(option);
            });
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const categoryFilter = document.getElementById('lb-category-filter');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.render();
            });
        }
    },

    /**
     * Render leaderboard table
     */
    render() {
        const tbody = document.getElementById('leaderboard-body');
        const guestNotice = document.getElementById('leaderboard-guest-notice');
        
        if (!tbody) return;

        const entries = DataManager.getLeaderboard(this.filters.category);

        // Show guest notice if applicable
        if (guestNotice) {
            guestNotice.classList.toggle('hidden', !Auth.isGuest());
        }

        tbody.innerHTML = '';

        if (entries.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                        No scores yet. Be the first to play!
                    </td>
                </tr>
            `;
            return;
        }

        entries.forEach((entry, index) => {
            const row = this.createLeaderboardRow(entry, index + 1);
            tbody.appendChild(row);
        });
    },

    /**
     * Create leaderboard table row
     */
    createLeaderboardRow(entry, rank) {
        const row = document.createElement('tr');
        
        // Highlight current user
        if (Auth.getCurrentUser() && entry.username === Auth.getUsername()) {
            row.style.background = 'rgba(99, 102, 241, 0.1)';
        }

        const category = CONFIG.CATEGORIES.find(c => c.id === entry.category);
        const categoryName = category ? `${category.icon} ${category.name}` : entry.category;

        row.innerHTML = `
            <td>
                <span class="rank-badge ${rank <= 3 ? 'rank-' + rank : ''}">${rank}</span>
            </td>
            <td><strong>${this.escapeHtml(entry.username)}</strong></td>
            <td>${categoryName}</td>
            <td>
                <strong>${entry.score}</strong>
                <small style="color: var(--text-muted);">(${entry.correct}/${entry.total})</small>
            </td>
            <td>${this.formatTime(entry.timeTaken)}</td>
        `;

        return row;
    },

    /**
     * Format time in seconds to mm:ss
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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