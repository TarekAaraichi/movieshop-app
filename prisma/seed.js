const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // Clear existing data (useful for repeated runs in dev)
    await prisma.moviePerson.deleteMany().catch(() => {});
    await prisma.movieGenre.deleteMany().catch(() => {});
    await prisma.movie.deleteMany().catch(() => {});
    await prisma.genre.deleteMany().catch(() => {});
    await prisma.person.deleteMany().catch(() => {});
    await prisma.user.deleteMany().catch(() => {});

    // Create genres
    const genres = await Promise.all([
        prisma.genre.create({ data: { name: "Action" } }),
        prisma.genre.create({ data: { name: "Comedy" } }),
        prisma.genre.create({ data: { name: "Drama" } }),
        prisma.genre.create({ data: { name: "Sci-Fi" } }),
        prisma.genre.create({ data: { name: "Horror" } }),
        prisma.genre.create({ data: { name: "Thriller" } }),
        prisma.genre.create({ data: { name: "Romance" } }),
    ]);

    // Create people (directors / actors) with picsum photos
    const peopleNames = [
        // 15 directors (some direct the movies listed above)
        "Christopher Nolan",
        "Quentin Tarantino",
        "Greta Gerwig",
        "Jordan Peele",
        "Denis Villeneuve",
        "David Fincher",
        "Wes Anderson",
        "Damien Chazelle",
        "Alejandro González Iñárritu",
        "Taika Waititi",
        "Patty Jenkins",
        "Alfonso Cuarón",
        "Steven Spielberg",
        "Ridley Scott",
        "Martin Scorsese",

        // 30 actors (selected from the casts of the movies above / well-known performers)
        "Leonardo DiCaprio",
        "Joseph Gordon-Levitt",
        "Elliot Page",
        "Jamie Foxx",
        "Christoph Waltz",
        "Kerry Washington",
        "Saoirse Ronan",
        "Florence Pugh",
        "Timothée Chalamet",
        "Matthew McConaughey",
        "Anne Hathaway",
        "Jessica Chastain",
        "Daniel Kaluuya",
        "Allison Williams",
        "Bradley Whitford",
        "Ryan Gosling",
        "Harrison Ford",
        "Ana de Armas",
        "Brad Pitt",
        "Edward Norton",
        "Helena Bonham Carter",
        "Ralph Fiennes",
        "Adrien Brody",
        "Amy Adams",
        "Jeremy Renner",
        "Jesse Eisenberg",
        "Andrew Garfield",
        "Justin Timberlake",
        "Emma Stone",
        "Tom Hardy",
    ];

    const people = [];
    for (let i = 0; i < peopleNames.length; i++) {
        // Use picsum with a small square image per person; index starts at 1
        const img = `https://picsum.photos/200/200?random=${i + 1}`;
        const p = await prisma.person.create({
            data: { fullName: peopleNames[i], imageUrl: img },
        });
        people.push(p);
    }

    // Create 15 movies. Fill imageUrl values manually below (currently empty strings).
    const moviesData = [
        {
            title: "Inception",
            description: "A mind-bending thriller",
            price: "9.99",
            releaseDate: "2010-07-16",
            stock: 10,
            runtime: 148,
            imageUrl: "https://image.tmdb.org/t/p/w1280/gqgwNjwjSqGkOqkE2rppogenu4v.jpg", // <-- paste poster URL here
        },
        {
            title: "Django Unchained",
            description: "A western drama by Tarantino",
            price: "7.99",
            releaseDate: "2012-12-25",
            stock: 5,
            runtime: 165,
            imageUrl: "https://image.tmdb.org/t/p/w1280/72lbi9vD8ihfeOJTOPnQajVH9DM.jpg",
        },
        {
            title: "Little Women",
            description: "A period drama",
            price: "6.99",
            releaseDate: "2019-12-25",
            stock: 8,
            runtime: 135,
            imageUrl: "https://image.tmdb.org/t/p/w1280/hFJo334oFwE3xfclzQvGUiWul1p.jpg",
        },
        {
            title: "Interstellar",
            description: "A space epic",
            price: "8.99",
            releaseDate: "2014-11-07",
            stock: 12,
            runtime: 169,
            imageUrl: "https://image.tmdb.org/t/p/w1280/mS4EvhsrT0SQZOlWrQEzWI5KiUa.jpg",
        },
        {
            title: "Get Out",
            description: "A modern horror classic",
            price: "5.99",
            releaseDate: "2017-02-24",
            stock: 7,
            runtime: 104,
            imageUrl: "https://image.tmdb.org/t/p/w1280/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg",
        },
        {
            title: "Blade Runner 2049",
            description: "A visual sci-fi masterpiece",
            price: "9.49",
            releaseDate: "2017-10-06",
            stock: 6,
            runtime: 164,
            imageUrl: "https://image.tmdb.org/t/p/w1280/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
        },
        {
            title: "Fight Club",
            description: "A dark, stylish drama",
            price: "6.49",
            releaseDate: "1999-10-15",
            stock: 9,
            runtime: 139,
            imageUrl: "https://image.tmdb.org/t/p/w1280/jSziioSwPVrOy9Yow3XhWIBDjq1.jpg",
        },
        {
            title: "The Grand Budapest Hotel",
            description: "A whimsical comedy-drama",
            price: "7.49",
            releaseDate: "2014-03-28",
            stock: 8,
            runtime: 99,
            imageUrl: "https://image.tmdb.org/t/p/w1280/gOoCdhFwhVXIAdcWJzbDTorYMpA.jpg",
        },
        {
            title: "Arrival",
            description: "Thoughtful sci-fi drama",
            price: "8.29",
            releaseDate: "2016-11-11",
            stock: 11,
            runtime: 116,
            imageUrl: "https://image.tmdb.org/t/p/w1280/pEzNVQfdzYDzVK0XqxERIw2x2se.jpg",
        },
        {
            title: "The Social Network",
            description: "The rise of Facebook",
            price: "6.99",
            releaseDate: "2010-10-01",
            stock: 10,
            runtime: 120,
            imageUrl: "https://image.tmdb.org/t/p/w1280/wwhfLPo8sgBFlYmyqRo3Uj2PTZD.jpg",
        },
        {
            title: "La La Land",
            description: "A modern musical romance",
            price: "7.99",
            releaseDate: "2016-12-09",
            stock: 7,
            runtime: 128,
            imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
        },
        {
            title: "The Revenant",
            description: "A survival epic",
            price: "8.99",
            releaseDate: "2015-12-25",
            stock: 4,
            runtime: 156,
            imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/ji3ecJphATlVgWNY0B0RVXZizdf.jpg",
        },
        {
            title: "Jojo Rabbit",
            description: "A dark comedy with heart",
            price: "6.49",
            releaseDate: "2019-10-18",
            stock: 9,
            runtime: 108,
            imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/1mqL7VG4Ix8wmxwypmCA1HTHBky.jpg",
        },
        {
            title: "Wonder Woman",
            description: "A superhero origin story",
            price: "7.99",
            releaseDate: "2017-05-30",
            stock: 13,
            runtime: 141,
            imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/v4ncgZjG2Zu8ZW5al1vIZTsSjqX.jpg",
        },
        {
            title: "The Girl with the Dragon Tattoo",
            description: "A gripping thriller",
            price: "6.99",
            releaseDate: "2011-12-21",
            stock: 6,
            runtime: 158,
            imageUrl: "https://image.tmdb.org/t/p/w1280/zqDopwg7XQ4IfFX2dRlQCT1SwMG.jpg",
        },
    ];

    const movies = [];
    for (let i = 0; i < moviesData.length; i++) {
        const m = moviesData[i];
        const created = await prisma.movie.create({
            data: {
                title: m.title,
                description: m.description,
                price: m.price,
                releaseDate: new Date(m.releaseDate),
                imageUrl: m.imageUrl, // use the manual URL you paste above
                stock: m.stock,
                runtime: m.runtime,
            },
        });
        movies.push(created);
    }

    // Ensure the genre table contains the standard set (creates any missing entries)
    const genreNames = ["Action", "Comedy", "Drama", "Sci-Fi", "Horror", "Thriller", "Romance"];
    const existing = await prisma.genre.findMany({
        where: { name: { in: genreNames } },
    });
    const existingNames = new Set(existing.map((g) => g.name));
    for (const name of genreNames) {
        if (!existingNames.has(name)) {
            await prisma.genre.create({ data: { name } });
        }
    }

    // Create movie-genre links (simple mapping by index)
    const mgData = [
        // Inception (keep 2 of 3)
        { movieIndex: 0, genreIndex: 3 }, // Sci-Fi
        { movieIndex: 0, genreIndex: 5 }, // Thriller

        // Django Unchained (was 2 -> keep 1)
        { movieIndex: 1, genreIndex: 2 }, // Drama

        // Little Women (was 2 -> keep 1)
        { movieIndex: 2, genreIndex: 2 }, // Drama

        // Interstellar (was 2 -> keep 1)
        { movieIndex: 3, genreIndex: 3 }, // Sci-Fi

        // Get Out (was 2 -> keep 1)
        { movieIndex: 4, genreIndex: 4 }, // Horror

        // Blade Runner 2049 (was 2 -> keep 1)
        { movieIndex: 5, genreIndex: 3 }, // Sci-Fi

        // Fight Club (was 2 -> keep 1)
        { movieIndex: 6, genreIndex: 2 }, // Drama

        // The Grand Budapest Hotel (was 2 -> keep 1)
        { movieIndex: 7, genreIndex: 1 }, // Comedy

        // Arrival (was 2 -> keep 1)
        { movieIndex: 8, genreIndex: 3 }, // Sci-Fi

        // The Social Network (1)
        { movieIndex: 9, genreIndex: 2 }, // Drama

        // La La Land (was 2 -> keep 1)
        { movieIndex: 10, genreIndex: 6 }, // Romance

        // The Revenant (1)
        { movieIndex: 11, genreIndex: 2 }, // Drama

        // Jojo Rabbit (was 2 -> keep 1)
        { movieIndex: 12, genreIndex: 1 }, // Comedy

        // Wonder Woman (1)
        { movieIndex: 13, genreIndex: 0 }, // Action

        // The Girl with the Dragon Tattoo (was 2 -> keep 1)
        { movieIndex: 14, genreIndex: 5 }, // Thriller
    ];

    await prisma.movieGenre.createMany({
        data: mgData.map((d) => ({
            movieId: movies[d.movieIndex].id,
            genreId: genres[d.genreIndex].id,
        })),
    });

    // Assign some directors/actors to movies using people indices
    const mpData = [
        // Inception
        { movieIndex: 0, personIndex: 0, role: "DIRECTOR" }, // Christopher Nolan
        { movieIndex: 0, personIndex: 15, role: "ACTOR" }, // Leonardo DiCaprio
        { movieIndex: 0, personIndex: 16, role: "ACTOR" }, // Joseph Gordon-Levitt
        { movieIndex: 0, personIndex: 17, role: "ACTOR" }, // Elliot Page
        { movieIndex: 0, personIndex: 44, role: "ACTOR" }, // Tom Hardy

        // Django Unchained
        { movieIndex: 1, personIndex: 1, role: "DIRECTOR" }, // Quentin Tarantino
        { movieIndex: 1, personIndex: 18, role: "ACTOR" }, // Jamie Foxx
        { movieIndex: 1, personIndex: 19, role: "ACTOR" }, // Christoph Waltz
        { movieIndex: 1, personIndex: 15, role: "ACTOR" }, // Leonardo DiCaprio

        // Little Women (2019)
        { movieIndex: 2, personIndex: 2, role: "DIRECTOR" }, // Greta Gerwig
        { movieIndex: 2, personIndex: 21, role: "ACTOR" }, // Saoirse Ronan
        { movieIndex: 2, personIndex: 22, role: "ACTOR" }, // Florence Pugh
        { movieIndex: 2, personIndex: 23, role: "ACTOR" }, // Timothée Chalamet

        // Interstellar
        { movieIndex: 3, personIndex: 0, role: "DIRECTOR" }, // Christopher Nolan
        { movieIndex: 3, personIndex: 24, role: "ACTOR" }, // Matthew McConaughey
        { movieIndex: 3, personIndex: 25, role: "ACTOR" }, // Anne Hathaway
        { movieIndex: 3, personIndex: 26, role: "ACTOR" }, // Jessica Chastain

        // Get Out
        { movieIndex: 4, personIndex: 3, role: "DIRECTOR" }, // Jordan Peele
        { movieIndex: 4, personIndex: 27, role: "ACTOR" }, // Daniel Kaluuya
        { movieIndex: 4, personIndex: 28, role: "ACTOR" }, // Allison Williams

        // Blade Runner 2049
        { movieIndex: 5, personIndex: 4, role: "DIRECTOR" }, // Denis Villeneuve
        { movieIndex: 5, personIndex: 30, role: "ACTOR" }, // Ryan Gosling
        { movieIndex: 5, personIndex: 31, role: "ACTOR" }, // Harrison Ford
        { movieIndex: 5, personIndex: 32, role: "ACTOR" }, // Ana de Armas

        // Fight Club
        { movieIndex: 6, personIndex: 5, role: "DIRECTOR" }, // David Fincher
        { movieIndex: 6, personIndex: 34, role: "ACTOR" }, // Edward Norton
        { movieIndex: 6, personIndex: 33, role: "ACTOR" }, // Brad Pitt

        // The Grand Budapest Hotel
        { movieIndex: 7, personIndex: 6, role: "DIRECTOR" }, // Wes Anderson
        { movieIndex: 7, personIndex: 36, role: "ACTOR" }, // Ralph Fiennes
        { movieIndex: 7, personIndex: 37, role: "ACTOR" }, // Adrien Brody

        // Arrival
        { movieIndex: 8, personIndex: 4, role: "DIRECTOR" }, // Denis Villeneuve
        { movieIndex: 8, personIndex: 38, role: "ACTOR" }, // Amy Adams
        { movieIndex: 8, personIndex: 39, role: "ACTOR" }, // Jeremy Renner

        // The Social Network
        { movieIndex: 9, personIndex: 5, role: "DIRECTOR" }, // David Fincher
        { movieIndex: 9, personIndex: 40, role: "ACTOR" }, // Jesse Eisenberg
        { movieIndex: 9, personIndex: 41, role: "ACTOR" }, // Andrew Garfield
        { movieIndex: 9, personIndex: 42, role: "ACTOR" }, // Justin Timberlake

        // La La Land
        { movieIndex: 10, personIndex: 7, role: "DIRECTOR" }, // Damien Chazelle
        { movieIndex: 10, personIndex: 30, role: "ACTOR" }, // Ryan Gosling
        { movieIndex: 10, personIndex: 43, role: "ACTOR" }, // Emma Stone

        // The Revenant
        { movieIndex: 11, personIndex: 8, role: "DIRECTOR" }, // Alejandro González Iñárritu
        { movieIndex: 11, personIndex: 15, role: "ACTOR" }, // Leonardo DiCaprio
        { movieIndex: 11, personIndex: 44, role: "ACTOR" }, // Tom Hardy

        // Jojo Rabbit
        { movieIndex: 12, personIndex: 9, role: "DIRECTOR" }, // Taika Waititi
        // main Jojo Rabbit cast not in people list; actors will be auto-filled later if needed

        // Wonder Woman
        { movieIndex: 13, personIndex: 10, role: "DIRECTOR" }, // Patty Jenkins
        // main Wonder Woman cast not in people list; actors will be auto-filled later if needed

        // The Girl with the Dragon Tattoo
        { movieIndex: 14, personIndex: 5, role: "DIRECTOR" }, // David Fincher
        // main Dragon Tattoo cast not in people list; actors will be auto-filled later if needed
    ];

    await prisma.moviePerson.createMany({
        data: mpData.map((d) => ({
            movieId: movies[d.movieIndex].id,
            personId: people[d.personIndex].id,
            role: d.role,
        })),
    });

    // Ensure each movie has at least 2 ACTOR entries (deterministic assignment)
    for (let i = 0; i < movies.length; i++) {
        const movieId = movies[i].id;
        let actorCount = await prisma.moviePerson.count({ where: { movieId, role: 'ACTOR' } });
        // start picking candidates offset by 10 to avoid overlapping with obvious directors
        let candidate = (i + 10) % people.length;
        while (actorCount < 2) {
            const person = people[candidate];
            // skip if person already assigned to this movie (any role)
            const exists = await prisma.moviePerson.findFirst({ where: { movieId, personId: person.id } });
            if (!exists) {
                await prisma.moviePerson.create({ data: { movieId, personId: person.id, role: 'ACTOR' } });
                actorCount++;
            }
            candidate = (candidate + 1) % people.length;
        }
    }

    // Create demo users: regular and admin
    await prisma.user.create({
        data: {
            email: "demo@example.com",
            password: "password",
            name: "Demo User",
            role: "user",
        },
    });
    await prisma.user.create({
        data: {
            email: "admin@example.com",
            password: "adminpass",
            name: "Admin User",
            role: "admin",
        },
    });

    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
