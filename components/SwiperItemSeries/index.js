import { useEffect, useState } from "react"
import Link from "next/link"
import Image from 'next/image'
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Mousewheel, Pagination } from "swiper"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"

import styles from './swiperItem.module.css'


export default function SwiperItemSeries(props){
    return (
        <>
            <Swiper
                slidesPerView={'auto'}
                spaceBetween={15}
                freeMode={true}
                modules={[FreeMode]}
                className={styles.productList}
            >
                {
                    props.data.map( (element, index) => {
                        return ( 
                            <SwiperSlide key={`item-series-${index}`} className={styles.mySwiperSlide}>
                                <div className={styles.itemContainer}>
                                        <div className={styles.item}>
                                            <Link href={`/series/${element.seriesId}`}>
                                                <a>
                                                    <div className={styles.imageContainer}>
                                                        <div className={styles.image}>
                                                            <Image src={element.img} alt='img' layout='fill' objectFit='cover' />
                                                        </div>
                                                    </div>
                                                    <div className={styles.title}>{element.title}</div>
                                                </a>
                                            </Link>
                                            <button className={styles.btn}>
                                                <div className={styles.text}>Details</div>
                                            </button>
                                        </div>
                                </div>
                            </SwiperSlide>
                        )
                    })
                }
            </Swiper>
        </>
    )
}