import { redirect } from 'next/navigation';

export default function NewBlogPostRedirect() {
  redirect('/client/online-store/blogs/posts/new');
}
