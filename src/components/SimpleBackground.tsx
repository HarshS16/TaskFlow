import React from 'react';

export default function SimpleBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />
      
      {/* Floating particles using CSS */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}