'use client';

import { useRef } from 'react';
import { usePortfolio } from '@/context/portfolio-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Download, Upload, RotateCcw, Trash2, FolderSync } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function PortfolioManagement() {
    const { 
        handleExportPortfolio, 
        handleImportPortfolio, 
        handleLoadSampleData, 
        handleClearPortfolio 
    } = usePortfolio();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleImportPortfolio(file);
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-foreground dark:text-destructive">
                    <FolderSync className="h-6 w-6 text-destructive dark:text-destructive"/>
                    Portföy Yönetimi
                </CardTitle>
                <CardDescription className="text-muted-foreground dark:text-foreground">
                    Portföy verilerinizi yönetin, yedekleyin veya test amaçlı örnek verileri kullanın.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <Button variant="outline" onClick={handleExportPortfolio}>
                        <Download /> Dışa Aktar
                    </Button>
                    <Button variant="outline" onClick={triggerFileSelect}>
                        <Upload /> İçe Aktar
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={onFileChange}
                        accept=".json"
                        className="hidden"
                    />
                    <Button variant="outline" onClick={handleLoadSampleData}>
                        <RotateCcw /> Örnek Yükle
                    </Button>
                    
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 /> Verileri Sil
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Tüm Verileri Silmek Üzeresiniz</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Bu işlem geri alınamaz. Tüm portföy verileriniz kalıcı olarak silinecektir. Devam etmek istediğinizden emin misiniz?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction
                                    className={buttonVariants({ variant: "destructive" })}
                                    onClick={handleClearPortfolio}
                                >
                                    Evet, Sil
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                </div>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                    <li>Portföy verileriniz tarayıcınızda güvenli bir şekilde saklanır.</li>
                    <li>Dışa aktarma ile verilerinizi yedekleyebilirsiniz.</li>
                    <li>İçe aktarma ile önceki yedeklerinizi geri yükleyebilirsiniz.</li>
                </ul>
            </CardContent>
        </Card>
    );
}
