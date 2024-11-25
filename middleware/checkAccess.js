const checkAccess = (acceptedRole) => {
    return (req, res, next) => {
        if (req.role === acceptedRole) {
            next()
        } else {
            res.status(401).send({ message: "Not authorized!" })
        }
    }
}


module.exports = checkAccess;