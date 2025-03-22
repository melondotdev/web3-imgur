import type { Tab } from "@/lib/types/sidebar/tab";
import type { Egg, Flame, Home } from 'lucide-react';

export const tabs: Tab[] = [
  {
    name: 'Discover',
    icon: <Home className="w-5 h-5" />,
    href: '/',
  },
  {
    name: 'BorkHub',
    icon: <Egg className="w-5 h-5" />,
    href: '/borkhub',
    disabled: true,
  },
  {
    name: 'FlameHub',
    icon: <Flame className="w-5 h-5" />,
    href: '/flamehub',
    disabled: true,
  },
];