import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import SideNav from 'components/admin/adminSideNavbar'
import styles from './product.module.css'

export default function specificSeries() {
    const router = useRouter()

    useEffect( () => {
        if(router.isReady){
            const pid = router.query
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
