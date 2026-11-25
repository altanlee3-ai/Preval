export default function Loading() {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-sm text-muted">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" />
        Loading…
      </div>
    </div>
  );
}
