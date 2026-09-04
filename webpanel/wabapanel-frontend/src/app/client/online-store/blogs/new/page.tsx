import { redirect } from 'next/navigation';

export default function NewBlogRedirect() {
  redirect('/client/online-store/blogs/manage/new');
}
