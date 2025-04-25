export interface BookVolumeInfo {
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
 
}

export interface BookItem {
  id: string;
  volumeInfo: BookVolumeInfo;
  _shelf?: string; 
  _favorite?: boolean;
}


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
  }
}