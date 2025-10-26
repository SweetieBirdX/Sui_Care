import { useCurrentAccount } from '@mysten/dapp-kit';
import { User, FileText, Pill, Shield, Eye, Upload, Edit, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function PatientDashboard() {
  const account = useCurrentAccount();

  return (
    <div className="dashboard patient-dashboard">
      <Card className="dashboard-header">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-6 h-6" />
            Patient Dashboard
          </CardTitle>
          <CardDescription>
            Welcome, Patient {account?.address?.slice(0, 8)}...
          </CardDescription>
          <Badge variant="outline" className="w-fit">
            Rol Yetkisi: Kendi verilerini gözlemleyebilir, değiştiremez.
          </Badge>
        </CardHeader>
      </Card>

      <div className="dashboard-content">
        <Card className="dashboard-section">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Görüntüleme İzni Olan Veriler
                    </CardTitle>
                    <CardDescription>
                      Kendi sağlık verilerinizi görüntüleyebilirsiniz (sadece okuma)
                    </CardDescription>
                  </CardHeader>
          <CardContent>
            <div className="data-list space-y-4">
              <Card className="data-item">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <h4 className="font-semibold text-white">En Son Tahlil Sonucu</h4>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">
                    Kan tahlili - 15.01.2025
                  </p>
                  <Button className="btn-primary" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Görüntüle
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="data-item">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Pill className="w-5 h-5 text-green-400" />
                    <h4 className="font-semibold text-white">Aktif Reçeteler</h4>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">
                    3 aktif reçete
                  </p>
                  <Button className="btn-primary" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Görüntüle
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="data-item">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <h4 className="font-semibold text-white">Veri Erişim İzinleri</h4>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">
                    Hangi kurumlara/doktorlara izin verdiğiniz
                  </p>
                  <Button className="btn-primary" size="sm">
                    <Shield className="w-4 h-4 mr-2" />
                    Yönet
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <Shield className="w-5 h-5" />
              Yasaklı İşlemler
            </CardTitle>
            <CardDescription>
              Bu işlemler rolünüz tarafından kısıtlanmıştır:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="restricted-actions space-y-2">
              <Button className="btn-disabled w-full justify-start" disabled size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Yeni Rapor Yükle
              </Button>
              <Button className="btn-disabled w-full justify-start" disabled size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Mevcut Veriyi Düzenle
              </Button>
              <Button className="btn-disabled w-full justify-start" disabled size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Veriyi Sil
              </Button>
              <Button className="btn-disabled w-full justify-start" disabled size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Tanı Ekle
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Sağlık Analitikleri
            </CardTitle>
            <CardDescription>
              Kendi sağlık trendlerinizi ve istatistiklerinizi görüntüleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="action-buttons space-y-2">
              <Button className="btn-primary w-full" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Sağlık Trendlerini Görüntüle
              </Button>
              <Button className="btn-secondary w-full" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Rapor İndir
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dashboard-footer">
        <CardContent className="space-y-4">
          <Badge variant="outline" className="w-fit">
            <strong>Role:</strong> Patient | <strong>Permissions:</strong> View own data only, No modification rights
          </Badge>
          <div className="restriction-notice p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <Shield className="w-4 h-4" />
              <strong>Access Restriction:</strong> You can only view your own data. You cannot modify any health information.
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