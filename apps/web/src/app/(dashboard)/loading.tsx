export default function DashboardLoading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-accent" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}
