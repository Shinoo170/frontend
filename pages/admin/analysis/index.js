import styles from './analysis.module.css'

export default function AnalysisPage(){

    return (
        <div className={styles.container}>
            { cosine() }
        </div>
    )

    function cosine(){
        var arr = [
            [0,0],
            [0,0],
        ]
        arr[0].push(1)
        arr.push([])
        arr[2].push(2)
        arr[2].push(3)
        arr[2].push(4)
        console.log(arr)
    }
}