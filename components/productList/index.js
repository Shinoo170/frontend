import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './productList.module.css'

import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io'

export default function ProductList(prop){
    const [ allProduct, setAllProduct ] = useState(prop.data)
    const [ listProduct, setListProduct ] = useState([])
    const [ currentPage, setCurrentPage ] = useState(parseInt(prop.currentPage))
    const [ Max_Product_Per_Page, setMax_Product_Per_Page ] = useState(parseInt(prop.maxPerPage))
    const [ maxPage, setMaxPage ] = useState(0)

    useEffect(() => {
        setMaxPage( Math.ceil(allProduct.length/Max_Product_Per_Page))
    },[allProduct])
    useEffect(() => {
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

    const previousPage = () => {
        if( currentPage > 1) setCurrentPage(currentPage-1)
    }
    const nextPage = () => {
        if( currentPage < maxPage) setCurrentPage(currentPage+1)
    }

    return (
        <>
            <div className={styles.listProductContainer}>
                { 
                    listProduct.map( (element, index) => {
                        return (
                            <div key={`item-${index}`} className={styles.itemContainer}>
                                <Link href={`/admin/product/${element.seriesId}`}>
                                    <a className={styles.item}>
                                        <div className={styles.image}>
                                            <Image src={element.img} alt='img' layout='fill' objectFit='contain' />
                                        </div>
                                        <div className={styles.title}>{element.title}</div>
                                        <button className={styles.btn}>details</button>
                                    </a>
                                </Link>
                            </div>
                            
                        )
                    } ) 
                }
            </div>
            <div className={styles.pageButtonGroup}>
                <button onClick={previousPage}><IoIosArrowBack /></button>
                <div className={styles.currentPageText}>
                    {currentPage}
                </div>
                <button onClick={nextPage}><IoIosArrowForward /></button>
            </div>
        </>
    )
}