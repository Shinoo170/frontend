import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import SideNav from 'components/admin/adminSideNavbar'
import styles from './series.module.css'

export default function SpecificSeries() {
    const router = useRouter()
    var seriesId = ''

    async function getProductDetails(){
        const url = process.env.BACKEND + '/product/series/' + seriesId

        axios.get(url).then( (result) => {
            console.log(result.data)
        }).catch( (err)=> {
            console.log(err)
        })
    }

    useEffect( () => {
        if(router.isReady){
            seriesId = router.query.seriesId
            getProductDetails()
        }
    }, [router])

    return (
        <div className={styles.container}>
            <SideNav />
            <div className={styles.contentContainer}>

            </div>
        </div>
    );
}
