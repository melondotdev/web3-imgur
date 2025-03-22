import { MainLayout } from '@/components/layouts/MainLayout';
import { Main } from '@/components/pages/Main';
import { getAllPosts } from '@/lib/services/db/get-all-posts';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ postId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Fetch post data
  const posts = await getAllPosts('newest');
  const resolvedParams = await params;
  const post = posts.find((p) => p.id === resolvedParams.postId);

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested post could not be found.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const imageUrl = post.imageUrl.startsWith('http')
    ? post.imageUrl
    : `${baseUrl}${post.imageUrl}`;
  const title = post.title;
  const description = post.title; // You might want to add a separate description field to your posts
  const url = `${baseUrl}/${post.id}`;

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: 'borkhub',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    // Only specify Twitter-specific properties
    twitter: {
      card: 'summary_large_image',
      site: '@borkinstitute',
      creator: post.user?.twitter_handle || '@borkinstitute',
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const resolvedParams = await params;
  return (
    <MainLayout>
      <Main initialPostId={resolvedParams.postId} />
    </MainLayout>
  );
}
