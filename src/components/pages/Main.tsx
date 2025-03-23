'use client';
import { Gallery } from '../gallery/Gallery';

interface MainProps {
  initialPostId?: string;
}

export function Main({ initialPostId }: MainProps) {
  return <Gallery initialPostId={initialPostId} />;
}
