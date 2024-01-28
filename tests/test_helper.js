const Blog = require('../models/blog')
const User = require('../models/user')

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

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(b => b.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})

    return users.map(u => u.toJSON())
}

module.exports = {
    initialBlogs, blogsInDb, usersInDb
}