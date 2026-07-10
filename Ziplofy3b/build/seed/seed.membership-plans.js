"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedMembershipPlans = seedMembershipPlans;
const database_config_1 = require("../config/database.config");
const membership_plan_model_1 = require("../models/membership-plan/membership-plan.model");
const defaultPlans = [
    {
        name: "Starter Plan",
        description: "For most businesses that want to optimize web queries",
        priceMonthly: 499,
        priceYearly: 4990,
        isPopular: false,
        sortOrder: 0,
        features: [
            { name: "500 Orders", included: true },
            { name: "Unlock every feature", included: true },
            { name: "Custom integrations", included: true },
            { name: "24/7 Support", included: true },
            { name: "Fast processing", included: false },
            { name: "Modern Landing Page", included: true },
            { name: "Single Product Landing Page", included: true },
        ],
    },
    {
        name: "Growth Plan",
        description: "For most businesses that want to optimize web queries",
        priceMonthly: 999,
        priceYearly: 9990,
        isPopular: false,
        sortOrder: 1,
        features: [
            { name: "1000 Orders", included: true },
            { name: "Unlock every feature", included: true },
            { name: "Custom integrations", included: true },
            { name: "24/7 Support", included: true },
            { name: "Fast processing", included: true },
            { name: "Modern Landing Page", included: true },
            { name: "Single Product Landing Page", included: true },
        ],
    },
    {
        name: "Enterprise Plan",
        description: "For most businesses that want to optimize web queries",
        priceMonthly: 1599,
        priceYearly: 15990,
        isPopular: true,
        sortOrder: 2,
        features: [
            { name: "Unlimited order", included: true },
            { name: "Unlock every feature", included: true },
            { name: "Custom integrations", included: true },
            { name: "24/7 Support", included: true },
            { name: "Fast processing", included: true },
            { name: "Modern Landing Page", included: true },
            { name: "Single Product Landing Page", included: true },
        ],
    },
];
async function seedMembershipPlans() {
    try {
        await (0, database_config_1.connectDB)();
        const existingCount = await membership_plan_model_1.MembershipPlan.countDocuments();
        if (existingCount > 0) {
            console.log(`ℹ️  ${existingCount} membership plan(s) already exist — skipping seed.`);
            process.exit(0);
        }
        await membership_plan_model_1.MembershipPlan.insertMany(defaultPlans);
        console.log(`✅ Seeded ${defaultPlans.length} membership plans.`);
        process.exit(0);
    }
    catch (err) {
        console.error("❌ Error seeding membership plans:", err);
        process.exit(1);
    }
}
if (require.main === module) {
    seedMembershipPlans();
}
