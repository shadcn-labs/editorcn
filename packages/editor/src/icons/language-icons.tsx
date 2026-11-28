import React from "react";

const LangIcon = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

export const DEFAULT_LANGUAGE_ICONS: Record<string, React.ReactNode> = {
  bash: (
    <LangIcon>
      <rect x="2.5" y="4" width="19" height="16" rx="2" />
      <path d="M6.5 9.5l3.5 3-3.5 3" />
      <path d="M12 15.5h5.5" />
    </LangIcon>
  ),
  c: (
    <LangIcon>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15.6 9.3a4.5 4.5 0 1 0 0 5.4" />
    </LangIcon>
  ),
  cpp: (
    <LangIcon>
      <circle cx="9.5" cy="12" r="6.5" />
      <path d="M12.3 9.7a3.3 3.3 0 1 0 0 4.6" />
      <path d="M15.7 10.5v3M14.2 12h3" />
      <path d="M19.3 10.5v3M17.8 12h3" />
    </LangIcon>
  ),
  css: (
    <LangIcon>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M9.7 7.5l-1 9" />
      <path d="M15.3 7.5l-1 9" />
      <path d="M7 10.3h11" />
      <path d="M6.5 14.3h11" />
    </LangIcon>
  ),
  go: (
    <LangIcon>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M12.6 9.7A3.3 3.3 0 1 0 12.6 14.3" />
      <path d="M12.6 12h-1.9" />
      <circle cx="17" cy="12" r="2.9" />
    </LangIcon>
  ),
  html: (
    <LangIcon>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M9.5 8.5L6.5 12l3 3.5" />
      <path d="M14.5 8.5L17.5 12l-3 3.5" />
      <path d="M13 7.3l-2 9.4" />
    </LangIcon>
  ),
  java: (
    <LangIcon>
      <path d="M6 10h10v5a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-5z" />
      <path d="M16 12h1.3a1.8 1.8 0 0 1 0 3.6H16" />
      <path d="M9.3 3.8c-.9.8-.9 1.6 0 2.4M13.3 3.8c-.9.8-.9 1.6 0 2.4" />
      <path d="M6 19.3h10" />
    </LangIcon>
  ),
  javascript: (
    <LangIcon>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M10.5 8v6.5a2 2 0 0 1-3.5 1.3" />
      <path d="M17 8.8a2 2 0 0 0-2-.8c-1.1 0-2.2.6-2.2 1.7 0 1 .9 1.4 2.2 1.7 1.3.3 2.3.7 2.3 1.9 0 1.1-1 1.8-2.3 1.8a2.4 2.4 0 0 1-2.3-1.4" />
    </LangIcon>
  ),
  json: (
    <LangIcon>
      <path d="M8 3H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2" />
      <path d="M16 3h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2" />
    </LangIcon>
  ),
  kotlin: (
    <LangIcon>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M9 7.5v9" />
      <path d="M9 12l6-4.5" />
      <path d="M9 12l6 4.5" />
    </LangIcon>
  ),
  markdown: (
    <LangIcon>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M6 15V9l3 4 3-4v6" />
      <path d="M16.5 9v6" />
      <path d="M14.5 13l2 2 2-2" />
    </LangIcon>
  ),
  php: (
    <LangIcon>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M11.5 8.5L7.5 12l4 3.5" />
      <path d="M15.2 8.2c1.1 0 1.9.6 1.9 1.6 0 1.1-.9 1.5-1.8 1.8-.6.2-1 .5-1 1.1" />
      <circle cx="14.3" cy="16.2" r=".5" fill="currentColor" stroke="none" />
    </LangIcon>
  ),
  plaintext: (
    <LangIcon>
      <rect x="4" y="2.5" width="16" height="19" rx="2" />
      <line x1="7.5" y1="7.5" x2="16.5" y2="7.5" />
      <line x1="7.5" y1="11.5" x2="16.5" y2="11.5" />
      <line x1="7.5" y1="15.5" x2="13.5" y2="15.5" />
    </LangIcon>
  ),
  python: (
    <LangIcon>
      <path d="M4.5 15c0-3 2.5-4.7 5.7-4.7h1.6c2.8 0 5-2 5-4.5" />
      <path d="M9.5 3.3c1.3-.3 2.6 0 3.3 1-.7 1-2 1.3-3.3 1" />
      <circle cx="15.5" cy="4.3" r=".55" fill="currentColor" stroke="none" />
      <path d="M17.8 4.5l1.4-.6M17.8 4.9l1.4.6" />
    </LangIcon>
  ),
  ruby: (
    <LangIcon>
      <polygon points="12 2.5 19.5 8 12 21.5 4.5 8" />
      <path d="M4.5 8h15" />
      <path d="M12 2.5v19" />
    </LangIcon>
  ),
  rust: (
    <LangIcon>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2.3" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
      <path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </LangIcon>
  ),
  sql: (
    <LangIcon>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
      <path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </LangIcon>
  ),
  swift: (
    <LangIcon>
      <path d="M19 4.5c-2.6 4-5.5 7-8.3 9 2-.2 3.7-1 4.8-2.6-.7 2.8-2.8 5-5.3 6.1 3 .5 5.6-.5 7.2-2.4.4 2-.4 3.9-1.9 4.9 3.7-1.3 6-4.2 6.6-7.6-1 2.6-2.8 4.6-4.6 5.8" />
    </LangIcon>
  ),
  typescript: (
    <LangIcon>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M7.3 8.2h5M9.8 8.2v7.6" />
      <path d="M17 8.8a2 2 0 0 0-2-.8c-1.1 0-2.2.6-2.2 1.7 0 1 .9 1.4 2.2 1.7 1.3.3 2.3.7 2.3 1.9 0 1.1-1 1.8-2.3 1.8a2.4 2.4 0 0 1-2.3-1.4" />
    </LangIcon>
  ),
  xml: (
    <LangIcon>
      <path d="M8 7l-4.5 5 4.5 5" />
      <path d="M16 7l4.5 5-4.5 5" />
      <path d="M12 8v8" />
    </LangIcon>
  ),
  yaml: (
    <LangIcon>
      <rect x="2.5" y="3" width="19" height="18" rx="2" />
      <path d="M6.5 8h2M9.5 8h8" />
      <path d="M6.5 12h2M9.5 12h6" />
      <path d="M6.5 16h2M9.5 16h7" />
    </LangIcon>
  ),
};
