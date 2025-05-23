import { createWalletClient, custom, createPublicClient, parseEther, defineChain, formatEther } from "https://esm.sh/viem";
import { contractAddress, abi } from "./constants-js.js";

const connectBtn = document.getElementById("connectBtn");
const fundBtn = document.getElementById("fundBtn");
const ethAmount = document.getElementById("ethAmount")
const balanceBtn = document.getElementById("balanceBtn")
const withdrawBtn = document.getElementById("withdrawBtn")
const fundedAmountBtn = document.getElementById("fundedAmountBtn")

let walletClient;
let publicClient;

async function connect() {
  if(typeof window.ethereum !== 'undefined') {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });

    let addresses = await walletClient.requestAddresses();
    connectBtn.innerHTML = "Connected";

  }else{
    connectBtn.innerHTML = "Please install MetaMask";
  }
}

async function fund() {
  const amount = ethAmount.value
  console.log(`Funding with ${amount}...`)

  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    })
    const [account] = await walletClient.requestAddresses()
    const currentChain = await getCurrentChain(walletClient)

    console.log("Processing transaction...")
    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    })
    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi,
      functionName: "fund",
      account,
      chain: currentChain,
      value: parseEther(amount),
    })
    console.log(request);
    
    const hash = await walletClient.writeContract(request)
    console.log("Transaction processed: ", hash)
  } else {
    fundBtn.innerHTML = "Please install MetaMask"
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    })

    const balance = await publicClient.getBalance({
      address: contractAddress,
    })
    console.log("Balance: ", formatEther(balance))
  }
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    })
    const [account] = await walletClient.requestAddresses()
    const currentChain = await getCurrentChain(walletClient)

    console.log("Processing transaction...")
    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    })
    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi,
      functionName: "withdraw",
      account,
      chain: currentChain,
    })
    console.log(request);
    
    const hash = await walletClient.writeContract(request)
    console.log("Transaction processed: ", hash)
  } else {
    withdrawBtn.innerHTML = "Please install MetaMask"
  }
}

async function fundedAmount() {
  if (typeof window.ethereum !== "undefined") {

    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    })
    const [account] = await walletClient.requestAddresses()

    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    });

    const currentChain = await getCurrentChain(publicClient);

    const fundedAmount = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "getAddressToAmountFunded",
      args: [account],
      chain: currentChain,
    });
    console.log("Funded Amount: ", formatEther(fundedAmount));

  }
}

async function getCurrentChain(client) {
  const chainId = await client.getChainId()
  const currentChain = defineChain({
    id: chainId,
    name: "Custom Chain",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ["http://localhost:8545"],
      },
    },
  })
  return currentChain
}

connectBtn.onclick = connect;
fundBtn.onclick = fund;
balanceBtn.onclick = getBalance;
withdrawBtn.onclick = withdraw;
fundedAmountBtn.onclick = fundedAmount;
