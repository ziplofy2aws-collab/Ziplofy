import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
interface AutomationTemplate {
  id: string;
  title: string;
  description: string;
  creator: string;
  requiresApp: boolean;
}

const templates: AutomationTemplate[] = [
  {
    id: "1",
    title: "Recover abandoned cart",
    description: "Send an email 10 hours after a customer gets to checkout but doesn't place an order to...",
    creator: "Ziplofy",
    requiresApp: true,
  },
  {
    id: "2",
    title: "Recover abandoned cart",
    description: "Send a marketing email when a customer adds at least one product to their cart but doesn't...",
    creator: "Ziplofy",
    requiresApp: true,
  },
  {
    id: "3",
    title: "Convert abandoned product browse",
    description: "Send a marketing email to customers who viewed a product but didn't add it to their cart. ...",
    creator: "Ziplofy",
    requiresApp: true,
  },
  {
    id: "4",
    title: "Welcome new subscribers with a discount email",
    description: "Send new subscribers a welcome email with a discount when they subscribe through a form ...",
    creator: "Ziplofy",
    requiresApp: true,
  },
  {
    id: "5",
    title: "Thank customers after they purchase",
    description: "Send a different thank you email to customers after their first and second purchases. 1 day aft...",
    creator: "Ziplofy",
    requiresApp: true,
  },
  {
    id: "6",
    title: "Welcome new subscribers with a discount series",
    description: "Send new subscribers a welcome series with 4 emails when they subscribe through a form on...",
    creator: "Ziplofy",
    requiresApp: true,
  },
  {
    id: "7",
    title: "Celebrate customer birthday",
    description: "Build customer loyalty by offering customers a special discount on their birthday. This...",
    creator: "Ziplofy",
    requiresApp: true,
  },
  {
    id: "8",
    title: "Win back customers",
    description: "Give a discount to customers who haven't placed an order at your store in the last 60 day...",
    creator: "Ziplofy",
    requiresApp: true,
  },
  {
    id: "9",
    title: "Upsell customers after their first purchase",
    description: "Send a marketing email showcasing featured products after a customer makes their first...",
    creator: "Ziplofy",
    requiresApp: true,
  },
];

const AutomationTemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [requiredApps, setRequiredApps] = useState("");
  const [appStatus, setAppStatus] = useState("");

  const handleCreateCustomAutomation = () => {
    navigate('/marketing/automations/new');
  };

  return (
    <div className="min-h-screen bg-page-background-color">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-medium text-gray-900">Automation templates</h1>
              <button
                onClick={handleCreateCustomAutomation}
                className="px-3 py-1.5 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Create custom automation
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-6 px-4">
          {/* Search and Filter Bar */}
          <div className="flex gap-2 items-center flex-wrap mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Searching all templates"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-1.5 text-base border border-gray-200 rounded focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors"
              />
            </div>
            <select
              value={requiredApps}
              onChange={(e) => setRequiredApps(e.target.value)}
              className="px-3 py-1.5 text-base border border-gray-200 rounded focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors min-w-[150px]"
            >
              <option value="">Required apps</option>
              <option value="email">Email</option>
            </select>
            <select
              value={appStatus}
              onChange={(e) => setAppStatus(e.target.value)}
              className="px-3 py-1.5 text-base border border-gray-200 rounded focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors min-w-[150px]"
            >
              <option value="">App status</option>
              <option value="installed">Installed</option>
              <option value="not-installed">Not Installed</option>
            </select>
            <button className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <ArrowsUpDownIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-3 border border-gray-200 bg-white flex flex-col cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  {template.title}
                </h3>
                <p className="text-xs text-gray-600 mb-3 flex-grow">
                  {template.description}
                </p>
                <div className="flex justify-between items-center mt-auto">
                  <p className="text-xs text-gray-600">
                    Created by {template.creator}
                  </p>
                  {template.requiresApp && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-600">Required app</span>
                      <div className="w-5 h-5 bg-gray-700 flex items-center justify-center">
                        <EnvelopeIcon className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};

export default AutomationTemplatesPage;

