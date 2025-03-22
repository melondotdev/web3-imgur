import { MainLayout } from '@/components/layouts/MainLayout';
import { FlameHub } from '@/components/pages/FlameHub';
import { getAllPosts } from '@/lib/services/db/get-all-posts';
import type { Metadata } from 'next';
import { Suspense } from 'react';

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
  const description = post.title;
  const url = `${baseUrl}/flamehub/${post.id}`;

  return {
    title: `${title} | flamehub`,
    description,
    metadataBase: new URL(baseUrl),
    openGraph: {
      type: 'website',
      url,
      title: `${title} | flamehub`,
      description,
      siteName: 'flamehub',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@theflamesolana',
      creator: post.user?.twitter_handle || '@theflamesolana',
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function FlameHubPostPage({ params }: Props) {
  const resolvedParams = await params;
  return (
    <MainLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <FlameHub initialPostId={resolvedParams.postId} />
      </Suspense>
    </MainLayout>
  );
}
