// Declare contract variables
let contractABI;
let contractAddress;

// ✅ Load contract ABI and address
async function loadContractDetails() {
    contractABI = await loadFileIntoVariable("abi.txt");
    contractAddress = await loadFileIntoVariable("contract_key.txt");
}
loadContractDetails(); // Load contract details on startup

// ✅ Load a file's content into a variable
async function loadFileIntoVariable(filename) {
    try {
        const response = await fetch(filename);
        if (!response.ok) throw new Error(`Failed to load ${filename}`);
        return await response.text();
    } catch (error) {
        console.error(`🚨 Error loading ${filename}:`, error);
    }
}

// ✅ Register a new driver on Flare Blockchain
async function registerDriver() {
    if (!window.ethereum) {
        alert("🚨 MetaMask is not installed!");
        return;
    }

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

        // Ensure contract details are loaded
        if (!contractABI || !contractAddress) {
            console.error("🚨 contractABI or contractAddress is not loaded yet!");
            return;
        }

        const contract = new ethers.Contract(contractAddress.trim(), JSON.parse(contractABI), signer);

        // Get Wallet Address
        const walletAddress = await signer.getAddress();

        // Fetch form data
        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const carReg = document.getElementById("carReg").value.trim();
        const nationalInsurance = document.getElementById("nationalInsurance").value.trim();
        const dateOfBirth = document.getElementById("dateOfBirth").value.trim();

        // Ensure no empty values
        if (!firstName || !lastName || !carReg || !nationalInsurance || !dateOfBirth) {
            alert("🚨 Please fill in all required fields.");
            return;
        }

        // Generate composite key
        const compKey = createComposite(firstName, lastName, dateOfBirth, nationalInsurance);
        let hashHex = await sha256(compKey);
        let finalKey = BigInt("0x" + hashHex.slice(0, 64)); // Ensure it's within uint256 range

        // Log values before calling contract
        console.log("🚀 Registering with:");
        console.log("📌 Wallet Address:", walletAddress);
        console.log("📌 Key:", finalKey.toString());
        console.log("📌 Car Registration:", carReg);

        // Ensure function exists before calling
        if (!contract.registerDriver) {
            throw new Error("🚨 Function `registerDriver` does not exist in the smart contract!");
        }

        // Call contract function
        const tx = await contract.registerDriver(walletAddress, finalKey, carReg);
        alert("Transaction sent! Waiting for confirmation...");

        await tx.wait();
        alert("✅ Successfully registered your data on Flare blockchain!");

    } catch (error) {
        console.error("🚨 Transaction error:", error);
        alert(`❌ Transaction failed: ${error.message}`);
    }
}

// ✅ SHA-256 Hashing Function
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// ✅ Create Composite Key
function createComposite(fname, lname, dob, nationalinsurance) {
    const fnameLower = fname.toLowerCase();
    const lnameLower = lname.toLowerCase();
    const formattedDate = new Date(dob).toISOString().split("T")[0];  // Convert to Date object
    const formattedNationalInsurance = nationalinsurance.replace(/\s+/g, "").toLowerCase();

    return `${fnameLower}${lnameLower}${formattedDate}${formattedNationalInsurance}`;
}

// ✅ Attach event listener to register button
document.addEventListener("DOMContentLoaded", function() {
    const registerBtn = document.getElementById("registerBtn");
    if (registerBtn) {
        registerBtn.addEventListener("click", registerDriver);
    }
});