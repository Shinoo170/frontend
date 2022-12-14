import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import axios from 'axios'
import Router from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import Header from 'components/header'
import styles from './cart.module.css'
import Swal from 'sweetalert2'

import { RiArrowDownSLine } from 'react-icons/ri'
import { CgClose } from 'react-icons/cg'

export default function Cart(){
    const [ cart, setCart ] = useState([])
    const [ product, setProduct ] = useState([])
    const [ priceSummary, setPriceSummary ] = useState(0)
    const [ currency, setCurrency ] = useState('บาท')
    const [ exchange_rate, set_exchange_rate] = useState(1)
    const [ alert, setAlert ] = useState(false) 
    const amount = [1,2,3,4,5,6,7,8,9,10]
    const url = process.env.NEXT_PUBLIC_BACKEND + '/user/cart'

    const getCart = () => {
        if(localStorage.getItem('jwt')){
            const jwt = localStorage.getItem('jwt')
            axios.get(url, {
                headers: {
                    jwt
                }
            })
            .then( result => {
                var userCart = result.data.userCartData
                var product = result.data.product
                var cartList = []
                userCart.forEach((element, index) => {
                    for(let i=0; i<product.length; i++){
                        if(element.productId === product[i].productId){
                            const result = Object.assign({}, element, product[i])
                            result.amount = element.amount
                            result.stockAmount = product[i].amount
                            cartList.push(result)
                        }
                    }
                })
                setCart(cartList)
                setProduct(product)
            }).catch( err => {
                console.log(err)
            })
        }
    }

    const editCartHandle = (productId, amount) => {
        const jwt = localStorage.getItem('jwt')
        axios.put(url, {
            jwt,
            productId,
            amount,
        }).then(result => {
            var userCart = result.data.currentCart.list
            var cartList = []
            userCart.forEach((element, index) => {
                for(let i=0; i<product.length; i++){
                    if(element.productId === product[i].productId){
                        const result = Object.assign({}, element, product[i])
                        result.amount = element.amount
                        result.stockAmount = product[i].amount
                        cartList.push(result)
                    }
                }
            })
            setCart(cartList)
        }).catch(err => console.log(err.message))
    }

    const removeItemInCart = (productId) => {
        const jwt = localStorage.getItem('jwt')
        axios.patch(url, {
            jwt,
            productId
        }).then(result => {
            getCart()
        }).catch(err => console.log(err.message))
    }

    useEffect(()=> {
        getCart()
    },[])

    useEffect(() => {
        calPriceSummary()
    },[cart])

    useEffect(() => {
        // update exchange rate every 3 hours
        if(currency === 'BUSD' ){
            const local_exchange_rate = JSON.parse(localStorage.getItem('exchange-rate'))
            if(!local_exchange_rate || local_exchange_rate.expire < Date.now()){
                setPriceSummary(e => 'Loading')
                const USD_rate_url = process.env.NEXT_PUBLIC_BACKEND + '/util/exchangeRate/USDTHB'
                axios.get(USD_rate_url)
                .then( result => {
                    if(currency === 'BUSD'){
                        set_exchange_rate(result.data.rate)
                    }
                    localStorage.setItem('exchange-rate', JSON.stringify(result.data) )
                })
            } else {
                set_exchange_rate(local_exchange_rate.rate)
                calPriceSummary()
            }
        } else {
            set_exchange_rate(1)
            calPriceSummary()
        }
    }, [currency])

    useEffect(()=> {
        calPriceSummary()
    }, [exchange_rate])

    const calPriceSummary = () => {
        var priceSum = 0
        var itemPrice = 0
        setAlert(false)
        cart.forEach( (element, index) => {
            var itemAmount = element.amount
            if(element.status === 'out' || element.status === 'delete'){
                setAlert(true)
                return
            }
            if( element.amount > element.stockAmount ){
                setAlert(true)
                // itemAmount = element.stockAmount
            }
            itemPrice = itemAmount * element.price / exchange_rate
            priceSum += Math.round(itemPrice*100)/100
        })
        setPriceSummary(Math.round(priceSum*100)/100)
    }

    const changeCurrencyHandle = (c) => {
        if(currency !== c){
            setCurrency(c)
        }
    }

    const checkoutHandle = () => {
        if(alert){
            Swal.fire({
                icon: 'error',
                title: 'ไม่สามารถสั่งซื้อสินค้าได้',
                text: 'คุณเพิ่มสินค้าเกินจำนวนที่กำหนด',
                confirmButtonColor: '#d33',
              })
        } else {
            Router.push({pathname: '/checkout', query:{} }, undefined,{ shallow: true } )
        }
    }
    
    return (
        <div>
            <Head>
                <title>Cart | PT Bookstore</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            <div className={styles.container}>
                <main className={styles.main}>
                    <div className={styles.cartSection}>
                        <div className={styles.label}>รายการสินค้า</div>
                        <hr />
                        <div className={styles.list}>
                            {
                                cart.map( (element, index) => {
                                    var itemAmount = element.amount
                                    // if( element.amount > element.stockAmount ) itemAmount = element.stockAmount
                                    var itemPrice = itemAmount * element.price / exchange_rate
                                    var priceSum = Math.round(itemPrice*100)/100
                                    const mouseUpHandle = (e) => {
                                        const container = document.getElementById(`cart-item-dropdown-${index}`)
                                        if (!container.contains(e.target)) {
                                            container.classList.remove(styles.showDropdown)
                                            document.removeEventListener('mouseup', mouseUpHandle)
                                        }
                                    }
                                    const showDropdownHandle = () => {
                                        const container = document.getElementById(`cart-item-dropdown-${index}`)
                                        if(container.classList.length === 1){
                                            container.classList.add(styles.showDropdown)
                                            document.addEventListener('mouseup', mouseUpHandle)
                                        } else {
                                            container.classList.remove(styles.showDropdown)
                                        }
                                    }
                                    const changeAmountHandle = (e) => {
                                        const container = document.getElementById(`cart-item-dropdown-${index}`)
                                        container.classList.remove(styles.showDropdown)
                                        document.removeEventListener('mouseup', mouseUpHandle)
                                        var newValue = e.target.getAttribute('data-value')
                                        // if(newValue <= element.stockAmount)
                                        if(newValue !== null){
                                            editCartHandle(element.productId, newValue)
                                        }
                                        
                                    }
                                    return (
                                        <div key={`cart-item-${index}`} className={styles.item}>
                                            <div className={styles.imageContainer}>
                                                <div className={styles.image}>
                                                    <Image src={element.img[0]} alt='img' layout='fill' objectFit='cover' />
                                                </div>
                                            </div>
                                            <div className={styles.detailGroup}>
                                                <div className={styles.details}>
                                                    <Link href={`/series/${element.seriesId}/${element.url}`}>
                                                        <a className={styles.title}> {element.status==='preOrder'? '[ PreOrder ]':null} {element.title} {element.bookNum}</a>
                                                    </Link>
                                                    <div className={styles.category}>{element.thai_category}</div>
                                                    <div className={styles.price}>{priceSum} {currency}</div>
                                                    { element.status !== 'out' && element.amount > element.stockAmount && element.stockAmount > 0 && 
                                                        <div className={styles.warningLabel}>! มีสินค้าเพียง {element.stockAmount} ชิ้นในคลัง</div>
                                                    }
                                                    { (element.status === 'out' || element.stockAmount === 0) && 
                                                        <div className={styles.warningRedLabel}>! สินค้าหมด</div>
                                                    }
                                                    { (element.status === 'delete' ) && 
                                                        <div className={styles.warningRedLabel}>! สินค้าถูกนำออกจากร้านค้าแล้ว</div>
                                                    }
                                                </div>
                                                <div className={styles.right}>
                                                    <div id={`cart-item-dropdown-${index}`} className={`${styles.dropdownGroup}`}>
                                                        <div className={styles.dropdownSelection} onClick={e => showDropdownHandle(e)}><div id={`select-amount-${index}`}>{cart[index].amount}</div> <RiArrowDownSLine/></div>
                                                        <div className={styles.dropdownList} onClick={e => changeAmountHandle(e)}>
                                                            {/* { amount.map((e, index) => <div key={`amount-${index}`} className={element.stockAmount > index? styles.dropdownItem:styles.dropdownItemDisable} data-value={e}>{e}</div> ) } */}
                                                            { amount.map((e, index) => <div key={`amount-${index}`} className={styles.dropdownItem} data-value={e}>{e}</div> ) }
                                                        </div>
                                                    </div>
                                                    <div className={styles.remove} onClick={e => removeItemInCart(element.productId)}><CgClose /></div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <div className={styles.checkOutSection}>
                        <div className={styles.subSection}>
                            <div>แสดงราคา</div>
                            <div className={styles.optionGroup}>
                                <div className={`${styles.option} ${currency==='บาท'? styles.select:''}`} onClick={e => changeCurrencyHandle('บาท')}>
                                    บาท
                                </div>
                                <div className={`${styles.option} ${currency==='BUSD'? styles.select:''}`} onClick={e => changeCurrencyHandle('BUSD')}>
                                    BUSD
                                </div>
                            </div>
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
                            <div className={styles.row}>
                                {/* <Link href='/checkout'><div className={styles.btn} >Checkout</div></Link> */}
                                <div className={styles.btn} onClick={checkoutHandle}>Checkout</div>
                            </div>
                        </div>
                    </div>
                </main>
                <footer className={styles.footer}>

                </footer>
            </div>
        </div>
    )
}