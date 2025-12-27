import Image from 'next/image';

export function SchoolPayLogo({ size = 60 }: { size?: number; color?: string }) {
  return (
    <Image
      src="/School_Logo.png"
      alt="School Logo"
      width={60}
      height={60}
    />
  );
}
