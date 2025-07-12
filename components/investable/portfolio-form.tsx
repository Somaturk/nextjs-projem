'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Asset, AssetType } from '@/lib/market-data';
import { assetTypes, assetTypeTranslations } from '@/lib/market-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';

const formSchema = z.object({
  assetType: z.enum(assetTypes, { required_error: 'Lütfen bir varlık türü seçin.' }),
  assetName: z.string({ required_error: 'Lütfen bir varlık seçin.' }).min(1, 'Lütfen bir varlık seçin.'),
  amount: z.coerce.number({ required_error: 'Lütfen bir miktar girin.' }).positive('Miktar pozitif olmalıdır.'),
});

interface PortfolioFormProps {
  availableAssets: Record<string, Asset[]>;
  onAddAsset: (asset: { type: AssetType; name: string; amount: number }) => void;
}

export default function PortfolioForm({ availableAssets, onAddAsset }: PortfolioFormProps) {
  const [selectedType, setSelectedType] = useState<AssetType | ''>('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetName: '',
      amount: undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onAddAsset({
        type: values.assetType,
        name: values.assetName,
        amount: values.amount
    });
    form.reset();
    setSelectedType('');
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <PlusCircle className="h-6 w-6 text-primary" />
          Portföye Ekle
        </CardTitle>
        <CardDescription>Portföyünüze yeni bir döviz, altın, kripto veya hisse senedi varlığı ekleyin.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="assetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Varlık Türü</FormLabel>
                    <Select
                      onValueChange={(value: AssetType) => {
                        field.onChange(value);
                        setSelectedType(value);
                        form.setValue('assetName', '');
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tür seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assetTypes.map(type => (
                          <SelectItem key={type} value={type}>{assetTypeTranslations[type]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assetName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Varlık Adı</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedType || !availableAssets[selectedType]}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Varlık seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(availableAssets[selectedType] || []).map(asset => (
                          <SelectItem key={asset.symbol} value={asset.symbol}>
                            {asset.symbol} - {asset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
            </div>
            <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="mr-2 h-4 w-4" /> Varlık Ekle
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
