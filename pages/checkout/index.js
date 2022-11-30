import React, { useState, useEffect, useRef, createContext } from 'react'
import Head from 'next/head'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import Router from 'next/router'
import Header from 'components/header'
import styles from './checkout.module.css'
import Script from "react-load-script"
import { ethers } from "ethers"

import SelectAddress from 'components/checkout_components/address'
import PaymentMethod from 'components/checkout_components/payment'
import PlaceOrderSuccess from 'components/checkout_components/success'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export const checkoutContext = createContext()

export default function CheckOut(){
    const [ state, setState ] = useState('address') // address , payment , success
    const [ cart, setCart ] = useState([])
    const [ paymentMethod, setPaymentMethod ] = useState('credit_card')
    const [ priceSummary, setPriceSummary ] = useState(0)
    const [ exchange_rate, set_exchange_rate ] = useState(1)
    const [ currency, setCurrency ] = useState('บาท')
    const [ shippingFee, setShippingFee ] = useState(40)
    const [ orderResult, setOrderResult ] = useState({})
    const [ selectAddress, setSelectAddress ] = useState({})
    const [ cryptoCoinSelect, setCryptoCoinSelect ] = useState('BUSD')
    const [ crypto_exchange_rate, set_crypto_exchange_rate ] = useState(1)
    const [ isLogin, setIsLogin ] = useState(false)
    const [ priceRound, setPriceRound ] = useState(100)
    var totalPrice = 0

    useEffect(() => {
        if(localStorage.getItem('jwt')){
            setIsLogin(true)
            getCart()
        } else {
            Router.push({pathname: '/', query:{ } }, undefined,{ shallow: false } )
        }
    }, [])

    useEffect(() => {
        if(paymentMethod === 'metamask') {
            const local_exchange_rate = JSON.parse(localStorage.getItem('exchange-rate'))
            animationLoader()
            if(!local_exchange_rate || local_exchange_rate.expire < Date.now()) {
                const USD_rate_url = process.env.NEXT_PUBLIC_BACKEND + '/util/exchangeRate/USDTHB'
                axios.get(USD_rate_url)
                .then( result => {
                    if(paymentMethod === 'metamask'){
                        set_exchange_rate(result.data.rate)
                        if(cryptoCoinSelect !== 'BUSD'){
                            const url1 = 'https://api.binance.com/api/v3/ticker/price?symbol=' + cryptoCoinSelect + 'BUSD'
                            axios.get(url1)
                            .then(result => {
                                set_crypto_exchange_rate(result.data.price)
                                calPriceSummary(local_exchange_rate.rate, result.data.price)
                            }).catch(err => { 
        
                            }).finally(() => {
                                hideAnimationLoader()
                            })
                        } else {
                            calPriceSummary(local_exchange_rate.rate, 1)
                            set_crypto_exchange_rate(1)
                            set_exchange_rate(local_exchange_rate.rate)
                            hideAnimationLoader()
                        }
                    }
                    localStorage.setItem('exchange-rate', JSON.stringify(result.data) )
                }).catch(err => {
                    hideAnimationLoader()
                })
            } else {
                if(cryptoCoinSelect !== 'BUSD'){
                    const url1 = 'https://api.binance.com/api/v3/ticker/price?symbol=' + cryptoCoinSelect + 'BUSD'
                    axios.get(url1)
                    .then(result => {
                        calPriceSummary(local_exchange_rate.rate, result.data.price)
                        set_crypto_exchange_rate(result.data.price)
                        set_exchange_rate(local_exchange_rate.rate)
                    }).catch(err => { 

                    }).finally(() => {
                        hideAnimationLoader()
                    })
                } else {
                    calPriceSummary(local_exchange_rate.rate, 1)
                    set_crypto_exchange_rate(1)
                    set_exchange_rate(local_exchange_rate.rate)
                    hideAnimationLoader()
                }
            }
            setCurrency(cryptoCoinSelect)
        } else {
            calPriceSummary(1, 1)
            hideAnimationLoader()
            set_exchange_rate(1)
            set_crypto_exchange_rate(1)
            setCurrency('บาท')
        }

        var round = 100
        if(paymentMethod === 'metamask'){
            if(cryptoCoinSelect === 'ETH'){ round = 100000 }
            else if(cryptoCoinSelect === 'BTC'){ round = 100000 }
        }
        setPriceRound(round)
    }, [paymentMethod, cryptoCoinSelect])

    useEffect(() => {
        calPriceSummary(1,1)
    }, [cart])

    const calPriceSummary = (ex_rate, crypto_ex_rate) => {
        var round = 100
        if(paymentMethod === 'metamask'){
            if(cryptoCoinSelect === 'ETH'){ round = 100000 }
            else if(cryptoCoinSelect === 'BTC'){ round = 100000 }
        }
        var priceSum = 0
        var itemPrice = 0
        var itemAmount
        cart.forEach( (element, index) => {
            if( element.status === 'out' ){
                return
            }
            if( element.amount <= element.stockAmount ){
                itemAmount = element.amount
            } else {
                itemAmount = element.stockAmount
            }
            itemPrice = ( itemAmount * element.price / (ex_rate) ) / crypto_ex_rate
            priceSum += Math.round(itemPrice * round)/round
        })
        setPriceSummary(Math.round(priceSum * round)/round)
        var sf = ( 40  / ex_rate ) / crypto_ex_rate
        setShippingFee(Math.round(sf * round)/round)
    }

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
                            result.stockAmount = product[i].amount
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
            if(!selectAddress.firstName || !selectAddress.lastName || !selectAddress.tel || selectAddress.tel === '' ){
                toast.error('กรุณากรอกชื่อ-นามสกุล และ เบอร์โทร', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                })
            } else if(!selectAddress.Name){
                toast.error('กรุณาเพิ่มที่อยู่จัดส่ง', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                })
            } else {
                setState('payment')
                setPaymentMethod('credit_card')
                setCryptoCoinSelect('BUSD')
            }
        }
    }

    let OmiseCard
    const creditCardConfigure = () => {
        OmiseCard = window.OmiseCard
        OmiseCard.configure({
            publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY,
            currency: 'THB',
            frameLabel: 'PTBookShop',
            submitLabel: 'Pay NOW',
            buttonLabel: 'Pay with Omise'
        })
        OmiseCard.configure({
            defaultPaymentMethod: 'credit_card',
            otherPaymentMethods: []
        })
        OmiseCard.configureButton("#credit-card")
        OmiseCard.attach()

        OmiseCard.open({
            amount: (priceSummary + shippingFee)*100,
            onCreateTokenSuccess: (token) => {
                console.log(token)
                const jwt = localStorage.getItem('jwt')

                const url = process.env.NEXT_PUBLIC_BACKEND + '/user/placeOrder'
                axios.post( url , {
                    jwt,
                    token: token,
                    method: 'credit_card',
                    amount: priceSummary + shippingFee,
                    shippingFee,
                    exchange_rate,
                    crypto_exchange_rate,
                    cart,
                    selectAddress,
                }).then(result => {
                    console.log(result.data)
                    setOrderResult(result.data)
                    setState('success')
                    setCart(result.data.finalOrder)
                }).catch(error => {
                    console.log(error.response.data)
                })
            },
            onFormClosed: () => { },
        })
    }
    const omisePayHandle = (e) => {
        e.preventDefault()
        creditCardConfigure()
        // setState('success')
    }

    const metamaskPayHandle = async () => {
        if (!window.ethereum)  {
            toast.error('กรุณาติดตั้ง Metamask', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            })
            return
        }
        try {
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: `0x${Number(97).toString(16)}`,
                    chainName: "BSC Testnet",
                    nativeCurrency: {
                        name: "BSC Testnet",
                        symbol: "BUSD",
                        decimals: 18
                    },
                    rpcUrls: [process.env.NEXT_PUBLIC_BSC_RPC_URLS],
                    blockExplorerUrls: ["https://testnet.bscscan.com/"]
                  }
                ]
            })
            await window.ethereum.send("eth_requestAccounts")
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const abi = [
                "function name() public view returns (string)",
                "function symbol() public view returns (string)",
                "function decimals() public view returns (uint8)",
                "function totalSupply() public view returns (uint256)",
                "function transfer(address to, uint amount) returns (bool)",
                "function approve(address _spender, uint256 _value) public returns (bool success)"
            ]
            var contract_address = process.env.NEXT_PUBLIC_BUSD_CONTRACT
            if( cryptoCoinSelect === 'ETH' ){
                contract_address = process.env.NEXT_PUBLIC_ETH_CONTRACT
            } else if( cryptoCoinSelect === 'BTC') {
                contract_address = process.env.NEXT_PUBLIC_BTC_CONTRACT
            }
            let contract = new ethers.Contract(
                contract_address,
                abi,
                signer
            )
            const price = String( Math.round((priceSummary + shippingFee) *priceRound)/priceRound )
            let numberOfTokens = ethers.utils.parseUnits(price, 18)
            const tx = await contract.transfer(
                process.env.NEXT_PUBLIC_METAMASK_SHOP_ADDRESS,
                numberOfTokens
            )
            const jwt = localStorage.getItem('jwt')
            const url = process.env.NEXT_PUBLIC_BACKEND + '/user/placeOrder'
            axios.post( url , {
                jwt,
                method: 'metamask',
                amount:  Math.round((priceSummary + shippingFee) *priceRound)/priceRound ,
                shippingFee,
                exchange_rate,
                crypto_exchange_rate,
                cart,
                currency: cryptoCoinSelect,
                hash: tx.hash,
                selectAddress,
            }).then(result => {
                console.log(result.data)
                setOrderResult(result.data)
                setState('success')
                setCart(result.data.finalOrder)
            }).catch(error => {
                console.log(error.response.data.message)
            })
        } catch (error) {
            console.log(error)
        }
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
        try {
            document.getElementById('summary-container').classList.remove(styles.hide)
            var e = document.getElementsByClassName('text')
            var e1 = document.getElementsByClassName('loader-container')
            for(let i=0; i<e.length; i++){
                e[i].classList.remove(styles.hide)
            }
            for(let i=0; i<e1.length; i++){
                e1[i].classList.add(styles.hide)
            }
        } catch (error) {
            
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
            <ToastContainer />
            <div className={styles.container}>
                <div className={styles.stepperWrapper}>
                    <div className={`${styles.stepperItem} ${state==='address'? styles.active:''} ${state!=='address'? styles.completed:''}`} onClick={() => { if(state==='payment') setState('address')}}>
                        <div className={styles.stepCounter}>1</div>
                        <div className={styles.stepName}>ที่อยู่จัดส่ง</div>
                    </div>
                    <div className={`${styles.stepperItem} ${state==='payment'? styles.active:''} ${state==='success'? styles.completed:''}`}>
                        <div className={styles.stepCounter}>2</div>
                        <div className={styles.stepName}>ช่องทางชำระเงิน</div>
                    </div>
                    <div className={`${styles.stepperItem} ${state==='success'? styles.completed:''}`}>
                        <div className={styles.stepCounter}>3</div>
                        <div className={styles.stepName}>สั่งซื้อสำเร็จ</div>
                    </div>
                </div>
                <main className={styles.main}>
                    <div className={styles.checkoutSection}>
                        <div className={styles.Section}>
                            <checkoutContext.Provider value={{cart, paymentMethod, setPaymentMethod, setState, orderResult, selectAddress, setSelectAddress, cryptoCoinSelect, setCryptoCoinSelect}}>
                                { (state === 'address') && <SelectAddress /> }
                                { (state === 'payment') && <PaymentMethod /> }
                                { (state === 'success') && <PlaceOrderSuccess /> }
                            </checkoutContext.Provider>
                        </div>
                        <div className={styles.subSection}>
                            <div className={styles.label}>รายการสินค้า</div>
                            {
                                cart.map( (element, index) => {
                                    var itemAmount = element.amount
                                    if( element.amount > element.stockAmount ) itemAmount = element.stockAmount

                                    var round = 100
                                    if(paymentMethod === 'metamask'){
                                        if(cryptoCoinSelect === 'ETH'){ round = 100000 }
                                        else if(cryptoCoinSelect === 'BTC'){ round = 100000 }
                                    }
                                    var itemPrice = ( itemAmount * element.price / (exchange_rate) ) / crypto_exchange_rate
                                    var priceSum = Math.round(itemPrice*round)/round
                                    totalPrice += priceSum

                                    if(itemAmount != 0){
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
                                                        <div className={styles.title}> {element.status==='preOrder'? '[ PreOrder ]':null} {element.title} {element.bookNum}</div>
                                                        <div className={styles.category}>{element.thai_category}</div>
                                                        <div className={styles.price}>จำนวน : {itemAmount}</div>
                                                    </div>
                                                    <div className={styles.right}>
                                                        รวม : 
                                                        <span className={`${styles.priceLabel} text`}>{priceSum}</span>
                                                        {currency}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                })
                            }
                            <div className={styles.item}>
                                <div className={styles.flexRight}>
                                    <div className={styles.right}>
                                        รวมทั้งหมด : 
                                        <span className={`${styles.priceLabel} text`}>{priceSummary || totalPrice}</span>
                                        {currency}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    { (state !== 'success') &&  
                        <div className={styles.summarySection}>
                            <div id='summary-container' className={styles.summaryContainer}>
                                <div className={styles.row}>
                                    <div>ราคา</div>
                                    <div>{ priceSummary } {currency}</div>
                                </div>
                                <div className={styles.row}>
                                    <div>ค่าจัดส่ง</div>
                                    <div>{ shippingFee } {currency}</div>
                                </div>
                                <div className={styles.row}>
                                    <div>ราคารวม</div>
                                    <div>{ Math.round((priceSummary + shippingFee) *priceRound)/priceRound } {currency}</div>
                                </div>
                            </div>
                            <div className={`${styles.summaryContainer} ${styles.hide} loader-container`}>
                                <span className={styles.loader}></span>
                            </div>
                            <div className={styles.row}>
                                { (state === 'address') && <div className={styles.btn} onClick={e => changePageHandle()}>ถัดไป</div> }
                                {
                                    (state === 'payment' && paymentMethod === 'credit_card') && <div className={styles.btn} onClick={omisePayHandle}>
                                        <Script url="https://cdn.omise.co/omise.js"/>
                                        <form>
                                            <div id="credit-card">ชำระเงิน</div>
                                        </form>
                                    </div> 
                                }
                                {
                                    (state === 'payment' && paymentMethod === 'metamask') && <div className={styles.btn} onClick={metamaskPayHandle}>ชำระเงิน</div> 
                                }
                            </div>
                        </div>
                    }
                </main>
            </div>
        </div>
    )
}
