import { useEffect, useState, createContext, useContext } from "react"
import Link from "next/link"
import Image from 'next/image'
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Mousewheel, Pagination, Navigation } from "swiper"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import "swiper/css/navigation"

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import styles from './swiperItem.module.css'

import QuickBuy from "components/quickBuy"

export const quickBuyContext = createContext()

export default function SwiperItem(props){
    const [ quickBuyData, setQuickBuyData ] = useState({})
    const [ showQuickBuy , setShowQuickBuy ] = useState(false)
    const [ fireToast, setFireToast ] = useState('')

    useEffect(() => {
        if(showQuickBuy) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }
    },[showQuickBuy])

    useEffect(() => {
        if(fireToast === 'success'){
            toast.success('เพิ่มสินค้าสำเร็จ', {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
            })
            setFireToast('')
        } else if(fireToast === 'error'){
            toast.error('เพิ่มสินค้าไม่สำเร็จ', {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
            })
            setFireToast('')
        }
    }, [fireToast])

    const quickBuyHandle = (e) => {
        if(e.target.id === 'quickAddToCart'){
            setShowQuickBuy(false)
        }
    }
    return (
        <>
            <Swiper
                slidesPerView={'auto'}
                spaceBetween={15}
                freeMode={true}
                modules={[FreeMode]}
                className={styles.productList}
            >
            <ToastContainer /> 
              
                {
                    props.data.map( (element, index) => {
                        const quickBuy = () => {
                            setQuickBuyData(element)
                            setShowQuickBuy(true)
                        }
                        return ( 
                            <SwiperSlide key={`item-novel-${index}`} className={styles.mySwiperSlide}>
                                <div className={styles.itemContainer}>
                                        <div className={styles.item}>
                                            <Link href={`/series/${element.seriesId}/${element.url}`}>
                                                <a>
                                                    <div className={styles.imageContainer}>
                                                        <div className={styles.image}>
                                                            <Image src={element.img[0]} alt='img' layout='fill' objectFit='cover' />
                                                        </div>
                                                    </div>
                                                    <div className={styles.title}>{element.title} {element.bookNum}</div>
                                                </a>
                                            </Link>
                                            {
                                                element.amount > 0 && element.status !== 'out' && 
                                                <button className={styles.btn} onClick={quickBuy}>
                                                    <div className={styles.price}>{element.price} ฿</div>
                                                    <div className={styles.text}>Add to cart</div>
                                                </button>
                                            }
                                            {
                                                ( element.amount <= 0 || element.status === 'out') && 
                                                <button className={styles.btnDisable} onClick={quickBuy}>
                                                    <div className={styles.price}>Out of stock</div>
                                                </button>
                                            }
                                        </div>
                                </div>
                            </SwiperSlide>
                        )
                    })
                }
            </Swiper>
            { showQuickBuy && 
                <div id='quickAddToCart' className={styles.quickAddToCart} onClick={e => quickBuyHandle(e)}>
                    <quickBuyContext.Provider value={[setShowQuickBuy, setFireToast]}>
                        <QuickBuy data={quickBuyData}/>
                    </quickBuyContext.Provider>
                </div>
            }
        </>
    )
}