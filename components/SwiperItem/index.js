import { useEffect, useState, createContext, useContext } from "react"
import Link from "next/link"
import Image from 'next/image'
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Mousewheel, Pagination } from "swiper"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"

import styles from './swiperItem.module.css'

import QuickBuy from "components/quickBuy"

export const quickBuyContext = createContext()

export default function SwiperItem(prop){
    const [ quickBuyData, setQuickBuyData ] = useState({})
    const [ showQuickBuy , setShowQuickBuy ] = useState(false)

    useEffect(() => {
        if(showQuickBuy) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'scroll';
        }
    },[showQuickBuy])

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
                {
                    prop.data.map( (element, index) => {
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
                                                    <div className={styles.image}>
                                                        <Image src={element.img[0]} alt='img' layout='fill' objectFit='contain' />
                                                    </div>
                                                    <div className={styles.title}>{element.title} {element.bookNum}</div>
                                                </a>
                                            </Link>
                                            <button className={styles.btn} onClick={quickBuy}>
                                                <div className={styles.price}>{element.price} ฿</div>
                                                <div className={styles.text}>Add to cart</div>
                                            </button>
                                        </div>
                                </div>
                            </SwiperSlide>
                        )
                    })
                }
            </Swiper>
            { showQuickBuy && 
                <div id='quickAddToCart' className={styles.quickAddToCart} onClick={e => quickBuyHandle(e)}>
                    <quickBuyContext.Provider value={setShowQuickBuy}>
                        <QuickBuy data={quickBuyData}/>
                    </quickBuyContext.Provider>
                </div>
            }
        </>
    )
}