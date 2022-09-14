import React from 'react';

import { BrowserRouter, Switch, Route } from 'react-router-dom';

import Home from './Pages/Home';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useWallet, UseWalletProvider } from 'use-wallet'
import useStore, { networks } from './useStore';

function App() {
	const { chain } = useStore()

	const chainId = networks[chain].chainId
	const rpcUrl = networks[chain].rpc
	console.log(chainId)
	return (
		<UseWalletProvider
			chainId={chainId}
			connectors={{
				portis: { dAppId: 'my-dapp-id-123-xyz' },
				
				injected: {
					chainId,
					supportedChainIds: [chainId], //, NETWORK_CHAIN_IDS.mainnet
				},

				walletlink: {
					chainId: 1,
					url: rpcUrl,
					appName: "AxisChain Bridge",
				},

				walletconnect: {
					rpcUrl
					// rpc: { [chainId]: rpcUrl }
				},
			}}
		>
			<BrowserRouter>
				<Switch>
					<Route exact path="/" component={Home}></Route>
					<Route path="*" component={Home}></Route>
				</Switch>
				<ToastContainer />
			</BrowserRouter>
		</UseWalletProvider>
	);
}

export default App;
