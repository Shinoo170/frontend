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

import { TiStarHalf } from 'react-icons/ti'

import QuickBuy from "components/quickBuy"

export const quickBuyContext = createContext()

export default function SwiperItem(props){
    const [ quickBuyData, setQuickBuyData ] = useState({})
    const [ showQuickBuy , setShowQuickBuy ] = useState(false)
    const [ fireToast, setFireToast ] = useState('')
    const star = [1,2,3,4,5]

    useEffect(() => {
        if(showQuickBuy) {
            document.body.style.overflowY = 'hidden'
        } else {
            document.body.style.overflowY = 'auto'
            document.body.style.overflowX = 'hidden'
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

    const showStar = (score, avg) => {
        const halfScore = score-0.5
        const selfScore = Math.floor(avg*2)/2
        return (
            <div className={styles.fullStarGroup} key={`star-${score}`}>
                <TiStarHalf className={`${styles.starHalfLeft} ${selfScore >= halfScore? styles.starActive:''}`}/>
                <TiStarHalf className={`${styles.starHalfRight} ${selfScore >= score? styles.starActive:''} `}/>
                <div className={styles.labelGroup}>
                    <div className={styles.leftLabel}></div>
                    <div className={styles.rightLabel} ></div>
                </div>
            </div>
        )
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
                                                            {element.img[0]? <Image src={element.img[0]} alt='img' layout='fill' objectFit='cover' />: <div className={`${styles.imgLoading} ${styles.loading}`}></div>}
                                                            {/* <Image src={element.img[0]} alt='img' layout='fill' objectFit='cover' /> */}
                                                        </div>
                                                    </div>
                                                    <div className={styles.title}> {element.status==='preOrder'? '[ PreOrder ]':null} {element.title} {element.category !== 'other' && <>เล่ม {element.bookNum}</>}</div>
                                                </a>
                                            </Link>
                                            <div className={styles.bottomGroup}>
                                                <div className={styles.starGroup}>
                                                    <div className={styles.tooltip}>{element.score.avg > 0? element.score.avg:'No review'}</div>
                                                    { star.map(e => showStar(e,element.score.avg)) }
                                                </div>
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