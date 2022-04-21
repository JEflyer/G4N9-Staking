import Onboard from "bnc-onboard";
import Web3 from "web3";
import minterABI from "./minterABI.json";
import stakingABI from "./stakingABI.json";
import tokenABI from "./tokenABI.json";
import ReactDOM from "react-dom";
import { useState } from "react";
require("dotenv").config()


const stakingContractAddress = ""
const minterContractAddress = "0xb195991d16c1473bdF4b122A2eD0245113fCb2F9"
const tokenContractAddress = "0x21985fc0a5Ea706e1496b5CaF5b2a1af24deC64d"

const RPC_URL = process.env.RPC_URL;
const INFURA_KEY = process.env.INFURA_KEY;

const wallets = [
    { walletName: "metamask", preferred: true },
    { walletName: "ledger", rpcUrl: RPC_URL,  preferred: true },
    { walletName: "walletConnect", infuraKey: INFURA_KEY, preferred: true }
];

var web3;

var tokenContract;
var stakingContract;
var minterContract

const onboard = Onboard({
    dappId: process.env.DAPP_ID,
    networkId: 4,
    walletSelect: {
        wallets: wallets
    },
    subscriptions: {
        wallet: (wallet) => {
            window.localStorage.setItem("selectedWallet", wallet.name);
            web3 = new Web3(wallet.provider);
            console.log(wallet.name);
            stakingContract = new web3.eth.Contract(stakingABI, stakingContractAddress)
            minterContract = new web3.eth.Contract(minterABI, minterContractAddress)
            tokenContract = new web3.eth.Contract(tokenABI, tokenContractAddress)
            NumStaked.getNumStaked()
        }
    }
});


const BlockNative = () => {

    const [wltAddress, setWltAddress] = useState("Not Connected");

    async function login() {
        const walletSelected = await onboard.walletSelect();
        if (walletSelected !== false) {
            const walletCheck = await onboard.walletCheck();
            setWltAddress(onboard.getState().address);

        }
    }

    return (
        <div>
            <div className="App">
                <button id="connectWallet" className="connectWalletButton" onClick={login}>
                    Connect wallet
                </button>
                <p className="walletAddress">{wltAddress}</p>
            </div>


        </div>
    )
}

const NumStaked = () => {
    [num,setNum] = useState();

    async function getNumStaked(){
        const currentState = onboard.getState();
        setNum(await stakingContract.methods.getNoStaked(currentState.address).call())
    }
}

const TEDR = () => {
    return (NumStaked.num*0.5)
}

const Balance = () => {
    [bal,setBal] = useState(0)

    async function getBal(){
        const currentState = onboard.getState();
        setBal(await tokenContract.methods.balanceOf(currentState.address).call())
    }
}

const numOfTroops = () => {

    [num, setNum] = useState();

    async function getTroops(){
        const currentState = onboard.getState()
        setNum(await stakingContract.methods.getNoStaked(currentSTate.address).call())
    }

}

const PR = () => {
    [amount, setAmount] = useState()

    async function getPendingRewards(){
        const currentState = onboard.getState();
        setAmount(await stakingContract.methods.getClaimable(currentState.address).call())
    }
}

const NFTsToBeStakedOrUnstaked = () => {

    [selected,setSelected] = useState([]);
    [wallet,setWallet] = useState([])
    [display,setDisplay] = useState([])
    [page, setPage] = useState(0)


    async function sleep(ms){
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function stakeOne(token){
        const currentState = onboard.getState()
        await minterContract.methods.approve(stakingContractAddress, token).send({
            from: currentState.address,
            gasPrice: '31000000000'
        })

        await sleep(1000)

        await stakingContract.methods.stakeOne(token).send({
            from: currentState.address,
            gasPrice: '31000000000'
        })
    }

    async function stakeMul(){
        const currentState = onboard.getState()
        await minterContract.methods.setApprovalForAll(stakingContractAddress, true).send({
            from: currentState.address,
            gasPrice: '31000000000'
        })

        await sleep(1000)

        await stakingContract.methods.stakeMul(selected).send({
            from: currentState.address,
            gasPrice: '31000000000'
        })
    }

    async function unstakeOne(token){
        const currentState = onboard.getState()
        await stakingContract.methods.unstakeOne(token).send({
            from: currentState.address,
            gasPrice: '31000000000'
        })
    }

    async function unstakeMul(){
        const currentState = onboard.getState()
        await stakingContract.methods.unstakeMul(selected).send({
            from: currentState.address,
            gasPrice: '31000000000'
        })
    }

    async function getWallet(){
        const currentState = onboard.getState()
        setWallet(await minterContract.methods.walletOfOwner(currentState.address).call())
        setDisplay(wallet[0],wallet[1],wallet[2],wallet[3],wallet[4])
    }

    function Arr (token) {
        let bool = false;
        for(let i = 0; i< selected.length; i++){
            if(selected[i] == token){
                let arr = selected.splice(i,1)
                setSelected(arr)
                bool = true
            }
        }
        if(!bool){
            let arr = selected 
            arr[arr.length] = token
            setSelected(arr);
        }
    }

    function NFT (token){

        return(
            <div class="item">
                <div class="itempep">
                    <img src={"ipfs://QmVQV1nQ4LYX3dKCtN3WWq4vabUYkWynu9D3c5PhVzQqwr/"+token.toStirng()+".png"} alt="" />
                    <div class="itembtn">
                        <a onClick={stakeOne(token)}><span class="unstakebtn">Unstake</span></a>
                        <a onClick={unstakeOne(token)}><span class="viewbtn">View</span></a>
                        <a onClick={Arr(token)}><span class ="viewbtn">Select</span></a>
                    </div>
                </div>
            </div>
        )
    }

    function nextPage(){
        setPage(page+1)
        displayNFTs()
    }

    function backPage(){
        setPage(page+1)
        displayNFTs()
    }


    function displayNFTs(){
        setDisplay(wallet[0+page*5],wallet[1+page*5],wallet[2+page*5],wallet[3+page*5],wallet[4+page*5])
    }

    return(
        <div>
            <NFT token={display[0]}/>
            <NFT token={display[1]}/>
            <NFT token={display[2]}/>
            <NFT token={display[3]}/>
            <NFT token={display[4]}/>

            <button onClick={nextPage}> Next</button>
            <button onClick={backPage}> Back</button>
        </div>
    )

}


export {
    BlockNative,
    NumStaked,
    TEDR,
    Balance,
    PR,
    NFTsToBeStakedOrUnstaked
}