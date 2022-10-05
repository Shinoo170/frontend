import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import SideNav from 'components/admin/adminSideNavbar'
import styles from './series.module.css'

export default function SpecificSeries() {
    const router = useRouter()
    var url = ''
    function getProductDetails(){
        axios.get('http://localhost:5000/product/series/').then( (result) => {
            
        }).catch( (err)=> {

        })
    }
    useEffect( () => {
        if(router.isReady){
            const pid = router.query
            url = pid.seriesId
            console.log(pid)
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
