import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import Header from 'components/header'
import styles from './id.module.css'
import SwiperItem from 'components/SwiperItem'
import SwiperItemSeries from 'components/SwiperItemSeries'

import { BsThreeDotsVertical } from 'react-icons/bs'
import { RiArrowDownSLine, RiArrowRightSLine } from 'react-icons/ri'
import { MdShoppingCart } from 'react-icons/md'
import { TiStar } from 'react-icons/ti'
import { IoIosHeartEmpty, IoIosHeart } from 'react-icons/io'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Mousewheel, Pagination } from "swiper"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"

export default function ProductDetails(){
    const router = useRouter()
    const [ productsData, setProductsData ] = useState( {img:[], score:{avg: 0}} )
    const [ seriesDetails, setSeriesDetails ] = useState( {score: {avg: 0}} )
    const [ otherProduct, setOtherProduct ] = useState( [] )
    const [ simProduct, setSimProduct ] = useState([])
    const [ showImage, setShowImage ] = useState()
    const [ showDropdown, setShowDropdown ] = useState(false)
    const [ viewMore, setViewMore ] = useState('hide')
    const [ selectAmount, setSelectAmount ] = useState(1)
    const amount = [1,2,3,4,5,6,7,8,9,10]
    const [ userData, setUserData ] = useState({name: 'Guest', img: undefined})
    const [ starHover, setStarHover] = useState(5)
    const [ starSelect, setStarSelect] = useState(5)
    const reviewTextarea = useRef()
    const [ otherReview, setOtherReview ] = useState([])
    const [ isWishlist, setIsWishlist ] = useState(false)

    useEffect(() => {
        if(router.isReady){
            if(localStorage.getItem('jwt')){
                setUserData({
                    name: localStorage.getItem('displayName'),
                    img: localStorage.getItem('userImg'),
                })
            }
            setSelectAmount(1)
            var split_query = router.query.id.split('-')
            split_query = split_query[split_query.length -1]
            var ca = ''
            if(split_query === 'นิยาย'){ ca = 'novel' }
            if(split_query === 'มังงะ'){ ca = 'manga' }
            if(split_query === 'สินค้า'){ ca = 'other' }
            const url = process.env.NEXT_PUBLIC_BACKEND + '/product/productDetail/' + router.query.id + '?seriesId=' + router.query.seriesId + '&category=' + ca
            axios.get(url)
            .then( result => {
                console.log(result.data)
                setProductsData(result.data.productDetails)
                setSeriesDetails(result.data.seriesDetails)
                setShowImage(result.data.productDetails.img[0])
                setOtherProduct(result.data.otherProducts)
                setSimProduct(result.data.similarProducts)

                getWishlists()
                const reviewUrl = process.env.NEXT_PUBLIC_BACKEND + '/product/review?productId=' + result.data.productDetails.productId
                axios.get(reviewUrl)
                .then( result => {
                    console.log(result.data)
                    const id = localStorage.getItem('userId')
                    const reviewTemp = [ ...result.data.filter(e => e.user_id === id), ...result.data.filter(e => e.user_id !== id)]
                    setOtherReview(reviewTemp)
                })
            }).catch( err => {
                if(err.response.status === 400){
                    setProductsData({ title: 'Not found', img:[], status: 404, score:{avg: 0} })
                }
                console.log("Error to get data")
            })
        }
    },[router])

    const amountHandle = (e) => {
        const value = e.target.getAttribute('data-value')
        setShowDropdown(c => !c)
        setSelectAmount(value)
    }
    
    useEffect(() => {
        var lines = document.getElementById('description').offsetHeight / 22
        if(lines > 7) setViewMore('More')
        else setViewMore('hide')
    }, [productsData])

    const viewMoreHandle = () => {
        setViewMore(current => {
            if(current === 'More') return current = 'Less'
            else return current = 'More'
        })
    }

    const addToCartHandle = () => {
        const jwt = localStorage.getItem('jwt')
        const url = process.env.NEXT_PUBLIC_BACKEND + '/user/cart'
        axios.put(url, {
            jwt,
            productId: productsData.productId,
            amount: selectAmount,
        }).then(result => {
            // localStorage.setItem('cart', JSON.stringify(result.data.currentCart) )
            fireToast('success','เพิ่มสินค้าสำเร็จ')
        }).catch(err => {
            console.log(err.message)
            fireToast('error','เพิ่มสินค้าไม่สำเร็จ')
        })
    }

    const reviewHandle = () => {
        const jwt = localStorage.getItem('jwt')
        if(jwt){
            const reviewInput = reviewTextarea.current.value
            const url = process.env.NEXT_PUBLIC_BACKEND + '/product/review'
            axios.post(url, {
                jwt,
                productId: productsData.productId,
                review: reviewInput,
                score: starSelect,
            }).then(result => {
                const reviewUrl = process.env.NEXT_PUBLIC_BACKEND + '/product/review?productId=' + productsData.productId
                axios.get(reviewUrl)
                .then( result => {
                    const id = localStorage.getItem('userId')
                    const reviewTemp = [ ...result.data.filter(e => e.user_id === id), ...result.data.filter(e => e.user_id !== id)]
                    setOtherReview(reviewTemp)
                    reviewTextarea.current.value = ''
                })
            }).catch(err => console.log(err.message))
        }
    }

    const fireToast = (status, text) => {
        if(status === 'success'){
            toast.success(text, {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
            })
        } else if(status === 'error'){
            toast.error(text, {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
            })
        }
        
    }

    
    const getWishlists = () => {
        const jwt = localStorage.getItem('jwt')
        if(!jwt){ return }
        const url = process.env.NEXT_PUBLIC_BACKEND + '/product/wishlist?productId=' + productsData.productId
        axios.get(url, {
            headers: {
                jwt
            }
        })
        .then(result => {
            setIsWishlist(result.data)
        })
    }

    const addNewWishlists  = () => {
        const jwt = localStorage.getItem('jwt')
        if(!jwt){
            return toast.error('กรุณาล็อกอิน', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            }) 
        }
        const url = process.env.NEXT_PUBLIC_BACKEND + '/product/wishlist?productId=' + productsData.productId
        axios.put(url, {
            jwt
        })
        .then(result => {
            setIsWishlist(result.data)
        })
    }

    const deleteWishlists = () => {
        const jwt = localStorage.getItem('jwt')
        if(!jwt){
            return toast.error('กรุณาล็อกอิน', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            })
        }
        const url = process.env.NEXT_PUBLIC_BACKEND + '/product/wishlist?productId=' + productsData.productId
        axios.delete(url, {
            headers: {
                jwt
            }
        })
        .then(result => {
            setIsWishlist(result.data)
        })
    }

    return (
        <div>
            <Head>
                { productsData.title? <title>{productsData.title} {productsData.bookNum} | PT Bookstore</title> : <title>PT Bookstore</title> }
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            <ToastContainer /> 
            <div className={styles.container}>
                <main className={styles.main}>
                    <div className={styles.detailContainer}>
                        <div className={styles.title}>{productsData.title} {productsData.bookNum}</div>
                        <div className={styles.buySection}>
                            <div className={styles.imageContainer}>
                                { showImage? <img src={showImage}/> :<div className={`${styles.imgLoading} ${styles.loading}`}></div> }
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
                                            productsData.img.map( (element, index) => {
                                                return (
                                                    <SwiperSlide key={`list-img-${index}`}>
                                                        <div className={styles.image}>
                                                            <img src={element} onClick={ e => setShowImage(element) }/>
                                                        </div>
                                                    </SwiperSlide>
                                                )
                                            })
                                        }
                                    </Swiper>
                                </div>
                            </div>
                            <div className={styles.subSection}>
                                <div className={styles.flexRow}>
                                    <div className={styles.price}>
                                        <div>{productsData.thai_category}</div>
                                        <div className={styles.priceLabel}>{productsData.price} บาท</div>
                                        <div className={styles.dummy}></div>
                                    </div>
                                    <div className={styles.amount}>
                                        <div className={styles.label}>จำนวน</div>
                                        <div className={`${styles.dropdownGroup} ${showDropdown? styles.showDropdown:''}`}>
                                            <div className={styles.dropdownSelection} onClick={e => setShowDropdown(c => !c)}><div id='amount'>{selectAmount}</div> <RiArrowDownSLine/></div>
                                            <div className={styles.dropdownList} onClick={e => amountHandle(e)}>
                                                { amount.map((element, index) => <div key={`amount-${index}`} className={styles.dropdownItem} data-value={element}>{element}</div> ) }
                                            </div>
                                        </div>
                                        <div className={styles.dummy}>{(productsData.amount === 0 || productsData.status === 'out') && <>* สินค้าหมด</>}</div>
                                    </div>
                                </div>
                                {
                                    productsData.amount > 0 && productsData.status !== 'out' && <div className={styles.flexRow}>
                                        <div className={styles.btn} onClick={addToCartHandle}>
                                            <div className={styles.cartIcon}><MdShoppingCart/></div> Add to cart
                                        </div> 
                                        { !isWishlist && <div className={styles.icon} onClick={() => addNewWishlists()}><IoIosHeartEmpty /></div> }
                                        { isWishlist && <div className={styles.iconPink} onClick={() => deleteWishlists()}><IoIosHeart /></div> }
                                    </div>
                                }
                                {
                                    (productsData.amount === 0 || productsData.status === 'out') && <div className={styles.flexRow}>
                                        <div className={styles.btnDisable}>
                                            <div className={styles.cartIcon}><MdShoppingCart/></div> Out of stock
                                        </div>
                                        { !isWishlist && <div className={styles.icon} onClick={() => addNewWishlists()}><IoIosHeartEmpty /></div> }
                                        { isWishlist && <div className={styles.iconPink} onClick={() => deleteWishlists()}><IoIosHeart /></div> }
                                    </div>
                                }
                            </div>
                        </div>
                        <div className={styles.detailFlex}>
                            <div className={styles.description}>
                                <p style={{fontSize: '17px'}}><b>เรื่องย่อ : </b></p>
                                <div id='description' className={viewMore==='More'? styles.lineClamp8:''}>
                                    {productsData.description}
                                </div>
                                <div className={viewMore!=='hide'? styles.viewMore:styles.hide} onClick={viewMoreHandle}>{viewMore}</div>
                            </div>
                            <div className={styles.detailsGroup}>
                                <p style={{fontSize: '17px'}}><b>ข้อมูลซีรี่ย์ : </b></p>
                                <div className={styles.subDetail}>
                                    <div className={styles.detailTitle}>Series :</div>
                                    <div className={styles.detailValue}><Link href={`/series/${router.query.seriesId}`}><a>{productsData.title}</a></Link></div>
                                </div>
                                <div className={styles.subDetail}>
                                    <div className={styles.detailTitle}>Author :</div>
                                    <div className={styles.detailValue}>{seriesDetails.author}</div>
                                </div>
                                <div className={styles.subDetail}>
                                    <div className={styles.detailTitle}>Illustrator :</div>
                                    <div className={styles.detailValue}>{seriesDetails.illustrator}</div>
                                </div>  
                                <div className={styles.subDetail}>
                                    <div className={styles.detailTitle}>publisher :</div>
                                    <div className={styles.detailValue}>{seriesDetails.publisher}</div>
                                </div>                   
                                <div className={styles.subDetail}>
                                    <div className={styles.detailTitle}>avg. score  :</div>
                                    <div className={styles.detailValue}>{productsData.score.avg}</div>
                                </div> 
                                <div className={styles.subDetail}>
                                    <div className={styles.detailTitle}>Genres :</div>
                                    <div className={styles.detailValue}>
                                        <div className={styles.genresGroup}>
                                        {
                                            seriesDetails.genres && seriesDetails.genres.sort().map( (element,index) => {
                                                var filter = element.charAt(0).toUpperCase() + element.slice(1)
                                                return (
                                                    <div key={`genres-${index}`} className={styles.item}>
                                                        <Link href={`/products?genres=${filter}`}>
                                                            <a>{element}</a>
                                                        </Link>
                                                    </div>
                                                )
                                            })
                                        }
                                        </div>
                                    </div>
                                </div>  

                            </div>
                        </div>
                        <hr />
                        { otherProduct.length > 0 && <div className={styles.listProduct}>
                                <div className={styles.top}>
                                    <div className={styles.label}>สินค้าในซีรีย์</div>
                                    <Link href={`/series/${router.query.seriesId}`}><a>ดูเพิ่มเติม <RiArrowRightSLine /></a></Link>
                                </div>
                                <div className={styles.swiperContainer}>
                                    <SwiperItem data={otherProduct} href={`/series/${router.query.seriesId}`} seriesId={router.query.seriesId}/>
                                </div>
                            </div>
                        }
                        {
                            simProduct.length > 0 && <div className={styles.listProduct}>
                                <div className={styles.top}>
                                    <div className={styles.label}>เรื่องที่คุณอาจสนใจ</div>
                                </div>
                                <div className={styles.swiperContainer}>
                                    <SwiperItemSeries data={simProduct} href={`/series/`} seriesId={router.query.seriesId}/>
                                </div>
                            </div>
                        }
                        <hr/>
                        <div className={styles.review}>
                            <div className={styles.label}>รีวิว</div>
                            <div className={styles.reviewArea}>
                                {userData.name}
                                <div className={styles.starGroup}>
                                    <TiStar className={`${styles.star} ${starHover>=1? styles.starHover:''}`} onClick={e => setStarSelect(1)} onMouseEnter={e => setStarHover(1)} onMouseLeave={e => setStarHover(starSelect)}/>
                                    <TiStar className={`${styles.star} ${starHover>=2? styles.starHover:''}`} onClick={e => setStarSelect(2)} onMouseEnter={e => setStarHover(2)} onMouseLeave={e => setStarHover(starSelect)}/>
                                    <TiStar className={`${styles.star} ${starHover>=3? styles.starHover:''}`} onClick={e => setStarSelect(3)} onMouseEnter={e => setStarHover(3)} onMouseLeave={e => setStarHover(starSelect)}/>
                                    <TiStar className={`${styles.star} ${starHover>=4? styles.starHover:''}`} onClick={e => setStarSelect(4)} onMouseEnter={e => setStarHover(4)} onMouseLeave={e => setStarHover(starSelect)}/>
                                    <TiStar className={`${styles.star} ${starHover>=5? styles.starHover:''}`} onClick={e => setStarSelect(5)} onMouseEnter={e => setStarHover(5)} onMouseLeave={e => setStarHover(starSelect)}/>
                                </div>
                                <div className={styles.textArea}>
                                    <textarea ref={reviewTextarea}></textarea>
                                </div>
                                <div className={styles.btn} onClick={e => reviewHandle()}>รีวิว</div>
                            </div>
                            <div className={styles.otherReview}>
                                <div className={styles.label}>รีวิวทั้งหมด</div>
                                {
                                    otherReview.map((element, index) => {
                                        var score = element.score
                                        const userId = localStorage.getItem('userId')
                                        return (
                                            <div key={`review-${index}`} className={styles.reviewContainer}>
                                                <div className={styles.row}>
                                                    <div className={styles.userInfo}>
                                                        <div className={styles.image}>
                                                            {element.detail[0].userData.img}
                                                        </div>
                                                        <div className={styles.user}>
                                                            {element.detail[0].userData.displayName}
                                                            <div className={styles.starGroup}>
                                                                <TiStar className={`${styles.star} ${score>=1? styles.starHover:''}`}/>
                                                                <TiStar className={`${styles.star} ${score>=2? styles.starHover:''}`}/>
                                                                <TiStar className={`${styles.star} ${score>=3? styles.starHover:''}`}/>
                                                                <TiStar className={`${styles.star} ${score>=4? styles.starHover:''}`}/>
                                                                <TiStar className={`${styles.star} ${score>=5? styles.starHover:''}`}/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {
                                                        userId === element.user_id && <div className={styles.reviewMenu}>
                                                            <BsThreeDotsVertical />
                                                        </div>
                                                    }
                                                    
                                                </div>
                                                {element.review}
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </main>
                <footer className={styles.footer}>

                </footer>
            </div>
        </div>
    )
}