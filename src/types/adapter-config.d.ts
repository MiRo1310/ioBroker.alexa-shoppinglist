// This file extends the AdapterConfig type from "@types/iobroker"
// using the actual properties present in io-package.json
// in order to provide typings for adapter.config properties


// Augment the globally declared type ioBroker.AdapterConfig


declare global {
    namespace ioBroker {
        interface AdapterConfig {
            shoppinglist: string;
            device: string;
            doNotMovetoInactiv: boolean
        }
    }
}


export {};
