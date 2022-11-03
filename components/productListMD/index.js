import { useEffect, useState } from "react"
import { useRouter } from 'next/router'
import Link from "next/link"
import Image from 'next/image'
import Router from 'next/router'

import styles from './productListMD.module.css'

import { RiArrowLeftSLine } from 'react-icons/ri'
import { FiChevronLeft,FiChevronRight } from 'react-icons/fi'

export default function ProductListMD(prop){
    const router = useRouter()
    const [ listProduct, setListProduct ] = useState([])
    const [ allProduct, setAllProduct ] = useState(prop.data)
    const [ currentPage, setCurrentPage ] = useState(1)
    const [ Max_Product_Per_Page, setMax_Product_Per_Page ] = useState(9)
    const [ maxPage, setMaxPage ] = useState(0)

    const goBack = () => {
        const target = '/series/' + allProduct[0].seriesId
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
                        return <div key={`item-${index}`} className={styles.itemContainer}>
                            <Link href={`/series/${element.seriesId}/${element.url}`}>
                                <div className={styles.item}>
                                    <div className={styles.image}>
                                        <Image src={element.img[0]} alt='img' layout='fill' objectFit='contain' />
                                    </div>
                                    <div className={styles.title}>{element.title} เล่ม {element.bookNum}</div>
                                    <button className={styles.btn}>
                                        <div className={styles.price}>{element.price} ฿</div>
                                        <div className={styles.text}>Add to cart</div>
                                    </button>
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
                        {currentPage}
                    </div>
                    <button className={currentPage===maxPage? styles.disable:''} onClick={e => changePageHandle(1) }><FiChevronRight /></button>
                </div>
            }
            
        </div>
    )
}