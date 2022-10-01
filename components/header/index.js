import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './header.module.css'

import { BiMenu, BiSearch, BiBell, BiChevronLeft, BiPlus } from 'react-icons/bi'
import { MdOutlineShoppingCart } from 'react-icons/md'
import { RiArrowRightSLine } from 'react-icons/ri'

export default function Header(){
    const [searchBarExpand, setSearchBarExpand] = useState(false)
    const [menuExpand, setMenuExpand] = useState(false)
    const [dropdownExpand, setDropdownExpand] = useState(false)
    const [inputValue, setInputValue] = useState('')

    return (
        <header className={styles.container}>

            <div className={styles.logoDetails}>
                <Link href='#' className={styles.logoIcon}>LogoIcon</Link>
            </div>
            
            <div className={styles.menuContainer}>
                <div className={`${styles.wrapMenu} ${menuExpand? styles.menuExpand:''}`}>
                    <div className={styles.blockBlur} onClick={ () => setMenuExpand(false) }></div>
                    <div className={styles.menu}> 
                        <div className={`${styles.dropdownContainer} ${dropdownExpand? styles.dropdownExpand:''}`}>
                            <div className={styles.dropdownTitle} onClick={() => setDropdownExpand(!dropdownExpand)} >
                                สินค้า
                                <span className={styles.dropdownIcon}><RiArrowRightSLine /></span>
                            </div>
                            <div className={styles.dropdown}>
                                <div className={styles.subItem}><Link href='#'>นิยาย</Link></div>
                                <div className={styles.subItem}><Link href='#'>มังงะ</Link></div>
                                <div className={styles.subItem}><Link href='#'>Boxset</Link></div>
                            </div>
                        </div> 
                        <div className={styles.item}><Link href='#'>ขายดี</Link></div>
                        <div className={styles.item}><Link href='#'>พรีออเดอร์</Link></div>
                    </div>
                </div>
            </div>

            <div className={styles.searchBar}>
                <form className={styles.searchForm}>
                    <input 
                        name="search" 
                        className={styles.searchInput} 
                        placeholder="Search here..." 
                        value={inputValue} onChange={ e=> { setInputValue(e.currentTarget.value) }}
                    />
                    <span className={styles.searchIcon}><BiSearch /></span>
                    <span className={styles.searchBarToggle} onClick={ () => { setSearchBarExpand(true) }} ><BiSearch /></span>
                </form>
            </div>

            <div className={`${styles.searchBar2Container} ${searchBarExpand? styles.searchBar2Expand:''}`} >
                <div className={styles.searchBar2}>
                    <form className={styles.searchForm}>
                        <span className={styles.backIcon} onClick={ () => { setSearchBarExpand(false) } } ><BiChevronLeft /></span>
                        <input 
                            name="search" 
                            className={styles.searchInput} 
                            placeholder="Search here..." 
                            value={inputValue} onChange={ e=> { setInputValue(e.currentTarget.value) }}
                        />
                        <span className={styles.searchIcon}><BiSearch /></span>
                    </form>
                </div>
            </div>
            
            <div className={styles.rightMenu}>
                <div className={styles.item}><i><MdOutlineShoppingCart /></i></div>
                <div className={styles.item}>
                    <span className={styles.notification}>
                        <i><BiBell /></i>
                        <span className={styles.notificationNum}>9</span>
                    </span>
                </div>
                <div className={styles.userInfo}>
                    <Link href='/signin'>เข้าสู่ระบบ </Link>
                </div>
                <div className={styles.toggleMenuIcon} onClick={ () => setMenuExpand(!menuExpand) }><i><BiMenu /></i></div>
            </div>

        </header>
    )
}