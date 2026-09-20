import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-surface border border-border text-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-elevated transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
            currentPage === page
              ? 'bg-primary text-white'
              : 'bg-surface border border-border text-text hover:bg-elevated'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-surface border border-border text-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-elevated transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
