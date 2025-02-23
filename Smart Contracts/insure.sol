// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.6;


contract userDB {

    struct userInput{
        string carReg;
        //this could also be a byte32 variable according to gpt
        uint256 hashkey;
    }
    

    struct carInfo{
        bool verified;
        uint256 safetyscore;
        uint256 brakescore;
        uint256 speedscore;
        string reasoning;

    }
    
    struct claim{
        address driver;
        uint256 timestamp;
        string accidentDetails;
        uint256 claimAmount;
        bool isApproved;
        bool isProcessed;
    }

    mapping (uint256 => mapping(address => carInfo)) public userID;
    mapping(address=> userInput) public userRegister;
    mapping(address=> claim) public claims;
    mapping(address=> uint256) public claimhistory;



    function registerDriver(address wallet, uint256 key, string memory carr) external {
        userRegister[wallet].hashkey = key; 
        userRegister[wallet].carReg = carr;
    }

// Verify user by checking the encoded key and car registration
    function verifyUser(address wallet, uint256 inputkey, string memory carReg) external view returns (bool) {
        return (inputkey == userRegister[wallet].hashkey && 
                keccak256(abi.encodePacked(carReg)) == keccak256(abi.encodePacked(userRegister[wallet].carReg)));
    }



    function saveUser(address wallet, uint256 usrId, uint256 safety, 
    uint256 brake, 
    uint256 speed, 
    string memory reason) external {
        userID[usrId][wallet].safetyscore = safety;
        userID[usrId][wallet].brakescore = brake;
        userID[usrId][wallet].speedscore = speed;
        userID[usrId][wallet].reasoning = reason;

    }
    // function fileclaim(address wallet, string memory details, uint256 amount) external{
    //     require (claims[wallet].isProcessed ==false, "existing claims pending");
    // }

    function viewStatus(address wallet, uint256 usrId) 
        public view returns (bool, uint256, uint256, uint256, string memory) 
    {
        return (true, userID[usrId][wallet].safetyscore, userID[usrId][wallet].brakescore, userID[usrId][wallet].speedscore, userID[usrId][wallet].reasoning);
}
    function updateCarinfo(address wallet, uint256 usrId, string memory carReg, uint256 datasafety, uint256 databrake, uint256 dataspeed, string memory datareason) external returns (bool) {
            bool verified = this.verifyUser(wallet, usrId, carReg);
            if (verified) {
                // Change the scores, as user is verified
                userID[usrId][wallet].safetyscore = datasafety;
                userID[usrId][wallet].brakescore = databrake;
        
                userID[usrId][wallet].speedscore = dataspeed;
                userID[usrId][wallet].reasoning = datareason;

                return true;
                 }
            else {
                return false;
            }


    

    }

    //  function removeUser(address wallet, uint256 memId) external {
    //         delete membership[memId][wallet];
    // }
}

