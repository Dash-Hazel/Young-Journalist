// ========== PUBLIC CALENDAR - ENHANCED VERSION ========== //
/*
document.addEventListener('DOMContentLoaded', function() {
    console.log('Public calendar loading...');
    loadPublicEvents();
});

function loadPublicEvents() {
    console.log('Loading public events from Firebase...');
    
    const eventsContainer = document.getElementById('publicEventsList');
    if (!eventsContainer) {
        console.error('publicEventsList container not found!');
        return;
    }
    
    // Show loading
    eventsContainer.innerHTML = `
        <div class="calendar-loading">
            <div class="loading-spinner"></div>
            <p>Зареждане на събитията...</p>
        </div>
    `;
    
    // Load events from Firebase
    db.ref('events').orderByChild('timestamp').once('value')
        .then((snapshot) => {
            console.log('Firebase events snapshot received');
            eventsContainer.innerHTML = '';
            
            if (!snapshot.exists()) {
                showNoEventsMessage(eventsContainer, 'empty');
                return;
            }
            
            const now = new Date().getTime();
            let hasUpcomingEvents = false;
            
            snapshot.forEach((childSnapshot) => {
                const event = childSnapshot.val();
                const eventId = childSnapshot.key;
                const eventDate = new Date(event.timestamp);
                
                console.log('Event found:', event.title, 'Date:', eventDate);
                
                // FIX: Only show FUTURE events (not past)
                // Add 24 hours buffer to show events from today and tomorrow
                const tomorrow = new Date(now + (24 * 60 * 60 * 1000));
                
                if (eventDate.getTime() >= now) { // FUTURE events only
                    hasUpcomingEvents = true;
                    const eventCard = createPublicEventCard(event, eventDate, eventId);
                    eventsContainer.appendChild(eventCard);
                }
            });
            
            if (!hasUpcomingEvents) {
                showNoEventsMessage(eventsContainer, 'no-upcoming');
                return;
            }
            
            // Add animations
            setTimeout(() => {
                const cards = eventsContainer.querySelectorAll('.public-event-card');
                cards.forEach((card, index) => {
                    card.style.animationDelay = `${index * 0.1}s`;
                    card.classList.add('fade-in');
                });
            }, 100);
            
        })
        .catch((error) => {
            console.error('Error loading public events:', error);
            eventsContainer.innerHTML = `
                <div class="calendar-error">
                    <div class="error-icon">⚠️</div>
                    <h3>Грешка при зареждане</h3>
                    <p>${error.message}</p>
                    <button onclick="loadPublicEvents()" class="btn-retry">🔄 Опитай отново</button>
                </div>
            `;
        });
}

function createPublicEventCard(event, eventDate, eventId) {
    const eventDiv = document.createElement('div');
    
    const isToday = eventDate.toDateString() === new Date().toDateString();
    const isUpcoming = eventDate.getTime() > new Date().getTime();
    
    eventDiv.className = `public-event-card ${isToday ? 'today' : isUpcoming ? 'upcoming' : ''}`;
    
    // Format date nicely
    const dateString = isToday ? 
        `🎯 Днес • ${eventDate.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}` :
        eventDate.toLocaleDateString('bg-BG', { 
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
    
    eventDiv.innerHTML = `
        <div class="public-event-date">
            <strong>${dateString}</strong>
        </div>
        <h3 class="public-event-title">${event.title}</h3>
        ${event.description ? `<p class="public-event-description">${event.description}</p>` : ''}
        <div class="public-event-details">
            <p class="public-event-location">📍 ${event.location}</p>
            ${event.organizer ? `<p class="public-event-organizer">👤 Организатор: ${event.organizer}</p>` : ''}
        </div>
    `;
    
    return eventDiv;
}

function showNoEventsMessage(container, type) {
    const messages = {
        'empty': `
            <div class="no-events-message">
                <div class="empty-calendar-icon">📅</div>
                <h3>Все още няма събития</h3>
                <p>Календарът е празен. Провери отново скоро за актуализации!</p>
                <div class="suggestion">
                    <p><strong>Съвет:</strong> Следващото събирание на клуба е всеки вторник в 15:00</p>
                </div>
            </div>
        `,
        'no-upcoming': `
            <div class="no-events-message">
                <div class="calendar-icon">⏳</div>
                <h3>Няма предстоящи събития</h3>
                <p>Всички събития вече са изминали.</p>
                <p>Следващото събирание ще бъде обявено скоро!</p>
            </div>
        `
    };
    
    container.innerHTML = messages[type] || messages['empty'];
}

// Auto-refresh every 5 minutes
setInterval(() => {
    console.log('Auto-refreshing calendar...');
    loadPublicEvents();
}, 5 * 60 * 1000);

// Export function for manual refresh
window.refreshCalendar = loadPublicEvents;
*/

/*
// ========== PUBLIC CALENDAR - VISUAL DEBUG VERSION ========== //
console.log('📅 Public calendar script LOADED');

// Make function globally available
window.loadPublicEvents = loadPublicEvents;

function loadPublicEvents() {
    console.log('🔄 Loading public events...');
    
    const eventsContainer = document.getElementById('publicEventsList');
    if (!eventsContainer) {
        console.error('❌ ERROR: publicEventsList element NOT FOUND!');
        console.log('Searching for calendar section...', document.querySelector('#calendar'));
        return;
    }
    
    console.log('✅ Found events container:', eventsContainer);
    
    // Show VISUAL loading state
    eventsContainer.innerHTML = `
        <div class="calendar-loading">
            <div class="loading-spinner"></div>
            <p>Зареждане на събитията...</p>
            <small style="color: #666; font-size: 12px;">Изчакайте...</small>
        </div>
    `;
    
    // Check if Firebase is available
    if (typeof db === 'undefined') {
        console.error('❌ Firebase db is undefined!');
        showError(eventsContainer, 'Firebase не е зареден. Презаредете страницата.');
        return;
    }
    
    console.log('✅ Firebase db is available');
    
    // Load from Firebase
    db.ref('events').orderByChild('timestamp').once('value')
        .then((snapshot) => {
            console.log('📊 Firebase response:', snapshot.exists() ? 'HAS DATA' : 'NO DATA');
            
            eventsContainer.innerHTML = '';
            
            if (!snapshot.exists()) {
                console.log('ℹ️ No events in database');
                showNoEvents(eventsContainer, 'empty');
                return;
            }
            
            const now = new Date().getTime();
            let upcomingCount = 0;
            let pastCount = 0;
            let eventsHTML = '';
            
            snapshot.forEach((childSnapshot) => {
                const event = childSnapshot.val();
                const eventId = childSnapshot.key;
                const eventDate = new Date(event.timestamp);
                
                console.log(`📅 Event: "${event.title}" at ${eventDate}`);
                
                // Check if event is in the future
                if (eventDate.getTime() >= now) {
                    upcomingCount++;
                    eventsHTML += createEventCardHTML(event, eventDate, eventId);
                } else {
                    pastCount++;
                }
            });
            
            console.log(`📈 Stats: ${upcomingCount} upcoming, ${pastCount} past events`);
            
            if (upcomingCount === 0) {
                showNoEvents(eventsContainer, 'no-upcoming');
                return;
            }
            
            // Add counter header
            const counterHTML = `
                <div class="events-counter">
                    <span class="counter-badge">${upcomingCount}</span>
                    <span class="counter-text">предстоящи събития</span>
                </div>
            `;
            
            eventsContainer.innerHTML = counterHTML + eventsHTML;
            
            // Animate cards
            setTimeout(() => {
                document.querySelectorAll('.public-event-card').forEach((card, index) => {
                    card.style.animationDelay = `${index * 0.1}s`;
                    card.classList.add('visible');
                });
            }, 100);
            
            console.log('🎉 Calendar loaded successfully!');
            
        })
        .catch((error) => {
            console.error('❌ Firebase error:', error);
            showError(eventsContainer, `Грешка: ${error.message}`);
        });
}

function createEventCardHTML(event, eventDate, eventId) {
    const isToday = eventDate.toDateString() === new Date().toDateString();
    const isTomorrow = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000).toDateString() === new Date().toDateString();
    
    let dateBadge = '';
    if (isToday) {
        dateBadge = '<span class="date-badge today">ДНЕС</span>';
    } else if (isTomorrow) {
        dateBadge = '<span class="date-badge tomorrow">УТРЕ</span>';
    }
    
    const dateString = eventDate.toLocaleDateString('bg-BG', { 
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    return `
        <div class="public-event-card ${isToday ? 'today' : ''}">
            ${dateBadge}
            <div class="event-date">${dateString}</div>
            <h3 class="event-title">${event.title}</h3>
            ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
            <div class="event-details">
                <div class="event-location">📍 ${event.location}</div>
                ${event.organizer ? `<div class="event-organizer">👤 ${event.organizer}</div>` : ''}
            </div>
            <div class="event-debug">
                <small>ID: ${eventId.substring(0, 8)}...</small>
            </div>
        </div>
    `;
}

function showNoEvents(container, type) {
    const messages = {
        'empty': `
            <div class="no-events-card">
                <div class="no-events-icon">📅</div>
                <h3>Все още няма събития</h3>
                <p>Календарът е празен. Провери отново скоро!</p>
                <div class="suggestion">
                    <p><strong>💡 Съвет:</strong> Добавете първото си събитие от админ панела.</p>
                </div>
            </div>
        `,
        'no-upcoming': `
            <div class="no-events-card">
                <div class="no-events-icon">⏳</div>
                <h3>Няма предстоящи събития</h3>
                <p>Всички събития са изминали.</p>
                <div class="upcoming-hint">
                    <p>🎯 <strong>Следващо събирание:</strong> Всеки вторник в 15:00</p>
                </div>
                <button onclick="addTestEvent()" class="btn-test">➕ Добави тестово събитие</button>
            </div>
        `
    };
    
    container.innerHTML = messages[type] || messages['empty'];
}

function showError(container, message) {
    container.innerHTML = `
        <div class="error-card">
            <div class="error-icon">⚠️</div>
            <h3>Грешка при зареждане</h3>
            <p>${message}</p>
            <button onclick="loadPublicEvents()" class="btn-retry">🔄 Опитай отново</button>
        </div>
    `;
}

// Helper function to add test event
window.addTestEvent = function() {
    const testEvent = {
        title: "🎯 Тестово събитие",
        description: "Това е тестово събитие за проверка на календара.",
        location: "Кабинет 203",
        timestamp: new Date().getTime() + (2 * 60 * 60 * 1000), // 2 часа от сега
        organizer: "Администратор"
    };
    
    db.ref('events').push(testEvent)
        .then(() => {
            alert('✅ Тестово събитие добавено!');
            loadPublicEvents();
        })
        .catch(error => {
            alert('❌ Грешка: ' + error.message);
        });
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('📅 Calendar DOM ready');
    // Wait a bit for Firebase
    setTimeout(loadPublicEvents, 1000);
});

// Auto-refresh every 30 seconds
setInterval(loadPublicEvents, 30000);
*/

// ========== CALENDAR - TIMELINE DESIGN ========== //
console.log('📅 Timeline calendar loaded');

window.loadPublicEvents = loadPublicEvents;

function loadPublicEvents() {
    const container = document.getElementById('publicEventsList');
    if (!container) return;
    
    container.innerHTML = '<div class="timeline-loading">Зареждане на графика...</div>';
    
    if (typeof db === 'undefined') {
        container.innerHTML = '<div class="timeline-error">❌ Базата данни не е достъпна</div>';
        return;
    }
    
    db.ref('events').orderByChild('timestamp').once('value')
        .then((snapshot) => {
            container.innerHTML = '';
            
            if (!snapshot.exists()) {
                container.innerHTML = `
                    <div class="timeline-empty">
                        <div class="timeline-line"></div>
                        <div class="timeline-node">
                            <div class="node-dot"></div>
                            <div class="node-content">
                                <h4>Първо събитие</h4>
                                <p>Добавете първото си събитие!</p>
                            </div>
                        </div>
                    </div>
                `;
                return;
            }
            
            const now = new Date().getTime();
            let eventsHTML = '';
            let hasFuture = false;
            
            snapshot.forEach((childSnapshot) => {
                const event = childSnapshot.val();
                const eventDate = new Date(event.timestamp);
                
                if (eventDate.getTime() >= now) {
                    hasFuture = true;
                    eventsHTML += createTimelineItem(event, eventDate);
                }
            });
            
            if (!hasFuture) {
                container.innerHTML = `
                    <div class="timeline-empty">
                        <div class="timeline-line"></div>
                        <div class="timeline-node">
                            <div class="node-dot future"></div>
                            <div class="node-content">
                                <h4>Следващо събирание</h4>
                                <p>Всеки вторник в 15:00</p>
                            </div>
                        </div>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = `
                <div class="timeline-container">
                    <div class="timeline-line"></div>
                    ${eventsHTML}
                </div>
            `;
            
        })
        .catch((error) => {
            container.innerHTML = '<div class="timeline-error">⚠️ Грешка при зареждане</div>';
        });
}

function createTimelineItem(event, eventDate) {
    const isToday = eventDate.toDateString() === new Date().toDateString();
    const daysUntil = Math.ceil((eventDate - new Date()) / (86400000));
    
    let nodeClass = 'future';
    if (isToday) nodeClass = 'today';
    else if (daysUntil <= 3) nodeClass = 'soon';
    
    return `
        <div class="timeline-node ${nodeClass}">
            <div class="node-dot ${nodeClass}"></div>
            <div class="node-content">
                <div class="node-date">
                    ${eventDate.toLocaleDateString('bg-BG', { weekday: 'short', day: 'numeric', month: 'short' })}
                    <span class="node-time">${eventDate.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <h4>${event.title}</h4>
                <p class="node-location">📍 ${event.location}</p>
                ${event.description ? `<p class="node-desc">${event.description}</p>` : ''}
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', loadPublicEvents);
