'use strict';
const { keyToPublicIdentityKey, FactomIdentityManager } = require('factom-identity-lib').app;
const { FactomCli } = require('factom');
const base58 = require('bs58');
const crypto = require('crypto');
const { validatePublicKey } = require('../utils/keyUtils');
const { didStatusFromEntryAck } = require('../utils/factomUtils');
const { IdentityAlreadyExistsError } = require('./errors');

const identityClient = new FactomIdentityManager({
    factomd: {
        host: process.env.FACTOMD_HOST,
        port: process.env.FACTOMD_PORT,
    }
});

const factomClient = new FactomCli({
    factomd: {
        host: process.env.FACTOMD_HOST,
        port: process.env.FACTOMD_PORT,
    }
});

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
        if (entryHash) {
            return _getChainId(entryHash)
                .then(async chainId => {
                    resolve({
                        jobId: entryHash,
                        didState: {
                            state: await _getEntryStatus(entryHash, chainId),
                            identifier: `did:factom:${chainId}`,
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
            process.env.ES_ADDRESS)
            .then(async result => resolve({
                jobId: result.entryHash,
                didState: {
                    identifier: `did:factom:${result.chainId}`,
                    state: await _getEntryStatus(result.entryHash, result.chainId),
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

const _getEntryStatus = (entryHash, chainId) => {
    return factomClient.factomdApi('ack', { hash: entryHash, chainid: chainId})
        .then(entryAckResponse => didStatusFromEntryAck(entryAckResponse));
}

const _getChainId = entryHash => {
    return factomClient.getEntry(entryHash)
        .then(response => response.chainId.toString('hex'));
}

