import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Router from 'next/router'
import axios from "axios"

import styles from './sideNavbar.module.css'

export default function SideNavBar(){
    return (
        <div className={styles.container}>
            <div className={styles.navItem}><Link href='/user/'><a>ข้อมูลส่วนตัว</a></Link></div>
            <div className={styles.navItem}><Link href='/user/'><a>รายการสั่งซื้อ</a></Link></div>
            <div className={styles.navItem}><Link href='/user/'><a>ซีรี่ย์ที่ติดตาม</a></Link></div>
            <div className={styles.navItem}><Link href='/user/'><a>สินค้าที่อยากได้</a></Link></div>
        </div>
    )
}