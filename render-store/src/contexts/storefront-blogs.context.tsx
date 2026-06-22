import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';
import { encodeStorefrontPathHandle } from '../utils/storefront-path-handle.util';

export interface StorefrontBlog {
	_id: string;
	storeId: string;
	title: string;
	pageTitle: string;
	metaDescription: string;
	urlHandle: string;
	comments?: string;
	postCount?: number;
	createdAt: string;
	updatedAt: string;
}

export interface StorefrontBlogPost {
	_id: string;
	storeId: string;
	blogId: string;
	title: string;
	content?: string;
	excerpt: string;
	pageTitle: string;
	metaDescription: string;
	urlHandle: string;
	visibility: 'visible' | 'hidden';
	author: string;
	featuredImageUrl?: string;
	createdAt: string;
	updatedAt: string;
}

interface FetchBlogDetailsApiResponse {
	success: boolean;
	data: StorefrontBlog;
}

interface FetchBlogPostsApiResponse {
	success: boolean;
	data: StorefrontBlogPost[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
	};
}

interface FetchBlogPostDetailsApiResponse {
	success: boolean;
	data: {
		blog: StorefrontBlog;
		post: StorefrontBlogPost;
	};
}

interface StorefrontBlogsContextType {
	activeBlog: StorefrontBlog | null;
	activePost: StorefrontBlogPost | null;
	posts: StorefrontBlogPost[];
	loading: boolean;
	error: string | null;
	getBlogByUrlHandle: (storeId: string, urlHandle: string) => Promise<StorefrontBlog>;
	fetchVisiblePostsByBlogUrlHandle: (
		storeId: string,
		urlHandle: string,
		params?: { page?: number; limit?: number }
	) => Promise<void>;
	getVisiblePostByUrlHandles: (
		storeId: string,
		blogHandle: string,
		postHandle: string,
		options?: { preview?: boolean }
	) => Promise<{ blog: StorefrontBlog; post: StorefrontBlogPost }>;
	clearActiveBlog: () => void;
	clearActivePost: () => void;
	clear: () => void;
}

const StorefrontBlogsContext = createContext<StorefrontBlogsContextType | undefined>(undefined);

export const StorefrontBlogsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [activeBlog, setActiveBlog] = useState<StorefrontBlog | null>(null);
	const [activePost, setActivePost] = useState<StorefrontBlogPost | null>(null);
	const [posts, setPosts] = useState<StorefrontBlogPost[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const getBlogByUrlHandle = useCallback(async (storeId: string, urlHandle: string): Promise<StorefrontBlog> => {
		try {
			setLoading(true);
			setError(null);
			const res = await axiosi.get<FetchBlogDetailsApiResponse>(
				`/storefront/blogs/store/${storeId}/url-handle/${encodeStorefrontPathHandle(urlHandle)}`
			);
			const blog = res.data?.data;
			if (!blog) {
				throw new Error('Blog not found');
			}
			setActiveBlog(blog);
			return blog;
		} catch (err: unknown) {
			const msg =
				(err as { response?: { data?: { message?: string; error?: string } }; message?: string })
					?.response?.data?.message ||
				(err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
				(err as { message?: string })?.message ||
				'Failed to fetch blog';
			setError(msg);
			setActiveBlog(null);
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	const fetchVisiblePostsByBlogUrlHandle = useCallback(
		async (
			storeId: string,
			urlHandle: string,
			params?: { page?: number; limit?: number }
		): Promise<void> => {
			try {
				setLoading(true);
				setError(null);
				const res = await axiosi.get<FetchBlogPostsApiResponse>(
					`/storefront/blogs/store/${storeId}/url-handle/${encodeStorefrontPathHandle(urlHandle)}/posts`,
					{
						params: {
							page: params?.page,
							limit: params?.limit,
						},
					}
				);
				setPosts(res.data?.data ?? []);
			} catch (err: unknown) {
				const msg =
					(err as { response?: { data?: { message?: string; error?: string } }; message?: string })
						?.response?.data?.message ||
					(err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
					(err as { message?: string })?.message ||
					'Failed to fetch blog posts';
				setError(msg);
				setPosts([]);
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	const getVisiblePostByUrlHandles = useCallback(
		async (
			storeId: string,
			blogHandle: string,
			postHandle: string,
			options?: { preview?: boolean }
		): Promise<{ blog: StorefrontBlog; post: StorefrontBlogPost }> => {
			try {
				setLoading(true);
				setError(null);
				const res = await axiosi.get<FetchBlogPostDetailsApiResponse>(
					`/storefront/blogs/store/${storeId}/url-handle/${encodeStorefrontPathHandle(blogHandle)}/posts/${encodeStorefrontPathHandle(postHandle)}`,
					{
						params: options?.preview ? { preview: '1' } : undefined,
					}
				);
				const data = res.data?.data;
				if (!data?.blog || !data?.post) {
					throw new Error('Blog post not found');
				}
				setActiveBlog(data.blog);
				setActivePost(data.post);
				return data;
			} catch (err: unknown) {
				const msg =
					(err as { response?: { data?: { message?: string; error?: string } }; message?: string })
						?.response?.data?.message ||
					(err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
					(err as { message?: string })?.message ||
					'Failed to fetch blog post';
				setError(msg);
				setActiveBlog(null);
				setActivePost(null);
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	const clearActiveBlog = useCallback(() => {
		setActiveBlog(null);
		setPosts([]);
	}, []);

	const clearActivePost = useCallback(() => {
		setActivePost(null);
	}, []);

	const clear = useCallback(() => {
		setActiveBlog(null);
		setActivePost(null);
		setPosts([]);
		setError(null);
	}, []);

	const value: StorefrontBlogsContextType = {
		activeBlog,
		activePost,
		posts,
		loading,
		error,
		getBlogByUrlHandle,
		fetchVisiblePostsByBlogUrlHandle,
		getVisiblePostByUrlHandles,
		clearActiveBlog,
		clearActivePost,
		clear,
	};

	return <StorefrontBlogsContext.Provider value={value}>{children}</StorefrontBlogsContext.Provider>;
};

export const useStorefrontBlogs = (): StorefrontBlogsContextType => {
	const ctx = useContext(StorefrontBlogsContext);
	if (!ctx) throw new Error('useStorefrontBlogs must be used within a StorefrontBlogsProvider');
	return ctx;
};
