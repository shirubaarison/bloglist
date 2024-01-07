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

module.exports = {
    dummy,
    totalLikes
}