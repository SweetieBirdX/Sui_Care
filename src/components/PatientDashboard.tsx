import React from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

export function PatientDashboard() {
  const account = useCurrentAccount();

  return (
    <div className="dashboard patient-dashboard">
      <div className="dashboard-header">
        <h2>👤 Patient Dashboard</h2>
        <p>Welcome, Patient {account?.address?.slice(0, 8)}...</p>
        <p className="role-description">Rol Yetkisi: Kendi verilerini gözlemleyebilir, değiştiremez.</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h3>📋 Görüntüleme İzni Olan Veriler (Mock Data - Seal ile Gizlenmiş)</h3>
          <div className="section-content">
            <p>Kendi sağlık verilerinizi görüntüleyebilirsiniz (sadece okuma)</p>
            <div className="mock-data-list">
              <div className="mock-data-item">
                <h4>🔬 En Son Tahlil Sonucu</h4>
                <p>Kan tahlili - 15.01.2025 (Mock: Seal ile şifrelenmiş)</p>
                <button className="btn-primary">Görüntüle</button>
              </div>
              <div className="mock-data-item">
                <h4>💊 Aktif Reçeteler</h4>
                <p>3 aktif reçete (Mock: Seal ile şifrelenmiş)</p>
                <button className="btn-primary">Görüntüle</button>
              </div>
              <div className="mock-data-item">
                <h4>🔐 Veri Erişim İzinleri</h4>
                <p>Hangi kurumlara/doktorlara izin verdiğiniz (Mock: Seal ile şifrelenmiş)</p>
                <button className="btn-primary">Yönet</button>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>🚫 Yasaklı İşlemler</h3>
          <div className="section-content">
            <p>Bu işlemler rolünüz tarafından kısıtlanmıştır:</p>
            <div className="restricted-actions">
              <button className="btn-disabled" disabled>Yeni Rapor Yükle</button>
              <button className="btn-disabled" disabled>Mevcut Veriyi Düzenle</button>
              <button className="btn-disabled" disabled>Veriyi Sil</button>
              <button className="btn-disabled" disabled>Tanı Ekle</button>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>📊 Sağlık Analitikleri</h3>
          <div className="section-content">
            <p>Kendi sağlık trendlerinizi ve istatistiklerinizi görüntüleyin</p>
            <div className="action-buttons">
              <button className="btn-primary">Sağlık Trendlerini Görüntüle</button>
              <button className="btn-secondary">Rapor İndir</button>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <p className="role-info">
          <strong>Role:</strong> Patient | <strong>Permissions:</strong> View own data only, No modification rights
        </p>
        <div className="restriction-notice">
          <p>⚠️ <strong>Access Restriction:</strong> You can only view your own data. You cannot modify any health information.</p>
        </div>
        <div className="security-notice">
          <p>🔒 <strong>Security Notice:</strong> Data access is controlled by on-chain policies. Even if you bypass the UI, Seal Key Servers will deny decryption without proper authorization.</p>
        </div>
      </div>
    </div>
  );
}