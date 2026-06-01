type IconeProps = {
  size?: number;
};

/** Pin multicolor do Google Maps */
export function IconeGoogleMaps({ size = 22 }: IconeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill="#34A853"
      />
      <path d="M12 2v20s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#4285F4" />
      <path d="M12 2v11.5S5 12.88 5 9c0-3.87 3.13-7 7-7z" fill="#FBBC04" />
      <path d="M12 2v11.5s7 3.38 7 7c0 3.88-7 9.88-7 9.88V2z" fill="#EA4335" opacity="0.85" />
      <circle cx="12" cy="9" r="2.75" fill="#fff" />
      <circle cx="12" cy="9" r="1.35" fill="#4285F4" />
    </svg>
  );
}

/** Mascote simplificado do Waze (para fundo claro) */
export function IconeWaze({ size = 22 }: IconeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 2.5C7.86 2.5 4.5 5.86 4.5 10c0 4.2 4.9 10.5 6.2 12 .6.7 1.7.7 2.3 0 1.3-1.5 3.2-2.5 5.2-2.5h.6c2 0 3.9 1 5.2 2.5.6.7 1.7.7 2.3 0 1.3-1.5 6.2-7.8 6.2-12 0-4.14-3.36-7.5-7.5-7.5z"
        fill="#33CCFF"
      />
      <circle cx="9" cy="10" r="1.35" fill="#fff" />
      <circle cx="15" cy="10" r="1.35" fill="#fff" />
      <path
        d="M9.5 13.2c.9 1 1.6 1.3 2.5 1.3s1.6-.3 2.5-1.3"
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
