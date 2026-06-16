'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage, getInitials } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserQuery } from '@/hooks/queries/use-users';
import { cn } from '@/lib/utils';

type UserNameProps = {
  userId?: string | null;
  /** Render as a Link to the user's admin profile. */
  link?: boolean;
  /** Show role under the name (e.g. "seller"). */
  showRole?: boolean;
  /** Show email under the name. */
  showEmail?: boolean;
  /** Avatar size in px. Set to 0 to hide the avatar. */
  avatarSize?: number;
  className?: string;
  /** Tailwind size for the display-name text. */
  nameClassName?: string;
};

/**
 * Renders `User → avatar + display name` for a given userId, instead of leaking
 * the raw uid into the UI. Falls back to a "—" dash when no id is provided,
 * a skeleton while loading, and the raw id only if the lookup fails.
 *
 * Designed for table rows / timelines where we don't want operators to ever
 * see Firebase UIDs. React Query dedupes concurrent calls for the same id.
 */
export function UserName({
  userId,
  link = false,
  showRole = false,
  showEmail = false,
  avatarSize = 28,
  className,
  nameClassName,
}: UserNameProps) {
  const query = useUserQuery(userId ?? '');

  if (!userId) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (query.isLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {avatarSize > 0 && (
          <Skeleton style={{ width: avatarSize, height: avatarSize }} className="rounded-full" />
        )}
        <Skeleton className="h-4 w-28" />
      </div>
    );
  }

  const u = query.data;
  const displayName = u?.displayName ?? userId;
  const isMissing = !u;

  const body = (
    <div className={cn('flex min-w-0 items-center gap-2', className)}>
      {avatarSize > 0 && (
        <Avatar
          className="shrink-0"
          style={{ width: avatarSize, height: avatarSize }}
        >
          {u?.profileImageUrl && (
            <AvatarImage src={u.profileImageUrl} alt={displayName} />
          )}
          <AvatarFallback className="text-[10px]">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="flex min-w-0 flex-col leading-tight">
        <span
          className={cn(
            'truncate',
            isMissing ? 'font-mono text-xs text-muted-foreground' : 'font-medium text-sm',
            nameClassName,
          )}
        >
          {displayName}
        </span>
        {showEmail && u?.email && (
          <span className="truncate text-[11px] text-muted-foreground">{u.email}</span>
        )}
        {showRole && u?.role && (
          <span className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
            {u.role}
          </span>
        )}
      </div>
    </div>
  );

  if (link) {
    return (
      <Link
        href={`/admin/users/${encodeURIComponent(userId)}`}
        className="inline-block hover:[&_.truncate]:text-primary"
      >
        {body}
      </Link>
    );
  }

  return body;
}
