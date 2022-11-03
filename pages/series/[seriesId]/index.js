import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Router from 'next/router'
import Head from 'next/head'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import Header from 'components/header'
import styles from './seriesDetails.module.css'
import SwiperItem from 'components/SwiperItem'
import ProductListMD from 'components/productListMD'

import { RiArrowRightSLine } from 'react-icons/ri'

export default function Products(){
    const router = useRouter()
    const [ seriesData, setSeriesData ] = useState({products:{}, score:{avg:0}, state:'init'})
    const [ productsData, setProductsData ] = useState({manga:[], novel:[], other:[]})
    const [ viewMore, setViewMore ] = useState('hide')
    const [ filter, setFilter ] = useState('overview')
    const [ allManga, setAllManga ] = useState()
    const [ allNovel, setAllNovel ] = useState()
    const [ allOther, setAllOther ] = useState()

    useEffect(() => {
        if(router.isReady){
            const category = router.query.category
            const url = process.env.NEXT_PUBLIC_BACKEND + '/product/series/' + router.query.seriesId
            if(seriesData.state === 'init'){
                axios.get(url)
                .then( result => {
                    console.log(result.data)
                    setSeriesData(result.data.seriesData)
                    setProductsData(result.data.productData)
                }).catch( err => {
                    console.log("Error to get data, using next API")
                    axios.post('/api/getSeriesDetails', { url }).then( result => {
                        setSeriesData(result.data.seriesData)
                        setProductsData(result.data.productData)
                    })
                })
            }
            if(category){
                setFilter(category)
                if(category === 'Novel' && allNovel===undefined) getProductByCategory(category)
                else if(category === 'Manga' && allManga===undefined) getProductByCategory(category)
                else if(category === 'Other' && allOther===undefined) getProductByCategory(category)
            } else {
                setFilter('overview')
            }
        }
    },[router])

    useEffect(() => {
        var lines = document.getElementById('description').offsetHeight / 22
        if(lines > 7) setViewMore('More')
    }, [productsData])

    const getProductByCategory = (category) => {
        const url = process.env.NEXT_PUBLIC_BACKEND + '/product/productInSeries?seriesId=' + router.query.seriesId + '&category=' + category
        axios.get(url)
        .then( result => {
            console.log(result.data)
            if(category === 'Novel') setAllNovel(result.data)
            else if(category === 'Manga') setAllManga(result.data)
            else if(category === 'Other') setAllOther(result.data)
        }).catch(err => {
            axios.post('/api/getProductInSeries', {url}).then(result => {
                if(category === 'Novel') setAllNovel(result.data)
                else if(category === 'Manga') setAllManga(result.data)
                else if(category === 'Other') setAllOther(result.data)
            })
        })
    }

    const viewMoreHandle = () => {
        setViewMore(current => {
            if(current === 'More') return current = 'Less'
            else return current = 'More'
        })
    }

    const SwiperProduct = (category, title) => {
        var data = {}
        if(category === 'Novel') {
            data = productsData.novel
            data[0].category = 'นิยาย'
        }
        if(category === 'Manga') {
            data = productsData.manga
            data[0].category = 'มังงะ'
        }
        if(category === 'Other') {
            data = productsData.other
            data[0].category = 'สินค้า'
        }
        return (
            <div className={styles.listProduct}>
                <div className={styles.top}>
                    <div className={styles.label}>{title}</div>
                    <Link href={`/series/${router.query.seriesId}?category=${category}`}><a>ดูเพิ่มเติม <RiArrowRightSLine /></a></Link>
                </div>
                <div className={styles.swiperContainer}>
                    <SwiperItem data={data} href={`/series/${router.query.seriesId}`} seriesId={router.query.seriesId}/>
                </div>
            </div>
        )
    }

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
                    <div className={styles.detailContainer}>
                        <div className={styles.title}>{seriesData.title}</div>
                        <div className={styles.flex}>
                            <div className={styles.image}>
                                <img src={seriesData.img} />
                            </div>
                            <div className={styles.detailFlex}>
                                <div className={styles.description}>
                                    <p style={{fontSize: '17px'}}><b>เรื่องย่อ : </b></p>
                                    <div id='description' className={viewMore==='More'? styles.lineClamp8:''}>
                                        {seriesData.description}
                                    </div>
                                    <div className={viewMore!=='hide'? styles.viewMore:styles.hide} onClick={viewMoreHandle}>{viewMore}</div>
                                </div>
                                <div className={styles.detailsGroup}>
                                    <p style={{fontSize: '17px'}}><b>ข้อมูลซีรี่ย์ : </b></p>
                                    <div className={styles.subDetail}>
                                        <div className={styles.detailTitle}>Author :</div>
                                        <div className={styles.detailValue}>{seriesData.author}</div>
                                    </div>
                                    <div className={styles.subDetail}>
                                        <div className={styles.detailTitle}>Illustrator :</div>
                                        <div className={styles.detailValue}>{seriesData.illustrator}</div>
                                    </div>  
                                    <div className={styles.subDetail}>
                                        <div className={styles.detailTitle}>publisher :</div>
                                        <div className={styles.detailValue}>{seriesData.publisher}</div>
                                    </div>                   
                                    <div className={styles.subDetail}>
                                        <div className={styles.detailTitle}>avg. score  :</div>
                                        <div className={styles.detailValue}>{seriesData.score.avg}</div>
                                    </div> 
                                    <div className={styles.subDetail}>
                                        <div className={styles.detailTitle}>Genres :</div>
                                        <div className={styles.detailValue}>
                                            <div className={styles.genresGroup}>
                                            {
                                                seriesData.genres && seriesData.genres.sort().map( (element,index) => {
                                                    var filter = element.charAt(0).toUpperCase() + element.slice(1)
                                                    return (
                                                        <div key={`genres-${index}`} className={styles.item}>
                                                            <Link href={`/products?genres=${filter}`}>
                                                                <a>{element}</a>
                                                            </Link>
                                                        </div>
                                                    )
                                                })
                                            }
                                            </div>
                                        </div>
                                    </div>  

                                </div>
                            </div>
                        </div>
                        
                        <hr/>
                        {
                            // seriesData.products && <div>สินค้าทั้งหมด {seriesData.products.totalProducts}</div>
                        }
                        { filter==='overview' && productsData.novel.length !== 0 && SwiperProduct('Novel','นิยาย') }
                        { filter==='overview' && productsData.manga.length !== 0 && SwiperProduct('Manga','มังงะ') }
                        { filter==='overview' && productsData.other.length !== 0 && SwiperProduct('Other','สินค้าอื่นๆ') }
                        { (seriesData.products.totalProducts === 0) && <div>No Product</div> }
                        { filter==='Novel' && allNovel!==undefined && <ProductListMD data={allNovel} title={'นิยาย'}></ProductListMD>}
                        { filter==='Manga' && allManga!==undefined && <ProductListMD data={allManga} title={'มังงะ'}></ProductListMD>}
                        { filter==='Other' && allOther!==undefined && <ProductListMD data={allOther} title={'สินค้าอื่นๆ'}></ProductListMD>}
                    </div>
                </main>
            </div>
        </div>
    )
}