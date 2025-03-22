import { MainLayout } from '@/components/layouts/MainLayout';
import { Main } from '@/components/pages/Main';
import { getAllPosts } from '@/lib/services/db/get-all-posts';
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: Promise<{ postId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // Fetch post data
  const posts = await getAllPosts('newest');
  const resolvedParams = await params;
  const post = posts.find((p) => p.id === resolvedParams.postId);

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested post could not be found.',
    };
  }

  const imageUrl = post.imageUrl;
  const title = post.title;
  const description = post.title; // You might want to add a separate description field to your posts
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/${post.id}`;

  return {
    title,
    description,
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    ),
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: 'Web3 Imgur',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
        ...previousImages,
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@web3imgur', // Replace with your Twitter handle
      creator: post.user?.twitter_handle || '@web3imgur', // Use post author's Twitter handle if available
      title,
      description,
      images: [imageUrl],
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
