import axios from "axios"
import Image from 'next/image'
import Head from 'next/head'
import { useState, useEffect, useRef } from "react"
import { useRouter } from 'next/router'
import styles from './preOrder.module.css'
import Header from 'components/header'
import Link from "next/link"
import Swal from 'sweetalert2'
import ProductList from 'components/productList'

export default function PreOrder() {
    const [ data, setData ] = useState([])
    const [ isError, setIsError ] = useState('')
    
    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_BACKEND + '/product/getPreOrder'
        axios.get(url)
        .then(result => {
            setData(result.data)
            if(result.data.length === 0){
                setIsError('0_length')
            }
        }).catch(err => {
            setIsError('error')
        })
    }, [])

    return (
        <div>
            <Head>
                <title>PT Bookstore</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            <div className={styles.container}>
                <main className={styles.main}>
                    <div className={styles.section}>
                        {/* { (data[0] != undefined) && <ProductList data={data} revert={false} maxPerPage='60' href='/series/'/> } */}
                        { isError === '0_length' && <div className={styles.label}> ไม่พบสินค้า Pre Order</div> }
                    </div>
                </main>
            </div>
        </div>
    )
}