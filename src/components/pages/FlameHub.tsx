'use client';
import { Gallery } from '../gallery/Gallery';

interface FlameHubProps {
  initialPostId?: string;
}

export function FlameHub({ initialPostId }: FlameHubProps) {
  return <Gallery initialPostId={initialPostId} defaultTag="flame" />;
}
