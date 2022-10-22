import { useState, useEffect, useContext } from 'react'
import Link from 'next/link'
import styles from './header.module.css'
import { DataContext } from '../../pages/_app';

import { BiMenu, BiSearch, BiBell, BiChevronLeft, BiPlus } from 'react-icons/bi'
import { MdOutlineShoppingCart } from 'react-icons/md'
import { RiArrowRightSLine, RiArrowDownSLine } from 'react-icons/ri'

export default function Header(){
    const [ userName, setUserName ] = useState()
    const [searchBarExpand, setSearchBarExpand] = useState(false)
    const [menuExpand, setMenuExpand] = useState(false)
    const [dropdownExpand, setDropdownExpand] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [userInfoDd, setUserInfoDd] = useState(false)

    function openUserInfoDropdown(event){
        setUserInfoDd(true)
        const dropdownHandle = (e) => {
            const target = document.getElementById('userInfoDropdown')
            target.classList.add(styles.show)
            if(e.target != target && e.target != event.target || userInfoDd){
                target.classList.remove(styles.show)
                document.removeEventListener("click", dropdownHandle)
                setUserInfoDd(false)
            }
        }
        document.addEventListener("click", dropdownHandle)
    }

    const signOut = () => {
        localStorage.removeItem('jwt')
        localStorage.removeItem('displayName')
        localStorage.removeItem('userId')
        setUserName(null)
    }
    
    useEffect( () => {
        setUserName( localStorage.getItem('displayName'))
    }, [])

    return (
        <header className={styles.container}>
            <Link href='/'>
                <a className={styles.logoDetails}>
                    <div className={styles.logoIcon}>
                        <img src='./mainIcon.png' width={40} height={40} />
                    </div>
                    <div className={styles.brand}>PT Bookshop</div>
                </a>
            </Link>

            <div className={styles.menuContainer}>
                <div className={`${styles.wrapMenu} ${menuExpand ? styles.menuExpand : ''}`}>
                    <div className={styles.blockBlur} onClick={() => setMenuExpand(false)}></div>
                    <div className={styles.menu}>
                        <div className={`${styles.dropdownContainer} ${dropdownExpand ? styles.dropdownExpand : ''}`}>
                            <div className={styles.dropdownTitle} onClick={() => setDropdownExpand(!dropdownExpand)}>
                                <div className={styles.subItem}><Link href='#'>สินค้า</Link></div>
                                <div className={styles.dropdownIcon}><RiArrowDownSLine /></div>
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
                        value={inputValue} onChange={e => { setInputValue(e.currentTarget.value); } } />
                    <span className={styles.searchIcon}><BiSearch /></span>
                    <span className={styles.searchBarToggle} onClick={() => { setSearchBarExpand(true); } }><BiSearch /></span>
                </form>
            </div>

            <div className={`${styles.searchBar2Container} ${searchBarExpand ? styles.searchBar2Expand : ''}`}>
                <div className={styles.searchBar2}>
                    <form className={styles.searchForm}>
                        <span className={styles.backIcon} onClick={() => { setSearchBarExpand(false); } }><BiChevronLeft /></span>
                        <input
                            name="search"
                            className={styles.searchInput}
                            placeholder="Search here..."
                            value={inputValue} onChange={e => { setInputValue(e.currentTarget.value); } } />
                        <span className={styles.searchIcon}><BiSearch /></span>
                    </form>
                </div>
            </div>

            <div className={styles.rightMenu}>
                <div className={styles.item}>
                    <MdOutlineShoppingCart />
                </div>
                <div className={styles.item}>
                    <span className={styles.notification}>
                        <BiBell />
                        <span className={styles.notificationNum}>9</span>
                    </span>
                </div>
                <div className={styles.userInfo}>
                    {userName && (
                        <>
                            <div className={styles.top} onClick={e => openUserInfoDropdown(e)}>
                                <div className={styles.username}>{userName}</div>
                                <RiArrowDownSLine />
                            </div>
                            <div id='userInfoDropdown' className={styles.userInfoDropdown}>
                                <div className={styles.subItem}><Link href='#'>บัญชีของฉัน</Link></div>
                                <div className={styles.subItem}><Link href='#'>รายการสั่งซื้อ</Link></div>
                                <div className={styles.subItem}><Link href='#'>รายการที่ติดตาม</Link></div>
                                <div className={styles.subItem}><Link href='#'>รายการที่อยากได้</Link></div>
                                <hr />
                                <div className={styles.subItem} onClick={signOut}><div className={styles.signOut}>ออกจากระบบ</div></div>
                            </div>
                        </>
                    )}
                    {!userName && <Link href='/signin'>เข้าสู่ระบบ </Link>}
                </div>
                <div className={styles.toggleMenuIcon} onClick={() => setMenuExpand(!menuExpand)}><i><BiMenu /></i></div>
            </div>



        </header>
    )
}