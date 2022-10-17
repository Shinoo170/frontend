import axios from "axios"
import Image from 'next/image'
import { useState, useEffect } from "react"
import { useRouter } from 'next/router'
import SideNav from 'components/admin/adminSideNavbar'
import styles from './series.module.css'
import Link from "next/link"

import SwiperItem from "components/SwiperItem"
import ProductListSM from "components/productListSM"

import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Mousewheel, Pagination } from "swiper"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"

import {HiOutlineChevronDoubleRight} from 'react-icons/hi'
import { AnalyticsS3BucketDestinationFilterSensitiveLog } from "@aws-sdk/client-s3"

export default function SpecificSeries() {
    const [ seriesId, setSeriesId ] = useState('')
    const [ productData, setProductData ] = useState({})
    const [ addProductURl, setAddProductURl] = useState('')
    const [ mangaProducts, setMangaProducts ] = useState([])
    const [ novelProducts, setNovelProducts ] = useState([])
    const [ otherProducts, setOtherProducts ] = useState([])
    const router = useRouter()

    async function getSeriesDetails(){
        const url = process.env.NEXT_PUBLIC_BACKEND + '/product/series/' + seriesId
        axios.get(url).then( (result) => {
            console.log(result.data)
            setProductData(result.data.seriesData)
            setMangaProducts(result.data.productData.manga)
            setNovelProducts(result.data.productData.novel)
            setOtherProducts(result.data.productData.other)
            setAddProductURl('/admin/product/addProduct/?seriesId=' + seriesId + '&title=' + result.data.seriesData.title)
        }).catch( (err)=> {
            console.log(err)
            axios.post('/api/getSeriesDetails', { url })
            .then( (result) => { 
                setProductData(result.data.seriesData)
                setMangaProducts(result.data.productData.manga)
                setNovelProducts(result.data.productData.novel)
                setOtherProducts(result.data.productData.other)
                setAddProductURl('/admin/product/addProduct/?seriesId=' + seriesId + '&title=' + result.data.seriesData.title)
            })
            .catch( (err) => {
                setProductData({ seriesId: 'error'})
            })
        })
    }

    const showData = (time) => {
        if(!time){
            return 0
        }
        const [d1,d2] = new Date(time).toISOString().split('T')
        return d1
    }

    useEffect( () => {
        if(router.isReady){
            setSeriesId(parseInt(router.query.seriesId))
        }
    }, [router])

    useEffect( () => {
        if(seriesId != ''){
            getSeriesDetails()
        }
    }, [seriesId])

    return (
        <div className={styles.container}>
            <SideNav />
            
            <div className={styles.contentContainer}>
                <div className={styles.productWrap}>
                    <div className={styles.detailsWrap}>
                        <div className={styles.title}> {productData.title} </div>
                        <div className={styles.flexRow}>
                            <div className={styles.imageWrap}>
                                {
                                    productData.img != undefined && <Image src={productData.img} alt='Product image' layout="fill" />
                                }
                            </div>
                            <div className={styles.detailsGroup}>
                                <div className={styles.detailText}> Series Id: {productData.seriesId} </div>
                                <div className={styles.detailText}> ผู้เขียน : {productData.author} </div>
                                <div className={styles.detailText}> สำนักพิมพ์ : {productData.publisher} </div>
                                <div className={styles.detailText}> หมวดหมู่ : {productData.genres} </div>
                                <div className={styles.detailText}> คีย์เวิร์ด : {productData.keywords} </div>
                                <div className={styles.detailText}> วันที่เพิ่ม : { showData(productData.addDate) } </div>
                                <div className={styles.detailText}> วันที่แก้ไขล่าสุด : { showData(productData.lastModify) } </div>
                            </div>
                        </div>
                        <div className={styles.descriptionText}> รายละเอียด : {productData.description} </div>
                        <div className={styles.listAllProduct}>
                            <div>ทั้งหมด { productData.products != undefined && productData.products.totalProducts} รายการ </div>
                            <Link href={addProductURl}><button> add product</button></Link>
                        </div>
                    </div>

                    {/* Novel List */}
                    { (productData.products != undefined) && (productData.products.totalNovel > 0) && (
                        <ProductListSM data={novelProducts} title='นิยาย' url={`/admin/product/${seriesId}/` }/>
                    )}
                    

                    {/* Manga List */}
                    { (productData.products != undefined) && (productData.products.totalManga > 0) && (
                        <ProductListSM data={mangaProducts} title='มังงะ' url={`/admin/product/${seriesId}/`} />
                    )}

                    {/* Manga List */}
                    { (productData.products != undefined) && (productData.products.otherProducts > 0) && (
                        <ProductListSM data={otherProducts} title='สินค้าอื่นๆ' url={`/admin/product/${seriesId}/`} />
                    )}

                </div>
            </div>
        </div>
    );
}
