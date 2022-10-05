import axios from "axios";
import { useState, useEffect } from "react";
import SideNav from 'components/admin/adminSideNavbar'
import styles from './addProduct.module.css'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FormData = require('form-data');

export default function AddProduct() {
  const [file, setFile] = useState([]);
  const [promise, setPromise] = useState(false);

  const saveFile = (e) => {
    const imageData = []
    const length = e.target.files.length

    for(let i = 0; i<length; i++){
      imageData.push(e.target.files[i])
    }

    setFile([...imageData])
    
    // reset preview div
    document.getElementById('containerPreviewImg').innerHTML = ""
    imageData.forEach((element, index) => {
      var reader = new FileReader();
      reader.addEventListener("load", function() {
        var image = new Image();
        image.title  = element.name;
        image.src    = this.result;
        image.id     = 'img-' + index;
        document.querySelector('#containerPreviewImg').appendChild(image);
      });
      reader.readAsDataURL(element);
    });
  };
  

  const uploadFile = async (e) => {
    const formData = new FormData();
    uploadImage(file)

    async function uploadImage(data) {
      const promise = data.map(async (imageData) => {
        formData.append("file", imageData)
      })
      await Promise.all(promise)
      try {
        // await axios.post("http://localhost:5000/img/product/upload", formData )
        // .then(res => {
        //   console.log(res.data);
        //   toast.update(id, {render: "All is good", type: "success", isLoading: false});
        // }).catch(err => {
        //   toast.update(id, {render: "Something went wrong", type: "error", isLoading: false });
        // })
      } catch (err) {
        console.log("error")
      }
    }
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
            <div className={styles.imagesPreview} id='containerPreviewImg'></div>
            <input className={styles.inputField} type="file" multiple onChange={saveFile}/>
            <div className={styles.fakeBtn}>Choose files</div>
            <div className={styles.msg}>or drag and drop files here</div>
          </div>
          
          <div className={styles.inputFormWarp}>

            <div className={styles.inputWarp}>
              <div className={styles.label}>Title</div>
              <input id='title'></input>
            </div>
            
            <div className={styles.inputWarp}>
              <div className={styles.label}>author</div>
              <input id='author'></input>
            </div>

            <div className={styles.inputWarp}>
              <div className={styles.label}>illustrator</div>
              <input id='illustrator'></input>
            </div>

            <div className={styles.inputWarp}>
              <div className={styles.label}>publisher</div>
              <input id='publisher'></input>
            </div>

            <div className={styles.inputWarp}>
              <div className={styles.label}>description</div>
              <textarea id='description'></textarea>
            </div>

            <div className={styles.inputWarp}>
              <div className={styles.label}>genres</div>
              <input id='genres'></input>
            </div>

            <div className={styles.inputWarp}>
              <div className={styles.label}>Keyword</div>
              <input id='keyword'></input>
            </div>

            <button className={styles.button4} onClick={uploadFile}>Add Product</button>

          </div>

        </div>

      </div>
    </div>
  );
}

