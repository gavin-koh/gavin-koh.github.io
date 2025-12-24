// 导航栏显示/隐藏逻辑
const headerNav = document.querySelector('.header-nav');

// 初始状态：隐藏圆角矩形
headerNav.classList.remove('visible');

// 主视图导航栏交互
document.addEventListener('DOMContentLoaded', function() {
    const navTabsContainer = document.querySelector('.nav-tabs');
    const allTabs = Array.from(navTabsContainer.querySelectorAll('.nav-tab'));
    const nextBtn = document.getElementById('nav-next');
    const prevBtn = document.getElementById('nav-prev');
    
    let isAnimating = false;
    
    // 隐藏分页按钮
    nextBtn.style.display = 'none';
    prevBtn.style.display = 'none';
    
    // 显示所有标签
    allTabs.forEach(tab => tab.style.display = 'flex');
    
    // 使用事件委托处理标签点击（移动到第二位的逻辑）
    function handleTabMovement(clickedTab) {
        // 如果点击的不是"全部文章"，将其移动到第二个位置
        if (clickedTab.textContent.trim() !== '全部文章') {
            const currentTabs = Array.from(navTabsContainer.querySelectorAll('.nav-tab'));
            const firstTab = currentTabs[0]; // "全部文章"
            const clickedIndex = currentTabs.indexOf(clickedTab);
            
            // 只有当被点击的标签不在第二个位置时才移动
            if (clickedIndex !== 1) {
                isAnimating = true;
                
                // 将被点击的标签移动到第二个位置
                navTabsContainer.insertBefore(clickedTab, firstTab.nextSibling);
                
                setTimeout(() => {
                    isAnimating = false;
                }, 200);
            }
        }
    }
    
    // 自动统计文章和标签
    function updateStatistics() {
        // 获取所有文章卡片
        const articleCards = document.querySelectorAll('.card-medium');
        const totalArticles = articleCards.length;
        
        // 更新文章总数 - 修复选择器
        const siteInfoItems = document.querySelectorAll('.site-info-item');
        siteInfoItems.forEach(item => {
            const labelElement = item.querySelector('.info-label');
            if (labelElement && labelElement.textContent === '文章总数') {
                const valueElement = item.querySelector('.info-value');
                if (valueElement) {
                    valueElement.textContent = `${totalArticles} 篇`;
                }
            }
        });
        
        // 统计标签 - 直接从文章标签中读取
        const tagCounts = {};
        
        // 遍历所有文章，统计标签
        articleCards.forEach(card => {
            const articleTags = card.querySelectorAll('.article-tag');
            articleTags.forEach(tagElement => {
                const tagName = tagElement.textContent.trim(); // 直接获取文本，不需要移除#号
                tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
            });
        });
        
        console.log('标签统计:', tagCounts); // 调试信息
        
        // 更新标签云中的计数
        const tagItems = document.querySelectorAll('.tag-item');
        tagItems.forEach(tagItem => {
            const tagText = tagItem.textContent.replace(/\d+$/, '').trim();
            const count = tagCounts[tagText] || 0;
            const supElement = tagItem.querySelector('sup');
            if (supElement) {
                supElement.textContent = count;
            }
        });
    }
    
    // 分类检索功能
    function setupCategoryFilter() {
        // 为主视图导航栏添加点击事件
        navTabsContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('nav-tab')) {
                e.preventDefault();
                
                if (isAnimating) return;
                
                const clickedTab = e.target;
                const selectedCategory = clickedTab.textContent.trim();
                
                // 移除所有活跃状态
                allTabs.forEach(t => t.classList.remove('active'));
                
                // 添加当前点击的活跃状态
                clickedTab.classList.add('active');
                
                // 处理标签移动
                handleTabMovement(clickedTab);
                
                // 筛选文章
                filterArticlesByCategory(selectedCategory);
            }
        });
        
        // 为标签云添加点击事件
        const tagItems = document.querySelectorAll('.tag-item');
        tagItems.forEach(tagItem => {
            tagItem.style.cursor = 'pointer'; // 添加鼠标指针样式
            tagItem.addEventListener('click', function() {
                const tagName = this.textContent.replace(/\d+$/, '').trim();
                filterArticlesByTag(tagName);
                
                // 重置主视图导航栏到"全部文章"
                allTabs.forEach(tab => tab.classList.remove('active'));
                const allArticlesTab = allTabs.find(tab => tab.textContent.trim() === '全部文章');
                if (allArticlesTab) {
                    allArticlesTab.classList.add('active');
                }
            });
        });
        
        // 为文章标签添加点击事件
        document.addEventListener('click', function(e) {
            // 检查是否点击了标签或标签内的图标
            let tagElement = null;
            if (e.target.classList.contains('article-tag')) {
                tagElement = e.target;
            } else if (e.target.parentElement && e.target.parentElement.classList.contains('article-tag')) {
                tagElement = e.target.parentElement;
            }
            
            if (tagElement) {
                const tagName = tagElement.textContent.trim();
                console.log('点击标签:', tagName); // 调试信息
                filterArticlesByTag(tagName);
                
                // 重置主视图导航栏到"全部文章"
                allTabs.forEach(tab => tab.classList.remove('active'));
                const allArticlesTab = allTabs.find(tab => tab.textContent.trim() === '全部文章');
                if (allArticlesTab) {
                    allArticlesTab.classList.add('active');
                }
            }
        });
    }
    
    function filterArticlesByCategory(category) {
        const articleCards = document.querySelectorAll('.card-medium');
        
        if (category === '全部文章') {
            // 显示所有文章
            articleCards.forEach(card => {
                card.style.display = 'flex';
            });
        } else {
            // 根据分类筛选文章
            articleCards.forEach(card => {
                // 修复选择器 - 查找分类信息（第3个span，即分类）
                const categoryElement = card.querySelector('.article-meta span:nth-child(3)');
                if (categoryElement) {
                    const articleCategory = categoryElement.textContent.trim();
                    console.log('文章分类:', articleCategory, '筛选分类:', category); // 调试信息
                    if (articleCategory === category) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                } else {
                    card.style.display = 'none';
                }
            });
        }
    }
    
    function filterArticlesByTag(tagName) {
        const articleCards = document.querySelectorAll('.card-medium');
        console.log('筛选标签:', tagName); // 调试信息
        
        // 直接根据文章中的标签进行筛选
        articleCards.forEach(card => {
            const articleTags = card.querySelectorAll('.article-tag');
            let hasTag = false;
            
            articleTags.forEach(tagElement => {
                const articleTagName = tagElement.textContent.trim();
                if (articleTagName === tagName) {
                    hasTag = true;
                }
            });
            
            if (hasTag) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    // 网站建站日期
    const siteStartDate = new Date('2025-12-23T00:00:00'); // 建站日期
    
    function updateSiteDays() {
        const now = new Date();
        const diff = now - siteStartDate;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        // 更新建站天数显示
        const siteDaysElement = document.getElementById('site-days');
        if (siteDaysElement) {
            siteDaysElement.textContent = `${days} 天`;
        }
    }
    
    // 网站最后部署时间（手动设置）
    const deployTime = new Date('2025-12-24T10:00:00'); // 设置你的部署时间
    
    function updateLastUpdate() {
        const now = new Date();
        const diff = now - deployTime;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        let timeText;
        if (minutes < 1) {
            timeText = '刚刚';
        } else if (minutes < 60) {
            timeText = `${minutes}分钟前`;
        } else if (hours < 24) {
            timeText = `${hours}小时前`;
        } else if (days < 30) {
            timeText = `${days}天前`;
        } else {
            // 超过30天显示具体日期
            timeText = deployTime.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        // 更新页面上的时间显示
        const lastUpdateElements = document.querySelectorAll('.info-value');
        lastUpdateElements.forEach(element => {
            if (element.parentElement.querySelector('.info-label').textContent === '最后更新') {
                element.textContent = timeText;
            }
        });
    }
    
    // 初始更新时间、建站天数和统计数据
    updateLastUpdate();
    updateSiteDays();
    updateStatistics();
    setupCategoryFilter();
    
    // 每分钟更新一次时间显示
    setInterval(updateLastUpdate, 60000);
    
    // 每天更新一次建站天数（在午夜时更新）
    setInterval(updateSiteDays, 24 * 60 * 60 * 1000);
    
    console.log('Bento Dashboard 已加载');
});

// 浮动按钮逻辑
const scrollToTopBtn = document.getElementById('scroll-to-top');
const scrollToBottomBtn = document.getElementById('scroll-to-bottom');
const themeToggleBtn = document.getElementById('theme-toggle');
const scrollPercent = document.querySelector('.scroll-percent');

// 深色模式切换
themeToggleBtn.addEventListener('click', function() {
    document.documentElement.classList.toggle('dark-mode');
    
    // 保存主题偏好
    if (document.documentElement.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

// 加载保存的主题
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark-mode');
}

window.addEventListener('scroll', function() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (scrollTop / docHeight) * 100;
    
    // 更新滚动百分比
    scrollPercent.textContent = Math.round(scrolled);
    
    // 显示/隐藏按钮和圆角矩形
    if (scrollTop > 0) {
        scrollToTopBtn.classList.remove('hidden');
        scrollToBottomBtn.classList.remove('hidden');
        headerNav.classList.add('visible');
        document.querySelector('.header-logo').classList.add('visible');
        document.querySelector('.header-icons').classList.add('visible');
    } else {
        scrollToTopBtn.classList.add('hidden');
        scrollToBottomBtn.classList.add('hidden');
        headerNav.classList.remove('visible');
        document.querySelector('.header-logo').classList.remove('visible');
        document.querySelector('.header-icons').classList.remove('visible');
    }
});

// 回到顶部
scrollToTopBtn.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// 滚动到底部
scrollToBottomBtn.addEventListener('click', function() {
    window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
    });
});
