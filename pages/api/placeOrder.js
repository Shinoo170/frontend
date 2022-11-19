const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId
const jwt = require('jsonwebtoken')
const omise = require('omise')({
    'publicKey': process.env.OMISE_PUBLIC_KEY,
    'secretKey': process.env.OMISE_SECRET_KEY
})

const chargeOmise = async (amount, token) => {
    const charge = await omise.charges.create({
        amount: amount*100,
        currency: 'thb',
        card: token
    })
    return charge
}

export default async function handle(req, res){
    if(req.method === 'POST'){
        // JWT check
        const token = req.headers['jwt'] || req.body.jwt
        var user_id = undefined
        var email = undefined
        if(!token){
            return res.status(403).send({ message: "No token!" })
        }
        try{
            jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: "Unauthorized!", error: err.message })
                }
                user_id = decoded.user_id
                email = decoded.email
            })
        }catch(err){
            res.status(401).send({ message: err.message })
        }

        const client = new MongoClient(process.env.MONGODB_URI)
        try{
            await client.connect()
            const db = client.db(process.env.DB_NAME)
            const { amount, method, exchange_rate, shippingFee, cart } = req.body
            const date = Date.now()
            const _id = new ObjectId(user_id)
            const productIdList = cart.map(element => { return element.productId })
            const product = await db.collection('products').find({ productId: { $in: productIdList }})
                .project({
                    _id: 0,
                    seriesId: 1,
                    productId: 1,
                    status: 1,
                    price: 1,
                    amount: 1,
                }).toArray()

            var totalPriceSummary = shippingFee
            var refund = 0
            const finalOrder = cart.map((element) => {
                const productIndex = product.findIndex(e => e.productId === element.productId)
                var finalAmount = element.amount
                if(element.amount > product[productIndex].amount){
                    finalAmount = product[productIndex].amount
                    refund += Math.round( (element.amount - finalAmount) * product[productIndex].price  * 100) / 100
                }
                totalPriceSummary +=  Math.round(finalAmount * product[productIndex].price * 100) / 100
                return {
                    productId: element.productId,
                    amount: finalAmount,
                    price: element.price
                }
            })

            // If all product is out of stock
            if( (totalPriceSummary === shippingFee) && (method === 'credit_card') ){
                return res.status(400).send({
                    message: 'All product out of stock'
                })
            }

            finalOrder.forEach(async element => {
                await db.collection('products').updateOne({productId: element.productId}, {
                    $inc : { amount: -element.amount, sold: element.amount }
                })
            })

            const orderIdSeq = await db.collection('counters').findOneAndUpdate({ _id: 'orderId' },{ $inc: { seq: 1 } })

            const orderId = orderIdSeq.value.seq
            var orderDetail = {
                orderId,
                user_id,
                total: amount,
                shippingFee: shippingFee,
                exchange_rate,
                method,
                cart: finalOrder,
                created_at: date,
                date: new Date(date).toISOString(),
                paymentDetails: {},
                address: {},
                status: 'ordered',
            }
            await db.collection('orders').insertOne(orderDetail)
            await db.collection('users').updateOne({ _id }, {
                $push: { order: orderId },
                // $set : {
                //     cart: {
                //         list: [],
                //         created: data,
                //         expired: data + 7*24*60*60*1000,
                //     }
                // }
            })
            res.status(201).send({
                message: 'place order successful',
                status: 'successful',
                orderId,
            })

            if(method === 'credit_card'){
                var charge
                try {
                    // Charge
                    const token = req.body.token
                    charge = await chargeOmise(totalPriceSummary, token)
                } catch (error) {
                    finalOrder.forEach(async element => {
                        await db.collection('products').updateOne({productId: element.productId}, {
                            $inc : { amount: element.amount, sold: -element.amount }
                        })
                    })
                    await db.collection('orders').updateOne({orderId}, {
                        $set: {
                            status: 'cancel',
                            cancel_message: 'Payment refuse',
                            failure_code: 'payment_error',
                            failure_message: 'payment error',
                        }
                    })
                    return
                }
                if(charge.status !== 'successful'){
                    // ! Charge error
                    finalOrder.forEach(async element => {
                        await db.collection('products').updateOne({productId: element.productId}, {
                            $inc : { amount: element.amount ,sold: -element.amount}
                        })
                    })
                    await db.collection('orders').updateOne({orderId}, {
                        $set: {
                            status: 'cancel',
                            cancel_message: 'Payment refuse',
                            failure_code: charge.failure_code,
                            failure_message: charge.failure_message,
                        }
                    })
                    return
                } else {
                    // * Charge success
                    const paidDate = Date.now()
                    await db.collection('orders').updateOne({orderId},{
                        $set : {
                            paymentDetails: {
                                bank: charge.card.bank,
                                brand: charge.card.brand,
                                total: charge.amount/100,
                                net: charge.net/100,
                                fee: charge.fee/100,
                                fee_vat: charge.fee_vat/100,
                                omiseCardId: charge.card.id,
                                omiseChargeId: charge.id,
                                omiseTransactionId: charge.transaction,
                                created_at: paidDate,
                                date: new Date(paidDate).toISOString(),
                            },
                            status: 'paid',
                        }
                    })
                    return
                }
            }
        } catch (err) {
            console.log(err)
            res.status(500).send({message: 'This service not available', err})
        } finally {
            await client.close()
        }

    } else {
        const message = req.method + ' method not allow'
        res.status(400).send({message})
    }
}