// Clean movie-only seed script (enhanced: add short bio + imageUrl per person)
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding movies, genres and people (no users/accounts)...");

  // Clear only movie-related tables so seed is idempotent for movie data.
  await prisma.moviePerson.deleteMany().catch(() => {});
  await prisma.movieGenre.deleteMany().catch(() => {});
  await prisma.movie.deleteMany().catch(() => {});
  await prisma.genre.deleteMany().catch(() => {});
  await prisma.person.deleteMany().catch(() => {});

  const movies = [
    {
      title: "Inception",
      releaseDate: "2010-07-16",
      price: "9.99",
      stock: 10,
      runtime: 148,
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg",
      genres: ["Sci-Fi", "Thriller"],
      director: "Christopher Nolan",
      actors: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Tom Hardy"],
      bio: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    },
    {
      title: "Django Unchained",
      releaseDate: "2012-12-25",
      price: "7.99",
      stock: 6,
      runtime: 165,
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/7oWY8VDWW7thTzWh3OKYRkWUlD5.jpg",
      genres: ["Drama", "Action"],
      director: "Quentin Tarantino",
      actors: ["Jamie Foxx", "Christoph Waltz", "Leonardo DiCaprio"],
      bio: "With the help of a German bounty hunter, a freed slave sets out to rescue his wife from a brutal Mississippi plantation owner.",
    },
    {
      title: "Little Women",
      releaseDate: "2019-12-25",
      price: "6.99",
      stock: 8,
      runtime: 135,
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/yn5ihODtZ7ofn8pDYfxCmxh8AXI.jpg",
      genres: ["Drama", "Romance"],
      director: "Greta Gerwig",
      actors: ["Saoirse Ronan", "Emma Watson", "Florence Pugh"],
      bio: "The March sisters come of age in 19th-century New England in this tender adaptation exploring love, loss and sisterhood.",
    },
    {
      title: "Interstellar",
      releaseDate: "2014-11-07",
      price: "8.99",
      stock: 12,
      runtime: 169,
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      genres: ["Sci-Fi", "Drama"],
      director: "Christopher Nolan",
      actors: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
      bio: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    },
    {
      title: "Get Out",
      releaseDate: "2017-02-24",
      price: "5.99",
      stock: 7,
      runtime: 104,
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg",
      genres: ["Horror", "Thriller"],
      director: "Jordan Peele",
      actors: ["Daniel Kaluuya", "Allison Williams", "Catherine Keener"],
      bio: "A young African-American visits his white girlfriend's parents for the weekend, where his simmering unease about their reception of him eventually reaches a boiling point.",
    },
    {
      title: "Blade Runner 2049",
      releaseDate: "2017-10-06",
      price: "9.49",
      stock: 6,
      runtime: 164,
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
      genres: ["Sci-Fi", "Drama"],
      director: "Denis Villeneuve",
      actors: ["Ryan Gosling", "Harrison Ford", "Ana de Armas"],
      bio: "A young blade runner's discovery of a long-buried secret leads him to track down former blade runner Rick Deckard, who's been missing for thirty years.",
    },
    {
      title: "Fight Club",
      releaseDate: "1999-10-15",
      price: "6.49",
      stock: 9,
      runtime: 139,
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/jSziioSwPVrOy9Yow3XhWIBDjq1.jpg",
      genres: ["Drama"],
      director: "David Fincher",
      actors: ["Brad Pitt", "Edward Norton", "Helena Bonham Carter"],
      bio: "An insomniac office worker and a soap maker form an underground fight club that evolves into something much more.",
    },
    {
      title: "The Grand Budapest Hotel",
      releaseDate: "2014-03-28",
      price: "7.49",
      stock: 8,
      runtime: 99,
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
      genres: ["Comedy", "Drama"],
      director: "Wes Anderson",
      actors: ["Ralph Fiennes", "Tony Revolori", "Saoirse Ronan"],
      bio: "A whimsical tale about a legendary concierge at a famous European hotel between the wars and his friendship with a young employee.",
    },
    {
      title: "Arrival",
      releaseDate: "2016-11-11",
      price: "8.29",
      stock: 11,
      runtime: 116,
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg",
      genres: ["Sci-Fi", "Drama"],
      director: "Denis Villeneuve",
      actors: ["Amy Adams", "Jeremy Renner", "Forest Whitaker"],
      bio: "A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.",
    },
    {
      title: "The Social Network",
      releaseDate: "2010-10-01",
      price: "6.99",
      stock: 10,
      runtime: 120,
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg",
      genres: ["Drama"],
      director: "David Fincher",
      actors: ["Jesse Eisenberg", "Andrew Garfield", "Justin Timberlake"],
      bio: "The story of the founding of Facebook and the lawsuits that followed its meteoric rise.",
    },
    {
      title: "La La Land",
      releaseDate: "2016-12-09",
      price: "7.99",
      stock: 7,
      runtime: 128,
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
      genres: ["Romance", "Drama"],
      director: "Damien Chazelle",
      actors: ["Ryan Gosling", "Emma Stone", "John Legend"],
      bio: "A jazz pianist and an aspiring actress fall in love while pursuing their dreams in Los Angeles.",
    },
    {
      title: "The Revenant",
      releaseDate: "2015-12-25",
      price: "8.99",
      stock: 4,
      runtime: 156,
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/ji3ecJphATlVgWNY0B0RVXZizdf.jpg",
      genres: ["Drama", "Action"],
      director: "Alejandro González Iñárritu",
      actors: ["Leonardo DiCaprio", "Tom Hardy", "Will Poulter"],
      bio: "A frontiersman on a fur trading expedition fights for survival after being mauled by a bear and left for dead by members of his own hunting team.",
    },
    {
      title: "Jojo Rabbit",
      releaseDate: "2019-10-18",
      price: "6.49",
      stock: 9,
      runtime: 108,
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/1mqL7VG4Ix8wmxwypmCA1HTHBky.jpg",
      genres: ["Comedy", "Drama"],
      director: "Taika Waititi",
      actors: [
        "Roman Griffin Davis",
        "Thomasin McKenzie",
        "Scarlett Johansson",
      ],
      bio: "A young boy in Nazi Germany discovers his mother is hiding a Jewish girl in their home, which challenges his imaginary friend Adolf Hitler.",
    },
    {
      title: "Wonder Woman",
      releaseDate: "2017-05-30",
      price: "7.99",
      stock: 13,
      runtime: 141,
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/v4ncgZjG2Zu8ZW5al1vIZTsSjqX.jpg",
      genres: ["Action", "Drama"],
      director: "Patty Jenkins",
      actors: ["Gal Gadot", "Chris Pine", "Robin Wright"],
      bio: "An Amazonian warrior leaves her island home to fight alongside men in a war to end all wars and discovers her full powers.",
    },
    {
      title: "The Girl with the Dragon Tattoo",
      releaseDate: "2011-12-21",
      price: "6.99",
      stock: 6,
      runtime: 158,
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/8bokS83zGdhaXgN9tjidUKmAftW.jpg",
      genres: ["Thriller", "Drama"],
      director: "David Fincher",
      actors: ["Rooney Mara", "Daniel Craig", "Stellan Skarsgård"],
      bio: "A journalist and a hacker team up to investigate a wealthy patriarch's disappearance, uncovering far-reaching corruption.",
    },
  ];

  // person bios and placeholder imageUrl (fill imageUrl later)
  const personData = {
    "Christopher Nolan": {
      bio: "British-American filmmaker known for mind-bending narratives, practical effects and epic scale.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg",
    },
    "Quentin Tarantino": {
      bio: "American director famous for stylized violence, nonlinear storytelling and sharp dialogue.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/1gjcpAa99FAOWGnrUvHEXXsRs7o.jpg",
    },
    "Greta Gerwig": {
      bio: "American writer-director and actress known for intimate literary adaptations and strong character work.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/6MwQ2GstYr0wnhp1eTOAbVMNBGN.jpg",
    },
    "Denis Villeneuve": {
      bio: "Canadian director acclaimed for atmospheric visuals and thoughtful science-fiction.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/zdDx9Xs93UIrJFWYApYR28J8M6b.jpg",
    },
    "Jordan Peele": {
      bio: "American writer-director who blends social commentary with genre horror and dark satire.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/kFUKn5g3ebpyZ3CSZZZo2HFWRNQ.jpg",
    },
    "David Fincher": {
      bio: "American director known for meticulous, moody thrillers and precise visual style.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/tpEczFclQZeKAiCeKZZ0adRvtfz.jpg",
    },
    "Wes Anderson": {
      bio: "American director celebrated for whimsical visuals, symmetry and ensemble casts.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/s03CeUeC5yAXyB1acqP0zGNo2SC.jpg",
    },
    "Damien Chazelle": {
      bio: "American director known for music-driven films and energetic storytelling.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/14kRZ3XxNMyBv717YQSXr3wCucy.jpg",
    },
    "Alejandro González Iñárritu": {
      bio: "Mexican director noted for immersive, emotionally intense films and innovative technique.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/Av0jewh8wltCl1CB8MfEIrvgfMZ.jpg",
    },
    "Taika Waititi": {
      bio: "New Zealand director and writer blending irreverent humor with heartfelt storytelling.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/aH6MgwFhomAPNBRPyO2fhpU5kbk.jpg",
    },
    "Patty Jenkins": {
      bio: "American director known for character-focused blockbuster filmmaking and strong female leads.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/za4JYxjctECHLJJel3lEFPsbeht.jpg",
    },

    "Leonardo DiCaprio": {
      bio: "American actor known for committed performances across dramatic and blockbuster roles.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg",
    },
    "Joseph Gordon-Levitt": {
      bio: "American actor and director noted for versatility across indie and mainstream projects.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/4U9G4YwTlIEbAymBaseltS38eH4.jpg",
    },
    "Tom Hardy": {
      bio: "English actor recognized for intense physical performances and transformative roles.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/d81K0RH8UX7tZj49tZaQhZ9ewH.jpg",
    },
    "Jamie Foxx": {
      bio: "American actor, comedian and musician acclaimed for charismatic, award-winning performances.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/zD8Nsy4Xrghp7WunwpCj5JKBPeU.jpg",
    },
    "Christoph Waltz": {
      bio: "Austrian actor known for multilingual, nuanced performances and dark humor.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/jMvLGCVXLaBqjRLf5olyvEucZob.jpg",
    },
    "Saoirse Ronan": {
      bio: "Irish actress celebrated for remarkable emotional range from a young age.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/9buDPdqKN9vbnQLLkHEinDtMrCG.jpg",
    },
    "Emma Watson": {
      bio: "English actress and activist known for early franchise work and later dramatic roles.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/A14lLCZYDhfYdBa0fFRpwMDiwRN.jpg",
    },
    "Florence Pugh": {
      bio: "English actress rising for powerful, versatile performances in indie and mainstream films.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/6Sjz9teWjrMY9lF2o9FCo4XmoRh.jpg",
    },
    "Matthew McConaughey": {
      bio: "American actor known for charismatic turns and an evolution into acclaimed dramatic work.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/s6tflSD20MGz04ZR2R1lZvhmC4Y.jpg",
    },
    "Anne Hathaway": {
      bio: "American actress known for stage-trained versatility in musicals and drama.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/s6tflSD20MGz04ZR2R1lZvhmC4Y.jpg",
    },
    "Jessica Chastain": {
      bio: "American actress and producer noted for fierce, layered performances.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/xRvRzxiiHhgUErl0yf9w8WariRE.jpg",
    },
    "Daniel Kaluuya": {
      bio: "British actor acclaimed for emotionally charged, powerful screen performances.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/jj2kZqJobjom36wlhlYhc38nTwN.jpg",
    },
    "Allison Williams": {
      bio: "American actress known for both comedic and dramatic roles across film and TV.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/5Jy9HELKS1OYg7moRl8870OSfJq.jpg",
    },
    "Catherine Keener": {
      bio: "Veteran American character actress known for grounded supporting performances.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/n4CTwGszs6cwS1wJRlDQ5Mlh7Ex.jpg",
    },
    "Ryan Gosling": {
      bio: "Canadian actor and musician praised for range from indie drama to mainstream romance.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/asoKC7CLCqpZKZDL6iovNurQUdf.jpg",
    },
    "Harrison Ford": {
      bio: "Iconic American actor known for adventure heroes and enduring leading roles.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/zVnHagUvXkR2StdOtquEwsiwSVt.jpg",
    },
    "Ana de Armas": {
      bio: "Cuban-Spanish actress rising rapidly for charismatic, contemporary performances.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/5Qne374OM0ewMM7uSN9eq9jNrWq.jpg",
    },
    "Brad Pitt": {
      bio: "American actor and producer with a diverse career spanning dramatic and commercial hits.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/9OfnD7lxgIj3BNQpJFnwxnwl6w5.jpg",
    },
    "Edward Norton": {
      bio: "American actor known for intense, character-driven performances and producing work.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/8nytsqL59SFJTVYVrN72k6qkGgJ.jpg",
    },
    "Helena Bonham Carter": {
      bio: "English actress known for eccentric, memorable roles across period and modern work.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/hJMbNSPJ2PCahsP3rNEU39C8GWU.jpg",
    },
    "Ralph Fiennes": {
      bio: "English actor and director noted for powerful stage and screen work.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/u29BOqiV5GCQ8k8WUJM50i9xlBf.jpg",
    },
    "Tony Revolori": {
      bio: "American actor recognized for precise comedic timing and supporting turns.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/tSF6XmXDikrKZbFUeoDnafXxKjT.jpg",
    },
    "Amy Adams": {
      bio: "American actress acclaimed for her wide emotional range and dramatic depth.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/lub0nBRhsCu2pByvfvxt5DcW86d.jpg",
    },
    "Jeremy Renner": {
      bio: "American actor and musician known for intense, grounded performances.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/yB84D1neTYXfWBaV0QOE9RF2VCu.jpg",
    },
    "Forest Whitaker": {
      bio: "American actor-director celebrated for transformative, nuanced roles.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/4w7l5JUwnwFNBy7J93ZwYN1nihm.jpg",
    },
    "Jesse Eisenberg": {
      bio: "American actor and writer known for neurotic, intellectually charged characters.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/8BMnXLVJDysMO1E8JCAyOFv2QAb.jpg",
    },
    "Andrew Garfield": {
      bio: "British-American actor recognized for emotionally honest and physical performances.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/5ydZ6TluPtxlz5G8nlWMB7SGmow.jpg",
    },
    "Justin Timberlake": {
      bio: "American singer-actor known for pop stardom and branching into film roles.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/6Yk5t9RwkdkAT8Qv45934Eez2CA.jpg",
    },
    "Emma Stone": {
      bio: "American actress noted for charm, range and strong comedic instincts.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/bKbFmFQtn1N6Utzr9Sf0E23alaL.jpg",
    },
    "John Legend": {
      bio: "American singer-songwriter and actor with acclaimed musical and film credits.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/5HUGMf3Lf88IisKr2Av3kSdVoLL.jpg",
    },
    "Will Poulter": {
      bio: "English actor noted for eccentric and memorable supporting performances.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/1zQLes0vhspVA6WqYEFQEvRr4xH.jpg",
    },
    "Roman Griffin Davis": {
      bio: "Young English actor who broke out with a standout lead performance.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/1zQLes0vhspVA6WqYEFQEvRr4xH.jpg",
    },
    "Thomasin McKenzie": {
      bio: "New Zealand actress emerging as a distinctive young talent.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/of8zI5FA5cNBbZK8KdgTSw0znXK.jpg",
    },
    "Scarlett Johansson": {
      bio: "American actress and singer known for wide-ranging roles in indie and blockbuster films.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/8m21eocprLYuW0ywveIgThk6VM.jpg",
    },
    "Gal Gadot": {
      bio: "Israeli actress and model known internationally for her role as a superhero lead.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/qCJB1ACi5VjtY4ypXuv3hjAvbSu.jpg",
    },
    "Chris Pine": {
      bio: "American actor recognized for charismatic leading performances in action and drama.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/d8hGMH1igEFnpNFEEFdP3yFHV3U.jpg",
    },
    "Robin Wright": {
      bio: "American actress and director known for subtle, powerful character work.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/d3rIv0y2p0jMsQ7ViR7O1606NZa.jpg",
    },
    "Rooney Mara": {
      bio: "American actress known for intense, haunting performances in dramatic roles.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/zT6UyHFHEQ9RcKykplWCycKBnoS.jpg",
    },
    "Daniel Craig": {
      bio: "English actor best known for redefining a major action franchise with gritty realism.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/iFerDZUmC5Fu26i4qI8xnUVEHc7.jpg",
    },
    "Stellan Skarsgård": {
      bio: "Swedish actor noted for versatile, character-driven work across international films.",
      imageUrl: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/x78BtYHElirO7Iw8bL4m8CnzRDc.jpg",
    },
  };

  const genreMap = new Map();
  const personMap = new Map();

  // upsert genres and people (use personData for bio + imageUrl)
  for (const m of movies) {
    for (const g of m.genres) {
      if (!genreMap.has(g)) {
        const rec = await prisma.genre.upsert({
          where: { name: g },
          update: {},
          create: { name: g },
        });
        genreMap.set(g, rec);
      }
    }
    if (!personMap.has(m.director)) {
      const pdata = personData[m.director] || { bio: "", imageUrl: "" };
      const rec = await prisma.person.upsert({
        where: { fullName: m.director },
        update: {},
        create: {
          fullName: m.director,
          imageUrl: pdata.imageUrl,
          bio: pdata.bio,
        },
      });
      personMap.set(m.director, rec);
    }
    for (const a of m.actors) {
      if (!personMap.has(a)) {
        const pdata = personData[a] || { bio: "", imageUrl: "" };
        const rec = await prisma.person.upsert({
          where: { fullName: a },
          update: {},
          create: {
            fullName: a,
            imageUrl: pdata.imageUrl,
            bio: pdata.bio,
          },
        });
        personMap.set(a, rec);
      }
    }
  }

  // create movies and relations
  for (const m of movies) {
    const created = await prisma.movie.create({
      data: {
        title: m.title,
        description: m.bio,
        price: m.price,
        releaseDate: new Date(m.releaseDate),
        imageUrl: m.imageUrl,
        stock: m.stock,
        runtime: m.runtime,
      },
    });
    for (const g of m.genres) {
      const genre = genreMap.get(g);
      await prisma.movieGenre.create({
        data: { movieId: created.id, genreId: genre.id },
      });
    }
    const director = personMap.get(m.director);
    await prisma.moviePerson.create({
      data: { movieId: created.id, personId: director.id, role: "DIRECTOR" },
    });
    for (const a of m.actors) {
      const actor = personMap.get(a);
      await prisma.moviePerson.create({
        data: { movieId: created.id, personId: actor.id, role: "ACTOR" },
      });
    }
  }

  const total = await prisma.movie.count();
  const sample = await prisma.movie.findMany({
    take: 5,
    select: { id: true, title: true },
  });
  console.log(`Inserted ${total} movies. Sample:`, sample);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
