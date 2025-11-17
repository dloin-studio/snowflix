const API_KEY = 'f45c3f06009aa794172b82fca4d9a8f0';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w780';
const CHRISTMAS_KEYWORD_ID = '207317';

let popularPage = 1;

document.addEventListener('DOMContentLoaded', () => {
    const popularContainer = document.querySelector('.popular');
    const trendingContainer = document.querySelector('.trending');
    const seeMoreBtn = document.getElementById('see-more-btn');
    const searchBar = document.getElementById('search-bar'); 

    searchBar.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            const query = searchBar.value.trim();

            popularContainer.innerHTML = ''; 

            if (query) {
                seeMoreBtn.style.display = 'none';
                fetchSearchResults(popularContainer, query);
            } else {
                popularPage = 1;
                seeMoreBtn.style.display = 'block';
                fetchPopularMovies(popularContainer);
            }
        }
    });

    seeMoreBtn.addEventListener('click', () => {
        popularPage++; 
        fetchPopularMovies(popularContainer); 
    });
    
    popularContainer.innerHTML = '';
    
    fetchPopularMovies(popularContainer);
    fetchTrendingMovies(trendingContainer);
});

// Fetches popular movies from TMDB
async function fetchPopularMovies(container) {
    try {
        const url = `${TMDB_BASE_URL}/discover/movie?api_key=${API_KEY}&with_keywords=${CHRISTMAS_KEYWORD_ID}&sort_by=vote_count.desc&page=${popularPage}`;        
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
        const url = `${TMDB_BASE_URL}/discover/movie?api_key=${API_KEY}&with_keywords=${CHRISTMAS_KEYWORD_ID}&sort_by=popularity.desc`;        const response = await fetch(url);
        const data = await response.json();
        populateTrending(container, data.results); // Use the results from the API
    } catch (error) {
        console.error('Error fetching trending movies:', error);
    }
}

async function fetchSearchResults(container, query) {
    try {
        const url = `${TMDB_BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&page=1`;
        const response = await fetch(url);
        const data = await response.json();
        populateSection(container, data.results); // Reuse your existing card builder
    } catch (error) {
        console.error('Error fetching search results:', error);
    }
}

// UPDATED: Builds 'Popular' cards using API data
function populateSection(container, movies) {
    if (!container) return; 
        
    movies.forEach(movie => {
        const posterPath = movie.poster_path 
            ? `${BACKDROP_BASE_URL}${movie.backdrop_path}`
            : 'https://placehold.co/500x281/0f0d23/FFF?text=No+Backdrop';

        const movieCardHTML = `
            <div class="moveies-card" onclick="showMovieDetails(${movie.id})">
                <img src="${posterPath}" alt="${movie.title}"> 
                <h3>${movie.title}</h3> 
                <div class="details-row">
                    <img src="Assets/star.svg">
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
    // Get only the top 10
    movies.slice(0, 10).forEach(movie => {
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
            
        // UPDATED: Using new backdrop URL
        document.getElementById('modal-backdrop-img').src = data.backdrop_path 
            ? `${BACKDROP_BASE_URL}${data.backdrop_path}` 
            : 'https://placehold.co/500x281/0f0d23/FFF?text=Backdrop';
        
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
        
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
        document.querySelector('.modal-content').style.transform = 'scale(1)';

    } catch (error) {
        console.error('Error fetching movie details:', error);
        document.getElementById('modal-title').innerText = "Error loading movie.";
    }
}

// UPDATED: This function now resets ALL modal fields
function closeModal() {
    const modal = document.getElementById('movie-modal');
    
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';
    document.querySelector('.modal-content').style.transform = 'scale(0.95)';    

    // Reset all text and images to their placeholder state
    document.getElementById('modal-title').innerText = "Loading...";
    document.getElementById('modal-poster-img').src = "https://placehold.co/300x450/0f0d23/FFF?text=Poster";
    document.getElementById('modal-backdrop-img').src = "https://placehold.co/500x281/0f0d23/FFF?text=Backdrop";
    
    document.getElementById('modal-year').innerText = "....";
    document.getElementById('modal-rating-cert').innerText = "...";
    document.getElementById('modal-runtime').innerText = "...";
    document.getElementById('modal-vote-avg').innerText = "0.0";
    document.getElementById('modal-vote-count').innerText = "/10 (0)";
    
    document.getElementById('modal-genres').innerHTML = ''; // Clear genres
    document.getElementById('modal-overview').innerText = "Loading overview...";
    
    document.getElementById('modal-release-date').innerText = "Loading...";
    document.getElementById('modal-countries').innerText = "Loading...";
    document.getElementById('modal-status').innerText = "Loading...";
    document.getElementById('modal-language').innerText = "Loading...";
    document.getElementById('modal-budget').innerText = "Loading...";
    document.getElementById('modal-revenue').innerText = "Loading...";
    document.getElementById('modal-tagline').innerText = "Loading...";
    document.getElementById('modal-production').innerText = "Loading...";

    document.getElementById('modal-homepage-link').style.display = 'none';
    document.getElementById('modal-trailer-link').style.display = 'none';
}

function closeModalOutside(event) {
    const modal = document.getElementById('movie-modal');
    if (event.target == modal) {
        closeModal(); // Call your new, full-reset closeModal function
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
        if (usRelease && usRelease.release_dates[0]) {
            const cert = usRelease.release_dates[0].certification;
            return cert || 'N/A';
        }
        return 'N/A';
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
