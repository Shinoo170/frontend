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

import { HiFilter } from 'react-icons/hi'
import { TiStarHalf } from 'react-icons/ti'
import { RiArrowDownSLine } from 'react-icons/ri'
import { HiSortAscending, HiSortDescending, HiChevronLeft } from 'react-icons/hi'

export default function Products(){
    const router = useRouter()
    // Filter
    const [ genres, setGenres ] = useState([])
    const [ starHover, setStarHover] = useState(0)
    const [ starSelect, setStarSelect] = useState(0)
    const star = [1,2,3,4,5]
    const [ filterGenres, setFilterGenres ] = useState([])
    const [ filterMatch, setFilterMatch ] = useState('')
    const [ filterType, setFilterType ] = useState('000')    // Structure 000 -> novel,manga,other
    const [ filterPrice, setFilterPrice ] = useState([])
    const [ filterScore, setFilterScore ] = useState(0)
    const [ filterCount, updateFilterCount] = useState(0)
    const [ filterOrderBy, setFilterOrderBy ] = useState('ค่าเริ่มต้น')
    const [ filterSortUpDown, setFilterSortUpDown ] = useState(false)   // false = A->Z 0-100 , True = Z->A 100-0

    // Product
    const [ allSeries, setAllSeries ] = useState([])
    const [ filterProduct, setFilterProduct ] = useState([])
    const [ currentPage, setCurrentPage ] = useState(1)    
    const [ allProductId, setAllProductId ] = useState([])
    // open
    const [ showFilter, setShowFilter ] = useState(false)
    const [ showDropdown1, setShowDropdown1 ] = useState(false)
    const [ showDropdownOrderBy, setShowDropdownOrderBy ] = useState(false)
    const [ showDropdownDisplay, setShowDropdownDisplay ] = useState(false)

    const dropdown1Handle = (e) => {
        setFilterMatch(e)
        setShowDropdown1(false)
    }
    const showDropdownOrderByHandle = (e) => {
        setFilterOrderBy(e)
        setShowDropdownOrderBy(false)
    }

    const getProducts = () => {
        const url = process.env.NEXT_PUBLIC_BACKEND + '/product/latestSeries'
        axios.get(url)
        .then( result => {
            console.log(result.data)
            setAllSeries(result.data)
            // setFilterProduct(result.data)
        }).catch( err => {
            axios.get('/api/getAllSeries').then(result => setAllSeries(result.data))
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
        if(router.isReady){
            const query = router.query
            query.page? setCurrentPage(query.page) : setCurrentPage(1)
            Array.isArray(query.genres)? setFilterGenres(query.genres) : query.genres? setFilterGenres([query.genres]):setFilterGenres([])
            // "query.genres?" mean "query.genres" is not unified?"
            query.match? setFilterMatch(query.match) : setFilterMatch('ค่าเริ่มต้น')
            query.type? setFilterType(query.type) : setFilterType('000')
            setFilterPrice([query.min? query.min : undefined, query.max? query.max : undefined])
        }
    },[router])

    // [ Filter products && Update URL ]
    useEffect(() => {
        if(filterCount !== 0){
            router.query.page = 1
            router.query.genres = []
            filterGenres.forEach( element => {
                router.query.genres.push(element)
            })
            if(filterMatch != 'ค่าเริ่มต้น'){
                router.query.match = filterMatch
            } else {
                delete router.query.match
            }
            router.push({pathname: '/products', query:{ ...router.query } }, undefined,{} )
            filterProcess()
        }
        
    },[filterCount])

    // ! Initial sort
    useEffect(() => {
        if( (allSeries.length > 0) && (filterCount === 0)){ filterProcess() }
    }, [allSeries, filterMatch, filterGenres, filterType, filterPrice, filterScore])

    const filterProcess = () => {
        console.log('sorting')
        const sort = []
        const tempSort = []
        const genresLength = filterGenres.length
        var counter
        if(filterType !== '000') {
            allSeries.forEach( element => {
                console.log(element.products.totalNovel)
                if(element.products.totalNovel >= parseInt(filterType[0]) && element.products.totalManga >= parseInt(filterType[1]) && element.products.totalOther >= parseInt(filterType[2])){
                    tempSort.push(element)
                }
            })
        } else {
            tempSort = allSeries
        }
        if(filterMatch === 'ค่าเริ่มต้น'){
            // คัดประเภท ถ้า genresLength == 0 แสดงว่าไม่ได้เลือก ให้แสดงทั้งหมด
            if(genresLength > 0){
                tempSort.filter( product => {
                    counter = 0
                    filterGenres.forEach( e => {
                        if(product.genres.indexOf(e) != -1){
                            counter++
                            if(counter === genresLength){
                                sort.push(product)
                                return
                            }
                        }
                    })
                })
            } else { sort.push(...tempSort) }
            setFilterProduct(sort)
        } else if(filterMatch === 'เฉพาะที่เลือก'){
             // คัดประเภท ถ้า genresLength == 0 แสดงว่าไม่ได้เลือก ให้แสดงทั้งหมด
            if(genresLength > 0){
                tempSort.filter( product => {
                    counter = 0
                    filterGenres.forEach( e => {
                        if(product.genres.indexOf(e) === -1){
                            return
                        }
                        counter++
                    })
                    if(product.genres.length === counter) tempSort.push(product)
                })
            } else { sort.push(...tempSort) }
            setFilterProduct(sort)
        } else if (filterMatch === 'อย่างใดอย่างหนึ่ง'){
             // คัดประเภท ถ้า genresLength == 0 แสดงว่าไม่ได้เลือก ให้แสดงทั้งหมด
            if(genresLength > 0){
                tempSort.filter( product => {
                    filterGenres.forEach( e => {
                        if(product.genres.indexOf(e) != -1){
                            sort.push(product)
                            return
                        }
                    })
                })
            } else { sort.push(...tempSort) }
            setFilterProduct(sort)
        }
    }

    // [ Sort products ]
    useEffect(() => {
        setFilterProduct(filterProduct.reverse())
    }, [filterSortUpDown])

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
                        <div className={styles.closeButton} onClick={e => setShowFilter(!showFilter)}><HiChevronLeft /></div>
                        <div className={styles.item}>
                            <div className={styles.title}>ตัวเลือกการค้นหา</div>
                            <div className={`${styles.dropdownGroup} ${showDropdown1? styles.showDropdown:''}`}>
                                <div className={styles.dropdownSelection} onClick={e => {setShowDropdown1(!showDropdown1)}}>{filterMatch} <RiArrowDownSLine/></div>
                                <div className={styles.dropdownList}>
                                    <div className={styles.dropdownItem} onClick={e => {dropdown1Handle('ค่าเริ่มต้น'); updateFilterCount(filterCount+1)}}>ค่าเริ่มต้น</div>
                                    <div className={styles.dropdownItem} onClick={e => {dropdown1Handle('เฉพาะที่เลือก'); updateFilterCount(filterCount+1)}}>เฉพาะที่เลือก</div>
                                    <div className={styles.dropdownItem} onClick={e => {dropdown1Handle('อย่างใดอย่างหนึ่ง'); updateFilterCount(filterCount+1)}}>อย่างใดอย่างหนึ่ง</div>
                                </div>
                            </div>
                            <hr/>
                            <div className={styles.title}>ประเภทหนังสือ</div>
                            <div className={styles.selector}>
                                {
                                    genres.map((element, index) => {
                                        const handle = (e) => {
                                            if(e.target.id === `id-genres-${index}`){ document.getElementById(element).checked = !document.getElementById(element).checked }
                                            if(document.getElementById(element).checked){ setFilterGenres([...filterGenres, element]) }
                                            else{ setFilterGenres(filterGenres.filter(item => item != element)) }
                                        }
                                        return (
                                            <div id={`id-genres-${index}`} className={styles.subItem} key={`genres-${index}`} onClick={e => {handle(e); updateFilterCount(filterCount+1)}} >
                                                { filterGenres.indexOf(element) !== -1 && <input id={element} className={styles.checkmark} type='checkbox' defaultChecked /> }
                                                { filterGenres.indexOf(element) === -1 && <input id={element} className={styles.checkmark} type='checkbox' /> }
                                                <label htmlFor={element}>{element}</label>
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
                            <div className={styles.starGroup}>
                                { star.map(e => showStar(e)) }
                            </div>
                            <button onClick={e => setStarSelect(0)}>Reset</button>
                        </div>
                    </div>
                    <div className={styles.listProducts}>
                        <div className={styles.top}>
                            <div className={styles.title}>สินค้า</div>
                            <div className={styles.filterGroup}>
                                <div className={styles.orderBy}>
                                    <div className={styles.label}>เรียงตาม : </div>
                                    <div className={`${styles.dropdownGroup} ${styles.dropdownSM} ${showDropdownOrderBy? styles.showDropdown:''}`}>
                                        <div className={styles.dropdownSelection} onClick={e => setShowDropdownOrderBy(!showDropdownOrderBy)}>{filterOrderBy} <RiArrowDownSLine/></div>
                                        <div className={styles.dropdownList}>
                                            <div className={styles.dropdownItem} onClick={e => showDropdownOrderByHandle('ค่าเริ่มต้น')}>ค่าเริ่มต้น</div>
                                            <div className={styles.dropdownItem} onClick={e => showDropdownOrderByHandle('ความนิยม')}>ความนิยม</div>
                                            <div className={styles.dropdownItem} onClick={e => showDropdownOrderByHandle('เพิ่มล่าสุด')}>เพิ่มล่าสุด</div>
                                            <div className={styles.dropdownItem} onClick={e => showDropdownOrderByHandle('ราคา')}>ราคา</div>
                                            <div className={styles.dropdownItem} onClick={e => showDropdownOrderByHandle('ชื่อ')}>ชื่อ</div>
                                        </div>
                                    </div>
                                    <div className={styles.sortButton} onClick={e => setFilterSortUpDown(!filterSortUpDown)}>
                                        { !filterSortUpDown && <HiSortDescending /> }
                                        { filterSortUpDown && <HiSortAscending /> }
                                    </div>
                                </div>
                                <div className={styles.filterButton} onClick={e => setShowFilter(!showFilter)}><HiFilter/></div>
                            </div>
                        </div>
                        <div className={styles.productContainer}>
                            { (filterProduct[0] != undefined) && <ProductList data={filterProduct} currentPage={currentPage} maxPerPage='5'/> }
                        </div>
                    </div>
                </main>
                <footer className={styles.footer}>

                </footer>
            </div>
        </div>
    )
}