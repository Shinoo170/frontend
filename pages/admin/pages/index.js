import { useState, useEffect } from 'react'
import Link from 'next/link'
import SideNav from 'components/admin/adminSideNavbar'

import styles from './pages.module.css'
import axios from 'axios'

export default function Pages(){
    const [ newGenres, setNewGenres ] = useState('')

    const uploadGenres = () => {
        if(newGenres != ''){
            const axiosURL = process.env.NEXT_PUBLIC_BACKEND + '/admin/addGenres'
            axios.post(axiosURL , {
                newGenres
            }).then( result => {
                console.log(result)
            })
        }
    }

    return (
        <div className={styles.container}>
            <SideNav />
            <div className={styles.contentContainer}>
                <div className={styles.top}>
                    <div className={styles.title}>Pages</div>
                </div>
                <div className={styles.content}>
                    <div className={styles.subTitle}>Banner</div>
                    <div className={styles.mySwiper}>

                    </div>
                </div>
                <div className={styles.content}>
                    <div className={styles.subTitle}>Genres</div>
                    <select id='genres'>
                        <option>asd</option>
                    </select>

                    <br/><br/>

                    <input onChange={e => setNewGenres(e.target.value)}/> &nbsp;
                    <button onClick={uploadGenres}>add</button>
                </div>
            </div>
        </div>
    )
}