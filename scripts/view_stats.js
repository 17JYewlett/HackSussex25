async function setupContract() {
    contractABI = await loadFileIntoVariable("abi.txt");
    contractAddress = await loadFileIntoVariable("contract_key.txt");
}
setupContract();

async function registerDriver() {
    if (!window.ethereum) {
        alert("MetaMask is not installed!");
        return;
    }

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []); 
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        // Get Wallet Address...
        const walletAddress = await signer.getAddress();

        // Fetch form data
        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const carReg = document.getElementById("carReg").value;
        const nationalInsurance = document.getElementById("nationalInsurance").value;
        const dateOfBirth = document.getElementById("dateOfBirth").value.trim();

        // Generate composite key
        const compKey = createComposite(firstName, lastName, dateOfBirth, nationalInsurance);

        let hashHex = await sha256(compKey);
        let finalKey = BigInt("0x" + hashHex);

        console.log(`Registering with hash key: ${finalKey.toString()}`);
        console.log("walletAddress Type:", typeof walletAddress, walletAddress);
        console.log("finalKey Type:", typeof finalKey, finalKey);
        console.log("carReg Type:", typeof carReg, carReg);

        // ✅ Ensure you only pass 3 arguments
        const tx = await contract.viewStatus(walletAddress, finalKey, carReg);
        alert("Transaction sent! Waiting for confirmation...");

        await tx.wait();
        alert("Successfully registered your data on Flare blockchain!");

    } catch (error) {
        console.error("Transaction error:", error);
        if (error.code === 4001) {
            alert("Transaction rejected by user ❌");
        } else {
            alert("Transaction failed. Check console for details ❌");
        }
    }
}

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function createComposite(fname, lname, dob, nationalinsurance) {
    const fnameLower = fname.toLowerCase();
    const lnameLower = lname.toLowerCase();
    const formattedDate = new Date(dob).toISOString().split("T")[0];  // Convert to Date object
    const formattedNationalInsurance = nationalinsurance.replace(/\s+/g, "").toLowerCase();

    return `${fnameLower}${lnameLower}${formattedDate}${formattedNationalInsurance}`;
}