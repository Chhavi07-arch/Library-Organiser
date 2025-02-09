// API Configuration
const API_URL = 'https://www.googleapis.com/books/v1/volumes';

// State Management
let myLibrary = [];
let favorites = [];
let readBooks = [];
let searchResults = [];

// Dark Mode Toggle
document.getElementById('darkModeToggle')?.addEventListener('change', function () {
    document.body.setAttribute('data-theme', this.checked ? 'dark' : 'light');
    localStorage.setItem('darkMode', this.checked);
});

// Search Books
async function searchBooks() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;

    const container = document.getElementById('searchResults');
    container.innerHTML = '<p>Searching...</p>';

    try {
        const response = await fetch(`${API_URL}?q=${encodeURIComponent(query)}&maxResults=40`);
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        if (!data.items) {
            container.innerHTML = '<p>No books found</p>';
            return;
        }

        searchResults = data.items;
        displaySearchResults(searchResults);
    } catch (error) {
        container.innerHTML = `<p>Error: ${error.message}</p>`;
        console.error('Search failed:', error);
    }
}

function displaySearchResults(books) {
    const container = document.getElementById('searchResults');
    container.innerHTML = '';

    if (!books.length) {
        container.innerHTML = '<p>No books found</p>';
        return;
    }

    books.forEach(book => {
        const card = createBookCard(book);
        container.appendChild(card);
    });
}

function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.draggable = true;
    card.setAttribute('data-book-id', book.id);

    const cardInner = document.createElement('div');
    cardInner.className = 'book-card-inner';

    const thumbnail = book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=No+Cover';
    const title = book.volumeInfo.title || 'Unknown Title';
    const authors = book.volumeInfo.authors?.join(', ') || 'Unknown Author';

    cardInner.innerHTML = `
        <div class="book-card-front">
            <img src="${thumbnail}" alt="${title}" onerror="this.src='https://via.placeholder.com/128x192?text=No+Cover'">
            <h3>${title}</h3>
            <p>${authors}</p>
        </div>
        <div class="book-card-back">
            <button class="library-button" onclick="addToLibrary('${book.id}')">Add to Library</button>
            <button class="read-button" onclick="window.open('${book.volumeInfo.previewLink || '#'}', '_blank')">Read Now</button>
            <button class="buy-button" onclick="window.open('${book.saleInfo?.buyLink || '#'}', '_blank')">Buy Now</button>
        </div>
    `;

    card.appendChild(cardInner);

    // Flip feature
    card.addEventListener('click', (e) => {
        if (!e.target.matches('button')) {
            card.classList.toggle('flipped');
        }
    });

    // Drag-and-drop feature
    card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', book.id);
        setTimeout(() => {
            card.style.display = 'none'; // Hide the card while dragging
        }, 0);
    });

    card.addEventListener('dragend', () => {
        card.style.display = 'block'; // Show the card after dragging
    });

    return card;
}

function createLibraryBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.draggable = true;
    card.setAttribute('data-book-id', book.id);

    const progress = book.progress || 0;
    const notes = book.notes || '';

    card.innerHTML = `
        <div class="book-card-inner">
            <div class="book-card-front">
                <img src="${book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=No+Cover'}" 
                     alt="${book.volumeInfo.title}"
                     onerror="this.src='https://via.placeholder.com/128x192?text=No+Cover'">
                <h3>${book.volumeInfo.title}</h3>
                <p>${book.volumeInfo.authors?.join(', ') || 'Unknown Author'}</p>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
                <p>${progress}% Complete</p>
            </div>
            <div class="book-card-back">
                <textarea class="notes-input" placeholder="Add notes..."
                    onchange="updateNotes('${book.id}', this.value)">${notes}</textarea>
                <input type="range" value="${progress}" min="0" max="100"
                    onchange="updateProgress('${book.id}', this.value)">
                <button class="remove-button" onclick="removeFromLibrary('${book.id}')">Remove</button>
            </div>
        </div>
    `;

    // Flip feature
    card.addEventListener('click', (e) => {
        if (!e.target.matches('button, textarea, input')) {
            card.classList.toggle('flipped');
        }
    });

    // Drag-and-drop feature
    card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', book.id);
        setTimeout(() => {
            card.style.display = 'none'; // Hide the card while dragging
        }, 0);
    });

    card.addEventListener('dragend', () => {
        card.style.display = 'block'; // Show the card after dragging
    });

    return card;
}

// Drag-and-Drop Functions
function allowDrop(ev) {
    ev.preventDefault();
    const dropZone = ev.target.closest('.library-grid');
    if (dropZone) dropZone.classList.add('drag-over');
}

function drop(ev) {
    ev.preventDefault();
    const bookId = ev.dataTransfer.getData('text/plain');
    const target = ev.target.closest('.library-grid');
    if (!target) return;

    target.classList.remove('drag-over');

    if (target.id === 'myLibrary') addToLibrary(bookId);
    else if (target.id === 'favorites') addToFavorites(bookId);
    else if (target.id === 'readBooks') addToReadBooks(bookId);
}

// Library Management Functions
function addToLibrary(bookId) {
    const book = findBook(bookId);
    if (!book || myLibrary.some(b => b.id === bookId)) return;

    myLibrary.push({
        ...book,
        notes: '',
        progress: 0
    });

    updateAllDisplays();
}

function addToFavorites(bookId) {
    const book = findBook(bookId);
    if (!book || favorites.some(b => b.id === bookId)) return;
    favorites.push(book);
    updateAllDisplays();
}

function addToReadBooks(bookId) {
    const book = findBook(bookId);
    if (!book || readBooks.some(b => b.id === bookId)) return;
    readBooks.push(book);
    updateAllDisplays();
}

function updateAllDisplays() {
    updateLibraryDisplay();
    updateFavoritesDisplay();
    updateReadBooksDisplay();
    saveToLocalStorage();
}

function updateLibraryDisplay() {
    const container = document.getElementById('myLibrary');
    if (!container) return;
    container.innerHTML = '';
    myLibrary.forEach(book => {
        container.appendChild(createLibraryBookCard(book));
    });
}

function updateFavoritesDisplay() {
    const container = document.getElementById('favorites');
    if (!container) return;
    container.innerHTML = '';
    favorites.forEach(book => {
        container.appendChild(createLibraryBookCard(book));
    });
}

function updateReadBooksDisplay() {
    const container = document.getElementById('readBooks');
    if (!container) return;
    container.innerHTML = '';
    readBooks.forEach(book => {
        container.appendChild(createLibraryBookCard(book));
    });
}

function findBook(bookId) {
    return searchResults.find(book => book.id === bookId) ||
        myLibrary.find(book => book.id === bookId) ||
        favorites.find(book => book.id === bookId) ||
        readBooks.find(book => book.id === bookId);
}

function updateNotes(bookId, notes) {
    const book = myLibrary.find(b => b.id === bookId);
    if (book) {
        book.notes = notes;
        saveToLocalStorage();
    }
}

function updateProgress(bookId, progress) {
    const book = myLibrary.find(b => b.id === bookId);
    if (book) {
        book.progress = parseInt(progress);
        saveToLocalStorage();
    }
}

function removeFromLibrary(bookId) {
    myLibrary = myLibrary.filter(book => book.id !== bookId);
    favorites = favorites.filter(book => book.id !== bookId);
    readBooks = readBooks.filter(book => book.id !== bookId);
    updateAllDisplays();
}

// Sorting and Filtering Functions
function sortBooks(criteria) {
    switch (criteria) {
        case 'titleAsc':
            myLibrary.sort((a, b) => a.volumeInfo.title.localeCompare(b.volumeInfo.title));
            break;
        case 'titleDesc':
            myLibrary.sort((a, b) => b.volumeInfo.title.localeCompare(a.volumeInfo.title));
            break;
        case 'authorAsc':
            myLibrary.sort((a, b) => {
                const authorA = a.volumeInfo.authors?.[0] || '';
                const authorB = b.volumeInfo.authors?.[0] || '';
                return authorA.localeCompare(authorB);
            });
            break;
        case 'authorDesc':
            myLibrary.sort((a, b) => {
                const authorA = a.volumeInfo.authors?.[0] || '';
                const authorB = b.volumeInfo.authors?.[0] || '';
                return authorB.localeCompare(authorA);
            });
            break;
    }
    updateLibraryDisplay();
}

function filterByGenre(genre) {
    if (genre === 'all') {
        updateLibraryDisplay();
        return;
    }
    const filtered = myLibrary.filter(book =>
        book.volumeInfo.categories?.some(cat =>
            cat.toLowerCase().includes(genre.toLowerCase())
        )
    );
    const container = document.getElementById('myLibrary');
    if (!container) return;
    container.innerHTML = '';
    filtered.forEach(book => {
        container.appendChild(createLibraryBookCard(book));
    });
}

// Local Storage Functions
function saveToLocalStorage() {
    localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
    localStorage.setItem('favorites', JSON.stringify(favorites));
    localStorage.setItem('readBooks', JSON.stringify(readBooks));
}

function loadFromLocalStorage() {
    myLibrary = JSON.parse(localStorage.getItem('myLibrary')) || [];
    favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    readBooks = JSON.parse(localStorage.getItem('readBooks')) || [];
    updateAllDisplays();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();

    // Set dark mode preference
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.checked = localStorage.getItem('darkMode') === 'true';
        document.body.setAttribute('data-theme', darkModeToggle.checked ? 'dark' : 'light');
    }

    // Add event listeners
    document.getElementById('searchButton')?.addEventListener('click', searchBooks);
    document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchBooks();
    });
    document.getElementById('sortSelect')?.addEventListener('change', (e) => sortBooks(e.target.value));
    document.getElementById('genreFilter')?.addEventListener('change', (e) => filterByGenre(e.target.value));
});