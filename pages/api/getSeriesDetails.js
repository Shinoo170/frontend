import axios from 'axios'

// ! ios header issus
export default async function handle(req, res){
    
    await axios.get(req.body.url).then( (result) => {
        res.status(200).send(result.data)
    }).catch( (err) => {
        res.status(400).send({ message: 'error', error: err.message })
    })
}