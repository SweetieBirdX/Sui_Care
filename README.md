# Sui Care - Merkezi Olmayan Sağlık Yönetim Sistemi

Sui Care, blockchain teknolojisi kullanarak güvenli ve şeffaf bir sağlık verisi yönetim sistemi sunan kapsamlı bir dApp'tir. Sui blockchain ağı üzerinde çalışan bu sistem, hasta verilerinin güvenli saklanması, erişim kontrolü ve sağlık profesyonelleri arasında güvenli veri paylaşımı sağlar.

## 🏥 Proje Özeti

Sui Care, modern sağlık hizmetlerinin ihtiyaçlarını karşılamak için tasarlanmış kapsamlı bir blockchain tabanlı sağlık yönetim platformudur. Sistem, hasta verilerinin güvenli bir şekilde saklanması, farklı sağlık profesyonelleri arasında kontrollü veri paylaşımı ve acil durum erişim yönetimi gibi kritik işlevleri sunar.

### 🎯 Ana Özellikler

- **🔐 Güvenli Veri Yönetimi**: Hasta verilerinin şifrelenmiş olarak saklanması ve güvenli erişim kontrolü
- **👥 Rol Tabanlı Erişim**: Doktor, Eczacı ve Hasta rolleri için farklı yetkilendirme seviyeleri
- **📋 KYC Doğrulama**: Kimlik doğrulama ve yetkilendirme sistemi
- **🚨 Acil Durum Erişimi**: Kritik durumlarda hızlı veri erişimi
- **📊 Denetim İzi**: Tüm veri erişimlerinin kayıt altına alınması
- **🔗 Blockchain Entegrasyonu**: Sui blockchain ağı ile tam entegrasyon
- **💼 Çoklu Rol Desteği**: Farklı sağlık profesyonelleri için özelleştirilmiş arayüzler

### 🏗️ Sistem Mimarisi

#### Frontend (React + TypeScript)
- **Modern UI/UX**: Glassmorphism tasarım ile kullanıcı dostu arayüz
- **Rol Tabanlı Yönlendirme**: Kullanıcı rolüne göre özelleştirilmiş dashboard'lar
- **Gerçek Zamanlı Veri**: React Query ile etkili veri yönetimi
- **Çoklu Ağ Desteği**: Testnet ve Mainnet arasında geçiş

#### Backend (Sui Move Smart Contracts)
- **Sağlık Erişim Politikası**: Rol tabanlı izin yönetimi
- **Erişim Kontrol Sistemi**: Veri erişim istekleri ve onayları
- **Acil Durum Yönetimi**: Kritik durumlarda hızlı erişim
- **Denetim ve Loglama**: Tüm işlemlerin kayıt altına alınması

### 📊 Desteklenen Veri Türleri

- **Laboratuvar Sonuçları**: Kan tahlilleri, biyokimya sonuçları
- **Reçeteler**: İlaç reçeteleri ve dozaj bilgileri
- **Tıbbi Kayıtlar**: Hasta geçmişi ve muayene notları
- **Tanılar**: ICD-10 kodlu tanı bilgileri
- **Tedavi Planları**: Uzun vadeli tedavi stratejileri
- **Vital Bulgular**: Kan basıncı, nabız, ateş gibi ölçümler
- **Görüntüleme Sonuçları**: Radyoloji ve görüntüleme raporları
- **İlaç Geçmişi**: Kullanılan ilaçların detaylı kayıtları

### 🔒 Güvenlik Özellikleri

- **Şifreleme**: Tüm verilerin güvenli şifreleme ile korunması
- **Erişim Kontrolü**: Granüler izin yönetimi sistemi
- **Kendi Kendine Yetkilendirme Yasak**: Güvenlik için kendi verilerini değiştirme kısıtlaması
- **Acil Durum Protokolleri**: Kritik durumlarda kontrollü erişim
- **Denetim İzi**: Tüm işlemlerin blockchain üzerinde kayıt altına alınması

## 🛠️ Teknoloji Stack'i

### Frontend
- **React 18** + **TypeScript** - Modern UI framework
- **Vite** - Hızlı geliştirme ve build süreci
- **@mysten/dapp-kit** - Sui wallet entegrasyonu
- **@mysten/sui** - Sui blockchain etkileşimi
- **@tanstack/react-query** - Veri yönetimi
- **Tailwind CSS** - Modern styling
- **Lucide React** - İkon kütüphanesi

### Backend
- **Sui Move** - Akıllı kontrat geliştirme
- **Sui Framework** - Blockchain altyapısı
- **Walrus** - Veri depolama servisi
- **Seal** - Şifreleme servisi

### Geliştirme Araçları
- **TypeScript** - Tip güvenliği
- **Vite** - Build tool
- **PostCSS** - CSS işleme
- **Autoprefixer** - CSS uyumluluğu

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Sui CLI (blockchain işlemleri için)

### Kurulum Adımları

1. **Repository'yi klonlayın:**
```bash
git clone <repository-url>
cd Sui_Care
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

4. **Tarayıcınızda açın:**
```
http://localhost:5173
```

### Production Build

```bash
npm run build
```

Build edilen dosyalar `dist` klasöründe oluşturulur.

## 📁 Proje Yapısı

```
Sui_Care/
├── contracts/                    # Sui Move akıllı kontratları
│   └── sui_care/
│       ├── sources/             # Move kaynak dosyaları
│       │   ├── health_access_policy.move
│       │   ├── access_control.move
│       │   └── emergency_access.move
│       └── Move.toml           # Move proje konfigürasyonu
├── src/                         # Frontend kaynak kodları
│   ├── components/              # React bileşenleri
│   │   ├── DoctorDashboard.tsx     # Doktor paneli
│   │   ├── PatientDashboard.tsx    # Hasta paneli
│   │   ├── PharmacyDashboard.tsx   # Eczacı paneli
│   │   ├── KYCVerification.tsx     # KYC doğrulama
│   │   ├── HealthDataManager.tsx   # Sağlık veri yönetimi
│   │   ├── AccessRequestManager.tsx # Erişim istek yönetimi
│   │   ├── AuditTrailViewer.tsx    # Denetim izi görüntüleme
│   │   └── ui/                     # UI bileşenleri
│   ├── services/                # Servis katmanı
│   │   ├── dataService.ts          # Veri servisi
│   │   ├── accessControlService.ts # Erişim kontrol servisi
│   │   ├── auditTrailService.ts    # Denetim servisi
│   │   ├── policyService.ts        # Politika servisi
│   │   ├── sealService.ts          # Şifreleme servisi
│   │   └── walrusService.ts        # Depolama servisi
│   ├── types/                   # TypeScript tip tanımları
│   │   └── healthData.ts           # Sağlık veri tipleri
│   ├── hooks/                   # Custom React hooks
│   │   ├── useUserRole.ts          # Kullanıcı rol yönetimi
│   │   └── useZKProofVerification.ts # Zero-knowledge doğrulama
│   ├── config/                  # Konfigürasyon dosyaları
│   │   ├── networks.ts             # Ağ konfigürasyonları
│   │   └── production.ts           # Production ayarları
│   └── providers/               # React context providers
│       └── AppProviders.tsx        # Ana provider
└── public/                      # Statik dosyalar
```

## 🌐 Ağ Konfigürasyonu

Uygulama hem Sui Testnet hem de Mainnet'i destekler:

- **Testnet**: `https://fullnode.testnet.sui.io:443`
- **Mainnet**: `https://fullnode.mainnet.sui.io:443`

Ağ seçici ile UI üzerinden ağlar arasında geçiş yapabilirsiniz.

## 🔐 Wallet Entegrasyonu

dApp, `@mysten/dapp-kit` kütüphanesi aracılığıyla Sui uyumlu cüzdanlarla entegre olur:

- Cüzdan bağlantısı/bağlantı kesme
- Hesap bilgileri görüntüleme
- Bakiye sorguları
- Obje sorguları
- İşlem yetenekleri

## 👥 Kullanıcı Rolleri

### 🩺 Doktor
- Tüm sağlık verilerine tam erişim
- Veri oluşturma, düzenleme ve silme yetkisi
- Hasta verilerine erişim isteği oluşturma
- Acil durum erişimi başlatma

### 💊 Eczacı
- Reçete verilerine sadece okuma erişimi
- İlaç bilgilerini görüntüleme
- Reçete doğrulama

### 🏥 Hasta
- Kendi verilerine sadece okuma erişimi
- Veri erişim isteklerini onaylama/reddetme
- Acil durum erişimini iptal etme

## 🚨 Acil Durum Yönetimi

Sistem, kritik durumlarda hızlı veri erişimi için özel protokoller içerir:

- Yetkili doktorlar tarafından acil erişim başlatma
- Zaman sınırlı erişim (maksimum 24 saat)
- Tüm acil erişim işlemlerinin kayıt altına alınması
- Hasta veya doktor tarafından erişimi iptal etme

## 📈 Denetim ve İzleme

- Tüm veri erişimlerinin blockchain üzerinde kayıt altına alınması
- Erişim istekleri ve onaylarının takibi
- Acil durum erişimlerinin detaylı loglanması
- Şeffaf ve değiştirilemez denetim izi

## 🔧 Geliştirme

### Mevcut Scriptler

- `npm run dev` - Geliştirme sunucusunu başlat
- `npm run build` - Production için build et
- `npm run preview` - Production build'i önizle

### Kod Stili

Proje TypeScript strict mode ile yazılmıştır. Tüm bileşenler React hooks kullanan fonksiyonel bileşenlerdir.

## 🤝 Katkıda Bulunma

1. Repository'yi fork edin
2. Feature branch oluşturun
3. Değişikliklerinizi yapın
4. Kapsamlı test edin
5. Pull request gönderin

## 📄 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır.

## 🔮 Gelecek Planları

- **Zero-Knowledge Proofs**: Gelişmiş gizlilik koruması
- **Interoperability**: Diğer blockchain ağları ile entegrasyon
- **AI Integration**: Yapay zeka destekli tanı önerileri
- **Mobile App**: Mobil uygulama geliştirme
- **Telemedicine**: Uzaktan sağlık hizmetleri entegrasyonu

---

**Sui Care** - Sağlık verilerinizin güvenliği ve şeffaflığı için blockchain teknolojisinin gücünü kullanıyoruz. 🏥🔗
