import { useEffect, useState } from "react"
import Link from "next/link"
import Image from 'next/image'
import Router from 'next/router'

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

    const toggleFullView = () => {
        setFullView( !fullView)
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
    }, [currentPage])

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.categoryTitle}> {prop.title} ( {prop.data.length} รายการ ) </div>
                <div className={styles.seeTotal} onClick={toggleFullView}>
                    { fullView? 'ซ่อน':'ดูทั้งหมด'}
                    <HiOutlineChevronDoubleRight />
                </div>
            </div>
            <div className={`${styles.productList} ${fullView? styles.fullView:''}`}>
                {
                    listProduct.map( (element, index) => {
                        return <div key={`item-${index}`} className={styles.itemContainer}>
                            <Link href={`${prop.url}${element.url}`}>
                                <div className={styles.item}>
                                    <div className={styles.image}>
                                        <Image src={element.img[0]} alt='img' layout='fill' objectFit='contain' />
                                    </div>
                                    <div className={styles.title}>{element.title} เล่ม {element.bookNum}</div>
                                    <button className={styles.btn}>{element.price} $</button>
                                </div>
                            </Link>
                        </div>
                    })
                }

                
            </div>
            <div className={`${styles.pageButtonGroup} ${fullView? '':styles.hide}`}>
                <button onClick={e => changePageHandle(-1) }><FiChevronLeft /></button>
                <div className={styles.currentPageText}>
                    {currentPage}
                </div>
                <button onClick={e => changePageHandle(1) }><FiChevronRight /></button>
            </div>
        </div>
    )
}