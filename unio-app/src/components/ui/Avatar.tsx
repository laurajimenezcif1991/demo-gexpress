interface AvatarProps {
  initials: string;
  color?: string;
  size?: number;
  imgUrl?: string;
}

export default function Avatar({ initials, color = '#8750F6', size = 48, imgUrl }: AvatarProps) {
  if (imgUrl) {
    return (
      <img
        src={imgUrl}
        alt={initials}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color + '22',
        border: `2px solid ${color}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: `${size * 0.32}px`,
        color: color,
      }}
    >
      {initials}
    </div>
  );
}
