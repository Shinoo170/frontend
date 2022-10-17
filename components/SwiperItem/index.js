import Link from "next/link"
import Image from 'next/image'
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Mousewheel, Pagination } from "swiper"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"

import styles from './swiperItem.module.css'

export default function SwiperItem(prop){

    return (
        <Swiper
            slidesPerView={'auto'}
            spaceBetween={15}
            freeMode={true}
            modules={[FreeMode]}
            className={styles.productList}
        >
            {
                prop.data.map( (element, index) => {
                    return ( 
                        <SwiperSlide key={`item-novel-${index}`} className={styles.mySwiperSlide}>
                            <div className={styles.itemContainer}>
                                <Link href={`${prop.href}/${element.url}`}>
                                    <div className={styles.item}>
                                        <div className={styles.image}>
                                            <Image src={element.img[0]} alt='img' layout='fill' objectFit='contain' />
                                        </div>
                                        <div className={styles.title}>{element.title}</div>
                                        <button className={styles.btn}> {element.price} $ </button>
                                    </div>
                                </Link>
                            </div>
                        </SwiperSlide>
                    )
                })
            }
        </Swiper>
    )
}