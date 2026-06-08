import {
  ArrowLeftIcon,
  EllipsisHorizontalIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import DropdownMenu from '../../components/DropdownMenu';
import DropdownMenuItem from '../../components/DropdownMenuItem';
import PixelCodeSection from '../../components/PixelCodeSection';
import PixelDataSaleSection from '../../components/PixelDataSaleSection';
import PixelPermissionSection from '../../components/PixelPermissionSection';
import {
  SETTINGS_PAGE_CONTAINER_CLASS,
  SettingsCallout,
  SettingsHero,
  SettingsPanel,
} from '../../components/settings/SettingsPageScaffold';
import { DataSaleOption, usePixels } from '../../contexts/pixel.context';
import { useStore } from '../../contexts/store.context';

const btnPrimary =
  'inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50';

const btnGhost =
  'inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50';

const btnIcon =
  'inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition-colors hover:bg-slate-50';

type PermissionMode = 'required' | 'not_required';

const CustomerEventPixelDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { pixelId } = useParams<{ pixelId: string }>();
  const { activeStoreId } = useStore();
  const { pixels, fetchByStoreId, loading, remove, update } = usePixels();

  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [name, setName] = useState('');
  const [permission, setPermission] = useState<PermissionMode>('required');
  const [purposes, setPurposes] = useState({ marketing: false, analytics: false, preferences: false });
  const [dataSale, setDataSale] = useState<DataSaleOption>('does_not_qualify_as_data_sale');
  const [code, setCode] = useState('');

  const pixel = useMemo(() => pixels.find((p) => p._id === pixelId), [pixels, pixelId]);

  useEffect(() => {
    if (activeStoreId) {
      if (!pixel) {
        fetchByStoreId(activeStoreId).catch((err) => {
          toast.error(err?.message || 'Failed to fetch pixel details');
        });
      }
    }
  }, [activeStoreId, pixel, fetchByStoreId]);

  useEffect(() => {
    if (pixel) {
      setName(pixel.pixelName ?? '');
      setPermission(pixel.required ? 'required' : 'not_required');
      setPurposes({
        marketing: !!pixel.marketing,
        analytics: !!pixel.analytics,
        preferences: !!pixel.preferences,
      });
      setDataSale(pixel.dataSale);
      setCode(pixel.code ?? '');
    }
  }, [pixel]);

  const handleDelete = useCallback(async () => {
    if (!pixel) return;
    try {
      await remove(pixel._id);
      toast.success('Pixel deleted');
      navigate('/settings/customer-events');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete pixel');
    }
  }, [pixel, remove, navigate]);

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchorEl(null);
  }, []);

  const handlePurposeChange = useCallback((key: 'marketing' | 'analytics' | 'preferences') => {
    setPurposes((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const isDirty = useMemo(() => {
    if (!pixel) return false;
    const trimmedName = name.trim();
    const originalName = pixel.pixelName ?? '';
    const originalPermission: PermissionMode = pixel.required ? 'required' : 'not_required';
    const originalPurposes = {
      marketing: !!pixel.marketing,
      analytics: !!pixel.analytics,
      preferences: !!pixel.preferences,
    };
    return (
      trimmedName !== originalName ||
      permission !== originalPermission ||
      originalPurposes.marketing !== purposes.marketing ||
      originalPurposes.analytics !== purposes.analytics ||
      originalPurposes.preferences !== purposes.preferences ||
      dataSale !== pixel.dataSale ||
      code !== (pixel.code ?? '')
    );
  }, [pixel, name, permission, purposes, dataSale, code]);

  const handleSave = useCallback(async () => {
    if (!pixel) return;
    try {
      const payload = {
        pixelName: name.trim(),
        required: permission === 'required',
        notRequired: permission === 'not_required',
        marketing: permission === 'required' ? purposes.marketing : false,
        analytics: permission === 'required' ? purposes.analytics : false,
        preferences: permission === 'required' ? purposes.preferences : false,
        dataSale,
        code,
      };
      await update(pixel._id, payload);
      toast.success('Pixel updated');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update pixel');
    }
  }, [pixel, name, permission, purposes, dataSale, code, update]);

  const handlePermissionChange = useCallback((value: PermissionMode) => {
    setPermission(value);
    if (value === 'not_required') {
      setPurposes({ marketing: false, analytics: false, preferences: false });
    }
  }, []);

  const handleDataSaleChange = useCallback((value: DataSaleOption) => {
    setDataSale(value);
  }, []);

  const handleCodeChange = useCallback((value: string) => {
    setCode(value);
  }, []);

  const handleBack = useCallback(() => {
    navigate('/settings/customer-events');
  }, [navigate]);

  const backControl = (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
    >
      <ArrowLeftIcon className="h-4 w-4" />
      Back
    </button>
  );

  if (!pixelId) {
    return (
      <div className="w-full">
        <div className={SETTINGS_PAGE_CONTAINER_CLASS}>
          <SettingsHero title="Pixel" description="View or edit a customer event pixel." leading={backControl} />
          <SettingsCallout variant="warning" title="No pixel selected">
            <p className="text-sm text-gray-700">Choose a pixel from Customer events to open its details.</p>
          </SettingsCallout>
        </div>
      </div>
    );
  }

  if (!activeStoreId) {
    return (
      <div className="w-full">
        <div className={SETTINGS_PAGE_CONTAINER_CLASS}>
          <SettingsHero title="Pixel details" description="Manage tracking pixels for your storefront." leading={backControl} />
          <SettingsCallout variant="info" title="Select a store">
            <p className="text-sm text-gray-700">Select a store to view and edit pixel details.</p>
          </SettingsCallout>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className={SETTINGS_PAGE_CONTAINER_CLASS}>
        {loading && !pixel ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white py-16 shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
            <p className="text-sm text-gray-500">Loading pixel…</p>
          </div>
        ) : !pixel ? (
          <>
            <SettingsHero
              title="Pixel not found"
              description="This pixel may have been deleted or the link is invalid."
              leading={backControl}
            />
            <SettingsCallout variant="warning" title="Unavailable">
              <p className="text-sm text-gray-700">Pixel not found or no longer exists.</p>
            </SettingsCallout>
          </>
        ) : (
          <>
            <SettingsHero
              title={name.trim() || 'Pixel'}
              description="Manage customer event pixel settings, privacy, and code."
              tip="Sandboxed pixels help keep storefront scripts isolated and stable."
              leading={backControl}
              actions={
                <div className="flex flex-wrap items-center gap-2">
                  {isDirty ? (
                    <button type="button" onClick={handleSave} disabled={loading} className={btnPrimary}>
                      Save
                    </button>
                  ) : null}
                  <button type="button" disabled className={btnGhost}>
                    Test
                  </button>
                  <button type="button" disabled className={btnPrimary}>
                    Connect
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={handleMenuOpen}
                      className={btnIcon}
                      aria-label="Pixel options"
                    >
                      <EllipsisHorizontalIcon className="h-5 w-5" />
                    </button>
                    <DropdownMenu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose}>
                      <DropdownMenuItem disabled>Edit pixel name</DropdownMenuItem>
                      <DropdownMenuItem disabled>Hire a Ziplofy Partner</DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          handleMenuClose();
                          handleDelete();
                        }}
                      >
                        <span className="text-red-600">Delete pixel</span>
                      </DropdownMenuItem>
                    </DropdownMenu>
                  </div>
                </div>
              }
            />

            <SettingsPanel className="ring-1 ring-slate-200/60">
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
                <div className="border-l-4 border-blue-500/75 pl-3">
                  <h2 className="text-base font-semibold text-gray-900">Pixel details</h2>
                  <p className="mt-1 text-sm text-gray-500">Name and sandbox info for this pixel.</p>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <label className="mb-1 block text-sm font-medium text-gray-700">Pixel name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  placeholder="e.g. Facebook Pixel"
                  className="w-full max-w-md rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="mt-3 text-sm text-gray-500">
                  For enhanced security and stability, pixel access is sandboxed. <LinkLabel text="Learn more" href="#" />
                </p>
              </div>
            </SettingsPanel>

            <SettingsCallout
              variant="info"
              icon={<InformationCircleIcon className="h-5 w-5 text-blue-600" />}
              title="Sandboxed execution"
            >
              <p>For enhanced security and stability, pixel access is sandboxed.</p>
            </SettingsCallout>

            <SettingsPanel className="ring-1 ring-slate-200/60">
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
                <div className="border-l-4 border-blue-500/75 pl-3">
                  <h2 className="text-base font-semibold text-gray-900">Customer privacy</h2>
                  <p className="mt-1 text-sm text-gray-500">Consent, purposes, and data sale classification.</p>
                </div>
              </div>
              <div className="space-y-4 p-5 sm:p-6">
                <PixelPermissionSection
                  permission={permission}
                  purposes={purposes}
                  onPermissionChange={handlePermissionChange}
                  onPurposeChange={handlePurposeChange}
                />
                <PixelDataSaleSection dataSale={dataSale} onDataSaleChange={handleDataSaleChange} />
                <p className="text-sm text-gray-500">
                  See how these settings apply to your store in <LinkLabel text="Customer privacy" href="#" />
                </p>
              </div>
            </SettingsPanel>

            <SettingsPanel className="ring-1 ring-slate-200/60">
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
                <div className="border-l-4 border-blue-500/75 pl-3">
                  <h2 className="text-base font-semibold text-gray-900">Code</h2>
                  <p className="mt-1 text-sm text-gray-500">Paste or edit the snippet loaded on your storefront.</p>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <PixelCodeSection code={code} onCodeChange={handleCodeChange} embedded />
              </div>
            </SettingsPanel>
          </>
        )}
      </div>
    </div>
  );
};

const LinkLabel: React.FC<{ text: string; href: string }> = ({ text, href }) => (
  <a
    href={href}
    className="text-blue-600 hover:text-blue-700 hover:underline"
  >
    {text}
  </a>
);

export default CustomerEventPixelDetailsPage;
