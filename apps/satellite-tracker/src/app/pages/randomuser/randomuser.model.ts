export interface RandomUser {
  name: {
    title: string;
    first: string;
    last: string;
  };
  email: string;

  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
}
