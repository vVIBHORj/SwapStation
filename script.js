 // Connect to MetaMask
 const web3 = new Web3(window.ethereum);
 let contract;
 let userAddress;

 // Contract ABI and address (replace with your actual contract's ABI and address)
 const contractABI = [
{
 "inputs": [
     {
         "internalType": "uint256",
         "name": "_rate",
         "type": "uint256"
     }
 ],
 "name": "setRate",
 "outputs": [],
 "stateMutability": "nonpayable",
 "type": "function"
},
{
 "inputs": [
     {
         "internalType": "address",
         "name": "tokenA",
         "type": "address"
     },
     {
         "internalType": "address",
         "name": "tokenB",
         "type": "address"
     },
     {
         "internalType": "uint256",
         "name": "amountA",
         "type": "uint256"
     }
 ],
 "name": "swap",
 "outputs": [],
 "stateMutability": "nonpayable",
 "type": "function"
},
{
 "inputs": [
     {
         "internalType": "address",
         "name": "token",
         "type": "address"
     },
     {
         "internalType": "uint256",
         "name": "amount",
         "type": "uint256"
     }
 ],
 "name": "addLiquidity",
 "outputs": [],
 "stateMutability": "nonpayable",
 "type": "function"
}
]
;

 const contractAddress = '0x9642BBd0AA5B38C02b4B8FFD9eA79Ff7821eE337'; // Replace with your DEX contract address

 // Initialize contract and user address
 async function init() {
     await window.ethereum.request({ method: 'eth_requestAccounts' });
     userAddress = (await web3.eth.getAccounts())[0];
     contract = new web3.eth.Contract(contractABI, contractAddress);
 }

 // Set the rate function
 async function setRate() {
     const rate = document.getElementById('rate').value;
     if (rate <= 0) {
         alert('Please enter a valid rate');
         return;
     }

     try {
         await contract.methods.setRate(rate).send({ from: userAddress });
         document.getElementById('status').textContent = `Rate set to ${rate}`;
     } catch (error) {
         document.getElementById('status').textContent = 'Error setting rate: ' + error.message;
     }
 }

 // Swap Tokens function
 async function swapTokens() {
const tokenA = document.getElementById('tokenA').value;
const tokenB = document.getElementById('tokenB').value;
const amountA = document.getElementById('amountA').value;

if (!web3.utils.isAddress(tokenA) || !web3.utils.isAddress(tokenB)) {
 alert('Please enter valid token addresses');
 return;
}

if (amountA <= 0) {
 alert('Please enter a valid amount');
 return;
}

// Assuming the token has 18 decimals (most ERC-20 tokens)
const decimals = 18;

// Convert the amount to the smallest unit (e.g., wei or subunits)
const amountAInWei = web3.utils.toBN(amountA).mul(web3.utils.toBN(10).pow(web3.utils.toBN(decimals)));

try {
 // Approve tokens first
 const tokenAContract = new web3.eth.Contract([
     { "constant": false, "inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }
 ], tokenA);

 // Approve the contract to spend Token A
 await tokenAContract.methods.approve(contractAddress, amountAInWei.toString()).send({ from: userAddress });

 // Call the swap function
 await contract.methods.swap(tokenA, tokenB, amountAInWei.toString()).send({ from: userAddress });

 document.getElementById('status').textContent = `Swapped ${amountA} TokenA for TokenB`;
} catch (error) {
 document.getElementById('status').textContent = 'Swap failed: ' + error.message;
}
}

async function addLiquidity() {
    const liquidityToken = document.getElementById('liquidityToken').value;
    const amountLiquidity = document.getElementById('amountLiquidity').value;

    if (!web3.utils.isAddress(liquidityToken)) {
        alert('Please enter a valid token address');
        return;
    }

    if (amountLiquidity <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    const decimals = 18; // Assuming the token has 18 decimals (adjust as necessary)
    const amountLiquidityInWei = web3.utils.toBN(amountLiquidity).mul(web3.utils.toBN(10).pow(web3.utils.toBN(decimals)));

    try {
        const tokenContract = new web3.eth.Contract([{
            "constant": false,
            "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
            "name": "approve",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }], liquidityToken);

        await tokenContract.methods.approve(contract.options.address, amountLiquidityInWei.toString()).send({ from: userAddress });

        await contract.methods.addLiquidity(liquidityToken, amountLiquidityInWei.toString()).send({ from: userAddress });

        document.getElementById('status').textContent = `Added ${amountLiquidity} Liquidity of Token`;
    } catch (error) {
        document.getElementById('status').textContent = `Liquidity addition failed: ${error.message}`;
    }
}


 // Initialize the app
 init();
