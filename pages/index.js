import { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Header from '../components/header'
import axios from 'axios'
import SwiperItem from 'components/SwiperItem'

export default function Home() {
  const [ latestProduct, setLatestProduct ] = useState()

  function getData(){
    var url = process.env.NEXT_PUBLIC_BACKEND + '/product/latestProduct'
    axios.get(url).then( result => {
      setLatestProduct(result.data.data)
    }).catch( err => {

    })
  }

  useEffect( () => {
    getData()
  }, [])

  return (
    <div>
      <Head>
        <title>PT Bookshop</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div className={styles.container}>
        
        <main className={styles.main}>
          <div className={styles.swiperContainer}>
            วางจำหน่ายล่าสุด
            { latestProduct && <SwiperItem data={latestProduct} href={'/product'}/> }
          </div>
          <div className={styles.swiperContainer}>
            ขายดี
            { latestProduct && <SwiperItem data={latestProduct} href={'/product'}/> }
          </div>
        </main>

        <footer className={styles.footer}>

        </footer>
      </div>
    </div>
  )
}
