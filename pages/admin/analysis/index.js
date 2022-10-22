import { useState, useEffect } from 'react'
import Link from 'next/link'


import { BiMenu, BiSearch, BiBell, BiChevronLeft, BiPlus } from 'react-icons/bi'
import { MdOutlineShoppingCart } from 'react-icons/md'
import { RiArrowRightSLine, RiArrowDownSLine } from 'react-icons/ri'

import styles from './analysis.module.css'

export default function AnalysisPage(){

    return (
        <nav className={styles.container}>
            <div className={styles.brand}>
                <div className={styles.brandIcon}><img src='../Logo_2.png' height={50}/></div>
                {/* <div className={styles.brandName}>PT bookshop</div> */}
            </div>
            <div className={styles.main}>
                <div className={styles.navItem}>
                    <div className={styles.dropdown}>
                        <div className={styles.title}>สินค้า <RiArrowDownSLine /></div>
                        <div className={styles.dropdownList}>
                            <div className={styles.item}>ทั้งหมด</div>
                            <div className={styles.item}>นิยาย</div>
                            <div className={styles.item}>มังงะ</div>
                        </div>
                    </div>
                </div>
                <div className={styles.navItem}>ซีรีย์</div>
                <div className={styles.navItem}>ขายดี</div>
                <div className={styles.navItem}>พรีออเดอร์</div>
            </div>
            <div className={styles.rightMenu}>
                <div className={styles.searchBox}>
                    <input />
                    <div className={styles.searchIcon}>
                        <BiSearch />
                    </div>
                </div>
                <div className={styles.cart}>
                    <MdOutlineShoppingCart />
                </div>
                <div className={styles.userInfo}>
                    <div> Login </div>
                </div>
            </div>
        </nav>
    )
}