'use client';
import { Egg, Flame, Home } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface Tab {
  name: string;
  icon: React.ReactNode;
  href: string;
  disabled?: boolean;
}

const tabs: Tab[] = [
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

// TODO Replace with Navigation Menu
export function Sidebar() {
  const [activeTab, setActiveTab] = useState('Discover');

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
