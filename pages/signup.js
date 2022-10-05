import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from "next/link"
import axios from "axios"
import Image from "next/image"
import styles from "../styles/Signup.module.css"

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import {
    FaRegEnvelope,
    FaLock,
    FaLongArrowAltRight,
    FaChevronLeft,
} from "react-icons/fa";

const SignUp = () => {
    const signUpRequest = async (event) => {
        event.preventDefault()
        const url = process.env.BACKEND + "auth/signup"
        
        const email = event.target.Email.value
        const password = event.target.user_Password.value
        const ConfirmPassword = event.target.ConfirmPassword.value
        if (email === "" || password === "" || ConfirmPassword === "") {
          toast.warn("All input is required", {
            position: "top-center",
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          })
        } else if (password === ConfirmPassword) {
          axios
            .post(url, {
              email: event.target.Email.value,
              password: event.target.Password.value,
            })
            .then((response) => {
              console.log(response);
            })
        } else {
          toast.error("Password not match", {
            position: "top-center",
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          })
        }
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
            <ToastContainer
                position="top-center"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div className={styles.containerSignUp}>
                <div className={styles.wrapSignUp}>
                    <div className={styles.containerBackBtn}>
                        <Link href="../">
                            <span className={styles.backIcon}>
                                <FaChevronLeft />
                                <span className={styles.tooltip}>Back</span>
                            </span>
                        </Link>
                    </div>
                    <div className={styles.SignUpPic}>
                        {/* <Image
                            src="/signin-pic.png"
                            alt="img"
                            layout="fill"
                            objectFit="contain"
                        /> */}
                    </div>

                    <form className={styles.SignUpForm} onSubmit={signUpRequest}>
                        <span className={styles.SignUpFormTitle}>Register</span>

                        <div className={styles.wrapInput}>
                            <input
                                className={styles.input}
                                type="text"
                                id="Email"
                                name="Email"
                                placeholder="Email"
                            ></input>
                            <span className={styles.focusInput}></span>
                            <span className={styles.iconInput}>
                                <i>
                                    <FaRegEnvelope />
                                </i>
                            </span>
                        </div>

                        <div className={styles.wrapInput}>
                            <input
                                className={styles.input}
                                type="password"
                                id="user_Password"
                                name="Password"
                                placeholder="Password"
                            ></input>
                            <span className={styles.focusInput}></span>
                            <span className={styles.iconInput}>
                                <i>
                                    <FaLock />
                                </i>
                            </span>
                        </div>

                        <div className={styles.wrapInput}>
                            <input
                                className={styles.input}
                                type="password"
                                id="ConfirmPassword"
                                name="Password"
                                placeholder="Confirm Password"
                            />
                            <span className={styles.focusInput}></span>
                            <span className={styles.iconInput}>
                                <i>
                                    <FaLock />
                                </i>
                            </span>
                        </div>

                        <div className={styles.textLeft}>
                            <input type="checkbox" />
                            <span className={styles.txt1}>Accept</span>
                            <span className={styles.txt1Link}>
                                <Link href="#">Term of use</Link>
                            </span>
                        </div>

                        <div className={styles.containerBtn}>
                            <button className={styles.btn}>SignUp</button>
                        </div>

                        <div className={styles.textBottom}>
                            <Link href="/signin">
                                <span className={styles.txt2}>
                                    Sign in
                                    <i>
                                        <FaLongArrowAltRight />
                                    </i>
                                </span>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
