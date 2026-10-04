interface AdminPageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-navy md:text-3xl">{title}</h1>
        {description && (
          <p className="mt-1 text-graphite/80">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
