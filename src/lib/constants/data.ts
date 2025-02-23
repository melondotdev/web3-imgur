import { Post, User, Comment } from '@/lib/types/post';

export const mockPosts: Post[] = [
  {
    id: '1',
    imageUrl: '/assets/GkGfKESXgAA_7Ls.jpeg',
    username: 'ghost.1',
    votes: 156,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    tags: [] // add tags if needed
  },
  {
    id: '2',
    imageUrl: '/assets/GkL8vkGXYAAtJXO.jpeg',
    username: 'ghost.2',
    votes: 98,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    tags: []
  },
  {
    id: '3',
    imageUrl: '/assets/GkL74ABXIAAMTmG.jpeg',
    username: 'ghost.3',
    votes: 234,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    tags: []
  },
  {
    id: '4',
    imageUrl: '/assets/GkLm7k5WYAAsXmt.jpeg',
    username: 'ghost.4',
    votes: 167,
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    tags: []
  },
  {
    id: '5',
    imageUrl: '/assets/GkLnS7QWgAA6kmq.jpeg',
    username: 'ghost.5',
    votes: 321,
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    tags: []
  },
  {
    id: '6',
    imageUrl: '/assets/GkLzE2XbUAQDtBv.jpeg',
    username: 'ghost.6',
    votes: 189,
    createdAt: new Date(Date.now() - 518400000).toISOString(),
    tags: []
  }
];

export const mockComments: Comment[] = [
  {
    id: '1',
    postId: '1',
    author: 'ghost.2',
    content: 'the flames speak to me...',
    createdAt: new Date(Date.now() - 82800000).toISOString()
  },
  {
    id: '2',
    postId: '2',
    author: 'ghost.1',
    content: 'dancing in the dark',
    createdAt: new Date(Date.now() - 171800000).toISOString()
  },
  {
    id: '3',
    postId: '3',
    author: 'ghost.1',
    content: 'shadows never lie',
    createdAt: new Date(Date.now() - 258200000).toISOString()
  },
  {
    id: '4',
    postId: '4',
    author: 'ghost.2',
    content: 'eternal flame',
    createdAt: new Date(Date.now() - 344600000).toISOString()
  },
  {
    id: '5',
    postId: '5',
    author: 'ghost.3',
    content: 'burning bright',
    createdAt: new Date(Date.now() - 431000000).toISOString()
  },
  {
    id: '6',
    postId: '6',
    author: 'ghost.4',
    content: 'into the void',
    createdAt: new Date(Date.now() - 517400000).toISOString()
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'ghost.1'
  }
];
