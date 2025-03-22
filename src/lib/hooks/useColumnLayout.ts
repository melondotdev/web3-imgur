import { useEffect, useState } from 'react';

export function useColumnLayout() {
  const [columnCount, setColumnCount] = useState(4);
  const [columnWidth, setColumnWidth] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const updateColumns = () => {
      const mainElement = document.querySelector('main');
      if (!mainElement) return;

      const sidebarWidth = 160; // w-40 class from Sidebar.tsx equals 10rem (160px)
      const minColumnWidth = 200; // Minimum width for each column
      const gap = 16; // 1rem = 16px
      const padding = 32; // 32px for padding (16px each side)

      // Calculate available width accounting for sidebar and padding
      const availableWidth = mainElement.clientWidth - sidebarWidth - padding;

      // Calculate maximum number of columns that can fit while maintaining minimum width
      const maxColumns = Math.floor(
        (availableWidth + gap) / (minColumnWidth + gap),
      );
      const newColumnCount = Math.max(1, Math.min(maxColumns, 5)); // Between 1 and 6 columns

      // Calculate the actual column width to fill available space
      const totalGapWidth = (newColumnCount - 1) * gap;
      const newColumnWidth = Math.floor(
        (availableWidth - totalGapWidth) / newColumnCount,
      );

      setColumnCount(newColumnCount);
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
