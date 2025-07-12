
import type {Metadata} from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { PortfolioProvider } from '@/context/portfolio-context';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';


export const metadata: Metadata = {
  title: 'One Y.Z.',
  description: 'One Y.Z. ile modern portföy yönetim aracınız.',
  icons: {
    icon: { url: "/192.png", type: "image/png" },
    shortcut: { url: "/192.png", type: "image/png" },
    apple: { url: "/192.png", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <PortfolioProvider>
              {children}
              <Toaster />
            </PortfolioProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
