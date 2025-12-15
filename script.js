// Blogu başlatan ana fonksiyon
function initializeBlog() {
    const POSTS_DIR = '_posts/';
    const postList = document.getElementById('post-list');

    // !!! ÖNEMLİ: İlk yazılarınızı CMS'te yayınladıktan sonra
    // aşağıdaki listeyi, CMS'in _posts klasörüne yazdığı dosya adlarıyla
    // manuel olarak güncellemeniz gerekir! 
    const postFiles = [
        "2025-12-15-ilk-deneme.md", 
        // "YENI-YAZININ-SLUG'I.md" şeklinde ekleyin
    ];
    
    if (postFiles.length === 0) {
        postList.innerHTML = '<p style="color:#FFFF00;">Henüz hiç yazı yok. Yönetim panelinden bir yazı oluşturun!</p>';
        return;
    }

    postList.innerHTML = '<p>Yazılar yükleniyor...</p>';

    // Tüm post dosyalarını çekme sözlerini (Promise) oluştur
    const fetchPromises = postFiles.map(filename => 
        fetch(POSTS_DIR + filename)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Dosya bulunamadı: ${filename}`);
                }
                return response.text();
            })
            .then(markdownContent => parseMarkdownPost(markdownContent, filename))
            .catch(error => console.error(error))
    );

    // Tüm postlar yüklendikten sonra listeleme
    Promise.all(fetchPromises.filter(p => p !== undefined))
        .then(posts => {
            // Tarihe göre tersten sırala
            posts.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            postList.innerHTML = ''; 
            
            posts.forEach(post => {
                const postDiv = document.createElement('div');
                postDiv.className = 'post-card';
                postDiv.id = `post-${post.slug}`; 

                const title = document.createElement('h3');
                title.innerHTML = `<a href="#post-${post.slug}">${post.title}</a>`;
                
                const meta = document.createElement('p');
                meta.className = 'post-meta';
                meta.textContent = `Yayınlanma: ${post.date.substring(0, 10)} | Kategori: ${post.category || 'Genel'}`;
                
                // İçerik (Marked kütüphanesi ile HTML'e çevrildi)
                const content = document.createElement('div');
                content.innerHTML = post.body;

                postDiv.appendChild(title);
                postDiv.appendChild(meta);
                postDiv.appendChild(content);
                postList.appendChild(postDiv);
            });
        });

    // Markdown dosyasını ayrıştıran fonksiyon (YAML Frontmatter ve Body ayırır)
    function parseMarkdownPost(markdownContent, filename) {
        const parts = markdownContent.split('---');
        if (parts.length < 3) return null;

        // YAML başlığı (Frontmatter) ve İçerik (Body)
        const frontmatter = parts[1].trim();
        const body = parts.slice(2).join('---').trim();

        const metadata = {};
        frontmatter.split('\n').forEach(line => {
            if (line.includes(':')) {
                let [key, value] = line.split(/:\s*/);
                metadata[key.trim()] = value.trim().replace(/^['"]|['"]$/g, '');
            }
        });

        // Marked kütüphanesi ile Markdown'ı HTML'e çevirme
        const htmlBody = marked.parse(body);

        return {
            ...metadata,
            body: htmlBody,
            slug: filename.replace('.md', '')
        };
    }
}

// marked kütüphanesinin yüklenmesini kontrol et (index.html'e eklenmiştir)
if (typeof marked !== 'undefined') {
    initializeBlog();
}

document.getElementById('current-year').textContent = new Date().getFullYear();