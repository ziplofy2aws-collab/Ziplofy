import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ShippingZone } from '../models/shipping-zone/shipping-zone.model';
import { ShippingZoneCountryEntry } from '../models/shipping-zone/shipping-zone-country-entry.model';
import { ShippingZoneCountryStateEntry } from '../models/shipping-zone/shipping-zone-country-state-entry.model';
import { ShippingProfile } from '../models/shipping-profile/shipping-profile.model';
import { Country } from '../models/country/country.model';
import { State } from '../models/state/state.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { ShippingZoneRate } from '../models/shipping-zone/shipping-zone-rate.model';

interface CountryEntry {
  countryId: string;
  stateIds?: string[];
}

// POST /shipping-zones
export const createShippingZone = asyncErrorHandler(async (req: Request, res: Response) => {
  const { zoneName, shippingProfileId, countries } = req.body as {
    zoneName?: string;
    shippingProfileId?: string;
    countries?: CountryEntry[];
  };

  if (!shippingProfileId || !mongoose.isValidObjectId(shippingProfileId)) {
    throw new CustomError('Valid shippingProfileId is required', 400);
  }

  if (!zoneName || typeof zoneName !== 'string' || !zoneName.trim()) {
    throw new CustomError('zoneName is required', 400);
  }

  if (!countries || !Array.isArray(countries) || countries.length === 0) {
    throw new CustomError('At least one country is required', 400);
  }

  // Verify shipping profile exists
  const shippingProfile = await ShippingProfile.findById(shippingProfileId).lean();
  if (!shippingProfile) {
    throw new CustomError('Shipping profile not found', 404);
  }

  // Check if zone with same name already exists for this shipping profile
  const existingZone = await ShippingZone.findOne({ shippingProfileId, zoneName: zoneName.trim() }).lean();
  if (existingZone) {
    throw new CustomError('Shipping zone with this name already exists for this shipping profile', 409);
  }

  // Validate countries and states
  const countryIds = new Set<string>();
  for (const countryEntry of countries) {
    if (!countryEntry.countryId || !mongoose.isValidObjectId(countryEntry.countryId)) {
      throw new CustomError('Invalid countryId provided', 400);
    }

    if (countryIds.has(countryEntry.countryId)) {
      throw new CustomError('Duplicate countryId found', 400);
    }
    countryIds.add(countryEntry.countryId);

    // Validate stateIds if provided
    if (countryEntry.stateIds && Array.isArray(countryEntry.stateIds)) {
      const stateIdSet = new Set<string>();
      for (const stateId of countryEntry.stateIds) {
        if (!mongoose.isValidObjectId(stateId)) {
          throw new CustomError(`Invalid stateId: ${stateId}`, 400);
        }
        if (stateIdSet.has(stateId)) {
          throw new CustomError(`Duplicate stateId: ${stateId}`, 400);
        }
        stateIdSet.add(stateId);
      }
    }
  }

  // Verify all countries exist
  const countryIdsArray = Array.from(countryIds);
  const existingCountries = await Country.find({ _id: { $in: countryIdsArray } }).lean();
  if (existingCountries.length !== countryIdsArray.length) {
    throw new CustomError('One or more countries not found', 404);
  }

  // Verify all states exist and belong to their respective countries
  const allStateIds: string[] = [];
  const stateToCountryMap = new Map<string, string>();

  for (const countryEntry of countries) {
    if (countryEntry.stateIds && countryEntry.stateIds.length > 0) {
      allStateIds.push(...countryEntry.stateIds);
      countryEntry.stateIds.forEach((stateId) => {
        stateToCountryMap.set(stateId, countryEntry.countryId);
      });
    }
  }

  if (allStateIds.length > 0) {
    const existingStates = await State.find({ _id: { $in: allStateIds } }).lean();
    if (existingStates.length !== allStateIds.length) {
      throw new CustomError('One or more states not found', 404);
    }

    // Verify states belong to their respective countries
    for (const state of existingStates) {
      const expectedCountryId = stateToCountryMap.get(String(state._id));
      if (String(state.countryId) !== expectedCountryId) {
        throw new CustomError(`State ${state.name} does not belong to the specified country`, 400);
      }
    }
  }

  // Create shipping zone
  const createdZone = await ShippingZone.create({
    shippingProfileId,
    zoneName: zoneName.trim(),
  });

  // Create country entries and state entries
  const countryEntries = [];
  const stateEntries = [];

  for (const countryEntry of countries) {
    // Create country entry
    const countryEntryDoc = await ShippingZoneCountryEntry.create({
      shippingZoneId: createdZone._id,
      countryId: countryEntry.countryId,
    });

    countryEntries.push(countryEntryDoc);

    // Create state entries if provided
    if (countryEntry.stateIds && countryEntry.stateIds.length > 0) {
      for (const stateId of countryEntry.stateIds) {
        stateEntries.push({
          stateId,
          shippingZoneCountryEntryId: countryEntryDoc._id,
        });
      }
    }
  }

  // Bulk create state entries if any
  if (stateEntries.length > 0) {
    await ShippingZoneCountryStateEntry.insertMany(stateEntries);
  }

  // Populate countries and states for the created zone
  const countryEntriesForResponse = await ShippingZoneCountryEntry.find({
    shippingZoneId: createdZone._id,
  })
    .populate('countryId', 'name iso2 flagEmoji')
    .lean();

  const countriesWithStates = await Promise.all(
    countryEntriesForResponse.map(async (countryEntry) => {
      const stateEntries = await ShippingZoneCountryStateEntry.find({
        shippingZoneCountryEntryId: countryEntry._id,
      })
        .populate('stateId', 'name code')
        .lean();

      const country = countryEntry.countryId as any;
      const totalStates = await State.countDocuments({ countryId: countryEntry.countryId });

      const stateIds = stateEntries.map((se) => {
        const stateId = se.stateId;
        if (stateId && typeof stateId === 'object' && '_id' in stateId) {
          return String((stateId as any)._id);
        }
        return String(stateId);
      });

      const countryIdValue = country && typeof country === 'object' && '_id' in country
        ? String(country._id)
        : String(countryEntry.countryId);

      return {
        countryId: countryIdValue,
        countryName: country?.name || '',
        countryIso2: country?.iso2 || '',
        countryFlag: country?.flagEmoji || '',
        selectedStatesCount: stateEntries.length,
        totalStatesCount: totalStates,
        stateIds: stateIds,
      };
    })
  );

  const populated = await ShippingZone.findById(createdZone._id)
    .populate('shippingProfileId', 'profileName')
    .lean();

  return res.status(201).json({
    success: true,
    data: {
      ...populated,
      countries: countriesWithStates,
    },
    message: 'Shipping zone created successfully',
    meta: {
      shippingProfile: {
        id: String(shippingProfile._id),
        name: shippingProfile.profileName,
      },
      countriesCount: countryEntries.length,
      statesCount: stateEntries.length,
    },
  });
});

// GET /shipping-zones/profile/:shippingProfileId
export const getShippingZonesByShippingProfileId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { shippingProfileId } = req.params;

  if (!shippingProfileId || !mongoose.isValidObjectId(shippingProfileId)) {
    throw new CustomError('Valid shippingProfileId is required', 400);
  }

  // Verify shipping profile exists
  const shippingProfile = await ShippingProfile.findById(shippingProfileId).lean();
  if (!shippingProfile) {
    throw new CustomError('Shipping profile not found', 404);
  }

  const zones = await ShippingZone.find({ shippingProfileId })
    .populate('shippingProfileId', 'profileName')
    .sort({ createdAt: -1 })
    .lean();

  // Populate countries and states for each zone
  const zonesWithDetails = await Promise.all(
    zones.map(async (zone) => {
      const countryEntries = await ShippingZoneCountryEntry.find({
        shippingZoneId: zone._id,
      })
        .populate('countryId', 'name iso2 flagEmoji')
        .lean();

      const countriesWithStates = await Promise.all(
        countryEntries.map(async (countryEntry) => {
          const stateEntries = await ShippingZoneCountryStateEntry.find({
            shippingZoneCountryEntryId: countryEntry._id,
          })
            .populate('stateId', 'name code')
            .lean();

          const country = countryEntry.countryId as any;
          const totalStates = await State.countDocuments({ countryId: countryEntry.countryId });

          // Extract state IDs as strings (handle both populated objects and string IDs)
          const stateIds = stateEntries.map((se) => {
            const stateId = se.stateId;
            if (stateId && typeof stateId === 'object' && '_id' in stateId) {
              return String((stateId as any)._id);
            }
            return String(stateId);
          });

          // Extract country ID as string
          const countryIdValue = country && typeof country === 'object' && '_id' in country
            ? String(country._id)
            : String(countryEntry.countryId);

          return {
            countryId: countryIdValue,
            countryName: country?.name || '',
            countryIso2: country?.iso2 || '',
            countryFlag: country?.flagEmoji || '',
            selectedStatesCount: stateEntries.length,
            totalStatesCount: totalStates,
            stateIds: stateIds,
          };
        })
      );

      return {
        ...zone,
        countries: countriesWithStates,
      };
    })
  );

  return res.status(200).json({
    success: true,
    data: zonesWithDetails,
    message: 'Shipping zones fetched successfully',
    meta: {
      total: zones.length,
      shippingProfile: {
        id: String(shippingProfile._id),
        name: shippingProfile.profileName,
      },
    },
  });
});

// PUT /shipping-zones/:id
export const updateShippingZone = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { zoneName, countries } = req.body as {
    zoneName?: string;
    countries?: CountryEntry[];
  };

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid shipping zone ID is required', 400);
  }

  const zone = await ShippingZone.findById(id).lean();
  if (!zone) {
    throw new CustomError('Shipping zone not found', 404);
  }

  const update: { zoneName?: string } = {};
  if (zoneName !== undefined) {
    if (typeof zoneName !== 'string' || !zoneName.trim()) {
      throw new CustomError('zoneName must be a non-empty string', 400);
    }

    // Check if another zone with same name exists for this shipping profile
    const existingZone = await ShippingZone.findOne({
      shippingProfileId: zone.shippingProfileId,
      zoneName: zoneName.trim(),
      _id: { $ne: id },
    }).lean();

    if (existingZone) {
      throw new CustomError('Shipping zone with this name already exists for this shipping profile', 409);
    }

    update.zoneName = zoneName.trim();
  }

  // Update countries and states if provided
  if (countries !== undefined) {
    if (!Array.isArray(countries) || countries.length === 0) {
      throw new CustomError('At least one country is required', 400);
    }

    // Validate countries and states (same validation as create)
    const countryIds = new Set<string>();
    for (const countryEntry of countries) {
      if (!countryEntry.countryId || !mongoose.isValidObjectId(countryEntry.countryId)) {
        throw new CustomError('Invalid countryId provided', 400);
      }

      if (countryIds.has(countryEntry.countryId)) {
        throw new CustomError('Duplicate countryId found', 400);
      }
      countryIds.add(countryEntry.countryId);

      if (countryEntry.stateIds && Array.isArray(countryEntry.stateIds)) {
        const stateIdSet = new Set<string>();
        for (const stateId of countryEntry.stateIds) {
          if (!mongoose.isValidObjectId(stateId)) {
            throw new CustomError(`Invalid stateId: ${stateId}`, 400);
          }
          if (stateIdSet.has(stateId)) {
            throw new CustomError(`Duplicate stateId: ${stateId}`, 400);
          }
          stateIdSet.add(stateId);
        }
      }
    }

    // Verify all countries exist
    const countryIdsArray = Array.from(countryIds);
    const existingCountries = await Country.find({ _id: { $in: countryIdsArray } }).lean();
    if (existingCountries.length !== countryIdsArray.length) {
      throw new CustomError('One or more countries not found', 404);
    }

    // Verify all states exist and belong to their respective countries
    const allStateIds: string[] = [];
    const stateToCountryMap = new Map<string, string>();

    for (const countryEntry of countries) {
      if (countryEntry.stateIds && countryEntry.stateIds.length > 0) {
        allStateIds.push(...countryEntry.stateIds);
        countryEntry.stateIds.forEach((stateId) => {
          stateToCountryMap.set(stateId, countryEntry.countryId);
        });
      }
    }

    if (allStateIds.length > 0) {
      const existingStates = await State.find({ _id: { $in: allStateIds } }).lean();
      if (existingStates.length !== allStateIds.length) {
        throw new CustomError('One or more states not found', 404);
      }

      for (const state of existingStates) {
        const expectedCountryId = stateToCountryMap.get(String(state._id));
        if (String(state.countryId) !== expectedCountryId) {
          throw new CustomError(`State ${state.name} does not belong to the specified country`, 400);
        }
      }
    }

    // Delete existing country and state entries
    const existingCountryEntries = await ShippingZoneCountryEntry.find({
      shippingZoneId: id,
    }).lean();

    const countryEntryIds = existingCountryEntries.map((ce) => ce._id);
    if (countryEntryIds.length > 0) {
      await ShippingZoneCountryStateEntry.deleteMany({
        shippingZoneCountryEntryId: { $in: countryEntryIds },
      });
    }
    await ShippingZoneCountryEntry.deleteMany({ shippingZoneId: id });

    // Create new country entries and state entries
    const countryEntries = [];
    const stateEntries = [];

    for (const countryEntry of countries) {
      const countryEntryDoc = await ShippingZoneCountryEntry.create({
        shippingZoneId: id,
        countryId: countryEntry.countryId,
      });

      countryEntries.push(countryEntryDoc);

      if (countryEntry.stateIds && countryEntry.stateIds.length > 0) {
        for (const stateId of countryEntry.stateIds) {
          stateEntries.push({
            stateId,
            shippingZoneCountryEntryId: countryEntryDoc._id,
          });
        }
      }
    }

    if (stateEntries.length > 0) {
      await ShippingZoneCountryStateEntry.insertMany(stateEntries);
    }
  }

  if (Object.keys(update).length === 0 && countries === undefined) {
    throw new CustomError('No valid fields to update', 400);
  }

  const updated = await ShippingZone.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true }
  )
    .populate('shippingProfileId', 'profileName')
    .lean();

  if (!updated) {
    throw new CustomError('Shipping zone not found', 404);
  }

  // Populate countries and states for the updated zone
  const countryEntriesForResponse = await ShippingZoneCountryEntry.find({
    shippingZoneId: id,
  })
    .populate('countryId', 'name iso2 flagEmoji')
    .lean();

  const countriesWithStates = await Promise.all(
    countryEntriesForResponse.map(async (countryEntry) => {
      const stateEntries = await ShippingZoneCountryStateEntry.find({
        shippingZoneCountryEntryId: countryEntry._id,
      })
        .populate('stateId', 'name code')
        .lean();

      const country = countryEntry.countryId as any;
      const totalStates = await State.countDocuments({ countryId: countryEntry.countryId });

      const stateIds = stateEntries.map((se) => {
        const stateId = se.stateId;
        if (stateId && typeof stateId === 'object' && '_id' in stateId) {
          return String((stateId as any)._id);
        }
        return String(stateId);
      });

      const countryIdValue = country && typeof country === 'object' && '_id' in country
        ? String(country._id)
        : String(countryEntry.countryId);

      return {
        countryId: countryIdValue,
        countryName: country?.name || '',
        countryIso2: country?.iso2 || '',
        countryFlag: country?.flagEmoji || '',
        selectedStatesCount: stateEntries.length,
        totalStatesCount: totalStates,
        stateIds: stateIds,
      };
    })
  );

  // Extract shipping profile info from populated shippingProfileId
  const populatedProfile = updated.shippingProfileId && typeof updated.shippingProfileId === 'object' && 'profileName' in updated.shippingProfileId
    ? (updated.shippingProfileId as any)
    : null;

  // Get shipping profile info - fetch if not populated
  let profileInfo: { id: string; name: string };
  if (populatedProfile) {
    profileInfo = {
      id: String(populatedProfile._id),
      name: populatedProfile.profileName,
    };
  } else {
    // Fallback: fetch shipping profile if not populated
    const profile = await ShippingProfile.findById(zone.shippingProfileId).lean();
    if (!profile) {
      throw new CustomError('Shipping profile not found', 404);
    }
    profileInfo = {
      id: String(profile._id),
      name: profile.profileName,
    };
  }

  // Get counts - always include if countries were updated, otherwise use existing counts
  const countriesCount = countries !== undefined
    ? countryEntriesForResponse.length
    : countriesWithStates.length;
  const statesCount = countries !== undefined
    ? countriesWithStates.reduce((sum, country) => sum + country.selectedStatesCount, 0)
    : countriesWithStates.reduce((sum, country) => sum + country.selectedStatesCount, 0);

  return res.status(200).json({
    success: true,
    data: {
      ...updated,
      countries: countriesWithStates,
    },
    message: 'Shipping zone updated successfully',
    meta: {
      shippingProfile: profileInfo,
      countriesCount,
      statesCount,
    },
  });
});

// DELETE /shipping-zones/:id
export const deleteShippingZone = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid shipping zone ID is required', 400);
  }

  const zone = await ShippingZone.findById(id).populate('shippingProfileId', 'profileName').lean();
  if (!zone) {
    throw new CustomError('Shipping zone not found', 404);
  }

  let profileInfo: { id: string; name: string };
  if (zone.shippingProfileId && typeof zone.shippingProfileId === 'object' && 'profileName' in zone.shippingProfileId) {
    profileInfo = {
      id: String((zone.shippingProfileId as any)._id),
      name: (zone.shippingProfileId as any).profileName,
    };
  } else {
    const profile = await ShippingProfile.findById(zone.shippingProfileId).lean();
    if (!profile) {
      throw new CustomError('Shipping profile not found', 404);
    }
    profileInfo = {
      id: String(profile._id),
      name: profile.profileName,
    };
  }

  const countryEntries = await ShippingZoneCountryEntry.find({ shippingZoneId: id })
    .select('_id')
    .lean();
  const countryEntryIds = countryEntries.map((entry) => entry._id);

  const statesDeleted = countryEntryIds.length
    ? await ShippingZoneCountryStateEntry.countDocuments({
        shippingZoneCountryEntryId: { $in: countryEntryIds },
      })
    : 0;

  if (countryEntryIds.length) {
    await ShippingZoneCountryStateEntry.deleteMany({
      shippingZoneCountryEntryId: { $in: countryEntryIds },
    });
  }
  await ShippingZoneCountryEntry.deleteMany({ shippingZoneId: id });
  const ratesDeleted = await ShippingZoneRate.countDocuments({ shippingZoneId: id });
  if (ratesDeleted > 0) {
    await ShippingZoneRate.deleteMany({ shippingZoneId: id });
  }
  await ShippingZone.findByIdAndDelete(id);

  return res.status(200).json({
    success: true,
    data: {
      _id: String(zone._id),
      zoneName: zone.zoneName,
      shippingProfileId: zone.shippingProfileId,
    },
    message: 'Shipping zone deleted successfully',
    meta: {
      shippingProfile: profileInfo,
      countriesDeleted: countryEntries.length,
      statesDeleted,
      ratesDeleted,
    },
  });
});

