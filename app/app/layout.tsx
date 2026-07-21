'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CaseFileProvider } from '@/lib/contexts/case-file-context';
import { SubscriptionGate, ManageSubscriptionLink } from '@/components/subscription';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  User,
  Users,
  Phone,
  Heart,
  Home as HomeIcon,
  FileText,
  Globe,
  Scroll,
  ClipboardList,
  BookOpen,
} from 'lucide-react';

const NAV = [
  { href: '/app/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/app/profil', label: 'Profil', icon: User },
  { href: '/app/famille', label: 'Famille', icon: Users },
  { href: '/app/contacts', label: 'Contacts clés', icon: Phone },
  { href: '/app/confiance', label: 'Personnes de confiance', icon: Heart },
  { href: '/app/patrimoine', label: 'Patrimoine', icon: HomeIcon },
  { href: '/app/documents', label: 'Documents', icon: FileText },
  { href: '/app/vie-numerique', label: 'Vie numérique', icon: Globe },
  { href: '/app/volontes', label: 'Volontés', icon: Scroll },
  { href: '/app/decisions', label: 'Décisions & méthode', icon: ClipboardList },
  { href: '/app/livret', label: 'Générer le livret', icon: BookOpen },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <CaseFileProvider>
      <SubscriptionGate>
      <div className="min-h-screen flex">
        <aside className="w-64 shrink-0 border-r border-gold/30 bg-white flex flex-col">
          <div className="p-5 border-b border-gold/20">
            <p className="text-xs uppercase tracking-widest text-gold">TransmiExpert</p>
            <p className="font-serif text-lg text-ink">Mon livret</p>
          </div>
          <nav className="flex-1 py-4">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-5 py-2.5 text-sm transition-colors',
                    active ? 'bg-ivory-dark text-forest font-medium border-l-2 border-gold' : 'text-ink/70 hover:bg-ivory'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-5 border-t border-gold/20 text-xs text-ink/50 space-y-2">
            <ManageSubscriptionLink className="text-forest hover:text-gold transition-colors underline underline-offset-2" />
            <p>Ni notaire ni avocat — tiers neutre.</p>
          </div>
        </aside>
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-8 py-10">{children}</div>
        </main>
      </div>
      </SubscriptionGate>
    </CaseFileProvider>
  );
}
