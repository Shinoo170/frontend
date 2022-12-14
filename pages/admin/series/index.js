import { useState, useEffect, useRef } from 'react'
import Router, { useRouter } from 'next/router'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'

import SideNav from 'components/admin/adminSideNavbar'

import styles from './product.module.css'
import { FiChevronLeft,FiChevronRight } from 'react-icons/fi'

export default function ProductPage(){
    const router = useRouter()
    const [ listProduct, setListProduct ] = useState([])
    const [ search, setSearch ] = useState([])
    const [ allProduct, setAllProduct ] = useState([])
    const [ currentPage, setCurrentPage ] = useState(1)
    const [ Max_Product_Per_Page, setMax_Product_Per_Page ] = useState(10)
    const [ maxPage, setMaxPage ] = useState(0)
    const searchBar = useRef()
    const [ isAdmin, setIsAdmin ] = useState(false)
    
    // get data
    const getListProduct = async (cancelToken) => {
        const url = process.env.NEXT_PUBLIC_BACKEND + '/product/allSeries'
        axios.get(url, {cancelToken: cancelToken.token,}).then( (result) => {
            setAllProduct(result.data)
        }).catch( (err)=> {
            // ! Localhost ios issus
            console.log(err)
            axios.get('/api/getAllSeries')
            .then( (result) => { 
                // setListProduct( result.data )
                setAllProduct(result.data)
            })
            .catch( (err) => {
                setListProduct( [{img: '', title: err.message , seriesId:'0'}] )
            })
        })
    }

    const changePageHandle = (event) => {
        if( ( event === -1 ) && ( currentPage > 1 )){
            setCurrentPage(currentPage-1)
        } else if( ( event === 1 ) && ( currentPage < maxPage )){
            setCurrentPage(currentPage+1)
        }
    }

    useEffect( () => {
        const cancelToken = axios.CancelToken.source()
        getListProduct(cancelToken)
        return () => {
            cancelToken.cancel()
        }
    }, [])

    useEffect(() => {
        if(router.isReady){
            if(localStorage.getItem('jwt')){
                axios.get('/api/isAdmin', {
                    headers: { jwt: localStorage.getItem('jwt') }
                }).then(result => {
                    if(result.data.isAdmin){
                        setIsAdmin(true)
                    } else {
                        router.push({pathname: '/', query:{ } }, undefined,{ shallow: false } )
                        return
                    }
                }).catch(err => {
                    router.push({pathname: '/', query:{ } }, undefined,{ shallow: false } )
                    return
                })
            } else {
                router.push({pathname: '/', query:{ } }, undefined,{ shallow: false } )
                return
            }
        }
    }, [router])

    useEffect(()=>{
        setMaxPage( Math.ceil(allProduct.length/Max_Product_Per_Page))
        setCurrentPage(1)
    },[allProduct])

    useEffect( ()=> {
        const arr = []
        setMaxPage(Math.ceil(allProduct.length/Max_Product_Per_Page))
        var start = currentPage*Max_Product_Per_Page - Max_Product_Per_Page
        var stop = currentPage*Max_Product_Per_Page
        if( stop > allProduct.length ){
            stop = allProduct.length
        }
        if(search){
            const searchProduct = []
            let index = 0
            while(index < allProduct.length){
                var regExp = new RegExp(search, 'gi' )
                if(allProduct[index].title.match(regExp) || allProduct[index].publisher.toLowerCase() === search.toLowerCase() || allProduct[index].author.toLowerCase() === search.toLowerCase()){
                    searchProduct.push(allProduct[index])
                }
                index++
            }
            setMaxPage(Math.ceil(searchProduct.length/Max_Product_Per_Page))
            if( stop > searchProduct.length ){
                stop = searchProduct.length
            }
            for(let i = start; i<stop; i++){
                arr.push(searchProduct[i])
            }
        } else {
            for(let i = start; i<stop; i++){
                arr.push(allProduct[i])
            }
        }
        setListProduct(arr)
        router.query.page = currentPage
        router.push({pathname: '/admin/series', query:{ ...router.query } }, undefined,{ shallow: true } )
    }, [currentPage, maxPage, search])

    useEffect(() => {
        if(router.isReady){
            setSearch(router.query.search)
        }
    }, [router])
    
    const searchHandle = () => {
        if(searchBar.current.value === '') delete router.query.search
        else router.query.search = searchBar.current.value
        router.push({pathname: '/admin/series', query:{ ...router.query } }, undefined,{ shallow: true } )
    }

    if(!isAdmin) {
        return (
            <div>
                <Head>
                    <title>Admin | PT Bookstore</title>
                    <meta name="description" content="Generated by create next app" />
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <div className={styles.container}>
                    <main className={styles.main}>
                        
                    </main>
                </div>
            </div>
        )
    } else {
        return (
            <div className={styles.container}>
                <SideNav />
                <div className={styles.contentContainer}>
                    <div className={styles.productWrap}>
                        <div className={styles.pageTitle}>Series</div>
                        <div className={styles.topMenu}>
                            <button className={styles.addButton}><Link href='/admin/series/addSeries'>Add Series</Link></button>
                            <input ref={searchBar} placeholder='Search...' onChange={searchHandle} onMouseLeave={searchHandle}/>
                        </div>
                        
                        <div className={styles.listProductContainer} id='listContainer'>
                            { (listProduct[0] === undefined) && <div>No series</div> }
                            {
                                (listProduct[0] != undefined) && listProduct.map( (element, index) => {
                                    return (
                                        <div key={`item-${index}`} className={styles.itemContainer}>
                                            <Link href={`/admin/series/${element.seriesId}`}>
                                                <a className={styles.item}>
                                                    <div className={styles.image}>
                                                        <Image src={element.img} alt='img' layout='fill' objectFit='contain' />
                                                    </div>
                                                    <div className={styles.title}>{element.title}</div>
                                                    <button className={styles.btn}>details</button>
                                                </a>
                                            </Link>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div className={styles.pageButtonGroup}>
                            <button onClick={e => changePageHandle(-1) }><FiChevronLeft /></button>
                            <div className={styles.currentPageText}>
                                {currentPage} / {maxPage}
                            </div>
                            <button onClick={e => changePageHandle(1) }><FiChevronRight /></button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}

