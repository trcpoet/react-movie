import { Link } from 'react-router-dom';

function MovieCard({ movie, onClick }) {
    const {
        id,
        title,
        vote_average,
        poster_path,
        release_date,
        original_language,
    } = movie;

    return (
        <li>
            <Link to={`/movie/${id}`} onClick={() => onClick && onClick()}>
                <div className="movie-card">
                    <img
                        src={
                            poster_path
                                ? `https://image.tmdb.org/t/p/w500${poster_path}`
                                : '/no-movie.png'
                        }
                        alt={title}
                    />

                    <div className="mt-4">
                        <h3>{title}</h3>
                        <div className="content">
                            <div className="rating">
                                <img src="/star.svg" alt="star" />
                                <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
                            </div>
                            <span>•</span>
                            <p className="lang">{original_language}</p>
                            <span>•</span>
                            <p className="year">
                                {release_date ? release_date.split('-')[0] : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </Link>
        </li>
    );
}

export default MovieCard;
