export default function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 animate-fade-in">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl skeleton" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 skeleton" />
              <div className="h-3 w-1/3 skeleton" />
            </div>
            <div className="h-5 w-20 skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in p-4">
      <div className="h-8 w-48 skeleton mx-auto" />
      <div className="glass p-6">
        <div className="h-4 w-24 skeleton mb-2" />
        <div className="h-8 w-40 skeleton" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="glass p-4 h-20 skeleton" />
        <div className="glass p-4 h-20 skeleton" />
      </div>
      <div className="glass p-4 h-48 skeleton" />
      <LoadingSkeleton count={3} />
    </div>
  );
}
