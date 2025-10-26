import { useCurrentAccount } from '@mysten/dapp-kit';
import { Pill } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function PharmacyDashboard() {
  const account = useCurrentAccount();

  return (
    <div className="dashboard pharmacy-dashboard">
      <Card className="dashboard-header">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-6 h-6" />
            Pharmacy Dashboard
          </CardTitle>
          <CardDescription>
            Welcome, Pharmacist {account?.address?.slice(0, 8)}...
          </CardDescription>
          <Badge variant="outline" className="w-fit">
            Rol Yetkisi: Sadece hastanın reçetelerini okuyabilir.
          </Badge>
        </CardHeader>
      </Card>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h3>📋 Erişim İzni Olan Veriler</h3>
          <div className="section-content">
            <p>Sadece reçete verilerine erişim izniniz vardır</p>
            <div className="action-buttons">
              <button className="btn-primary">Hastanın Aktif Reçetelerini Görüntüle (Seal Çözme)</button>
              <button className="btn-secondary">Reçete Arama</button>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>💊 İlaç Yönetimi</h3>
          <div className="section-content">
            <p>İlaç envanteri ve dağıtım yönetimi</p>
            <div className="action-buttons">
              <button className="btn-primary">Envanter</button>
              <button className="btn-secondary">İlaç Dağıt</button>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>📊 Reçete Analitikleri</h3>
          <div className="section-content">
            <p>Reçete istatistikleri ve trendleri görüntüleyin</p>
            <div className="action-buttons">
              <button className="btn-primary">Analitikleri Görüntüle</button>
            </div>
          </div>
        </div>

        <div className="dashboard-section restricted-section">
          <h3>🚫 Yasaklı İşlemler</h3>
          <div className="section-content">
            <p>Bu işlemler rolünüz tarafından kısıtlanmıştır:</p>
            <div className="restricted-actions">
              <button className="btn-disabled" disabled>Tıbbi Raporları/Tanıları Görüntüle</button>
              <button className="btn-disabled" disabled>Lab Sonuçlarını Görüntüle</button>
              <button className="btn-disabled" disabled>Veriyi Değiştir/Sil</button>
              <button className="btn-disabled" disabled>Yeni Rapor Ekle</button>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <p className="role-info">
          <strong>Role:</strong> Pharmacist | <strong>Permissions:</strong> Read prescriptions only, No access to other patient data
        </p>
        <div className="restriction-notice">
          <p>⚠️ <strong>Access Restriction:</strong> You can only view prescriptions. Other patient data (lab results, diagnoses) is not accessible.</p>
        </div>
        <div className="security-notice">
          <p>🔒 <strong>Security Notice:</strong> Data access is controlled by on-chain policies. Even if you bypass the UI, Seal Key Servers will deny decryption without proper authorization.</p>
        </div>
      </div>
    </div>
  );
}