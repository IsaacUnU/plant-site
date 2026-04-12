import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <p className="text-6xl mb-4">🍂</p>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Page not found</h1>
      <p className="text-gray-500 mb-8">
        This plant seems to have wandered off. Let&apos;s get you back on track.
      </p>
      <Link
        href="/"
        className="inline-block bg-green-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-800 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
