'use client';

import { useMemo, useState } from 'react';
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
import type { Asset, AssetType } from '@/lib/market-data';
import { assetTypeTranslations } from '@/lib/market-data';
import { PlusCircle, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


const formSchema = z.object({
  assetSymbol: z.string({ required_error: 'Lütfen bir varlık seçin.' }).min(1, 'Lütfen bir varlık seçin.'),
  amount: z.coerce.number({ required_error: 'Lütfen bir miktar girin.' }).positive('Miktar pozitif olmalıdır.'),
  purchasePrice: z.coerce.number().optional(),
  purchaseDate: z.date().optional(),
});

interface AddAssetDialogProps {
    assetType: AssetType;
    availableAssets: Asset[];
    onAddAsset: (data: { type: AssetType; name: string; amount: number; price?: number; date?: Date }) => void;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    livePrices: Record<string, number>;
}

export default function AddAssetDialog({ assetType, availableAssets, onAddAsset, isOpen, onOpenChange, livePrices }: AddAssetDialogProps) {
    const [openCombobox, setOpenCombobox] = useState(false);
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            assetSymbol: '',
            amount: undefined,
            purchasePrice: undefined,
            purchaseDate: undefined
        },
    });

    const selectedAssetSymbol = form.watch('assetSymbol');
    const amount = form.watch('amount');
    const purchasePrice = form.watch('purchasePrice');

    const currentPrice = useMemo(() => {
        if (!selectedAssetSymbol) return null;
        const price = livePrices[`${assetType}-${selectedAssetSymbol}`];
        return price ?? null;
    }, [selectedAssetSymbol, assetType, livePrices]);
    
    const totalValue = useMemo(() => {
        const priceToUse = purchasePrice || currentPrice || 0;
        const amountValue = amount || 0;
        return amountValue * priceToUse;
    }, [amount, purchasePrice, currentPrice]);


    const onSubmit = (values: z.infer<typeof formSchema>) => {
        onAddAsset({
            type: assetType,
            name: values.assetSymbol,
            amount: values.amount,
            price: values.purchasePrice,
            date: values.purchaseDate
        });
        form.reset();
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            form.reset();
        }
        onOpenChange(open);
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Portföye {assetTypeTranslations[assetType]} Ekle</DialogTitle>
                    <DialogDescription>
                        Eklemek istediğiniz varlığı seçin ve bilgilerini girin.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="assetSymbol"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Varlık</FormLabel>
                                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={openCombobox}
                                                        className={cn(
                                                            "w-full justify-between",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value
                                                            ? availableAssets.find(
                                                                  (asset) => asset.symbol === field.value
                                                              )?.name
                                                            : "Bir varlık seçin veya arayın..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Varlık adı veya sembolü ara..." />
                                                    <CommandList>
                                                        <CommandEmpty>Varlık bulunamadı.</CommandEmpty>
                                                        <CommandGroup>
                                                            {availableAssets.map((asset) => (
                                                                <CommandItem
                                                                    value={`${asset.symbol} ${asset.name}`}
                                                                    key={asset.symbol}
                                                                    onSelect={() => {
                                                                        form.setValue("assetSymbol", asset.symbol);
                                                                        setOpenCombobox(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            field.value === asset.symbol ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {asset.symbol} - {asset.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                                        <FormLabel>Alış Fiyatı (Opsiyonel)</FormLabel>
                                        <FormControl>
                                        <Input type="number" placeholder={currentPrice ? `Anlık: ${currentPrice.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺` : "Birim başına fiyat"} {...field} value={field.value ?? ''} step="any"/>
                                        </FormControl>
                                        <FormDescription>
                                            Boş bırakılırsa anlık fiyat kullanılır.
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
                                        <FormLabel>Alış Tarihi (Opsiyonel)</FormLabel>
                                        <FormControl>
                                            <DatePicker value={field.value} onChange={field.onChange} />
                                        </FormControl>
                                        <FormDescription>
                                            Boş bırakılırsa bugün kabul edilir.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {totalValue > 0 && (
                            <div className="mt-4 p-4 rounded-lg bg-muted/50 text-center border border-border/50">
                                <p className="text-sm text-muted-foreground">Tahmini Toplam Tutar</p>
                                <p className="text-xl font-bold text-primary">
                                    {totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                                </p>
                            </div>
                        )}

                        <DialogFooter className="mt-6">
                            <Button type="submit">
                                <PlusCircle className="mr-2 h-4 w-4" /> Varlığı Ekle
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
