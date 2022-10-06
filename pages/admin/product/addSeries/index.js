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
  const [file, setFile] = useState('')
  const [inputData, setInputData] = useState()
  const [ genres, setGenres ] = useState([])
  const [ keywords, setKeyword] = useState([])

  const saveFile = (e) => {
    setFile(e.target.files[0])

    // reset preview div
    document.getElementById('containerPreviewImg').innerHTML = ""
    var reader = new FileReader()
    reader.addEventListener("load", function() {
      var image = new Image()
      image.title  = e.target.files[0].name
      image.src    = this.result
      image.id     = 'img-1'
      document.querySelector('#containerPreviewImg').appendChild(image)
    })
    reader.readAsDataURL(e.target.files[0])
  }
  
  const uploadSeries = async (e) => {
    e.preventDefault()
    try{
      const imgName = Date.now() + '-' + file.name.replaceAll(' ','-')
      const parallelUploads3 = new Upload({
        client: new S3Client({
          region: process.env.AWS_S3_REGION,
          credentials: {
            accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
          }
        }),
        params: { 
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: 'Series/' + imgName,
          Body: file
        },
        partSize: 1024 * 1024 * 10, // optional size of each part, in bytes, at least 10MB
        leavePartsOnError: false, // optional manually handle dropped parts
      })
      await parallelUploads3.done()

      const axiosURL = process.env.BACKEND + '/admin/addSeries'
      const imgURL = process.env.AWS_S3_URL + '/Series/' + imgName
      const myPromise = new Promise( async (resolve, reject) =>
        await axios.post( axiosURL , {
          title: inputData.title,
          author: inputData.author,
          illustrator: inputData.illustrator,
          publisher:  inputData.publisher,
          description: inputData.description,
          genres: inputData.genres,
          keyword: inputData.keyword,
          img: imgURL,
        }).then( res => {
          resolve( res.data.message )
        }).catch( err => {
          reject( err.response.data.message )
        })
      )
      toast.promise(myPromise, {
        pending: "Promise is pending",
        success: {
          render({data}){return data}
        },
        error: {
          render({data}){return data}
        }
      })
    } catch(err) {
    }
  }

  const onChangeHandler = (event) => {
    const {name, value} = event
    setInputData((prev) => {
      return {...prev, [name]: value}
    })
  }

  var globalGenres = []
  const getGenresKeywords = async () => {
    const url = process.env.BACKEND + '/product/genres'
    await axios.get(url).then( (result) => {
      const array = result.data
      array.forEach( e => {
        globalGenres.push(e.keyword)
      })
      console.log(globalGenres)

      setKeyword(result.data)
    })
  }

  function showGenres() {
    return keywords.map( (element, index) => {
      return ( 
        <div id={`genres-${index}`} key={`genres-${index}`} className={styles.dropdownItem}>{element.keyword}</div>
      )
    })
  }
  function showKeywords() {
    return keywords.map( (element, index) => {
      return ( 
        <div id={`keyword-${index}`} key={`keyword-${index}`} className={styles.dropdownItem}>{element.keyword}</div>
      )
    })
  }

  useEffect( () => {
    getGenresKeywords()
  }, [])

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
            <div className={styles.imagesPreview} id='containerPreviewImg'></div>
            <input className={styles.inputField} type="file" name='file' onChange={saveFile} />
            <div className={styles.fakeBtn}>Choose files</div>
            <div className={styles.msg}>or drag and drop files here</div>
          </div>
          
          <form className={styles.inputFormWarp} onSubmit={uploadSeries}>

            <div className={styles.inputWarp}>
              <div className={styles.label}>Title</div>
              <input id='title' name='title' onChange={(e) => onChangeHandler(e.target)} />
            </div>
            
            <div className={styles.inputWarp}>
              <div className={styles.label}>author</div>
              <input id='author' name='author' onChange={(e) => onChangeHandler(e.target)} />
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
                <div className={styles.details}>love <div className={styles.removeIcon}><RiCloseCircleLine /></div></div>
              </div>
              
              <div className={styles.groupDropdown}>
                <input id='genres' name='genres' onChange={(e) => onChangeHandler(e.target)} autoComplete="off" />
                <div className={styles.dropdown}>
                  <div className={styles.dropdownList}>
                    { showGenres() }
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.inputWarp}>
              <div className={styles.groupLabel}>
                <div className={styles.label}>Keywords : </div>
                <div className={styles.details}>love <div className={styles.removeIcon}><RiCloseCircleLine /></div></div>
                <div className={styles.details}>comedy <div className={styles.removeIcon}><RiCloseCircleLine /></div></div>
                <div className={styles.details}>school <div className={styles.removeIcon}><RiCloseCircleLine /></div></div>
                <div className={styles.details}>isekai <div className={styles.removeIcon}><RiCloseCircleLine /></div></div>
                <div className={styles.details}>princess <div className={styles.removeIcon}><RiCloseCircleLine /></div></div>

              </div>

              <div className={styles.groupDropdown}>
                <input id='keyword' name='keyword' onChange={(e) => onChangeHandler(e.target)} autoComplete="off" />
                <div className={styles.dropdown}>
                  <div className={styles.dropdownList}>
                    { showKeywords() }
                  </div>
                </div>
              </div>
              
            </div>

            <button className={styles.button4} type='submit'>Add Product</button>

          </form>

        </div>

      </div>
    </div>
  )
}

