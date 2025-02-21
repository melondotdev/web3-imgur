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
  username: string;
  votes: number;
  createdAt: string;
  tags: Tag[];
}

export interface User {
  id: string;
  username: string;
}

export interface Tag {
  id: string;
  text: string;
}
