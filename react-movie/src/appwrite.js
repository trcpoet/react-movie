import {Client, Databases, Query, ID, TablesDB } from 'appwrite';



const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

export const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(PROJECT_ID);

export const tables = new TablesDB(client);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    //1. Use Appwrite SDK to check if a document or search term exists in DB
    try{
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', [searchTerm]),
        ]);
        //Matching what we have in the DB with what our users are searching for

        //2. If it exists, increment the count by 1
        if (result.documents.length > 0) {
            const doc = result.documents[0];
            await database.updateDocument( DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1
            })
        //3. If it doesn't exist, create a new document with the search term and count of 1
        } else {
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https:image.tmdb.org/t/p/w500${movie.poster_path}`,
            });
        }
    } catch (error) {
        console.log(`Error updating search count: ${error}`);
    }
}

export const getTrendingMovies = async () => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc('count')
        ]);
        return result.documents;
        } catch (error) {
        console.log(`Error fetching trending movies: ${error}`);
        return [];
    }
}