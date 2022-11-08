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
    const [ shippingFee, setShippingFee ] = useState(40)

    useEffect(() => {
        getCart()
    }, [])

    useEffect(() => {
        if(paymentMethod === 'metamask'){
            const local_exchange_rate = JSON.parse(localStorage.getItem('exchange-rate'))
            if(!local_exchange_rate || local_exchange_rate.expire < Date.now()){
                animationLoader()
                const USD_rate_url = process.env.NEXT_PUBLIC_BACKEND + '/util/exchangeRate/USDTHB'
                axios.get(USD_rate_url)
                .then( result => {
                    set_exchange_rate(result.data.rate)
                    localStorage.setItem('exchange-rate', JSON.stringify(result.data) )
                    hideAnimationLoader()
                })
            }else {
                set_exchange_rate(local_exchange_rate.rate)
            }
            setCurrency('BUSD')
        } else {
            hideAnimationLoader()
            set_exchange_rate(1)
            setCurrency('บาท')
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
        }
    }

    let OmiseCard
    const handleLoadScript = () => {
        OmiseCard = window.OmiseCard
        OmiseCard.configure({
            publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY,
            currency: 'THB',
            frameLabel: 'PTBookShop',
            submitLabel: 'Pay NOW',
            buttonLabel: 'Pay with Omise'
        })
    }
    const creditCardConfigure = () => {
        handleLoadScript()
        OmiseCard.configure({
            defaultPaymentMethod: 'credit_card',
            otherPaymentMethods: []
        })
        OmiseCard.configureButton("#credit-card")
        OmiseCard.attach()

        OmiseCard.open({
            amount: (priceSummary + 40)*100,
            onCreateTokenSuccess: (token) => {
                console.log(token)
                const jwt = localStorage.getItem('jwt')
                const url = process.env.NEXT_PUBLIC_BACKEND + '/user/placeOrder'
                axios.post( url , {
                    jwt,
                    token: token,
                    method: 'credit_card',
                    amount: priceSummary,
                    shippingFee,
                    exchange_rate,
                    method: 'credit_card',
                    cart,
                }).then(result => {
                    console.log(result.data)
                })
            },
            onFormClosed: () => { },
        })
    }
    const handleClick = (e) => {
        e.preventDefault()
        creditCardConfigure()
    }

    const animationLoader = () => {
        document.getElementById('summary-container').classList.add(styles.hide)
        var e = document.getElementsByClassName('text')
        var e1 = document.getElementsByClassName('loader-container')
        for(let i=0; i<e.length; i++){
            e[i].classList.add(styles.hide)
        }
        for(let i=0; i<e1.length; i++){
            e1[i].classList.remove(styles.hide)
        }
    }
    const hideAnimationLoader = () => {
        document.getElementById('summary-container').classList.remove(styles.hide)
        var e = document.getElementsByClassName('text')
        var e1 = document.getElementsByClassName('loader-container')
        for(let i=0; i<e.length; i++){
            e[i].classList.remove(styles.hide)
        }
        for(let i=0; i<e1.length; i++){
            e1[i].classList.add(styles.hide)
        }
    }

    return (
        <div>
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
                        <div className={styles.Section}>
                            <checkoutContext.Provider value={{cart, paymentMethod, setPaymentMethod, setState}}>
                                { (state === 'address') && <SelectAddress /> }
                                { (state === 'payment') && <PaymentMethod /> }
                                { (state === 'success') && <PlaceOrderSuccess /> }
                            </checkoutContext.Provider>
                        </div>
                        <div className={styles.subSection}>
                            <div className={styles.label}>รายการสินค้า</div>
                            {
                                cart.map( (element, index) => {
                                    var itemPrice = element.amount * element.price / exchange_rate
                                    var priceSum = Math.round(itemPrice*100)/100
                                    return (
                                        <div key={`cart-item-${index}`} className={styles.item}>
                                            <div className={styles.imageContainer}>
                                                <div className={styles.image}>
                                                    <Image src={element.img[0]} alt='img' layout='fill' objectFit='cover' />
                                                </div>
                                            </div>
                                            <div className={styles.detailGroup}>
                                                <div className={styles.details}>
                                                    {/* <Link href={`/series/${element.seriesId}/${element.url}`}>
                                                        <a className={styles.title}>{element.title} {element.bookNum}</a>
                                                    </Link> */}
                                                    <div className={styles.title}>{element.title} {element.bookNum}</div>
                                                    <div className={styles.category}>{element.category}</div>
                                                    <div className={styles.price}>จำนวน : {element.amount}</div>
                                                </div>
                                                <div className={styles.right}>
                                                    รวม : 
                                                    <span className={`${styles.priceLabel} text`}>{priceSum}</span>
                                                    {currency}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <div className={styles.summarySection}>
                        <div id='summary-container' className={styles.summaryContainer}>
                            <div className={styles.row}>
                                <div>ราคา</div>
                                <div>{ priceSummary } {currency}</div>
                            </div>
                            <div className={styles.row}>
                                <div>ค่าจัดส่ง</div>
                                <div>{ Math.round(shippingFee/exchange_rate * 100)/100 } {currency}</div>
                            </div>
                            <div className={styles.row}>
                                <div>ราคารวม</div>
                                <div>{ Math.round(((priceSummary + shippingFee)/exchange_rate) *100)/100 } {currency}</div>
                            </div>
                        </div>
                        <div className={`${styles.summaryContainer} ${styles.hide} loader-container`}>
                            <span className={styles.loader}></span>
                        </div>
                        <div className={styles.row}>
                            { (state === 'address') && <div className={styles.btn} onClick={e => changePageHandle()}>ถัดไป</div> }
                            { 
                                (state === 'payment' && paymentMethod === 'credit_card') && <div className={styles.btn} onClick={handleClick}>
                                    <Script url="https://cdn.omise.co/omise.js"/>
                                    <form>
                                        <div id="credit-card">ชำระเงิน</div>
                                    </form>
                                </div> 
                            }
                        </div>
                    </div>
                    
                </main>
            </div>
        </div>
    )
}