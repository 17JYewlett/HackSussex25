// Declare contract variables
let contractABI;
let contractAddress;

// ✅ Load contract ABI and address (fixed async issue)
async function loadContractDetails() {
    try {
        // ✅ Fetch contract ABI
        const abiResponse = await fetch("abi.txt");
        if (!abiResponse.ok) throw new Error("Failed to load abi.txt");
        contractABI = await abiResponse.json(); // ✅ Parse as JSON

        // ✅ Fetch contract address
        const addressResponse = await fetch("contract_key.txt");
        if (!addressResponse.ok) throw new Error("Failed to load contract_key.txt");
        contractAddress = (await addressResponse.text()).trim(); // ✅ Read as text and remove spaces

        console.log("✅ ABI & Contract Address Loaded:", contractABI, contractAddress);
    } catch (error) {
        console.error("🚨 Error loading contract details:", error);
    }
}

// ✅ Use a self-executing async function to load contract details
(async () => {
    await loadContractDetails();
})();

// ✅ Fetch & Display Driver's Status from Blockchain
async function fetchCarStatus() {
    if (!window.ethereum) {
        alert("🚨 MetaMask is not installed!");
        return;
    }

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

        // Ensure contract is loaded
        if (!contractABI || typeof contractABI !== "object") {
            throw new Error("🚨 ABI is not loaded correctly. Check `abi.txt`.");
        }
        if (!contractAddress || contractAddress.length === 0) {
            throw new Error("🚨 Contract address is missing. Check `contract_key.txt`.");
        }
        
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        // Get Wallet Address
        const walletAddress = await signer.getAddress();

        // Fetch form data
        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const carReg = document.getElementById("carReg").value.trim();
        const nationalInsurance = document.getElementById("nationalInsurance").value.trim();
        const dateOfBirth = document.getElementById("dateOfBirth").value.trim();
        const usrId = 1; // Change if needed

        // Ensure no empty values
        if (!firstName || !lastName || !carReg || !nationalInsurance || !dateOfBirth) {
            alert("🚨 Please fill in all required fields.");
            return;
        }

        // Generate composite key
        const compKey = createComposite(firstName, lastName, dateOfBirth, nationalInsurance);
        let hashHex = await sha256(compKey);
        let finalKey = BigInt("0x" + hashHex.slice(0, 64)); // Ensures within uint256 range

        // Log values before calling contract
        console.log("🚀 Fetching Status with:");
        console.log("📌 Wallet Address:", walletAddress);
        console.log("📌 Key:", finalKey.toString());
        console.log("📌 Car Registration:", carReg);
        console.log("📌 User ID:", usrId);

        // ✅ Ensure `viewStatus` function exists before calling
        if (!contract.viewStatus) {
            throw new Error("❌ Function viewStatus does not exist in the contract!");
        }

        // 🔥 Call the contract function
        const result = await contract.viewStatus(walletAddress, finalKey, usrId, carReg);

        // ✅ Ensure contract returns valid results
        if (!result || result.length < 5) {
            throw new Error("❌ Invalid data received from contract.");
        }

        // ✅ Check if verification failed
        if (!result[0]) {
            document.getElementById("message").innerHTML = `<p><b>❌ VERIFICATION FAILED</b></p>`;
        } else {
            let myHTML = "<ul>";
            myHTML += `<li>✅ Safety Score: ${result[1]}</li>`;
            myHTML += `<li>✅ Brake Score: ${result[2]}</li>`;
            myHTML += `<li>✅ Speed Score: ${result[3]}</li>`;
            myHTML += `<li>💡 Reasoning: ${result[4]}</li>`;
            myHTML += "</ul>";
            document.getElementById("message").innerHTML = myHTML;
        }

    } catch (error) {
        console.error("🚨 Transaction Error:", error);
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
    const formattedDate = new Date(dob).toISOString().split("T")[0]; // Convert to Date object
    const formattedNationalInsurance = nationalinsurance.replace(/\s+/g, "").toLowerCase();

    return `${fnameLower}${lnameLower}${formattedDate}${formattedNationalInsurance}`;
}

// ✅ Attach event listener to button
document.addEventListener("DOMContentLoaded", function () {
    const fetchStatusBtn = document.getElementById("fetchStatusBtn");
    if (fetchStatusBtn) {
        fetchStatusBtn.addEventListener("click", fetchCarStatus);
    }
});