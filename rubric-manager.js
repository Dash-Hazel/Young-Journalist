// ========== RUBRIC MANAGER ========== //
// Manages rubrics and filters articles by rubric

console.log('rubric-manager.js loading...');

// Rubric definitions
const RUBRICS = {
    recipes: {
        id: 'recipes',
        name: '🍽️ Рецепти',
        description: 'Вкусни рецепти и кулинарни съвети от младите готвачи',
        icon: '🍽️',
        color1: '#FF6B6B',
        color2: '#FF8E53'
    },
    interesting: {
        id: 'interesting',
        name: '🔍 Интересно',
        description: 'Любопитни факти, необичайни истории и занимателни материали',
        icon: '🔍',
        color1: '#4ECDC4',
        color2: '#44A08D'
    },
    jokes: {
        id: 'jokes',
        name: '😂 Шеги',
        description: 'Смешни вицове, анекдоти и забавни ситуации от училищния живот',
        icon: '😂',
        color1: '#FFD166',
        color2: '#FFB347'
    }
};

// Global variables
let allArticles = [];
let currentRubric = null;
let displayedArticles = [];
const ARTICLES_PER_PAGE = 6;
let currentPage = 1;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing rubric manager...');
    
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined' || typeof db === 'undefined') {
        showError('Firebase не е зареден. Моля, презаредете страницата.');
        return;
    }
    
    // Load all articles first
    loadAllArticles().then(() => {
        // Then load rubrics with counts
        loadRubrics();
        
        // Set up event listeners
        setupEventListeners();
    }).catch(error => {
        console.error('Error loading articles:', error);
        showError('Грешка при зареждане на статиите. Моля, опитайте отново.');
    });
});

// Load all articles from Firebase
async function loadAllArticles() {
    return new Promise((resolve, reject) => {
        console.log('Loading articles for rubrics...');
        
        db.ref('articles').once('value')
            .then((snapshot) => {
                allArticles = [];
                snapshot.forEach((childSnapshot) => {
                    const article = childSnapshot.val();
                    article.id = childSnapshot.key;
                    allArticles.push(article);
                });
                
                console.log(`Loaded ${allArticles.length} articles for rubrics`);
                resolve();
            })
            .catch((error) => {
                console.error('Error loading articles:', error);
                reject(error);
            });
    });
}

// Load and display rubrics with article counts
function loadRubrics() {
    const container = document.getElementById('rubricsContainer');
    if (!container) return;
    
    // Clear loading state
    container.innerHTML = '';
    
    // Create rubric cards
    Object.values(RUBRICS).forEach(rubric => {
        // Count articles in this rubric
        const articleCount = countArticlesInRubric(rubric.id);
        
        const rubricCard = document.createElement('div');
        rubricCard.className = 'rubric-card';
        rubricCard.dataset.rubricId = rubric.id;
        
        rubricCard.innerHTML = `
            <div class="rubric-icon" style="--color1: ${rubric.color1}; --color2: ${rubric.color2};">
                ${rubric.icon}
            </div>
            <div class="rubric-content">
                <h3>${rubric.name}</h3>
                <p class="rubric-description">${rubric.description}</p>
                <div class="rubric-stats">
                    <span class="article-count">${articleCount} статии</span>
                    <a href="#" class="rubric-action" data-rubric-id="${rubric.id}">
                        Виж всички →
                    </a>
                </div>
            </div>
        `;
        
        container.appendChild(rubricCard);
        
        // Add click event
        rubricCard.addEventListener('click', function(e) {
            if (!e.target.classList.contains('rubric-action')) {
                showRubricArticles(rubric.id);
            }
        });
    });
}

// Count articles in a specific rubric
function countArticlesInRubric(rubricId) {
    return allArticles.filter(article => {
        // Check both category and rubric fields for compatibility
        return article.rubric === rubricId || article.category === rubricId;
    }).length;
}

// Show articles for a specific rubric
function showRubricArticles(rubricId) {
    currentRubric = RUBRICS[rubricId];
    currentPage = 1;
    
    // Show rubric header
    const header = document.getElementById('rubricHeader');
    const title = document.getElementById('rubricTitle');
    const description = document.getElementById('rubricDescription');
    
    title.textContent = currentRubric.name;
    description.textContent = currentRubric.description;
    header.style.display = 'block';
    
    // Update URL (optional - for sharing)
    history.pushState({ rubric: rubricId }, '', `?rubric=${rubricId}`);
    
    // Filter articles for this rubric
    displayedArticles = allArticles.filter(article => {
        return article.rubric === rubricId || article.category === rubricId;
    });
    
    // Sort by date (newest first)
    displayedArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Show article count
    const countElement = document.getElementById('articlesCount');
    const countNumber = document.getElementById('articlesCountNumber');
    
    countNumber.textContent = displayedArticles.length;
    countElement.style.display = 'block';
    
    // Display first page of articles
    displayRubricArticles();
    
    // Show/hide load more button
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    if (displayedArticles.length > ARTICLES_PER_PAGE) {
        loadMoreContainer.style.display = 'block';
    } else {
        loadMoreContainer.style.display = 'none';
    }
    
    // Scroll to articles section
    document.querySelector('.rubric-articles-section').scrollIntoView({
        behavior: 'smooth'
    });
}

// Display articles for current rubric (paginated)
function displayRubricArticles() {
    const container = document.getElementById('rubricArticlesContainer');
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    if (displayedArticles.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <h3>Няма статии в тази рубрика</h3>
                <p>Все още няма публикувани статии в тази категория</p>
            </div>
        `;
        return;
    }
    
    // Calculate which articles to show
    const startIndex = 0;
    const endIndex = Math.min(currentPage * ARTICLES_PER_PAGE, displayedArticles.length);
    const articlesToShow = displayedArticles.slice(startIndex, endIndex);
    
    // Create article cards
    articlesToShow.forEach(article => {
        const articleCard = document.createElement('article');
        articleCard.className = 'article-card scroll-animate';
        
        // Format date
        const articleDate = formatRubricDate(article.date);
        
        // Create excerpt if not present
        const excerpt = article.excerpt || 
                       (article.content ? 
                        article.content.substring(0, 150) + '...' : 
                        '');
        
        articleCard.innerHTML = `
            ${article.imageUrl ? `
            <div class="article-image">
                <img src="${article.imageUrl}" alt="${article.title}" loading="lazy">
            </div>
            ` : ''}
            <div class="article-content">
                <h3>${article.title}</h3>
                <p class="article-excerpt">${excerpt}</p>
                <div class="article-meta">
                    <span class="article-author">✍️ ${article.author}</span>
                    <span class="article-date">📅 ${articleDate}</span>
                </div>
                <a href="article.html?id=${article.id}" class="read-more">Прочети повече →</a>
            </div>
        `;
        
        container.appendChild(articleCard);
    });
    
    // Trigger animations
    setTimeout(() => {
        container.querySelectorAll('.article-card').forEach(card => {
            card.classList.add('visible');
        });
    }, 100);
}

// Load more articles
function loadMoreArticles() {
    currentPage++;
    displayRubricArticles();
    
    // Hide load more button if all articles are shown
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (currentPage * ARTICLES_PER_PAGE >= displayedArticles.length) {
        loadMoreBtn.style.display = 'none';
    }
}

// Format date for rubric articles
function formatRubricDate(dateString) {
    try {
        return new Date(dateString).toLocaleDateString('bg-BG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Невалидна дата';
    }
}

// Set up event listeners
function setupEventListeners() {
    // Load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreArticles);
    }
    
    // Back to rubrics button
    const backBtn = document.getElementById('backToRubrics');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            currentRubric = null;
            displayedArticles = [];
            
            document.getElementById('rubricHeader').style.display = 'none';
            document.getElementById('articlesCount').style.display = 'none';
            document.getElementById('loadMoreContainer').style.display = 'none';
            
            // Reset URL
            history.pushState({}, '', 'rubric.html');
            
            // Show empty state
            const container = document.getElementById('rubricArticlesContainer');
            container.innerHTML = `
                <div class="empty-state" id="emptyState">
                    <div class="empty-icon">📚</div>
                    <h3>Изберете рубрика</h3>
                    <p>Изберете рубрика отгоре, за да видите статиите в нея</p>
                </div>
            `;
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Check URL for rubric parameter
    const urlParams = new URLSearchParams(window.location.search);
    const rubricParam = urlParams.get('rubric');
    
    if (rubricParam && RUBRICS[rubricParam]) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            showRubricArticles(rubricParam);
        }, 300);
    }
}

// Show error message
function showError(message) {
    const container = document.getElementById('rubricsContainer');
    if (container) {
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>Грешка</h3>
                <p>${message}</p>
                <button onclick="window.location.reload()" class="btn btn-primary">
                    Опитай отново
                </button>
            </div>
        `;
    }
}

// Make functions available globally for debugging
window.RubricManager = {
    showRubricArticles,
    loadRubrics,
    countArticlesInRubric
};