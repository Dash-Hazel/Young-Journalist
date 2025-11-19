

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
            
            // Display only the initial 6 articles
            displayArticles(initialArticles);
        })
        .catch((error) => {
            console.error('Error loading articles:', error);
        });
}

// Display articles in the grid
function displayArticles(articles) {
    const container = document.getElementById('articlesContainer');
    const resultsInfo = document.getElementById('searchResultsInfo');
    
    if (articles.length === 0) {
        container.innerHTML = '<div class="no-articles">Няма намерени статии</div>';
        resultsInfo.textContent = 'Няма намерени статии, отговарящи на търсенето.';
        return;
    }
    
    container.innerHTML = articles.map(article => `
        <article class="article-card" data-article-id="${article.id}">
            <div class="article-card-content">
                <span class="article-category">${getCategoryName(article.category)}</span>
                <h3 class="article-card-title">${article.title}</h3>
                <p class="article-card-excerpt">${article.excerpt}</p>
                <div class="article-card-meta">
                    <span class="article-author">✍️ ${article.author}</span>
                    <span class="article-date">📅 ${formatDate(article.date)}</span>
                </div>
                <a href="article.html?id=${article.id}" class="article-read-more">Прочети повече →</a>
            </div>
        </article>
    `).join('');
    
    // Update results info
    if (articles === initialArticles) {
        resultsInfo.textContent = `Показване на най-новите ${articles.length} статии`;
    } else {
        resultsInfo.textContent = `Намерени ${articles.length} статии`;
    }
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('articleSearch');
    const clearButton = document.getElementById('clearSearch');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            // Show only initial 6 articles when search is cleared
            displayArticles(initialArticles);
            clearButton.style.display = 'none';
        } else {
            clearButton.style.display = 'block';
            // Filter articles by title containing search term
            const filteredArticles = allArticles.filter(article => 
                article.title.toLowerCase().includes(searchTerm)
            );
            // Show ONLY the matching articles (not all)
            displayArticles(filteredArticles);
        }
    });
    
    // Clear search
    clearButton.addEventListener('click', function() {
        searchInput.value = '';
        displayArticles(initialArticles); // Back to initial 6
        this.style.display = 'none';
        searchInput.focus();
    });
}

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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadAllArticles();
    setupSearch();
});


