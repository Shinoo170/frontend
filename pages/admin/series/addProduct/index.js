import axios from "axios"
import { useState, useEffect } from "react"
import { useRouter } from 'next/router'
import SideNav from 'components/admin/adminSideNavbar'
import styles from './addProduct.module.css'
import Head from 'next/head'

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
  const [ isAdmin, setIsAdmin ] = useState(false)
  
  useEffect( () => {
    if(router.isReady){
      if(localStorage.getItem('jwt')){
          axios.get('/api/isAdmin', {
              headers: { jwt: localStorage.getItem('jwt') }
          }).then(result => {
              if(result.data.isAdmin){
                  setIsAdmin(true)
                  setSeriesId(router.query.seriesId)
              } else {
                  router.push({pathname: '/', query:{ } }, undefined,{ shallow: false } )
                  return
              }
          }).catch(err => {
            console.log(err)
              router.push({pathname: '/', query:{ } }, undefined,{ shallow: false } )
              return
          })
      } else {
          router.push({pathname: '/', query:{ } }, undefined,{ shallow: false } )
          return
      }
    }
  }, [router])

  useEffect(() => {
    try{
      document.getElementById('title').value = router.query.title
      document.getElementById('seriesId').value = router.query.seriesId
    } catch (err){ }
  }, [isAdmin])


  useEffect( () => {
    try{
      if(productStatus === 'out'){
        document.getElementById('amount').disabled = true
        document.getElementById('amount').value = 0
      } else {
        document.getElementById('amount').disabled = false
      }
    } catch (err){ }
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
      toast.error('?????????????????????????????????????????????', {
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
        if(category === 'manga') thai_category = '???????????????'
        else if(category === 'novel') thai_category = '???????????????'
        else if(category === 'other') thai_category = '??????????????????'
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
            <title>Add Product | PT Bookstore</title>
            <meta name="description" content="Generated by create next app" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
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
              <div className={styles.label}>?????????????????????</div>
              <input id='bookNum' required/>
            </div>

            <div className={styles.labelRadio}>??????????????????</div> 
            <div className={styles.radioInputWrap}>
              <input type='radio' label='???????????????' name='type' value='manga' checked={category === 'manga'} onChange={onCategoryChange}/>
              <input type='radio' label='???????????????' name='type' value='novel' checked={category === 'novel'} onChange={onCategoryChange}/>
              <input type='radio' label='?????????????????????????????????' name='type' value='other' checked={category === 'other'} onChange={onCategoryChange}/>
            </div>

            <div className={styles.inputWrap}>
              <div className={styles.label}>description</div>
              <textarea id='description'></textarea>
            </div>

            <div className={styles.labelRadio}>?????????????????????????????????</div> 
            <div className={styles.radioInputWrap}>
              <input type='radio' label='????????????????????????????????????' name='productStatus' value='available' checked={productStatus === 'available'} onChange={onProductStatusChange}/>
              <input type='radio' label='?????????' name='productStatus' value='out' checked={productStatus === 'out'} onChange={onProductStatusChange}/>
              <input type='radio' label='??????????????????????????????' name='productStatus' value='preOrder' checked={productStatus === 'preOrder'} onChange={onProductStatusChange}/>
            </div>

            <div className={styles.inputWrap}>
              <div className={styles.label}>????????????</div>
              <input id='price' type='number' min='1' required/>
            </div>

            <div className={styles.inputWrap}>
              <div className={styles.label}>?????????????????????????????????</div>
              <input id='amount' type='number' min='0' required/>
            </div>

            <button className={styles.button4} type='submit'>Add Product</button>

          </form>

        </div>

      </div>
    </div>
  );
}

