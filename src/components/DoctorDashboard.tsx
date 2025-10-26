import { useCurrentAccount } from '@mysten/dapp-kit';
import { Stethoscope, FileText, Plus, Shield, AlertTriangle, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function DoctorDashboard() {
  const account = useCurrentAccount();

  return (
    <div className="dashboard doctor-dashboard">
      <Card className="dashboard-header">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-6 h-6" />
            Doctor Dashboard
          </CardTitle>
          <CardDescription>
            Welcome, Dr. {account?.address?.slice(0, 8)}...
          </CardDescription>
          <Badge variant="outline" className="w-fit">
            Rol Yetkisi: Hastanın tüm verilerini gözlemleyebilir; Normalde mevcut veriyi değiştiremez.
          </Badge>
        </CardHeader>
      </Card>

      <div className="dashboard-content">
        <Card className="dashboard-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Hasta Veri Yönetimi
            </CardTitle>
            <CardDescription>
              Hasta sağlık kayıtlarını görüntüleyin ve yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="action-buttons space-y-2">
              <Button className="btn-primary w-full justify-start" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Hastanın Tüm Tıbbi Geçmişini Görüntüle
              </Button>
              <Button className="btn-primary w-full justify-start" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Rapor/Tanı Ekle
              </Button>
              <Button className="btn-disabled w-full justify-start" disabled size="sm">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Mevcut Geçmiş Kaydını Düzenle (Yasak)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Yeni Rapor Ekleme
            </CardTitle>
            <CardDescription>
              Yeni test sonuçları ve tıbbi raporlar ekleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="action-buttons space-y-2">
              <Button className="btn-primary w-full justify-start" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Lab Sonuçları Ekle
              </Button>
              <Button className="btn-primary w-full justify-start" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Tanı Ekle
              </Button>
              <Button className="btn-secondary w-full justify-start" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Radyoloji Raporu Ekle
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Erişim İstekleri
            </CardTitle>
            <CardDescription>
              Hasta veri erişim isteklerini yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="action-buttons space-y-2">
              <Button className="btn-primary w-full justify-start" size="sm">
                <ClipboardList className="w-4 h-4 mr-2" />
                Erişim İsteklerini Görüntüle
              </Button>
              <Button className="btn-secondary w-full justify-start" size="sm">
                <Shield className="w-4 h-4 mr-2" />
                Erişim İste
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-section emergency-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              Acil Durum İşlemleri
            </CardTitle>
            <CardDescription>
              MasterKey ile acil durumda verileri görme ve değiştirme yetkisi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="action-buttons space-y-2">
              <Button className="btn-emergency w-full justify-start" size="sm">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Acil Girişi (MasterKey)
              </Button>
            </div>
            <div className="emergency-notice mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="flex items-center gap-2 text-red-800 dark:text-red-200 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <strong>Uyarı:</strong> Bu işlem, on-chain denetim kaydı bırakır.
              </p>
              <p className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <Shield className="w-4 h-4" />
                <strong>Güvenlik:</strong> Acil durum erişimi sadece yetkili doktorlar tarafından kullanılabilir.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dashboard-footer">
        <CardContent className="space-y-4">
          <Badge variant="outline" className="w-fit">
            <strong>Role:</strong> Doctor | <strong>Permissions:</strong> Read all patient data, Add new reports, Emergency access
          </Badge>
          <div className="restriction-notice p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="w-4 h-4" />
              <strong>Normal Akış Kısıtlaması:</strong> Mevcut verileri değiştiremezsiniz, sadece yeni veri ekleyebilirsiniz.
            </p>
          </div>
          <div className="security-notice p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Shield className="w-4 h-4" />
              <strong>Security Notice:</strong> Data access is controlled by on-chain policies. Even if you bypass the UI, Seal Key Servers will deny decryption without proper authorization.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}