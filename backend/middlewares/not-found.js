// to handle domy end points (not founded requests)
const notFoundMiddleware = (req , res) => {
    res.status(404).send("Route does not exist")
}

module.exports = notFoundMiddleware