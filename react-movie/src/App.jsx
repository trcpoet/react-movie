import React, { useEffect, useState } from 'react'
import Search from "./components /Search.jsx";
import Spinner from "./components /Spinner.jsx";
import MovieCard from "./components /MovieCard.jsx";
import {useDebounce} from "react-use";


const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

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
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

    const fetchMovies = async (query = '') => {
        setIsLoading(true);
        setErrorMessage('')
        try {
            const endpoint = query
               ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
               : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS);

            if(!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}. Failed to fetch movies.`);
            }
            const data = await response.json();

            if(data.Response === 'False') {
                setErrorMessage(data.error || 'Failed to fetch movies');
                setMovieList([])
                return;
            }

            setMovieList(data.results || []);

        } catch (error) {
            console.log(`Error fetching movies:  ${error}`);
            setErrorMessage('Error fetching movies');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchMovies(debouncedSearchTerm)
    }, [debouncedSearchTerm]);
    // Empty dependency array means this effect runs once on mount/start

    return (
        <main>
            <div className="pattern"/>
            <div className="wrapper">
                <header>
                    <img src="./hero.png" alt="hero" />
                    <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without The Hassle!</h1>
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
                </header>

                <section className="all-movies">
                    <h2 className="mt-[40px] text-center">All Movies</h2>
                    {isLoading ? (
                        <Spinner />

                    ): errorMessage ? (
                        <p className='text-red-500'>{errorMessage}</p>
                    ) : (
                        <ul>
                            {movieList.map((movie) => (
                                <MovieCard  key={movie.id} movie={movie}/>
                            ))}
                        </ul>
                    ) }

                </section>

            </div>


        </main>
    );
}
