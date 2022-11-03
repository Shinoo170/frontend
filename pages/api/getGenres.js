import axios from 'axios'

// ! ios header issus
export default async function handle(req, res){
    const url = process.env.NEXT_PUBLIC_BACKEND  + '/product/genres'
    await axios.get(url).then( (result) => {
        res.status(200).send(result.data)
    }).catch( (err) => {
        res.status(400).send({ message: 'error', error: err.message })
    })
}