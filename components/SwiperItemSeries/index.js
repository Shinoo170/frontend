import { useEffect, useState } from "react"
import Link from "next/link"
import Image from 'next/image'
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Mousewheel, Pagination } from "swiper"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"

import styles from './swiperItem.module.css'

import { TiStarHalf } from 'react-icons/ti'

export default function SwiperItemSeries(props){
    const star = [1,2,3,4,5]

    const showStar = (score, avg) => {
        const halfScore = score-0.5
        const selfScore = Math.round(avg*2)/2
        return (
            <div className={styles.fullStarGroup} key={`star-${score}`}>
                <TiStarHalf className={`${styles.starHalfLeft} ${selfScore >= halfScore? styles.starActive:''}`}/>
                <TiStarHalf className={`${styles.starHalfRight} ${selfScore >= score? styles.starActive:''} `}/>
                <div className={styles.labelGroup}>
                    <div className={styles.leftLabel}></div>
                    <div className={styles.rightLabel} ></div>
                </div>
            </div>
        )
    }

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
                                            <div className={styles.bottomGroup}>
                                                <div className={styles.starGroup}>
                                                    <div className={styles.tooltip}>{element.score.avg > 0? element.score.avg:'No review'}</div>
                                                    { star.map(e => showStar(e,element.score.avg)) }
                                                </div>
                                                <button className={styles.btn}>
                                                    <div className={styles.text}>Details</div>
                                                </button>
                                            </div>
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