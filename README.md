# HackSussex25

Formatting of our structure:

COMPOSITE_KEY "${firstname}${lastname}${dateofbirth}${nationalinsurance}" -> gets hashed using SHA-256 algorithm!

Then, COMPOSITE_KEY along with CarReg is sent to the Smart Contract for either initial adding to the system OR verification / updating of user data.
