'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { LogOut } from 'lucide-react';

export function TreasurerHeader() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login'; // redirect to login after logout
  };

  const navLinks = [
    { href: '/treasurer/dashboard', label: 'Dashboard' },
    { href: '/treasurer/pending-payments', label: 'Pending Payments' },
    { href: '/treasurer/historical-payments', label: 'Historical Payments' },
  ];

  return (
    <header className="flex items-center justify-between bg-white px-8 py-3 shadow-sm border-b border-gray-200">
      {/* Left: Logo and title */}
      <div className="flex items-center gap-2">
        <Image
          src="/School_Logo.png"
          alt="SK SENTUL 2 Logo"
          width={60}
          height={60}
          
        />
        <span className="font-bold text-gray-900 text-2xl">
          SK SENTUL <span>2</span>
        </span>
      </div>

      {/* Right: Navigation + Logout + Avatar */}
      <div className="flex items-center gap-6">
        {/* Navigation links */}
        <nav className="flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm ${
                pathname === link.href
                  ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Logout and avatar */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="text-red-500 text-sm flex items-center gap-1 hover:underline"
          >
            <LogOut size={16} />
            Logout
          </button>

          
        </div>
      </div>
    </header>
  );
}
