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
import { IoBookmarkOutline, IoBookmark, IoShareOutline } from 'react-icons/io5'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function Products(){
    const router = useRouter()
    const [ seriesData, setSeriesData ] = useState({products:{}, score:{ avg: 0 }, state:'init'})
    const [ productsData, setProductsData ] = useState({manga:[], novel:[], other:[]})
    const [ viewMore, setViewMore ] = useState('hide')
    const [ filter, setFilter ] = useState('overview')
    const [ allManga, setAllManga ] = useState()
    const [ allNovel, setAllNovel ] = useState()
    const [ allOther, setAllOther ] = useState()
    const [ isBookmark, setIsBookmark ] = useState(false)

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
                getBookmark()
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
    
    const SwiperProduct = (category, title, total) => {
        var data = {}
        if(category === 'Novel') {
            data = productsData.novel
        }
        if(category === 'Manga') {
            data = productsData.manga
        }
        if(category === 'Other') {
            data = productsData.other
        }
        return (
            <div className={styles.listProduct}>
                <div className={styles.top}>
                    <div><span className={styles.label}>{title}</span> ( {total} รายการ)</div>
                    <Link href={`/series/${router.query.seriesId}?category=${category}`}><a>ดูเพิ่มเติม <RiArrowRightSLine /></a></Link>
                </div>
                <div className={styles.swiperContainer}>
                    <SwiperItem data={data} href={`/series/${router.query.seriesId}`} seriesId={router.query.seriesId}/>
                </div>
            </div>
        )
    }

    const getBookmark = () => {
        const jwt = localStorage.getItem('jwt')
        if(!jwt){ return }
        const url = process.env.NEXT_PUBLIC_BACKEND + '/product/subscribe?seriesId=' + router.query.seriesId
        axios.get(url, {
            headers: {
                jwt
            }
        })
        .then(result => {
            setIsBookmark(result.data)
        })
    }

    const addNewBookmark = () => {
        const jwt = localStorage.getItem('jwt')
        if(!jwt){
            return toast.error('กรุณาล็อกอิน', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            })
        }
        const url = process.env.NEXT_PUBLIC_BACKEND + '/product/subscribe?seriesId=' + router.query.seriesId
        axios.put(url, {
            jwt
        })
        .then(result => {
            setIsBookmark(result.data)
        })
    }

    const deleteBookmark = () => {
        const jwt = localStorage.getItem('jwt')
        if(!jwt){
            return toast.error('กรุณาล็อกอิน', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            })
        }
        const url = process.env.NEXT_PUBLIC_BACKEND + '/product/subscribe?seriesId=' + router.query.seriesId
        axios.delete(url, {
            headers: {
                jwt
            }
        })
        .then(result => {
            setIsBookmark(result.data)
        })
    }

    return (
        <div>
            <Head>
                <title>PT Bookstore</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            <ToastContainer /> 
            <div className={styles.container}>
                <main className={styles.main}>
                    <div className={styles.detailContainer}>
                        <div className={styles.title}>{seriesData.title}</div>
                        <div className={styles.flex}>
                            <div className={styles.image}>
                                {/* <img src={seriesData.img} /> */}
                                <div className={styles.imageControl}>
                                { seriesData.img? <Image src={seriesData.img} alt='img' layout='fill' objectFit='cover' /> :<div className={`${styles.imgLoading} ${styles.loading}`}></div> }
                                </div>
                                <div className={styles.iconContainer}>
                                    {
                                        !isBookmark && (
                                            <div className={styles.item} onClick={e => addNewBookmark()}>
                                                <div className={styles.icon}><IoBookmarkOutline /></div>
                                                <div className={styles.label}>ติดตาม</div>
                                            </div>
                                        )
                                    }
                                    {
                                        isBookmark && (
                                            <div className={styles.item} onClick={e => deleteBookmark()}>
                                                <div className={styles.iconYellow}><IoBookmark /></div>
                                                <div className={styles.label}>ติดตาม</div>
                                            </div>
                                        )
                                    }
                                    <div className={styles.item}>
                                        <div className={styles.icon}><IoShareOutline /></div>
                                        <div className={styles.label}>แชร์</div>
                                    </div>
                                </div>
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
                        { filter==='overview' && productsData.novel.length !== 0 && SwiperProduct('Novel','นิยาย', seriesData.products.totalNovel) }
                        { filter==='overview' && productsData.manga.length !== 0 && SwiperProduct('Manga','มังงะ', seriesData.products.totalManga) }
                        { filter==='overview' && productsData.other.length !== 0 && SwiperProduct('Other','สินค้าอื่นๆ', seriesData.products.totalOther) }
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