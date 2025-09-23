import Link from "next/link";

export default function CollectionsIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Collections</h1>
      <div className="grid gap-4">
        <Link href="/collections/new" className="block p-4 bg-gray-800 rounded">
          New releases
        </Link>
        <Link
          href="/collections/top-rated"
          className="block p-4 bg-gray-800 rounded"
        >
          Top rated
        </Link>
        <Link
          href="/collections/genres"
          className="block p-4 bg-gray-800 rounded"
        >
          By genre
        </Link>
      </div>
    </div>
  );
}
