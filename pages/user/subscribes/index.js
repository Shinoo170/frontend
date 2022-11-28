import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import axios from 'axios'
import styles from './subscribes.module.css'
import Header from 'components/header'
import SideNavBar from 'components/user/sideNavbar'
import SeriesList from 'components/seriesList'

export default function Subscribes() {
    const [ isLogin, setIsLogin ] = useState(false)
    const router = useRouter()
    const [ subscribes, setSubscribes ] = useState([])

    useEffect(() => {
        if(localStorage.getItem('jwt')){
            setIsLogin(true)
            getData()
        } else {
            router.push({pathname: '/', query:{ } }, undefined,{ shallow: false } )
        }
    }, [])

    const getData = () => {
        const url = process.env.NEXT_PUBLIC_BACKEND + '/user/getSubscribes'
        axios.get(url, {
            headers: { jwt: localStorage.getItem('jwt')}
        })
        .then(result => {
            console.log(result.data)
            setSubscribes(result.data)
        })
    }

    if(!isLogin) {
        return (
            <div>
                <Head>
                    <title>Subscribes | PT Bookstore</title>
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
                    <title>Subscribes | PT Bookstore</title>
                    <meta name="description" content="Generated by create next app" />
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <Header />
                <div className={styles.container}>
                    
                    <main className={styles.main}>
                        <SideNavBar />
                        <div className={styles.screen} >
                            <center><div className={styles.title}>รายการที่ติดตาม</div></center>
                            <div>
                                { (subscribes[0] != undefined) && <SeriesList data={subscribes} revert={false} maxPerPage='10' href='/series/'/> }
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        )
    }
}