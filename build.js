const fs = require('fs');
const path = require('path');

// 读取 sample 目录下的所有 .md 文件
const sampleDir = path.join(__dirname, 'sample');
const files = fs.readdirSync(sampleDir).filter(f => f.endsWith('.md'));

const articles = [];

files.forEach(file => {
    const filePath = path.join(sampleDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 解析 frontmatter
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
        console.error(`Failed to parse ${file}`);
        return;
    }
    
    const frontmatter = match[1];
    const body = match[2].trim();
    
    // 解析 frontmatter 字段
    const article = {};
    const lines = frontmatter.split('\n');
    let inTagsArray = false;
    const tags = [];
    
    for (const line of lines) {
        if (line.startsWith('id:')) {
            article.id = line.replace('id:', '').trim();
        } else if (line.startsWith('title:')) {
            article.title = line.replace('title:', '').trim();
        } else if (line.startsWith('date:')) {
            article.date = line.replace('date:', '').trim();
        } else if (line.startsWith('category:')) {
            article.category = line.replace('category:', '').trim();
        } else if (line.startsWith('tags:')) {
            inTagsArray = true;
        } else if (inTagsArray && line.startsWith('  - ')) {
            tags.push(line.replace('  - ', '').trim());
        }
    }
    
    article.tags = tags;
    article.content = body;
    
    articles.push(article);
});

// 按 id 排序
articles.sort((a, b) => parseInt(a.id) - parseInt(b.id));

// 写入 articles.json
const outputPath = path.join(__dirname, 'articles.json');
fs.writeFileSync(outputPath, JSON.stringify(articles, null, 2), 'utf-8');

console.log(`Generated articles.json with ${articles.length} articles`);
