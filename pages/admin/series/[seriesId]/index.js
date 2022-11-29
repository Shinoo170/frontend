import axios from "axios"
import Image from 'next/image'
import Head from 'next/head'
import { useState, useEffect, useRef } from "react"
import { useRouter } from 'next/router'
import SideNav from 'components/admin/adminSideNavbar'
import styles from './series.module.css'
import Link from "next/link"
import Swal from 'sweetalert2'
import ProductListSM from "components/productListSM"

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Upload } from "@aws-sdk/lib-storage"
import { S3Client, S3 } from "@aws-sdk/client-s3"

import { AiOutlineEdit } from 'react-icons/ai'
import { MdOutlineAddToPhotos, MdOutlineCancel, MdDeleteForever } from 'react-icons/md'
import { RiCloseCircleLine, RiArrowDownSLine } from 'react-icons/ri'
import { IoMdSave } from 'react-icons/io'

export default function SpecificSeries() {
    const [ productData, setProductData ] = useState({})
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
    const [ editImg, setEditImg ] = useState()
    const router = useRouter()
    const [ isAdmin, setIsAdmin ] = useState(false)

    const inputImage = useRef()
    function getSeriesDetails(){
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
        }).catch( (err)=> {
            const errorMessage = <>ไม่พบข้อมูลซีรี่ย์<br/>กลับหน้าหลักใน 5 วินาที</>
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                onClose: () => {
                    router.push({pathname: '/admin/series/', query:{} }, undefined,{ shallow: true } )
                },
                enableHtml: true
            })
        })
    }

    const showDate = (time) => {
        if(!time){
            return 0
        }
        const [d1,d2] = new Date(time).toISOString().split('T')
        return d1
    }

    useEffect(() => {
        if(router.isReady){
            if(localStorage.getItem('jwt')){
                axios.get('/api/isAdmin', {
                    headers: { jwt: localStorage.getItem('jwt') }
                }).then(result => {
                    if(result.data.isAdmin){
                        setIsAdmin(true)
                        getSeriesDetails()
                    } else {
                        return router.push({pathname: '/', query:{ } }, undefined,{ shallow: false } )
                    }
                }).catch(err => {
                    return router.push({pathname: '/', query:{ } }, undefined,{ shallow: false } )
                })
            } else {
                return router.push({pathname: '/', query:{ } }, undefined,{ shallow: false } )
            }
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
        } else {
            addViewMoreBtn()
        }

    }, [edit])

    useEffect(() => {
        addViewMoreBtn()
    }, [productData])

    const addViewMoreBtn = () => {
        var lines = document.getElementById('description')
        if(lines){
            if(lines.offsetHeight / 22 > 7) setViewMore('More')
        }
    }

    const viewMoreHandle = () => {
        setViewMore(current => {
            if(current === 'More') return current = 'Less'
            else return current = 'More'
        })
    }

    const updateSeriesData = () => {
        const updatePromise = new Promise( async (resolve, reject) => {
            var imgName = ''
            var imgURL = productData.img
            var imgChange = {isImageChange: false}
            var isTitleChange = false
            if(productData.title !== document.getElementById('edit-title').value){
                isTitleChange = true
            }
            if(editImg){
                imgName = Date.now() + '-' + editImg.name.replaceAll(' ','-')
                imgURL = process.env.NEXT_PUBLIC_AWS_S3_URL + '/Series/' + imgName
                imgChange = {isImageChange: true, previousImage: productData.img}
            }
            var isKeywordChange = false
            if(editKeywords !== productData.keywords){
                isKeywordChange = true
            }
            const jwt = localStorage.getItem('jwt')
            const axiosURL = process.env.NEXT_PUBLIC_BACKEND + '/admin/series'
            axios.patch(axiosURL, {
                jwt,
                seriesId: productData.seriesId,
                title: document.getElementById('edit-title').value,
                author: document.getElementById('edit-author').value,
                illustrator: document.getElementById('edit-illustrator').value,
                publisher: document.getElementById('edit-publisher').value,
                genres: editGenres,
                keywords: editKeywords,
                img: imgURL,
                description: document.getElementById('edit-description').value,
                isTitleChange,
                imgChange,
                isKeywordChange,
            }).then( async result => {
                if(editImg){
                    const parallelUploads3 = new Upload({
                        client: new S3Client({
                        region: process.env.NEXT_PUBLIC_AWS_S3_REGION,
                        credentials: {
                            accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID,
                            secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_SECRET_ACCESS_KEY
                        }
                        }),
                        params: { 
                        Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
                        Key: 'Series/' + imgName,
                        Body: editImg
                        },
                        partSize: 1024 * 1024 * 5,
                        leavePartsOnError: false,
                    })
                    await parallelUploads3.done()
                }
                getSeriesDetails()
                resolve()
            }).catch( err => {
                reject( err.response.data.message )
                addViewMoreBtn()
            })
        })
        toast.promise(updatePromise, {
            pending: "กำลังอัพเดต",
            success: 'อัพเดตสำเร็จ',
            error: { render({data}){return 'อัพเดตไม่สำเร็จเนื่องจาก ' + data} },
        },{ autoClose: 2000 })
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

    const editHandle = (command) => {
        if(command === 'edit') { setEdit(!edit) }
        else if(command === 'save') {
            Swal.fire({
                title: 'ต้องการบันทึกหรือไม่?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#28A745',
                cancelButtonColor: '#DC3545',
                confirmButtonText: 'Confirm!'
            }).then((result) => {
                if (result.isConfirmed) {
                    setEdit(!edit)
                    updateSeriesData()
                }
            })
            
        }else if(command === 'cancel'){
            Swal.fire({
                title: 'ต้องการยกเลิกหรือไม่?',
                text: "หากยกเลิกข้อมูลที่แก้ไขจะไม่ได้รับการบันทึก",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DC3545',
                cancelButtonColor: '#A3A4A5',
                confirmButtonText: 'Confirm!'
            }).then((result) => {
                if (result.isConfirmed) {
                    setEdit(!edit)
                    setEditImg(undefined)
                }
            })
        }
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
    const saveImage = (e) => {
        setEditImg(e.target.files[0])
    }
    const removeEditImg = () => {
        inputImage.current.value = ''
        setEditImg()
    }
    const deleteSeries = () => {
        Swal.fire({
            title: 'ต้องการลบสินค้าหรือไม่',
            text: "หากลบซี่รีย์แล้วไม่สามารถแก้ไขได้ พิมพ์ DELETE เพื่อยืนยันการลบ",
            icon: 'warning',
            input: 'text',
            inputAttributes: {
              autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            confirmButtonColor: '#DC3545',
            cancelButtonColor: '#A3A4A5',
            showLoaderOnConfirm: true,
            preConfirm: (confirmText) => {
                if(confirmText === 'DELETE'){
                    const deletePromise = new Promise( (resolve, reject) => {
                        const axiosURL = process.env.NEXT_PUBLIC_BACKEND + '/admin/series?seriesId=' + router.query.seriesId
                        axios.delete(axiosURL, { headers: { jwt: localStorage.getItem('jwt') }})
                        .then(result => {
                            resolve()
                            setTimeout(() => {
                                const redirectURL = '/admin/series/'
                                router.push({pathname: redirectURL, query:{} }, undefined,{ shallow: true } )
                            }, 2000)
                        }).catch(err => {
                            reject(err.response.data.message)
                        })
                    })
                    toast.promise(deletePromise, {
                        pending: "กำลังลบ",
                        success: 'ลบสำเร็จแล้ว',
                        error:  { render({data}){return 'อัพเดตไม่สำเร็จเนื่องจาก ' + data} },
                    },{ autoClose: 2000 })
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'ข้อความไม่ถูกต้อง',
                    })
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        })
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
    } else
    return (
        <div className={styles.container}>
            <Head>
                <title>{productData.title? productData.title + '|' : null} PT Bookstore</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <SideNav />
            <ToastContainer />
            <div className={styles.contentContainer}>
                <div className={styles.productWrap}>
                    <div className={styles.detailsWrap}>
                        <div className={styles.title}> {productData.title} </div>
                        <div className={styles.flexRow}>
                            <div>
                                <div className={styles.imageWrap}>
                                    {
                                        productData.img != undefined && <Image src={productData.img} alt='Product image' layout="fill" objectFit='cover' />
                                    }
                                    {
                                        edit && <div className={styles.fileDropArea}>
                                            <div className={styles.imagesPreview} id='containerPreviewImg'>
                                            { editImg && <Image src={URL.createObjectURL(editImg)} id='pre-img' layout="fill" objectFit='cover'/> }
                                            </div>
                                            <input ref={inputImage} className={styles.inputField} type="file" name='file' onChange={saveImage} accept="image/png, image/jpeg, image/jpg, image/gif"/>
                                            <div className={styles.fakeBtn}>Choose files</div>
                                            <div className={styles.msg}>or drag and drop files here</div>
                                        </div>
                                    }
                                </div>
                                { editImg && <div className={styles.btn} onClick={() => removeEditImg()}>ลบรูป</div> }
                            </div>
                            <div className={styles.detailsGroup}>

                                <div className={styles.subDetails}>
                                    <div className={styles.label}>Series Id :</div>
                                    <div className={styles.value}>{productData.seriesId}</div>
                                </div>
                                { edit && <div className={styles.subDetails}>
                                    <div className={styles.label}>ชื่อเรื่อง :</div>
                                    <input id='edit-title' className={styles.input} defaultValue={productData.title}/>
                                </div> 
                                }
                                <div className={styles.subDetails}>
                                    <div className={styles.label}>ผู้เขียน :</div>
                                    { !edit && <div className={styles.value}>{productData.author}</div>}
                                    { edit && <input id='edit-author' className={styles.input} defaultValue={productData.author}/> }
                                </div>
                                <div className={styles.subDetails}>
                                    <div className={styles.label}>ภาพประกอบ :</div>
                                    { !edit && <div className={styles.value}>{productData.illustrator}</div>}
                                    { edit && <input id='edit-illustrator' className={styles.input} defaultValue={productData.illustrator}/> }
                                </div>
                                <div className={styles.subDetails}>
                                    <div className={styles.label}>สำนักพิมพ์ :</div>
                                    { !edit && <div className={styles.value}>{productData.publisher}</div>}
                                    { edit && <input id='edit-publisher' className={styles.input} defaultValue={productData.publisher}/> }
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
                                    <div className={styles.value}>{showDate(productData.addDate)} </div>
                                </div>
                                <div className={styles.subDetails}>
                                    <div className={styles.label}>วันที่แก้ไขล่าสุด:</div>
                                    <div className={styles.value}>{showDate(productData.lastModify)} </div>
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
                                    <textarea id='edit-description' className={styles.textArea} defaultValue={productData.description}></textarea>
                                )
                            }
                        </div>
                        <div className={styles.listAllProduct}>
                            <div>สินค้าทั้งหมด { productData.products != undefined && productData.products.totalProducts} รายการ </div>
                            <div className={styles.btnGroup}>
                                <Link href={`/admin/series/addProduct/?seriesId=${router.query.seriesId}&title=${productData.title}`}><a className={styles.btn}><MdOutlineAddToPhotos /> add product</a></Link>
                                { !edit && <div className={styles.btn} onClick={() => editHandle('edit')}><AiOutlineEdit />Edit</div> }
                                {
                                    edit && (
                                        <>
                                            <div className={`${styles.btn} ${styles.btnGray}`} onClick={() => deleteSeries()}><MdDeleteForever />Delete</div>
                                            <div className={`${styles.btn} ${styles.btnGreen}`} onClick={() => editHandle('save')}><IoMdSave />save</div>
                                            <div className={`${styles.btn} ${styles.btnRed}`} onClick={() => editHandle('cancel')}><MdOutlineCancel />cancel</div>
                                        </>
                                    )
                                }
                            </div>
                        </div>
                    </div>

                    {/* Novel List */}
                    { (productData.products != undefined) && (productData.products.totalNovel > 0) && (
                        <ProductListSM data={novelProducts} title='นิยาย' length={productData.products.totalNovel} category='novel' url={`/admin/series/${router.query.seriesId}/`}/>
                    )}
                    
                    {/* Manga List */}
                    { (productData.products != undefined) && (productData.products.totalManga > 0) && (
                        <ProductListSM data={mangaProducts} title='มังงะ' length={productData.products.totalManga} category='manga' url={`/admin/series/${router.query.seriesId}/`} />
                    )}

                    {/* Manga List */}
                    { (productData.products != undefined) && (productData.products.totalOther > 0) && (
                        <ProductListSM data={otherProducts} title='สินค้าอื่นๆ' length={productData.products.totalOther} category='other' url={`/admin/series/${router.query.seriesId}/`} />
                    )}

                </div>
            </div>
        </div>
    );
}