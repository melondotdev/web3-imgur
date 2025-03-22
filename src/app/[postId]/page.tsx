import { MainLayout } from '@/components/layouts/MainLayout';
import { Main } from '@/components/pages/Main';
import { getAllPosts } from '@/lib/services/db/get-all-posts';
import type { Metadata } from 'next';

interface PostPageProps {
  params: {
    postId: string;
  };
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  // Fetch post data
  const posts = await getAllPosts('newest');
  const post = posts.find((p) => p.id === params.postId);

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

export default async function PostPage({ params }: PostPageProps) {
  return (
    <MainLayout>
      <Main initialPostId={params.postId} />
    </MainLayout>
  );
}
