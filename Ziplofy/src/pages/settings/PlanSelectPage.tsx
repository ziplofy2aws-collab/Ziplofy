import React, { useState } from 'react';
import {
  ArrowLeftIcon,
  CheckIcon,
  PlusIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import {
  SETTINGS_PAGE_CONTAINER_CLASS,
  SettingsHero,
  SettingsPanel,
} from '../../components/settings/SettingsPageScaffold';

const btnPrimary =
  'inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700';

const btnPrimaryInline =
  'inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700';

const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50';

const checkboxClass =
  'h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0';

type Plan = {
  name: string;
  description: string;
  oldPrice?: string;
  price: string;
  unit: string;
  badge?: string;
  features: { label: string; emphasized?: boolean; secondary?: boolean }[];
  extras?: string[];
};

const plans: Plan[] = [
  {
    name: 'Basic',
    description: 'For solo entrepreneurs',
    oldPrice: '₹1,994',
    price: '₹20',
    unit: 'INR/month for first 3 months',
    badge: 'Most popular',
    features: [
      { label: 'Full online store', emphasized: true },
      { label: 'Sell in person with a phone or card reader' },
      { label: '10 inventory locations', emphasized: true },
      { label: 'Easy shipping labels' },
    ],
  },
  {
    name: 'Grow',
    description: 'For small teams',
    oldPrice: '₹7,447',
    price: '₹20',
    unit: 'INR/month for first 3 months',
    features: [
      { label: 'Full online store', emphasized: true },
      { label: 'Sell in person with a phone or card reader' },
      { label: '10 inventory locations', emphasized: true },
      { label: 'Shipping discounts + insurance' },
      { label: '5 staff accounts', emphasized: true },
    ],
  },
  {
    name: 'Advanced',
    description: 'As your business scales',
    oldPrice: '₹30,164',
    price: '₹20',
    unit: 'INR/month for first 3 months',
    features: [
      { label: 'Full online store', emphasized: true },
      { label: 'Sell in person with a phone or card reader' },
      { label: '10 inventory locations', emphasized: true },
      { label: 'Fully integrated shipping', secondary: true },
      { label: '15 staff accounts', emphasized: true },
      { label: 'Theme customization per market' },
      { label: 'Enhanced 24/7 chat support' },
    ],
  },
  {
    name: 'Plus',
    description: 'For more complex businesses',
    price: '₹175,000',
    unit: 'INR/month',
    features: [
      { label: 'Full online store', emphasized: true },
      { label: 'Sell in person with POS Pro for up to 200 locations', emphasized: true },
      { label: '200 inventory locations', emphasized: true },
      { label: 'Local storefronts by market' },
      { label: 'Fully integrated shipping', secondary: true },
      { label: 'Unlimited staff accounts', emphasized: true },
      { label: 'Theme customization per market' },
      { label: 'Priority 24/7 phone support', emphasized: true },
    ],
    extras: [
      'Fully customizable checkout',
      'Sell wholesale/B2B',
      'Optimize ads with Audiences',
      '9 free expansion stores',
    ],
  },
];

const faqSections = [
  {
    title: 'General',
    questions: [
      'What is Ziplofy and how does it work?',
      'How much does Ziplofy cost?',
      'How long are your contracts?',
      'Can I cancel my account at any time?',
      'Can I change my plan later on?',
      'Do you offer any discounts?',
      'In what countries can I use Ziplofy?',
      'Is Ziplofy PCI Compliant or PCI Certified?',
    ],
  },
  {
    title: 'Payment',
    questions: [
      'Are there any transaction fees?',
      'What is a third-party payment provider?',
      'Are there any credit card fees?',
    ],
  },
  {
    title: 'Store setup',
    questions: [
      'Is there a setup fee?',
      "I'm looking to switch to Ziplofy. How do I get my data over?",
      'Can I use my own domain name with Ziplofy?',
      'Do I get free web hosting when I open an online store?',
      'What are your bandwidth fees?',
    ],
  },
];

const PlanSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [expandedFaqs, setExpandedFaqs] = useState<Record<string, boolean>>({});

  const toggleFaq = (sectionTitle: string, question: string) => {
    const key = `${sectionTitle}-${question}`;
    setExpandedFaqs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="w-full">
      <div className={SETTINGS_PAGE_CONTAINER_CLASS}>
        <SettingsHero
          title="Pick your plan"
          description="Everything you need to run your business."
          tip="All plans include core commerce features. You can change plans as you grow."
          leading={
            <button
              type="button"
              onClick={() => navigate('/settings/plan')}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Back to plan"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          }
        />

        <div className="flex flex-col flex-wrap gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-sm text-slate-600 shadow-sm sm:flex-row sm:items-center sm:gap-6 sm:px-5">
          <div className="flex items-center gap-2">
            <CheckIcon className="h-4 w-4 shrink-0 text-blue-600" />
            World&apos;s best checkout
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon className="h-4 w-4 shrink-0 text-blue-600" />
            Sell online and in person
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon className="h-4 w-4 shrink-0 text-blue-600" />
            24/7 chat support
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon className="h-4 w-4 shrink-0 text-blue-600" />
            Over 13,000 apps
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-200/60 transition-shadow hover:shadow-md ${
                plan.badge ? 'ring-blue-500/15' : ''
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-800">
                  {plan.badge}
                </span>
              )}

              <h3 className="mb-1 text-base font-semibold text-gray-900">
                {plan.name}
              </h3>
              <p className="mb-3 text-sm text-gray-500">
                {plan.description}
              </p>

              <div className="mb-4">
                {plan.oldPrice && (
                  <p className="mb-0.5 text-sm font-medium text-gray-400 line-through">
                    {plan.oldPrice}
                  </p>
                )}
                <div className="flex flex-wrap items-baseline gap-1">
                  <span className="text-xl font-semibold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-sm text-gray-600">
                    {plan.unit}
                  </span>
                </div>
              </div>

              <button type="button" className={`${btnPrimary} mb-4`}>
                Select {plan.name}
              </button>

              <div className="flex-grow space-y-1">
                {plan.features.map((feature) =>
                  feature.secondary ? (
                    <p
                      key={feature.label}
                      className="text-xs text-gray-700 font-medium underline underline-offset-2 mb-1"
                    >
                      {feature.label}
                    </p>
                  ) : (
                    <div
                      key={feature.label}
                      className="flex items-center gap-2 text-xs text-gray-900"
                    >
                      <CheckIcon className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                      <span className={feature.emphasized ? 'font-medium' : ''}>
                        {feature.label}
                      </span>
                    </div>
                  )
                )}
                {plan.extras && (
                  <div className="mt-2 space-y-1">
                    {plan.extras.map((extra) => (
                      <div
                        key={extra}
                        className="flex items-center gap-2 text-xs text-gray-700 font-medium"
                      >
                        <PlusIcon className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                        {extra}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">Compare plans</h2>
              <p className="mt-1 text-sm text-gray-500">See how plans differ by feature and price.</p>
            </div>
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50/80 px-5 py-3">
              <input
                type="checkbox"
                id="only-differences"
                checked={onlyDifferences}
                onChange={(e) => setOnlyDifferences(e.target.checked)}
                className={checkboxClass}
              />
              <label htmlFor="only-differences" className="cursor-pointer text-sm font-medium text-gray-900">
                Only show differences
              </label>
            </div>

            <div className="grid grid-cols-5 border-b border-slate-200">
              <div className="border-r border-slate-200" />
              {plans.map((plan) => (
                <div
                  key={`compare-header-${plan.name}`}
                  className="flex flex-col gap-1 border-r border-slate-200 p-3 last:border-r-0"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {plan.name}
                  </p>
                  {plan.badge && (
                    <p className="text-xs text-gray-500 font-medium">
                      {plan.badge}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div>
              <CompareRow
                label="Pay monthly"
                values={['₹1,994 INR/mo', '₹7,447 INR/mo', '₹30,164 INR/mo', 'Starting at ₹175,000 INR/mo on a 3-year term']}
              />
              <CompareRow
                label="Pay yearly (Save up to 25%)"
                values={['₹1,499 INR/mo', '₹5,599 INR/mo', '₹22,680 INR/mo', '—']}
              />
            </div>
            <div className="border-t border-slate-200 py-4 text-center">
              <button type="button" className={btnGhost}>
                <PlusIcon className="h-4 w-4" />
                See all features
              </button>
            </div>
          </div>
        </SettingsPanel>

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">More ways to sell</h2>
              <p className="mt-1 text-sm text-gray-500">Add Retail or POS Pro for in-person selling.</p>
            </div>
          </div>
          <div className="flex flex-col border-t border-slate-200 md:flex-row">
            <div className="flex-1 p-5 sm:p-6">
              <h3 className="mb-1 text-base font-semibold text-gray-900">
                Retail
              </h3>
              <p className="mb-3 text-sm text-gray-500">
                For selling at retail stores
              </p>
              <p className="mb-0.5 text-sm font-medium text-gray-400 line-through">
                ₹7,000
              </p>
              <div className="mb-4 flex flex-wrap items-baseline gap-1">
                <span className="text-xl font-semibold text-gray-900">
                  ₹20
                </span>
                <span className="text-sm text-gray-600">
                  INR/month for first 3 months
                </span>
              </div>
              <button type="button" className={btnPrimaryInline}>
                Select Retail
              </button>
            </div>
            <div className="flex-1 border-t border-slate-200 p-5 sm:p-6 md:border-l md:border-t-0">
              <p className="mb-1 text-base font-semibold text-gray-900">
                Card rates starting at
              </p>
              <p className="mb-3 text-sm text-gray-500">
                2% 3rd-party payment providers
              </p>
              <p className="mb-2 text-sm font-medium text-gray-900">
                Standout features
              </p>
              {[
                'Sell in person with POS Pro (1 location included)',
                '10 inventory locations',
                'Unlimited POS staff with roles & permissions',
                'Inventory management',
                'Rich customer profiles and insights',
              ].map((feature) => (
                <div
                  key={feature}
                  className="mb-1 flex items-center gap-2 text-xs text-gray-900"
                >
                  <CheckIcon className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                  <span className={feature.includes('Unlimited') ? 'font-medium' : ''}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SettingsPanel>

        <div>
          <h2 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {faqSections.map((section) => (
              <div
                key={section.title}
                className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-slate-200/60"
              >
                <h3 className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-3 text-base font-semibold text-gray-900">
                  {section.title}
                </h3>
                {section.questions.map((question, index) => {
                  const key = `${section.title}-${question}`;
                  const isExpanded = expandedFaqs[key];
                  return (
                    <div
                      key={question}
                      className={`border-t ${index === 0 ? 'border-slate-100' : 'border-slate-200'}`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(section.title, question)}
                        className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-slate-50/90"
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {question}
                        </span>
                        <ChevronDownIcon
                          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50/40 px-5 pb-4 pt-2">
                          <p className="text-sm leading-relaxed text-gray-600">
                            This is placeholder text for the answer. You can update it with actual FAQ
                            content later.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CompareRow: React.FC<{ label: string; values: string[] }> = ({ label, values }) => (
  <div className="grid grid-cols-5 border-b border-slate-200 last:border-b-0">
    <div className="border-r border-slate-200 bg-slate-50/90 p-3 text-sm font-medium text-gray-900">
      {label}
    </div>
    {values.map((value, index) => (
      <div
        key={`${label}-${index}`}
        className={`border-r border-slate-200 p-3 text-sm font-medium text-gray-900 ${
          index === values.length - 1 ? 'border-r-0' : ''
        }`}
      >
        {value}
      </div>
    ))}
  </div>
);

export default PlanSelectPage;
