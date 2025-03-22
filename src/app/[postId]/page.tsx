import { MainLayout } from '@/components/layouts/MainLayout';
import { Main } from '@/components/pages/Main';

interface PostPageProps {
  params: {
    postId: string;
  };
}

export default async function PostPage({ params }: PostPageProps) {
  return (
    <MainLayout>
      <Main initialPostId={params.postId} />
    </MainLayout>
  );
}
