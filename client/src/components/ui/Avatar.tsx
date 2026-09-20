
interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
  };

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .map((p) => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-elevated border border-border overflow-hidden flex-shrink-0 ${sizeClasses[size]} ${className}`}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="font-medium text-text-muted">{getInitials(name)}</span>
      )}
    </div>
  );
}
