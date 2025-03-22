'use client';
import type { Tab } from '@/lib/types/sidebar/tab';
import { Egg, Flame, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const tabs: Tab[] = [
  {
    name: 'Discover',
    icon: <Home className="w-5 h-5" />,
    href: '/',
  },
  {
    name: 'FlameHub',
    icon: <Flame className="w-5 h-5" />,
    href: '/flamehub',
    disabled: false,
  },
  {
    name: 'BorkHub',
    icon: <Egg className="w-5 h-5" />,
    href: '/borkhub',
    disabled: true,
  },
];

// Get tab name from pathname
function getActiveTabFromPathname(pathname: string): string {
  // Remove any potential post ID from the pathname
  const basePath = pathname.split('/')[1] || '';

  // Map the pathname to tab name
  switch (basePath) {
    case '':
      return 'Discover';
    case 'flamehub':
      return 'FlameHub';
    case 'borkhub':
      return 'BorkHub';
    default:
      return 'Discover';
  }
}

export function Sidebar() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(() =>
    getActiveTabFromPathname(pathname),
  );

  // Update active tab when pathname changes
  useEffect(() => {
    setActiveTab(getActiveTabFromPathname(pathname));
  }, [pathname]);

  return (
    <div className="fixed left-0 top-16 bottom-0 w-40 bg-black flex flex-col items-start py-4">
      {tabs.map((tab) =>
        tab.disabled ? (
          <div
            key={tab.name}
            className="w-full px-4 py-3 flex items-center gap-3 text-gray-600 cursor-not-allowed"
          >
            {tab.icon}
            <span className="text-sm">{tab.name}</span>
          </div>
        ) : (
          <Link
            key={tab.name}
            href={tab.href}
            className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
              activeTab === tab.name
                ? 'text-white bg-gray-800/50 rounded-3xl'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.icon}
            <span className="text-sm">{tab.name}</span>
          </Link>
        ),
      )}
    </div>
  );
}
