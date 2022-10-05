import { useState, useEffect, useContext } from 'react'
import Link from 'next/link'
import styles from './adminSideNavbar.module.css'

import {
    BiMenu,
    BiLogOut,
    BiGridAlt,
    BiMenuAltRight,
    BiMessageSquareDetail,
    BiBarChartAlt2,
    BiHistory,
    BiDetail,
    BiCart,
} from 'react-icons/bi'
import { VscGithubInverted } from 'react-icons/vsc'


export default function SideNavbar(){
    const [ expand, setExpand ] = useState(false) 
    
    return (
        <div className={`${styles.container} ${expand? styles.containerExpand : ''}`}>
            <div className={`${styles.sidebar} ${expand? styles.sidebarExpand : ''}`}>
                <div className={styles.logoDetails} onClick={ ()=>{ setExpand(!expand) }}>
                    <i className={styles.icon}><VscGithubInverted /></i>
                    <div className={styles.logoName}>Bookstore</div>
                    <div className={styles.navMenuIcon}>
                        {expand? <BiMenuAltRight />:<BiMenu/>}
                    </div>
                </div>
                <ul className={styles.navContainer}>
                    <li>
                        <Link href='/admin'> 
                            <a>
                                <i><BiGridAlt /></i>
                                <span className={styles.linkName}>Overview</span>
                            </a>
                        </Link>
                        <span className={styles.tooltip}>Overview</span>
                    </li>
                    <li>
                        <Link href='/admin/analysis'> 
                            <a>
                                <i><BiBarChartAlt2 /></i>
                                <span className={styles.linkName}>Analysis</span>
                            </a>
                        </Link>
                        <span className={styles.tooltip}>Analysis</span>
                    </li>
                    <li>
                        <Link href='/admin/product'> 
                            <a>
                                <i><BiDetail /></i>
                                <span className={styles.linkName}>Product</span>
                            </a>
                        </Link>
                        <span className={styles.tooltip}>Product</span>
                    </li>
                    <li>
                        <Link href='#'> 
                            <a>
                                <i><BiCart /></i>
                                <span className={styles.linkName}>Order</span>
                            </a>
                        </Link>
                        <span className={styles.tooltip}>Order</span>
                    </li>
                    <li>
                        <Link href='#'> 
                            <a>
                                <i><BiHistory /></i>
                                <span className={styles.linkName}>History</span>
                            </a>
                        </Link>
                        <span className={styles.tooltip}>History</span>
                    </li>
                    <li>
                        <Link href='#'> 
                            <a>
                                <i><BiMessageSquareDetail /></i>
                                <span className={styles.linkName}>Review</span>
                            </a>
                        </Link>
                        <span className={styles.tooltip}>Review</span>
                    </li>

                    <li className={styles.profile}>
                        <div className={styles.profileDetails}>
                        <div className={styles.nameJob}>
                            <div className={styles.name}>Shinoo</div>
                            <div className={styles.job}>Full stack dev</div>
                        </div>
                        </div>
                        <i className={styles.logout}><BiLogOut /></i>
                        <span className={styles.tooltip}>Logout</span>
                    </li>
                </ul>
            </div>
        </div>
    )
}