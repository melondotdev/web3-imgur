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

  return {
    title: post.title,
    description: post.title,
    openGraph: {
      title: post.title,
      description: post.title,
      images: [
        {
          url: post.imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
        ...previousImages,
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.title,
      images: [post.imageUrl],
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
