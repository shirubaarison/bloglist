const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')

const api = supertest(app)

beforeAll(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({ username: 'root', name: 'root', passwordHash })

    await user.save()
})

describe('when there is one user on the database', () => {
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

describe('login', () => {
    test('login succeeds with valid data', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'newUser',
            name: 'new user',
            password: '121202'
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

        const loginUser = {
            username: newUser.username,
            password: newUser.password
        }

        await api
            .post('/api/login')
            .send(loginUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})