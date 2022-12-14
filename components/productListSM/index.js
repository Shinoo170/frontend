import { useEffect, useState } from "react"
import Link from "next/link"
import Image from 'next/image'
import Router from 'next/router'
import axios from "axios"

import styles from './productListSM.module.css'

import {HiOutlineChevronDoubleRight} from 'react-icons/hi'
import { FiChevronLeft,FiChevronRight } from 'react-icons/fi'

export default function ProductListSM(prop){
    const [ listProduct, setListProduct ] = useState([])
    const [ allProduct, setAllProduct ] = useState(prop.data)
    const [ currentPage, setCurrentPage ] = useState(1)
    const [ Max_Product_Per_Page, setMax_Product_Per_Page ] = useState(10)
    const [ maxPage, setMaxPage ] = useState(0)
    const [ fullView, setFullView ] = useState(false)
    const [ upToDate, setUpToDate ] = useState(false)

    const getProductByCategory = () => {
        const url = process.env.NEXT_PUBLIC_BACKEND + '/product/productInSeries?seriesId=' + Router.query.seriesId + '&category=' + prop.category
        axios.get(url)
        .then( result => {
            setAllProduct(result.data)
        }).catch(err => { })
    }

    useEffect(() => {
        setMaxPage( Math.ceil(allProduct.length/Max_Product_Per_Page))
    }, [allProduct])

    useEffect(() => {
        if(fullView && !upToDate){
            getProductByCategory()
            setUpToDate(true)
        }
    }, [fullView])

    const toggleFullView = () => {
        setFullView( !fullView )
    }
    const changePageHandle = (event) => {
        if( ( event === -1 ) && ( currentPage > 1 )){
            setCurrentPage(currentPage-1)
        } else if( ( event === 1 ) && ( currentPage < maxPage )){
            setCurrentPage(currentPage+1)
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
    }, [currentPage, maxPage])

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.categoryTitle}> {prop.title} ( {prop.length} ?????????????????? ) </div>
                <div className={styles.seeTotal} onClick={toggleFullView}>
                    { fullView? '????????????':'???????????????????????????'}
                    <HiOutlineChevronDoubleRight />
                </div>
            </div>
            <div className={`${styles.productList} ${fullView? styles.fullView:''}`}>
                {
                    listProduct.map( (element, index) => {
                        return <div key={`item-${index}`} className={styles.itemContainer}>
                            <Link href={`${prop.url}${element.url}`}>
                                <a>
                                    <div className={styles.item}>
                                        <div className={styles.image}>
                                            { element.img[0]? <Image src={element.img[0]} alt='img' layout='fill' objectFit='cover' /> : <div className={`${styles.imgLoading} ${styles.loading}`}></div>}
                                            {/* <Image src={element.img[0]} alt='img' layout='fill' objectFit='contain' /> */}
                                        </div>
                                        <div className={styles.title}> {element.status==='preOrder'? '[ PreOrder ]':null} {element.title} {element.category !== 'other' && <>???????????? {element.bookNum}</>} </div>
                                        <button className={styles.btn}>{element.price} ???</button>
                                    </div>
                                </a>
                            </Link>
                        </div>
                    })
                }
            </div>
            <div className={`${styles.pageButtonGroup} ${fullView? '':styles.hide}`}>
                <button onClick={e => changePageHandle(-1) }><FiChevronLeft /></button>
                <div className={styles.currentPageText}>
                    {currentPage} / {maxPage}
                </div>
                <button onClick={e => changePageHandle(1) }><FiChevronRight /></button>
            </div>
        </div>
    )
}