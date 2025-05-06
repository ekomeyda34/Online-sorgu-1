// Ana veri çekme fonksiyonu
document.addEventListener('DOMContentLoaded', function() {
    updateAllData();
    setInterval(updateAllData, 3600000); // Her saat başı güncelle
    
    // Son güncelleme zamanını ayarla
    document.getElementById('updateTime').textContent = new Date().toLocaleString('tr-TR');
});

async function updateAllData() {
    try {
        await getPharmacies();
        await getWaterOutages();
        await getPowerOutages();
    } catch (error) {
        console.error('Veri alımında hata:', error);
    }
}

// 1. Nöbetçi Eczaneleri Çek
async function getPharmacies() {
    const loading = document.getElementById('pharmacyLoading');
    const list = document.getElementById('pharmacyList');
    
    loading.style.display = 'block';
    list.innerHTML = '';

    try {
        // Proxy kullanarak CORS sorununu aşıyoruz
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const targetUrl = encodeURIComponent('https://www.eczaneler.gen.tr/nobetci-kadikoy');
        
        const response = await fetch(proxyUrl + targetUrl);
        const data = await response.json();
        
        // HTML'i parse et
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');
        
        // Eczaneleri işle
        const pharmacies = [];
        const rows = doc.querySelectorAll('.table.table-hover tbody tr');
        
        rows.forEach(row => {
            const cols = row.querySelectorAll('td');
            if (cols.length >= 4) {
                pharmacies.push({
                    name: cols[1].textContent.trim(),
                    address: cols[2].textContent.trim(),
                    phone: cols[3].textContent.trim()
                });
            }
        });

        // Listeyi oluştur
        if (pharmacies.length > 0) {
            list.innerHTML = pharmacies.slice(0, 10).map(pharmacy => `
                <div class="list-group-item">
                    <h6>${pharmacy.name}</h6>
                    <p class="mb-1 small">${pharmacy.address}</p>
                    <p class="mb-0">📞 ${pharmacy.phone}</p>
                </div>
            `).join('');
        } else {
            list.innerHTML = '<div class="alert alert-warning">Eczane bilgisi bulunamadı</div>';
        }
    } catch (error) {
        list.innerHTML = '<div class="alert alert-danger">Veri alınırken hata oluştu</div>';
        console.error('Eczane verisi alınamadı:', error);
    } finally {
        loading.style.display = 'none';
    }
}

// 2. Su Kesintilerini Çek
async function getWaterOutages() {
    const loading = document.getElementById('waterLoading');
    const container = document.getElementById('waterOutages');
    
    loading.style.display = 'block';
    container.innerHTML = '';

    try {
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const targetUrl = encodeURIComponent('https://www.iski.istanbul/web/tr-TT/kesinti');
        
        const response = await fetch(proxyUrl + targetUrl);
        const data = await response.json();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');
        
        const outages = [];
        const items = doc.querySelectorAll('.kesinti-listesi .card');
        
        items.forEach(item => {
            const title = item.querySelector('.card-title')?.textContent.trim() || 'Bilinmeyen Bölge';
            const text = item.querySelector('.card-text')?.textContent.trim() || 'Bilgi yok';
            
            outages.push({
                region: title,
                info: text
            });
        });

        if (outages.length > 0) {
            container.innerHTML = outages.slice(0, 5).map(outage => `
                <div class="mb-3 p-2 border-bottom">
                    <h6>${outage.region}</h6>
                    <p class="mb-0">${outage.info}</p>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="alert alert-info">Su kesintisi bilgisi bulunamadı</div>';
        }
    } catch (error) {
        container.innerHTML = '<div class="alert alert-danger">Veri alınırken hata oluştu</div>';
        console.error('Su kesintisi verisi alınamadı:', error);
    } finally {
        loading.style.display = 'none';
    }
}

// 3. Elektrik Kesintilerini Çek (Basitleştirilmiş)
async function getPowerOutages() {
    const loading = document.getElementById('powerLoading');
    const container = document.getElementById('powerOutages');
    
    loading.style.display = 'block';
    container.innerHTML = '';

    try {
        // Örnek veri - gerçek uygulamada scraping yapılmalı
        const sampleData = [
            { region: "Kadıköy - Caferağa Mah.", info: "15.07.2023 09:00-17:00" },
            { region: "Üsküdar - Kuzguncuk Mah.", info: "16.07.2023 10:00-15:00" },
            { region: "Beşiktaş - Levazım Mah.", info: "17.07.2023 13:00-16:00" }
        ];

        container.innerHTML = sampleData.map(outage => `
            <div class="mb-3 p-2 border-bottom">
                <h6>${outage.region}</h6>
                <p class="mb-0">${outage.info}</p>
            </div>
        `).join('');
        
    } catch (error) {
        container.innerHTML = '<div class="alert alert-danger">Veri alınırken hata oluştu</div>';
        console.error('Elektrik kesintisi verisi alınamadı:', error);
    } finally {
        loading.style.display = 'none';
    }
}
