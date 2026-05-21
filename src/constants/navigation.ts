import {
  Home,
  Building2,
  PawPrint,
  Milk,
  CalendarCheck2,
  Factory,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  icon: LucideIcon;
  labelKey: string;
  href: string;
}

export interface NavSection {
  sectionKey: string;
  items: NavItem[];
}

// Navigation for the PROPRIETARIO role.
// labelKey and sectionKey are next-intl translation keys under the 'Sidebar' namespace.
// href values are locale-agnostic — the Link from '@/i18n/routing' injects the locale prefix.
export const proprietarioNavigation: NavSection[] = [
  {
    sectionKey: 'sections.main',
    items: [
      { icon: Home, labelKey: 'dashboard', href: '/proprietario' },
    ],
  },
  {
    sectionKey: 'sections.propriedades',
    items: [
      { icon: Building2, labelKey: 'propriedades', href: '/proprietario/propriedades' },
    ],
  },
  {
    sectionKey: 'sections.rebanho',
    items: [
      { icon: PawPrint, labelKey: 'rebanho', href: '/proprietario/rebanho' },
    ],
  },
  {
    sectionKey: 'sections.lactacao',
    items: [
      { icon: Milk, labelKey: 'lactacao', href: '/proprietario/lactacao' },
    ],
  },
  {
    sectionKey: 'sections.controle',
    items: [
      { icon: CalendarCheck2, labelKey: 'controleReproducao', href: '/proprietario/controle-reproducao' },
      { icon: PawPrint, labelKey: 'simulacao', href: '/proprietario/simulacao' },
    ],
  },
  {
    sectionKey: 'sections.industria',
    items: [
      { icon: Milk, labelKey: 'coletas', href: '/proprietario/coleta' },
      { icon: Factory, labelKey: 'industria', href: '/proprietario/industria' },
    ],
  },
];
