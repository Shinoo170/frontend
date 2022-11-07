import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Router from 'next/router'

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
    const [ isSignIn, setIsSignIn ] = useState(false)
    const search = useRef()

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
    }
    const searchHandle = (e) => {
        if(e.keyCode === 13){
            var searchText = search.current.value
            if(search.current.value)
                Router.push({pathname: '/products', query:{ searchText } }, undefined,{} )
            else
            Router.push({pathname: '/products', query:{} }, undefined,{} )
        }
    }

    useEffect(() => {
        if(localStorage.getItem('jwt')){
            setIsSignIn(true)
        }
    },[])

    return (
        <nav className={styles.container}>
            <div className={styles.brand}>
                <div className={styles.mainToggle} id='mainToggle' onClick={e => mainToggleHandle(e)}>
                    <HiOutlineMenu id='mainToggleIcon'/>
                </div>
                <Link href='/'>
                    <a className={styles.brandWrap}>
                        <div className={styles.brandIcon}><img src='/logo_infinity.png'/></div>
                        <div className={styles.brandName}>PT bookstore</div>
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
                            <div className={styles.item}><Link href='/products'><a><div className={styles.subTitle}>ทั้งหมด</div></a></Link></div>
                            <div className={styles.item}><Link href='/products?category=Novel'><a><div className={styles.subTitle}>นิยาย</div></a></Link></div>
                            <div className={styles.item}><Link href='/products?category=Manga'><a><div className={styles.subTitle}>มังงะ</div></a></Link></div>
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
                        <input placeholder='ค้นหา' ref={search} onKeyUp={e => searchHandle(e)}/>
                        <div className={styles.searchIcon} onClick={e => searchHandle(e)}>
                            <BiSearch />
                        </div>
                    </div>
                </div>
                <div className={`${styles.searchToggle}`} onClick={searchBarToggleHandle}>
                    <BiSearch />
                </div>
                <div className={styles.cart}>
                    <Link href='/cart'>
                        <a>
                            <MdOutlineShoppingCart />
                        </a>
                    </Link>
                </div>
                { !isSignIn && <div className={styles.userInfo}><Link href='/signin'> Login </Link></div> }
                {
                    isSignIn && ( <div className={styles.userInfo}>
                            <div className={styles.profileImage} onClick={e => userDropdownToggleHandle(e)}>
                                <BiUser />
                            </div>
                            <div className={`${styles.userDropdown} ${userDropdownToggle? styles.show:''}`}>
                                <div className={styles.mobile}>
                                    <div className={styles.closeIcon} onClick={e => userDropdownToggleHandle(e)}><CgClose/></div>
                                </div>
                                <div className={styles.info}>{localStorage.getItem('displayName')}</div>
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