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
    const logoLink = document.querySelector('.logo');
    const blogLink = document.querySelector('.header-nav-item');
    
    let isAnimating = false;
    
    // 返回首页的函数
    function goHome() {
        // 显示所有文章
        const articleCards = document.querySelectorAll('.card-medium');
        articleCards.forEach(card => {
            card.style.display = 'flex';
        });
        
        // 移除所有占位符
        const placeholders = document.querySelectorAll('.placeholder-card');
        placeholders.forEach(p => p.remove());
        
        // 重置导航栏到"全部文章"
        const currentTabs = navTabsContainer.querySelectorAll('.nav-tab');
        currentTabs.forEach(tab => tab.classList.remove('active'));
        const allArticlesTab = Array.from(currentTabs).find(tab => tab.textContent.trim() === '全部文章');
        if (allArticlesTab) {
            allArticlesTab.classList.add('active');
            allArticlesTab.blur();
        }
        
        // 滚动到顶部
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // 标题点击返回首页
    logoLink.addEventListener('click', function(e) {
        e.preventDefault();
        goHome();
    });
    
    // 博客按钮点击返回首页
    blogLink.addEventListener('click', function(e) {
        e.preventDefault();
        goHome();
    });
    
    // 检查是否需要显示分页按钮
    function checkPagination() {
        const scrollWidth = navTabsContainer.scrollWidth;
        const clientWidth = navTabsContainer.clientWidth;
        
        // 仅在手机端显示
        if (scrollWidth > clientWidth && window.innerWidth <= 768) {
            // 有溢出，可以滚动
        } else {
            // 没有溢出或不是手机端
        }
    }
    
    // 修改nav-tabs的overflow为auto以支持滚动
    navTabsContainer.style.overflowX = 'auto';
    navTabsContainer.style.overflowY = 'hidden';
    navTabsContainer.style.scrollBehavior = 'smooth';
    
    // 隐藏滚动条
    navTabsContainer.style.scrollbarWidth = 'none';
    navTabsContainer.style.msOverflowStyle = 'none';
    
    // 添加滚动事件监听器，实时检查按钮状态
    navTabsContainer.addEventListener('scroll', checkPagination);
    
    // 初始检查
    setTimeout(checkPagination, 100);
    
    // 显示所有标签
    allTabs.forEach(tab => tab.style.display = 'flex');
    
    // 保存原始顺序并按汉字排序（"全部文章"始终在第一个）
    const firstTab = allTabs.find(tab => tab.textContent.trim() === '全部文章');
    const otherTabs = allTabs.filter(tab => tab.textContent.trim() !== '全部文章')
        .sort((a, b) => a.textContent.localeCompare(b.textContent, 'zh-CN'));
    
    const originalOrder = firstTab ? [firstTab, ...otherTabs] : allTabs;
    let selectedTab = null;
    
    // 使用事件委托处理标签点击（移动到第二位的逻辑）
    function handleTabMovement(clickedTab) {
        isAnimating = true;
        
        const firstTab = originalOrder[0]; // "全部文章"
        
        if (clickedTab.textContent.trim() === '全部文章') {
            // 点击"全部文章"时，恢复原始顺序
            selectedTab = null;
            
            // 清空容器中的标签
            allTabs.forEach(tab => tab.remove());
            
            // 重新添加所有标签到容器，按原始顺序
            originalOrder.forEach((tab) => {
                navTabsContainer.appendChild(tab);
            });
        } else {
            // 点击其他标签时，将其移动到第二个位置
            selectedTab = clickedTab;
            
            // 重新排列：第一个是"全部文章"，第二个是被点击的标签，其他按原始顺序
            const newOrder = [firstTab, clickedTab];
            
            // 添加其他标签（按原始顺序，排除"全部文章"和被点击的标签）
            originalOrder.forEach(tab => {
                if (tab !== firstTab && tab !== clickedTab) {
                    newOrder.push(tab);
                }
            });
            
            // 清空容器中的标签
            allTabs.forEach(tab => tab.remove());
            
            // 重新添加标签到容器
            newOrder.forEach((tab) => {
                navTabsContainer.appendChild(tab);
            });
        }
        
        // 立即滚动到开始位置（不延迟）
        navTabsContainer.style.scrollBehavior = 'auto';
        navTabsContainer.scrollLeft = 0;
        navTabsContainer.style.scrollBehavior = 'smooth';
        
        setTimeout(() => {
            isAnimating = false;
            checkPagination();
        }, 0);
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
        
        // 将标签转换为数组并排序：先按数量降序，再按名称升序
        const sortedTags = Object.entries(tagCounts)
            .sort((a, b) => {
                // 先按数量降序排列
                if (b[1] !== a[1]) {
                    return b[1] - a[1];
                }
                // 数量相同时按汉字排序（升序）
                return a[0].localeCompare(b[0], 'zh-CN');
            });
        
        // 更新标签云中的计数和顺序
        const tagItems = document.querySelectorAll('.tag-item');
        const tagItemsArray = Array.from(tagItems);
        
        // 创建一个映射，用于快速查找标签元素
        const tagElementMap = {};
        tagItemsArray.forEach(tagItem => {
            const tagText = tagItem.textContent.replace(/\d+$/, '').trim();
            tagElementMap[tagText] = tagItem;
        });
        
        // 按排序后的顺序重新排列标签元素
        const tagCloud = document.querySelector('.tag-cloud');
        sortedTags.forEach(([tagName, count]) => {
            const tagElement = tagElementMap[tagName];
            if (tagElement) {
                // 更新计数
                const supElement = tagElement.querySelector('sup');
                if (supElement) {
                    supElement.textContent = count;
                }
                // 只显示有文章的标签（数量 > 0）
                if (count > 0) {
                    tagCloud.appendChild(tagElement);
                    tagElement.style.display = 'inline-block';
                } else {
                    tagElement.style.display = 'none';
                }
            }
        });
        
        // 隐藏所有没有在sortedTags中的标签（数量为0的标签）
        tagItemsArray.forEach(tagItem => {
            const tagText = tagItem.textContent.replace(/\d+$/, '').trim();
            if (!tagCounts[tagText] || tagCounts[tagText] === 0) {
                tagItem.style.display = 'none';
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
                
                // 移除所有活跃状态（动态查询）
                const currentTabs = navTabsContainer.querySelectorAll('.nav-tab');
                currentTabs.forEach(t => t.classList.remove('active'));
                
                // 添加当前点击的活跃状态
                clickedTab.classList.add('active');
                
                // 在移动设备上，点击后立即移除焦点和 active 类
                if (window.innerWidth <= 768) {
                    clickedTab.blur();
                    setTimeout(() => {
                        clickedTab.classList.remove('active');
                    }, 100);
                }
                
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
                const currentTabs = navTabsContainer.querySelectorAll('.nav-tab');
                currentTabs.forEach(tab => tab.classList.remove('active'));
                const allArticlesTab = Array.from(currentTabs).find(tab => tab.textContent.trim() === '全部文章');
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
                const currentTabs = navTabsContainer.querySelectorAll('.nav-tab');
                currentTabs.forEach(tab => tab.classList.remove('active'));
                const allArticlesTab = Array.from(currentTabs).find(tab => tab.textContent.trim() === '全部文章');
                if (allArticlesTab) {
                    allArticlesTab.classList.add('active');
                }
            }
        });
    }
    
    function filterArticlesByCategory(category) {
        const articleCards = document.querySelectorAll('.card-medium');
        let visibleCount = 0;
        
        if (category === '全部文章') {
            // 显示所有文章
            articleCards.forEach(card => {
                card.style.display = 'flex';
                visibleCount++;
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
                        visibleCount++;
                    } else {
                        card.style.display = 'none';
                    }
                } else {
                    card.style.display = 'none';
                }
            });
        }
        
        // 添加占位符以撑满网格
        addPlaceholders(visibleCount);
    }
    
    function filterArticlesByTag(tagName) {
        const articleCards = document.querySelectorAll('.card-medium');
        console.log('筛选标签:', tagName); // 调试信息
        
        let visibleCount = 0;
        
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
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // 添加占位符以撑满网格
        addPlaceholders(visibleCount);
    }
    
    // 添加占位符卡片以撑满网格
    function addPlaceholders(visibleCount) {
        const bentoGrid = document.querySelector('.bento-grid');
        
        // 移除之前的占位符
        const existingPlaceholders = bentoGrid.querySelectorAll('.placeholder-card');
        existingPlaceholders.forEach(placeholder => placeholder.remove());
        
        // 如果可见文章数少于2个，添加占位符
        if (visibleCount < 2) {
            const placeholderCount = 2 - visibleCount;
            for (let i = 0; i < placeholderCount; i++) {
                const placeholder = document.createElement('div');
                placeholder.className = 'card card-medium placeholder-card';
                placeholder.style.visibility = 'hidden';
                placeholder.style.pointerEvents = 'none';
                bentoGrid.appendChild(placeholder);
            }
        }
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
            timeText = `${minutes} 分钟前`;
        } else if (hours < 24) {
            timeText = `${hours} 小时前`;
        } else if (days < 30) {
            timeText = `${days} 天前`;
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
    
    // 初始化占位符（所有文章都显示，所以visibleCount等于总文章数）
    const initialArticleCount = document.querySelectorAll('.card-medium').length;
    addPlaceholders(initialArticleCount);
    
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
    
    // 移除焦点，防止按钮常亮
    this.blur();
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
