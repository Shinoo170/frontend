import axios from "axios"
import { useState, useEffect } from "react"
import { useRouter } from 'next/router'
import SideNav from 'components/admin/adminSideNavbar'
import styles from './addProduct.module.css'

import { Upload } from "@aws-sdk/lib-storage";
import { S3Client, S3 } from "@aws-sdk/client-s3";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Mousewheel, Pagination } from "swiper"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"

export default function AddProduct() {
  const [file, setFile] = useState([])
  const [previewImg, setPreviewImg] = useState()
  const [ seriesId, setSeriesId ] = useState()
  const [ category, setCategory ] = useState('manga')
  const [ productStatus, setProductStatus ] = useState('available')
  const router = useRouter()
  
  useEffect( () => {
    if(router.isReady){
        setSeriesId(router.query.seriesId)
        document.getElementById('title').value = router.query.title
        document.getElementById('seriesId').value = router.query.seriesId
    }
  }, [router])

  useEffect( () => {
    if(productStatus === 'out'){
      document.getElementById('amount').disabled = true
      document.getElementById('amount').value = 0
    } else {
      document.getElementById('amount').disabled = false
    }
  }, [productStatus])

  const saveFile = (e) => {
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
    setFile([...filter])
    setPreviewImg(filter[0])
  }

  const uploadProduct = async (e) => {
    e.preventDefault()
    if(file.length === 0) {
      toast.error('กรุณาอัพโหลดรูป', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        })
        return
    }
    try{
      const myPromise = new Promise( async (resolve, reject) => {
        const listImageName = []
        const listImgURL = []
        // [ Upload image ]
        file.forEach( async element => {
          const imgName = Date.now() + '-' + element.name.replaceAll(' ','-')
          const imgURL = process.env.NEXT_PUBLIC_AWS_S3_URL + '/Products/' + seriesId + '/' + imgName
          listImageName.push(imgName)
          listImgURL.push(imgURL)
        })

        var thai_category = ''
        if(category === 'manga') thai_category = 'มังงะ'
        else if(category === 'novel') thai_category = 'นิยาย'
        else if(category === 'other') thai_category = 'สินค้า'
        const jwt = localStorage.getItem('jwt')
        const axiosURL = process.env.NEXT_PUBLIC_BACKEND + '/admin/addProduct'
        await axios.post( axiosURL , {
          jwt,
          seriesId: parseInt(seriesId),
          title: e.target.title.value,
          bookNum: e.target.bookNum.value,
          category: category,
          thai_category,
          description: e.target.description.value,
          status: productStatus,
          price: e.target.price.value,
          amount: e.target.amount.value,
          img: listImgURL,
        }).then( res => {
          // [ Upload image ]
          file.forEach( async (element, index) => {
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
                Key: 'Products/' + seriesId + '/' + listImageName[index],
                Body: element
              },
              partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
              leavePartsOnError: false, // optional manually handle dropped parts
            })
            await parallelUploads3.done()
          })
          resolve( res.data.message )
        }).catch( err => {
          console.log(err)
          reject( err.response.data.message )
        })
      })
      toast.promise(myPromise, {
        pending: "Pending",
        success: {
          render({data}){return data}
        },
        error: {
          render({data}){return data}
        }
      })
    } catch(err) {
      console.log(err)
    }
  }

  const onCategoryChange = (event) => {
    setCategory(event.target.value)
  }
  const onProductStatusChange = (event) => {
    setProductStatus(event.target.value)
  }
  
  return (
    <div className={styles.container}>
      <SideNav />
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className={styles.contentContainer}>
        
        <div className={styles.addProductWrap}>
          
          <div className={styles.uploadFiled}>
            <div className={styles.fileDropArea}>
                <div className={styles.imagesPreview} id='containerPreviewImg'>
                  { previewImg && <img src={URL.createObjectURL(previewImg)} id='pre-img'/> }
                </div>
                <input className={styles.inputField} type="file" multiple onChange={saveFile} accept="image/png, image/jpeg, image/jpg, image/gif"/>
                <div className={styles.fakeBtn}>Choose files</div>
                <div className={styles.msg}>or drag and drop files here</div>
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
                  file.map( (element, index) => {
                    return (
                      <SwiperSlide key={`list-img-${index}`}>
                        <div className={styles.image}>
                          <img src={URL.createObjectURL(element)} onClick={ e => setPreviewImg(element) }/>
                        </div>
                      </SwiperSlide>
                    )
                  })
                }
              </Swiper>
            </div>
            
          </div>
          <form className={styles.inputFormWrap} onSubmit={e => uploadProduct(e)}>

            <div className={styles.inputWrap}>
              <div className={styles.label}>Title</div>
              <input id='title' required/>
            </div>
            
            <div className={styles.inputWrap}>
              <div className={styles.label}>SeriesId</div>
              <input id='seriesId' disabled required/>
            </div>

            <div className={styles.inputWrap}>
              <div className={styles.label}>เล่มที่</div>
              <input id='bookNum' required/>
            </div>

            <div className={styles.labelRadio}>ประเภท</div> 
            <div className={styles.radioInputWrap}>
              <input type='radio' label='มังงะ' name='type' value='manga' checked={category === 'manga'} onChange={onCategoryChange}/>
              <input type='radio' label='นิยาย' name='type' value='novel' checked={category === 'novel'} onChange={onCategoryChange}/>
              <input type='radio' label='สินค้าอื่นๆ' name='type' value='other' checked={category === 'other'} onChange={onCategoryChange}/>
            </div>

            <div className={styles.inputWrap}>
              <div className={styles.label}>description</div>
              <textarea id='description'></textarea>
            </div>

            <div className={styles.labelRadio}>สถานะสินค้า</div> 
            <div className={styles.radioInputWrap}>
              <input type='radio' label='พร้อมจำหน่าย' name='productStatus' value='available' checked={productStatus === 'available'} onChange={onProductStatusChange}/>
              <input type='radio' label='หมด' name='productStatus' value='out' checked={productStatus === 'out'} onChange={onProductStatusChange}/>
              <input type='radio' label='พรีออเดอร์' name='productStatus' value='preOrder' checked={productStatus === 'preOrder'} onChange={onProductStatusChange}/>
            </div>

            <div className={styles.inputWrap}>
              <div className={styles.label}>ราคา</div>
              <input id='price' type='number' required/>
            </div>

            <div className={styles.inputWrap}>
              <div className={styles.label}>จำนวนสินค้า</div>
              <input id='amount' type='number' required/>
            </div>

            <button className={styles.button4} type='submit'>Add Product</button>

          </form>

        </div>

      </div>
    </div>
  );
}

