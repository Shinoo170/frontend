import { useEffect } from 'react'
import { useRouter } from 'next/router';
import Link from 'next/link'
import axios from 'axios'
import Image from 'next/image'
import styles from '../styles/Signin.module.css'
import { FaRegEnvelope, FaLock, FaLongArrowAltRight, FaChevronLeft } from 'react-icons/fa'

const SignIn = () => {

    const signInRequest = async(event) => {
        event.preventDefault()
        const url = process.env.BACKEND + 'auth/signin';

        axios.post(url, {
            user: event.target.User.value,
            password: event.target.Password.value
        }).then((response) => {
            console.log(response.data.token);
            sessionStorage.setItem('jwt', response.data.token)
        }).catch((error) => {
            // password not match
        })
    }
    // redirect to home if already logged in
    const router = useRouter()
    useEffect(()=> {
        if(sessionStorage.getItem('jwt') || 0){
            router.push('/')
        }
    })
    
    return (
        <div className={styles.limiter}>
            <div className={styles.containerLogin}>
                <div className={styles.wrapLogin}>
                    <div className={styles.containerBackBtn}>
                        <Link href='../'>
                            <span className={styles.backIcon}>
                                <FaChevronLeft />
                                <span className={styles.tooltip}>Back</span>
                            </span>
                        </Link>
                    </div>
                    <div className={styles.loginPic}>
                        {/* <Image  src='/signin-pic.png' alt='img' layout='fill' objectFit='contain'/> */}
                    </div>

                    <form className={styles.loginForm} onSubmit={signInRequest}>
                        <span className={styles.loginFormTitle}>
                            Member Login
                        </span>

                        <div className={styles.wrapInput}>
                            <input className={styles.input} type='text' id='User' name='User' placeholder='Email or Phone'></input>
                            <span className={styles.focusInput}></span>
                            <span className={styles.iconInput}>
                                <i><FaRegEnvelope /></i>
                            </span>
                        </div>

                        <div className={styles.wrapInput}>
                            <input className={styles.input} type='password' id='Password' name='Password' placeholder='Password'></input>
                            <span className={styles.focusInput}></span>
                            <span className={styles.iconInput}>
                                <i><FaLock /></i>
                            </span>
                        </div>

                        <div className={styles.containerBtn}>
                            <button className={styles.btn}>
                                Login
                            </button>
                        </div>

                        <div className={styles.textCenter}>
                            <span className={styles.txt1}>
                                Forget
                            </span>
                            <span className={styles.txt1Link}>
                                <Link href='#'>
                                    Username / Password?
                                </Link>
                            </span>
                        </div>

                        <div className={styles.textBottom}>
                            <Link href='/signup'>
                                <span className={styles.txt2}>
                                    Create your Account
                                    <i><FaLongArrowAltRight /></i>
                                </span>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default SignIn