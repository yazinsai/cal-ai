'use client';

import { useEffect } from 'react';

export function IconGenerator() {
  useEffect(() => {
    // Generate PWA icons programmatically (placeholder)
    const sizes = [192, 512, 96];
    
    sizes.forEach(size => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Background
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(0, 0, size, size);
        
        // Icon (simple food symbol)
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${size * 0.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🍽️', size / 2, size / 2);
        
        // Convert to blob and create download link (for development)
        canvas.toBlob((blob) => {
          if (blob && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `icon-${size}.png`;
            // Uncomment to auto-download icons in development
            // a.click();
            URL.revokeObjectURL(url);
          }
        });
      }
    });
  }, []);

  return null;
}