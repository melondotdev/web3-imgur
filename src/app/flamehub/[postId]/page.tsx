import { MainLayout } from '@/components/layouts/MainLayout';
import { FlameHub } from '@/components/pages/FlameHub';

interface FlameHubPostPageProps {
  params: {
    postId: string;
  };
}

export default function FlameHubPostPage({ params }: FlameHubPostPageProps) {
  return (
    <MainLayout>
      <FlameHub initialPostId={params.postId} />
    </MainLayout>
  );
}
