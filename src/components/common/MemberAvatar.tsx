import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Member } from '@/types/index';

type AvatarSize = 'sm' | 'md' | 'lg';

interface MemberAvatarProps {
  member: Pick<Member, 'name' | 'avatar'>;
  size?: AvatarSize;
  /** Show a tooltip title on hover. Defaults to member.name. */
  showTitle?: boolean;
}

// Map our size prop to the shadcn Avatar component's size prop values
const SIZE_MAP: Record<AvatarSize, 'sm' | 'default' | 'lg'> = {
  sm: 'sm',
  md: 'default',
  lg: 'lg',
};

/**
 * Renders a member's avatar image, falling back to initials in a circle
 * when no avatar URL is available.
 *
 * Initials are extracted from the first two words of the member's name
 * (e.g., "김 민준" → "김민").
 */
export default function MemberAvatar({
  member,
  size = 'md',
  showTitle = true,
}: MemberAvatarProps) {
  const initials = member.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <Avatar
      size={SIZE_MAP[size]}
      title={showTitle ? member.name : undefined}
    >
      {member.avatar && (
        <AvatarImage src={member.avatar} alt={member.name} />
      )}
      <AvatarFallback className="bg-primary text-primary-foreground font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
