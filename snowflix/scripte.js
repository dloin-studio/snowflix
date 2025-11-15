const API_KEY = 'f45c3f06009aa794172b82fca4d9a8f0';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // For posters

document.addEventListener('DOMContentLoaded', () => {
    const popularContainer = document.querySelector('.popular');
    const trendingContainer = document.querySelector('.trending');
    
    // Fetch real data from the API
    fetchPopularMovies(popularContainer);
    fetchTrendingMovies(trendingContainer);
});

// NEW: Fetches popular movies from TMDB
async function fetchPopularMovies(container) {
    try {
        const url = `${TMDB_BASE_URL}/movie/popular?api_key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        populateSection(container, data.results); // Use the results from the API
    } catch (error) {
        console.error('Error fetching popular movies:', error);
    }
}

// NEW: Fetches trending movies from TMDB
async function fetchTrendingMovies(container) {
    try {
        const url = `${TMDB_BASE_URL}/trending/movie/week?api_key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        populateTrending(container, data.results); // Use the results from the API
    } catch (error) {
        console.error('Error fetching trending movies:', error);
    }
}

// UPDATED: Builds 'Popular' cards using API data
function populateSection(container, movies) {
    if (!container) return; 
    container.innerHTML = ''; 
    
    movies.forEach(movie => {
        const posterPath = movie.poster_path 
            ? `${IMAGE_BASE_URL}${movie.poster_path}`
            : 'https://placehold.co/300x450/0f0d23/FFF?text=No+Image';

        const movieCardHTML = `
            <div class="moveies-card" onclick="showMovieDetails(${movie.id})">
                <img src="${posterPath}" alt="${movie.title}"> 
                <h3>${movie.title}</h3> 
                <div class="details-row">
                    <img src="/Assets/star.svg">
                    <h4>${movie.vote_average.toFixed(1)}</h4>
                    <div>
                        <span>• ${movie.release_date.split('-')[0]}</span> 
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += movieCardHTML;
    });
}

// UPDATED: Builds 'Trending' cards using API data
function populateTrending(container, movies) {
    if (!container) return;
    container.innerHTML = '';

    let count = 1;
    // Get only the top 6
    movies.slice(0, 6).forEach(movie => {
        const posterPath = movie.poster_path 
            ? `${IMAGE_BASE_URL}${movie.poster_path}`
            : 'https://placehold.co/300x450/0f0d23/FFF?text=No+Image';

        const cardHTML = `
            <div class="trending-card" onclick="showMovieDetails(${movie.id})">
                <span class="trending-card-number">${count}</span>
                <img src="${posterPath}" alt="${movie.title}">
            </div>
        `;
        container.innerHTML += cardHTML;
        count++;
    });
}


// All modal functions
async function showMovieDetails(movieId) {
    const modal = document.getElementById('movie-modal');
    modal.style.display = 'block';
    
    const url = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos,release_dates`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        document.getElementById('modal-title').innerText = data.title;
        document.getElementById('modal-year').innerText = data.release_date.split('-')[0];
        document.getElementById('modal-rating-cert').innerText = getRatingCert(data.release_dates);
        document.getElementById('modal-runtime').innerText = formatRuntime(data.runtime);
        
        const voteAvg = data.vote_average.toFixed(1);
        const voteCount = formatVoteCount(data.vote_count);
        document.getElementById('modal-vote-avg').innerText = voteAvg;
        document.getElementById('modal-vote-count').innerText = `/10 (${voteCount})`;

        document.getElementById('modal-poster-img').src = data.poster_path 
            ? `${IMAGE_BASE_URL}${data.poster_path}` 
            : 'https://placehold.co/300x450/0f0d23/FFF?text=No+Poster';
            
        document.getElementById('modal-backdrop-img').src = data.backdrop_path 
            ? `${IMAGE_BASE_URL}${data.backdrop_path}` 
            : 'https://placehold.co/500x281/0f0d23/FFF?text=No+Backdrop';
        
        const trailer = getTrailer(data.videos);
        const trailerLink = document.getElementById('modal-trailer-link');
        if (trailer) {
            trailerLink.href = `https://www.youtube.com/watch?v=${trailer.key}`;
            trailerLink.style.display = 'inline-block';
            document.getElementById('modal-trailer-time').style.display = 'none';
        } else {
            trailerLink.style.display = 'none';
        }

        document.getElementById('modal-genres').innerHTML = data.genres.map(g => 
            `<span class="genre-tag">${g.name}</span>`
        ).join('');
        
        document.getElementById('modal-overview').innerText = data.overview || 'N/A';
        document.getElementById('modal-release-date').innerText = new Date(data.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('modal-countries').innerText = data.production_countries.map(c => c.name).join(', ') || 'N/A';
        document.getElementById('modal-status').innerText = data.status || 'N/A';
        document.getElementById('modal-language').innerText = data.spoken_languages.map(l => l.english_name).join(', ') || 'N/A';
        document.getElementById('modal-budget').innerText = formatCurrency(data.budget);
        document.getElementById('modal-revenue').innerText = formatCurrency(data.revenue);
        document.getElementById('modal-tagline').innerText = data.tagline || 'N/A';
        document.getElementById('modal-production').innerText = data.production_companies.map(p => p.name).join(', ') || 'N/A';

        const homepageLink = document.getElementById('modal-homepage-link');
        if (data.homepage) {
            homepageLink.href = data.homepage;
            homepageLink.style.display = 'inline-block';
        } else {
            homepageLink.style.display = 'none';
        }

    } catch (error) {
        console.error('Error fetching movie details:', error);
        document.getElementById('modal-title').innerText = "Error loading movie.";
    }
}

function closeModal() {
    const modal = document.getElementById('movie-modal');
    modal.style.display = 'none';
    
    document.getElementById('modal-title').innerText = "Loading...";
    document.getElementById('modal-poster-img').src = "https://placehold.co/300x450/0f0d23/FFF?text=Poster";
    document.getElementById('modal-backdrop-img').src = "https://placehold.co/500x281/0f0d23/FFF?text=Backdrop";
}

function closeModalOutside(event) {
    const modal = document.getElementById('movie-modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function formatRuntime(minutes) {
    if (!minutes) return 'N/A';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
}

function formatCurrency(number) {
    if (!number) return 'N/A';
    return '$' + new Intl.NumberFormat('en-US').format(number);
}

function formatVoteCount(count) {
    if (!count) return '0';
    if (count > 1000) {
        return (count / 1000).toFixed(0) + 'K';
    }
    return count;
}

function getRatingCert(releaseDates) {
    try {
        const usRelease = releaseDates.results.find(r => r.iso_3166_1 === 'US');
        const cert = usRelease.release_dates[0].certification;
        return cert || 'N/A';
    } catch (error) {
        return 'N/A';
    }
}

function getTrailer(videos) {
    try {
        return videos.results.find(v => 
            v.site === 'YouTube' && 
            (v.type === 'Trailer' || v.type === 'Teaser')
        );
    } catch (error) {
        return null;
    }
}