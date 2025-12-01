// Global variables
let allArticles = [];
let initialArticles = []; // Store the initial 6 articles

// Load all articles from Firebase
function loadAllArticles() {
    db.ref('articles').orderByChild('date').once('value')
        .then((snapshot) => {
            allArticles = [];
            snapshot.forEach((childSnapshot) => {
                const article = childSnapshot.val();
                article.id = childSnapshot.key;
                allArticles.push(article);
            });
            
            // Sort by date (newest first) and get first 6
            allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
            initialArticles = allArticles.slice(0, 6);
            
            // Display only the initial 6 articles WITH IMAGES
            displayArticles(initialArticles, '', true);
        })
        .catch((error) => {
            console.error('Error loading articles:', error);
        });
}

// Display articles with optional search term highlighting and image control
function displayArticles(articles, searchTerm = '', showImages = true) {
    const container = document.getElementById('articlesContainer');
    const resultsInfo = document.getElementById('searchResultsInfo');
    
    if (articles.length === 0) {
        container.innerHTML = '<div class="no-articles">Няма намерени статии</div>';
        resultsInfo.textContent = 'Няма намерени статии, отговарящи на търсенето.';
        return;
    }
    
    container.innerHTML = articles.map(article => {
        // Highlight search term in title
        let highlightedTitle = article.title;
        if (searchTerm) {
            const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
            highlightedTitle = article.title.replace(regex, '<mark>$1</mark>');
        }
        
        // Determine image display - FIXED LOGIC
        let imageHTML = '';
        let cardClass = 'with-thumbnail'; // Default for search results
        let contentClass = 'compact';
        
        // Show full images ONLY when: no search term AND showImages is true
        if (searchTerm === '' && showImages) {
            cardClass = 'with-full-image';
            contentClass = '';
            
            if (article.imageUrl) {
                imageHTML = `
                    <div class="article-card-image">
                        <img src="${article.imageUrl}" alt="${article.title}" loading="lazy">
                    </div>
                `;
            }
        } else {
            // Show thumbnails for search results OR when showImages is false
            if (article.imageUrl) {
                imageHTML = `
                    <div class="article-card-thumbnail">
                        <img src="${article.imageUrl}" alt="${article.title}" loading="lazy">
                    </div>
                `;
            }
        }
        
        return `
            <article class="article-card ${cardClass}" data-article-id="${article.id}">
                ${imageHTML}
                <div class="article-card-content ${contentClass}">
                    <span class="article-category">${getCategoryName(article.category)}</span>
                    <h3 class="article-card-title">${highlightedTitle}</h3>
                    <p class="article-card-excerpt">${article.excerpt}</p>
                    <div class="article-card-meta">
                        <span class="article-author">✍️ ${article.author}</span>
                        <span class="article-date">📅 ${formatDate(article.date)}</span>
                    </div>
                    <a href="article.html?id=${article.id}" class="article-read-more">Прочети повече →</a>
                </div>
            </article>
        `;
    }).join('');
    
    // Add/remove search-results class
    if (searchTerm) {
        container.parentElement.classList.add('search-results');
    } else {
        container.parentElement.classList.remove('search-results');
    }
    
    // Update results info with search context
    if (searchTerm) {
        resultsInfo.textContent = `Намерени ${articles.length} статии за "${searchTerm}"`;
    } else if (articles === initialArticles) {
        resultsInfo.textContent = `Показване на най-новите ${articles.length} статии`;
    } else {
        resultsInfo.textContent = `Показване на ${articles.length} статии`;
    }
}
// <-- THIS WAS MISSING!

// Helper functions
function getCategoryName(category) {
    const categories = {
        'news': 'Новини',
        'interview': 'Интервю',
        'opinion': 'Мнение',
        'culture': 'Култура'
    };
    return categories[category] || category;
}

function formatDate(dateString) {
    try {
        return new Date(dateString).toLocaleDateString('bg-BG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return 'Невалидна дата';
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special regex characters
}

// Search functionality with debouncing and advanced features
function setupSearch() {
    const searchInput = document.getElementById('articleSearch');
    const clearButton = document.getElementById('clearSearch');
    let searchTimeout;
    
    // Debounced search (waits 300ms after user stops typing)
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(this.value);
        }, 300);
    });
    
    // Keyboard shortcuts
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            performSearch('');
            this.blur(); // Remove focus
        }
        if (e.key === 'Enter') {
            // Force immediate search on Enter
            clearTimeout(searchTimeout);
            performSearch(this.value);
        }
    });
    
    // Clear search button
    clearButton.addEventListener('click', function() {
        searchInput.value = '';
        performSearch('');
        searchInput.focus();
    });
    
    // Function to perform the search
    function performSearch(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        if (term === '') {
            // When clearing search, show initial articles WITH IMAGES
            displayArticles(initialArticles, '', true);
            clearButton.style.display = 'none';
            return;
        }
        
        clearButton.style.display = 'block';
        
        // Search in both title AND content for better results
        const filteredArticles = allArticles.filter(article => {
            const inTitle = article.title.toLowerCase().includes(term);
            const inContent = article.content ? article.content.toLowerCase().includes(term) : false;
            const inExcerpt = article.excerpt ? article.excerpt.toLowerCase().includes(term) : false;
            return inTitle || inContent || inExcerpt;
        });
        
        // Show search results WITH THUMBNAIL IMAGES
        displayArticles(filteredArticles, term, false);
    }
}

// Optional: Search suggestions feature
function setupSearchSuggestions() {
    const searchInput = document.getElementById('articleSearch');
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'search-suggestions';
    searchInput.parentNode.appendChild(suggestionsContainer);
    
    searchInput.addEventListener('input', function() {
        const term = this.value.toLowerCase().trim();
        
        if (term.length < 2) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        
        // Get matching articles for suggestions
        const suggestions = allArticles.filter(article => 
            article.title.toLowerCase().includes(term) ||
            (article.excerpt && article.excerpt.toLowerCase().includes(term))
        ).slice(0, 5); // Show top 5 suggestions
        
        if (suggestions.length === 0) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        
        // Display suggestions with highlighted matches
        suggestionsContainer.innerHTML = suggestions.map(article => {
            // Highlight matching text in suggestions
            let highlightedTitle = article.title;
            let excerptText = article.excerpt ? article.excerpt.substring(0, 80) : '';
            let highlightedExcerpt = excerptText;
            
            if (term) {
                const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
                highlightedTitle = article.title.replace(regex, '<mark>$1</mark>');
                if (excerptText) {
                    highlightedExcerpt = excerptText.replace(regex, '<mark>$1</mark>');
                }
            }
            
            return `
                <div class="suggestion-item" data-id="${article.id}">
                    <div class="suggestion-title">${highlightedTitle}</div>
                    ${excerptText ? `<div class="suggestion-excerpt">${highlightedExcerpt}...</div>` : ''}
                </div>
            `;
        }).join('');
        
        suggestionsContainer.style.display = 'block';
        
        // Add click handlers to suggestions
        suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const articleId = item.dataset.id;
                window.location.href = `article.html?id=${articleId}`;
            });
        });
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });
    
    // Hide suggestions when pressing Escape
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            suggestionsContainer.style.display = 'none';
        }
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for Firebase to initialize
    setTimeout(() => {
        loadAllArticles();
        setupSearch();
        setupSearchSuggestions();
    }, 100);
});
