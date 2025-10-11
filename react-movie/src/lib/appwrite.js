import { Client, Databases, Query, ID, Account } from 'appwrite';




// Fetch environment variables with checks
const appwriteUrl = import.meta.env.VITE_APPWRITE_ENDPOINT; // <-- CORRECTED
const appwriteProjectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

if (!appwriteUrl || !appwriteProjectId || !databaseId || !collectionId) {
    throw new Error("Missing Appwrite environment variables. Please check your .env file.");
}

// Initialize the Appwrite client
const client = new Client()
    .setEndpoint(appwriteUrl)
    .setProject(appwriteProjectId);

// Export Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export { ID, Query }; // Export ID and Query for convenience

// --- Database Functions ---

/**
 * Updates or creates a document to track search term popularity.
 */
export const updateSearchCount = async (searchTerm, movie) => {
    try {
        const result = await databases.listDocuments(databaseId, collectionId, [
            Query.equal('searchTerm', searchTerm),
        ]);

        if (result.documents.length > 0) {
            // If term exists, increment its count
            const doc = result.documents[0];
            await databases.updateDocument(databaseId, collectionId, doc.$id, {
                count: doc.count + 1,
            })
        } else {
            // If term doesn't exist, create a new document
            await databases.createDocument(databaseId, collectionId, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            });
        }
    } catch (error) {
        console.error(`Error updating search count:`, error);
    }
};

/**
 * Fetches the top 5 trending movies based on search count.
 */
export const getTrendingMovies = async () => {
    try {
        const result = await databases.listDocuments(databaseId, collectionId, [
            Query.limit(5),
            Query.orderDesc('count'),
        ]);
        return result.documents;
    } catch (error) {
        console.error(`Error fetching trending movies:`, error);
        return []; // Return an empty array on error
    }
};

export const incrementMovieClickCount = async (tmdbMovieId) => {
    try {
        // 1. Find the document in our DB that matches the movie ID
        const response = await databases.listDocuments(databaseId, collectionId, [
            Query.equal('movie_id', tmdbMovieId)
        ]);

        // 2. If it exists, update its count
        if (response.documents.length > 0) {
            const docToUpdate = response.documents[0];
            await databases.updateDocument(databaseId, collectionId, docToUpdate.$id, {
                count: docToUpdate.count + 1
            });
        }
        // If the movie isn't in our database yet, we'll do nothing.
        // It will be added the next time it appears in a search result.

    } catch (error) {
        console.error('Error incrementing movie click count:', error);
    }
};