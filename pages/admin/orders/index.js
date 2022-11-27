import axios from "axios"
import Image from 'next/image'
import { useState, useEffect, useRef } from "react"
import { useRouter } from 'next/router'
import SideNav from 'components/admin/adminSideNavbar'
import styles from './order.module.css'
import Link from "next/link"
import Swal from 'sweetalert2'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { RiArrowDownSLine } from 'react-icons/ri'
import { MdRefresh } from 'react-icons/md'
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io'

export default function Order() {
    const [ orderList, setOrderList ] = useState([])
    const [ showDropdown, setShowDropdown ] = useState(false)
    const [ sort, setSort ] = useState({status: undefined, thai_status: undefined})
    const [ previousSort, setPreviousSort ] = useState({status: undefined, thai_status: undefined})
    const [ currentPages, setCurrentPages ] = useState(0)
    const router = useRouter()
    
    useEffect(() => {
        if(router.isReady){
            setCurrentPages(parseInt(router.query.pages) || 1)
            setStatusSort(router.query.sort || 'paid')
        }
    }, [router])

    useEffect(() => {
        if((currentPages > 0) && (sort.status !== undefined)){
            getOrder()
        }
    }, [currentPages, sort])

    const getOrder = () => {
        const jwt = localStorage.getItem('jwt')
        const axiosURL = process.env.NEXT_PUBLIC_BACKEND + '/admin/getOrders?sort=' + sort.status + '&pages=' + currentPages
        axios.get(axiosURL, {
            headers: {
                jwt
            }
        })
        .then( result => {
            setOrderList(result.data)
        }).catch( err => {
            toast.error(`can't get orders`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            })
        })
    }

    const nextPaidOrders = () => {
        if(orderList.length === 10){
            router.query.pages = currentPages + 1
            setCurrentPages(c => c+1)
            router.push({pathname: '/admin/orders', query:{ ...router.query } }, undefined,{ shallow: true } )
        }
    }
    const previousPaidOrders = () => {
        if(orderList.length === 0) {
            router.query.pages = 1
            setCurrentPages(1)
            router.push({pathname: '/admin/orders', query:{ ...router.query } }, undefined,{ shallow: true } )
            return
        }
        if(currentPages > 1){
            router.query.pages = currentPages - 1
            setCurrentPages(c => c-1)
            router.push({pathname: '/admin/orders', query:{ ...router.query } }, undefined,{ shallow: true } )
        }
    }

    const dropdownHandle = (e) => {
        if(e !== previousSort.status){
            setPreviousSort(sort)
            setStatusSort(e)
            setCurrentPages(1)
            router.query.sort = e
            router.push({pathname: '/admin/orders', query:{ ...router.query } }, undefined,{ shallow: true } )
        }
        setShowDropdown(false)
    }

    const setStatusSort = (e) => {
        switch(e){
            case 'all': setSort({status: e, thai_status: 'ทั้งหมด'}); break;
            case 'ordered': setSort({status: e, thai_status: 'รอการชำระเงิน'}); break;
            case 'paid': setSort({status: e, thai_status: 'ชำระเงินแล้ว'}); break;
            case 'delivered': setSort({status: e, thai_status: 'จัดส่งแล้ว'}); break;
            case 'cancel': setSort({status: e, thai_status: 'ยกเลิก'}); break;
            default: setSort({status: 'all', thai_status: 'ทั้งหมด'})
        }
    }

    const reloadPage = () => {
        getOrder()
    }

    return (
        <div className={styles.container}>
            <SideNav />
            <ToastContainer />
            <div className={styles.contentContainer}>
                <div className={styles.orderWrap}>
                    <div className={styles.title}>Orders</div>
                    <div className={styles.flewWrap}>
                        <div className={styles.graph}>graph here</div>
                        <div className={styles.orderList}>
                            <div className={styles.flexEnd}>
                                <div className={`${styles.dropdownGroup} ${showDropdown? styles.showDropdown:''}`}>
                                    <div className={styles.dropdownSelection} onClick={e => {setShowDropdown(!showDropdown)}}>{sort.thai_status} <RiArrowDownSLine/></div>
                                    <div className={styles.dropdownList}>
                                        <div className={styles.dropdownItem} onClick={() => dropdownHandle('all')}>ทั้งหมด</div>
                                        <div className={styles.dropdownItem} onClick={() => dropdownHandle('ordered')}>รอการชำระเงิน</div>
                                        <div className={styles.dropdownItem} onClick={() => dropdownHandle('paid')}>ชำระเงินแล้ว</div>
                                        <div className={styles.dropdownItem} onClick={() => dropdownHandle('delivered')}>จัดส่งแล้ว</div>
                                        <div className={styles.dropdownItem} onClick={() => dropdownHandle('cancel')}>ยกเลิก</div>
                                    </div>
                                </div>
                                <div className={styles.refreshBtn} onClick={reloadPage}><MdRefresh /></div>
                            </div>
                            <div className={styles.itemHeader}>
                                <div className={styles.itemDetails}>OrderId</div>
                                <div className={styles.itemDetails}>Date</div>
                                <div className={styles.itemDetails}>Payment method</div>
                                <div className={styles.itemDetails}>Status</div>
                            </div>
                            {
                                orderList.map((element, index) => {
                                    var time = element.paymentDetails.date || element.date
                                    time = time.replaceAll('.','/')
                                    return (
                                        <Link href={`/admin/orders/${element.orderId}`} key={`order-${index}`}><a className={styles.item}>
                                            <div className={styles.itemDetails}>{element.orderId}</div>
                                            <div className={styles.itemDetails}>{time}</div>
                                            <div className={styles.itemDetails}>{element.method}</div>
                                            <div className={styles.itemDetails} style={{display: 'flex'}}>
                                                { element.status === 'ordered' && <div className={styles.status_gray}></div> }
                                                { element.status === 'paid' && <div className={styles.status_orange}></div> }
                                                { element.status === 'delivered' && <div className={styles.status_green}></div> }
                                                { element.status === 'cancel' && <div className={styles.status_red}></div> }
                                                { element.status }
                                            </div>
                                        </a></Link>
                                    )
                                })
                            }
                        </div>
                        <div className={styles.btnGroup}>
                            <div className={styles.btn} onClick={() => previousPaidOrders()}><IoIosArrowBack /></div>
                            {currentPages}
                            <div className={styles.btn} onClick={() => nextPaidOrders()}><IoIosArrowForward /></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}