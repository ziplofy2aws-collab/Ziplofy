"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shipping_profile_product_variants_entry_controller_1 = require("../controllers/shipping-profile-product-variants-entry.controller");
const shippingProfileProductVariantsEntryRouter = (0, express_1.Router)();
shippingProfileProductVariantsEntryRouter.get('/:profileId', shipping_profile_product_variants_entry_controller_1.getShippingProfileProductVariantEntries);
shippingProfileProductVariantsEntryRouter.post('/:profileId', shipping_profile_product_variants_entry_controller_1.createShippingProfileProductVariantEntry);
shippingProfileProductVariantsEntryRouter.delete('/:id', shipping_profile_product_variants_entry_controller_1.deleteShippingProfileProductVariantEntry);
exports.default = shippingProfileProductVariantsEntryRouter;
