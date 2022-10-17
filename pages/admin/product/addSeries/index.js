import axios from "axios";
import { useState, useEffect } from "react";
import SideNav from 'components/admin/adminSideNavbar'
import styles from './addSeries.module.css'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Upload } from "@aws-sdk/lib-storage";
import { S3Client, S3 } from "@aws-sdk/client-s3";

import { RiCloseCircleLine } from 'react-icons/ri'

export default function AddSeries() {
  const [ file, setFile ] = useState('')
  const [ inputData, setInputData ] = useState()
  const [ genres, setGenres ] = useState([])
  const [ keywords, setKeywords] = useState([])
  const [ author, setAuthor ] = useState('')

  const saveFile = (e) => {
    setFile(e.target.files[0])
  }
  
  const uploadSeries = async (e) => {
    e.preventDefault()
    try{
      const myPromise = new Promise( async (resolve, reject) => {
        // [ Upload image ]
        const imgName = Date.now() + '-' + file.name.replaceAll(' ','-')
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

        const axiosURL = process.env.NEXT_PUBLIC_BACKEND + '/admin/addSeries'
        const imgURL = process.env.NEXT_PUBLIC_AWS_S3_URL + '/Series/' + imgName
        const mergeKeywords = [author, ...genres, ...keywords]
        const ky = mergeKeywords.map(e => e.toLowerCase())
        await axios.post( axiosURL , {
          title: inputData.title,
          author: inputData.author,
          illustrator: inputData.illustrator,
          publisher:  inputData.publisher,
          description: inputData.description,
          genres,
          keywords: ky,
          img: imgURL,
        }).then( res => {
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

  const onChangeHandler = (event) => {
    const {name, value} = event
    setInputData((prev) => {
      return {...prev, [name]: value}
    })
  }

  // Get Genres && Keywords and display in dropdown
  // var globalGenres = []
  // const getGenresKeywords = async () => {
  //   const url = process.env.BACKEND + '/product/genres'
  //   await axios.get(url).then( (result) => {
  //     const array = result.data
  //     array.forEach( e => {
  //       globalGenres.push(e.keyword)
  //     })
  //     console.log(globalGenres)

  //     setKeyword(result.data)
  //   })
  // }

  // function showGenres() {
  //   return keywords.map( (element, index) => {
  //     return ( 
  //       <div id={`genres-${index}`} key={`genres-${index}`} className={styles.dropdownItem}>{element.keyword}</div>
  //     )
  //   })
  // }
  // function showKeywords() {
  //   return keywords.map( (element, index) => {
  //     return ( 
  //       <div id={`keyword-${index}`} key={`keyword-${index}`} className={styles.dropdownItem}>{element.keyword}</div>
  //     )
  //   })
  // }

  // useEffect( () => {
  //   getGenresKeywords()
  // }, [])

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
      if(keywords.indexOf(newKeyword) === -1){
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
            <input className={styles.inputField} type="file" name='file' onChange={saveFile} />
            <div className={styles.fakeBtn}>Choose files</div>
            <div className={styles.msg}>or drag and drop files here</div>
          </div>
          
          <div className={styles.inputFormWarp} onSubmit={e => e.preventDefault()}>

            <div className={styles.inputWarp}>
              <div className={styles.label}>Title</div>
              <input id='title' name='title' onChange={(e) => onChangeHandler(e.target)} />
            </div>
            
            <div className={styles.inputWarp}>
              <div className={styles.label}>author</div>
              <input id='author' name='author' onChange={(e) => { onChangeHandler(e.target); setAuthor(e.target.value) } } />
            </div>

            <div className={styles.inputWarp}>
              <div className={styles.label}>illustrator</div>
              <input id='illustrator' name='illustrator' onChange={(e) => onChangeHandler(e.target)} />
            </div>

            <div className={styles.inputWarp}>
              <div className={styles.label}>publisher</div>
              <input id='publisher' name='publisher' onChange={(e) => onChangeHandler(e.target)} />
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
              
              <input id='genres' name='genres' onKeyUp={e => addGenres(e)} autoComplete="off" />

              {/* <div className={styles.groupDropdown}>
                <input id='genres' name='genres' onChange={(e) => onChangeHandler(e.target)} autoComplete="off" />
                <div className={styles.dropdown}>
                  <div className={styles.dropdownList}>

                  </div>
                </div>
              </div> */}
            </div>

            <div className={styles.inputWarp}>
              <div className={styles.groupLabel}>
                <div className={styles.label}>Keywords : </div>
                {
                  author && (
                  <div  className={styles.details} style={{paddingRight: '9px'}}>
                    { author } <div className={styles.removeIcon}></div>
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
              {/* <div className={styles.groupDropdown}>
                <input id='keyword' name='keyword' onChange={(e) => onChangeHandler(e.target)} autoComplete="off" />
                <div className={styles.dropdown}>
                  <div className={styles.dropdownList}>

                  </div>
                </div>
              </div> */}
              
            </div>

            <button className={styles.button4} onClick={e => uploadSeries(e)}>Add Product</button>

          </div>

        </div>

      </div>
    </div>
  )
}

