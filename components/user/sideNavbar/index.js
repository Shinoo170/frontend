import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Router from 'next/router'
import axios from "axios"

import styles from './sideNavbar.module.css'

import { BiUser } from 'react-icons/bi'
import { BsBoxSeam, BsBookmarks, BsSuitHeart } from 'react-icons/bs'

export default function SideNavBar(){
    return (
        <div className={styles.container}>
            <Link href='/user/'><a><div className={styles.navItem}><BiUser />ข้อมูลส่วนตัว</div></a></Link>
            <Link href='/user/orders'><a><div className={styles.navItem}><BsBoxSeam />รายการสั่งซื้อ</div></a></Link>
            <Link href='/user/subscribes'><a><div className={styles.navItem}><BsBookmarks />ซีรี่ย์ที่ติดตาม</div></a></Link>
            <Link href='/user/wishlists'><a><div className={styles.navItem}><BsSuitHeart />สินค้าที่อยากได้</div></a></Link>
        </div>
    )
}