'use strict';
const { keyToPublicIdentityKey } = require('factom-identity-lib').app;
const base58 = require('bs58');
const crypto = require('crypto');
const { validatePublicKey } = require('../utils/keyUtils');
const { didStatusFromEntryAck } = require('../utils/factomUtils');
const { IdentityAlreadyExistsError, InvalidNetworkParameterError } = require('./errors');
const { Networks, FactomCliFactory } = require('./FactomCliFactory');

/**
 * Deactivates a DID.
 *
 * body DeactivateRequest  (optional)
 * returns DeactivateState
 **/
exports.deactivate = function (body) {
    return new Promise(function (resolve, reject) {
        resolve(501);
    });
}


/**
 * Registers a DID.
 *
 * body RegisterRequest  (optional)
 * returns RegisterState
 **/
exports.register = function (body) {
    return new Promise(function (resolve, reject) {
        const { jobId: entryHash, options } = body;
        const network = options.network || Networks.MAINNET;
        if (network !== Networks.MAINNET && network !== Networks.TESTNET) {
            reject(new InvalidNetworkParameterError(
                `Unsupported network specified! Must be testnet or mainnet. Received: ${network}`)
            );
            return;
        }
        const identityClient = FactomCliFactory.getFactomIdentityClient(network);

        if (entryHash) {
            return _getChainId(network, entryHash)
                .then(async chainId => {
                    resolve({
                        jobId: entryHash,
                        didState: {
                            state: await _getEntryStatus(network, entryHash, chainId),
                            identifier: _didFromChainId(network, chainId),
                        }
                    });
                })
                .catch(err => reject(err));
        }

        const { extIds, publicKeyBase58 } = options;

        try {
            validatePublicKey(publicKeyBase58);
        }
        catch (err) {
            reject(err);
            return;
        }

        let names = extIds;
        if (!extIds || !extIds.length) {
            names = [
                crypto.createHash('sha256').update(base58.decode(publicKeyBase58)).digest('hex')
            ];
        }

        identityClient.createIdentity(names,
            [keyToPublicIdentityKey(base58.decode(publicKeyBase58))],
            _getEsAddress(network))
            .then(async result => resolve({
                jobId: result.entryHash,
                didState: {
                    identifier: _didFromChainId(network, result.chainId),
                    state: await _getEntryStatus(network, result.entryHash, result.chainId),
                }
            }))
            .catch(err => {
                if (err.message.includes("already exists.")) {
                    reject(new IdentityAlreadyExistsError(
                        'A Factom DID with those parameters already exists.'));
                }
                reject(err);
            });
    });
}


/**
 * Updates a DID.
 *
 * body UpdateRequest  (optional)
 * returns UpdateState
 **/
exports.update = function (body) {
    return new Promise(function (resolve, reject) {
        resolve(501);
    });
}

const _getEntryStatus = (network, entryHash, chainId) => {
    const factomClient = FactomCliFactory.getFactomClient(network);
    return factomClient.factomdApi('ack', { hash: entryHash, chainid: chainId })
        .then(entryAckResponse => didStatusFromEntryAck(entryAckResponse));
}

const _getChainId = (network, entryHash) => {
    const factomClient = FactomCliFactory.getFactomClient(network);
    return factomClient.getEntry(entryHash)
        .then(response => response.chainId.toString('hex'));
}

const _didFromChainId = (network, chainId) => {
    return network === Networks.TESTNET ? `did:factom:testnet:${chainId}` : `did:factom:${chainId}`;
}

const _getEsAddress = network => {
    return network === Networks.TESTNET ?
        process.env.TESTNET_ES_ADDRESS : process.env.MAINNET_ES_ADDRESS;
}
