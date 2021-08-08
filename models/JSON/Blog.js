const fetch = require('node-fetch');
const DateTime = require('../../helpers/DateTime');

var slugify = require('slugify')

const Blog = {

	getBlogPostsByPageLimit: async (page, limit) => {
		const response = await fetch(`${process.env.DATABASE_JSON_URL}/blog/?_page=${page}&_limit=${limit}`, {
  			"method": "GET"
		});

		const json = await response.json();

		if(json.length > 0) return json;

		return null;
	},

	getAllBlogPosts: async () => {
		const response = await fetch(`${process.env.DATABASE_JSON_URL}/blog`, {
  			"method": "GET"
		});

		const json = await response.json();

		if(json.length > 0) return json;

		return null;
	},

	getTotalBlogPosts: async () => {
		const response = await fetch(`${process.env.DATABASE_JSON_URL}/blog`, {
  			"method": "GET"
		});

		const json = await response.json();

		if(json.length > 0) return json.length;

		return null;
	},

	getBlogPostBySlug: async (slug) => {
		const response = await fetch(`${process.env.DATABASE_JSON_URL}/blog?slug=${slug}`, {
  			"method": "GET"
		});
		const json = await response.json();

		if(json.length > 0) return json[0];

		return null;
	},

	getBlogPostsCommentsByBlogPostID: async(blogPostID) => {
		console.log('recebeu id: ' + blogPostID)
		const response = await fetch(`${process.env.DATABASE_JSON_URL}/blog_comments?blog_post_id=${blogPostID}?_sort=created_at&_order=ASC`, {
  			"method": "GET"
		});

		const json = await response.json();

		if(json.length > 0) return json;

		return null;
	},

	createBlogComment: async (body) => {
		console.log('recebeu body: ', body)
		const response = await fetch(`${process.env.DATABASE_JSON_URL}/blog_comments`, {
		    method: 'POST',
		    body:    JSON.stringify(body),
		    headers: { 'Content-Type': 'application/json' },
		})

		const json = await response.json();

		if(json) return true;

		return false;
	},

	createBlogPost: async (blog_title, blog_category, blog_body) => {
		const slug = slugify(blog_title)
		console.log('slug é: ' + slug)

		const response = await fetch(`${process.env.DATABASE_JSON_URL}/blog`, {
		    method: 'POST',
		    body: JSON.stringify({
		    	title: blog_title,
		    	slug: slug,
		    	category: blog_category,
		    	body: blog_body,
		    	created_at: DateTime.getNow(),
		    	updated_at: DateTime.getNow()
		    }),
		    headers: { 'Content-Type': 'application/json' },
		});

		const blogPostCreated = await response.json();
		console.log(blogPostCreated);

		return blogPostCreated;
	},

	updateBlogPost: async (blog_id, blog_title, blog_category, blog_body) => {

		const slug = slugify(blog_title)

		const response = await fetch(`${process.env.DATABASE_JSON_URL}/blog/${blog_id}`, {
		    method: 'PATCH',
		    body: JSON.stringify({
		    	title: blog_title,
		    	slug: slug,
		    	category: blog_category,
		    	body: blog_body,
		    	updated_at: DateTime.getNow()
		    }),
		    headers: { 'Content-Type': 'application/json' },
		});

		const blogPostUpdated = await response.json();
		console.log(blogPostUpdated);

		return blogPostUpdated;
	}
};

module.exports = Blog;