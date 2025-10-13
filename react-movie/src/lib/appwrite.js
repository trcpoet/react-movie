import { Client, Databases, Query, ID, Account } from 'appwrite';

const appwriteUrl = import.meta.env.VITE_APPWRITE_ENDPOINT; // <-- CORRECTED
const appwriteProjectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

if (!appwriteUrl || !appwriteProjectId || !databaseId || !collectionId) {
    throw new Error("Missing Appwrite environment variables. Please check your .env file.");
}

const client = new Client()
    .setEndpoint(appwriteUrl)
    .setProject(appwriteProjectId);

export const account = new Account(client);
export const databases = new Databases(client);
export { ID, Query };

export const updateSearchCount = async (searchTerm, movie) => {
    try {
        const result = await databases.listDocuments(databaseId, collectionId, [
            Query.equal('searchTerm', searchTerm),
        ]);

        if (result.documents.length > 0) {
            const doc = result.documents[0];
            await databases.updateDocument(databaseId, collectionId, doc.$id, {
                count: doc.count + 1,
            });
        } else {
            await databases.createDocument(databaseId, collectionId, ID.unique(), {
                searchTerm: movie.title,
                title: movie.title,
                release_date: movie.release_date,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            });
        }
    } catch (error) {
        console.error(`Error updating search count:`, error);
    }
};

export const getTrendingMovies = async () => {
    try {
        const result = await databases.listDocuments(databaseId, collectionId, [
            Query.limit(5),
            Query.orderDesc('count'),
        ]);
        return result.documents;
    } catch (error) {
        console.error(`Error fetching trending movies:`, error);
        return [];
    }
};


export const incrementMovieClickCount = async (tmdbMovieId, movie, newCount = 1) => {
    try {
        const response = await databases.listDocuments(databaseId, collectionId, [
            Query.equal('movie_id', tmdbMovieId),
        ]);

        if (response.documents.length > 0) {
            // Document exists → overwrite its count with newCount
            const docToUpdate = response.documents[0];
            await databases.updateDocument(
                databaseId,
                collectionId,
                docToUpdate.$id,
                { count: newCount }
            );
        } else {
            // Document does not exist → create one with the supplied count
            await databases.createDocument(
                databaseId,
                collectionId,
                ID.unique(),
                {
                    searchTerm: movie.title, // or whatever you want to store
                    count: newCount,
                    movie_id: tmdbMovieId,
                    poster_url: movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : '',
                }
            );
        }
    } catch (error) {
        console.error('Error updating movie click count:', error);
    }
};

