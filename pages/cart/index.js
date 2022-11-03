import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import Header from 'components/header'
import styles from './cart.module.css'

import { RiArrowDownSLine } from 'react-icons/ri'
import { CgClose } from 'react-icons/cg'

export default function Cart(){
    const [ list, setList ] = useState([])
    const [ cart, steCart ] = useState([])
    const amount = [1,2,3,4,5,6,7,8,9,10]

    const getCart = () => {
        const jwt = localStorage.getItem('jwt')
        const url = process.env.NEXT_PUBLIC_BACKEND + '/user/cart'
        axios.get(url, {
            headers: {
                jwt
            }
        })
        .then( result => {
            console.log(result.data)
            setList(result.data.product)
            steCart(result.data.userCartData)
        }).catch( err => {
            console.log(err)
        })
    }

    useEffect(()=> {
        getCart()
        console.log('Is list & cart a array?')
        console.log(Array.isArray(list))
        console.log(Array.isArray(cart))
    },[])

    useEffect(() => {
        console.log(list)
        console.log(cart)
    },[list])

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
                                list.map( (element, index) => {
                                    const showDropdownHandle = () => {
                                        const ee = document.getElementById(`cart-item-dropdown-${index}`)
                                        if(ee.classList.length === 1){
                                            ee.classList.add(styles.showDropdown)
                                        } else {
                                            ee.classList.remove(styles.showDropdown)
                                        }
                                    }
                                    const amountHandle = () => {

                                    }

                                    return (
                                        <div key={`cart-item-${index}`} className={styles.item}>
                                            <div className={styles.image}>
                                                <Image src={element.img[0]} alt='img' layout='fill' objectFit='contain' />
                                            </div>
                                            <div className={styles.details}>
                                                <Link href={`/series/${element.seriesId}/${element.url}`}>
                                                    <a><div className={styles.title}>{element.title} {element.bookNum}</div></a>
                                                </Link>
                                                <div className={styles.category}>{element.category}</div>
                                                <div className={styles.price}>{element.price} บาท</div>
                                            </div>
                                            <div className={styles.right}>
                                                <div id={`cart-item-dropdown-${index}`} className={`${styles.dropdownGroup}`}>
                                                    <div className={styles.dropdownSelection} onClick={e => showDropdownHandle(e)}><div id={`select-amount-${index}`}>{cart[index].amount}</div> <RiArrowDownSLine/></div>
                                                    <div className={styles.dropdownList} onClick={e => amountHandle(e)}>
                                                        { amount.map((element, index) => <div key={`amount-${index}`} className={styles.dropdownItem} data-value={element}>{element}</div> ) }
                                                    </div>
                                                </div>
                                                <div className={styles.remove}><CgClose /></div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                            
                        </div>
                    </div>
                    <div className={styles.checkOutSection}>
                        <div>ราคา</div>
                        <div>ค่าจัดส่ง</div>
                        <div>ราคารวม</div>
                        <div>Checkout</div>
                    </div>
                </main>
                <footer className={styles.footer}>

                </footer>
            </div>
        </div>
    )
}