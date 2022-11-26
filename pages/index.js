import { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Header from '../components/header'
import axios from 'axios'
import SwiperItem from 'components/SwiperItem'

import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation } from "swiper"
import "swiper/css"
import "swiper/css/navigation"

export default function Home() {
  const [ latestProduct, setLatestProduct ] = useState([])
  const [ mostSoldProduct, setMostSoldProduct ] = useState([])

  function getData(){
    var url = process.env.NEXT_PUBLIC_BACKEND + '/product/latestProduct'
    var url2 = process.env.NEXT_PUBLIC_BACKEND + '/product/mostSoldProduct'
    axios.get(url).then( result => {
      setLatestProduct(result.data)
    }).catch( err => { })

    axios.get(url2).then( result => {
      setMostSoldProduct(result.data)
    }).catch( err => { })

  }

  useEffect( () => {
    getData()
  }, [])

  return (
    <div>
      <Head>
        <title>PT Bookstore</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div className={styles.container}>
        
        <main className={styles.main}>
          <div className={styles.bannerContainer}>
            <Swiper 
              navigation={true} 
              modules={[Autoplay, Navigation]} 
              centeredSlides={true}
              spaceBetween={1}
              slidesPerView={'auto'}
              loop={true}
              autoplay={{delay:5000, disableOnInteraction: false,}}
              className={styles.banner}
            >
              <SwiperSlide><div className={styles.image}><img src='/banner/LN_1.png'/></div></SwiperSlide>
              <SwiperSlide><div className={styles.image}><img src='/banner/LN_2.png'/></div></SwiperSlide>
              <SwiperSlide><div className={styles.image}><img src='/banner/LN_3.png'/></div></SwiperSlide>
              <SwiperSlide><div className={styles.image}><img src='/banner/LN_4.jpg'/></div></SwiperSlide>
            </Swiper>
          </div>
          <div className={styles.swiperContainer}>
            <div className={styles.title}>วางจำหน่ายล่าสุด</div>
            { latestProduct && <SwiperItem data={latestProduct} href={'/product'}/> }
          </div>
          <div className={styles.swiperContainer}>
            <div className={styles.title}>ขายดี</div>
            { latestProduct && <SwiperItem data={mostSoldProduct} href={'/product'}/> }
          </div>
        </main>

        <footer className={styles.footer}>

        </footer>
      </div>
    </div>
  )
}
