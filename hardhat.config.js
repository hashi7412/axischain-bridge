require('dotenv').config();
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('hardhat-deploy');
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
	const accounts = await hre.ethers.getSigners();

	for (const account of accounts) {
		console.log(account.address);
	}
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
	networks: {
		localhost: {
			url: "http://127.0.0.1:8545"
		},
		axis :{
			url: "https://rpc.axischain.network",
			accounts: [process.env.DEPLOY_PRIVKEY]
		},
		axistest :{
			url: "https://testnet-rpc.axischain.network",
			accounts: [process.env.DEPLOY_PRIVKEY]
		},
		eth :{
			url: "https://infura.io/v3/580d6de4d2694cbdbee111d2f553dbcc",
			accounts: [process.env.DEPLOY_PRIVKEY]
		},
		
		ethtest :{
			url: "https://rinkeby.infura.io/v3/580d6de4d2694cbdbee111d2f553dbcc",
			accounts: [process.env.DEPLOY_PRIVKEY]
		},

		bsctestnet :{
			url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
			accounts: [process.env.DEPLOY_PRIVKEY]
		},

		bsc :{
			url: "https://bsc-dataseed1.ninicoin.io/",
			accounts: [process.env.DEPLOY_PRIVKEY]
		},
	},
	etherscan: {
		apiKey: ""
	},
	solidity: {
		compilers: [
			{
				version: "0.6.12",
				settings: {
					optimizer: {
						enabled: true,
						runs: 200,
					},
				}
			},
			{
				version: "0.4.17",
				settings: {
					optimizer: {
						enabled: true,
						runs: 200,
					},
				}
			},
			{
				version: "0.5.16",
				settings: {
					optimizer: {
						enabled: true,
						runs: 200,
					},
				}
			},
			{
				version: "0.8.4",
				settings: {
					optimizer: {
						enabled: true,
						runs: 200,
					},
				}
			},
			{
				version: "0.7.6",
				settings: {
					optimizer: {
						enabled: true,
						runs: 200,
					},
				}
			},
		]
	},
	mocha: {
		timeout: 20000
	}
};
