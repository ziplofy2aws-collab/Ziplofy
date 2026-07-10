export const BlogPostCreatePage = () => {
  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="flex h-fit w-full flex-col gap-4 rounded-md px-24 py-12">

        <div className="flex justify-between">
            <span className="font-bold">Add Blog Post</span>
            <button className="cursor-pointer rounded-lg shadow text-white bg-[#002741] py-2 px-6">Manage Blogs</button>
        </div>

        <div className="flex gap-4">``

            {/* left section */}
            <div className="flex-1 flex flex-col gap-4">
                
                {/* title and content */}
                <div className="p-4 rounded-lg shadow-md bg-white flex flex-col gap-4">
                    {/* title */}
                    <div className="flex flex-col gap-1">
                        <span className="font-semibold">Title</span>
                        <input type="text" className="rounded-2xl border border-gray-300 p-2" />
                    </div>

                    {/* content */}
                    <div className="flex flex-col gap-1">
                        <span className="font-semibold">Content</span>
                        <textarea rows={6} className="rounded-2xl border border-gray-300 p-2" />
                    </div>

                </div>

                {/* excerpt */}
                <div className="p-4 rounded-lg shadow-md bg-white">
                    <div className="flex justify-between">
                        <span className="font-semibold">Excerpt</span>
                        <span>edit</span>
                    </div>
                    <p className="text-sm mt-4">Add a summary of the post to appear on your home page or blog</p>
                </div>

                {/* search engine listing */}
                <div className="p-4 rounded-lg shadow-md bg-white gap-2 flex flex-col">
                    <div className="flex justify-between">
                        <span className="font-semibold">Search engine listing</span>
                        <span>edit</span>
                    </div>
                    <p className="text-sm">Add a title and description to see how this blog post mght appear in a search engine listing</p>
                </div>

                {/* organization */}
                <div className="p-4 rounded-lg shadow-md bg-white flex gap-4 flex-col">
                    <span className="font-semibold">Organization</span>
                    <div className="flex justify-between">
                        <div className="flex flex-col">
                            <span>Author</span>
                            <input type="text" className="rounded-2xl border border-gray-300" />
                        </div>

                        <div className="flex flex-col">
                            <span>Blog</span>
                            <input type="text" className="rounded-2xl border border-gray-300" />
                        </div>

                        <div className="flex flex-col">
                            <span>Tags</span>
                            <input type="text" className="rounded-2xl border border-gray-300" />
                        </div>
                    </div>
                </div>
            </div>

            {/* right section */}
            <div className="flex-1 flex flex-col gap-4">

                {/* visibility */}
                <div className="bg-white shadow-md rounded-lg p-4 flex flex-col gap-2">
                    <span className="font-semibold">Visibility</span>
                    <div className="flex gap-2">
                        <input type="radio"/>
                        <span>Visible</span>
                    </div>
                    <div className="flex gap-2">
                        <input type="radio" />
                        <span>Hidden</span>
                    </div>
                
                </div>
                
                {/* image section */}
                <div className="rounded-lg shadow-md bg-white p-4 px-8 gap-6 flex flex-col">
                    <span className="font-semibold">Image</span>
                    <div className="flex flex-col justify-center items-center w-full h-36 mb-5 rounded-lg border border-gray-300 bg-gray-100">
                        <button className="bg-white rounded-lg border border-gray-300 py-2 px-6">Add Image</button>
                        <span>or drop an image to upload</span>
                    </div>
                </div>

                {/* theme templates section */}
                <div className="bg-white shadow-md p-4 rounded-lg flex flex-col gap-2">
                    <span className="font-semibold">Theme template</span>
                    <span className="border border-gray-300 rounded-2xl px-4 py-1">Default blog post</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
