import { MainLayout } from '@/components/layouts/MainLayout';
import { FlameHub } from '@/components/pages/FlameHub';
import { Suspense } from 'react';

interface FlameHubPostPageProps {
  params: {
    postId: string;
  };
}

export default async function FlameHubPostPage({
  params,
}: FlameHubPostPageProps) {
  // Ensure params is resolved before accessing its properties
  const { postId } = await Promise.resolve(params);

  return (
    <MainLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <FlameHub initialPostId={postId} />
      </Suspense>
    </MainLayout>
  );
}
