declare interface Window  {
	connector: IConnector;
	ethereum: any;
	ethers: any;
}

declare interface TokenObjectType {
	decimals: number
	contract?: string
}

declare interface NetworkType {
	bridge: string
	chainId: number
	confirmations: number 
	blocktime: number
	rpc: string
	explorer: string
	erc20: string
	tokens: {[symbol:string]:TokenObjectType}
}

declare interface TxType {
	txId: string
	chain:string
	targetChain:string
	address:string
	token:string
	value:number
	created: number
	receivedAmount?:number|boolean // if failed, false
	updated:number
}

declare interface MetmaskTxType {
	to: string
	from: string
	value: string
	data: string
	chainId: string
}

declare interface StoreObject {
	lang: string
	L: {[lang:string]:any}
	chain: string
	page: number
	loading: boolean
	txs: TxType[]
}