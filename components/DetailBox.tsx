import Link from "next/link";

interface DetailBoxProps {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  isLink?: boolean;
}

export default function DetailBox({
  icon: Icon,
  label,
  value,
  isLink = false,
}: DetailBoxProps) {
  return (
    <div className="flex flex-col p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group">
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">
        <Icon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
        {label}
      </div>
      {isLink && value !== "Not provided" ? (
        <Link
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate"
        >
          {value}
        </Link>
      ) : (
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
          {value}
        </p>
      )}
    </div>
  );
}
