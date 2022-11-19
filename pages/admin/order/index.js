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


export default function Order() {
    const [ orderList, setOrderList ] = useState([])

    useEffect(() => {
        const axiosURL = process.env.NEXT_PUBLIC_BACKEND + '/admin/getPaidOrder'
        axios.get(axiosURL)
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
    }, [])

    return (
        <div className={styles.container}>
            <SideNav />
            <ToastContainer />
            <div className={styles.contentContainer}>
                <div className={styles.orderWrap}>
                    <div className={styles.title}>All Order</div>
                    <div className={styles.flewWrap}>
                        <div className={styles.graph}>graph</div>
                        <div className={styles.orderList}>
                            <div className={styles.itemHeader}>
                                <div className={styles.itemDetails}>OrderId</div>
                                <div className={styles.itemDetails}>Date</div>
                                <div className={styles.itemDetails}>Payment method</div>
                                <div className={styles.itemDetails}>Status</div>
                            </div>
                            {
                                orderList.map((element, index) => {
                                    const fullDate = element.paymentDetails.date.split('T')
                                    var d = fullDate[0].split('-')
                                    var d2 = d[2] + '/' + d[1] + '/' + d[0]
                                    var t = fullDate[1].split('.')

                                    return (
                                        <div key={`order-${index}`} >
                                            <Link href={`/admin/order/${element.orderId}`} ><a className={styles.item}>
                                                <div className={styles.itemDetails}>{element.orderId}</div>
                                                <div className={styles.itemDetails}>{d2 + ' ' + t[0]}</div>
                                                <div className={styles.itemDetails}>{element.method}</div>
                                                <div className={styles.itemDetails} style={{display: 'flex'}}><div className={styles.status_orange}></div>{element.status}</div>
                                            </a></Link>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>

                <div className={styles.orderWrap}>
                    <div className={styles.title}>Order</div>
                    <div className={styles.flewWrap}>
                        <div className={styles.graph}>graph</div>
                        <div className={styles.orderList}>
                            <div className={styles.itemHeader}>
                                <div className={styles.itemDetails}>OrderId</div>
                                <div className={styles.itemDetails}>Date</div>
                                <div className={styles.itemDetails}>Payment method</div>
                                <div className={styles.itemDetails}>Status</div>
                            </div>
                            {
                                orderList.map((element, index) => {
                                    const fullDate = element.paymentDetails.date.split('T')
                                    var d = fullDate[0].split('-')
                                    var d2 = d[2] + '/' + d[1] + '/' + d[0]
                                    var t = fullDate[1].split('.')

                                    return (
                                        <div key={`order-${index}`} >
                                            <Link href={`/admin/order/${element.orderId}`} ><a className={styles.item}>
                                                <div className={styles.itemDetails}>{element.orderId}</div>
                                                <div className={styles.itemDetails}>{d2 + ' ' + t[0]}</div>
                                                <div className={styles.itemDetails}>{element.method}</div>
                                                <div className={styles.itemDetails} style={{display: 'flex'}}><div className={styles.status_orange}></div>{element.status}</div>
                                            </a></Link>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}