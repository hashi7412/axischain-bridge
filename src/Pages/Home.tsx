import { url } from 'inspector';
import { connected } from 'process';
import React from 'react';
import Layout from '../components/Layout';
import { useWallet, ConnectionRejectedError } from 'use-wallet'

import useStore, {CONNECTED, CONNECTING, ZERO, SYMBOL, networks, DISCONNECTED, proxy} from '../useStore';
/* import { getApiUrl } from '../util'; */

const ERR_INSTALL 		= 'You must install Metamask into your browser: https://metamask.io/download.html'
const ERR_DISCONNECTED 	= 'walllet disconnected'
const ERR_NOACCOUNTS 	= 'No selected address.'
const ERR_UNKNOWN 		= 'Unknown error'
const ERR_ASKCONNECT 	= 'Connect to Metamask using the button on the top right.'
const ERR_CANCELLED 	= 'You cancelled requested operation.'
const ERR_CHAINID 		= 'Invalid chain id #:chainId'


interface HomeStatus {
	query: string
	loading: boolean
	submitLabel: string
	
	chain: string
	targetChain: string
	token: string
	value: string
	fee: number
	receiveValue: number
}
interface WalletStatus {
	// status: string
	// address: string
	balance: number
	err: string
}
interface BaseStatus {
	prices: {[chain:string]:number}
	gasPrices: {[chain:string]:number}
	maxGasLimit: number
}

const Home = () => {
	const wallet = useWallet()
	const connected = wallet.status==='connected' && !!wallet.account
	const { L, txs, addTx, page, update } = useStore();
	const refMenu = React.useRef<HTMLUListElement>(null)
	const refList = React.useRef<HTMLInputElement>(null)
	const refAmount = React.useRef<HTMLInputElement>(null)

	const [status, setStatus] = React.useState<HomeStatus>({
		loading: false,
		submitLabel:'',
		query: '',
		chain: 'ETH',
		targetChain: 'AXIS',
		token: 'ETH',
		value: '0.0',
		fee: 0,
		receiveValue: 0
	})

	const [walletStatus, setWalletStatus] = React.useState<WalletStatus>({
		// status: '',
		// address: '',
		balance: 0, // checking | number
		err: '',
	})
	const [base, setBase] = React.useState<BaseStatus>({
		prices: {},
		gasPrices: {},
		maxGasLimit: 0,
	})

	/* const [isPending, setPending] = React.useState(false) */
	
	const set = (attrs:Partial<HomeStatus>) => setStatus({...status, ...attrs})

	const [time, setTime] = React.useState(+new Date())
	const [timeBalance, setTimeBalance] = React.useState(+new Date())
	

	const getInfo = async () => {
		try {
			const res = await fetch(proxy, {
				body:JSON.stringify({
					jsonrpc:	"2.0",
					method: "get-info",
					params: [],
					id: 1
				}),
				headers: {Accept: "application/json","Content-Type": "application/json"},
				method: "POST"
			})
			const json = await res.json()
			console.log(Math.round(+new Date()/1000), json.result)
			setBase(json.result)
			
		} catch (error) {
			console.log(error)
		}
	}

	React.useEffect(() => {
		if (connected) {
			getBalance(status.chain, status.token, wallet.account).then(balance=>{
				if (typeof balance==="number") setWalletStatus({ ...walletStatus, balance })	
			})
		}
		const timer = setTimeout(()=>setTimeBalance(+new Date()), 10000)
		return ()=>clearTimeout(timer)
	}, [timeBalance, connected, status.chain, status.token])
	
	React.useEffect(() => {
		getInfo()
		const timer = setTimeout(()=>setTime(+new Date()), 10000)
		return ()=>clearTimeout(timer)
	}, [time])

	const onChangeCoin = (chain:string, token:string)=>{

		const targetChain = chain==='AXIS' ? 'ETH' : 'AXIS'
		const {receiveValue, fee} = getReceivedValue(chain, targetChain, token, Number(status.value))
		if (status.chain!==chain) wallet.reset()
		set({chain, targetChain, token, receiveValue, fee})
		update({chain})
		if (refMenu && refMenu.current) {
			refMenu.current.style.display = 'none'
			setTimeout(()=>(refMenu && refMenu.current && (refMenu.current.style.display = '')), 100)
		}
	}

	const getReceivedValue = (chain:string, targetChain:string, token:string, amount: number) => {
		if (base.gasPrices[chain]!==undefined) {
			const feeEther = base.maxGasLimit * base.gasPrices[chain] / 1e9
			const decimals = networks[targetChain].tokens[token].decimals
			const fee = Number((feeEther * base.prices[targetChain] / base.prices[token]).toFixed(decimals<6 ? decimals : 6))
			if (amount > fee) {
				const receiveValue = Number((amount - fee).toFixed(decimals<6 ? decimals : 6))
				return {receiveValue, fee}
			}
			return {receiveValue: 0, fee}
		}
		return {receiveValue: 0, fee: 0}
	}

	const onChangeValue = (value:string)=>{
		const {receiveValue, fee} = getReceivedValue(status.chain, status.targetChain, status.token, Number(value))
		set({value, receiveValue, fee})
	}

	const getBalance = async (chain:string, token:string, address:string): Promise<number> => {
		const net = networks[chain]
		const { ethers } = window
		const provider = new ethers.providers.JsonRpcProvider(net.rpc)
		let value = 0;
		if (net.tokens[token].contract===undefined) {
			value = await provider.getBalance(address)
		} else {
			const contract = new ethers.Contract(net.tokens[token].contract, ["function balanceOf(address account) public view returns (uint256)"], provider)
			value = await contract.balanceOf(address)
		}
		const decimals = net.tokens[token].decimals
		return Number(Number(ethers.utils.formatUnits(value, decimals)).toFixed(decimals>6 ? 6 : decimals))
	}

	const waitTx = async (chain:string, txid:string) => {
		const { ethers } = window
		const net = networks[chain]
		const provider = new ethers.providers.JsonRpcProvider(net.rpc)
		let k = 0;
		while(++k<100) {
			const tx = await provider.getTransactionReceipt(txid);
			if (tx && tx.blockNumber) return true;
			await new Promise(resolve=>setTimeout(resolve, 5000))
		}
		return false
	}
	const onConnect = (key?:string)=>()=>{
		wallet.connect(key)
	}
	const submit = async ()=>{
		try {
			if (connected) {
				const net = networks[status.chain]
				const token = net.tokens[status.token]
				const targetNet = networks[status.targetChain]
				const amount = Number(status.value)
				if (amount === 0) {
					refAmount?.current?.select()
					refAmount?.current?.focus()
					return
				}
				set({loading:true, submitLabel:'checking balance...'})
				const balance = await getBalance(status.chain, status.token, wallet.account)
				if (amount > balance) {
					refAmount?.current?.focus()
					setWalletStatus({...walletStatus, err:"You haven't enough balance"})
					set({loading:false, submitLabel:'SUBMIT'})
					return
				}
				if (status.targetChain!=='AXIS') {
					set({loading:true, submitLabel:'checking store balance...'})
					const storeBalance = await getBalance(status.targetChain, status.token, targetNet.bridge)
					if (amount > storeBalance) {
						setWalletStatus({...walletStatus, err:"Sorry, there is not enough balance in the bridge store."})
						set({loading:false, submitLabel:'SUBMIT'})
						return
					}
				}
				const { ethers } = window
				const provider = new ethers.providers.Web3Provider(wallet.ethereum);
				const contract = new ethers.Contract(net.bridge, [
					"function deposit(address target, address token, uint amount, uint targetChain) external payable"
				], provider)

				const value = ethers.utils.parseUnits(status.value, token.decimals)
				const created = Math.round(new Date().getTime()/1000)
				const target = wallet.account
				if (token.contract!==undefined) { // if it is token, need to approve 
					const tokenContract = new ethers.Contract(token.contract, [
						"function allowance(address account, address spender) public view returns (uint256)",
						"function approve(address spender, uint256 amount) public returns (bool)"
					], provider)
					set({loading:true, submitLabel:'checking allowance...'})
					const approval = await tokenContract.allowance(wallet.account, net.bridge)
					if (approval.lt(value)) {
						set({loading:true, submitLabel:'approve bridge...'})
						const unsignedTx = await tokenContract.populateTransaction.approve(net.bridge, value.toHexString());
						const tx = {
							...unsignedTx,
							from: wallet.account,
							value: '0x00',
							chainId: ethers.utils.hexlify(net.chainId), // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
						};
						const txHash = await wallet.ethereum.request({
							method: 'eth_sendTransaction',
							params: [tx],
						});
						await waitTx(status.chain, txHash)
					}
					set({loading:true, submitLabel:'depositing...'})
					const unsignedTx = await contract.populateTransaction.deposit(target, token.contract, value.toHexString(), targetNet.chainId);
					const tx = {
						...unsignedTx,
						from: wallet.account,
						value: '0x00',
						chainId: ethers.utils.hexlify(net.chainId),
					};
					const txId = await wallet.ethereum.request({
						method: 'eth_sendTransaction',
						params: [tx],
					});
					addTx({txId, chain:status.chain, targetChain:status.targetChain, address:wallet.account, token:status.token, value:Number(status.value), updated:0, created})
					await waitTx(status.chain, txId)
				} else {  // if it is token, need to approve 
					set({loading:true, submitLabel:'depositing...'})
					const unsignedTx = await contract.populateTransaction.deposit(target, ZERO, value.toHexString(), targetNet.chainId);
					const tx = {
						...unsignedTx,
						from: wallet.account,
						value:value.toHexString(),
						chainId: ethers.utils.hexlify(net.chainId),
					};
					const txId = await wallet.ethereum.request({
						method: 'eth_sendTransaction',
						params: [tx],
					});
					addTx({txId, chain:status.chain, targetChain:status.targetChain, address:wallet.account, token:status.token, value:Number(status.value), updated:0, created})
					await waitTx(status.chain, txId)
				}
				set({loading:false})
			} else {
				update({page:1})
			}
		} catch (error:any) {
			if (error.code===4001) {
				setWalletStatus({...walletStatus, err:ERR_CANCELLED})
			} else {
				setWalletStatus({...walletStatus, err:error.message})
			}
			set({loading:false})
		}
	}

	return (
		<Layout className="home">
			<section style={{ background:'url("/bg-grid-white.svg") 0% 0% / cover no-repeat', height:'100%' }}>
				
				<div className="panel swap" style={{background:'url(/panel.svg) 0% 0% / cover no-repeat'}}>
					{(connected || page===0) && (
						<>
							{walletStatus.err ? (
								<p style={{color:'var(--txt2)', padding: 10}}>{walletStatus.err}</p>
							) : (
								<p style={{color:'var(--txt2)', padding: 10}}>{wallet.account ? 'Your wallet: ' + wallet.account.slice(0,20) + '...' + wallet.account.slice(-8) : 'Not Connected'}</p>
							)}
							<div>
								<div className="chain">
									<div>
										<div style={{paddingLeft:'0.5em'}}>From</div>
										<div>{walletStatus.balance} {status.token==='-' ? status.chain : status.token} <span>MAX</span></div>
									</div>
									<div>
										<div>
											<input ref={refAmount} type="text" className='size-1' value={status.value} onChange={e=>onChangeValue(e.target.value)} />
										</div>
										<div style={{display:'flex', alignItems:'center'}}>
											<img className="icon" src={`/coins/${status.token}.svg`} alt={status.chain}/>
											<div>{status.token} ({networks[status.chain].tokens[status.token].contract===undefined ? 'Native Token' : networks[status.chain].erc20})</div>
											<div>
												<div className="menu">
													<i><span className="ic-down"></span></i>
													<ul ref={refMenu} className={status.chain==='AXIS' ? 'right' : ''} style={{width:150}}>
														{Object.keys(networks).map(k=>
															<div key={k}>
																<li className='disabled'>
																	<img className="icon" src={k===SYMBOL ? `/logo.svg` : `/networks/${k}.svg`} alt="eth"/>
																	<span>{L['chain.' + k.toLowerCase()]}</span>
																</li>
																{Object.keys(networks[k].tokens).map(t=>(
																	<li key={k+t} onClick={()=>onChangeCoin(k, t)} style={{paddingLeft: 40}}>
																		<img className="icon" src={`/coins/${t}.svg`} alt="t"/>
																		<span>{`${t} (${networks[k].tokens[t].contract===undefined ? 'Native Token' : networks[k].erc20})`}</span>
																	</li>
																))}
															</div>
														)}
													</ul>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="chain" style={{marginTop:20}}>
									<div>
										<div style={{paddingLeft:'0.5em'}}>To</div>
										<div></div>
									</div>
									<div>
										<div>
											<input type="text" className='size-1' readOnly value={status.receiveValue} />
										</div>
										<div style={{display:'flex', alignItems:'center'}}>
											<img className="icon" src={`/coins/${status.token}.svg`} alt={status.token}/>
											<div>{status.token} ({networks[status.targetChain].tokens[status.token].contract===undefined ? 'Native Token' : networks[status.targetChain].erc20})</div>
											<div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div style={{paddingTop:20, display:'flex', justifyContent:'center'}}>
								<button disabled={status.loading} className="submit" onClick={submit}>
									{status.loading ? (
										<div style={{display:'flex', alignItems:'center'}}>
											<div style={{width:'1.5em'}}>
												<div className="loader">Loading...</div>
											</div>
											<div>{status.submitLabel}</div>
										</div>) : (wallet.status==='connected' ? 'SUBMIT' : 'Connect wallet')
									}
								</button>
							</div>
							{txs.length ? (
								<div style={{paddingTop:20}}>
									<p><b style={{color:'var(--txt2)'}}>Recent transactions:</b></p>
									<div style={{maxHeight:300, overflowY:'auto'}}>
									{txs.map((v,k)=>(
										<div className={"tx flex" + (v.receivedAmount===undefined ? ' pending' : '')} key={k}>
											<div className="c1">
												<img src={`/networks/${v.chain}.svg`} style={{width:16, height:16, marginRight:5}} alt={v.chain} />
												<span>To</span>
												<img src={`/networks/${v.targetChain}.svg`} style={{width:16, height:16, marginLeft:5}} alt={v.targetChain} />
											</div>
											<code className="c2"><a className="cmd" href={networks[v.chain].explorer + '/tx/' + v.txId} target="_blank" rel="noreferrer" >{v.txId.slice(0,10) + '...' + v.txId.slice(-4)}</a></code>
											<code className="c3">
												<img src={`/coins/${v.token}.svg`} loading='lazy' style={{width:20, height:20, marginRight:5}} alt={v.token} />
												<span>{v.value}</span>
											</code>
										</div>
									))}
									</div>
								</div>
							) : null}
						</>
					)}
					{(!connected && page===1) && (
						<>	
							<div style={{display:'flex', alignItems:'center'}}>
								<button onClick={()=>update({page:0})} style={{backgroundColor: 'transparent', border:'none', cursor:'pointer'}}>
									<svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M7.96576 16.6036L8.49609 17.1339L9.55675 16.0732L9.02642 15.5429L7.96576 16.6036ZM1.42503 9.00217L0.894696 8.47184C0.601803 8.76474 0.601803 9.23961 0.894696 9.5325L1.42503 9.00217ZM9.02642 2.46144L9.55675 1.93111L8.49609 0.870447L7.96576 1.40078L9.02642 2.46144ZM9.02642 15.5429L1.95536 8.47184L0.894696 9.5325L7.96576 16.6036L9.02642 15.5429ZM1.95536 9.5325L9.02642 2.46144L7.96576 1.40078L0.894696 8.47184L1.95536 9.5325Z" fill="white"/>
									</svg>
								</button>
								<p className='size-1' style={{color: 'var(--txt2)'}}>Choose your wallet provider</p>
							</div>
							<div>
								{wallet.error instanceof ConnectionRejectedError ? 'Connection error: the user rejected the activation' : wallet.error?.name}
							</div>
							<div className='wallet-provider'>
								<div onClick={onConnect()}>
									<img src="/wallets/metamask.webp" alt="metamask" />
									<h4>MetaMask</h4>
								</div>
								<div onClick={onConnect('walletconnect')}>
									<img src="/wallets/walletconnect.webp" alt="walletconnect" />
									<h4>Wallet Connect</h4>
								</div>
								<div onClick={onConnect('walletlink')}>
									<img src="/wallets/coinbase.webp" alt="coinbase" />
									<h4>Coinbase Wallet</h4>
								</div>
							</div>
							<div>
								<p>More wallet options coming soon. Suggest wallet ?</p>
							</div>
						</>
					)}
				</div>
			</section>
		</Layout>
	)
};

export default Home;