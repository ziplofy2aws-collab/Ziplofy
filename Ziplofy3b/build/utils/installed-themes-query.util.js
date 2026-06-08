"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeAndUserScopeOr = storeAndUserScopeOr;
exports.canonicalStoreRef = canonicalStoreRef;
const mongoose_1 = require("mongoose");
/** Match legacy docs where `store`/`user` was saved as string or ObjectId. */
function storeAndUserScopeOr(storeIdToUse) {
    const storeIdStr = String(storeIdToUse);
    const oid = mongoose_1.Types.ObjectId.isValid(storeIdStr) ? new mongoose_1.Types.ObjectId(storeIdStr) : null;
    const clauses = [
        { store: storeIdStr },
        { user: storeIdStr },
    ];
    if (oid) {
        clauses.push({ store: oid }, { user: oid });
    }
    return clauses;
}
/** Prefer ObjectId in new/updated documents when the id is valid. */
function canonicalStoreRef(storeIdToUse) {
    const storeIdStr = String(storeIdToUse);
    return mongoose_1.Types.ObjectId.isValid(storeIdStr) ? new mongoose_1.Types.ObjectId(storeIdStr) : storeIdStr;
}
