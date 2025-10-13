import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDebounce } from 'react-use';
import Search from '../components /Search.jsx';
import Spinner from '../components /Spinner.jsx';
import MovieCard from '../components /MovieCard.jsx';

import {
    getTrendingMovies,
    updateSearchCount,
    account,
    incrementMovieClickCount,
} from '../lib/appwrite.js';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`,
    },
};

export default function Home() {
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        // Check if the user is logged in when the component mounts
        const checkUserSession = async () => {
            try {
                const user = await account.get();
                setLoggedInUser(user);
            } catch (error) {
                setLoggedInUser(null);
            }
        };
        checkUserSession();
    }, []);

    // Handles login
    async function login(e) {
        e.preventDefault();
        try {
            await account.createEmailPasswordSession(email, password);
            setLoggedInUser(await account.get());
            setErrorMessage('');
        } catch (error) {
            console.error('Failed to login:', error);
            setErrorMessage('Failed to login. Please check your credentials.');
        }
    }

    // Handles logout
    async function logout() {
        try {
            await account.deleteSession('current');
            setLoggedInUser(null);
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    }

    // Debounce the search input to avoid excessive API calls
    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

    // Fetch movies based on search or default popular listing
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

            // Update trending data in Appwrite
            if (query && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
                loadTrendingMovies();
            }
        } catch (error) {
            console.error(`Error fetching movies:`, error);
            setErrorMessage('An error occurred while fetching movies.');
        } finally {
            setIsLoading(false);
        }
    };

    // Load trending movies from Appwrite
    const loadTrendingMovies = async () => {
        try {
            const movies = await getTrendingMovies();
            setTrendingMovies(movies);
        } catch (error) {
            console.error(`Error loading trending movies:`, error);
        }
    };

    // Fetch movies whenever the debounced search term changes
    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    // Load trending movies on initial render
    useEffect(() => {
        loadTrendingMovies();
    }, []);

    // Increment movie click count
    const handleMovieClick = async (movie) => {
        setClickCount(prevCount => prevCount + 1);
        await incrementMovieClickCount(movie.id, movie, clickCount+1);
        loadTrendingMovies(); // refresh the trending list
    };

    return (
        <>
            <div className="auth-section">
                {loggedInUser ? (
                    <div className="user-info">
                        <span>Welcome, {loggedInUser.name}!</span>
                        <button onClick={logout} className="auth-button">
                            Logout
                        </button>
                    </div>
                ) : (
                    <form onSubmit={login} className="login-form">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit" className="auth-button">
                            Login
                        </button>
                    </form>
                )}
            </div>

            <main>
                <div className="pattern" />
                <div className="wrapper">
                    <header>
                        <img src="/hero.png" alt="Hero Banner" />
                        <h1>
                            Find <span className="text-gradient">Movies</span> You'll Enjoy
                            Without the Hassle
                        </h1>
                        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                    </header>

                    {trendingMovies.length > 0 && (
                        <section className="trending">
                            <h2>Trending Movies</h2>
                            <ul>
                                {trendingMovies.map((movie, index) => (
                                    <li key={movie.$id}>
                                        <Link
                                            to={`/movie/${movie.movie_id}`}
                                            onClick={() => handleMovieClick(movie.movie_id)}
                                        >
                                            <p>{index + 1}</p>
                                            <img src={movie.poster_url} alt={movie.title} />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <section className="all-movies pt-8">
                        <h2 className="pt-4 sm:pt-6 lg:pt-10 mx-auto w-fittext-center text-center">
                            All Movies
                        </h2>
                        {isLoading ? (
                            <Spinner />
                        ) : errorMessage ? (
                            <p className="error-message">{errorMessage}</p>
                        ) : (
                            <ul>
                                {movieList.map((movie) => (
                                    <MovieCard
                                        key={movie.id}
                                        movie={movie}
                                        onClick={() => handleMovieClick(movie)}
                                    />
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}
