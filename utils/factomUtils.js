const DidCreationStatus = Object.freeze({
    FINISHED: "finished",
    PENDING: "pending",
    NOT_FOUND: "not found",
});

const didStatusFromEntryAck = ({ entrydata: entryData }) => {
    if (entryData.status === 'DBlockConfirmed') {
        return DidCreationStatus.FINISHED;
    }
    if (entryData.status === 'NotConfirmed' || entryData.status === 'TransactionACK') {
        return DidCreationStatus.PENDING;
    }
    return DidCreationStatus.NOT_FOUND;
}

module.exports = {
    didStatusFromEntryAck
};
