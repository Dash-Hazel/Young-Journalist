// ========== SEPARATE RUBRIC MANAGER FOR ADMIN ========== //
// For Recipes, Interesting, Jokes - NOT mixed with articles

class AdminRubricManager {
    constructor() {
        this.rubricTypes = {
            recipes: {
                name: '🍽️ Рецепти',
                icon: '🍽️',
                color: '#FF6B6B',
                description: 'Вкусни рецепти и кулинарни съвети',
                collection: 'rubrics'
            },
            interesting: {
                name: '🔍 Интересно',
                icon: '🔍',
                color: '#4ECDC4',
                description: 'Любопитни факти и истории',
                collection: 'rubrics'
            },
            jokes: {
                name: '😂 Шеги',
                icon: '😂',
                color: '#FFD166',
                description: 'Смешни вицове и анекдоти',
                collection: 'rubrics'
            }
        };
        
        this.init();
    }
    
    init() {
        this.addRubricSectionToAdmin();
        this.setupEventListeners();
        this.loadRubricStats();
    }
    
    // Add separate rubric section to admin
    addRubricSectionToAdmin() {
        const adminContainer = document.querySelector('.container');
        if (!adminContainer) return;
        
        const rubricHTML = `
            <section class="admin-section" style="margin-top: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 15px; overflow: hidden;">
                <div style="padding: 30px;">
                    <h2 style="margin-top: 0; color: white;">🎪 Рубрики (Забавно съдържание)</h2>
                    <p style="opacity: 0.9; margin-bottom: 25px;">
                        Тук публикувайте забавно съдържание, което НЕ е журналистическа статия.
                        Това са отделни от редовните статии.
                    </p>
                    
                    <!-- Rubric Type Selector -->
                    <div class="rubric-type-selector" style="margin-bottom: 30px;">
                        <h4 style="color: white; margin-bottom: 15px;">Избери тип рубрика:</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            ${Object.entries(this.rubricTypes).map(([id, rubric]) => `
                                <button class="rubric-type-btn" data-rubric-type="${id}" 
                                        style="background: white; border: none; border-radius: 10px; padding: 20px; 
                                               text-align: center; cursor: pointer; transition: all 0.3s;">
                                    <div style="font-size: 2.5rem; margin-bottom: 10px;">${rubric.icon}</div>
                                    <div style="font-weight: 600; color: ${rubric.color}; margin-bottom: 5px;">
                                        ${rubric.name}
                                    </div>
                                    <div style="font-size: 0.85rem; color: #666;">
                                        ${rubric.description}
                                    </div>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Rubric Form (Hidden by default) -->
                    <div id="rubricFormContainer" style="display: none; background: rgba(255,255,255,0.1); padding: 25px; border-radius: 10px; margin-top: 20px;">
                        <h3 id="rubricFormTitle" style="color: white;">Добавяне на рубрика</h3>
                        
                        <form id="rubricForm" style="margin-top: 20px;">
                            <input type="hidden" id="rubricType" value="">
                            
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; color: white;">Заглавие *</label>
                                <input type="text" id="rubricTitle" required 
                                       style="width: 100%; padding: 12px; border: 2px solid rgba(255,255,255,0.3); 
                                              border-radius: 8px; background: rgba(255,255,255,0.1); color: white;">
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; color: white;">Съдържание *</label>
                                <textarea id="rubricContent" rows="6" required 
                                          style="width: 100%; padding: 12px; border: 2px solid rgba(255,255,255,0.3); 
                                                 border-radius: 8px; background: rgba(255,255,255,0.1); color: white;"></textarea>
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; color: white;">
                                    Снимка (URL) - по желание
                                </label>
                                <input type="url" id="rubricImage" 
                                       style="width: 100%; padding: 12px; border: 2px solid rgba(255,255,255,0.3); 
                                              border-radius: 8px; background: rgba(255,255,255,0.1); color: white;">
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; color: white;">Автор *</label>
                                <input type="text" id="rubricAuthor" required 
                                       style="width: 100%; padding: 12px; border: 2px solid rgba(255,255,255,0.3); 
                                              border-radius: 8px; background: rgba(255,255,255,0.1); color: white;">
                            </div>
                            
                            <div style="display: flex; gap: 15px; margin-top: 25px;">
                                <button type="submit" class="btn" 
                                        style="background: white; color: #764ba2; border: none; padding: 12px 30px; 
                                               font-weight: 600; border-radius: 8px; cursor: pointer;">
                                    Публикувай в рубриката
                                </button>
                                <button type="button" id="cancelRubricBtn" class="btn" 
                                        style="background: transparent; color: white; border: 2px solid rgba(255,255,255,0.5); 
                                               padding: 12px 30px; border-radius: 8px; cursor: pointer;">
                                    Отказ
                                </button>
                            </div>
                        </form>
                        
                        <div id="rubricMessage" style="margin-top: 20px;"></div>
                    </div>
                    
                    <!-- Recent Rubrics -->
                    <div id="recentRubricsContainer" style="margin-top: 40px;">
                        <h4 style="color: white;">Последно добавени:</h4>
                        <div id="recentRubricsList" style="margin-top: 15px;">
                            <div style="text-align: center; padding: 30px; color: rgba(255,255,255,0.7);">
                                <div style="font-size: 3rem; margin-bottom: 10px;">📭</div>
                                Все още няма публикувани рубрики
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Stats Section -->
            <section id="rubricStatsSection" style="margin-top: 30px; padding: 30px; background: #f8f9fa; border-radius: 15px;">
                <h3>📊 Статистика на рубриките</h3>
                <div id="rubricStatsContent">
                    Зареждане на статистика...
                </div>
            </section>
        `;
        
        // Insert after calendar section
        const calendarSection = document.querySelector('.admin-section:last-of-type');
        if (calendarSection) {
            calendarSection.insertAdjacentHTML('afterend', rubricHTML);
        } else {
            adminContainer.insertAdjacentHTML('beforeend', rubricHTML);
        }
    }
    
    setupEventListeners() {
        // Rubric type buttons
        document.querySelectorAll('.rubric-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rubricType = e.currentTarget.dataset.rubricType;
                this.showRubricForm(rubricType);
            });
        });
        
        // Cancel button
        document.getElementById('cancelRubricBtn')?.addEventListener('click', () => {
            this.hideRubricForm();
        });
        
        // Form submission
        const rubricForm = document.getElementById('rubricForm');
        if (rubricForm) {
            rubricForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveRubric();
            });
        }
    }
    
    showRubricForm(rubricType) {
        const rubric = this.rubricTypes[rubricType];
        if (!rubric) return;
        
        // Update form title
        document.getElementById('rubricFormTitle').textContent = `Добавяне на ${rubric.name.toLowerCase()}`;
        document.getElementById('rubricType').value = rubricType;
        
        // Show form
        document.getElementById('rubricFormContainer').style.display = 'block';
        
        // Scroll to form
        document.getElementById('rubricFormContainer').scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
        });
    }
    
    hideRubricForm() {
        document.getElementById('rubricFormContainer').style.display = 'none';
        document.getElementById('rubricForm').reset();
        document.getElementById('rubricMessage').innerHTML = '';
    }
    
    async saveRubric() {
        const rubricType = document.getElementById('rubricType').value;
        const title = document.getElementById('rubricTitle').value.trim();
        const content = document.getElementById('rubricContent').value.trim();
        const author = document.getElementById('rubricAuthor').value.trim();
        const imageUrl = document.getElementById('rubricImage').value.trim();
        
        if (!title || !content || !author) {
            this.showRubricMessage('Моля, попълнете всички задължителни полета', 'error');
            return;
        }
        
        const submitBtn = document.querySelector('#rubricForm button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Публикуване...';
        submitBtn.disabled = true;
        
        const rubricData = {
            type: rubricType,
            title: title,
            content: content,
            author: author,
            date: new Date().toISOString(),
            published: true
        };
        
        // Add image if provided
        if (imageUrl) {
            rubricData.imageUrl = imageUrl;
        }
        
        try {
            // Save to separate "rubrics" collection in Firebase
            await db.ref('rubrics').push(rubricData);
            
            this.showRubricMessage(`✅ Успешно публикувано в рубрика "${this.rubricTypes[rubricType].name}"!`, 'success');
            document.getElementById('rubricForm').reset();
            
            // Load recent rubrics
            this.loadRecentRubrics();
            
            // Update stats
            this.loadRubricStats();
            
            // Hide form after 2 seconds
            setTimeout(() => {
                this.hideRubricForm();
            }, 2000);
            
        } catch (error) {
            console.error('Error saving rubric:', error);
            this.showRubricMessage(`❌ Грешка при публикуване: ${error.message}`, 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    showRubricMessage(message, type) {
        const messageDiv = document.getElementById('rubricMessage');
        messageDiv.innerHTML = `
            <div style="padding: 15px; background: ${type === 'success' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)'}; 
                  color: ${type === 'success' ? '#27ae60' : '#e74c3c'}; 
                  border: 1px solid ${type === 'success' ? '#27ae60' : '#e74c3c'};
                  border-radius: 8px;">
                ${message}
            </div>
        `;
    }
    
    async loadRecentRubrics() {
        try {
            const snapshot = await db.ref('rubrics')
                .orderByChild('date')
                .limitToLast(5)
                .once('value');
            
            const recentRubrics = [];
            snapshot.forEach(child => {
                const rubric = child.val();
                rubric.id = child.key;
                recentRubrics.push(rubric);
            });
            
            recentRubrics.reverse(); // Newest first
            
            this.displayRecentRubrics(recentRubrics);
            
        } catch (error) {
            console.error('Error loading recent rubrics:', error);
        }
    }
    
    displayRecentRubrics(rubrics) {
        const container = document.getElementById('recentRubricsList');
        if (!container) return;
        
        if (rubrics.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 30px; color: rgba(255,255,255,0.7);">
                    <div style="font-size: 3rem; margin-bottom: 10px;">📭</div>
                    Все още няма публикувани рубрики
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">
                ${rubrics.map(rubric => {
                    const rubricType = this.rubricTypes[rubric.type];
                    const date = new Date(rubric.date).toLocaleDateString('bg-BG');
                    
                    return `
                        <div style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 20px; 
                             border-left: 4px solid ${rubricType?.color || '#3498db'};">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                <span style="font-size: 1.5rem;">${rubricType?.icon || '📄'}</span>
                                <span style="font-weight: 600; color: white;">${rubric.title}</span>
                            </div>
                            <div style="color: rgba(255,255,255,0.8); font-size: 0.9rem; margin-bottom: 15px;">
                                ${rubric.content.substring(0, 100)}...
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: rgba(255,255,255,0.6);">
                                <span>👤 ${rubric.author}</span>
                                <span>📅 ${date}</span>
                            </div>
                            <div style="margin-top: 10px;">
                                <button onclick="deleteRubric('${rubric.id}')" 
                                        style="background: rgba(231, 76, 60, 0.2); color: #e74c3c; border: none; 
                                               padding: 5px 10px; border-radius: 5px; font-size: 0.85rem; cursor: pointer;">
                                    Изтрий
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    async loadRubricStats() {
        try {
            const snapshot = await db.ref('rubrics').once('value');
            const rubrics = [];
            snapshot.forEach(child => {
                const rubric = child.val();
                rubric.id = child.key;
                rubrics.push(rubric);
            });
            
            this.displayRubricStats(rubrics);
            
        } catch (error) {
            console.error('Error loading rubric stats:', error);
            const container = document.getElementById('rubricStatsContent');
            if (container) {
                container.innerHTML = `<div style="color: #e74c3c;">Грешка при зареждане на статистиката</div>`;
            }
        }
    }
    
    displayRubricStats(rubrics) {
        const container = document.getElementById('rubricStatsContent');
        if (!container) return;
        
        // Count by type
        const counts = {};
        Object.keys(this.rubricTypes).forEach(type => {
            counts[type] = 0;
        });
        
        rubrics.forEach(rubric => {
            if (counts[rubric.type] !== undefined) {
                counts[rubric.type]++;
            }
        });
        
        const total = rubrics.length;
        
        if (total === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div style="font-size: 3rem; margin-bottom: 20px;">📊</div>
                    <p>Все още няма публикувани рубрики</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px;">
                ${Object.entries(this.rubricTypes).map(([typeId, rubric]) => {
                    const count = counts[typeId] || 0;
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                    
                    return `
                        <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
                            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                                <div style="width: 50px; height: 50px; border-radius: 50%; background: ${rubric.color}20; 
                                     color: ${rubric.color}; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                                    ${rubric.icon}
                                </div>
                                <div>
                                    <div style="font-size: 2rem; font-weight: bold; color: ${rubric.color};">${count}</div>
                                    <div style="font-weight: 600; color: #2c3e50;">${rubric.name}</div>
                                </div>
                            </div>
                            <div style="margin-top: 10px;">
                                <div style="height: 8px; background: #eee; border-radius: 4px; overflow: hidden;">
                                    <div style="width: ${percentage}%; height: 100%; background: ${rubric.color}; border-radius: 4px;"></div>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 0.9rem; color: #7f8c8d;">
                                    <span>${percentage}%</span>
                                    <span>${rubric.description}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 2rem; font-weight: bold; color: #3498db;">${total}</div>
                        <div style="color: #7f8c8d;">Общо публикации в рубрики</div>
                    </div>
                    <div style="font-size: 0.9rem; color: #95a5a6;">
                        Последно обновено: ${new Date().toLocaleTimeString('bg-BG')}
                    </div>
                </div>
            </div>
        `;
    }
}

// Global function for delete button
function deleteRubric(rubricId) {
    if (!confirm('Сигурни ли сте, че искате да изтриете тази рубрика?')) return;
    
    db.ref('rubrics/' + rubricId).remove()
        .then(() => {
            alert('Рубриката е изтрита успешно!');
            // Reload recent rubrics
            if (window.adminRubricManager) {
                window.adminRubricManager.loadRecentRubrics();
                window.adminRubricManager.loadRubricStats();
            }
        })
        .catch(error => {
            alert('Грешка при изтриване: ' + error.message);
        });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    window.adminRubricManager = new AdminRubricManager();
});