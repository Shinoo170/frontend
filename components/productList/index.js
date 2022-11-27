import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import styles from './productList.module.css'

import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io'
import { TiStarHalf } from 'react-icons/ti'

export default function SeriesList(prop){
    const router = useRouter()
    const [ allProduct, setAllProduct ] = useState(prop.data)
    const [ listProduct, setListProduct ] = useState([])
    const [ currentPage, setCurrentPage ] = useState(0)
    const [ Max_Product_Per_Page, setMax_Product_Per_Page ] = useState(parseInt(prop.maxPerPage))
    const [ maxPage, setMaxPage ] = useState(0)
    const [ dataChange, setDataChange ] = useState(0)
    const star = [1,2,3,4,5]

    useEffect(() => {
    //     if(prop.data !== allProduct){
    //         setAllProduct(prop.data)
    //         setDataChange(current => current + 1)
    //     }
        setAllProduct(prop.data)
        setDataChange(current => current + 1)
    }, [prop.data])

    useEffect(() => {
        if(router.isReady){
            router.query.page? setCurrentPage(parseInt(router.query.page)) : setCurrentPage(1)
        }
    }, [router])

    useEffect(() => {
        setMaxPage( Math.ceil(allProduct.length/Max_Product_Per_Page))
    },[allProduct])

    useEffect(() => {
        const arr = []
        if(currentPage === 0 || currentPage > maxPage ) { setListProduct(arr); return }
        var start = currentPage*Max_Product_Per_Page - Max_Product_Per_Page
        var stop = currentPage*Max_Product_Per_Page
        if( stop > allProduct.length ){
            stop = allProduct.length
        }
        for(let i = start; i<stop; i++){
            arr.push(allProduct[i])
        }
        setListProduct(arr)
    }, [dataChange, currentPage, maxPage])

    const previousPage = () => {
        if( currentPage > 1) {
            router.query.page = currentPage - 1
            router.push({pathname: '/products', query:{ ...router.query } }, undefined,{} )
            // setCurrentPage(current => current - 1)
        }
    }
    const nextPage = () => {
        if( currentPage < maxPage){ 
            router.query.page = currentPage + 1
            router.push({pathname: '/products', query:{ ...router.query } }, undefined,{} )
            // setCurrentPage(current => current + 1)
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
            <div className={styles.listProductContainer}>
                { 
                    listProduct.map( (element, index) => {
                        const img = Array.isArray(element.img)? element.img[0]:element.img
                        return (
                            <div key={`item-${index}`} className={styles.itemContainer}>
                                <Link href={`${prop.href}${element.seriesId}/${element.url}`}>
                                    <a className={styles.item}>
                                        <div className={styles.image}>
                                            <Image src={img} alt='img' layout='fill' objectFit='cover' />
                                        </div>
                                        <div className={styles.title}>{element.title}</div>
                                        
                                        <div className={styles.bottomGroup}>
                                            <div className={styles.starGroup}>
                                                <div className={styles.tooltip}>{element.score.avg > 0? element.score.avg:'No review'}</div>
                                                { star.map(e => showStar(e,element.score.avg)) }
                                            </div>
                                            <button className={styles.btn}>{element.price} ฿</button>
                                        </div>
                                    </a>
                                </Link>
                            </div>
                        )
                    }) 
                }
            </div>
            <div className={styles.pageButtonGroup}>
                <button onClick={previousPage} className={currentPage===1? styles.disableBtn:''}><IoIosArrowBack /></button>
                <div className={styles.currentPageText}>
                    {currentPage} / {maxPage}
                </div>
                <button onClick={nextPage} className={currentPage===maxPage? styles.disableBtn:''}><IoIosArrowForward /></button>
            </div>
        </>
    )
}