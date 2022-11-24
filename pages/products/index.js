import React, { useState, useEffect, useRef } from 'react'
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
import { TiStarHalf, TiStar } from 'react-icons/ti'
import { RiArrowDownSLine } from 'react-icons/ri'
import { HiSortAscending, HiSortDescending, HiChevronLeft } from 'react-icons/hi'

export default function Products(){
    const router = useRouter()
    // Filter
    const [ genres, setGenres ] = useState([])
    const [ starHover, setStarHover] = useState(0)
    const [ starSelect, setStarSelect] = useState(0)
    const star = [1,2,3,4,5]
    const [ searchText, setSearchText ] = useState('')
    const [ filter, setFilter ] = useState({})
    const [ filterGenres, setFilterGenres ] = useState([])
    const [ filterMatch, setFilterMatch ] = useState('ค่าเริ่มต้น')
    const [ filterCategory, setFilterCategory ] = useState('')   // -> Manga,Novel,Other
    const [ filterPrice, setFilterPrice ] = useState([])
    const [ filterCount, updateFilterCount] = useState(0)
    const [ filterOrderBy, setFilterOrderBy ] = useState('ค่าเริ่มต้น')
    const [ filterSortReverse, setFilterSortReverse ] = useState()   // false (down) = A->Z 0-100 , True (up) = Z->A 100-0

    const [ search, setSearch ] = useState('')
    // Product
    const [ allSeries, setAllSeries ] = useState([])
    const [ filterProduct, setFilterProduct ] = useState([])
    const [ allProductId, setAllProductId ] = useState([])
    // open
    const [ showFilter, setShowFilter ] = useState(false)
    const [ showDropdown1, setShowDropdown1 ] = useState(false)
    const [ showDropdownOrderBy, setShowDropdownOrderBy ] = useState(false)
    const [ showDropdownDisplay, setShowDropdownDisplay ] = useState(false)

    const [ debug, setDebug ] = useState('')

    const dropdown1Handle = (e) => {
        setFilterMatch(e)
        setShowDropdown1(false)
    }
    const orderByHandle = (e) => {
        setFilterOrderBy(e)
        setShowDropdownOrderBy(false)
    }
    const setCategoryHandle = (e) => {
        // var category = ''
        // if(e === '') category = '000'
        // if(e === 'มังงะ') filterCategory[0] === '1'? category = '0' + filterCategory.substring(1,3) : category = '1' + filterCategory.substring(1,3)
        // if(e === 'นิยาย') filterCategory[1] === '1'? category = filterCategory[0] + '0' + filterCategory[2] : category = filterCategory[0] + '1' + filterCategory[2]
        // if(e === 'สินค้าอื่นๆ') filterCategory[2] === '1'? category = filterCategory.substring(0,2) + '0' : category = filterCategory.substring(0,2) + '1'
        updateFilterCount(current => current+1)
        if(filterCategory !== e) setFilterCategory(e)
        else setFilterCategory('')
    }

    const getProducts = () => {
        const url = process.env.NEXT_PUBLIC_BACKEND + '/product/latestSeries'
        // const url = 'https://bookstore-back-end-1jz3.vercel.app/product/allSeries'
        axios.get(url)
        .then( result => {
            console.log(result.data)
            setAllSeries(result.data)
        }).catch( err => {
            console.log("Error to get data, using next API")
            axios.get('/api/getAllSeries')
            .then(result => setAllSeries(result.data))
            .catch(err => { console.log("Also error"); console.log(err) })
        })
    }
    const getGenres = () => {
        const axiosURL = process.env.NEXT_PUBLIC_BACKEND + '/product/genres'
        axios.get(axiosURL)
        .then( result => {
            setGenres(result.data)
        }).catch( err => {
            console.log(err)
            axios.get('/api/getGenres')
            .then(result => setGenres(result.data))
            .catch(err => { console.log("Also error"); console.log(err) })
        })
    }
    const showStar = (score) => {
        const halfScore = score-0.5
        return (
            <div className={styles.fullStarGroup} key={`star-${score}`}>
                <TiStarHalf className={`${styles.starHalfLeft} ${starHover>=halfScore? styles.starHover:''}`}/>
                <TiStarHalf className={`${styles.starHalfRight} ${starHover>=score? styles.starHover:''}`}/>
                <div className={styles.labelGroup}>
                    <div className={styles.leftLabel} onClick={() => setStarSelect(halfScore)} onMouseEnter={() => setStarHover(halfScore)} onMouseLeave={() => setStarHover(starSelect)}></div>
                    <div className={styles.rightLabel} onClick={() => setStarSelect(score)} onMouseEnter={() => setStarHover(score)} onMouseLeave={() => setStarHover(starSelect)}></div>
                </div>
            </div>
        )
    }

    let pos = { top: 0, left: 0, x: 0, y: 0 }
    const mouseDownHandler = function (e) {
        var scroll = document.getElementById('showCategory')
        if(window.innerWidth <= 567){
            pos = {
                // The current scroll
                left: scroll.scrollLeft,
                top: scroll.scrollTop,
                // Get the current mouse position
                x: e.clientX,
                y: e.clientY,
            }
            scroll.style.cursor = 'grabbing';
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        } else {
            scroll.style.cursor = 'default';
        }
        
    }
    const mouseMoveHandler = function (e) {
        var scroll = document.getElementById('showCategory')
        // How far the mouse has been moved
        const dx = e.clientX - pos.x;
        const dy = e.clientY - pos.y;
    
        // Scroll the element
        scroll.scrollTop = pos.top - dy;
        scroll.scrollLeft = pos.left - dx;
        
    }
    const mouseUpHandler = function () {
        var scroll = document.getElementById('showCategory')
        scroll.style.cursor = 'grab';
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    }

    useEffect(() => {
        getProducts()
        getGenres()
    }, [])

    useEffect(() => {
        if(router.isReady){
            const query = router.query
            query.searchText? setSearchText(query.searchText) : setSearchText('')
            if(filterCount < 2){
                Array.isArray(query.genres)? setFilterGenres(query.genres) : query.genres? setFilterGenres([query.genres]):setFilterGenres([])
                // "query.genres?" mean "query.genres" is not unified?"
                if(query.match) setFilterMatch(query.match)
                query.sort === 'Up'? setFilterSortReverse(true) : setFilterSortReverse(false)
                setFilterPrice([query.min? query.min : undefined, query.max? query.max : undefined])
            }
            query.category? setFilterCategory(query.category) : setFilterCategory('')
            if(query.score) setStarSelect(query.score)
        }
    },[router])

    
    useEffect(() => {
        // * Initial sort
        if( (allSeries.length > 0) && (filterCount < 2) ){
            filterGenres.forEach( element => {
                try{
                    document.getElementById(element).checked = true
                }catch(err){
                    // setFilterGenres([...filterGenres])
                }
            })
            filterProcess()
            updateFilterCount(c => c + 1)
        }
        if(searchText !== ''){
            searchSeries()
            return
        }
        // * Update router
        if( (allSeries.length > 0) && filterCount > 1){
            router.query.page = 1
            // [ filter genres ]
            router.query.genres = []
            filterGenres.forEach( element => {
                router.query.genres.push(element)
            })
            // [ match ]
            filterMatch != 'ค่าเริ่มต้น'? router.query.match = filterMatch : delete router.query.match
            // [ filter Category ]
            filterCategory !== ''? router.query.category = filterCategory : delete router.query.category
            // [ score]
            starSelect > 0 ? router.query.score = starSelect : delete router.query.score
            // [ Sort products ]
            filterOrderBy !== 'ค่าเริ่มต้น'? router.query.orderBy = filterOrderBy: delete router.query.orderBy
            filterSortReverse? router.query.sort = "Up" : delete router.query.sort

            delete router.query.searchText
            router.push({pathname: '/products', query:{ ...router.query } }, undefined,{ shallow: true } )
            filterProcess()
        }
    }, [allSeries, filterMatch, filterGenres, filterCategory, filterPrice, starSelect, filterOrderBy, filterSortReverse])

    const filterProcess = () => {
        if(searchText !== ''){
            if(filterCount > 0) setSearchText('')
            return
        }
        console.log('sorting')
        setSearch('')
        const tempSort = []
        const genresLength = filterGenres.length
        if(filterCategory !== '') {
            if(filterCategory === 'Novel') {
                allSeries.forEach( element => {
                    if(element.products.totalNovel > 0 && element.score.avg >= starSelect) {
                        if(isGenresFilterMatch(element)) tempSort.push(element)
                    }
                })
            }
            else if(filterCategory === 'Manga'){
                allSeries.forEach( element => {
                    if(element.products.totalManga > 0 && element.score.avg >= starSelect) {
                        if(isGenresFilterMatch(element)) tempSort.push(element)
                    }
                })
            }
            else if(filterCategory === 'Other'){
                allSeries.forEach( element => {
                    if(element.products.totalOther > 0 && element.score.avg >= starSelect) {
                        if(isGenresFilterMatch(element)) tempSort.push(element)
                    }
                })
            }
        } else {
            if(genresLength === 0) {
                if(starSelect === 0) {
                    tempSort = allSeries
                } else {
                    allSeries.forEach(e => {
                        if(e.score.avg >= starSelect) tempSort.push(e)
                    })
                }
            } else {
                if(starSelect === 0){
                    allSeries.forEach( element => {
                        if(isGenresFilterMatch(element)) tempSort.push(element)
                    })
                } else {
                    allSeries.forEach( element => {
                        if(isGenresFilterMatch(element) && element.score.avg >= starSelect) tempSort.push(element)
                    })
                }
            }
        }

        const finalSort = tempSort.map(e => e)
        if(filterOrderBy !== 'ค่าเริ่มต้น'){
            if(filterOrderBy === 'เพิ่มล่าสุด'){
                finalSort.sort((a,b) => (a.lastModify > b.lastModify)? -1 : ((b.lastModify > a.lastModify)? 1 : 0))
            }else if(filterOrderBy === 'ชื่อ'){
                finalSort.sort((a,b) => (a.title > b.title)? 1 : ((b.title > a.title)? -1 : 0))
            }
        }
        setFilterProduct(filterSortReverse? finalSort.reverse() : finalSort)

        function isGenresFilterMatch(e) {
            var counter
            if(genresLength === 0) return true
            if(filterMatch === 'ค่าเริ่มต้น'){
                counter = 0
                for(let j=0; j<filterGenres.length; j++){
                    if(e.genres.indexOf(filterGenres[j]) !== -1){
                        counter++
                        if(counter === genresLength) return true
                    }
                }
                return false
            }
            else if(filterMatch === 'ตรงทั้งหมด'){  // เฉพาะที่เลือก
                counter = 0
                for(let j=0; j<filterGenres.length; j++){
                    if(e.genres.indexOf(filterGenres[j]) === -1) return false
                    counter++
                }
                if(e.genres.length === counter) return true
            }
            else if(filterMatch === 'ตรงอย่างน้อยหนึ่งอย่าง'){ // อย่างใดอย่างหนึ่ง
                for(let j=0; j<filterGenres.length; j++){
                    if(e.genres.indexOf(filterGenres[j]) !== -1) return true
                }
                return false
            }
        }
    }

    const resetFilter = () => {
        filterGenres.forEach( element => {
            try{
                document.getElementById(element).checked = false
            }catch(err){}
        })
        setSearchText('')
        setFilterGenres([])
        setFilterMatch('ค่าเริ่มต้น')
        setFilterCategory('')
        setFilterOrderBy('ค่าเริ่มต้น')
        setFilterSortReverse()
    }

    useEffect(() => {
        if(allSeries.length > 0 && searchText !== ''){
            filterGenres.map( element => {
                document.getElementById(element).checked = false
            })
            searchSeries()
            setFilterGenres([])
        }
    }, [allSeries, searchText])

    const searchSeries = () => {
        if(searchText !== ''){
            var regExp = new RegExp(searchText, 'gi' )
            const p = allSeries.filter(e => {
                // if(e.title.match(regExp) || e.publisher.match(regExp) || e.author.match(regExp)) return true
                if(e.title.match(regExp) || e.publisher.toLowerCase() === searchText.toLowerCase() || e.author.toLowerCase() === searchText.toLowerCase()) return true
            })
            setFilterProduct(p)
            setSearch(searchText)
        }
    }

    useEffect(() => {
        setStarHover(starSelect)
    },[starSelect])

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
                    <div className={`${styles.sideBar} ${showFilter? styles.show:''}`}>
                        <div className={styles.closeButton} onClick={e => setShowFilter(!showFilter)}><HiChevronLeft /></div>
                        <div className={styles.item}>
                            <div className={styles.title}>ตัวเลือกการค้นหา</div>
                            <div className={`${styles.dropdownGroup} ${showDropdown1? styles.showDropdown:''}`}>
                                <div className={styles.dropdownSelection} onClick={e => {setShowDropdown1(!showDropdown1)}}>{filterMatch} <RiArrowDownSLine/></div>
                                <div className={styles.dropdownList}>
                                    <div className={styles.dropdownItem} onClick={e => {dropdown1Handle('ค่าเริ่มต้น'); updateFilterCount(current => current+1)}}>ค่าเริ่มต้น</div>
                                    <div className={styles.dropdownItem} onClick={e => {dropdown1Handle('ตรงทั้งหมด'); updateFilterCount(current => current+1)}}>ตรงทั้งหมด</div>
                                    <div className={styles.dropdownItem} onClick={e => {dropdown1Handle('ตรงอย่างน้อยหนึ่งอย่าง'); updateFilterCount(current => current+1)}}>ตรงอย่างน้อยหนึ่งอย่าง</div>
                                </div>
                            </div>
                            <hr/>
                            <div className={styles.title}>ประเภทหนังสือ</div>
                            <div className={styles.selector}>
                                {
                                    genres.map((element, index) => {
                                        const handle = (e) => {
                                            if(e.target.id === `id-genres-${index}` || e.target.id === `id-genres-label-${index}`){ document.getElementById(element).checked = !document.getElementById(element).checked }
                                            if(document.getElementById(element).checked){ setFilterGenres([...filterGenres, element]) }
                                            else{ setFilterGenres(filterGenres.filter(item => item != element)) }
                                            setSearchText('')
                                        }
                                        return (
                                            <div id={`id-genres-${index}`} className={styles.subItem} key={`genres-${index}`} onClick={e => {handle(e); updateFilterCount(current => current+1)}} >
                                                <input id={element} className={styles.checkmark} type='checkbox' />
                                                <span id={`id-genres-label-${index}`}>{element}</span>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            <hr/>
                            <div className={styles.title}>ตัวเลือกการค้นหา</div>
                            <div className={styles.buttonGroup}>
                                <div className={filterCategory === ''? styles.btnActive:styles.btn} onClick={e => setCategoryHandle('')}>ทั้งหมด</div>
                                <div className={filterCategory === 'Novel'? styles.btnActive:styles.btn} onClick={e => setCategoryHandle('Novel')}>นิยาย</div>
                                <div className={filterCategory === 'Manga'? styles.btnActive:styles.btn} onClick={e => setCategoryHandle('Manga')}>มังงะ</div>
                                <div className={filterCategory === 'Other'? styles.btnActive:styles.btn} onClick={e => setCategoryHandle('Other')}>สินค้าอื่นๆ</div>
                            </div>
                            <hr/>
                            <div className={styles.buttonGroup}><div className={styles.btn} onClick={e => resetFilter()}>Reset</div></div>
                        </div>
                        <div className={styles.item}>
                            {/* <div className={styles.title}>ราคา</div>
                            <div className={styles.row}>
                                <input className={styles.priceInput} type='number'/>
                                -
                                <input className={styles.priceInput} type='number'/>
                            </div> */}
                            <div className={styles.title}>คะแนน</div>
                            <div className={styles.starGroup}>
                                { star.map(e => showStar(e)) }
                            </div>
                            <div className={styles.buttonGroup} ><div className={styles.btn} onClick={e => setStarSelect(0)}>Reset</div></div>
                        </div>
                    </div>
                    <div className={styles.listProducts}>
                        <div className={styles.top}>
                            <div className={styles.title}>สินค้า</div>
                            <div className={styles.filterGroup}>
                                <div className={styles.filterCategoryDetail}>
                                    <div className={styles.label}>Filter&nbsp;:</div>
                                    <div className={styles.category} id='showCategory' onMouseDown={mouseDownHandler}>
                                        { search!=='' && <div className={styles.item} >ค้นหา: {search}</div> }
                                        { starSelect>0 && <div className={styles.item} ><TiStar className={styles.star}/> {starSelect}</div>}
                                        {
                                            filterGenres.map( (element, index) => {
                                                return(
                                                    <div className={styles.item} key={`filterGenres-${index}`}>{element}</div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                                <div className={styles.orderBy}>
                                    <div className={styles.label}>เรียงตาม&nbsp;:</div>
                                    <div className={`${styles.dropdownGroup} ${styles.dropdownSM} ${showDropdownOrderBy? styles.showDropdown:''}`}>
                                        <div className={styles.dropdownSelection} onClick={e => setShowDropdownOrderBy(!showDropdownOrderBy)}>{filterOrderBy} <RiArrowDownSLine/></div>
                                        <div className={styles.dropdownList}>
                                            <div className={styles.dropdownItem} onClick={e => orderByHandle('ค่าเริ่มต้น')}>ค่าเริ่มต้น</div>
                                            <div className={styles.dropdownItem} onClick={e => orderByHandle('ความนิยม')}>ความนิยม</div>
                                            <div className={styles.dropdownItem} onClick={e => orderByHandle('เพิ่มล่าสุด')}>เพิ่มล่าสุด</div>
                                            {/* <div className={styles.dropdownItem} onClick={e => orderByHandle('ราคา')}>ราคา</div> */}
                                            <div className={styles.dropdownItem} onClick={e => orderByHandle('ชื่อ')}>ชื่อ</div>
                                        </div>
                                    </div>
                                    <div className={styles.sortButton} onClick={e => setFilterSortReverse(c => !c)}>
                                        { !filterSortReverse && <HiSortDescending /> }
                                        { filterSortReverse && <HiSortAscending /> }
                                    </div>
                                    <div className={styles.filterButton} onClick={e => setShowFilter(!showFilter)}><HiFilter/></div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.productContainer}>
                            { (filterProduct[0] != undefined) && <ProductList data={filterProduct} revert={filterSortReverse} maxPerPage='5' href='/series/'/> }
                        </div>
                    </div>
                </main>
                <footer className={styles.footer}>

                </footer>
            </div>
        </div>
    )
}