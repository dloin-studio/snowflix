const MOVIE_DATA = {
    trending: [
        { id: 1, title: 'The Santa Clause', year: 1994, rating: 6.5, genre: '• Family • Fantasy' },
        { id: 2, title: 'National Lampoon\'s Christmas Vacation', year: 1989, rating: 7.5, genre: '• Comedy' },
        { id: 3, title: 'How the Grinch Stole Christmas', year: 2000, rating: 6.3, genre: '• Family • Comedy' },
        { id: 4, title: 'A Christmas Story', year: 1983, rating: 7.9, genre: '• Family • Comedy' },
        { id: 5, title: 'White Christmas', year: 1954, rating: 7.6, genre: '• Musical • Romance' },
        { id: 6, title: 'The Nightmare Before Christmas', year: 1993, rating: 8.0, genre: '• Animation • Musical' },
    ],

    popular: [
        { id: 1, title: 'The Polar Express', year: 2004, rating: 6.6, genre: '• Animation • Family' },
        { id: 2, title: 'Miracle on 34th Street', year: 1994, rating: 6.6, genre: '• Family • Drama' },
        { id: 3, title: 'Love Actually', year: 2003, rating: 7.6, genre: '• Romance • Comedy' },
        { id: 4, title: 'The Holiday', year: 2006, rating: 6.9, genre: '• Romance • Comedy' },
        { id: 5, title: 'Jingle All the Way', year: 1996, rating: 5.7, genre: '• Family • Comedy' },
        { id: 6, title: 'A Muppet Christmas Carol', year: 1992, rating: 7.8, genre: '• Family • Musical' },
        { id: 7, title: 'Bad Santa', year: 2003, rating: 7.1, genre: '• Comedy • Crime' },
        { id: 8, title: 'Klaus', year: 2019, rating: 8.2, genre: '• Animation • Adventure' },
    ],
}


document.addEventListener('DOMContentLoaded', () => {
    const popularContainer = document.querySelector('.popular');
    
    populateSection(popularContainer, MOVIE_DATA.popular);
});

function populateSection(container, movies) {
    if (!container) return; 
    
    container.innerHTML = ''; 
    
    movies.forEach(movie => {
        const movieCardHTML = `
            <div class="moveies-card">
                <img src="/Assets/data/${movie.id}.jpg" alt="${movie.title}"> 
                <h3>${movie.title}</h3> 
                <div class="details-row">
                    <img src="/Assets/star.svg">
                    <h4>${movie.rating}</h4>
                    <div>
                        <span>${movie.genre}</span> 
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += movieCardHTML;
    });
}