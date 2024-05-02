const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog
	.find({}).populate('user', { username: 1, name: 1 })
	response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
	const body = request.body

	if (!body.title || !body.url) {
		return response.status(400).end()
	}

	const decodedToken = jwt.verify(request.token, process.env.SECRET)
	if (!decodedToken.id) {
		return response.status(401).json({ error: 'token invalid' })
	}

	const user = request.user

	const blog = new Blog({
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes || 0,
		user: user.id
	})

	const savedBlog = await blog.save()
	user.blogs = user.blogs.concat(savedBlog._id)
	await user.save()

	await savedBlog.populate('user', { username: 1, name: 1 })

	response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
	const blog = await Blog.findById(request.params.id)
	if (!blog) {
		return response.status(404).end()
	}

	const decodedToken = jwt.verify(request.token, process.env.SECRET)
	if (!decodedToken.id) {
		return response.status(401).json({ error: 'token invalid' })
	}

	const user = request.user

	if (blog.user.toString() !== user.id) {
		return response.status(401).end()
	}

	await Blog.findByIdAndDelete(request.params.id)
	return response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
	const body = request.body

	const findBlog = await Blog.findById(request.params.id)
	if (!findBlog) {
		return response.status(404).end()
	}

	const decodedToken = jwt.verify(request.token, process.env.SECRET)
	if (!decodedToken.id) {
		return response.status(401).json({ error: 'token invalid' })
	}

	const blog = {
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes
	}

	const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true }).populate('user', { username: 1, name: 1 })
	response.status(200).json(updatedBlog)
})

blogsRouter.post('/:id/comments', async (request, response) => {
	const body = request.body

	const findBlog = await Blog.findById(request.params.id)
	if (!findBlog) {
		return response.status(404).end()
	}

	const decodedToken = jwt.verify(request.token, process.env.SECRET)
	if (!decodedToken.id) {
		return response.status(401).json({ error: 'token invalid' })
	}

	const comment =  body.comment

	const blog = await Blog.findById(request.params.id)

	blog.comments.push(comment)
	blog.save()

	return response.status(200).json(blog)
})

module.exports = blogsRouter