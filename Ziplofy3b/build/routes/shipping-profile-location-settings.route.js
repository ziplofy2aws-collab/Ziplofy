"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shipping_profile_location_settings_controller_1 = require("../controllers/shipping-profile-location-settings.controller");
const shippingProfileLocationSettingsRouter = (0, express_1.Router)();
shippingProfileLocationSettingsRouter.get('/:profileId', shipping_profile_location_settings_controller_1.getShippingProfileLocationSettings);
shippingProfileLocationSettingsRouter.put('/:profileId/location/:locationId', shipping_profile_location_settings_controller_1.updateShippingProfileLocationSetting);
exports.default = shippingProfileLocationSettingsRouter;
