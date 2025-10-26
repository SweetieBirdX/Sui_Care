import React from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

export function DoctorDashboard() {
  const account = useCurrentAccount();

  return (
    <div className="dashboard doctor-dashboard">
      <div className="dashboard-header">
        <h2>👨‍⚕️ Doctor Dashboard</h2>
        <p>Welcome, Dr. {account?.address?.slice(0, 8)}...</p>
        <p className="role-description">Rol Yetkisi: Hastanın tüm verilerini gözlemleyebilir; Normalde mevcut veriyi değiştiremez.</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h3>📋 Hasta Veri Yönetimi (Normal Akış)</h3>
          <div className="section-content">
            <p>Hasta sağlık kayıtlarını görüntüleyin ve yönetin</p>
            <div className="action-buttons">
              <button className="btn-primary">Hastanın Tüm Tıbbi Geçmişini Görüntüle (Seal Çözme)</button>
              <button className="btn-primary">Yeni Rapor/Tanı Ekle (Mevcut veriyi DEĞİŞTİREMEZ kuralına uygun)</button>
              <button className="btn-disabled" disabled>Mevcut Geçmiş Kaydını Düzenle (Normalde Yasak)</button>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>📝 Yeni Rapor Ekleme</h3>
          <div className="section-content">
            <p>Yeni test sonuçları ve tıbbi raporlar ekleyin</p>
            <div className="action-buttons">
              <button className="btn-primary">Lab Sonuçları Ekle</button>
              <button className="btn-primary">Tanı Ekle</button>
              <button className="btn-secondary">Radyoloji Raporu Ekle</button>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>🔐 Erişim İstekleri</h3>
          <div className="section-content">
            <p>Hasta veri erişim isteklerini yönetin</p>
            <div className="action-buttons">
              <button className="btn-primary">Erişim İsteklerini Görüntüle</button>
              <button className="btn-secondary">Erişim İste</button>
            </div>
          </div>
        </div>

        <div className="dashboard-section emergency-section">
          <h3>🚨 Acil Durum İşlemleri</h3>
          <div className="section-content">
            <p>MasterKey ile acil durumda verileri GÖRME ve DEĞİŞTİRME yetkisi kazanılır.</p>
            <div className="action-buttons">
              <button className="btn-emergency">Acil Girişi (MasterKey)</button>
            </div>
            <div className="emergency-notice">
              <p>⚠️ <strong>Uyarı:</strong> Bu işlem, on-chain denetim kaydı ("acil durum onayı") bırakır.</p>
              <p>🔒 <strong>Güvenlik:</strong> Acil durum erişimi sadece yetkili doktorlar tarafından kullanılabilir.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <p className="role-info">
          <strong>Role:</strong> Doctor | <strong>Permissions:</strong> Read all patient data, Add new reports, Emergency access
        </p>
        <div className="restriction-notice">
          <p>⚠️ <strong>Normal Akış Kısıtlaması:</strong> Mevcut verileri değiştiremezsiniz, sadece yeni veri ekleyebilirsiniz.</p>
        </div>
        <div className="security-notice">
          <p>🔒 <strong>Security Notice:</strong> Data access is controlled by on-chain policies. Even if you bypass the UI, Seal Key Servers will deny decryption without proper authorization.</p>
        </div>
      </div>
    </div>
  );
}