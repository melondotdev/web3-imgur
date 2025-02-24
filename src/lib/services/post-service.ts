export async function createPost(formData: FormData) {
  const response = await fetch('/api/post', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw await response.json();
  }

  return response.json();
}
