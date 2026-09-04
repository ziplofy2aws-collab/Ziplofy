import { redirect } from 'next/navigation';

type Props = { params: Promise<{ id: string }> };

export default async function EditBlogPostRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/client/online-store/blogs/posts/${id}`);
}
