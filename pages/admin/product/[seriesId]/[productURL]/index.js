import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import SideNav from 'components/admin/adminSideNavbar'
import styles from './product.module.css'

export default function SpecificSeries() {
    const [ seriesId, setSeriesId ] = useState('')
    const [ productURL, setProductURL ] = useState('')
    const [ productData, setProductData ] = useState({})
    const router = useRouter()

    async function getProductDetails(){
        const url = process.env.NEXT_PUBLIC_BACKEND + '/product/product/' + productURL
        axios.get(url).then( result => {
            // setProductData(result.data)
            console.log(result.data)
        })
    }

    useEffect( () => {
        if(router.isReady){
            const pid = router.query
            setSeriesId(pid.seriesId)
            setProductURL(pid.productURL)
            console.log(pid)
        }
    }, [router])

    useEffect( () => {
        if(productURL!='') getProductDetails()
    })

    return (
        <div className={styles.container}>
            <SideNav />
            <div className={styles.contentContainer}>
                
            </div>
        </div>
    );
}
