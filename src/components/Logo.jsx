// Reusable SVG logo component — replaces the 💰 emoji everywhere

export function LogoIcon({ size = 28, color = '#1a73e8' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect width="32" height="32" rx="8" fill={color} />
      <path d="M9 16C9 12.134 12.134 9 16 9C19.866 9 23 12.134 23 16C23 19.866 19.866 23 16 23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 12V16L19 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 20L13 22L11 26" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function LogoBrand({ size = 28, textSize = 20, color = '#1a73e8', textColor }) {
  // textColor defaults to matching the icon color
  const resolvedTextColor = textColor || color
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '9px',
      fontWeight: 800,
      fontSize: textSize,
      color: resolvedTextColor,
      letterSpacing: '-0.5px',
      lineHeight: 1,
      textDecoration: 'none',
    }}>
      <LogoIcon size={size} color={color} />
      LoanHub
    </span>
  )
}
