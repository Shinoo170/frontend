import { useEffect, useState, createContext } from "react"
import { useRouter } from 'next/router'
import Link from "next/link"
import Image from 'next/image'
import Router from 'next/router'

import styles from './productListMD.module.css'

import { RiArrowLeftSLine } from 'react-icons/ri'
import { FiChevronLeft,FiChevronRight } from 'react-icons/fi'
import { TiStarHalf } from 'react-icons/ti'

import QuickBuy from "./quickBuy"

export const quickBuyContext = createContext()

export default function ProductListMD(prop){
    const router = useRouter()
    const [ listProduct, setListProduct ] = useState([])
    const [ allProduct, setAllProduct ] = useState(prop.data)
    const [ currentPage, setCurrentPage ] = useState(1)
    const [ Max_Product_Per_Page, setMax_Product_Per_Page ] = useState(12)
    const [ maxPage, setMaxPage ] = useState(0)
    const [ quickBuyData, setQuickBuyData ] = useState({})
    const [ showQuickBuy , setShowQuickBuy ] = useState(false)
    const star = [1,2,3,4,5]

    useEffect(() => {
        if(showQuickBuy) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'hidden auto';
        }
    },[showQuickBuy])

    const quickBuyHandle = (e) => {
        if(e.target.id === 'quickAddToCart'){
            setShowQuickBuy(false)
        }
    }

    const goBack = () => {
        const target = '/series/' + router.query.seriesId
        router.push({pathname: target, query:{} }, undefined,{ shallow: true })
    }
    const changePageHandle = (event) => {
        if( ( event === -1 ) && ( currentPage > 1 )){
            setCurrentPage(current => current-1)
        } else if( ( event === 1 ) && ( currentPage < maxPage )){
            setCurrentPage(current => current+1)
        }
    }

    // [ call max page ]
    useEffect( () => {
        setMaxPage( Math.ceil(allProduct.length/Max_Product_Per_Page))
    },[])

    // [ show product when page change ]
    useEffect( ()=> {
        const arr = []
        var start = currentPage*Max_Product_Per_Page - Max_Product_Per_Page
        var stop = currentPage*Max_Product_Per_Page
        if( stop > allProduct.length ){
            stop = allProduct.length
        }
        for(let i = start; i<stop; i++){
            arr.push(allProduct[i])
        }
        setListProduct(arr)
    }, [currentPage])

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
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.categoryTitle}> <span className={styles.label}>{prop.title}</span> ( {prop.data.length} รายการ ) </div>
                <div className={styles.goBack} onClick={goBack}>
                    ย้อนกลับ <RiArrowLeftSLine />
                </div>
            </div>
            <div className={styles.productList}>
                {
                    listProduct.map( (element, index) => {
                        const quickBuy = (e) => {
                            e.preventDefault()
                            setQuickBuyData(element)
                            setShowQuickBuy(true)
                        }
                        return <div key={`item-${index}`} className={styles.itemContainer}>
                            <Link href={`/series/${element.seriesId}/${element.url}`}>
                                <div className={styles.item}>
                                    <div className={styles.image}>
                                        <Image src={element.img[0]} alt='img' layout='fill' objectFit='cover' />
                                    </div>
                                    <div className={styles.title}>{element.title} {element.category !== 'other' && <>เล่ม {element.bookNum}</>}</div>
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
                            </Link>
                        </div>
                    })
                }
            </div>
            {
                maxPage > 1 && <div className={`${styles.pageButtonGroup}`}>
                    <button className={currentPage===1? styles.disable:''}onClick={e => changePageHandle(-1) }><FiChevronLeft /></button>
                    <div className={styles.currentPageText}>
                        {currentPage} / {maxPage}
                    </div>
                    <button className={currentPage===maxPage? styles.disable:''} onClick={e => changePageHandle(1) }><FiChevronRight /></button>
                </div>
            }
            { showQuickBuy && 
                <div id='quickAddToCart' className={styles.quickAddToCart} onClick={e => quickBuyHandle(e)}>
                    <quickBuyContext.Provider value={setShowQuickBuy}>
                        <QuickBuy data={quickBuyData}/>
                    </quickBuyContext.Provider>
                </div>
            }
        </div>
    )
}