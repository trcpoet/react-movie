import React, { useEffect, useState } from 'react';
import Search from "./components /Search.jsx";
import Spinner from "./components /Spinner.jsx";
import MovieCard from "./components /MovieCard.jsx";
import { useDebounce } from "react-use";
// UPDATED: All Appwrite imports now come from our single lib file
import { getTrendingMovies, updateSearchCount, account } from "./lib/appwrite.js";

const API_BASE_URL = "https://api.themoviedb.org/3";
// CORRECT: Using the environment variable for the API key is the right approach
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${API_KEY}`
    }
};

export default function App() {
    // State from your original code
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [movieList, setMovieList] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const [trendingMovies, setTrendingMovies] = useState([]);

    // --- NEW: Authentication State from Tutor's Code ---
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // This is for registration, can be removed if not needed

    // --- NEW: Check for a logged-in user when the app loads ---
    useEffect(() => {
        const checkUserSession = async () => {
            try {
                const user = await account.get();
                setLoggedInUser(user);
            } catch (error) {
                // No user session found, which is normal on first load
                setLoggedInUser(null);
            }
        };
        checkUserSession();
    }, []);

    // --- NEW: Login Function ---
    async function login(e) {
        e.preventDefault();
        try {
            await account.createEmailPasswordSession(email, password);
            const user = await account.get();
            setLoggedInUser(user);
            setErrorMessage(''); // Clear any previous errors
        } catch (error) {
            console.error("Failed to login:", error);
            setErrorMessage("Failed to login. Please check your credentials.");
        }
    }

    // --- NEW: Logout Function ---
    async function logout() {
        try {
            await account.deleteSession('current');
            setLoggedInUser(null);
        } catch (error) {
            console.error("Failed to logout:", error);
        }
    }

    // Debounce search term (no changes here)
    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

    const fetchMovies = async (query = '') => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            if (data.results.length === 0 && query) {
                setErrorMessage('No movies found for your search.');
                setMovieList([]);
                return;
            }

            setMovieList(data.results || []);
            // updateSearchCount();

            // UPDATE: When a user searches, update the search count AND refresh trending
            if (query && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
                loadTrendingMovies(); // Refresh trending movies list
            }
        } catch (error) {
            console.error(`Error fetching movies:`, error);
            setErrorMessage('An error occurred while fetching movies.');
        } finally {
            setIsLoading(false);
        }
    };

    const loadTrendingMovies = async () => {
        try {
            const movies = await getTrendingMovies();
            setTrendingMovies(movies);
        } catch (error) {
            console.error(`Error loading trending movies:`, error);
        }
    };

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies();
    }, []);


    // Add this function inside your App component in App.jsx

    const handleTrendingClick = async (movieId) => {
        setIsLoading(true);
        setSearchTerm(''); // Clear search term to hide other movies
        setMovieList([]); // Clear the main movie list
        try {
            const response = await fetch(`${API_BASE_URL}/movie/${movieId}`, API_OPTIONS);
            if (!response.ok) throw new Error('Failed to fetch movie details.');
            const movieData = await response.json();
            setMovieList([movieData]); // Display the single clicked movie
        } catch (error) {
            console.error(error);
            setErrorMessage('Could not load movie details.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* --- NEW: Login/Logout UI --- */}
            <div className="auth-section">
                {loggedInUser ? (
                    <div className="user-info">
                        <span>Welcome, {loggedInUser.name}!</span>
                        <button onClick={logout} className="auth-button">Logout</button>
                    </div>
                ) : (
                    <form onSubmit={login} className="login-form">
                        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                        <button type="submit" className="auth-button">Login</button>
                    </form>
                )}
            </div>

            <main>
                <div className="pattern" />
                <div className="wrapper">
                    <header>
                        <img src="./hero.png" alt="Hero Banner" />
                        <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
                        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                    </header>

                    {trendingMovies.length > 0 && (
                        <section className="trending">
                            <h2>Trending Movies</h2>
                            <ul>
                                {trendingMovies.map((movie, index) => (
                                    <li key={movie.$id} onClick={() => handleTrendingClick(movie.movie_id)}>
                                        <p>{index + 1}</p>
                                        <img src={movie.poster_url} alt={movie.title}  />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* All movies section (no changes) */}
                    <section className="all-movies pt-8">
                        <h2 className="pt-4 sm:pt-6 lg:pt-10 mx-auto w-fittext-center text-center">All Movies</h2>
                        {isLoading ? (
                            <Spinner />
                        ) : errorMessage ? (
                            <p className="error-message">{errorMessage}</p>
                        ) : (
                            <ul>
                                {movieList.map((movie) => (
                                    <MovieCard key={movie.id} movie={movie} />
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}