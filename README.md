# Libris - Your Personal Library, Reinvented

Libris is a cozy, AI-powered book management app that allows users to curate, organize, and discover books in their personal collection. It helps you explore trending titles, organize your bookshelf into categories, and even chat with books using the "Book Talk" feature. Additionally, Libris offers personalized recommendations through the "Book Blend" tool based on your reading preferences.

## Features

### 📚 **Explore & Discover**

- **Discover:** Browse trending titles, handpicked recommendations, and filter by subject and genre.
- **Search:** Find any book by title, author, or genre using the powerful search functionality.

### 🏡 **Personal Bookshelf**

- **Categorize:** Organize your books into distinct shelves like _Will Read_, _Currently Reading_, _Finished_, and _Favorites_.
- **Personalized Library:** Your bookshelf isn't just a list, it's a curated space that mirrors your reading journey.

### 🧠 **AI Tools**

- **Book Talk:** Select any book from your shelf and talk to it. Ask questions about characters, themes, and more through the AI-powered chat assistant.
- **Book Blend:** Select five books you adore, and Libris will recommend five more titles based on your taste, thanks to the Gemini 2.0 Flash AI.

### 🌱 **Aesthetic & Serene**

- Libris is designed to feel like a cozy corner of a library, offering an aesthetic interface and user experience that resonates with book lovers.

## Technologies Used

- **Next.js:** Framework for building the app, ensuring a fast and responsive experience.
- **Google Books API:** Used for fetching book details and metadata, allowing users to explore books.
- **Gemini 2.0 Flash:** For AI-powered features like "Book Talk" and "Book Blend", delivering personalized book recommendations.
- **Framer Motion:** For smooth animations, making the app interactive and visually appealing.
- **Clerk:** Used for authentication, providing secure login and account management for users.
- **Zustand:** For local state management and persistence across sessions.

## Getting Started

To run Libris locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/libris.git
   cd libris
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env.local` file in the root of the project.
   - Add the following environment variables
     ```bash
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
      CLERK_SECRET_KEY=

      NEXT_PUBLIC_CLERK_SIGN_IN_URL=
      NEXT_PUBLIC_CLERK_SIGN_UP_URL=

      GOOGLE_BOOKS_API_KEY=

      OPENROUTER_API_KEY=
     ```




4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open the app in your browser at `http://localhost:3000`.
