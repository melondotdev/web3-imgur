export interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  imageUrl: string;
  author: string;
  votes: number;
  createdAt: string;
  comments: Comment[];
}

export interface User {
  id: string;
  username: string;
}