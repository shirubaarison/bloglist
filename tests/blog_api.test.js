const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')

const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = helper.initialBlogs.map(b => new Blog(b))
    const promiseArray = blogObjects.map(b => b.save())

    await Promise.all(promiseArray)
})

describe('when there is initially some blogs saved', () => {
    test('returns blogs as json', async () => {
        const response = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)

        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')

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
})
describe('addition of a new blog', () => {
    test('succeeds with status code 201 if there are valid data', async () => {
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

    test('succeeds with status code 201 if there is no likes data', async () => {
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

    test('fails with status 400 if missing title', async () => {
        const newBlog = {
            author: 'your mother',
            url: '.com',
        }

        await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
    })

    test('fails with status 400 if missing url', async () => {
        const newBlog = {
            title: 'yes',
            author: 'yues',
        }

        await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
    })
})

describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
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

    test('fails with status code 404 if id is invalid', async () => {
        const idToDelete = new mongoose.Types.ObjectId()
        await api
            .delete(`/api/blogs/${idToDelete}`)
            .expect(404)
    })
})

describe('update of a blog', () => {
    test('succeeds updating a blog with valid data', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToUpdate = blogsAtStart[0]

        const upBlog = {
            title: 'lol',
            author: 'mario',
            url: 'n.com',
            likes: 23
        }

        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(upBlog)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')
        const contents = response.body.map(b => b.title)

        expect(response.body).toHaveLength(helper.initialBlogs.length)
        expect(contents).toContain(upBlog.title)

        const updatedBlog = response.body.find(b => b.title === upBlog.title)
        expect(updatedBlog.likes).toBe(23)
    })

    test('succeeds updating a blog with just id', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToUpdate = blogsAtStart[0]

        const upBlog = {
            title: blogToUpdate.title,
            author: blogToUpdate.author,
            url: blogToUpdate.url,
            likes: 69
        }

        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(upBlog)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')
        const contents = response.body.map(b => b.title)

        expect(response.body).toHaveLength(helper.initialBlogs.length)
        expect(contents).toContain(upBlog.title)

        const updatedBlog = response.body.find(b => b.title === upBlog.title)
        expect(updatedBlog.likes).toBe(69)
    })

    test('fails with status code 404 if id doesnt exist', async () => {
        const upBlog = {
            title: 'test',
            author: 'someone',
            url: 'lmao.com.br',
            likes: 420
        }

        const idToDelete = new mongoose.Types.ObjectId()
        await api
            .put(`/api/blogs/${idToDelete}`)
            .send(upBlog)
            .expect(404)
    })
})

describe('when there is one user on the database', () => {
    beforeAll(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('secret', 10)
        const user = new User({ username: 'root', name: 'root', passwordHash })

        await user.save()
    })

    test('return users as json', async () => {
        const response = await api
        .get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/)

        expect(response.body).toHaveLength(1)
    })

    test('creates user with valid data', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'iamcj',
            name: 'carl jonhnson',
            password: 'ImSmart'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('username must be unique', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'iamcj',
            name: 'carl jonhnson',
            password: 'ImSmart'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('fails with proper status code if missing username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            name: 'carl jonhnson',
            password: 'ImSmart'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd).toHaveLength(usersAtStart.length)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).not.toContain(newUser.username)
    })

    test('fails with proper status code if missing name', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'OGLOC',
            password: 'jeffrey',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd).toHaveLength(usersAtStart.length)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).not.toContain(newUser.username)
    })

    test('fails with proper status code if missing password', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'b1gsm0k3',
            name: 'big smoke',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd).toHaveLength(usersAtStart.length)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).not.toContain(newUser.username)
    })

    test('fails with proper status code if password length is less than 3', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'sweet',
            name: 'sweetr',
            password: '12'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd).toHaveLength(usersAtStart.length)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).not.toContain(newUser.username)
    })

})

afterAll(async () => {
    await mongoose.connection.close()
})