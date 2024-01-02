
# Batch mint tool for movescriptions

- Mint page: https://mrc20.fun/ticks/move

## How to use

1. Environment

- Linux or WSL
- Node.js v20+

2. Add your private keys in `mint.js`, line 16.

    ```
    // Put your secret keys here
    const secretKey = [
        "0x...",
        "0x...",
        "0x...",
    ];
    ```

3. Install dependencies

    ```bash
    npm install
    ```

3. Run

    ```bash
    node mint.js
    ```

    When you see output like this, it means you have successfully minted your movescriptions.

    ```
    0x1d219xxx minted at epoch: 2770
    0x1d219xxx minted at epoch: 2771
    ...
    ```