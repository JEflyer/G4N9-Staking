import Onboard from "bnc-onboard";
import Web3 from "web3";
import minterABI from "./minterABI.json";
import stakingABI from "./stakingABI.json";
import tokenABI from "./tokenABI.json";
import { useState } from "react";
import {ethers} from "ethers";

require("dotenv").config()

//rinkeby
const stakingContractAddress = "0x32E4e97d567457911A5E3aFDb68371AF68CCd50e"
const minterContractAddress = "0x58CEc8713D09E3A9eF63c115C4B36bf113C2bd58"
const tokenContractAddress = "0xc09B4835885d2F58469cA12f6A2caB079a12d78D"

//polygon
// const stakingContractAddress = ""
// const minterContractAddress = "0xb195991d16c1473bdF4b122A2eD0245113fCb2F9"
// const tokenContractAddress = "0x21985fc0a5Ea706e1496b5CaF5b2a1af24deC64d"

const RPC_URL = process.env.RPC_URL;
const INFURA_KEY = process.env.INFURA_KEY;

const wallets = [
    { walletName: "metamask", preferred: true },
    // { walletName: "ledger", rpcUrl: RPC_URL,  preferred: true },
    // { walletName: "walletConnect", infuraKey: INFURA_KEY, preferred: true }
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
        }
    }
});


const BlockNative = () => {

	// wallet address
	const [wltAddress, setWltAddress] = useState("Not Connected");
    
	//number of troops currently staked by a user
	const [numStaked, setNumStaked] = useState(0);

	//5 NFTs that are being displayed currently
    const [display,setDisplay] = useState(["1","1","1","1","1", "1"])

	//current $g4n9 token balance
    const [bal, setBal] = useState(0);

	//number of troops owned
    const [numOfTroops,setNumOfTroops] = useState(0);

	//claimable rewards
    const [pendingRewards, setPendingRewards] = useState(0);

	//total staked troops
    const [totalStaked, setTotalStaked] = useState(0);

	//array of tokens currently selected to be staked
	const [selected,setSelected] = useState([]);

	//array of tokens the user holds
    const [wallet,setWallet] = useState([])

	//int for storing what page of 5 NFTs are being viewed
    const [page, setPage] = useState(0)

	//array of tokens the user has already staked
	const [staked, setStaked] = useState([])

	//does this need a comment?
	const [percentStaked, setPercentStaked] = useState(0);

	//number of addresses that have staked
	const [numOfAddressesStaking, setNumOfAddressesStaking] = useState(0);

	//wallet login function
    async function login() {
        const walletSelected = await onboard.walletSelect();
        if (walletSelected !== false) {
            const walletCheck = await onboard.walletCheck();
            setWltAddress(onboard.getState().address);
			update();
        }
    }

	//function for updating stats across UI
	async function update() {
		await sleep(1000)
		getPendingRewards()
		getTroops()
		getBal()
		getWallet()

	}

	//pauses for x ms
	async function sleep(ms){
        return new Promise(resolve => setTimeout(resolve, ms));
    }

	//for staking a single token get approval for token then ask for to stake
    async function stakeOne(token){
        const currentState = onboard.getState()

        minterContract.methods.approve(stakingContractAddress, token).send({
            from: currentState.address,
            gasPrice: '31000000000'
        }).then(res => {
			console.log(res)

			stakingContract.methods.stakeOne(token).send({
				from: currentState.address,
				gasPrice: '31000000000'
			}).then(res => {
				console.log(res)
			}).catch(err => {
				console.error(err)
			})

		}).catch(err => {
			console.error(err)
		})        
    }

	//for staking multiple tokens at once
	//must add check to make sure there are multiple tokens
    async function stakeMul(){
        const currentState = onboard.getState()

        minterContract.methods.setApprovalForAll(stakingContractAddress, true).send({
            from: currentState.address,
            gasPrice: '31000000000'
        }).then(res =>{
			console.log(res)

			stakingContract.methods.stakeMul(selected).send({
				from: currentState.address,
				gasPrice: '31000000000'
			}).then(res => {
				console.log(res)
			}).catch(err => {
				console.error(err)
			})

		}).catch(err => {
			console.error(err)
		})    
    }

	//for unstaking a singe token
    async function unstakeOne(token){
        const currentState = onboard.getState()
        stakingContract.methods.unstakeOne(token).send({
            from: currentState.address,
            gasPrice: '31000000000'
        }).then(res => {
			console.log(res)
		}).catch(err => {
			console.error(err)
		})
    }

	//for unstaking multiple tokens
	//must add check to make sure the array has tokens in it
    async function unstakeMul(){
        const currentState = onboard.getState()
        stakingContract.methods.unstakeMul(selected).send({
            from: currentState.address,
            gasPrice: '31000000000'
        }).then(res => {
			console.log(res)
		}).catch(err => {
			console.error(err)
		})
    }

	//increment page
	//add checks to make sure the tokens will be on the next page
	function nextPage(){
        setPage(page+1)
        displayNFTs()
    }

	//decrement page
	//add checks to make sure tokens will be on next page
    function backPage(){
        setPage(page-1)
        displayNFTs()
    }

	//updates NFTs diplayed
	function displayNFTs(){
        setDisplay(wallet[0+page*6],wallet[1+page*6],wallet[2+page*6],wallet[3+page*6],wallet[4+page*6], wallet[5+page*6])
    }

	//for getting the current amount of tokens due to be rewarded
	async function getPendingRewards(){
        const currentState = onboard.getState();
        stakingContract.methods.getClaimable(currentState.address).call({from: currentState.address})
			.then(res => {
				console.log("claimable: ",res)
				setPendingRewards(res)
			}).catch(err => {
				console.error("claimable: ",err)
			})
    }

	//for getting the current tokens that are staked
	async function getTroops(){
        const currentState = onboard.getState()
        stakingContract.methods.getTokensStaked(currentState.address).call({from: currentState.address})
			.then(res => {
				console.log("staked: ",res)
				setStaked(res)
				setNumStaked(res.length)
			}).catch(err => {
				console.error("staked: ",err)
			})
    }

	//get current $g4n9 token balance
	async function getBal(){
        const currentState = onboard.getState();
        tokenContract.methods.balanceOf(currentState.address).call({from: currentState.address})
			.then(res => {
				console.log("tokenBalance: ",res)
				setBal(res)
			}).catch(err => {
				console.error("tokenBalance: ",err)
			})
    }

	//for getting the tokens a user holds & set total number of troops in wallet
	async function getWallet(){
        const currentState = onboard.getState();
        minterContract.methods.walletOfOwner(currentState.address).call({from: currentState.address})
			.then(res => {
				console.log("wallet: ",res)
				setWallet(res)
				setNumOfTroops(res.length)
			}).catch(err => {
				console.error("wallet: ",err)
			})
    }

	async function claim(){
		const currentState = onboard.getState();
		stakingContract.methods.claim().send({from: currentState.address, gasPrice: '31000000000'})
			.then(res => {
				console.log("claim: ",res)
			}).catch(err => {
				console.error("claim: ",err)
			})
	}

	function Arr (token) {
        let bool = false;
        for(let i = 0; i< selected.length; i++){
            if(selected[i] === token){
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

    return (
        <section>
			<div class="cryptog4n9BG">
				<div class="container-fluid">
					<div class="page-container">
						<div class="connectWallet">
							<button onClick={login}><img src="images/icons/connect.png" alt="" /></button>
						</div>
						<div class="brandArea">
							<img src="images/icons/logo.png" alt="" />
						</div>					
						<div class="sectionIntro">
							<div class="py-4"></div>
							<h2>Barracks</h2>
							<p>
							   Welcome to the cryptog4n9 staking barracks! put your troops to work and earn rewards!
							   every 12-hours the barracks will reward you with $g4n9 token!
							</p>
						</div>
						<div class="teamGallery">
							<img class="borderimg" src="images/border.png" alt="" />
							<div class="insideGallery">
								<div class="midinsideGAL">
									<div class="insideBordHead">
										<p class="smyyy">pending $g4n9 token rewards : <span>{pendingRewards} $g4n9</span></p>	
										<a onClick={() => claim()} class="smyy"><span>claim</span></a>
										<p>account : <span>{wltAddress}</span></p>	
										<div>
											 <p>number g4n9 troops staked : <span>{numStaked} g4n9</span></p>	
											 <a onClick={() => unstakeMul()}><span>UNSTAKE SELECTED</span></a>
										</div>	
										<p>daily rewards per troop : <span>0.5 $g4n9</span></p>
										<p>your daily rewards : <span>{0.5*numStaked} $g4n9</span></p>
									</div>	
								
									<div class="teamslide">
										<div class="teamItem">
											<div class="item">
												<div class="itempep">
													<img src={"https://bafybeidi7uvvnvtoof6syceve7cdzztb5rbonfoeshaglkctt7m4xem52u.ipfs.dweb.link/"+display[0]+".png"} alt="" />
													<div class="itembtn">
														<a onClick={() => unstakeOne(display[0])}><span class="unstakebtn">Unstake</span></a>
														<a onClick={() => stakeOne(display[0])}><span class="stakebtn">Stake</span></a>
														<a onClick={() => Arr(display[0])}><span class="viewbtn">Select</span></a>
													</div>
												</div>
											</div>
											<div class="item">
												<div class="itempep">
													<img src={"https://bafybeidi7uvvnvtoof6syceve7cdzztb5rbonfoeshaglkctt7m4xem52u.ipfs.dweb.link/"+display[1]+".png"} alt="" />
													<div class="itembtn">
														<a onClick={() => unstakeOne(display[1])}><span class="unstakebtn">Unstake</span></a>
														<a onClick={() => stakeOne(display[1])}><span class="stakebtn">Stake</span></a>
														<a onClick={() => Arr(display[1])}><span class="viewbtn">Select</span></a>
													</div>
												</div>
											</div>
											<div class="item">
												<div class="itempep">
													<img src={"https://bafybeidi7uvvnvtoof6syceve7cdzztb5rbonfoeshaglkctt7m4xem52u.ipfs.dweb.link/"+display[2]+".png"} alt="" />
													<div class="itembtn">
														<a onClick={() => unstakeOne(display[2])}><span class="unstakebtn">Unstake</span></a>
														<a onClick={() => stakeOne(display[2])}><span class="stakebtn">Stake</span></a>
														<a onClick={() => Arr(display[2])}><span class="viewbtn">Select</span></a>
													</div>
												</div>
											</div>
											<div class="item">
												<div class="itempep">
													<img src={"https://bafybeidi7uvvnvtoof6syceve7cdzztb5rbonfoeshaglkctt7m4xem52u.ipfs.dweb.link/"+display[3]+".png"} alt="" />
													<div class="itembtn">
														<a onClick={() => unstakeOne(display[3])}><span class="unstakebtn">Unstake</span></a>
														<a onClick={() => stakeOne(display[3])}><span class="stakebtn">Stake</span></a>
														<a onClick={() => Arr(display[3])}><span class="viewbtn">Select</span></a>
													</div>
												</div>
											</div>
											<div class="item">
												<div class="itempep">
													<img src={"https://bafybeidi7uvvnvtoof6syceve7cdzztb5rbonfoeshaglkctt7m4xem52u.ipfs.dweb.link/"+display[4]+".png"} alt="" />
													<div class="itembtn">
														<a onClick={() => unstakeOne(display[4])}><span class="unstakebtn">Unstake</span></a>
														<a onClick={() => stakeOne(display[4])}><span class="stakebtn">Stake</span></a>
														<a onClick={() => Arr(display[4])}><span class="viewbtn">Select</span></a>
													</div>
												</div>
											</div>
											<div class="item">
												<div class="itempep">
													<img src={"https://bafybeidi7uvvnvtoof6syceve7cdzztb5rbonfoeshaglkctt7m4xem52u.ipfs.dweb.link/"+display[5]+".png"} alt="" />
													<div class="itembtn">
														<a onClick={() => unstakeOne(display[5])}><span class="unstakebtn">Unstake</span></a>
														<a onClick={() => stakeOne(display[5])}><span class="stakebtn">Stake</span></a>
														<a onClick={() => Arr(display[5])}><span class="viewbtn">Select</span></a>
													</div>
												</div>
											</div>
										</div>
									</div>
									<center>
										<button onClick={backPage}>Back</button>
										{page}
										<button onClick={nextPage}>Next</button>
									</center>

									<div class="insideBordHead mxwth">
										<p>$g4n9 balance : <span>{bal} $g4n9</span></p>	
										<div>
											 <p>g4n9 troops : <span>{numOfTroops}</span></p>	
											 <a onClick={() => stakeMul()}><span class="blue">STAKE SELECTED</span></a>
										</div>	
										<div>
											 <p class="smnn">pending $g4n9 token rewards : <span>{pendingRewards} $g4n9</span></p>	
											 <a onClick={() => claim()} class="smnn"><span class="blue">claim</span></a>
										</div>	
									</div>
								</div>
							</div>	
						</div>
						<div class="pageFooter">
							<div class="rankarea">
								<p>
									{percentStaked}% cryptog4n9 staked
								</p>								
								<p>
									{totalStaked}/10000
								</p>								
								<p>
									owners staking : {numOfAddressesStaking}
								</p>
							</div>
							<div class="py-2"></div>
							<ol>
								<li><a href="#"><img src="images/icons/insta.png" alt="" /></a></li>
								<li><a href="#"><img src="images/icons/tiktalk-File.png" alt="" /></a></li>
								<li><a href="#"><img src="images/icons/fb.png" alt="" /></a></li>
								<li><a href="#"><img src="images/icons/twitter.png" alt="" /></a></li>
								<li><a href="#"><img src="images/icons/discord.png" alt="" /></a></li>
							</ol>
							<div class="py-3"></div>
						</div>
					</div>
				</div>
			</div>
		</section>
    )
}

export default BlockNative;