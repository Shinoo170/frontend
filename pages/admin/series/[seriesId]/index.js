import axios from "axios"
import Image from 'next/image'
import { useState, useEffect } from "react"
import { useRouter } from 'next/router'
import SideNav from 'components/admin/adminSideNavbar'
import styles from './series.module.css'
import Link from "next/link"

import ProductListSM from "components/productListSM"

import { AiOutlineEdit } from 'react-icons/ai'
import { MdOutlineAddToPhotos, MdOutlineCancel } from 'react-icons/md'
import { RiCloseCircleLine, RiArrowDownSLine } from 'react-icons/ri'
import { IoMdSave } from 'react-icons/io'

export default function SpecificSeries() {
    const [ productData, setProductData ] = useState({})
    const [ addProductURl, setAddProductURl] = useState('')
    const [ mangaProducts, setMangaProducts ] = useState([])
    const [ novelProducts, setNovelProducts ] = useState([])
    const [ otherProducts, setOtherProducts ] = useState([])
    const [ allGenres, setAllGenres ] = useState([])
    const [ genres, setGenres ] = useState([])
    const [ keywords, setKeywords ] = useState([])
    const [ edit, setEdit ] = useState(false)
    const [ viewMore, setViewMore ] = useState('hide')
    const [ editGenres, setEditGenres ] = useState([])
    const [ editKeywords, setEditKeywords ] = useState([])
    const router = useRouter()

    async function getSeriesDetails(){
        const seriesId = router.query.seriesId
        const url = process.env.NEXT_PUBLIC_BACKEND + '/product/series/' + seriesId
        axios.get(url).then( (result) => {
            console.log(result.data)
            setProductData(result.data.seriesData)
            setMangaProducts(result.data.productData.manga)
            setNovelProducts(result.data.productData.novel)
            setOtherProducts(result.data.productData.other)
            setGenres(result.data.seriesData.genres)
            setKeywords(result.data.seriesData.keywords)
            setAddProductURl('/admin/series/addProduct/?seriesId=' + seriesId + '&title=' + result.data.seriesData.title)
        }).catch( (err)=> {
            console.log(err)
            axios.post('/api/getSeriesDetails', { url })
            .then( (result) => { 
                setProductData(result.data.seriesData)
                setMangaProducts(result.data.productData.manga)
                setNovelProducts(result.data.productData.novel)
                setOtherProducts(result.data.productData.other)
                setAddProductURl('/admin/series/addProduct/?seriesId=' + seriesId + '&title=' + result.data.seriesData.title)
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
            getSeriesDetails()
        }
    }, [router])

    useEffect(() => {
        if(edit){
            setEditGenres(genres)
            setEditKeywords(keywords)
            setViewMore('hide')
            if(allGenres.length === 0){
                setAllGenres(['Loading'])
                const axiosURL = process.env.NEXT_PUBLIC_BACKEND + '/product/genres'
                axios.get(axiosURL)
                .then( result => {
                    setAllGenres(result.data)
                }).catch( err => {
                    console.log(err)
                    axios.get('/api/getGenres')
                    .then(result => setAllGenres(result.data))
                    .catch(err => { console.log("Also error"); console.log(err) })
                })
            }
        }

    }, [edit])

    useEffect(() => {
        var lines = document.getElementById('description').offsetHeight / 22
        if(lines > 7) setViewMore('More')
    }, [productData])

    const viewMoreHandle = () => {
        setViewMore(current => {
            if(current === 'More') return current = 'Less'
            else return current = 'More'
        })
    }

    const editHandle = () => {
        setEdit(!edit)
    }

    const mouseUpHandle = (e) => {
        const container = document.getElementById('genres-dropdown')
        if (!container.contains(e.target)) {
            container.classList.remove(styles.showDropdown)
            document.removeEventListener('mouseup', mouseUpHandle)
        }
    }
    const showDropdownHandle = () => {
        const container = document.getElementById('genres-dropdown')
        if(container.classList.length === 1){
            container.classList.add(styles.showDropdown)
            document.addEventListener('mouseup', mouseUpHandle)
        } else {
            container.classList.remove(styles.showDropdown)
        }
    }
    const hideDropdownHandle = (e) => {
        const container = document.getElementById('genres-dropdown')
        container.classList.remove(styles.showDropdown)
        document.removeEventListener('mouseup', mouseUpHandle)
    }
    const addEditGenres = (add) => {
          // new keyword not exist in array
          if(editGenres.indexOf(add) === -1){
            setEditGenres([...editGenres, add])
          }
      }
    const removeEditGenres = (remove) => {
        const array = editGenres
        const index = array.indexOf(remove)
        array.splice(index, 1)
        setEditGenres([...array])
    }
    function addKeywords(event){
        if(event.key === 'Enter'){
          const newKeyword = event.target.value
          if(editKeywords.indexOf(newKeyword) === -1 && editGenres.indexOf(newKeyword) === -1){
            setEditKeywords([...editKeywords, newKeyword])
            event.target.value = ''
          }
        }
    }
    function removeKeywords(remove){
        const array = editKeywords
        const index = array.indexOf(remove)
        array.splice(index, 1)
        setEditKeywords([...array])
    }

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

                                <div className={styles.subDetails}>
                                    <div className={styles.label}>Series Id :</div>
                                    <div className={styles.value}>{productData.seriesId}</div>
                                </div>
                                { edit && <div className={styles.subDetails}>
                                    <div className={styles.label}>ชื่อเรื่อง :</div>
                                    <input className={styles.input} defaultValue={productData.title}/>
                                </div> 
                                }
                                <div className={styles.subDetails}>
                                    <div className={styles.label}>ผู้เขียน :</div>
                                    { !edit && <div className={styles.value}>{productData.author}</div>}
                                    { edit && <input className={styles.input} defaultValue={productData.author}/> }
                                </div>
                                <div className={styles.subDetails}>
                                    <div className={styles.label}>สำนักพิมพ์ :</div>
                                    { !edit && <div className={styles.value}>{productData.publisher}</div>}
                                    { edit && <input className={styles.input} defaultValue={productData.publisher}/> }
                                </div>
                                <div className={styles.subDetails}>
                                    <div className={styles.label}>หมวดหมู่ :</div>
                                    <div className={styles.editGroup}>
                                        {
                                            !edit && <div className={styles.genresGroup}>
                                                {
                                                    genres.map((element, index) => {
                                                        return (
                                                            <div key={`genres-${index}`} className={styles.genresItem}>
                                                                {element}
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        }
                                        {
                                            edit && (
                                                <div>
                                                    <div className={styles.genresGroup}>
                                                        {
                                                            editGenres.map((element, index) => {
                                                                return (
                                                                    <div key={`genres-${index}`} className={styles.genresItem}>
                                                                        {element} <div className={styles.removeIcon} onClick={e => removeEditGenres(element)}><RiCloseCircleLine /></div>
                                                                    </div>
                                                                )
                                                            })
                                                        }
                                                    </div>
                                                    <div id='genres-dropdown' className={`${styles.dropdownGroup}`}>
                                                        <div className={styles.dropdownSelection} onClick={e => showDropdownHandle()}><div>Select Genres</div> <RiArrowDownSLine/></div>
                                                        <div className={styles.dropdownList} onClick={e => hideDropdownHandle(e)}>
                                                            {
                                                                allGenres.map((element, index) => {
                                                                    const handle = (newGenres) => {
                                                                        addEditGenres(newGenres)
                                                                    }
                                                                    return (
                                                                        <div id={`id-genres-${index}`} className={styles.dropdownItem} key={`genres-${index}`} onClick={e => handle(element)} >
                                                                            <span id={`id-genres-label-${index}`} >{element}</span>
                                                                        </div>
                                                                    )
                                                                })
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>
                                <div className={styles.subDetails}>
                                    <div className={styles.label}>คีย์เวิร์ด :</div>
                                    <div className={styles.editGroup}>
                                        {
                                            !edit && <div className={styles.genresGroup}>
                                                {
                                                    keywords.map((element, index) => {
                                                        return (
                                                            <div key={`keyword-${index}`} className={styles.genresItem}>
                                                                {element}
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        }
                                        {
                                            edit && (
                                                <div>
                                                    <div className={styles.genresGroup}>
                                                        {
                                                            editKeywords.map((element, index) => {
                                                                return (
                                                                    <div key={`keyword-${index}`} className={styles.genresItem}>
                                                                        {element} <div className={styles.removeIcon} onClick={e => removeKeywords(element)}><RiCloseCircleLine /></div>
                                                                    </div>
                                                                )
                                                            })
                                                        }
                                                    </div>
                                                    <input className={styles.input} style={{marginTop: '10px'}} placeholder='New keyword...' onKeyUp={e => addKeywords(e)}/>
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>
                                <div className={styles.subDetails}>
                                    <div className={styles.label}>วันที่เพิ่ม :</div>
                                    <div className={styles.value}>{showData(productData.addDate)} </div>
                                </div>
                                <div className={styles.subDetails}>
                                    <div className={styles.label}>วันที่แก้ไขล่าสุด:</div>
                                    <div className={styles.value}>{showData(productData.lastModify)} </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.descriptionText}> <p>เรื่องย่อ : </p>
                            {
                                !edit && (
                                    <>
                                        <div id='description' className={viewMore==='More'? styles.lineClamp8:''}>
                                            {productData.description}
                                        </div>
                                        <div className={viewMore!=='hide'? styles.viewMore:styles.hide} onClick={e => viewMoreHandle()}>{viewMore}</div>
                                    </>
                                )   
                            }
                            {
                                edit && (
                                    <textarea id='description' className={styles.textArea} defaultValue={productData.description}></textarea>
                                )
                            }
                        </div>
                        <div className={styles.listAllProduct}>
                            <div>สินค้าทั้งหมด { productData.products != undefined && productData.products.totalProducts} รายการ </div>
                            <div className={styles.btnGroup}>
                                <Link href={addProductURl}><a className={styles.btn}><MdOutlineAddToPhotos /> add product</a></Link>
                                { !edit && <div className={styles.btn} onClick={editHandle}><AiOutlineEdit />Edit</div> }
                                {
                                    edit && (
                                        <>
                                            <div className={`${styles.btn} ${styles.btnGreen}`} onClick={editHandle}><IoMdSave />save</div>
                                            <div className={`${styles.btn} ${styles.btnRed}`} onClick={editHandle}><MdOutlineCancel />cancel</div>
                                        </>
                                    )
                                }
                            </div>
                        </div>
                    </div>

                    {/* Novel List */}
                    { (productData.products != undefined) && (productData.products.totalNovel > 0) && (
                        <ProductListSM data={novelProducts} title='นิยาย' url={`/admin/series/${router.query.seriesId}/`}/>
                    )}
                    

                    {/* Manga List */}
                    { (productData.products != undefined) && (productData.products.totalManga > 0) && (
                        <ProductListSM data={mangaProducts} title='มังงะ' url={`/admin/series/${router.query.seriesId}/`} />
                    )}

                    {/* Manga List */}
                    { (productData.products != undefined) && (productData.products.otherProducts > 0) && (
                        <ProductListSM data={otherProducts} title='สินค้าอื่นๆ' url={`/admin/series/${router.query.seriesId}/`} />
                    )}

                </div>
            </div>
        </div>
    );
}