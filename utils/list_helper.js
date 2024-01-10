const _ = require('lodash')

const dummy = () => {
    return 1
}

const totalLikes = (blogs) => {
    if (blogs.length === 1) return blogs[0]['likes']
    else if (blogs.length === 0) return 0
    else {
        return blogs.reduce((sum, o) => sum + o['likes'], 0)
    }
}

const favoriteBlog = (blogs) => {
    const favorite = blogs.reduce((best, current) => {
        return current.likes > best.likes ? current : best
    }, blogs[0])

    return {
        title: favorite.title,
        author: favorite.author,
        likes: favorite.likes,
    }
}

const mostBlogs = (blogs) => {
    const groupByAuthor = _.groupBy(blogs, 'author')
    const author = _.maxBy(Object.keys(groupByAuthor, author => groupByAuthor[author].length))

    return {
        author: author,
        blogs: groupByAuthor[author].length
    }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs
}