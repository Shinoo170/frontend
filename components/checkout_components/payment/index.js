import { useState, useEffect, useContext, useRef } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import styles from './payment.module.css'

import { checkoutContext } from 'pages/checkout'

export default function PaymentMethod(props){
    const { cart, paymentMethod, setPaymentMethod, cryptoCoinSelect, setCryptoCoinSelect} = useContext(checkoutContext)
    const crypto_selection = useRef()
    const crypto_details = useRef()

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

    useEffect(() => {
        try{
            if(paymentMethod === 'metamask'){
                crypto_selection.current.style.height = crypto_selection.current.clientHeight + crypto_details.current.clientHeight + 40 + 'px'
            } else {
                crypto_selection.current.style.height = '0px'
            }
        } catch (err){ }
    }, [paymentMethod])

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
                                <div className={styles.image}><Image src='/payment/bsc_chain.png' alt='img' layout='fill' objectFit='contain' /></div>
                            </div>
                            <div className={styles.title}>MeteMask</div>
                        </div>
                        <div className={styles.dummy}></div>
                    </div>
                </div>
            </div>

            <div ref={crypto_selection} className={`${styles.section} ${paymentMethod !== 'metamask'? styles.hide:''}`}>
                <div ref={crypto_details} className={`${styles.metamaskSection} ${paymentMethod !== 'metamask'? styles.detailsHide:''}`}>
                    <div className={`${styles.cardContainer} ${cryptoCoinSelect==='BUSD'? styles.select:''}`} onClick={() => setCryptoCoinSelect('BUSD')}>
                        <div className={styles.image}><Image src='/payment/busd_coin.png' alt='img' layout='fill' objectFit='contain' /></div>
                        BUSD
                    </div>
                    <div className={`${styles.cardContainer} ${cryptoCoinSelect==='ETH'? styles.select:''}`} onClick={() => setCryptoCoinSelect('ETH')}>
                        <div className={styles.image}><Image src='/payment/eth_coin.png' alt='img' layout='fill' objectFit='contain' /></div>
                        ETH
                    </div>
                    <div className={`${styles.cardContainer} ${cryptoCoinSelect==='BTC'? styles.select:''}`} onClick={() => setCryptoCoinSelect('BTC')}>
                        <div className={styles.image}><Image src='/payment/bnb_coin.png' alt='img' layout='fill' objectFit='contain' /></div>
                        BTC
                    </div>
                </div>
            </div>

        </div>
    )
}