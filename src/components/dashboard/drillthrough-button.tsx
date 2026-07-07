'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrillthroughButtonProps {
  href: string;
  label?: string;
  className?: string;
}

export default function DrillthroughButton({ href, label = 'View Details', className }: DrillthroughButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-semibold text-[#004B87] hover:text-[#003B6B] transition-colors group',
        className
      )}
    >
      <span>{label}</span>
      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
