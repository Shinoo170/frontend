import { useState, useEffect } from 'react'
import Router from 'next/router'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'

import SideNav from 'components/admin/adminSideNavbar'

import styles from './product.module.css'
import { FiChevronLeft,FiChevronRight } from 'react-icons/fi'

export default function ProductPage(){
    const [ listProduct, setListProduct ] = useState([])
    const [ allProduct, setAllProduct ] = useState([])
    const [ currentPage, setCurrentPage ] = useState(1)
    const [ Max_Product_Per_Page, setMax_Product_Per_Page ] = useState(10)
    const [ maxPage, setMaxPage ] = useState(0)
    // get data
    

    const getListProduct = async () => {
        const url = process.env.NEXT_PUBLIC_BACKEND + '/product/allSeries'
        axios.get(url).then( (result) => {
            // setListProduct(result.data)
            setAllProduct(result.data)
        }).catch( (err)=> {
            // Localhost ios issus
            console.log(err)
            axios.get('/api/getAllSeries')
            .then( (result) => { 
                // setListProduct( result.data )
                setAllProduct(result.data)
            })
            .catch( (err) => {
                setListProduct( [{img: '', title: err.message , seriesId:'0'}] )
            })
        })
    }

    const changePageHandle = (event) => {
        if( ( event === -1 ) && ( currentPage > 1 )){
            setCurrentPage(currentPage-1)
        } else if( ( event === 1 ) && ( currentPage < maxPage )){
            setCurrentPage(currentPage+1)
        }
    }
    // [ First,1 get data ]
    useEffect( () => {
        getListProduct()
    }, [])
    // [ Then,2 calculate max page ]
    useEffect(()=>{
        setMaxPage( Math.ceil(allProduct.length/Max_Product_Per_Page))
        setCurrentPage(1)
    },[allProduct])
    // [ Last,3 show product when page change ]
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
        Router.push({
            pathname: '/admin/product',
            query: { page: currentPage },
        })
    }, [currentPage, maxPage])
    

    return (
        <div className={styles.container}>
            <SideNav />
            <div className={styles.contentContainer}>
                <div className={styles.productWrap}>
                    <div className={styles.pageTitle}>Product</div>
                    <div className={styles.topMenu}>
                        <button className={styles.addButton}><Link href='/admin/product/addSeries'>Add Series</Link></button>
                        <input placeholder='Search...'/>
                    </div>
                    
                    <div className={styles.listProductContainer} id='listContainer'>
                        { (listProduct[0] === undefined) && <div>No product</div> }
                        {
                            (listProduct[0] != undefined) && listProduct.map( (element, index) => {
                                return (
                                    <div key={`item-${index}`} className={styles.itemContainer}>
                                        <Link href={`/admin/product/${element.seriesId}`}>
                                            <div className={styles.item}>
                                                <div className={styles.image}>
                                                    <Image src={element.img} alt='img' layout='fill' objectFit='contain' />
                                                </div>
                                                <div className={styles.title}>{element.title}</div>
                                                <button className={styles.btn}>details</button>
                                            </div>
                                        </Link>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className={styles.pageButtonGroup}>
                        <button onClick={e => changePageHandle(-1) }><FiChevronLeft /></button>
                        <div className={styles.currentPageText}>
                            {currentPage}
                        </div>
                        <button onClick={e => changePageHandle(1) }><FiChevronRight /></button>
                    </div>
                </div>
            </div>
        </div>
    )

}

