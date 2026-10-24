import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedVaultProps {
  isLocked?: boolean;
  isBreached?: boolean;
  size?: number;
}

export const AnimatedVault: React.FC<AnimatedVaultProps> = ({
  isLocked = true,
  isBreached = false,
  size = 180,
}) => {
  const primaryColor = isBreached ? '#EF4444' : isLocked ? '#06B6D4' : '#10B981';
  const glowColor = isBreached
    ? 'rgba(239, 68, 68, 0.4)'
    : isLocked
    ? 'rgba(6, 182, 212, 0.35)'
    : 'rgba(16, 185, 129, 0.4)';

  return (
    <div className="relative inline-flex items-center justify-center p-4">
      {/* Outer Pulse Glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size * 1.2,
          height: size * 1.2,
          background: `radial-gradient(circle, ${glowColor} 0%, rgba(0,0,0,0) 70%)`,
        }}
        animate={{
          scale: isBreached ? [1, 1.15, 1] : [1, 1.05, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: isBreached ? 0.8 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Heavy Steel Door Rim */}
        <circle cx="100" cy="100" r="90" stroke="#1F2B48" strokeWidth="8" fill="#0D1322" />
        <circle cx="100" cy="100" r="82" stroke={primaryColor} strokeWidth="2" strokeDasharray="6 6" />

        {/* 8 Locking Bolts around the Rim */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const cx = 100 + Math.cos(rad) * 78;
          const cy = 100 + Math.sin(rad) * 78;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="4"
              fill={isBreached ? '#EF4444' : isLocked ? '#22D3EE' : '#10B981'}
            />
          );
        })}

        {/* Rotating Outer Dial Gear */}
        <motion.g
          animate={{ rotate: isBreached ? [0, 180, 360] : isLocked ? 0 : 90 }}
          transition={{
            duration: isBreached ? 1.5 : 0.8,
            repeat: isBreached ? Infinity : 0,
            ease: 'linear',
          }}
          style={{ originX: '100px', originY: '100px' }}
        >
          <circle cx="100" cy="100" r="60" stroke="#1F2B48" strokeWidth="4" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <line
              key={deg}
              x1="100"
              y1="44"
              x2="100"
              y2="49"
              stroke={primaryColor}
              strokeWidth="2"
              transform={`rotate(${deg} 100 100)`}
            />
          ))}
        </motion.g>

        {/* Inner Dial */}
        <motion.circle
          cx="100"
          cy="100"
          r="40"
          fill="#131B30"
          stroke={primaryColor}
          strokeWidth="3"
          animate={{
            rotate: isLocked ? [0, 45, 0, -45, 0] : 120,
          }}
          transition={{
            duration: 8,
            repeat: isLocked ? Infinity : 0,
            ease: 'easeInOut',
          }}
          style={{ originX: '100px', originY: '100px' }}
        />

        {/* Three-Spoke Vault Wheel Handle */}
        <motion.g
          animate={{ rotate: isLocked ? 0 : 180 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          style={{ originX: '100px', originY: '100px' }}
        >
          {[0, 120, 240].map((angle, i) => (
            <line
              key={i}
              x1="100"
              y1="100"
              x2="100"
              y2="66"
              stroke={primaryColor}
              strokeWidth="4"
              strokeLinecap="round"
              transform={`rotate(${angle} 100 100)`}
            />
          ))}
          <circle cx="100" cy="100" r="14" fill="#070A13" stroke={primaryColor} strokeWidth="3" />
        </motion.g>

        {/* Central Lock Emblem / Status LED */}
        <circle
          cx="100"
          cy="100"
          r="6"
          fill={isBreached ? '#EF4444' : isLocked ? '#06B6D4' : '#10B981'}
        />
      </svg>
    </div>
  );
};
