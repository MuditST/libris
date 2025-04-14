export interface BookVolumeInfo {
  title: string;
  authors?: string[];
  description?: string;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
    [key: string]: string | undefined;
  };
  // Add these optional properties
  publishedDate?: string;
  categories?: string[];
  // Add other fields as needed
}

export interface BookItem {
  id: string;
  volumeInfo: BookVolumeInfo;
  _shelf?: string; // For tracking shelf in local state
  _favorite?: boolean; // For tracking favorite status
}

// Or if you're importing BookItem from Google Books API,
// consider creating an extended type:
export interface ExtendedBookItem extends BookItem {
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
      [key: string]: string | undefined;
    };
    publishedDate?: string;
    categories?: string[];
    // Add any other fields you need
  }
}