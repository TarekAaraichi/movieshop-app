import prisma from '@/lib/prisma';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

// AdminPage server component
export default async function AdminPage({
    searchParams,
}: {
    searchParams: { q?: string };
}) {
    const q = searchParams.q ?? '';

    const movies = await prisma.movie.findMany({
        where: q
            ? {
                    title: { contains: q, mode: 'insensitive' },
                }
            : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
            genres: { include: { genre: true } },
            people: { include: { person: true } },
        },
    });

    // server action for deleting a movie
    async function deleteMovie(formData: FormData) {
        'use server';
        const id = formData.get('movieId') as string;
        if (!id) {
            throw new Error('Missing movie ID');
        }
        await prisma.movie.delete({ where: { id } });
        // refresh admin page to reflect deletion
        revalidatePath('/admin');
    }

    return (
        <div className="min-h-screen p-6 bg-gray-50">
            {/* page header */}
            <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-extrabold text-gray-800">Admin Management</h1>
            <Link
                href="/admin/create"
                className="bg-indigo-600 text-white py-2 px-4 rounded-md shadow hover:bg-indigo-700"
            >
                Create New Movie
            </Link>
            </div>

            {/* search form */}
            <form method="GET" className="mb-4">
            <input
                name="q"
                type="search"
                placeholder="Search by title..."
                defaultValue={q}
                className="p-2 border border-gray-300 rounded bg-gray-100 text-gray-800 focus:ring focus:ring-indigo-300"
            />
            </form>

            {/* movies list */}
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300 shadow">
                <thead className="bg-gray-100">
                <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Title</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Director</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Genre</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Release Date</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Created At</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Updated At</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {movies.map((movie) => {
                    // find the director among the people relation
                    const directorLink = movie.people.find((p) => p.role === 'DIRECTOR');
                    return (
                    <tr key={movie.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-800">{movie.title}</td>
                        <td className="px-4 py-2 text-gray-600">
                        {directorLink?.person.fullName ?? '—'}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                        {movie.genres.map((g) => g.genre.name).join(', ') || '—'}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                        {movie.releaseDate?.toISOString().split('T')[0]}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                        {movie.createdAt?.toISOString().split('T')[0]}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                        {movie.updatedAt?.toISOString().split('T')[0]}
                        </td>
                        <td className="px-4 py-2 space-x-4">
                        <Link
                            href={`/movies/${movie.id}/edit`}
                            className="text-indigo-600 hover:underline"
                        >
                            Edit
                        </Link>
                        <form action={deleteMovie} className="inline-block">
                            <input type="hidden" name="movieId" value={movie.id} />
                            <button
                            type="submit"
                            className="text-red-600 hover:underline"
                            >
                            Delete
                            </button>
                        </form>
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
            </div>
        </div>
    );
}
