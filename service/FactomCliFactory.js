const { FactomIdentityManager } = require('factom-identity-lib').app;
const { FactomCli } = require('factom');
const { InvalidNetworkParameterError } = require('./errors');

const Networks = Object.freeze({
    TEST: 'test',
    MAIN: 'main',
});

class FactomCliFactory {
    static factomClient;
    static factomTestnetClient;
    static factomIdentityClient;
    static factomTestnetIdentityClient;

    static config = {
        host: process.env.FACTOMD_HOST,
        port: process.env.FACTOMD_PORT,
        protocol: process.env.FACTOMD_PROTOCOL,
    };

    static testnetConfig = {
        host: process.env.FACTOMD_TESTNET_HOST,
        port: process.env.FACTOMD_TESTNET_PORT,
        protocol: process.env.FACTOMD_TESTNET_PROTOCOL,
    }


    static getFactomClient(network) {
        switch (network) {
            case Networks.MAIN:
                if (!FactomCliFactory.factomClient) {
                    FactomCliFactory.factomClient = new FactomCli({
                        factomd: FactomCliFactory.config,
                    });
                }
                return FactomCliFactory.factomClient;
            case Networks.TEST:
                if (!FactomCliFactory.factomClient) {
                    FactomCliFactory.factomClient = new FactomCli({
                        factomd: FactomCliFactory.factomTestnetClient,
                    });
                }
                return FactomCliFactory.factomTestnetClient;
            default:
                throw new InvalidNetworkParameterError(
                    "Unsupported network specified! Must be test or main");
        }
    }

    static getFactomIdentityClient(network) {
        switch (network) {
            case Networks.MAIN:
                if (!FactomCliFactory.factomIdentityClient) {
                    FactomCliFactory.factomIdentityClient = new FactomIdentityManager({
                        factomd: FactomCliFactory.config,
                    });
                }
                return FactomCliFactory.factomIdentityClient;
            case Networks.TEST:
                if (!FactomCliFactory.factomTestnetIdentityClient) {
                    FactomCliFactory.factomTestnetIdentityClient = new FactomIdentityManager({
                        factomd: FactomCliFactory.testnetConfig,
                    });
                }
                return FactomCliFactory.factomIdentityClient;
            default:
                throw new InvalidNetworkParameterError(
                    "Unsupported network specified! Must be test or main");
        }
    }
}

module.exports = {
    FactomCliFactory,
    Networks
}
