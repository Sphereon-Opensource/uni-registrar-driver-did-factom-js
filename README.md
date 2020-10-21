![Factom Protocol Logo](https://assets.website-files.com/5bca6108bae718b9ad49a5f9/5c4820477febe49184787777_Factom-Protocol_Logo-p-500.png)

# Universal Registrar Driver (NodeJS): factom

This is a [Universal Registrar](https://github.com/decentralized-identity/universal-registrar/) driver for **did:factom** identifiers.

## Specifications

* [Decentralized Identifiers](https://w3c.github.io/did-core/)

## Build and Run (Docker)

```
docker build -f ./docker/Dockerfile . -t sphereon/uni-registrar-driver-did-nodejs-factom
docker run -p 9080:9080 sphereon/uni-registrar-driver-did-nodejs-factom
curl -X POST http://localhost:9080/1.0/register -H "Content-Type: application/json"
```
## Required option parameters:
An example call with the option parameters can be seen below:
```shell script
curl -X POST http://localhost:9080/1.0/register -H "Content-Type: application/json" -d \
'{ "options": { \
    "publicKeyBase58": "6hUdTYK8pp3h1EwwJ4j8afsHHgJf8qDvdLrKbHPJkw6x", \
    "extIds": ["test", "external", "ids"] \
    "network": "test" \
}'
```
The options are:
* `publicKeyBase58` - **REQUIRED**: the public key to be associated with the DID
* `extIds` - **OPTIONAL**: the unique external ids for the chain entry forming the basis of the DID. If none are provided, `[SHA256(publicKey)]` is used.
* `network` - **OPTIONAL**: should be either `"test"` or `"main"` and determines where the DID will be created. Default is `"main"`.
## Build and Run (NodeJS)

```
npm start
```

## Driver Environment Variables

The driver recognizes the following environment variables:

### `uniregistrar_driver_did_factom_exampleSetting`

 * An example setting for the driver.
 * DidController value: (empty string)

## Driver Metadata

The driver returns the following metadata in addition to a DID document:

* `exampleMetadata`: Example metadata
