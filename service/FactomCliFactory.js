const { FactomIdentityManager } = require('factom-identity-lib').app;
const { FactomCli } = require('factom');
const { InvalidNetworkParameterError } = require('./errors');

const Networks = Object.freeze({
    TESTNET: 'testnet',
    MAINNET: 'mainnet',
});

const FactomCliRegistry = {};

const mainnetConfig = {
    host: process.env.MAINNET_FACTOMD_HOST,
    port: process.env.MAINNET_FACTOMD_PORT,
    protocol: process.env.MAINNET_FACTOMD_PROTOCOL,
};

const testnetConfig = {
    host: process.env.TESTNET_FACTOMD_HOST,
    port: process.env.TESTNET_FACTOMD_PORT,
    protocol: process.env.TESTNET_FACTOMD_PROTOCOL,
}

class FactomCliFactory {
    static getFactomClient(network) {
        switch (network) {
            case Networks.MAINNET:
                if (!FactomCliRegistry.factomMainnetClient) {
                    FactomCliRegistry.factomMainnetClient = new FactomCli(mainnetConfig);
                }
                return FactomCliRegistry.factomMainnetClient;
            case Networks.TESTNET:
                if (!FactomCliRegistry.factomTestnetClient) {
                    FactomCliRegistry.factomTestnetClient = new FactomCli(testnetConfig);
                }
                return FactomCliRegistry.factomTestnetClient;
            default:
                throw new InvalidNetworkParameterError(
                    `Unsupported network specified! Must be test or main. Received: ${network}`);
        }
    }

    static getFactomIdentityClient(network) {
        switch (network) {
            case Networks.MAINNET:
                if (!FactomCliRegistry.factomMainnetIdentityClient) {
                    FactomCliRegistry.factomMainnetIdentityClient = new FactomIdentityManager(
                        mainnetConfig);
                }
                return FactomCliRegistry.factomMainnetIdentityClient;
            case Networks.TESTNET:
                if (!FactomCliRegistry.factomTestnetIdentityClient) {
                    FactomCliRegistry.factomTestnetIdentityClient = new FactomIdentityManager(
                        testnetConfig);
                }
                return FactomCliRegistry.factomTestnetIdentityClient;
            default:
                throw new InvalidNetworkParameterError(
                    `Unsupported network specified! Must be test or main. Received: ${network}`);
        }
    }
}

module.exports = {
    FactomCliFactory,
    Networks
}
