
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { usePortfolio } from '@/context/portfolio-context';
import DynamicHeader from '@/components/investable/dynamic-header';
import BottomNav from '@/components/investable/bottom-nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';


const formSchema = z.object({
  email: z.string().email({ message: 'Geçerli bir e-posta adresi girin.' }),
  password: z.string().min(6, { message: 'Şifre en az 6 karakter olmalıdır.' }),
});


export default function RegisterPage() {
    const { register } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { viewMode } = usePortfolio();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            await register(values.email, values.password);
            toast({
                title: 'Kayıt Başarılı',
                description: 'Hesabınız oluşturuldu. Ana sayfaya yönlendiriliyorsunuz.',
            });
            router.push('/');
        } catch (error: any) {
            let description = "Kayıt olurken bilinmeyen bir hata oluştu.";
            if (error.code === 'auth/email-already-in-use') {
                description = "Bu e-posta adresi zaten kullanımda.";
            } else if (error.message?.includes("Firebase is not configured")) {
                 description = "Kayıt özelliği şu anda kullanılamıyor. Lütfen sistem yöneticisi ile iletişime geçin.";
            }
            toast({
                variant: 'destructive',
                title: 'Kayıt Başarısız',
                description,
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const containerClass = {
        mobile: 'max-w-lg',
        tablet: 'max-w-4xl',
        desktop: 'max-w-7xl'
    }[viewMode];

    return (
        <div className="flex flex-col min-h-screen bg-background pb-20">
            <DynamicHeader />
            <main className={cn("flex-grow mx-auto p-4 md:p-6 flex items-center justify-center w-full", containerClass)}>
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2"><UserPlus /> Hesap Oluştur</CardTitle>
                        <CardDescription>
                            Hesap oluşturarak verilerinizi kalıcı olarak kaydedin ve tüm cihazlarınızdan erişin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert className="mb-4 text-left">
                          <Info className="h-4 w-4" />
                          <AlertTitle>Verileriniz Nasıl Saklanır?</AlertTitle>
                          <AlertDescription>
                            Kayıt olmadan kullandığınızda, portföy verileriniz yalnızca mevcut tarayıcınızda geçici olarak tutulur. Hesap oluşturarak tüm verilerinizi güvenle saklayabilirsiniz.
                          </AlertDescription>
                        </Alert>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                 <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label htmlFor="email">E-posta</Label>
                                            <FormControl>
                                                <Input id="email" type="email" placeholder="ornek@mail.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label htmlFor="password">Şifre</Label>
                                            <FormControl>
                                                <Input id="password" type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                                </Button>
                            </form>
                        </Form>
                        <div className="mt-4 text-center text-sm">
                            Zaten bir hesabınız var mı?{" "}
                            <Link href="/login" className="underline">
                                Giriş Yap
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </main>
            <BottomNav onAddAssetClick={() => {}} />
        </div>
    );
}
