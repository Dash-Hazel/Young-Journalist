// Article page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get article ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    
    // Category names in Bulgarian
    const categoryNames = {
        'news': 'Новини',
        'interview': 'Интервю',
        'opinion': 'Мнение',
        'culture': 'Култура'
    };
    
    if (articleId) {
        loadArticle(articleId, categoryNames);
    } else {
        showError('Невалидна статия');
    }
});

function loadArticle(articleId, categoryNames) {
    // Show loading state
    document.getElementById('articleContent').innerHTML = 
        '<div class="loading">Зареждане на статията...</div>';
    
    db.ref('articles/' + articleId).once('value')
        .then((snapshot) => {
            const article = snapshot.val();
            if (article) {
                displayArticle(article, categoryNames);
            } else {
                showError('Статията не е намерена');
            }
        })
        .catch((error) => {
            console.error('Error loading article:', error);
            showError('Грешка при зареждане на статията');
        });
}

function displayArticle(article, categoryNames) {
    // Update page title
    document.title = `${article.title} - Млад Журналист`;
    
    const categoryName = categoryNames[article.category] || article.category;
    const formattedDate = new Date(article.date).toLocaleDateString('bg-BG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // SAFE image checking - handles missing imageUrl field
    let imageHTML = '';
    if (article.imageUrl && article.imageUrl.trim() !== '') {
        imageHTML = `
            <div class="article-image">
                <img src="${article.imageUrl}" alt="${article.title}" />
            </div>
            <div class="article-image">
                <img src="${article.imageUrl}" alt="${article.title}" />
            </div>
            <div class="article-image">
                <img src="${article.imageUrl}" alt="${article.title}" />
            </div>
            <div class="article-image">
                <img src="${article.imageUrl}" alt="${article.title}" />
            </div>
            <div class="article-image">
                <img src="${article.imageUrl}" alt="${article.title}" />
            </div>
            <div class="article-image">
                <img src="${article.imageUrl}" alt="${article.title}" />
            </div>
            <div class="article-image">
                <img src="${article.imageUrl}" alt="${article.title}" />
            </div>
            <div class="article-image">
                <img src="${article.imageUrl}" alt="${article.title}" />
            </div>
            <div class="article-image">
                <img src="${article.imageUrl}" alt="${article.title}" />
            </div>
            <div class="article-image">
                <img src="${article.imageUrl}" alt="${article.title}" />
            </div>
        `;
    }
    
    document.getElementById('articleContent').innerHTML = `
        <div class="article-header">
            <h1 class="article-title">${article.title}</h1>
            <div class="article-meta">
                <span>✍️ ${article.author}</span>
                <span>📅 ${formattedDate}</span>
                <span>🏷️ ${categoryName}</span>
            </div>
        </div>
        ${imageHTML}
        <div class="article-body">
            ${formatArticleContent(article.content)}
        </div>
    `;
}

function formatArticleContent(content) {
    if (!content) return '<p>Съдържанието не е налично.</p>';
    
    return content
        .split('\n')
        .filter(paragraph => paragraph.trim())
        .map(paragraph => `<p>${paragraph}</p>`)
        .join('');
}

function showError(message) {
    document.getElementById('articleContent').innerHTML = 
        `<div class="error-message">${message}</div>`;

}
