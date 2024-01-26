const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

const initialBlogs = [
    {
        title: 'testing',
        author: 'shirubaarison',
        url: 'idk',
        likes: 0
    },
    {
        title: 'testing2',
        author: 'shirubaarison',
        url: 'idk2',
        likes: 0
    }
]

beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = initialBlogs.map(b => new Blog(b))
    const promiseArray = blogObjects.map(b => b.save())

    await Promise.all(promiseArray)
})

test('returns blogs as json', async () => {
    const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(initialBlogs.length)
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

    expect(response.body).toHaveLength(initialBlogs.length + 1)
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

    expect(response.body).toHaveLength(initialBlogs.length + 1)
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

afterAll(async () => {
    await mongoose.connection.close()
})