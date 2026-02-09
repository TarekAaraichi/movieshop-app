import React from "react";

type IconProps = { className?: string };

export const CartIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M3 3h2l.4 2M7 13h10l4-8H5.4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="20" r="1" fill="currentColor" />
    <circle cx="18" cy="20" r="1" fill="currentColor" />
  </svg>
);

export const UserIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ToolsIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M14.7 6.3 17.7 9.3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 21l7.5-7.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.2 7.8a4 4 0 1 0 5.6 5.6L21 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ThemeIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const HourglassIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M6 2h12M6 22h12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 2v6a4 4 0 0 0 2 3.3V13a4 4 0 0 0-2 3.3v6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const GearIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 0 1 2.4 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.6-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.8L4.3 4.6A2 2 0 0 1 7.1 1.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1A1.7 1.7 0 0 0 10.1 2v-.1A2 2 0 0 1 14 2v.1a1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.8-.3l.1-.1A2 2 0 0 1 21.6 7l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1c.2.5.9.9 1.6 1H21a2 2 0 0 1 0 4h-.1c-.7.1-1.4.5-1.6 1z"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Technology icons (simplified/brand-like)
export const NextJsIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M3 3v18h18"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 12h8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ReactIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
    <g stroke="currentColor" strokeWidth="1.2" fill="none">
      <ellipse cx="12" cy="12" rx="7" ry="2.5" transform="rotate(0 12 12)" />
      <ellipse cx="12" cy="12" rx="7" ry="2.5" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="7" ry="2.5" transform="rotate(120 12 12)" />
    </g>
  </svg>
);

export const PrismaIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 2L22 12 12 22 2 12 12 2z"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="currentColor"
    />
  </svg>
);

export const PostgresIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 2c3 0 6 2 6 5 0 7-6 11-6 11s-6-4-6-11c0-3 3-5 6-5z"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="currentColor"
    />
  </svg>
);

export const TailwindIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="currentColor"
    />
  </svg>
);

export const ShadcnIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect
      x="4"
      y="4"
      width="16"
      height="16"
      rx="3"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="currentColor"
    />
  </svg>
);

export const LockIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect
      x="3"
      y="11"
      width="18"
      height="10"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M7 11V8a5 5 0 0 1 10 0v3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const TsIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="currentColor"
    />
    <text x="7" y="17" fontSize="8" fill="#fff">
      TS
    </text>
  </svg>
);

export const VitestIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M5 13l4 4L19 7"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const HuskyIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 2l3 5 5 2-3 4-5 3-5-3-3-4 5-2 3-5z"
      stroke="currentColor"
      strokeWidth="1"
      fill="currentColor"
    />
  </svg>
);

export const VercelIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 3l9 18H3L12 3z"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="currentColor"
    />
  </svg>
);

const icons = {};
export default icons;
