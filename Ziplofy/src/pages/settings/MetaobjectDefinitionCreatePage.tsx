import {
  Bars3Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  PlusIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';
import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ToggleSwitch from '../../components/ToggleSwitch';
import { SETTINGS_PAGE_CONTAINER_CLASS } from '../../components/settings/SettingsPageScaffold';
import { slugFromTitle } from '../../seo/seo-text.util';

type FieldCardinality = 'one' | 'list';

type MetaobjectFieldDraft = {
  id: string;
  label: string;
  cardinality: FieldCardinality;
  fieldType: string;
  expanded: boolean;
};

const FIELD_TYPE_OPTIONS = [
  { value: '', label: 'Select field type' },
  { value: 'single_line_text', label: 'Single line text' },
  { value: 'multi_line_text', label: 'Multi-line text' },
  { value: 'integer', label: 'Integer' },
  { value: 'decimal', label: 'Decimal' },
  { value: 'file', label: 'File' },
  { value: 'date', label: 'Date' },
  { value: 'date_time', label: 'Date and time' },
  { value: 'url', label: 'URL' },
  { value: 'json', label: 'JSON' },
  { value: 'color', label: 'Color' },
  { value: 'boolean', label: 'True or false' },
  { value: 'product_reference', label: 'Product reference' },
  { value: 'collection_reference', label: 'Collection reference' },
];

const CARDINALITY_OPTIONS: { value: FieldCardinality; label: string }[] = [
  { value: 'one', label: 'One' },
  { value: 'list', label: 'List' },
];

function createFieldDraft(): MetaobjectFieldDraft {
  return {
    id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label: '',
    cardinality: 'one',
    fieldType: '',
    expanded: false,
  };
}

function SettingsCard({
  title,
  children,
  headerRight,
}: {
  title?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
          <h2 className="text-[13px] font-semibold text-gray-900">{title}</h2>
          {headerRight}
        </div>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  );
}

function OptionToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-4 py-3.5 first:border-t-0">
      <span className="text-[13px] font-normal text-gray-800">{label}</span>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
}

export const MetaobjectDefinitionCreatePage = () => {
  const nameInputId = useId();
  const descriptionInputId = useId();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [fields, setFields] = useState<MetaobjectFieldDraft[]>([createFieldDraft()]);
  const [metaobjectOptionsOpen, setMetaobjectOptionsOpen] = useState(true);
  const [fieldOptionsOpen, setFieldOptionsOpen] = useState(false);
  const [activeDraftStatus, setActiveDraftStatus] = useState(true);
  const [translations, setTranslations] = useState(true);
  const [publishAsWebPages, setPublishAsWebPages] = useState(false);
  const [storefrontsApiAccess, setStorefrontsApiAccess] = useState(true);
  const [customerAccountApiAccess, setCustomerAccountApiAccess] = useState(false);

  const typeHandle = useMemo(() => slugFromTitle(name, 'metaobject'), [name]);

  const updateField = (id: string, patch: Partial<MetaobjectFieldDraft>) => {
    setFields((prev) => prev.map((field) => (field.id === id ? { ...field, ...patch } : field)));
  };

  const addField = () => {
    setFields((prev) => [...prev, createFieldDraft()]);
  };

  return (
    <div className="w-full pb-8">
      <div className={SETTINGS_PAGE_CONTAINER_CLASS}>
        <nav
          className="flex min-w-0 flex-wrap items-center gap-1.5 text-[13px] text-gray-500"
          aria-label="Breadcrumb"
        >
          <Link
            to="/content/metaobjects"
            className="inline-flex items-center text-gray-500 transition-colors hover:text-gray-700"
            aria-label="Metaobjects"
          >
            <RectangleStackIcon className="h-4 w-4 shrink-0" aria-hidden />
          </Link>
          <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-gray-300" aria-hidden />
          <span className="truncate font-normal text-gray-700">Add metaobject definition</span>
        </nav>

        <h1 className="text-[20px] font-semibold tracking-tight text-gray-900">
          Add metaobject definition
        </h1>

        <SettingsCard>
          <div className="space-y-3">
            <div>
              <label htmlFor={nameInputId} className="mb-1 block text-[13px] font-normal text-gray-700">
                Name
              </label>
              <input
                id={nameInputId}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Examples: Cart upsell, Fabric colors, Product bundle"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] font-normal text-gray-800 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
              />
            </div>

            <p className="text-[13px] text-gray-500">
              Type: <span className="font-mono text-gray-700">{typeHandle}</span>
            </p>

            {showDescription ? (
              <div>
                <label
                  htmlFor={descriptionInputId}
                  className="mb-1 block text-[13px] font-normal text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id={descriptionInputId}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-[13px] font-normal text-gray-800 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
                  placeholder="Describe what this metaobject is used for"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDescription(true)}
                className="text-[13px] font-normal text-blue-600 transition-colors hover:text-blue-700"
              >
                Add description
              </button>
            )}
          </div>
        </SettingsCard>

        <SettingsCard title="Fields">
          <div className="space-y-3">
            {fields.map((field) => (
              <div key={field.id} className="rounded-lg border border-gray-200 bg-white">
                <div className="flex flex-wrap items-center gap-2 p-2 sm:flex-nowrap">
                  <button
                    type="button"
                    className="inline-flex h-9 w-8 shrink-0 cursor-grab items-center justify-center rounded-md text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                    aria-label="Reorder field"
                  >
                    <Bars3Icon className="h-4 w-4" aria-hidden />
                  </button>

                  <div className="relative min-w-0 flex-1">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="Field label"
                      className="w-full rounded-lg border border-gray-200 py-2 pl-3 pr-7 text-[13px] font-normal text-gray-800 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
                    />
                    <span
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[13px] text-red-500"
                      aria-hidden
                    >
                      *
                    </span>
                  </div>

                  <select
                    value={field.cardinality}
                    onChange={(e) =>
                      updateField(field.id, { cardinality: e.target.value as FieldCardinality })
                    }
                    className="h-9 shrink-0 rounded-lg border border-gray-200 bg-white px-2.5 text-[13px] font-normal text-gray-700 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
                  >
                    {CARDINALITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <div className="relative min-w-[180px] flex-1 sm:max-w-[220px]">
                    <select
                      value={field.fieldType}
                      onChange={(e) => updateField(field.id, { fieldType: e.target.value })}
                      className="h-9 w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-[13px] font-normal text-gray-700 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
                    >
                      {FIELD_TYPE_OPTIONS.map((option) => (
                        <option key={option.value || 'empty'} value={option.value} disabled={!option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronUpDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>

                  <button
                    type="button"
                    onClick={() => updateField(field.id, { expanded: !field.expanded })}
                    className="inline-flex h-9 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-50"
                    aria-expanded={field.expanded}
                    aria-label="Field settings"
                  >
                    <ChevronDownIcon
                      className={`h-4 w-4 transition-transform ${field.expanded ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>

                {field.expanded ? (
                  <div className="border-t border-gray-100 px-3 py-3 text-[13px] text-gray-500">
                    Additional field settings will appear here.
                  </div>
                ) : null}
              </div>
            ))}

            <button
              type="button"
              onClick={addField}
              className="inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-[13px] font-normal text-gray-700 transition-colors hover:text-gray-900"
            >
              <PlusIcon className="h-4 w-4" aria-hidden />
              Add field
            </button>
          </div>
        </SettingsCard>

        <section className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setMetaobjectOptionsOpen((open) => !open)}
            className="flex w-full items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 text-left"
          >
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-900">
              Metaobject options
              <InformationCircleIcon className="h-4 w-4 text-gray-400" aria-hidden />
            </span>
            {metaobjectOptionsOpen ? (
              <ChevronUpIcon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
            ) : (
              <ChevronDownIcon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
            )}
          </button>

          {metaobjectOptionsOpen ? (
            <div>
              <OptionToggleRow
                label="Active-draft status"
                checked={activeDraftStatus}
                onChange={setActiveDraftStatus}
              />
              <OptionToggleRow label="Translations" checked={translations} onChange={setTranslations} />
              <OptionToggleRow
                label="Publish entries as web pages"
                checked={publishAsWebPages}
                onChange={setPublishAsWebPages}
              />
              <OptionToggleRow
                label="Storefronts API access"
                checked={storefrontsApiAccess}
                onChange={setStorefrontsApiAccess}
              />
              <OptionToggleRow
                label="Customer Account API access"
                checked={customerAccountApiAccess}
                onChange={setCustomerAccountApiAccess}
              />
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setFieldOptionsOpen((open) => !open)}
            className="flex w-full items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 text-left"
          >
            <span className="text-[13px] font-semibold text-gray-900">Field options</span>
            {fieldOptionsOpen ? (
              <ChevronUpIcon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
            ) : (
              <ChevronDownIcon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
            )}
          </button>

          {fieldOptionsOpen ? (
            <div className="border-t border-gray-100 px-4 py-4 text-[13px] text-gray-500">
              Field-level options will appear here.
            </div>
          ) : null}
        </section>

        <div className="text-center">
          <a href="#" className="text-[13px] text-blue-600 hover:text-blue-700">
            Learn more about metaobjects
          </a>
        </div>
      </div>
    </div>
  );
};

export default MetaobjectDefinitionCreatePage;
