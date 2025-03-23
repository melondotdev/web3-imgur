'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Tab } from '@/lib/types/sidebar/tab';
import { ChevronDown, FileQuestion, Flame, Home } from 'lucide-react';
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
    name: '???',
    icon: <FileQuestion className="w-5 h-5" />,
    href: '/',
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

  // Mobile view
  const mobileView = (
    <div className="flex w-full">
      {/* Discover button - takes up half the space */}
      <Link
        href="/"
        className={`flex-1 px-4 py-2 flex items-center justify-center gap-3 transition-colors ${
          activeTab === 'Discover'
            ? 'text-white bg-gray-800/50'
            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
        }`}
        onClick={() => setActiveTab('Discover')}
      >
        <Home className="w-5 h-5" />
        <span className="text-sm whitespace-nowrap">Discover</span>
      </Link>

      {/* Dropdown for other hubs - takes up other half */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          className={`flex-1 px-4 py-2 flex items-center justify-center gap-3 transition-colors ${
            activeTab !== 'Discover'
              ? 'text-white bg-gray-800/50'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          <Flame className="w-5 h-5" />
          <span className="text-sm whitespace-nowrap">
            {activeTab !== 'Discover' ? activeTab : 'Other Hubs'}
          </span>
          <ChevronDown className="w-4 h-4 ml-1" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {tabs.slice(1).map((tab) => (
            <DropdownMenuItem key={tab.name} disabled={tab.disabled}>
              <Link
                href={tab.href}
                className="flex items-center gap-3 w-full py-1"
                onClick={() => setActiveTab(tab.name)}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  // Desktop view
  const desktopView = (
    <div className="flex flex-col min-w-full">
      {tabs.map((tab) =>
        tab.disabled ? (
          <div
            key={tab.name}
            className="w-full px-4 py-3 flex items-center gap-3 text-gray-600 cursor-not-allowed"
          >
            {tab.icon}
            <span className="text-sm whitespace-nowrap">{tab.name}</span>
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
            <span className="text-sm whitespace-nowrap">{tab.name}</span>
          </Link>
        ),
      )}
    </div>
  );

  return (
    <div className="w-full lg:w-40 bg-black">
      <div className="lg:hidden border-b border-gray-800">{mobileView}</div>
      <div className="hidden lg:block">{desktopView}</div>
    </div>
  );
}
