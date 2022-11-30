import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import styles from './orderId.module.css'
import Header from 'components/header'
import SideNavBar from 'components/user/sideNavbar'
import axios from 'axios'
import Link from "next/link"

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { RiArrowDownSLine } from 'react-icons/ri'
import { VscTriangleRight } from 'react-icons/vsc'

export default function OrderDetails() {
    const [ orderId, setOrderId ] = useState('')
    const [ orderData, setOrderData ] = useState({address: { tel: ''}})
    const [ productDetails, setProductDetails ] = useState([])
    const [ currency, setCurrency ] = useState('บาท')
    const [ dateTime, setDateTime ] = useState({})
    const [ showPaymentDetails, setShowPaymentDetails ] = useState(false)
    const [ editStatus, setEditStatus ] = useState({})
    const [ sumPrice, setSumPrice ] = useState(0)
    const [ round, setRound ] = useState(100)
    const router = useRouter()
    const paymentDetails = useRef()
    const statusIcon = useRef()
    const DetailsContent = useRef()
    const [ isLogin, setIsLogin ] = useState(false)

    useEffect(() => {
        if(router.isReady){
            setOrderId(router.query.orderId)
            if(localStorage.getItem('jwt')){
                setIsLogin(true)
                getOrder()
            } else {
                router.push({pathname: '/', query:{ } }, undefined,{ shallow: false } )
            }
        }
    }, [router])

    const getOrder = () => {
        try {
            const jwt = localStorage.getItem('jwt')
            const axiosURL = process.env.NEXT_PUBLIC_BACKEND + '/user/getOrderDetails?orderId=' + router.query.orderId
            axios.get(axiosURL, {
                headers: {
                    jwt
                }
            }).then( result => {
                // setOrderData(d.order)
                const d = result.data
                // console.log(d)
                setProductDetails(d.productDetails)
                statusIconChange(d.order.status)
                setNConvertStatus(d.order.status)

                if(d.order.method === 'metamask') {
                    metamaskDetail(d.order)
                }
                else {
                    setOrderData(d.order)
                }
                var time = d.order.paymentDetails.date.split(',') || d.order.date.split(',') 
                setDateTime({date: time[0], time: time[1] })

                var sum = 0
                var local_round = 100
                if(d.order.method === 'metamask'){
                    if(d.order.paymentDetails.currency === 'ETH'){
                        local_round = 10000
                        setRound(10000)
                    }
                    else if(d.order.paymentDetails.currency === 'BTC'){
                        local_round = 10000
                        setRound(10000)
                    }
                }
                const ex_rate = d.order.crypto_exchange_rate || 1
                d.order.cart.forEach(e => {
                    sum += Math.round( ((e.price * e.amount) / d.order.exchange_rate) / ex_rate * local_round ) / local_round
                })
                setSumPrice(sum)
            }).catch( err => {
                if(err.name === 'AxiosError'){
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
                }
            })
        } catch (error) {
            
        }
    }

    const statusIconChange = (status) => {
        if(status === 'paid'){
            statusIcon.current.className = styles.status_orange
        } else if(status === 'delivered'){
            statusIcon.current.className = styles.status_green
        } else if(status === 'cancel'){
            statusIcon.current.className = styles.status_red
        }
    }

    const setNConvertStatus = (status) => {
        if(status === 'paid'){
            setEditStatus({status, thai: 'ชำระเงินแล้ว'})
        } else if(status === 'delivered'){
            setEditStatus({status, thai: 'จัดส่งแล้ว'})
        } else if(status === 'cancel'){
            setEditStatus({status, thai: 'ยกเลิก'})
        } else if(status === 'ordered') {
            setEditStatus({status, thai: 'กำลังตรวจสอบการชำระเงิน'})
        }
    }

    const metamaskDetail = (data) => {
        setCurrency(data.paymentDetails.currency || 'BUSD')
        if(data.paymentDetails.refund){
            data.total = data.paymentDetails.net
        }
        setOrderData(data)
    }

    let pos = { top: 0, left: 0, x: 0, y: 0 }
    const mouseDownHandler = function (e) {
        var scroll = document.getElementById('listProduct')
        if(window.innerWidth <= 992){
            pos = {
                // The current scroll
                left: scroll.scrollLeft,
                top: scroll.scrollTop,
                // Get the current mouse position
                x: e.clientX,
                y: e.clientY,
            }
            scroll.style.cursor = 'grabbing'
            document.addEventListener('mousemove', mouseMoveHandler)
            document.addEventListener('mouseup', mouseUpHandler)
        } else {
            scroll.style.cursor = 'default'
        }
        
    }
    const mouseMoveHandler = function (e) {
        var scroll = document.getElementById('listProduct')
        // How far the mouse has been moved
        const dx = e.clientX - pos.x
        const dy = e.clientY - pos.y
    
        // Scroll the element
        scroll.scrollTop = pos.top - dy
        scroll.scrollLeft = pos.left - dx
        
    }
    const mouseUpHandler = function () {
        var scroll = document.getElementById('listProduct')
        scroll.style.cursor = 'grab'
        document.removeEventListener('mousemove', mouseMoveHandler)
        document.removeEventListener('mouseup', mouseUpHandler)
    }

    useEffect(() => {
        try {
            if(showPaymentDetails){
                paymentDetails.current.style.height = 25 + DetailsContent.current.clientHeight + 5 + 'px'
            } else {
                paymentDetails.current.style.height = '25px'
            }
        } catch (error) {}
    }, [showPaymentDetails])

    if(!isLogin) {
        return (
            <div>
                <Head>
                    <title>Orders | PT Bookstore</title>
                    <meta name="description" content="Generated by create next app" />
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <Header />
                <div className={styles.container}>
                    <main className={styles.main}>
                        
                    </main>
                </div>
            </div>
        )
    } else {
        return (
            <div>
                <Head>
                    <title>Orders | PT Bookstore</title>
                    <meta name="description" content="Generated by create next app" />
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <Header />
                <ToastContainer />
                <div className={styles.container}>
                    <main className={styles.main}>
                        <SideNavBar />
                        <div className={styles.screen} >
                            <center><div className={styles.title}>Order {orderId}</div></center>
                            <div className={styles.header}>
                                <div className={styles.title}></div>
                                <div className={styles.status}>
                                    Status : 
                                    <div ref={statusIcon} className={styles.status_gray}></div>
                                    {orderData.status}
                                </div>
                            </div>
                            {/* <div>List</div> */}
                            <div id='listProduct' className={styles.listProduct} onMouseDown={mouseDownHandler}>
                                <div className={styles.listHeader}>
                                    <div className={styles.productColumn}>Product</div>
                                    <div className={styles.priceColumn}>
                                        <div className={styles.unitPriceColumn}>Unit price</div>
                                        <div className={styles.amountColumn}>Amount</div>
                                        <div className={styles.totalColumn}>Total</div>
                                    </div>
                                </div>
                                {
                                    productDetails.map((element, index) => {
                                        return (
                                            <div key={`product-${index}`} className={styles.item}>
                                                <div className={styles.productColumn}>
                                                    <div className={styles.imgControl}>
                                                        <Image src={element.img[0]} alt='img' layout='fill' objectFit='cover' />
                                                    </div>
                                                    <div>{element.title} {element.bookNum}</div>
                                                </div>
                                                <div className={styles.priceColumn}>
                                                    <div className={styles.unitPriceColumn}>{element.price}</div>
                                                    <div className={styles.amountColumn}>{element.amount}</div>
                                                    <div className={styles.totalColumn}>{element.price * element.amount}</div>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                                <div className={styles.item}>
                                    <div className={styles.flexRight}>
                                        <div className={styles.right}>
                                            <span>รวม : </span>
                                            <span className={`${styles.priceLabel} text`}>{Math.round(sumPrice* round) / round}</span>
                                            <span style={{paddingLeft: '5px'}}>{currency}</span>
                                        </div>
                                        <div className={styles.right}>
                                            <span>ค่าจัดส่ง : </span>
                                            <span className={`${styles.priceLabel} text`}>{orderData.shippingFee}</span>
                                            <span style={{paddingLeft: '5px'}}>{currency}</span>
                                        </div>
                                        <div className={styles.right}>
                                            <span>ทั้งหมด : </span> 
                                            <span className={`${styles.priceLabel} text`}>{Math.round((sumPrice + orderData.shippingFee )* round) / round}</span>
                                            <span style={{paddingLeft: '5px'}}>{currency}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.orderDetails}>
                                <div>ข้อมูลคำสั่งซื้อ</div>
                                <div>ช่องทางชำระเงิน : {orderData.method}</div>
                                <div>ราคาทั้งหมด : {orderData.total} {currency} (รวมค่าจัดส่ง)</div>
                                {
                                    orderData.status !== 'ordered' && <div ref={paymentDetails} className={`${styles.paymentDetails} ${showPaymentDetails? styles.show:''}`}>
                                        <div className={styles.label} onClick={() => setShowPaymentDetails(!showPaymentDetails)}><div className={styles.triangleIcon}><VscTriangleRight /></div>ดูรายละเอียดการชำระเงิน</div>
                                        <div ref={DetailsContent} className={styles.detail}>
                                            {
                                                orderData.method === 'credit_card' && orderData.paymentDetails.total !== undefined && (<div>
                                                        <div>Bank : {orderData.paymentDetails.bank}</div>
                                                        <div>Brand : {orderData.paymentDetails.brand}</div>
                                                        <div>Total : {orderData.paymentDetails.total} บาท</div>
                                                        {/* <div>ค่าจัดส่ง : {orderData.shippingFee} บาท</div> */}
                                                        <div>วันที่โอน : {dateTime.date.replaceAll('.', '/')}</div>
                                                        <div>เวลา : {dateTime.time} น.  </div>
                                                    </div>
                                                )
                                            }
                                            {
                                                orderData.method === 'metamask' && orderData.paymentDetails.hash !== undefined && (
                                                    <div>
                                                        <div>Exchange Rate : {orderData.exchange_rate} Baht/USD</div>
                                                        { orderData.paymentDetails.currency === 'BUSD' && <div>Currency : { orderData.paymentDetails.currency }</div> }
                                                        {
                                                            orderData.paymentDetails.currency !== 'BUSD' && <>
                                                                <div>Currency : { orderData.paymentDetails.currency }</div>
                                                                <div>Currency Rate : { orderData.crypto_exchange_rate } USD/{ orderData.paymentDetails.currency }</div>
                                                            </>
                                                        }
                                                        <div>Transaction Hash : 
                                                            <Link href={`https://testnet.bscscan.com/tx/${orderData.paymentDetails.hash}`}>
                                                                <a target="_blank" > {orderData.paymentDetails.hash}</a>
                                                            </Link>
                                                        </div>
                                                        <div>Total : {orderData.paymentDetails.total} BUSD</div>
                                                        <div>Net : {orderData.paymentDetails.net} BUSD</div>
                                                        {/* <div>Shipping Fee : {orderData.shippingFee} BUSD</div> */}
                                                        {
                                                            orderData.paymentDetails.refund && (<>
                                                                <div>Refund : {orderData.paymentDetails.refundDetails.refundTotal} BUSD</div>
                                                                <div>Refund Hash : <Link href={`https://testnet.bscscan.com/tx/${orderData.paymentDetails.refundDetails.hash}`}>
                                                                    <a target="_blank" >{orderData.paymentDetails.refundDetails.hash}</a>
                                                                </Link></div>
                                                            </>)
                                                        }
                                                        <div>วันที่โอน : {dateTime.date.replaceAll('.', '/')}</div>
                                                        <div>เวลา : {dateTime.time} น.  </div>
                                                    </div>
                                                )
                                            }
                                        </div>  
                                    </div>
                                }
                                <div>ชื่อ : {orderData.address.firstName} {orderData.address.lastName}</div>
                                <div>ที่อยู่ : {orderData.address.address} ต.{orderData.address.subdistrict} อ.{orderData.address.district} จ.{orderData.address.province} {orderData.address.zipCode} ประเทศ{orderData.address.country}</div>
                                <div>เบอร์โทร : {orderData.address.tel.length === 10 && (orderData.address.tel.slice(0,3) + '-' + orderData.address.tel.slice(3,6) + '-' + orderData.address.tel.slice(6))}</div>
                                {/* <div>เบอร์โทร : {orderData.address.tel}</div> */}
                                <div>อีเมล : {orderData.address.email}</div>
                                <div className={styles.orderStatusSelect}>สถานะ : {editStatus.thai} </div>
                                { orderData.status === 'cancel' && <div>ยกเลิกเนื่องจาก : {orderData.failure_message}</div> }
                                { orderData.status === 'delivered' && (
                                    <>
                                        <div>บริษัทจัดส่ง : Kerry Express</div>
                                        <div>Tracking Number : {orderData.trackingNumber}</div>
                                    </>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        )
    }
}