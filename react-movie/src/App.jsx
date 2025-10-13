import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import MovieDetails from './pages/MovieDetails.jsx';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
        </Routes>
    );
}










// import React, { useEffect, useState } from 'react';
// import Search from "./components /Search.jsx";
// import Spinner from "./components /Spinner.jsx";
// import MovieCard from "./components /MovieCard.jsx";
// import { useDebounce } from "react-use";
// import { getTrendingMovies, updateSearchCount, account, incrementMovieClickCount } from "./lib/appwrite.js";
//
// const API_BASE_URL = "https://api.themoviedb.org/3";
// const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
//
// const API_OPTIONS = {
//     method: "GET",
//     headers: {
//         accept: "application/json",
//         Authorization: `Bearer ${API_KEY}`
//     }
// };
//
// export default function App() {
//     const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
//     const [searchTerm, setSearchTerm] = useState('');
//     const [movieList, setMovieList] = useState([]);
//     const [errorMessage, setErrorMessage] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [trendingMovies, setTrendingMovies] = useState([]);
//     const [loggedInUser, setLoggedInUser] = useState(null);
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//
//     useEffect(() => {
//         const checkUserSession = async () => {
//             try {
//                 const user = await account.get();
//                 setLoggedInUser(user);
//             } catch (error) {
//                 setLoggedInUser(null);
//             }
//         };
//         checkUserSession();
//     }, []);
//
//     async function login(e) {
//         e.preventDefault();
//         try {
//             await account.createEmailPasswordSession(email, password);
//             setLoggedInUser(await account.get());
//             setErrorMessage('');
//         } catch (error) {
//             console.error("Failed to login:", error);
//             setErrorMessage("Failed to login. Please check your credentials.");
//         }
//     }
//
//     async function logout() {
//         try {
//             await account.deleteSession('current');
//             setLoggedInUser(null);
//         } catch (error) {
//             console.error("Failed to logout:", error);
//         }
//     }
//
//     useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);
//
//     const fetchMovies = async (query = '') => {
//         setIsLoading(true);
//         setErrorMessage('');
//         try {
//             const endpoint = query
//                 ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
//                 : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
//
//             const response = await fetch(endpoint, API_OPTIONS);
//             if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
//
//             const data = await response.json();
//             if (data.results.length === 0 && query) {
//                 setErrorMessage('No movies found for your search.');
//                 setMovieList([]);
//                 return;
//             }
//
//             setMovieList(data.results || []);
//
//             if (query && data.results.length > 0) {
//                 await updateSearchCount(query, data.results[0]);
//                 loadTrendingMovies();
//             }
//         } catch (error) {
//             console.error(`Error fetching movies:`, error);
//             setErrorMessage('An error occurred while fetching movies.');
//         } finally {
//             setIsLoading(false);
//         }
//     };
//
//     const loadTrendingMovies = async () => {
//         try {
//             const movies = await getTrendingMovies();
//             setTrendingMovies(movies);
//         } catch (error) {
//             console.error(`Error loading trending movies:`, error);
//         }
//     };
//
//     useEffect(() => {
//         fetchMovies(debouncedSearchTerm);
//     }, [debouncedSearchTerm]);
//
//     useEffect(() => {
//         loadTrendingMovies();
//     }, []);
//
//     const handleMovieClick = async (tmdbMovieId) => {
//         await incrementMovieClickCount(tmdbMovieId);
//         loadTrendingMovies();
//     };
//
//     const handleTrendingClick = async (movieId) => {
//         await handleMovieClick(movieId);
//         setIsLoading(true);
//         setSearchTerm('');
//         setMovieList([]);
//         try {
//             const response = await fetch(`${API_BASE_URL}/movie/${movieId}`, API_OPTIONS);
//             if (!response.ok) throw new Error('Failed to fetch movie details.');
//             const movieData = await response.json();
//             setMovieList([movieData]);
//         } catch (error) {
//             console.error(error);
//             setErrorMessage('Could not load movie details.');
//         } finally {
//             setIsLoading(false);
//         }
//     };
//
//     return (
//         <>
//             <div className="auth-section">
//                 {loggedInUser ? (
//                     <div className="user-info">
//                         <span>Welcome, {loggedInUser.name}!</span>
//                         <button onClick={logout} className="auth-button">Logout</button>
//                     </div>
//                 ) : (
//                     <form onSubmit={login} className="login-form">
//                         <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
//                         <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
//                         <button type="submit" className="auth-button">Login</button>
//                     </form>
//                 )}
//             </div>
//
//             <main>
//                 <div className="pattern" />
//                 <div className="wrapper">
//                     <header>
//                         <img src="./hero.png" alt="Hero Banner" />
//                         <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
//                         <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
//                     </header>
//
//                     {trendingMovies.length > 0 && (
//                         <section className="trending">
//                             <h2>Trending Movies</h2>
//                             <ul>
//                                 {trendingMovies.map((movie, index) => (
//                                     <li key={movie.$id} onClick={() => handleTrendingClick(movie.movie_id)}>
//                                         <p>{index + 1}</p>
//                                         <img src={movie.poster_url} alt={movie.title} />
//                                     </li>
//                                 ))}
//                             </ul>
//                         </section>
//                     )}
//
//                     <section className="all-movies pt-8">
//                         <h2 className="pt-4 sm:pt-6 lg:pt-10 mx-auto w-fittext-center text-center">All Movies</h2>
//                         {isLoading ? (
//                             <Spinner />
//                         ) : errorMessage ? (
//                             <p className="error-message">{errorMessage}</p>
//                         ) : (
//                             <ul>
//                                 {movieList.map((movie) => (
//                                     <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} />
//                                 ))}
//                             </ul>
//                         )}
//                     </section>
//                 </div>
//             </main>
//         </>
//     );
// }