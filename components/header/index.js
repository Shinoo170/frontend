import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { BiMenu, BiSearch, BiBell, BiChevronLeft, BiPlus, BiGridAlt, BiUser } from 'react-icons/bi'
import { BsBoxSeam, BsBookmarks, BsSuitHeart } from 'react-icons/bs'
import { MdOutlineShoppingCart } from 'react-icons/md'
import { RiArrowRightSLine, RiArrowDownSLine } from 'react-icons/ri'
import { HiOutlineChevronLeft } from 'react-icons/hi'
import { HiOutlineMenu } from 'react-icons/hi'
import { CgClose } from 'react-icons/cg'
import { VscSignOut } from 'react-icons/vsc'

import styles from './header.module.css'

export default function Header(){
    const [ searchBarToggle, setSearchBarToggle ] = useState(false)
    const [ mainToggle, setMainToggle ] = useState(false)
    const [ mobileProductDropdown, setMobileProductDropdown ] = useState(false)
    const [ userDropdownToggle, setUserDropdownToggle ] = useState(false)
    const [ isSingIn, setIsSingIn ] = useState(false)
    const [ userName, setUserName ] = useState('')
    const [ profileImage, setProfileImage] = useState('')

    const searchBarToggleHandle = () => {
        setSearchBarToggle( !searchBarToggle )
    }
    const mainToggleHandle = (e) => {
        if(e.target.id == 'navMain' || e.target.id == 'mainToggleIcon' || e.target.id == 'mainToggle'){
            setMainToggle( !mainToggle )
        }
    }
    const mobileProductDropdownHandle = () => {
        setMobileProductDropdown( !mobileProductDropdown )
    }
    const userDropdownToggleHandle = (e) => {
        setUserDropdownToggle( !userDropdownToggle )
    }
    const signOutHandle = () => {
        localStorage.removeItem('jwt')
        localStorage.removeItem('displayName')
        setIsSingIn(false)
    }

    useEffect( () => {
        if(localStorage.getItem('jwt')){
            setUserName( localStorage.getItem('displayName') )
            setIsSingIn(true)
        }
    }, [])

    return (
        <nav className={styles.container}>
            <div className={styles.brand}>
                <div className={styles.mainToggle} id='mainToggle' onClick={e => mainToggleHandle(e)}>
                    <HiOutlineMenu id='mainToggleIcon'/>
                </div>
                <Link href='/'>
                    <a className={styles.brandWrap}>
                        <div className={styles.brandIcon}><img src='../logo_infinity.png'/></div>
                        <div className={styles.brandName}>PT bookshop</div>
                    </a>
                </Link>
            </div>
            <div className={`${styles.main} ${mainToggle? styles.show:''}`} id='navMain' onClick={e => mainToggleHandle(e)}>
                <div className={styles.navItem}>
                    <div className={styles.dropdown}>
                        <div className={styles.title} onClick={mobileProductDropdownHandle}>
                            <div className={styles.mobileIcon}><BiGridAlt/></div>
                            สินค้า
                            <div className={styles.dropdownIcon}><RiArrowDownSLine/></div>
                        </div>
                        <div className={`${styles.dropdownList} ${mobileProductDropdown? styles.show:''}`}>
                            <div className={styles.item}><div className={styles.subTitle}><Link href='/products'>ทั้งหมด</Link></div></div>
                            <div className={styles.item}><div className={styles.subTitle}><Link href='/products?category=novel'>นิยาย</Link></div></div>
                            <div className={styles.item}><div className={styles.subTitle}><Link href='/products?category=manga'>มังงะ</Link></div></div>
                        </div>
                    </div>
                </div>
                <div className={styles.navItem}><div className={styles.title}>ซีรีย์</div></div>
                <div className={styles.navItem}><div className={styles.title}>ขายดี</div></div>
                <div className={styles.navItem}><div className={styles.title}>พรีออเดอร์</div></div>
                <div className={styles.navItem}><div className={styles.title}>โปรโมชั่น</div></div>
                <div className={styles.dummyItem}></div>
            </div>
            <div className={styles.rightMenu}>
                <div className={`${styles.searchBoxContainer} ${searchBarToggle? styles.visible:'' }`}>
                    <div className={styles.searchBox}>
                        <div className={`${styles.backIcon} ${searchBarToggle? styles.visible:'' }`} onClick={searchBarToggleHandle}>
                            <HiOutlineChevronLeft />
                        </div>
                        <input placeholder='ค้นหา' />
                        <div className={styles.searchIcon}>
                            <BiSearch />
                        </div>
                    </div>
                </div>
                <div className={`${styles.searchToggle}`} onClick={searchBarToggleHandle}>
                    <BiSearch />
                </div>
                <div className={styles.cart}>
                    <MdOutlineShoppingCart />
                </div>
                { !isSingIn && <div className={styles.userInfo}><Link href='/signin'> Login </Link></div> }
                {
                    isSingIn && ( <div className={styles.userInfo}>
                            <div className={styles.profileImage} onClick={e => userDropdownToggleHandle(e)}>
                                <BiUser />
                            </div>
                            <div className={`${styles.userDropdown} ${userDropdownToggle? styles.show:''}`}>
                                <div className={styles.mobile}>
                                    <div className={styles.closeIcon} onClick={e => userDropdownToggleHandle(e)}><CgClose/></div>
                                </div>
                                <div className={styles.info}>{userName || 'tester'}</div>
                                <hr />
                                <div className={styles.subItem}><Link href='#'><div className={styles.subTitle}><BiUser/>บัญชีของฉัน</div></Link></div>
                                <div className={styles.subItem}><Link href='#'><div className={styles.subTitle}><BsBoxSeam/>รายการสั่งซื้อ</div></Link></div>
                                <div className={styles.subItem}><Link href='#'><div className={styles.subTitle}><BsBookmarks/>รายการที่ติดตาม</div></Link></div>
                                <div className={styles.subItem}><Link href='#'><div className={styles.subTitle}><BsSuitHeart/>รายการที่อยากได้</div></Link></div>
                                <hr />
                                <div className={styles.subItem} onClick={signOutHandle}><div className={styles.subTitle}><VscSignOut/>ออกจากระบบ</div></div>
                            </div>
                        </div>
                    )
                }
                
            </div>
        </nav>
    )
}