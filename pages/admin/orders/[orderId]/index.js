import axios from "axios"
import Image from 'next/image'
import { useState, useEffect, useRef } from "react"
import { useRouter } from 'next/router'
import SideNav from 'components/admin/adminSideNavbar'
import styles from './orderId.module.css'
import Link from "next/link"
import Swal from 'sweetalert2'
import Head from 'next/head'

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
    const router = useRouter()
    const statusIcon = useRef()
    const paymentDetails = useRef()
    const DetailsContent = useRef()

    const [ isAdmin, setIsAdmin ] = useState(false)

    useEffect(() => {
        if(router.isReady){
            if(localStorage.getItem('jwt')){
                axios.get('/api/isAdmin', {
                    headers: { jwt: localStorage.getItem('jwt') }
                }).then(result => {
                    if(result.data.isAdmin){
                        setIsAdmin(true)
                        setOrderId(router.query.orderId)
                        getOrder()
                    } else {
                        return router.push({pathname: '/', query:{ } }, undefined,{ shallow: false } )
                    }
                }).catch(err => {
                    return router.push({pathname: '/', query:{ } }, undefined,{ shallow: false } )
                })
            } else {
                return router.push({pathname: '/', query:{ } }, undefined,{ shallow: false } )
            }
        }
    }, [router])

    const getOrder = () => {
        const jwt = localStorage.getItem('jwt')
        const axiosURL = process.env.NEXT_PUBLIC_BACKEND + '/admin/getOrderDetails?orderId=' + router.query.orderId
        axios.get(axiosURL, {
            headers: {
                jwt
            }
        }).then( result => {
            // setOrderData(d.order)
            const d = result.data
            console.log(d)
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
            setEditStatus({status, thai: 'ตรวจสอบการชำระเงิน'})
        }
    }

    const metamaskDetail = (data) => {
        setCurrency('BUSD')
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

    const showDropdownHandle = () => {
        const container = document.getElementById('status-dropdown')
        if(container.classList.length === 1){
            container.classList.add(styles.showDropdown)
            document.addEventListener('mouseup', mouseUpHandle)
        } else {
            container.classList.remove(styles.showDropdown)
        }
    }
    const mouseUpHandle = (e) => {
        const container = document.getElementById('status-dropdown')
        if (!container.contains(e.target)) {
            container.classList.remove(styles.showDropdown)
            document.removeEventListener('mouseup', mouseUpHandle)
        }
    }
    const changeStatusHandle = (e) => {
        const container = document.getElementById('status-dropdown')
        container.classList.remove(styles.showDropdown)
        document.removeEventListener('mouseup', mouseUpHandle)
        var newValue = e.target.getAttribute('data-value')
        // if(newValue <= element.stockAmount)
        setNConvertStatus(newValue)
    }

    const saveChange = () => {
        if(orderData.status !== editStatus.status){
            const jwt = localStorage.getItem('jwt')
            if(editStatus.status === 'delivered'){
                var trackingNumber = document.getElementById('tracking-number').value
                if(trackingNumber.trim() === ''){
                    return Swal.fire({
                        title: 'กรุณากรอกข้อมูลให้ครบ',
                        icon: 'error',
                        confirmButtonColor: '#DC3545',
                    })
                }
                Swal.fire({
                    title: 'ต้องการบันทึกหรือไม่?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#28A745',
                    cancelButtonColor: '#DC3545',
                    confirmButtonText: 'Confirm!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        var data = {
                            jwt,
                            orderId: orderData.orderId,
                            status: editStatus.status,
                            trackingNumber
                        }
                        sendData(data)
                    }
                })
            }else if(editStatus.status === 'cancel'){
                var cancelMessage = document.getElementById('cancel-message').value
                if(cancelMessage.trim() === ''){
                    return Swal.fire({
                        title: 'กรุณากรอกข้อมูลให้ครบ',
                        icon: 'error',
                        confirmButtonColor: '#DC3545',
                    })
                }
                Swal.fire({
                    title: 'ต้องการบันทึกหรือไม่?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#28A745',
                    cancelButtonColor: '#DC3545',
                    confirmButtonText: 'Confirm!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        var data = {
                            jwt,
                            orderId: orderData.orderId,
                            status: editStatus.status,
                            cancelMessage
                        }
                        sendData(data)
                    }
                })
                
            }
        }
    }

    const sendData = (data) => {
        const uploadPromise = new Promise(async (resolve, reject) => {
            const axiosURL = process.env.NEXT_PUBLIC_BACKEND + '/admin/updateOrder'
            axios.patch(axiosURL, data)
            .then( result => {
                getOrder()
                resolve()
            }).catch( err => {
                console.log(err)
                reject()
            })
        })

        toast.promise(uploadPromise, {
            pending: "Pending",
            success: "อัพเดตข้อมูลสำเร็จ",
            error: "อัพเดตข้อมูลไม่สำเร็จ",
        })
    }

    useEffect(() => {
        try{
            if(showPaymentDetails){
                paymentDetails.current.style.height = 25 + DetailsContent.current.clientHeight + 5 + 'px'
            } else {
                paymentDetails.current.style.height = '25px'
            }
        } catch (err){ }
    }, [showPaymentDetails])

    if(!isAdmin) {
        return (
          <div>
              <Head>
                  <title>Admin | PT Bookstore</title>
                  <meta name="description" content="Generated by create next app" />
                  <link rel="icon" href="/favicon.ico" />
              </Head>
              <div className={styles.container}>
                  <main className={styles.main}>
                      
                  </main>
              </div>
          </div>
        )
    } else
    return (
        <div className={styles.container}>
            <SideNav />
            <ToastContainer />
            <div className={styles.contentContainer}>
                <div className={styles.orderWrap}>
                    <div className={styles.header}>
                        <div className={styles.title}>Order ID {orderId}</div>
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
                                                <div>Transaction Id : {orderData.paymentDetails.omiseTransactionId}</div>
                                                <div>Charge Id : {orderData.paymentDetails.omiseChargeId}</div>
                                                <div>Total : {orderData.paymentDetails.total} บาท</div>
                                                <div>shipping Fee : {orderData.shippingFee} บาท</div>
                                                <div>Net : {orderData.paymentDetails.net - orderData.shippingFee} บาท</div>
                                                <div>Fee : {orderData.paymentDetails.fee} บาท</div>
                                                <div>Vat : {orderData.paymentDetails.fee_vat} บาท</div>
                                                <div>วันที่โอน : {dateTime.date.replaceAll('.', '/')}</div>
                                                <div>เวลา : {dateTime.time} น.  </div>
                                            </div>
                                        )
                                    }
                                    {
                                        orderData.method === 'metamask' && orderData.paymentDetails.hash !== undefined && (
                                            <div>
                                                <div>Exchange rate : {orderData.exchange_rate} Baht/USD</div>
                                                <div>Transaction Hash : 
                                                    <Link href={`https://testnet.bscscan.com/tx/${orderData.paymentDetails.hash}`}>
                                                        <a target="_blank" > {orderData.paymentDetails.hash}</a>
                                                    </Link>
                                                </div>
                                                <div>Total : {orderData.paymentDetails.total} BUSD</div>
                                                <div>shipping Fee : {orderData.shippingFee} BUSD</div>
                                                <div>Net : {orderData.paymentDetails.net - orderData.shippingFee} BUSD</div>
                                                {
                                                    orderData.paymentDetails.refund && (<>
                                                        <div>Refund : {orderData.paymentDetails.refundDetails.refundTotal} BUSD</div>
                                                        <div>Refund Hash : <Link href={`https://testnet.bscscan.com/tx/${orderData.paymentDetails.refundDetails.hash}`}>
                                                            <a target="_blank" >{orderData.paymentDetails.refundDetails.hash}</a>
                                                        </Link></div>
                                                    </>)
                                                }
                                                <div>วันที่โอน : {dateTime.date.replaceAll('.','/')}</div>
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
                    </div>
                    <div className={styles.orderStatusSelect}>สถานะ order : 
                        <div id='status-dropdown' className={`${styles.dropdownGroup}`} >
                            <div className={styles.dropdownSelection} onClick={e => showDropdownHandle(e)}><div>{editStatus.thai}</div> <RiArrowDownSLine/></div>
                            <div className={styles.dropdownList} onClick={e => changeStatusHandle(e)}>
                                <div className={styles.dropdownItem} data-value={'delivered'}>จัดส่งแล้ว</div>
                                {/* <div className={styles.dropdownItem} data-value={'paid'}>ชำระเงินแล้ว</div> */}
                                <div className={styles.dropdownItem} data-value={'cancel'}>ยกเลิก</div>
                            </div>
                        </div>
                    </div>
                    { orderData.status === 'cancel' && <div>ยกเลิกเนื่องจาก : {orderData.failure_message}</div> }
                    { orderData.status === 'delivered' && <div>Tracking Number : {orderData.trackingNumber}</div> }
                    { (orderData.status !== editStatus.status) && (editStatus.status === 'delivered') && <div className={styles.inputField}>หมายเลขพัสดุ : <input id='tracking-number' className={styles.input} autoComplete="off"/></div> }
                    { (orderData.status !== editStatus.status) && (editStatus.status === 'cancel') && <div className={styles.inputField}>สาเหตุ : <input id='cancel-message' className={styles.input} autoComplete="off"/></div> }
                    <div>
                        <div className={`${orderData.status !== editStatus.status? styles.btn : styles.btnDisable}`} onClick={saveChange}>บันทึก</div>
                    </div>
                </div>
            </div>
        </div>
    )
}