export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <div className="w-8 h-8 border-[3px] border-border-subtle border-t-primary rounded-full animate-spin" />
    </div>
  );
}
