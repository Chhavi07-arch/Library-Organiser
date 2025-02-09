# Library-Organiser
# 📚 BookVerse - Your Digital Library Haven

BookVerse is a web-based library organizer that helps you manage your reading collection, track progress, and discover new books. Built with vanilla JavaScript and powered by the Google Books API, it provides a clean, intuitive interface for all your book management needs.

![BookVerse Screenshot](screenshots/bookverse-main.png)

## ✨ Features

- 📱 Clean, responsive interface with dark/light mode
- 🔍 Book search powered by Google Books API
- 📚 Multiple collection support (Library, Favorites, Read)
- 📊 Reading progress tracking
- 📝 Personal notes for each book
- 🎯 Drag-and-drop organization
- 🔄 Sort by title or author
- 🏷️ Genre-based filtering
- 💾 Local storage persistence

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bookverse.git
cd bookverse
```

2. Open `index.html` in your browser or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

3. Start organizing your library!

## 💡 How to Use

### Search & Add Books
```javascript
// Search for books
const searchInput = document.getElementById('searchInput');
searchInput.value = 'Your favorite book';
searchButton.click();

// Add to library
const bookCard = document.querySelector('.book-card');
bookCard.querySelector('.library-button').click();
```

### Organize Collections
- Drag books between Library, Favorites, and Read sections
- Click cards to flip and access additional options
- Use progress slider to track reading status
- Add personal notes on the back of cards

### Customize View
```javascript
// Toggle dark mode
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.checked = true;

// Filter by genre
const genreFilter = document.getElementById('genreFilter');
genreFilter.value = 'fiction';

// Sort books
const sortSelect = document.getElementById('sortSelect');
sortSelect.value = 'titleAsc';
```

## 🛠️ Technical Details

### Dependencies
```html
<!-- Font Awesome for icons -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
```

### API Integration
```javascript
const API_URL = 'https://www.googleapis.com/books/v1/volumes';
// Search example
async function searchBooks() {
    const response = await fetch(`${API_URL}?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    // Process results...
}
```

### Local Storage
```javascript
// Save library data
localStorage.setItem('myLibrary', JSON.stringify(myLibrary));

// Load library data
const savedLibrary = JSON.parse(localStorage.getItem('myLibrary')) || [];
```

## 🔧 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)



---
Made with ❤️ by [CHHAVI]
