import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Spinner from '../components /Spinner.jsx';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`,
    },
};

export default function MovieDetails() {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [error, setError] = useState('');



    useEffect(() => {
        async function fetchMovie() {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/movie/${id}`,
                    API_OPTIONS
                );
                if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                const data = await response.json();
                setMovie(data);
            } catch (err) {
                console.error(err);
                setError('Could not fetch movie details.');
            }
        }
        fetchMovie();
    }, [id]);

    if (error) return <p>{error}</p>;
    if (!movie) return <Spinner />;

    const {
        title,
        poster_path,
        overview,
        release_date,
        vote_average,
        runtime,
        tagline,
        genres = [],
        status,
        vote_count,
    } = movie;

    return (
        <section className="movie-details">
            {/* Poster */}
            <img
                className="movie-details__poster"
                src={
                    poster_path
                        ? `https://image.tmdb.org/t/p/w500${poster_path}`
                        : '/no-movie.png'
                }
                alt={title}
            />

            {/* Content */}
            <div className="movie-details__content">
                <h1 className="movie-details__title">{title}</h1>

                {/* Tagline appears in italics, if available */}
                {tagline && (
                    <p className="italic text-gray-400">{tagline}</p>
                )}

                <p className="movie-details__overview">{overview}</p>

                <div className="space-y-1">
                    <p className="movie-details__meta">
                        Release date: {release_date}
                    </p>
                    <p className="movie-details__meta">
                        Runtime: {runtime ? `${runtime} min` : 'N/A'}
                    </p>
                    <p className="movie-details__meta">
                        Rating: {vote_average} (from {vote_count} votes)
                    </p>
                    <p className="movie-details__meta">
                        Status: {status}
                    </p>
                    <p className="movie-details__meta">
                        Genres:{' '}
                        {genres.length > 0
                            ? genres.map((g) => g.name).join(', ')
                            : 'N/A'}
                    </p>
                </div>
            </div>
        </section>
    );
}