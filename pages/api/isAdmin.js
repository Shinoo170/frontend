
export default async function handle(req, res){
    const token = req.headers['jwt'] || req.body.jwt
    if(!token){
        return res.status(403).send({ message: "No token!" })
    }
    try{
        jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
            if (err) {
                // Expire or Invalid
                console.log(err.message)
                return res.status(401).send({ message: "Unauthorized!", error: err.message })
            }
            if(decoded.role === 'admin'){
                return res.status(200).send({ message: "authorized!"})
            } else {
                return res.status(401).send({ message: "Unauthorized!"})
            }
        })
    }catch(err){
        res.status(401).send({
            message: err.message
        })
    }
}