import { useState, useEffect } from 'react'
import Link from 'next/link'
import SideNav from 'components/admin/adminSideNavbar'

import styles from './analysis.module.css'

export default function AnalysisPage(){

    return (
        <div className={styles.container}>
            <SideNav />
            <div className={styles.contentContainer}>
                
            </div>
        </div>
    )
}