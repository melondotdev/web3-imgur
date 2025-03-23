'use client';

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-4 px-4 mt-auto">
      <div className="flex justify-center items-center space-x-6">
        <a
          href="https://bork.institute"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
        >
          © 2025 Bork Research Institute
        </a>
        <a
          href="https://dexscreener.com/solana/2frx7xzbz3bqhs9ndfy6saupawpbewdztbpeexmhk87l"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
        >
          chart
        </a>
        <a
          href="https://jup.ag/swap/SOL-yzRagkRLnzG3ksiCRpknHNVc1nep6MMS7rKJv8YHGFM"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-yellow-500/80 hover:text-yellow-500 transition-colors"
        >
          buy now
        </a>
      </div>
    </footer>
  );
}
