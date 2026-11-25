import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[50vh] place-items-center text-center">
      <div>
        <p className="text-5xl font-bold text-brand-600">404</p>
        <p className="mt-2 text-muted">This page doesn&apos;t exist.</p>
        <Link href="/" className="mt-4 inline-block rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
