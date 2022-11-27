import { useState, useEffect, useRef, useContext } from "react"
import axios from 'axios'
import Link from "next/link"
import Image from 'next/image'
import Router from 'next/router'
import styles from './quickBuy.module.css'

import { RiArrowDownSLine } from 'react-icons/ri'
import { MdShoppingCart } from 'react-icons/md'
import { CgClose } from 'react-icons/cg'
import { VscLoading } from 'react-icons/vsc'

import { quickBuyContext } from "components/SwiperItem"

export default function QuickBuy(props) {
    const [ product, setProduct ] = useState({img:[]})
    const [ showDropdown, setShowDropdown ] = useState(false)
    const [ selectAmount, setSelectAmount ] = useState(1)
    const amount = [1,2,3,4,5,6,7,8,9,10]

    const [setShowQuickBuy, setFireToast] = useContext(quickBuyContext)

    const addToCartHandle = () => {
        const jwt = localStorage.getItem('jwt')
        const url = process.env.NEXT_PUBLIC_BACKEND + '/user/cart'
        axios.put(url, {
            jwt,
            productId: product.productId,
            amount: selectAmount,
        }).then(result => {
            // localStorage.setItem('cart', JSON.stringify(result.data.currentCart) )
            setShowQuickBuy(false)
            setFireToast('success')
        }).catch(err => console.log(err.message))
    }

    const amountHandle = (e) => {
        const value = e.target.getAttribute('data-value')
        setShowDropdown(c => !c)
        setSelectAmount(value)
    }

    useEffect(() => {
        setProduct(props.data)
    }, [props])

    const close = () => {
        setShowQuickBuy(false)
    }

    const linkToPage = () => {
        setShowQuickBuy(false)
        Router.push({pathname: `/series/${product.seriesId}/${product.url}`, query:{ } }, undefined,{ shallow: false } )
    }

    return (
        <div className={styles.quickAddContainer}>
            <div className={styles.closeIcon} onClick={e => close()}><CgClose /></div>
            <div className={styles.buySection}>
                <div className={styles.imageContainer}>
                    <img src={product.img[0]}/>
                    {/* <Link href={`/series/${product.seriesId}/${product.url}`}><a className={styles.link}>ดูรายละเอียด</a></Link> */}
                    <div className={styles.link} onClick={linkToPage}>ดูรายละเอียด</div>
                </div>
                <div className={styles.subSection}>
                    <div className={styles.title}> {product.status==='preOrder'? '[ PreOrder ]':null} {product.title} {product.bookNum}</div>
                    <div className={styles.flexRow}>
                        <div className={styles.price}>
                            <div>{product.thai_category}</div>
                            <div className={styles.priceLabel}>{product.price} บาท</div>
                            <div className={styles.dummy}></div>
                        </div>
                        <div className={styles.amount}>
                            <div className={styles.label}>จำนวน</div>
                            <div className={`${styles.dropdownGroup} ${showDropdown? styles.showDropdown:''}`}>
                                <div className={styles.dropdownSelection} onClick={e => setShowDropdown(c => !c)}><div id='amount'>{selectAmount}</div> <RiArrowDownSLine/></div>
                                <div className={styles.dropdownList} onClick={e => amountHandle(e)}>
                                    { amount.map((element, index) => <div key={`quick-amount-${index}`} className={styles.dropdownItem} data-value={element}>{element}</div> ) }
                                </div>
                            </div>
                            <div className={styles.dummy}>{(product.amount <= 0 || product.status === 'out') && <>* สินค้าหมด</>}</div>
                        </div>
                    </div>
                    { product.amount > 0 && product.status !== 'out' && 
                        <div className={styles.btn} onClick={addToCartHandle}> <div className={styles.cartIcon}><MdShoppingCart/></div> Add to cart</div>
                    }
                    { (product.amount <= 0 || product.status === 'out') && 
                        <div className={`${styles.btn} ${styles.btnDisable}`}> <div className={styles.cartIcon}><MdShoppingCart/></div>Out of stock</div>
                    }
                </div>
            </div>
        </div>
    )
}