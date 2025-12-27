import Image from 'next/image';

export function SchoolPayLogo({ size = 24 }: { size?: number; color?: string }) {
  return (
    <Image
      src="/School_Logo.png"
      alt="School Logo"
      width={size}
      height={size}
    />
  );
}
