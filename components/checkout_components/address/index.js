import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import styles from './address.module.css'
import axios from 'axios'

import { checkoutContext } from 'pages/checkout'

import { BsPlusCircle } from 'react-icons/bs'

export default function SelectAddress(props){
    const [ userData, setUserData ] = useState({ address:[], tel:'' })
    const [ selectIndex, setSelectIndex ] = useState(0)
    const { selectAddress, setSelectAddress } = useContext(checkoutContext)

    useEffect(() => {
        getData()
    }, [])

    const getData = () => {
        const url = process.env.NEXT_PUBLIC_BACKEND + '/user/getUserAddress'
        axios.get(url, { headers: { jwt: localStorage.getItem('jwt')} } )
        .then(result => {
            setUserData(result.data)
        })
    }

    const setIndexAddress = (e , index) => {
        var address = e
        address.firstName = userData.firstName
        address.lastName = userData.lastName
        address.email = userData.email
        address.tel = userData.tel
        setSelectAddress(address)
        setSelectIndex(index)
    }

    return (
        <div className={styles.container}>
            <div className={styles.section}>
                <div className={styles.label}>ข้อมูลลูกค้า</div>
                <div style={{padding: '10px 0'}}>
                    <div>ชื่อ-นามสกุล : {userData.firstName} {userData.lastName}</div>
                    <div>อีเมล : {userData.email}</div>
                    {/* <div>เบอร์โทร : {userData.tel} </div> */}
                    <div>เบอร์โทร : {userData.tel.slice(0,3) + '-' + userData.tel.slice(3,6) + '-' + userData.tel.slice(6)} </div>
                </div>
                <div className={styles.label}>เลือกที่อยู่จัดส่ง</div>
                <div className={styles.addressContainer}>
                    {
                        userData.address.map((element, index) => {
                            return (
                                <div key={`address-${index}`} className={`${styles.addressItem} ${selectIndex===index? styles.addressSelect:''}`} onClick={() => setIndexAddress(element, index)} >
                                    <div className={styles.checkbox}>
                                        <input type="checkbox" id={`address-${index}`} checked={selectIndex===index}/>
                                        <label ></label>
                                    </div>
                                    <div className={styles.detail}>
                                        <div className={styles.title}>{element.Name}</div>
                                        <div>{element.address} ต.{element.subdistrict} อ.{element.district} จ.{element.province} {element.zipCode} ประเทศ{element.country}</div>
                                    </div>
                                </div>
                            )
                        })
                    }
                    <div className={`${styles.addressItem}`} >
                        <Link href='/user'><a target="_blank" style={{width: '100%'}}>
                            <div className={styles.center}>
                                <div className={styles.addIcon}><BsPlusCircle /></div>
                                <div>เพิ่มที่อยู่</div>
                            </div>
                        </a></Link>
                    </div> 

                </div>
            </div>
        </div>
    )
}