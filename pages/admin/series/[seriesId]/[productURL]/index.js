import axios from "axios"
import Image from 'next/image'
import Head from 'next/head'
import { useState, useEffect, useRef } from "react"
import { useRouter } from 'next/router'
import SideNav from 'components/admin/adminSideNavbar'
import styles from './product.module.css'
import Link from "next/link"
import Swal from 'sweetalert2'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Upload } from "@aws-sdk/lib-storage"
import { S3Client, S3 } from "@aws-sdk/client-s3"
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Mousewheel, Pagination } from "swiper"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"

import { AiOutlineEdit } from 'react-icons/ai'
import { MdDeleteForever, MdOutlineCancel } from 'react-icons/md'
import { RiCloseCircleLine, RiArrowDownSLine } from 'react-icons/ri'
import { IoMdSave } from 'react-icons/io'

export default function SpecificProduct() {
    const [ productData, setProductData ] = useState({score:{}})
    const [ edit, setEdit ] = useState(false)
    const [ viewMore, setViewMore ] = useState('hide')
    const [ showImage, setShowImage ] = useState()

    const [ previewImage, setPreviewImage ] = useState()
    const [ editImg, setEditImg ] = useState([])
    const [ editCategory, setEditCategory ] = useState({})
    const [ editStatus, setEditStatus ] = useState({})
    const router = useRouter()

    function getProductDetails(){
        const url = process.env.NEXT_PUBLIC_BACKEND + '/product/productDetailLessData/' + router.query.productURL + '?seriesId=' + router.query.seriesId 
        axios.get(url).then( result => {
            console.log(result.data)
            setProductData(result.data)
            setShowImage(result.data.img[0])
            setNConvertStatus(result.data.status)
            setEditCategory(result.data.thai_category)
        }).catch(err => {
            // console.log(err)
            const errorMessage = <>ไม่พบข้อมูลสินค้า<br/>กลับหน้าหลักใน 5 วินาที</>
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
                    const redirectURL = '/admin/series/' + router.query.seriesId
                    router.push({pathname: redirectURL, query:{} }, undefined,{ shallow: true } )
                },
                enableHtml: true
            })
        })
    }

    useEffect( () => {
        if(router.isReady){
            const pid = router.query
            getProductDetails()
        }
    }, [router])

    const uploadProductData = () => {
        const updatePromise = new Promise( async (resolve, reject) => {
            var listImgName = []
            var listImgURL = []
            var isImageChange = false
            if(editImg.length > 0){
                editImg.forEach( async element => {
                    const imgName = Date.now() + '-' + element.name.replaceAll(' ','-')
                    const imgURL = process.env.NEXT_PUBLIC_AWS_S3_URL + '/Products/' + router.query.seriesId + '/' + imgName
                    listImgName.push(imgName)
                    listImgURL.push(imgURL)
                })
                isImageChange = true
            }
            const jwt = localStorage.getItem('jwt')
            const axiosURL = process.env.NEXT_PUBLIC_BACKEND + '/admin/product'

            var category
            if(editCategory === 'นิยาย') category = 'novel'
            else if(editCategory === 'มังงะ') category = 'manga'
            else if(editCategory === 'สินค้า') category = 'other'

            var isUrlChange = false
            if( document.getElementById('edit-title').value !== productData.title || document.getElementById('edit-bookNum').value !== productData.bookNum){
                isUrlChange = true 
            }
            var isCategoryChange = false
            if(category != productData.category){
                isUrlChange = true 
                isCategoryChange = true
            }
            var new_amount = document.getElementById('edit-amount').value
            var isNotify = false
            if( productData.amount === 0 && new_amount > 0){
                isNotify = true
            } else if( productData.status === 'out' && editStatus.status !== 'out' && new_amount > 0){
                isNotify = true
            }

            var data = {
                jwt,
                id: productData._id,
                seriesId: router.query.seriesId,
                url: router.query.productURL,
                title: document.getElementById('edit-title').value,
                bookNum: document.getElementById('edit-bookNum').value,
                category,
                thai_category: editCategory,
                status: editStatus.status,
                price: document.getElementById('edit-price').value,
                amount: document.getElementById('edit-amount').value,
                description: document.getElementById('edit-description').value,
                isCategoryChange,
                isUrlChange,
                isImageChange,
                listImgURL,
                previousCategory: productData.category,
                isNotify,
            }
            
            axios.patch(axiosURL, data)
            .then( result => {
                if(editImg.length > 0){
                    editImg.forEach( async (element, index) => {
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
                                Key: 'Products/' + router.query.seriesId + '/' + listImgName[index],
                                Body: element
                            },
                            partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
                            leavePartsOnError: false, // optional manually handle dropped parts
                        })
                        await parallelUploads3.done()
                    })
                }

                setEditImg([])
                setPreviewImage()
                resolve()
                // redirect when data change
                // delay 0.5s for image load
                setTimeout(() => {
                    const redirectURL = '/admin/series/' + router.query.seriesId + '/' + result.data.url
                    router.push({pathname: redirectURL, query:{} }, undefined,{ shallow: true } )
                }, 500)
            }).catch( err => {
                reject( err.response.data.message )
                addViewMoreBtn()
            })
        })
        toast.promise(updatePromise, {
            pending: "กำลังอัพเดต",
            success: 'อัพเดตสำเร็จ',
            error:  { render({data}){return 'อัพเดตไม่สำเร็จเนื่องจาก ' + data} }
        },{ autoClose: 2000 })
    }

    const showDate = (time) => {
        if(!time){
            return 0
        }
        const [d1,d2] = new Date(time).toISOString().split('T')
        return d1
    }

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
                    uploadProductData()
                    setEdit(!edit)
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
                    removeEditImg()
                    setNConvertStatus(productData.status)
                    setEditCategory(productData.thai_category)
                }
            })
        }
    }

    const deleteProduct = () => {
        Swal.fire({
            title: 'ต้องการลบสินค้าหรือไม่',
            text: "หากลบสินค้าแล้วจะไม่สามารถแก้ไขได้ พิมพ์ DELETE เพื่อยืนยันการลบ",
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
                        const axiosURL = process.env.NEXT_PUBLIC_BACKEND + '/admin/product?productId=' + productData.productId 
                            + '&_id=' + productData._id + '&category=' + productData.category + '&seriesId=' + productData.seriesId
                        axios.delete(axiosURL, { headers: { jwt: localStorage.getItem('jwt') }})
                        .then(result => {
                            resolve()
                            setTimeout(() => {
                                const redirectURL = '/admin/series/' + router.query.seriesId
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

    const saveImage = (e) => {
        const tempImage = [...e.target.files]
        const filter = []
        var error = 0
        var allowedExtensions = /(\jpg|\jpeg|\png|\gif)$/i
        tempImage.forEach(element => {
            if (allowedExtensions.exec(element.type)) {
                filter.push(element)
            } else {
                error++
            }
        })
        // setFile([...e.target.files])
        // setPreviewImg(e.target.files[0])
        if(error !== 0){
            toast.warning('some file not allow', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            })
        }
        setEditImg(filter)
        setPreviewImage(filter[0])
    }

    const removeEditImg = () => {
        setEditImg([])
        setPreviewImage()
        document.getElementById('fileInput').value = null
    }

    const showDropdownHandle1 = () => {
        const container = document.getElementById('category-dropdown')
        if(container.classList.length === 1){
            container.classList.add(styles.showDropdown)
            document.addEventListener('mouseup', mouseUpHandle1)
        } else {
            container.classList.remove(styles.showDropdown)
        }
    }
    const mouseUpHandle1 = (e) => {
        const container = document.getElementById('category-dropdown')
        if (!container.contains(e.target)) {
            container.classList.remove(styles.showDropdown)
            document.removeEventListener('mouseup', mouseUpHandle1)
        }
    }
    const changeStatusHandle1 = (e) => {
        const container = document.getElementById('category-dropdown')
        container.classList.remove(styles.showDropdown)
        document.removeEventListener('mouseup', mouseUpHandle1)
        var newValue = e.target.getAttribute('data-value')
        setEditCategory(newValue)
    }

    const showDropdownHandle = () => {
        const container = document.getElementById('status-dropdown')
        if(container.classList.length === 1){
            container.classList.add(styles.showDropdown)
            document.addEventListener('mouseup', mouseUpHandle)
        } else {
            container.classList.remove(styles.showDropdown)
        }
    }
    const mouseUpHandle = (e) => {
        const container = document.getElementById('status-dropdown')
        if (!container.contains(e.target)) {
            container.classList.remove(styles.showDropdown)
            document.removeEventListener('mouseup', mouseUpHandle)
        }
    }
    const changeStatusHandle = (e) => {
        const container = document.getElementById('status-dropdown')
        container.classList.remove(styles.showDropdown)
        document.removeEventListener('mouseup', mouseUpHandle)
        var newValue = e.target.getAttribute('data-value')
        setNConvertStatus(newValue)
    }

    const setNConvertStatus = (status) => {
        if(status === 'available'){
            setEditStatus({status, thai: 'พร้อมจำหน่าย'})
        } else if(status === 'out'){
            setEditStatus({status, thai: 'หมด'})
        } else if(status === 'preOrder'){
            setEditStatus({status, thai: 'พรีออเดอร์'})
        }
    }

    return (
        <div>
            <Head>
                { productData.title? <title>{productData.title} {productData.bookNum} | PT Bookstore</title> : <title>PT Bookstore</title> }
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className={styles.container}>
                <SideNav />
                <ToastContainer />
                <div className={styles.contentContainer}>
                    <div className={styles.productWrap}>
                        <div className={styles.detailsWrap}>
                            <div className={styles.title}> {productData.title} </div>
                            <div className={styles.flexRow}>

                                <div className={styles.imageContainer}>
                                    <div className={styles.largeImage}>
                                        <img src={showImage}/>
                                        {
                                            edit && <div className={styles.fileDropArea}>
                                                <div className={styles.imagesPreview} id='containerPreviewImg'>
                                                { editImg.length > 0 && <Image src={URL.createObjectURL(previewImage)} id='pre-img' layout="fill" objectFit='cover'/> }
                                                </div>
                                                <input id='fileInput' className={styles.inputField} type="file" name='file' multiple onChange={e => saveImage(e)} accept="image/png, image/jpeg, image/jpg, image/gif"/>
                                                <div className={styles.fakeBtn}>Choose files</div>
                                                <div className={styles.msg}>or drag and drop files here</div>
                                            </div>
                                        }
                                    </div>
                                    <div className={styles.listImages}>
                                        <Swiper
                                            slidesPerView={3}
                                            spaceBetween={0}
                                            freeMode={true}
                                            mousewheel={true}
                                            pagination={{
                                                clickable: true,
                                            }}
                                            modules={[FreeMode, Mousewheel, Pagination]}
                                            className="listImage"
                                            >
                                            {
                                                editImg.length === 0 && productData.img!== undefined && productData.img.map( (element, index) => {
                                                    return (
                                                        <SwiperSlide key={`list-img-${index}`}>
                                                            <div className={styles.image}>
                                                                <img src={element} onClick={ e => setShowImage(element) }/>
                                                            </div>
                                                        </SwiperSlide>
                                                    )
                                                })
                                            }
                                            {
                                                (editImg.length > 0 ) && editImg.map( (element, index) => {
                                                    return (
                                                        <SwiperSlide key={`list-edit-img-${index}`}>
                                                            <div className={styles.image}>
                                                                <img src={URL.createObjectURL(element)} onClick={ e => setPreviewImage(element) }/>
                                                            </div>
                                                        </SwiperSlide>
                                                    )
                                                })
                                            }
                                        </Swiper>
                                        { (editImg.length > 0 ) && <div className={styles.btn} onClick={() => removeEditImg()}>ลบรูป</div> }
                                    </div>
                                </div>

                                <div className={styles.detailsGroup}>

                                    <div className={styles.subDetails}>
                                        <div className={styles.label}>Series Id :</div>
                                        <div className={styles.value}>{productData.seriesId}</div>
                                    </div>
                                    <div className={styles.subDetails}>
                                        <div className={styles.label}>Product Id :</div>
                                        <div className={styles.value}>{productData.productId}</div>
                                    </div>
                                    <div className={styles.subDetails}>
                                        <div className={styles.label}>ซีรี่ย์ :</div>
                                        <div className={styles.value}>{productData.seriesTitle}</div>
                                    </div>
                                    <div className={styles.subDetails}>
                                        <div className={styles.label}>ชื่อสินค้า :</div>
                                        { !edit && <div className={styles.value}>{productData.title}</div> }
                                        { edit && <input id='edit-title' className={styles.input} defaultValue={productData.title}/> }
                                    </div>
                                    <div className={styles.subDetails}>
                                        <div className={styles.label}>
                                            {productData.category !== 'other' && <>เล่มที่ : </>} 
                                            {productData.category === 'other' && <>เลขสินค้า : </>} 
                                        </div>
                                        { !edit && <div className={styles.value}>{productData.bookNum}</div>}
                                        { edit && <input id='edit-bookNum' className={styles.input} defaultValue={productData.bookNum}/> }
                                    </div>
                                    <div className={styles.subDetails}>
                                        <div className={styles.label}>ประเภท :</div>
                                        { !edit && <div className={styles.value}>{productData.thai_category}</div>}
                                        { edit && <div id='category-dropdown' className={`${styles.dropdownGroup}`} >
                                            <div className={styles.dropdownSelection} onClick={e => showDropdownHandle1(e)}><div>{editCategory}</div> <RiArrowDownSLine/></div>
                                            <div className={styles.dropdownList} onClick={e => changeStatusHandle1(e)}>
                                                <div className={styles.dropdownItem} data-value={'นิยาย'}>นิยาย</div>
                                                <div className={styles.dropdownItem} data-value={'มังงะ'}>มังงะ</div>
                                                <div className={styles.dropdownItem} data-value={'สินค้า'}>สินค้า</div>
                                            </div>
                                        </div> 
                                        }
                                    </div>
                                    <div className={styles.subDetails}>
                                        <div className={styles.label}>สถานะ :</div>
                                        { !edit && <div className={styles.value}>{editStatus.thai}</div>}
                                        { edit && <div id='status-dropdown' className={`${styles.dropdownGroup}`} >
                                            <div className={styles.dropdownSelection} onClick={e => showDropdownHandle(e)}><div>{editStatus.thai}</div> <RiArrowDownSLine/></div>
                                            <div className={styles.dropdownList} onClick={e => changeStatusHandle(e)}>
                                                <div className={styles.dropdownItem} data-value={'available'}>พร้อมจำหน่าย</div>
                                                <div className={styles.dropdownItem} data-value={'out'}>หมด</div>
                                                <div className={styles.dropdownItem} data-value={'preOrder'}>พรีออเดอร์</div>
                                            </div>
                                        </div> 
                                        }
                                    </div>
                                    <div className={styles.subDetails}>
                                        <div className={styles.label}>ราคา :</div>
                                        { !edit && <div className={styles.value}>{productData.price} บาท</div>}
                                        { edit && <input id='edit-price' className={styles.input} defaultValue={productData.price}/> }
                                    </div>
                                    <div className={styles.subDetails}>
                                        <div className={styles.label}>จำนวนในคลัง :</div>
                                        { !edit && <div className={styles.value}>{productData.amount}</div>}
                                        { edit && <input id='edit-amount' className={styles.input} defaultValue={productData.amount}/> }
                                    </div>

                                    <div className={styles.subDetails}>
                                        <div className={styles.label}>ขายแล้ว :</div>
                                        <div className={styles.value}>{productData.sold || 0}</div>
                                    </div>
                                    <div className={styles.subDetails}>
                                        <div className={styles.label}>คะแนน :</div>
                                        <div className={styles.value}>{productData.score.avg}</div>
                                    </div>
                                    <div className={styles.subDetails}>
                                        <div className={styles.label}>จำนวนรีวิว :</div>
                                        <div className={styles.value}>{productData.score.count}</div>
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
                            <div className={styles.btnGroup}>
                                
                                { productData._id && !edit && <div className={styles.btn} onClick={() => editHandle('edit')}><AiOutlineEdit />Edit</div> }
                                {
                                    edit && (
                                        <>
                                            <div className={`${styles.btn} ${styles.btnGray}`} onClick={() => deleteProduct()}><MdDeleteForever />Delete</div>
                                            <div className={`${styles.btn} ${styles.btnGreen}`} onClick={() => editHandle('save')}><IoMdSave />save</div>
                                            <div className={`${styles.btn} ${styles.btnRed}`} onClick={() => editHandle('cancel')}><MdOutlineCancel />cancel</div>
                                        </>
                                    )
                                }
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
