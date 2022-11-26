import axios from "axios";
import { useState, useEffect } from "react";
import SideNav from 'components/admin/adminSideNavbar'
import styles from './addSeries.module.css'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { Upload } from "@aws-sdk/lib-storage"
import { S3Client, S3 } from "@aws-sdk/client-s3"

import { RiCloseCircleLine, RiArrowDownSLine } from 'react-icons/ri'

export default function AddSeries() {
  const [ file, setFile ] = useState()
  const [ inputData, setInputData ] = useState()
  const [ genres, setGenres ] = useState([])
  const [ keywords, setKeywords] = useState([])
  const [ author, setAuthor ] = useState('')
  const [ allGenres, setAllGenres ] = useState(['Loading'])

  useEffect(() => {
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
  }, [])

  const saveFile = (e) => {
    const file = e.target.files[0]
    if(file){
      const fileType = file.type
      var allowedExtensions = /(\jpg|\jpeg|\png|\gif)$/i
      if (!allowedExtensions.exec(fileType)) {
        toast.error('Invalid file type', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        })
        return false
      }
    }
    setFile(file)
  }
  
  const uploadSeries = async (e) => {
    e.preventDefault()
    if(file === undefined) {
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
        // [ Upload image ]
        const imgName = Date.now() + '-' + file.name.replaceAll(' ','-')

        const axiosURL = process.env.NEXT_PUBLIC_BACKEND + '/admin/addSeries'
        const imgURL = process.env.NEXT_PUBLIC_AWS_S3_URL + '/Series/' + imgName
        const mergeKeywords = [author, ...genres, ...keywords]
        const ky = mergeKeywords.map(e => e.toLowerCase())
        const jwt = localStorage.getItem('jwt')
        await axios.post( axiosURL , {
          jwt,
          title: inputData.title,
          author: inputData.author,
          illustrator: inputData.illustrator,
          publisher:  inputData.publisher,
          description: inputData.description,
          genres,
          keywords: ky,
          img: imgURL,
        }).then( async res => {
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
              Body: file
            },
            partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
            leavePartsOnError: false, // optional manually handle dropped parts
          })
          await parallelUploads3.done()
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
        },
      })
    } catch(err) {
      console.log(err)
    }
  }

  const onChangeHandler = (event) => {
    const {name, value} = event
    setInputData((prev) => {
      return {...prev, [name]: value}
    })
  }

  function addGenres(event){
    if(event.key === 'Enter'){
      const newGenres = event.target.value
      // new keyword not exist in array
      if(genres.indexOf(newGenres) === -1){
        setGenres([...genres, newGenres])
        event.target.value = ''
      }
    }
  }
  function removeGenres(target){
    const removeTarget = target.element
    const array = genres
    const index = array.indexOf(removeTarget)
    array.splice(index, 1)
    setGenres([...array])
  }

  function addKeywords(event){
    if(event.key === 'Enter'){
      const newKeyword = event.target.value
      // new keyword not exist in array
      if(keywords.indexOf(newKeyword) === -1 && newKeyword!==author && genres.indexOf(newKeyword) === -1){
        setKeywords([...keywords, newKeyword])
        event.target.value = ''
      }
    }
  }
  function removeKeywords(target){
    const removeTarget = target.element
    const array = keywords
    const index = array.indexOf(removeTarget)
    array.splice(index, 1)
    setKeywords([...array])
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

          <div className={styles.fileDropArea}>
            <div className={styles.imagesPreview} id='containerPreviewImg'>
              { file && <img src={URL.createObjectURL(file)} id='pre-img'/> }
            </div>
            <input className={styles.inputField} type="file" name='file' onChange={saveFile} accept="image/png, image/jpeg, image/jpg, image/gif"/>
            <div className={styles.fakeBtn}>Choose files</div>
            <div className={styles.msg}>or drag and drop files here</div>
          </div>
          
          <form className={styles.inputFormWarp} onSubmit={e => uploadSeries(e)}>

            <div className={styles.inputWarp}>
              <div className={styles.label}>Title</div>
              <input id='title' name='title' onChange={(e) => onChangeHandler(e.target)} required/>
            </div>
            
            <div className={styles.inputWarp}>
              <div className={styles.label}>author</div>
              <input id='author' name='author' onChange={(e) => { onChangeHandler(e.target); setAuthor(e.target.value) } } required/>
            </div>

            <div className={styles.inputWarp}>
              <div className={styles.label}>illustrator</div>
              <input id='illustrator' name='illustrator' onChange={(e) => onChangeHandler(e.target)} required/>
            </div>

            <div className={styles.inputWarp}>
              <div className={styles.label}>publisher</div>
              <input id='publisher' name='publisher' onChange={(e) => onChangeHandler(e.target)} required/>
            </div>

            <div className={styles.inputWarp}>
              <div className={styles.label}>description</div>
              <textarea id='description' name='description' onChange={(e) => onChangeHandler(e.target)} ></textarea>
            </div>

            <div className={styles.inputWarp}>
              
              <div className={styles.groupLabel}>
                <div className={styles.label}>genres : </div>
                {
                  genres.map( (element, index)=> {
                    return (
                      <div id={`genres-${index}`} key={`genres-${index}`} className={styles.details}>
                        {element}
                        <div className={styles.removeIcon} onClick={e => removeGenres({element})}>
                          <RiCloseCircleLine />
                        </div>
                      </div>
                    )
                  })
                }
              </div>
              
              {/* <input id='genres' name='genres' onKeyUp={e => addGenres(e)} autoComplete="off" /> */}
              <div id='genres-dropdown' className={`${styles.dropdownGroup}`}>
                  <div className={styles.dropdownSelection} onClick={e => showDropdownHandle(e)}><div>Select Genres</div> <RiArrowDownSLine/></div>
                  <div className={styles.dropdownList} onClick={e => hideDropdownHandle(e)}>
                    {
                      allGenres.map((element, index) => {
                        const handle = (newGenres) => {
                          if(genres.indexOf(newGenres) === -1){
                            setGenres([...genres, newGenres])
                          }
                          const array = keywords
                          const keywordIndex = array.indexOf(newGenres)
                          if(keywordIndex !== -1){
                            array.splice(keywordIndex, 1)
                            setKeywords([...array])
                          }
                        }
                        return (
                            <div id={`id-genres-${index}`} className={styles.dropdownItem} key={`genres-${index}`} onClick={e => handle(element)} >
                                <span id={`id-genres-label-${index}`}>{element}</span>
                            </div>
                        )
                      })
                    }
                  </div>
              </div>
            </div>

            <div className={styles.inputWarp}>
              <div className={styles.groupLabel}>
                <div className={styles.label}>Keywords : </div>
                {
                  author && (
                  <div  className={styles.details} style={{paddingRight: '9px'}}>
                    author : { author } <div className={styles.removeIcon}></div>
                  </div>)
                }
                {
                  genres.map( (element, index)=> {
                    return (
                      <div id={`genres-${index}`} key={`genres-${index}`} className={styles.details}  style={{paddingRight: '6px'}}>
                        {element}<div className={styles.removeIcon}></div>
                      </div>
                    )
                  })
                }
                {
                  keywords.map( (element, index)=> {
                    return (
                      <div id={`keyword-${index}`} key={`keyword-${index}`} className={styles.details}>
                        {element}
                        <div className={styles.removeIcon} onClick={e => removeKeywords({element})}>
                          <RiCloseCircleLine />
                        </div>
                      </div>
                    )
                  })
                }
              </div>

              <input id='keyword' name='keyword' onKeyUp={e => addKeywords(e)} autoComplete="off" />
            </div>

            <button className={styles.button4} type='submit'>Add Product</button>

          </form>

        </div>

      </div>
    </div>
  )
}

