import React, { useEffect, useState } from 'react'
import Search from "./components /Search.jsx";
import Spinner from "./components /Spinner.jsx";
import MovieCard from "./components /MovieCard.jsx";
import {useDebounce} from "react-use";
import {getTrendingMovies, updateSearchCount, account, ID} from "./lib/appwrite.js";

const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0YjU5MTQ3M2Y2OWZkZjAyNTdlZTEzNmUxNjk1MGFhOSIsIm5iZiI6MTc1OTY2MDM2OC4zNjksInN1YiI6IjY4ZTI0OTUwYmVhZDI1ODIwYzljYThhNyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.cWl2dzF_Fh5dQAXM64kurx3SWiJZJ7lnYi3y_kEdhIE";

const API_OPTIONS = {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${API_KEY}`
    }
}

export default function App() {
    const [searchTerm, setSearchTerm] = useState('')
    const [errorMessage, setErrorMessage] = useState('');

    const [movieList, setMovieList] = useState([]);
    const [trendingMovies, setTrendingMovies] = useState([])

    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')


    const [loggedInUser, setLoggedInUser] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    useEffect(() => {
        const checkUser = async () => {
            try {
                const user = await account.get();
                setLoggedInUser(user);
            } catch (err) {
                // Not logged in
            }
        };
        checkUser();
    }, []);

    async function login(e) {
        e.preventDefault();
        try {
            await account.createEmailPasswordSession(email, password);
            setLoggedInUser(await account.get());
        } catch (error) {
            console.error("Failed to login:", error);
            setErrorMessage("Failed to login. Please check your credentials.");
        }
    }

    async function logout() {
        await account.deleteSession('current');
        setLoggedInUser(null);
    }

    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

    const fetchMovies = async (query = '') => {
        setIsLoading(true);
        setErrorMessage('')
        try {
            const endpoint = query
               ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
               : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS);

            if(!response.ok) throw new Error(`HTTP error! Status: ${response.status}. Failed to fetch movies.`);

            const data = await response.json();
            if(data.Response === 'False') {
                setErrorMessage(data.error || 'Failed to fetch movies');
                setMovieList([])
                return;
            }

            setMovieList(data.results || []);

            // Update search count if it was a search query with results
            if(query && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
                loadTrendingMovies()
            }

        } catch (error) {
            console.log(`Error fetching movies: `, error);
            setErrorMessage('Error fetching movies');
        } finally {
            setIsLoading(false);
        }
    }

    const loadTrendingMovies = async () => {
        try {
            const movies = await getTrendingMovies();
            setTrendingMovies(movies)
        } catch (error) {
            console.error(`Error fetching trending movies: ${error}`);
        }
    }

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);
    // Empty dependency array means this effect runs once on mount/start

    useEffect(() => {
        loadTrendingMovies();
    }, []);

    return (
        <>
            <div style={{ padding: '20px', textAlign: 'center' }}>
                {loggedInUser ? (
                    <div>
                        <p>Welcome, {loggedInUser.name}!</p>
                        <button onClick={logout}>Logout</button>
                    </div>
                ) : (
                    <div>
                        <p>Please log in to continue.</p>
                        <form onSubmit={login}>
                            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                            <button type="submit">Login</button>
                        </form>
                    </div>
                )}
            </div>

            <main>
                <div className="pattern" />
                <div className="wrapper">
                    <header>
                        <img src="./hero.png" alt="hero" />
                        <h1>
                            Find <span className="text-gradient">Movies</span> You'll Enjoy Without The Hassle!
                        </h1>
                        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                    </header>

                    {trendingMovies.length > 0 && (
                        <section className="trending">
                            <h2>Trending Now</h2>
                            <ul>
                                {trendingMovies.map((movie, index) => (
                                    <li key={movie.$id}>
                                        <p>{index + 1}</p>
                                        <img src={movie.poster_url} alt={movie.title ?? 'Trending movie'} />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <section className="all-movies">
                        <h2 className="text-center">All Movies</h2>
                        {isLoading ? (
                            <Spinner />
                        ) : errorMessage ? (
                            <p className="text-red-500">{errorMessage}</p>
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
    )
}