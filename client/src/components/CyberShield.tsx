import React from 'react';
import { motion } from 'framer-motion';

interface CyberShieldProps {
  size?: number;
  threatLevel?: 'CLEAN' | 'SUSPICIOUS' | 'CRITICAL' | 'BLOCKED';
  className?: string;
}

export const CyberShield: React.FC<CyberShieldProps> = ({
  size = 48,
  threatLevel = 'CLEAN',
  className = '',
}) => {
  const getColor = () => {
    switch (threatLevel) {
      case 'CRITICAL':
        return { stroke: '#EF4444', fill: 'rgba(239, 68, 68, 0.15)', glow: 'rgba(239, 68, 68, 0.5)' };
      case 'SUSPICIOUS':
        return { stroke: '#F59E0B', fill: 'rgba(245, 158, 11, 0.15)', glow: 'rgba(245, 158, 11, 0.5)' };
      case 'BLOCKED':
        return { stroke: '#10B981', fill: 'rgba(16, 185, 129, 0.2)', glow: 'rgba(16, 185, 129, 0.6)' };
      default:
        return { stroke: '#06B6D4', fill: 'rgba(6, 182, 212, 0.15)', glow: 'rgba(6, 182, 212, 0.5)' };
    }
  };

  const c = getColor();

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{
          filter: [
            `drop-shadow(0 0 6px ${c.glow})`,
            `drop-shadow(0 0 16px ${c.glow})`,
            `drop-shadow(0 0 6px ${c.glow})`,
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Outer Hexagon Circuit Ring */}
        <path
          d="M24 4L42 14V34L24 44L6 34V14L24 4Z"
          stroke={c.stroke}
          strokeWidth="1.5"
          strokeDasharray="4 3"
          strokeOpacity="0.4"
        />

        {/* Core Shield Shape */}
        <motion.path
          d="M24 7L38 14V25C38 34 24 41 24 41C24 41 10 34 10 25V14L24 7Z"
          fill={c.fill}
          stroke={c.stroke}
          strokeWidth="2.5"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />

        {/* Inner Security Emblem / Circuit Cross */}
        <path
          d="M24 16V31M17 23H31"
          stroke={c.stroke}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Core Glowing Dot */}
        <circle cx="24" cy="23" r="3" fill={c.stroke} />
      </motion.svg>
    </div>
  );
};
