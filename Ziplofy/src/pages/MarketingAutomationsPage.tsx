import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EnvelopeIcon,
  CircleStackIcon,
  Cog6ToothIcon,
  ShoppingCartIcon
} from "@heroicons/react/24/outline";
import { useAutomationFlows } from "../contexts/automation-flow.context";
import { useStore } from "../contexts/store.context";

const MarketingAutomationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [completedTasks, setCompletedTasks] = useState(0);
  const totalTasks = 5;

  const { activeStoreId } = useStore();
  const { flows, getByStoreId, update } = useAutomationFlows();

  useEffect(() => {
    if (activeStoreId) {
      getByStoreId(activeStoreId).catch(() => {});
    }
  }, [activeStoreId, getByStoreId]);

  const handleTaskComplete = useCallback((taskIndex: number) => {
    setCompletedTasks(prev => prev + 1);
  }, []);

  const handleViewTemplates = useCallback(() => {
    navigate('/marketing/automations/templates');
  }, [navigate]);

  const handleFlowToggle = useCallback((flowId: string, currentStatus: boolean) => {
    update(flowId, { isActive: !currentStatus }).catch(() => {});
  }, [update]);

  const handleFlowClick = useCallback((flowId: string) => {
    navigate(`/marketing/automations/${flowId}`);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Automations</h1>
              <p className="text-sm text-gray-600 mt-1">Automate multi-channel customer journeys</p>
            </div>
            <button
              onClick={handleViewTemplates}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View templates
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-6">
          {/* Main Section - Automate multi-channel customer journeys */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex-1 pr-8">
                  <h2 className="text-base font-semibold mb-2 text-gray-900">
                    Automate multi-channel customer journeys
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Marketing automations are set up once and run for as long as you want.
                  </p>
                  <button
                    onClick={handleViewTemplates}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View templates
                  </button>
                </div>
                <div className="w-[200px] h-[120px] flex items-center justify-center relative">
                  {/* Automation workflow illustration */}
                  <div className="relative w-full h-full">
                    {/* Teal triangle */}
                    <div
                      className="absolute top-2.5 left-1/2 transform -translate-x-1/2"
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: '15px solid transparent',
                        borderRight: '15px solid transparent',
                        borderBottom: '25px solid #20b2aa',
                      }}
                    />
                    {/* Red square */}
                    <div className="absolute top-12 left-5 w-5 h-5 bg-red-400" />
                    {/* Orange circle */}
                    <div className="absolute top-12 right-5 w-5 h-5 rounded-full bg-orange-400" />
                    {/* Connecting lines */}
                    <div className="absolute top-9 left-1/2 w-[60%] h-px bg-gray-300 transform -translate-x-1/2" />
                    <div className="absolute top-15 left-[30%] w-[40%] h-px bg-gray-300" />
                  </div>
                </div>
              </div>
            </div>

          {/* Your Automations (only if flows exist) */}
          {flows.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
              <h2 className="text-base font-semibold mb-4 text-gray-900">
                Your automations
              </h2>
              <div className="flex flex-col gap-3">
                {flows.map((flow) => (
                  <div
                    key={flow._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors bg-white"
                    onClick={() => handleFlowClick(flow._id)}
                  >
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-900">{flow.name}</p>
                        <p className="text-xs text-gray-600">
                          Trigger: {flow.triggerKey} • {flow.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <label className="relative inline-block w-11 h-6 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(flow.isActive)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleFlowToggle(flow._id, Boolean(flow.isActive));
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                        </label>
                      </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Turn visitors into subscribers */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
            <h2 className="text-base font-semibold mb-2 text-gray-900">
              Turn visitors into subscribers
            </h2>
            <p className="text-sm text-gray-600">
              From opt-in forms to automated welcome emails and marketing campaigns, set your business growth in motion.{' '}
              <button className="text-blue-600 hover:text-blue-700 underline">
                View case study
              </button>
            </p>
          </div>

          {/* Start with these essential templates */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <CircleStackIcon className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-gray-600">
                {completedTasks} of {totalTasks} tasks complete
              </p>
            </div>
            
            <h2 className="text-base font-semibold mb-2 text-gray-900">
              Start with these essential templates
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Automate customer communications to increase engagement, sales, and return on your marketing spend.
            </p>

            {/* Recover abandoned cart template */}
            <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mt-1">
                  <CircleStackIcon className="w-4 h-4 text-gray-600" />
                  <p className="text-sm font-medium text-gray-900">
                    Recover abandoned cart
                  </p>
                </div>
                
                <div className="flex-1 ml-6">
                  <p className="text-xs text-gray-600 mb-3">
                    An automated email is already created for you. Take a moment to review the email and make any additional adjustments to the design, messaging, or recipient list.
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    Review email
                  </button>
                </div>

                {/* Shopping cart and email illustration */}
                <div className="flex items-center gap-2 ml-4">
                  <div className="relative">
                    <ShoppingCartIcon className="w-6 h-6 text-gray-700" />
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full" />
                  </div>
                  <EnvelopeIcon className="w-5 h-5 text-gray-600" />
                </div>
              </div>

            {/* Remaining template rows */}
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <CircleStackIcon className="w-4 h-4 text-gray-600" />
                <p className="text-sm text-gray-900">Recover abandoned cart</p>
              </div>
              <div className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <CircleStackIcon className="w-4 h-4 text-gray-600" />
                <p className="text-sm text-gray-900">Convert abandoned product browse</p>
              </div>
              <div className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <CircleStackIcon className="w-4 h-4 text-gray-600" />
                <p className="text-sm text-gray-900">Welcome new subscribers with a discount email</p>
              </div>
              <div className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <CircleStackIcon className="w-4 h-4 text-gray-600" />
                <p className="text-sm text-gray-900">Thank customers after they purchase</p>
              </div>
            </div>
          </div>

          {/* Footer link */}
          <div className="flex justify-center pt-2">
            <p className="text-sm text-gray-600">
              Learn more about{' '}
              <button className="text-blue-600 hover:text-blue-700 underline">
                automations
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingAutomationsPage;
