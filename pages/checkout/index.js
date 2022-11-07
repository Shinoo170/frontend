import React, { useState, useEffect, useRef, createContext } from 'react'
import Head from 'next/head'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import Header from 'components/header'
import styles from './checkout.module.css'
import Script from "react-load-script"

import SelectAddress from 'components/checkout_components/address'
import PaymentMethod from 'components/checkout_components/payment'
import PlaceOrderSuccess from 'components/checkout_components/success'

export const checkoutContext = createContext()

export default function CheckOut(){
    const [ state, setState ] = useState('address') // address , payment , success
    const [ cart, setCart ] = useState([])
    const [ paymentMethod, setPaymentMethod ] = useState('credit_card')
    const [ priceSummary, setPriceSummary ] = useState(0)
    const [ exchange_rate, set_exchange_rate ] = useState(1)
    const [ currency, setCurrency ] = useState('บาท')

    useEffect(() => {
        getCart()
    }, [])

    useEffect(() => {
        if(paymentMethod === 'matamask'){
            const local_exchange_rate = JSON.parse(localStorage.getItem('exchange-rate'))
            if(!local_exchange_rate || local_exchange_rate.lastUpdate + 20*60*1000 < Date.now()){
                const USD_rate_url = process.env.NEXT_PUBLIC_BACKEND + '/util/exchangeRate/USDTHB'
                axios.get(USD_rate_url)
                .then( result => {
                    set_exchange_rate(result.data.rate)
                    localStorage.setItem('exchange-rate', JSON.stringify(result.data) )
                })
            }else {
                set_exchange_rate(local_exchange_rate.rate)
            }
            setCurrency('BUSD')
        } else {
            set_exchange_rate(1)
        }
    }, [paymentMethod])

    useEffect(() => {
        let priceSum = 0
        cart.forEach((element, index) => {
            priceSum += Math.round((element.amount * element.price / exchange_rate )* 100)/100
        })
        setPriceSummary(Math.round(priceSum*100)/100)
    }, [exchange_rate])

    const getCart = () => {
        const jwt = localStorage.getItem('jwt')
        if(jwt){
            const url = process.env.NEXT_PUBLIC_BACKEND + '/user/cart'
            axios.get(url, {
                headers: {
                    jwt
                }
            })
            .then( result => {
                var userCart = result.data.userCartData
                var product = result.data.product
                var priceSum = 0
                var cartList = []
                userCart.forEach((element, index) => {
                    for(let i=0; i<product.length; i++){
                        if(element.productId === product[i].productId){
                            const result = Object.assign({}, element, product[i])
                            result.amount = element.amount
                            cartList.push(result)
                            priceSum += Math.round(element.amount * product[i].price * 100)/100
                            break
                        }
                    }
                })
                setCart(cartList)
                setPriceSummary(priceSum)
            }).catch( err => {
                console.log(err)
            })
        }  
    }

    const changePageHandle = () => {
        if(state === 'address'){
            setState('payment')
        } else if(state === 'payment'){
            setState('success')
        }
    }

    return (
        <div>
            <Script
                url="https://cdn.omise.co/omise.js"
                // onLoad={handleLoadScript}
            />
            <Head>
                <title>CheckOut | PT Bookstore</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            <div className={styles.container}>
                <div className={styles.checkoutState}>
                    <div className={styles.item}>
                        <div className={styles.step}>1</div>
                        <div className={styles.title}>ที่อยู่จัดส่ง</div>
                    </div>
                    <div className={styles.item}>
                        <div className={styles.step}>2</div>
                        <div className={styles.title}>ช่องทางชำระเงิน</div>
                    </div>
                    <div className={styles.item}>
                        <div className={styles.step}>3</div>
                        <div className={styles.title}>สั้งซื้อสำเร็จ</div>
                    </div>
                </div>
                <main className={styles.main}>
                    <div className={styles.checkoutSection}>
                        <checkoutContext.Provider value={{cart, paymentMethod, setPaymentMethod, setState}}>
                            { (state === 'address') && <SelectAddress /> }
                            { (state === 'payment') && <PaymentMethod /> }
                            { (state === 'success') && <PlaceOrderSuccess /> }
                        </checkoutContext.Provider>
                    </div>
                    <div className={styles.summarySection}>
                        <div className={styles.row}>
                            <div>ราคา</div>
                            <div>{priceSummary} {currency}</div>
                        </div>
                        <div className={styles.row}>
                            <div>ค่าจัดส่ง</div>
                            <div>{ Math.round(40/exchange_rate * 100)/100 } {currency}</div>
                        </div>
                        <div className={styles.row}>
                            <div>ราคารวม</div>
                            <div>{ Math.round((priceSummary + 40/exchange_rate) *100)/100 } {currency}</div>
                        </div>
                        <div className={styles.row} onClick={e => changePageHandle()}>
                            { (state === 'address') && <div className={styles.btn}>ถัดไป</div> }
                            { (state === 'payment') && <div className={styles.btn}>ชำระเงิน</div> }
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}