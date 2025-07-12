'use client';

import { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import type { PortfolioAsset } from '@/lib/market-data';
import { assetTypeTranslations } from '@/lib/market-data';
import { Save } from 'lucide-react';

const formSchema = z.object({
  amount: z.coerce.number({ required_error: 'Lütfen bir miktar girin.' }).positive('Miktar pozitif olmalıdır.'),
  purchasePrice: z.coerce.number().optional(),
  purchaseDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditAssetDialogProps {
    asset: PortfolioAsset;
    onUpdateAsset: (data: FormValues) => void;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export default function EditAssetDialog({ asset, onUpdateAsset, isOpen, onOpenChange }: EditAssetDialogProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (asset) {
            form.reset({
                amount: asset.amount,
                purchasePrice: asset.purchasePrice,
                purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate) : undefined,
            });
        }
    }, [asset, form, isOpen]);


    const onSubmit = (values: FormValues) => {
        onUpdateAsset(values);
        onOpenChange(false);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            form.reset();
        }
        onOpenChange(open);
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{asset.name} Varlığını Düzenle</DialogTitle>
                    <DialogDescription>
                       {assetTypeTranslations[asset.type]} varlığınızın giriş bilgilerini güncelleyin.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Miktar</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="örn. 10.5" {...field} value={field.value ?? ''} step="any"/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="purchasePrice"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Alış Fiyatı</FormLabel>
                                    <FormControl>
                                    <Input type="number" placeholder="Birim başına fiyat" {...field} value={field.value ?? ''} step="any"/>
                                    </FormControl>
                                    <FormDescription>
                                        Alış maliyetinizi girin.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="purchaseDate"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Alış Tarihi</FormLabel>
                                    <FormControl>
                                        <DatePicker value={field.value} onChange={field.onChange} />
                                    </FormControl>
                                    <FormDescription>
                                        İşlem yaptığınız tarih.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="submit">
                                <Save className="mr-2 h-4 w-4" /> Değişiklikleri Kaydet
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
