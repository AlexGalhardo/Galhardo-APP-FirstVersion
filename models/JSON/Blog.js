const fs = require('fs')
const fetch = require('node-fetch');
const DateTime = require('../../helpers/DateTime');

var slugify = require('slugify')

const { JSON_DATABASE_FILE, database } = require('../../config/global');

class Blog {

	static save(database, error_message){
		for(let i = 0; i < database.blog.length; i++){
			database.blog[i].id = i+1
		}

	    fs.writeFileSync(JSON_DATABASE_FILE, JSON.stringify(database, null, 2), error => {
	      if (error) {
	        console.log(`Error writing file in ${JSON_DATABASE_FILE}: `, error);
	        return false
	      }
	    });
	    return true
	}

	static async getBlogPostsByPageLimit(page, limit) {
		let totalBlogPosts = database.blog.length
		let totalPages = parseInt(totalBlogPosts/limit)
		let totalBlogPostsLastPage = (totalBlogPosts%limit)

		let offset = (page * limit) - limit;
		let getUntil = page * limit

		if(page == totalPages+1){
			getUntil = offset + totalBlogPostsLastPage
		}

		let blogPosts = []
		try {
      		for(offset; offset < getUntil; offset++){
        		blogPosts.push(database.blog[offset])
      		}
      		return blogPosts
    	} catch (error) {
      		return console.log("ERROR getBlogPostsByPageLimit: ", error);
    	}
	}

	static getAllBlogPosts() {
		try {
	      return database.blog
	    } catch (error) {
	      return console.log("ERROR getUsers: ", error);
	    };
	}

	static async getTotalBlogPosts () {
		try {
      		return database.blog.length
    	} catch (error) {
      		return console.log("ERROR getTotalBlogPosts: ", error);
    	}
	}

	static getBlogPostBySlug (slug) {
		try {
      		for(let i=0; i < database.blog.length; i++){
        		if(database.blog[i].slug === slug){
        			return database.blog[i]
        		}
      		}
      		return null
    	} catch (error) {
      		return console.log("ERROR getBlogPostBySlug: ", error);
    	}
	}

	static createBlogComment (slug, commentObject) {
		try {
      		for(let i=0; i < database.blog.length; i++){
        		if(database.blog[i].slug === slug){
        			commentObject.comment_id = database.blog[i].comments.length+1
        			database.blog[i].comments.push(commentObject)
        			Blog.save(database, 'Error createBlogComment: ')
        			return database.blog[i]
        		}
      		}
      		return null
    	} catch (error) {
      		return console.log("ERROR createBlogComment: ", error);
    	}
	}

	static deleteCommentByCommentID(slug, comment_id) {
		try {
      		
      		for(let i=0; i < database.blog.length; i++){
        		
        		if(database.blog[i].slug === slug){
        			
        			for(let index=0; index < database.blog[i].comments.length; index++){

        				if(database.blog[i].comments[index].comment_id == comment_id){
        					
        					if(database.blog[i].comments[index].user_id == SESSION_USER.id){
        						
        						database.blog[i].comments.splice(index, 1)
        						Blog.save(database, 'Error deleteCommentByCommentID: ')
        						return database.blog[i]	
        					}
        				}
        			}
        		}
      		}
      		return null
    	} catch (error) {
      		return console.log("ERROR deleteCommentByCommentID: ", error);
    	}
	}

	static createBlogPost (blogPostObject) {
		const slug = slugify(blogPostObject.title)

		try {
			blogPostObject.id = database.blog.length + 1
			database.blog.push(blogPostObject)
			Blog.save(database, 'Error createBlogPost: ')
			return blogPostObject
    	} catch (error) {
      		return console.log("ERROR createBlogComment: ", error);
    	}
	}

	static updateBlogPost (blogPostObject) {

		const slug = slugify(blogPostObject.title)

		try {
			for(let i = 0; i < databse.blog.length; i++){
				if(database.blog[i].id === blogPostObject.id){
					database.blog.splice(i, 1)
					database.blog.push(blogPostObject)
					Blog.save(database, 'Error updateBlogPost: ')
					return blogPostObject
				}
			}
			return null
    	} catch (error) {
      		return console.log("ERROR createBlogComment: ", error);
    	}
	}
}

module.exports = Blog;