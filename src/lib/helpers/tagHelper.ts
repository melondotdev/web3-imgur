import type { Tag } from '@/types';
/**
 * Tag helpers for react-tag-input.
 */
export function deleteTag(tags: Tag[], index: number): Tag[] {
  return tags.filter((_, i) => i !== index);
}

export function addTag(tags: Tag[], tag: Tag): Tag[] {
  return [...tags, tag];
}

export function dragTag(tags: Tag[], tag: Tag, currPos: number, newPos: number): Tag[] {
  const newTags = [...tags];
  newTags.splice(currPos, 1);
  newTags.splice(newPos, 0, tag);
  return newTags;
}