import React from 'react'
import { useSelector, useDispatch}	from 'react-redux';

import Networks 					from './config/networks.json'
import TestnetNetworks 				from './config/networks.testnet.json'

import Slice 						from './reducer'
/* import Web3 						from 'web3' */

export const DISCONNECTED= '';
export const CONNECTING = 'connecting';
export const CONNECTED 	= 'connected';
/* export const getWeb3 = ()=>window.Web3; */

const AppKey = process.env.REACT_APP_GTAG || ''
export const proxy = process.env.REACT_APP_ENDPOINT || ''
export const testnet = process.env.REACT_APP_TESTNET==="1"
export const networks = (testnet ? TestnetNetworks : Networks) as {[chain:string]:NetworkType}
export const ZERO = "0x0000000000000000000000000000000000000000"

export const SYMBOL = 'AXIS'

const useStore = () => {
	const G = useSelector((state:StoreObject)=>state)
	const L = G.L
	const dispatch = useDispatch()
	const update = (payload:{[key:string]:any}) => dispatch(Slice.actions.update(payload))
	const addTx = (tx:TxType) => {
		const txs = [tx, ...G.txs]
		if (txs.length>10) txs.pop()
		window.localStorage.setItem(AppKey, JSON.stringify(txs))
		update({txs})
	}

	const check = async (network:string, txs:Array<string>):Promise<{[txId:string]:number}> =>  {
		const results:{[txId:string]:number} = {}
		// const net = networks[network]
		// const web3 = new window.Web3(net.rpc)
		// const height = await web3.eth.getBlockNumber()
		// const limit = 20
		// const count = txs.length
		// for(let i=0; i<count; i+=limit) {
		// 	const json:Array<{jsonrpc:string, method:string, params:Array<string>, id:number}> = []
		// 	let iEnd = i + limit
		// 	if (iEnd>count) iEnd = count
		// 	for (let k=i; k<iEnd; k++) {
		// 		json.push({jsonrpc: '2.0', method: 'eth_getTransactionReceipt', params: [txs[k]], id: k++})
		// 	}
		// 	const response = await fetch(net.rpc, {
		// 		body:JSON.stringify(json),
		// 		headers: {Accept: "application/json","Content-Type": "application/json"},
		// 		method: "POST"
		// 	})
		// 	const result = await response.json();
		// 	if (result!==null && Array.isArray(result)) {
		// 		for(let v of result) {
		// 			results[txs[v.id]] = v.result && v.result.status === '0x1' ? height - Number(v.result.blockNumber) + 1 : -1
		// 		}
		// 	}
		// }
		return results
	}

	return {...G, update, check, addTx};
}

export default useStore
