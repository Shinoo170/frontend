import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import SideNav from 'components/admin/adminSideNavbar'
import styles from './product.module.css'

export default function SpecificSeries() {
    const [ productData, setProductData ] = useState({})
    const router = useRouter()

    async function getProductDetails(){
        var split_query = router.query.productURL.split('-')
        split_query = split_query[split_query.length -1]
        var ca = ''
        if(split_query === 'นิยาย'){ ca = 'novel' }
        if(split_query === 'มังงะ'){ ca = 'manga' }
        if(split_query === 'สินค้า'){ ca = 'other' }
        const url = process.env.NEXT_PUBLIC_BACKEND + '/product/productDetail/' + router.query.productURL + '?seriesId=' + router.query.seriesId + '&category=' + ca
        axios.get(url).then( result => {
            // setProductData(result.data)
            console.log(result.data)
        }).catch(err => {
            console.log(err)
        })
    }

    useEffect( () => {
        if(router.isReady){
            const pid = router.query
            console.log(pid)
            getProductDetails()
        }
    }, [router])

    // useEffect( () => {
    //     if(productURL!='') getProductDetails()
    // })

    return (
        <div className={styles.container}>
            <SideNav />
            <div className={styles.contentContainer}>

            </div>
        </div>
    );
}
