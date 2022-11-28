import { ethers } from "ethers"
import axios from 'axios'

export default function Crypto(){

    const payment = async () => {
        if (!window.ethereum) return console.log('No matamask')
        try {
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: `0x${Number(97).toString(16)}`,
                    chainName: "BSC Testnet",
                    nativeCurrency: {
                    name: "BSC Testnet",
                    symbol: "BUSD",
                    decimals: 18
                    },
                    rpcUrls: ["https://data-seed-prebsc-1-s3.binance.org:8545"],
                    blockExplorerUrls: ["https://testnet.bscscan.com/"]
                  }
                ]
            })
            await window.ethereum.send("eth_requestAccounts")
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const abi = [
                "function name() public view returns (string)",
                "function symbol() public view returns (string)",
                "function decimals() public view returns (uint8)",
                "function totalSupply() public view returns (uint256)",
                "function transfer(address to, uint amount) returns (bool)",
                "function approve(address _spender, uint256 _value) public returns (bool success)"
            ]
            let contract = new ethers.Contract(
                '0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee',
                abi,
                signer
            )
            const price = String(0.1)
            let numberOfTokens = ethers.utils.parseUnits(price, 18)
            const data = await contract.transfer(
                '0xDb91A1A23B36EC7Bd57C63Ef4B154Db55d110dEE',
                numberOfTokens
            )
            // await data.wait()
            // console.log(data)
            // const url = process.env.NEXT_PUBLIC_BACKEND + '/pay'
            // axios.post(url, {
            //     hash: data.hash,
            //     contract: data,
            // }).then(result => {
            //     console.log(result)
            // })
        } catch (error) {
            console.log(error)
        }

    }

    return (
        <div>
            Moralis
            <button onClick={e => payment()}>Payment</button>
        </div>
    )
}

