'use client';

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Landmark, PlusCircle } from 'lucide-react';
import { turkishBanks } from '@/lib/market-data';
import type { AddDepositInput } from '@/context/portfolio-context';


const formSchema = z.object({
  depositType: z.enum(['time', 'demand', 'fx'], { required_error: 'Lütfen bir hesap türü seçin.' }),
  bankName: z.string({ required_error: 'Lütfen bir banka seçin.' }).min(1, 'Lütfen bir banka seçin.'),
  amount: z.coerce.number({ required_error: 'Lütfen bir tutar girin.' }).positive('Tutar pozitif olmalıdır.'),
  interestRate: z.coerce.number().optional(),
  currency: z.enum(['USD', 'EUR']).optional(),
}).refine((data) => {
    if (data.depositType === 'time') {
      return data.interestRate !== undefined && data.interestRate > 0;
    }
    return true;
}, {
    message: 'Vadeli hesap için faiz oranı girmek zorunludur.',
    path: ['interestRate'],
}).refine((data) => {
    if (data.depositType === 'fx') {
      return !!data.currency;
    }
    return true;
}, {
    message: 'Döviz hesabı için para birimi seçmek zorunludur.',
    path: ['currency'],
});


interface AddDepositDialogProps {
    onAddDeposit: (data: AddDepositInput) => void;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export default function AddDepositDialog({ onAddDeposit, isOpen, onOpenChange }: AddDepositDialogProps) {
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            depositType: 'demand',
            bankName: '',
            amount: undefined,
        },
    });
    
    const depositType = form.watch('depositType');

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        onAddDeposit({
            depositType: values.depositType,
            name: values.bankName,
            amount: values.amount,
            interestRate: values.interestRate,
            currency: values.currency,
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
                    <DialogTitle>Mevduat Ekle</DialogTitle>
                    <DialogDescription>
                        Portföyünüze yeni bir banka hesabı ekleyin.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <FormField
                            control={form.control}
                            name="depositType"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel>Hesap Türü</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="grid grid-cols-3 gap-4"
                                    >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="demand" />
                                            </FormControl>
                                            <FormLabel className="font-normal">Vadesiz</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="time" />
                                            </FormControl>
                                            <FormLabel className="font-normal">Vadeli</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="fx" />
                                            </FormControl>
                                            <FormLabel className="font-normal">Döviz Tevdiat</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="bankName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Banka</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Bir banka seçin" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {turkishBanks.map(bank => (
                                                    <SelectItem key={bank} value={bank}>
                                                        {bank}
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
                                    <FormLabel>Tutar</FormLabel>
                                    <FormControl>
                                    <Input type="number" placeholder="örn. 50000" {...field} value={field.value ?? ''} step="any"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>

                        {depositType === 'time' && (
                             <FormField
                                control={form.control}
                                name="interestRate"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Yıllık Faiz Oranı (%)</FormLabel>
                                    <FormControl>
                                    <Input type="number" placeholder="örn. 45.5" {...field} value={field.value ?? ''} step="any"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        )}

                        {depositType === 'fx' && (
                             <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Para Birimi</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Bir para birimi seçin" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="USD">Amerikan Doları (USD)</SelectItem>
                                                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}


                        <DialogFooter className="mt-6">
                            <Button type="submit">
                                <PlusCircle className="mr-2 h-4 w-4" /> Hesabı Ekle
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
