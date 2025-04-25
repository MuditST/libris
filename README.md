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
   git clone https://github.com/MuditST/libris.git
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



## Privacy Policy

Libris is committed to protecting your privacy. This privacy policy outlines how we collect, use, and protect your personal information.

### **Data Collection**
- **Google OAuth Token:** To use the app, users are required to authenticate via Google OAuth. This allows Libris to access and manage your bookshelf information on Google Books.
- **Personal Information:** When you log in, we store your authentication details to sync and manage your bookshelf across devices. We do not share or sell your personal information.

### **How We Use Your Data**
- **Bookshelf Management:** We use your Google OAuth token to fetch, update, and manage your bookshelves in Google Books, enabling you to organize your personal collection.
- **AI Features:** The Book Talk and Book Blend features utilize your book data for generating personalized recommendations, providing a customized experience.

### **Data Protection**
- All personal information and OAuth tokens are securely stored and handled. We take reasonable measures to protect your data from unauthorized access or disclosure.

### **Data Retention**
- Your data will be retained only as long as you use Libris. If you choose to delete your account, all related data will be removed from our system, except for any data retained by Google Books through their own policies.

By using Libris, you agree to the collection and use of your data as described in this policy.

## Terms of Service

By accessing or using the Libris application, you agree to be bound by the following Terms of Service:

### **1. Account Creation and Authentication**
- You may need to create an account using your Google credentials. You will provide your Google OAuth token for bookshelf management within the app.
- You agree to the storage of your Google OAuth token and acknowledge that we will use it to interact with Google Books on your behalf for managing your bookshelf.

### **2. Bookshelf Management**
- You are responsible for managing your bookshelf. Libris will access your bookshelf on Google Books, add, update, and organize your books based on your interactions with the app.

### **3. Use of AI Features**
- The Book Talk and Book Blend features require access to your book data for generating personalized recommendations and insights. By using these features, you consent to our use of your book data for AI processing.

### **4. Data Security**
- While we make efforts to protect your data, we cannot guarantee the security of data transmitted over the internet. You are responsible for keeping your account credentials safe and notifying us of any suspicious activity.

### **5. Limitation of Liability**
- Libris is provided "as-is" without any warranties. We are not liable for any damages resulting from the use or inability to use the app, including but not limited to data loss, disruptions, or unauthorized access to your account.

### **6. Termination**
- We reserve the right to suspend or terminate your access to Libris at our discretion, including if you violate these Terms of Service.

### **7. Changes to Terms**
- We may update or change these Terms of Service at any time. All changes will be reflected here, and continued use of the app signifies your agreement to the updated terms.

