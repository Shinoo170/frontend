import { useState, useEffect } from 'react'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'

import SideNav from 'components/admin/adminSideNavbar'

import styles from './product.module.css'

export default function ProductPage(){
    const [ listProduct, setListProduct ] = useState([])
    const [ test, setTest] = useState(<div>No value</div>)
    
    // get data
    async function getListProduct(){
        const url = 'https://' + process.env.backendURL

        axios.get(url).then( (result) => {

        }).catch( (err)=> {
            
        })
    }
    function showProduct(){
        return listProduct.map( (element, index) => {
            return (
                <div key={`item-${index}`} className={styles.itemContainer}>
                    <Link href={`/admin/product/${element.seriesId}`}>
                        <div className={styles.item}>
                            <div className={styles.image}>
                                <Image src={element.img} alt='img' layout='fill' objectFit='contain'/>
                            </div>
                            <div className={styles.title}>{element.title}</div>
                            <button className={styles.btn}>details</button>
                        </div>
                    </Link>
                </div>
            )
        })
    }
    useEffect( () => {
        setTest(<div>on process</div>)
        getListProduct()
    }, [])

    return (
        <div className={styles.container}>
            <SideNav />
            <div className={styles.contentContainer}>
                <div className={styles.productWrap}>
                    <div className={styles.pageTitle}>Product</div>
                    <div><input /></div>
                    <button><Link href='/admin/product/addSeries'>Add Series</Link></button>
                    <div className={styles.listProductContainer} id='listContainer'>
                        { showProduct() }
                    </div>
                    { test }
                </div>
            </div>
        </div>
    )

}

