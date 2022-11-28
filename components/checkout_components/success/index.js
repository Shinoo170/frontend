import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import styles from './success.module.css'

import { GiCheckMark } from 'react-icons/gi'

import { checkoutContext } from 'pages/checkout'

export default function PlaceOrderSuccess(props){
    const { orderResult } = useContext(checkoutContext)

    return (
        <div className={styles.container}>
            <div className={styles.section}>
                <div className={styles.successIcon}><GiCheckMark /></div>
                <div className={styles.label}>สั่งซื้อสำเร็จแล้ว</div>
                <Link href={`/user/orders/${orderResult.orderId}`}><a><div className={styles.link}>กดเพื่อดูรายละเอียด</div></a></Link>
            </div>
        </div>
    )
}