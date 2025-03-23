import { useEffect, useState } from 'react';

export function useColumnLayout() {
  const [columnCount, setColumnCount] = useState(4);
  const [columnWidth, setColumnWidth] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const updateColumns = () => {
      const mainElement = document.querySelector('main');
      if (!mainElement) return;

      const sidebarWidth = window.innerWidth >= 1024 ? 160 : 0; // w-40 class from Sidebar.tsx equals 10rem (160px), only on desktop
      const gap = 8; // 0.5rem gap between columns
      const padding = 16; // 2rem total padding (0.5rem each side + any parent padding)

      // Calculate available width accounting for sidebar, padding, and viewport constraints
      const availableWidth = Math.min(
        mainElement.clientWidth - sidebarWidth - padding,
        window.innerWidth - padding, // Ensure we never exceed viewport width
      );

      // Determine column count based on screen width
      let cols: number;
      if (availableWidth < 480)
        cols = 2; // Very small screens
      else if (availableWidth < 768)
        cols = 3; // Medium screens
      else if (availableWidth < 1024)
        cols = 4; // Large screens
      else cols = 5; // Very large screens

      // Calculate column width to fill the available space perfectly
      const totalGapWidth = (cols - 1) * gap;
      const newColumnWidth = Math.floor(
        (availableWidth - totalGapWidth) / cols,
      );

      setColumnCount(cols);
      setColumnWidth(newColumnWidth);
    };

    // Debounced resize handler
    const debouncedUpdateColumns = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateColumns, 150); // 150ms debounce
    };

    // Initial calculation
    updateColumns();

    // Add resize listener with debouncing
    window.addEventListener('resize', debouncedUpdateColumns);

    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedUpdateColumns);
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    columnCount,
    columnWidth,
  };
}
