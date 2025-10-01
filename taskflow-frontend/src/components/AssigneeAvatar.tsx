export default function AssigneeAvatar({ name, avatar }: { name: string; avatar?: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="avatar" title={name}>
      {avatar ? (
        <img src={avatar} alt={name} className="avatar-img" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
