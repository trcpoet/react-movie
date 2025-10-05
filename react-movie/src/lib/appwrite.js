import { Client } from 'appwrite';

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT) // e.g. https://fra.cloud.appwrite.io/v1
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export default client;
