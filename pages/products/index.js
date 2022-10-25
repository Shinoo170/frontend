import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Router from 'next/router'
import Head from 'next/head'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import Header from 'components/header'
import ProductList from 'components/productList'
import styles from './products.module.css'

import { AiFillStar } from 'react-icons/ai'
import { TiStar, TiStarHalf } from 'react-icons/ti'

export default function Products(){
    const router = useRouter()
    // Filter
    const [ genres, setGenres ] = useState([])
    const [ starHover, setStarHover] = useState(0)
    const [ starSelect, setStarSelect] = useState(0)
    const star = [1,2,3,4,5]
    const [ filterGenres, setFilterGenres ] = useState([])
    const [ filterMatch, setFilterMatch ] = useState()
    const [ filterType, setFilterType ] = useState()
    const [ filterPrice, setFilterPrice ] = useState()
    const [ filterScore, setFilterScore ] = useState()
    const [ showFilter, setShowFilter ] = useState(false)
    // Product
    const [ allProduct, setAllProduct ] = useState([])
    const [ filterProduct, setFilterProduct ] = useState([])
    const [ listProduct, setListProduct ] = useState([])
    const [ currentPage, setCurrentPage ] = useState()
    const [ Max_Product_Per_Page, setMax_Product_Per_Page ] = useState(10)
    const [ maxPage, setMaxPage ] = useState(0)

    const getProducts = () => {
        const url = process.env.NEXT_PUBLIC_BACKEND + '/product/latestSeries'
        axios.get(url)
        .then( result => {
            console.log(result.data)
            setAllProduct(result.data)
        }).catch( err => {
            axios.get('/api/getAllSeries').then(result => setAllProduct(result.data))
        })
    }
    const getGenres = () => {
        const axiosURL = process.env.NEXT_PUBLIC_BACKEND + '/product/genres'
        axios.get(axiosURL)
        .then( result => {
            setGenres(result.data)
        }).catch( err => {
            console.log(err)
        })
    }
    const showStar = (score) => {
        const halfScore = score-0.5
        return (
            <div className={styles.fullStarGroup} key={`star-${score}`}>
                <TiStarHalf className={`${styles.starHalfLeft} ${starHover>=halfScore? styles.starHover:''}`}/>
                <TiStarHalf className={`${styles.starHalfRight} ${starHover>=score? styles.starHover:''}`}/>
                <div className={styles.labelGroup}>
                    <div className={styles.leftLabel} onClick={e => setStarSelect(halfScore)} onMouseEnter={e => setStarHover(halfScore)} onMouseLeave={e => setStarHover(starSelect)}></div>
                    <div className={styles.rightLabel} onClick={e => setStarSelect(score)} onMouseEnter={e => setStarHover(score)} onMouseLeave={e => setStarHover(starSelect)}></div>
                </div>
            </div>
        )
    }
    useEffect(() => {
        getProducts()
        getGenres()
    }, [])
    useEffect(() => {
        setMaxPage( Math.ceil(allProduct.length/Max_Product_Per_Page))
    },[allProduct])
    useEffect(() => {
        const arr = []
        var start = currentPage*Max_Product_Per_Page - Max_Product_Per_Page
        var stop = currentPage*Max_Product_Per_Page
        if( stop > allProduct.length ){
            stop = allProduct.length
        }
        for(let i = start; i<stop; i++){
            arr.push(allProduct[i])
        }
        setListProduct(arr)
    }, [currentPage, maxPage])

    useEffect(() => {
        if(router.isReady){
            const query = router.query
            console.log("Router query : ")
            console.log(router.query)
            query.page? setCurrentPage(query.page) : setCurrentPage(1) 
            Array.isArray(query.genres)? setFilterGenres(query.genres) : query.genres? setFilterGenres([query.genres]):setFilterGenres([])
            // "query.genres?" mean "query.genres" is not unified?"
            setFilterMatch(query.match)
            setFilterPrice(query.price)
            setFilterType(query.type)
        }
    },[router])

    // useEffect(() => {
    //     var str = '/products'
    //     if(filterGenres.length != 0) str += '?'
    //     filterGenres.forEach( (element, index) => {
    //         if(element) str += 'genres=' + element
    //         if(index < filterGenres.length-1) str += '&'
    //     })
    //     window.history.replaceState({}, '', str);
    // },[filterGenres])

    useEffect(() => {
        setStarHover(starSelect)
    },[starSelect])

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
                    <div className={`${styles.sideBar} ${showFilter? styles.show:''}`}>
                        <div className={styles.item}>
                            <div onClick={e => setShowFilter(!showFilter)}>Filter</div>
                            <div className={styles.title}>ตัวเลือกการค้นหา</div>
                            <div className={styles.buttonGroup}>
                                <button>ค่าเริ่มต้น</button>
                                <button>เฉพาะที่เลือก</button>
                                <button>อย่างใดอย่างหนึ่ง</button>
                            </div>
                            <hr/>
                            <div className={styles.title}>ประเภทหนังสือ</div>
                            <div className={styles.selector}>
                                {
                                    genres.map((element, index) => {
                                        const handle = (e) => {
                                            if(e.target.id != element){
                                                document.getElementById(element).checked = !document.getElementById(element).checked;   
                                            }
                                            if(document.getElementById(element).checked){
                                                setFilterGenres([...filterGenres, element])
                                            }else{
                                                setFilterGenres(filterGenres.filter(item => item != element))
                                            }
                                        }
                                        return (
                                            <div className={styles.subItem} key={`genres-${index}`} onClick={e => handle(e)} >
                                                {
                                                    filterGenres.indexOf(element)!= -1? 
                                                    <input id={element} className={styles.checkmark} type='checkbox' defaultChecked />:
                                                    <input id={element} className={styles.checkmark} type='checkbox' />
                                                }
                                                <label>{element}</label>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            <hr/>
                            <div className={styles.title}>ตัวเลือกการค้นหา</div>
                            <div className={styles.buttonGroup}>
                                <button>ทั้งหมด</button>
                                <button>นิยาย</button>
                                <button>มังงะ</button>
                                <button>สินค้าอื่นๆ</button>
                            </div>
                        </div>
                        <div className={styles.item}>
                            <div className={styles.title}>ราคา</div>
                            <div className={styles.row}>
                                <input className={styles.priceInput} type='number'/>
                                -
                                <input className={styles.priceInput} type='number'/>
                            </div>

                            <div className={styles.title}>คะแนน</div>
                            {/* <div className={styles.starGroup}>
                                <div className={`${styles.star} ${starHover>=1? styles.starHover:''}`} onClick={e => setStarSelect(1)} onMouseEnter={e => setStarHover(1)} onMouseLeave={e => setStarHover(starSelect)}><AiFillStar /></div>
                                <div className={`${styles.star} ${starHover>=2? styles.starHover:''}`} onClick={e => setStarSelect(2)} onMouseEnter={e => setStarHover(2)} onMouseLeave={e => setStarHover(starSelect)}><AiFillStar /></div>
                                <div className={`${styles.star} ${starHover>=3? styles.starHover:''}`} onClick={e => setStarSelect(3)} onMouseEnter={e => setStarHover(3)} onMouseLeave={e => setStarHover(starSelect)}><AiFillStar /></div>
                                <div className={`${styles.star} ${starHover>=4? styles.starHover:''}`} onClick={e => setStarSelect(4)} onMouseEnter={e => setStarHover(4)} onMouseLeave={e => setStarHover(starSelect)}><AiFillStar /></div>
                                <div className={`${styles.star} ${starHover>=5? styles.starHover:''}`} onClick={e => setStarSelect(5)} onMouseEnter={e => setStarHover(5)} onMouseLeave={e => setStarHover(starSelect)}><AiFillStar /></div>
                            </div> */}
                            <div className={styles.starGroup}>
                                { star.map(e => showStar(e)) }
                            </div>
                            <button onClick={e => setStarSelect(0)}>Reset</button>
                        </div>
                        <div className={styles.dummyItem}></div>
                    </div>
                    <div className={styles.listProducts}>
                        <div onClick={e => setShowFilter(!showFilter)}>Filter</div>
                        สินค้า
                        <div className={styles.productContainer}>
                            { (listProduct[0] != undefined) && <ProductList data={allProduct} currentPage='1' maxPerPage='10'/> }
                        </div>
                    </div>
                </main>
                <footer className={styles.footer}>

                </footer>
            </div>
        </div>
    )
}