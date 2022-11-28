import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import styles from './user.module.css'
import Modal from './Modal.module.css'
import picUpload from "./picUpload.module.css"
import Header from 'components/header'
import SideNavBar from 'components/user/sideNavbar'
import axios from 'axios'

import { Upload } from "@aws-sdk/lib-storage"
import { S3Client, S3 } from "@aws-sdk/client-s3"
import Swal from 'sweetalert2'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { FaPlus } from "react-icons/fa"
import { AiFillEdit } from "react-icons/ai"
import { ImBin } from "react-icons/im"

export default function User() {
    const [ isLogin, setIsLogin ] = useState(false)
    const router = useRouter()

    const [data, setData] = useState({Live: [], Tel:''})
    const [showModal, setShowModal] = useState(false)
    const [showLiveModal, setShowLiveModal] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showImgModal, setShowImgModal] = useState(false)
    const [index, setIndex] = useState('')
    const [file, setFile] = useState()

    useEffect(() => {
        if(localStorage.getItem('jwt')){
            setIsLogin(true)
            getData()
        } else {
            router.push({pathname: '/', query:{ } }, undefined,{ shallow: false } )
        }
    }, [])

    const getData = () => {
        const url = process.env.NEXT_PUBLIC_BACKEND + '/user/'
        axios.get(url, {
            headers: { jwt: localStorage.getItem('jwt')}
        })
        .then(result => {
            setData({
                displayName: result.data.userData.displayName,
                img: result.data.userData.img,
                Tel: result.data.userData.tel,
                firstName: result.data.userData.firstName,
                lastName: result.data.userData.lastName,
                email: result.data.email,
                Live: result.data.userData.address || [],
                isEmailVerified: result.data.userData.verifiedEmail,
            })
        })
    }

    const sendEmailVerify = () => {
        const url = process.env.NEXT_PUBLIC_BACKEND + '/auth/SendVerifyCode'
        axios.post(url, {
            email: data.email
        })
        .then(result => {
            toast.success('🦄 SEND EMAIL SUCCESS!')
        }).catch(err => {
            toast.error('🦄 FAILED TO SEND EMAIL!')
        })
    }

    async function onClickUpload() {
        try {
            if(file.size > 1024 * 1024 * 5){
                return toast.error('🦄 Maximum file size is 5 MB!')
            }
            const imgName = Date.now() + '-' + file.name.replaceAll(' ', '-')
            const imgURL = process.env.NEXT_PUBLIC_AWS_S3_URL + '/users/' + imgName
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
                Key: 'users/' + imgName,
                Body: file
            },
            partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
            leavePartsOnError: false, // optional manually handle dropped parts
            })
            await parallelUploads3.done()

            const url = process.env.NEXT_PUBLIC_BACKEND + '/user/updateUserProfile'
            await axios.patch(url, {  jwt: localStorage.getItem('jwt'), imgURL, previousImgUrl: data.img })
            .then(result => {
                getData()
                localStorage.setItem('userImg', imgURL)
                toast.success('🦄 UPDATE SUCCESS!')
                setFile()
            })
        } catch (error) {
            toast.error('🦄 UPDATE FAILED!')
        }
        
    }

    async function onClickedit(u, t, e, firstName, lastName) {
        /*set State และ update ค่าใน database*/
        if (u === '') u = data.displayName
        if (t === '') t = data.Tel
        if (e === '') e = data.email
        if (firstName === '') firstName = data.firstName 
        if (lastName === '') lastName = data.lastName
        const url = process.env.NEXT_PUBLIC_BACKEND + '/user/updateUserData'
        await axios.patch(url, { jwt: localStorage.getItem('jwt'), u, t, e, firstName, lastName })
        .then(result => {
            getData()
            toast.success('🦄 Your profile has been updated!')
        })
    }

    async function onClickeditLive(a, l, index, subd, dist, prov, zipC, coun) {
        /*set State และ update ค่าใน database*/
        if (a === '') a = data.Live[index].Name
        if (l === '') l = data.Live[index].address
        if (subd === '') subd = data.Live[index].subdistrict
        if (dist === '') dist = data.Live[index].district
        if (prov === '') prov = data.Live[index].province
        if (zipC === '') zipC = data.Live[index].zipCode
        if (coun === '') coun = data.Live[index].country
        const url = process.env.NEXT_PUBLIC_BACKEND + '/user/updateUserAddress'
        await axios.patch(url, { jwt: localStorage.getItem('jwt'), a, l, index, subd, dist, prov, zipC, coun })
        .then(result => {
            getData()
            toast.success('🦄 Your address is updated!')
        })
    }

    async function onClickDeleteAddress(index) {
        const url = process.env.NEXT_PUBLIC_BACKEND + '/user/deleteUserDataAddress'
        await axios.patch(url, { jwt: localStorage.getItem('jwt'), index })
        .then(result => {
            getData()
            toast.success('🦄 Your address is updated!')
        })
    }

    async function onClickAddLive(a, l, subd, dist, prov, zipC, coun) {
        if (a === '' || l === '' || subd === '' || dist === '' || prov === '' || zipC === '' || coun === '' ) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please enter all information'
          })
          return
        } 
        const url = process.env.NEXT_PUBLIC_BACKEND + '/user/createUserDataAddress'
        await axios.post(url, { jwt: localStorage.getItem('jwt'), a, l, subd, dist, prov, zipC, coun })
        .then(result => {
            getData()
            toast.success('🦄 ADD SUCCESS!')
        })
    }

    if(!isLogin) {
        return (
            <div>
                <Head>
                    <title>Profile | PT Bookstore</title>
                    <meta name="description" content="Generated by create next app" />
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <Header />
                <div className={styles.container}>
                    <main className={styles.main}>
                        
                    </main>
                </div>
            </div>
        )
    } else {
        return (
            <div>
                <Head>
                    <title>Profile | PT Bookstore</title>
                    <meta name="description" content="Generated by create next app" />
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <Header />
                <ToastContainer 
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                    />
                <div className={styles.container}>
                    
                    <main className={styles.main}>
                        <SideNavBar />
                        <div className={styles.screen} >
                            <center><div className={styles.title}>จัดการบัญชี</div></center>
                            <div >
                                <div className={styles.profile_header}>
                                    <div className={styles.profile_left}>
                                        <div className={styles.images_profile}>
                                            <label htmlFor="avatar" style={{cursor:'pointer'}}>
                                                { data.img? 
                                                    <img src={data.img} className={styles.profile_img} alt={data.displayName} /> :
                                                    <img src='/no_profile_image.png' className={styles.profile_img} alt={data.displayName} />
                                                }
                                            </label>
                                        </div>
                                        <div className={styles.profile_name}>
                                            <div className={styles.row}>
                                                <div className={styles.label}>Name :</div>
                                                <div className={styles.value}>{data.displayName}</div>
                                            </div>
                                            <div className={styles.row}>
                                                <div className={styles.label}>Fullname :</div>
                                                <div className={styles.value}>{data.firstName} {data.lastName}</div>
                                            </div>
                                            <div className={styles.row}>
                                                <div className={styles.label}>Tel :</div>
                                                { data.Tel && data.Tel.length === 10 && <div className={styles.value}>{(data.Tel.slice(0,3) + '-' + data.Tel.slice(3,6) + '-' + data.Tel.slice(6))}</div> }
                                                { data.Tel && data.Tel.length !== 10 && <div className={styles.value}>{data.Tel}</div> }
                                            </div>
                                            <div className={styles.row}>
                                                <div className={styles.label}>Email :</div>
                                                <div className={styles.value}>{data.email} </div>
                                                <div className={styles.emailVerifyAlert}>
                                                    {!data.isEmailVerified && <>
                                                        <div>*คุณยังไม่ได้ยืนยันอีเมล</div>
                                                        <div className={styles.link} onClick={sendEmailVerify}>คลิกที่นี่เพิ่มส่งอีเมลยืนยันอีกครั้ง</div>
                                                    </>
                                                    }
                                                </div>
                                            </div>
                                            {/* <label style={{color:'red',cursor:'pointer'}} >เปลี่ยนรหัสผ่าน</label> <br /> */}
                                        </div>
                                    </div>
                                    <button className={styles.edit} onClick={() => setShowModal(true)}>
                                        แก้ไขข้อมูลส่วนตัว
                                    </button>
                                    
                                    <input style={{display:'none'}} onClick={() => setShowImgModal(true)} id="avatar" name="avatar" />
                                </div>
                                <hr />
                                <div className={styles.live}>
                                    ข้อมูลที่จัดส่ง
                                </div>
                                {
                                    data.Live && data.Live.map((addr, x) => (
                                        <div className={styles.profile_content} key={`address-${x}`}>
                                            ชื่อที่อยู่จัดส่ง: {addr.Name} <br />
                                            ข้อมูลที่อยู่จัดส่ง: {addr.address} &nbsp; ต.{addr.subdistrict} &nbsp; อ.{addr.district} &nbsp; จ.{addr.province} &nbsp; {addr.zipCode} &nbsp; ประเทศ{addr.country} &nbsp; 
                                            <div className={styles.btnGroup}>
                                                <button className={styles.liveEdit} onClick={() => (setShowLiveModal(true), setIndex(x))}><AiFillEdit /></button>
                                                <button className={styles.liveDelete} onClick={() => (onClickDeleteAddress(x))}><ImBin /></button>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                            <center><button className={styles.liveAdd} onClick={() => (setShowAddModal(true))}><FaPlus /></button></center>
                            {
                                showModal ? (
                                <div className={styles.screen}>
                                    <div className={Modal.overlay}>
                                        <div className={Modal.modal}>
                                            <div className={Modal.box}>
                                                <div className={Modal.header}>
                                                    <a onClick={() => setShowModal(false)}>
                                                    <button className={Modal.edit_close} >Close</button>
                                                    </a>

                                                </div>
                                                <div className={Modal.body}>
                                                    <form >
                                                        <label>Name : </label><input placeholder={data.displayName} type='text' name="user" id="user" className={Modal.Name}  /><br />
                                                        <label>Firstname : </label><input placeholder={data.firstName} type='text' name="first" id="first" className={Modal.Name} /><br />
                                                        <label>Lastname : </label><input placeholder={data.lastName} type='text' name="last" id="last" className={Modal.Name} /><br />
                                                        <label>Phone : </label><input placeholder={data.Tel} type='tel' name="tele" id="tele" maxLength='10' className={Modal.Phone} /><br />
                                                        <label>Email : </label><input placeholder={data.email} type='email' name="mail" id="mail" className={Modal.Email} />
                                                        <input className={Modal.edit_close} style={{ marginTop: '7px', marginLeft: '75%' }} type="button" onClick={() => (onClickedit(user.value, tele.value, mail.value, first.value, last.value), setShowModal(false))} value="Save" /><br />
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                ) : null
                            }
                            {
                                showLiveModal && index !== '' ? (
                                <div className={styles.screen}>
                                    <div className={Modal.overlay}>
                                        <div className={Modal.modal}>
                                            <div className={Modal.box}>
                                                <div className={Modal.header}>
                                                    <a onClick={() => (setShowLiveModal(false), setIndex(''))}>
                                                    <button className={Modal.edit_close} >Close</button>
                                                    </a>
                                                </div>
                                                <div className={Modal.body}>
                                                    <form style={{width:'250px',marginLeft:'20px'}}>
                                                        <label>ชื่อที่อยู่จัดส่ง : </label><input placeholder={data.Live[index].Name} type='text' id="liv" name="liv" className={Modal.Name} /><br />
                                                        <label>บ้านเลขที่ : </label><br /><input placeholder={data.Live[index].address} name="addr" id="addr" className={Modal.Name} /><br />
                                                        <label>แขวง / ตำบล  : </label><br /><input placeholder={data.Live[index].subdistrict} name="subd" id="subd" className={Modal.Name} /><br />
                                                        <label>เขต / อำเภอ   : </label><br /><input placeholder={data.Live[index].district} name="dist" id="dist" className={Modal.Name} /><br />
                                                        <label>จังหวัด  : </label><br /><input placeholder={data.Live[index].province} name="prov" id="prov" className={Modal.Name} /><br />
                                                        <label>รหัสไปรษณีย์   : </label><br /><input placeholder={data.Live[index].zipCode} name="zipC" id="zipC" type='number' className={Modal.Name} /><br />
                                                        <label>ประเทศ  : </label><br /><input placeholder={data.Live[index].country} name="coun" id="coun" className={Modal.Name} /><br />
                                                        <input className={Modal.edit_close} style={{ marginTop: '7px', marginLeft: '68%' }} type="button" onClick={() => (onClickeditLive(liv.value, addr.value, index, subd.value, dist.value, prov.value, zipC.value, coun.value), setShowLiveModal(false), setIndex(''))} value="Save" /><br />
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                ) : null
                            }
                            {
                                showAddModal ? (
                                <div className={styles.screen}>
                                    <div className={Modal.overlay}>
                                        <div className={Modal.modal}>
                                            <div className={Modal.box}>
                                                <div className={Modal.header}>
                                                    <a onClick={() => (setShowAddModal(false))}>
                                                    <button className={Modal.edit_close} >Close</button>
                                                    </a>
                                                </div>
                                                <div className={Modal.body}>
                                                    <form style={{width:'250px',marginLeft:'20px'}}>
                                                        <label>ชื่อที่อยู่จัดส่ง : </label><input  type='text' id="liv" name="liv" className={Modal.Name} /><br />
                                                        <label>บ้านเลขที่ : </label><br /><input name="addr" id="addr" className={Modal.Name} /><br />
                                                        <label>แขวง / ตำบล  : </label><br /><input name="subd" id="subd" className={Modal.Name} /><br />
                                                        <label>เขต / อำเภอ   : </label><br /><input name="dist" id="dist" className={Modal.Name} /><br />
                                                        <label>จังหวัด  : </label><br /><input name="prov" id="prov" className={Modal.Name} /><br />
                                                        <label>รหัสไปรษณีย์   : </label><br /><input name="zipC" id="zipC" type='number' className={Modal.Name} /><br />
                                                        <label>ประเทศ  : </label><br /><input name="coun" id="coun" className={Modal.Name} /><br />
                                                        <input className={Modal.edit_close} style={{ marginTop: '7px', marginLeft: '68%' }} type="button" onClick={() => (onClickAddLive(liv.value, addr.value, subd.value, dist.value, prov.value, zipC.value, coun.value), setShowAddModal(false))} value="Save" /><br />
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                ) : null
                            }
                            {
                                showImgModal ? (
                                <div className={styles.screen}>
                                    <div className={Modal.overlay}>
                                        <div className={Modal.modal}>
                                            <div className={Modal.box}>
                                                <div className={Modal.header}>
                                                    <a onClick={() => {setShowImgModal(false); setFile();}}>
                                                    <button className={Modal.edit_close} >Close</button>
                                                    </a>
                                                </div>
                                                <div className={Modal.body}>
                                                    <div className={picUpload.fileDropArea}>
                                                        <div className={picUpload.imagesPreview} id='containerPreviewImg'>
                                                            {/* {file && <img src={URL.createObjectURL(file)} id='pre-img' />} */}
                                                            { file && 
                                                                <div className={picUpload.images_profile}>
                                                                    <img src={URL.createObjectURL(file)} className={picUpload.profile_img} alt={'upload image'} />
                                                                </div>
                                                            }
                                                        </div>
                                                        <input className={picUpload.inputField} type="file" name='filename' id="filename" onChange={e => setFile(e.target.files[0])} accept="image/png, image/jpeg, image/jpg, image/gif"/>
                                                        {
                                                            !file && <>
                                                                <div className={picUpload.fakeBtn}>Choose files</div>
                                                                <div className={picUpload.msg}>or drag and drop files here</div>
                                                                <div className={picUpload.msg}>recommend file size 100x100</div>
                                                                <div className={picUpload.msg}>Maximum file size 5MB</div>
                                                            </>
                                                        }
                                                        
                                                    </div>
                                                </div>
                                                <br/>
                                                <input className={Modal.edit_close} style={{ marginLeft:'75%' }} type="button" onClick={() => {onClickUpload(); setShowImgModal(false)}} value="Save" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                ) : null
                            }
                        </div>
                    </main>
                </div>
            </div>
        )
    }
}