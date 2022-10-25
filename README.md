# Welcome to PT Bookshop!

## Upload file or image
If you deploy backend on vercel, There not allow you to upload file or image to backend. You have to upload via frontend, then send image link to backend.

## .env.local
all environment variables you need
- `NEXT_PUBLIC_BACKEND` your backend url
- `NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID` Amazone s3 secret key
- `NEXT_PUBLIC_AWS_S3_SECRET_ACCESS_KEY` Amazone s3 access key
- `NEXT_PUBLIC_AWS_S3_REGION` Amazone s3 region
- `NEXT_PUBLIC_AWS_S3_BUCKET_NAME` Amazone s3 bucket name
- `NEXT_PUBLIC_AWS_S3_URL` base Amazone s3 url ( for image location )

## router
guest & user page
- `/` index
- `/signin` sign in page
- `/signup` sign up page
- `/product` list all product

admin page ( jwt role admin require )
- `/admin` admin index
- `/admin/analysis` admin analysis page 
- `/admin/product` list add series
- `/admin/product/<seriesId>` specific series details
- `/admin/product/<seriesId>/<productUrl>` specific product details
- `/admin/product/addSeries` add series
- `/admin/product/addProduct` add product