import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Ed25519Keypair, Ed25519PublicKey } from '@mysten/sui.js/keypairs/ed25519';
import { fromHEX } from '@mysten/sui.js/utils';

// create a new SuiClient object pointing to the network you want to use
const suiClient = new SuiClient({ url: getFullnodeUrl('mainnet') });

const PACKAGE_ID = "0x830fe26674dc638af7c3d84030e2575f44a2bdc1baa1f4757cfe010a4b106b6a"; // mainnet
const TickRecordID = "0xfa6f8ab30f91a3ca6f969d117677fb4f669e08bbeed815071cf38f4d19284199"; // mainnet
const MINT_FEE = 100000000; // 0.1 SUI
const TICK = "MOVE";

// Put your secret keys here
const secretKey = [
    "0x...",
    "0x...",
    "0x...",
];


// Keypair from an existing secret keys
const keypairs = secretKey.map(key => Ed25519Keypair.fromSecretKey(fromHEX(key)));
const derived_addresses = keypairs.map(keypair => new Ed25519PublicKey(keypair.getPublicKey().toRawBytes()).toSuiAddress());

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function get_current_epoch(suiClient) {
    const tick_record = await suiClient.getObject({
        id: TickRecordID,
        options: { showContent: true, showDisplay: true },
    })
    return parseInt(tick_record.data.content.fields.current_epoch);
}

async function mint(keypair, address, current_epoch) {
    try {
        const txb = new TransactionBlock();
        const [coin] = txb.splitCoins(txb.gas, [MINT_FEE]);
        txb.moveCall({
            target: `${PACKAGE_ID}::movescription::mint`,
            // object IDs must be wrapped in moveCall arguments
            arguments: [
                txb.object(TickRecordID),
                txb.pure(TICK),
                coin,
                txb.pure("0x6")],
        });
        const result = await suiClient.signAndExecuteTransactionBlock({
            transactionBlock: txb,
            signer: keypair,
        });

        const transactionBlock = await suiClient.waitForTransactionBlock({
            digest: result.digest,
            options: {
                showEffects: true,
            },
        });
        console.log(`${address} minted at epoch: ${current_epoch}`);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

let length = keypairs.length;
let last_epochs = Array.from({ length }, () => -1);
async function executeTransaction() {
    while (true) {
        try {
            let current_epoch = await get_current_epoch(suiClient);
            for (let i = 0; i < last_epochs.length; i++) {
                if (last_epochs[i] == current_epoch) {
                    continue;
                }
                let rt = await mint(keypairs[i], derived_addresses[i], current_epoch);
                if (rt) {
                    last_epochs[i] = current_epoch;
                }
            }
            await sleep(5 * 1000); // 5 seconds
        } catch (err) {
            console.log(err);
        }
    }
}
executeTransaction();