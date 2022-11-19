const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId
const jwt = require('jsonwebtoken')

export default async function handle(req, res){
    const token = req.headers['jwt'] || req.body.jwt
    if(!token){
        return res.status(403).send({ message: "No token!" })
    }
    try{
        jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).send({ message: "Unauthorized!", error: err.message })
            }
            return res.status(200).send({role: decoded.role})
        })
    }catch(err){
        res.status(401).send({ message: err.message })
    }
}