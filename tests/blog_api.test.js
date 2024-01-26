const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = helper.initialBlogs.map(b => new Blog(b))
    const promiseArray = blogObjects.map(b => b.save())

    await Promise.all(promiseArray)
})

test('returns blogs as json', async () => {
    const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('id is the unique identifier property', async () => {
    const response = await api
        .get('/api/blogs')
        .expect(200)

    response.body.forEach(blog => {
        expect(blog.id).toBeDefined
    })
})

test('creates a valid new blog', async () => {
    const newBlog = {
        title: 'what is obamas last name',
        author: 'barack obama',
        url: 'whitehouse.com',
        likes: 1913981389
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const contents = response.body.map(b => b.title)

    expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
    expect(contents).toContain('what is obamas last name')
})

test('creates a blog without likes', async () => {
    const newBlog = {
        title: 'gta iv leaks',
        author: 'anonymous',
        url: '.com',
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const contents = response.body.map(b => b.title)

    expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
    expect(contents).toContain('gta iv leaks')

    const createdBlog = response.body.find(b => b.title === 'gta iv leaks')
    expect(createdBlog.likes).toBe(0)
})

test('doesnt create blog missing title', async () => {
    const newBlog = {
        author: 'your mother',
        url: '.com',
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('doesnt create blog missing url', async () => {
    const newBlog = {
        title: 'yes',
        author: 'yues',
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('can delete a blog', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const contents = blogsAtEnd.map(b => b.title)
    expect(contents).not.toContain(blogToDelete.title)
})

test('cannot delete an invalid blog', async () => {
    const idToDelete = new mongoose.Types.ObjectId()
    await api
        .delete(`/api/blogs/${idToDelete}`)
        .expect(404)
})


afterAll(async () => {
    await mongoose.connection.close()
})