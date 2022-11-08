import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import styles from './payment.module.css'

import { checkoutContext } from 'pages/checkout'

export default function PaymentMethod(props){
    const { cart, paymentMethod, setPaymentMethod} = useContext(checkoutContext)

    const paymentMethodHandle = (e) => {
        setPaymentMethod(e)
        if(e === 'credit_card'){
            document.getElementById('select_credit_card').checked = true
            document.getElementById('select_metamask').checked = false
        } else {
            document.getElementById('select_credit_card').checked = false
            document.getElementById('select_metamask').checked = true
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.section}>
                <div className={styles.label}>ช่องทางชำระเงิน</div>
                <div className={styles.paymentContainer}>
                    <div className={`${styles.method} ${paymentMethod==='credit_card'? styles.select:''}`} onClick={e => paymentMethodHandle('credit_card')}>
                        <div className={styles.checkbox}>
                            <input type="checkbox" id='select_credit_card' defaultChecked/>
                            <label ></label>
                        </div>
                        <div className={styles.detail}>
                            <div className={styles.logo}>
                                <div className={styles.image}><Image src='/payment/visa.png' alt='img' layout='fill' objectFit='contain' /></div>
                                <div className={styles.image}><Image src='/payment/mastercard.png' alt='img' layout='fill' objectFit='contain' /></div>
                            </div>
                            <div className={styles.title}>Credit Card</div>
                        </div>
                        <div className={styles.dummy}></div>
                    </div>
                    <div className={`${styles.method} ${paymentMethod==='metamask'? styles.select:''}`} onClick={e => paymentMethodHandle('metamask')}>
                        <div className={styles.checkbox}>
                            <input type="checkbox" id='select_metamask' />
                            <label ></label>
                        </div>
                        <div className={styles.detail}>
                            <div className={styles.logo}>
                                <div className={styles.image_sm}><Image src='/payment/metamask.png' alt='img' layout='fill' objectFit='contain' /></div>
                                <div className={styles.image}><Image src='/payment/busd_2.png' alt='img' layout='fill' objectFit='contain' /></div>
                            </div>
                            <div className={styles.title}>MeteMask</div>
                        </div>
                        <div className={styles.dummy}></div>
                    </div>
                </div>
            </div>

            {/* <div className={`${styles.section} ${paymentMethod !== 'credit_card'? styles.hide:''}`}>
                <div className={styles.cardContainer}>
                    Card 1
                </div>
            </div> */}
        </div>
    )
}