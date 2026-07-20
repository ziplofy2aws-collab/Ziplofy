import React, { useMemo, useState } from 'react';
import {
  ArrowLeftIcon,
  CheckIcon,
  PlusIcon,
  ChevronDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import {
  SETTINGS_PAGE_CONTAINER_CLASS,
  SettingsHero,
  SettingsPanel,
} from '../../components/settings/SettingsPageScaffold';
import { useMembershipPlans } from '../../hooks/useMembershipPlans';
import type { MembershipPlan } from '../../types/membership-plan';

const btnPrimary =
  'inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700';

const btnPrimaryInline =
  'inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700';

const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50';

const checkboxClass =
  'h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0';

const faqSections = [
  {
    title: 'General',
    questions: [
      'What is codiic and how does it work?',
      'How much does codiic cost?',
      'How long are your contracts?',
      'Can I cancel my account at any time?',
      'Can I change my plan later on?',
      'Do you offer any discounts?',
      'In what countries can I use codiic?',
      'Is codiic PCI Compliant or PCI Certified?',
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
      "I'm looking to switch to codiic. How do I get my data over?",
      'Can I use my own domain name with codiic?',
      'Do I get free web hosting when I open an online store?',
      'What are your bandwidth fees?',
    ],
  },
];

const formatInr = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

const getPlanGridClass = (count: number) => {
  if (count >= 4) return 'md:grid-cols-2 xl:grid-cols-4';
  if (count === 3) return 'md:grid-cols-2 xl:grid-cols-3';
  if (count === 2) return 'md:grid-cols-2';
  return 'md:grid-cols-1';
};

const getCompareGridStyle = (planCount: number): React.CSSProperties => ({
  gridTemplateColumns: `minmax(140px, 1.2fr) repeat(${Math.max(planCount, 1)}, minmax(0, 1fr))`,
});

const PlanSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const { plans, loading, error } = useMembershipPlans();
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [expandedFaqs, setExpandedFaqs] = useState<Record<string, boolean>>({});

  const allFeatureNames = useMemo(() => {
    const names = new Set<string>();
    plans.forEach((plan) => {
      plan.features.forEach((feature) => {
        if (feature.name.trim()) names.add(feature.name.trim());
      });
    });
    return Array.from(names);
  }, [plans]);

  const compareFeatureRows = useMemo(() => {
    return allFeatureNames.filter((featureName) => {
      if (!onlyDifferences) return true;
      const statuses = plans.map(
        (plan) => plan.features.find((f) => f.name.trim() === featureName)?.included ?? false
      );
      return new Set(statuses).size > 1;
    });
  }, [allFeatureNames, onlyDifferences, plans]);

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

        {loading ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-16 text-center text-sm text-slate-500 shadow-sm">
            Loading plans...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-700 shadow-sm">
            {error}
          </div>
        ) : plans.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-16 text-center text-sm text-slate-500 shadow-sm">
            No plans available yet. Please check back later.
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-1 gap-4 ${getPlanGridClass(plans.length)}`}>
              {plans.map((plan) => (
                <PlanCard key={plan._id} plan={plan} />
              ))}
            </div>

            <SettingsPanel className="ring-1 ring-slate-200/60">
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
                <div className="border-l-4 border-blue-500/75 pl-3">
                  <h2 className="text-base font-semibold text-gray-900">Compare plans</h2>
                  <p className="mt-1 text-sm text-gray-500">See how plans differ by feature and price.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[640px]">
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

                  <div className="grid border-b border-slate-200" style={getCompareGridStyle(plans.length)}>
                    <div className="border-r border-slate-200 bg-slate-50/90 p-3" />
                    {plans.map((plan) => (
                      <div
                        key={`compare-header-${plan._id}`}
                        className="flex flex-col gap-1 border-r border-slate-200 p-3 last:border-r-0"
                      >
                        <p className="text-sm font-medium text-gray-900">{plan.name}</p>
                        {plan.isPopular && (
                          <p className="text-xs font-medium text-gray-500">Most popular</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <CompareRow
                    label="Pay monthly"
                    values={plans.map((plan) => `${formatInr(plan.priceMonthly)} INR/mo`)}
                    columnCount={plans.length}
                  />
                  <CompareRow
                    label="Pay yearly"
                    values={plans.map((plan) => `${formatInr(plan.priceYearly)} INR/yr`)}
                    columnCount={plans.length}
                  />

                  {compareFeatureRows.map((featureName) => (
                    <CompareFeatureRow
                      key={featureName}
                      label={featureName}
                      plans={plans}
                      featureName={featureName}
                    />
                  ))}
                </div>
              </div>
            </SettingsPanel>
          </>
        )}

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">More ways to sell</h2>
              <p className="mt-1 text-sm text-gray-500">Add Retail or POS Pro for in-person selling.</p>
            </div>
          </div>
          <div className="flex flex-col border-t border-slate-200 md:flex-row">
            <div className="flex-1 p-5 sm:p-6">
              <h3 className="mb-1 text-base font-semibold text-gray-900">Retail</h3>
              <p className="mb-3 text-sm text-gray-500">For selling at retail stores</p>
              <p className="mb-0.5 text-sm font-medium text-gray-400 line-through">₹7,000</p>
              <div className="mb-4 flex flex-wrap items-baseline gap-1">
                <span className="text-xl font-semibold text-gray-900">₹20</span>
                <span className="text-sm text-gray-600">INR/month for first 3 months</span>
              </div>
              <button type="button" className={btnPrimaryInline}>
                Select Retail
              </button>
            </div>
            <div className="flex-1 border-t border-slate-200 p-5 sm:p-6 md:border-l md:border-t-0">
              <p className="mb-1 text-base font-semibold text-gray-900">Card rates starting at</p>
              <p className="mb-3 text-sm text-gray-500">2% 3rd-party payment providers</p>
              <p className="mb-2 text-sm font-medium text-gray-900">Standout features</p>
              {[
                'Sell in person with POS Pro (1 location included)',
                '10 inventory locations',
                'Unlimited POS staff with roles & permissions',
                'Inventory management',
                'Rich customer profiles and insights',
              ].map((feature) => (
                <div key={feature} className="mb-1 flex items-center gap-2 text-xs text-gray-900">
                  <CheckIcon className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                  <span className={feature.includes('Unlimited') ? 'font-medium' : ''}>{feature}</span>
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
                        <span className="text-sm font-medium text-gray-900">{question}</span>
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

const PlanCard: React.FC<{ plan: MembershipPlan }> = ({ plan }) => {
  const includedFeatures = plan.features.filter((f) => f.included);
  const excludedFeatures = plan.features.filter((f) => !f.included);

  return (
    <div
      className={`relative flex flex-col rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-200/60 transition-shadow hover:shadow-md ${
        plan.isPopular ? 'ring-blue-500/15' : ''
      }`}
    >
      {plan.isPopular && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-800">
          Most popular
        </span>
      )}

      <h3 className="mb-1 text-base font-semibold text-gray-900">{plan.name}</h3>
      <p className="mb-3 text-sm text-gray-500">{plan.description}</p>

      <div className="mb-4">
        <div className="flex flex-wrap items-baseline gap-1">
          <span className="text-xl font-semibold text-gray-900">{formatInr(plan.priceMonthly)}</span>
          <span className="text-sm text-gray-600">INR/month</span>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          or {formatInr(plan.priceYearly)} INR/year
        </p>
      </div>

      <button type="button" className={`${btnPrimary} mb-4`}>
        Select {plan.name}
      </button>

      <div className="flex-grow space-y-1">
        {includedFeatures.map((feature) => (
          <div key={feature.name} className="flex items-center gap-2 text-xs text-gray-900">
            <CheckIcon className="h-3.5 w-3.5 shrink-0 text-blue-600" />
            <span>{feature.name}</span>
          </div>
        ))}
        {excludedFeatures.map((feature) => (
          <div key={feature.name} className="flex items-center gap-2 text-xs text-gray-400">
            <XMarkIcon className="h-3.5 w-3.5 shrink-0 text-red-400" />
            <span className="line-through">{feature.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CompareRow: React.FC<{ label: string; values: string[]; columnCount: number }> = ({
  label,
  values,
  columnCount,
}) => (
  <div className="grid border-b border-slate-200 last:border-b-0" style={getCompareGridStyle(columnCount)}>
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

const CompareFeatureRow: React.FC<{
  label: string;
  plans: MembershipPlan[];
  featureName: string;
}> = ({ label, plans, featureName }) => (
  <div className="grid border-b border-slate-200 last:border-b-0" style={getCompareGridStyle(plans.length)}>
    <div className="border-r border-slate-200 bg-slate-50/90 p-3 text-sm font-medium text-gray-900">
      {label}
    </div>
    {plans.map((plan, index) => {
      const feature = plan.features.find((f) => f.name.trim() === featureName);
      const included = feature?.included ?? false;
      return (
        <div
          key={`${plan._id}-${featureName}`}
          className={`flex items-center border-r border-slate-200 p-3 last:border-r-0 ${
            index === plans.length - 1 ? 'border-r-0' : ''
          }`}
        >
          {included ? (
            <CheckIcon className="h-4 w-4 text-blue-600" />
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>
      );
    })}
  </div>
);

export default PlanSelectPage;
