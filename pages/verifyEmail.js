import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import axios from 'axios'
import {useRouter} from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import Header from 'components/header'
import Swal from 'sweetalert2'
import styles from '../styles/Verify.module.css'

import { GiCheckMark } from 'react-icons/gi'
import { IoCloseOutline } from 'react-icons/io5'

export default function VerifyEmail(){
    const router = useRouter()
    const [ state, setState ] = useState('checking')
    const [ err_message, set_err_message ] = useState('')

    useEffect(() => {
        if(router.isReady){
            const url = process.env.NEXT_PUBLIC_BACKEND + '/auth/verifyEmail'
            axios.post(url, { token: router.query.token})
            .then(result => {
                console.log(result.data)
                setState('verify')
            }).catch(err => {
                console.log(err.response)
                setState(err.response.data.code)
                set_err_message(err.response.data.thai_message)
            })
        }
    }, [router])
    return (
        <div>
            <Head>
                <title>Verify email | PT Bookstore</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            <div className={styles.container}>
                <main className={styles.main}>
                    { state === 'checking' && 
                        <div className={styles.flexCenter}>
                            <div className={styles.ldsRing}><div></div><div></div><div></div><div></div></div>
                            <div className={styles.label}>กำลังตรวจสอบ</div>
                        </div>
                    }
                    {
                        state === 'verify' &&
                        <div className={styles.flexCenter}>
                            <div className={styles.iconSuccess}><GiCheckMark /></div>
                            <div className={styles.label}>ยืนยันอีเมลสำเร็จแล้ว</div>
                            <div className={styles.link}><Link href='/'><a>กลับหน้าหลัก</a></Link></div>
                        </div>
                    }
                    {
                        state === 'already_verify' &&
                        <div className={styles.flexCenter}>
                            <div className={styles.iconSuccess}><GiCheckMark /></div>
                            <div className={styles.label}>{err_message}</div>
                            <div className={styles.link}><Link href='/'><a>กลับหน้าหลัก</a></Link></div>
                        </div>
                    }
                    {
                        state === 'invalid_token' &&
                        <div className={styles.flexCenter}>
                            <div className={styles.iconError}><IoCloseOutline /></div>
                            <div className={styles.label}>{err_message}</div>
                            <div className={styles.link}><Link href='/'><a>กลับหน้าหลัก</a></Link></div>
                        </div>
                    }
                </main>
            </div>
        </div>
    )
}