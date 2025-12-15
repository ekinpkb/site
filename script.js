const postList = document.getElementById('post-list');

// BURAYI, CSV çıktısı veren URL'NİZ İLE DEĞİŞTİRİN
const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSQioLgUM0SjPwo-FSQuxTSBFTvAEXgQbBspNcpnkMW0XlmeaqpMqIGnHOqqjO7WGyENRyT-hJHd7Lf/pub?gid=0&single=true&output=csv'; 

// ----------------------------------------------------
// CSV'yi JSON'a Çeviren Ana Fonksiyon
// ----------------------------------------------------

function csvToJson(csv) {
    const lines = csv.split('\n');
    const result = [];
    
    // İlk satır (başlıklar) anahtarları belirler
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());

    // Başlıklar: title, date, content olmalı
    if (!headers.includes('title') || !headers.includes('content')) {
        throw new Error("CSV başlıkları 'title' ve 'content' içermiyor. Google Sheets'i kontrol edin.");
    }
    
    // Kalan satırları işleme
    for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i].split(',');
        // Boş satırları atla
        if (currentLine.length !== headers.length) continue; 
        
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            // Veriyi objeye aktar
            obj[headers[j]] = currentLine[j].trim();
        }
        result.push(obj);
    }
    return result;
}

// ----------------------------------------------------
// VERİ ÇEKME VE GÖSTERME
// ----------------------------------------------------

function fetchAndRenderPosts() {
    postList.innerHTML = '<p style="color:#00FF00;">CSV verisi çekiliyor ve işleniyor...</p>';

    fetch(GOOGLE_SHEETS_CSV_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ağ Hatası: ${response.status}`);
            }
            return response.text(); // CSV formatı olduğu için metin olarak çekiyoruz
        })
        .then(csvText => {
            // CSV metnini JSON objelerine dönüştür
            const posts = csvToJson(csvText);
            renderPosts(posts);
        })
        .catch(error => {
            console.error("Veri Çekme Başarısız:", error);
            postList.innerHTML = `<p style="color:red; font-weight:bold;">HATA OLUŞTU: Veri çekilemedi!</p>
                                   <p>Detay: ${error.message}</p>
                                   <p>Lütfen Google Sheets'in herkese açık olduğundan emin olun.</p>`;
        });
}

function renderPosts(posts) {
    if (posts.length === 0 || posts[0].title === '') {
        postList.innerHTML = '<p style="color:#FF0000; font-weight: bold;">HENÜZ HİÇ YAZI YOK veya CSV boş.</p>';
        return;
    }
    
    // Tarihe göre en yeniden en eskiye sırala (Eğer 'date' alanı varsa)
    if (posts[0].date) {
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    postList.innerHTML = ''; 

    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post-card';
        
        const title = document.createElement('h3');
        title.textContent = post.title; 
        
        const meta = document.createElement('p');
        meta.className = 'post-meta';
        meta.textContent = post.date ? `Yayınlanma: ${post.date.substring(0, 10)}` : 'Tarih Belirtilmemiş';
        
        const content = document.createElement('div');
        // Yeni satırları <br> ile değiştiriyoruz
        content.innerHTML = post.content.replace(/\n/g, '<br>');

        postDiv.appendChild(title);
        postDiv.appendChild(meta);
        postDiv.appendChild(content);
        postList.appendChild(postDiv);
    });
}

// Sayfa yüklendiğinde postları çek
document.addEventListener('DOMContentLoaded', fetchAndRenderPosts);

// Footer yılını güncelleme
document.getElementById('current-year').textContent = new Date().getFullYear();