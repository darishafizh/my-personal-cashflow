interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="glass p-8 text-center animate-fade-in">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="text-text-secondary font-medium mb-1">{title}</p>
      {description && (
        <p className="text-text-muted text-sm">{description}</p>
      )}
    </div>
  );
}
