import Modal from './Modal';
import ShortcutRow from './ShortcutRow';

type KeyboardShortcut = {
  action: string;
  keys: string[];
};

type KeyboardShortcutSection = {
  title: string;
  shortcuts: KeyboardShortcut[];
};

const KEYBOARD_SHORTCUT_SECTIONS: KeyboardShortcutSection[] = [
  {
    title: 'General shortcuts',
    shortcuts: [
      { action: 'Keyboard help', keys: ['?'] },
      { action: 'Focus search bar or save bar', keys: ['S'] },
      { action: 'Focus filter bar', keys: ['F'] },
      { action: 'Open app', keys: ['O', 'A'] },
      { action: 'Open sales channel', keys: ['O', 'S'] },
      { action: 'Open store', keys: ['O', 'T'] },
      { action: 'Your profile', keys: ['M', 'E'] },
      { action: 'Log out', keys: ['B', 'Y', 'E'] },
    ],
  },
  {
    title: 'Adding items to your store',
    shortcuts: [
      { action: 'Add product', keys: ['A', 'P'] },
      { action: 'Add collection', keys: ['A', 'C'] },
      { action: 'Add discount', keys: ['A', 'D'] },
      { action: 'Add order', keys: ['A', 'O'] },
      { action: 'Add customer', keys: ['A', 'U'] },
      { action: 'Add blog post', keys: ['A', 'B'] },
      { action: 'Add blog', keys: ['A', 'L'] },
      { action: 'Add page', keys: ['A', 'G'] },
    ],
  },
  {
    title: 'Navigating your admin panel',
    shortcuts: [
      { action: 'Go to Home', keys: ['G', 'H'] },
      { action: 'Go to Orders', keys: ['G', 'O'] },
      { action: 'Go to Products', keys: ['G', 'P'] },
      { action: 'Go to Customers', keys: ['G', 'C'] },
      { action: 'Go to Content', keys: ['G', 'G', 'C'] },
      { action: 'Go to Analytics', keys: ['G', 'N'] },
      { action: 'Go to Marketing', keys: ['G', 'M'] },
      { action: 'Go to Discounts', keys: ['G', 'D'] },
      { action: 'Go to Abandoned carts', keys: ['G', 'B', 'C'] },
      { action: 'Go to Products: Transfers', keys: ['G', 'P', 'T'] },
      { action: 'Go to Products: Inventory', keys: ['G', 'P', 'I'] },
      { action: 'Go to Products: Purchase orders', keys: ['G', 'P', 'O'] },
      { action: 'Go to Products: Collections', keys: ['G', 'P', 'C'] },
      { action: 'Go to Products: Gift cards', keys: ['G', 'P', 'G'] },
      { action: 'Go to Online Store: Overview', keys: ['G', 'W', 'O'] },
      { action: 'Go to Online Store: Blog posts', keys: ['G', 'W', 'B'] },
      { action: 'Go to Online Store: Pages', keys: ['G', 'W', 'P'] },
      { action: 'Go to Online Store: Themes', keys: ['G', 'W', 'T'] },
      { action: 'Go to Online Store: Navigation', keys: ['G', 'W', 'N'] },
      { action: 'Go to Online Store: Domains', keys: ['G', 'W', 'D'] },
      { action: 'Go to Point of Sale: Overview', keys: ['G', 'T', 'O'] },
      { action: 'Go to Ziplofy Capital', keys: ['G', 'T', 'C'] },
    ],
  },
  {
    title: 'Navigating settings',
    shortcuts: [
      { action: 'Go to Settings', keys: ['G', 'S'] },
      { action: 'Go to Settings: Apps and sales channels', keys: ['G', 'S', 'A'] },
      { action: 'Go to Settings: Customer accounts', keys: ['G', 'T', 'A'] },
      { action: 'Go to Settings: Locations', keys: ['G', 'T', 'L'] },
      { action: 'Go to Settings: General', keys: ['G', 'S', 'G'] },
      { action: 'Go to Settings: Payments', keys: ['G', 'S', 'P'] },
      { action: 'Go to Settings: Checkout', keys: ['G', 'S', 'C'] },
      { action: 'Go to Settings: Customer events', keys: ['G', 'S', 'E'] },
      { action: 'Go to Settings: Shipping', keys: ['G', 'S', 'S'] },
      { action: 'Go to Settings: Taxes', keys: ['G', 'S', 'X'] },
      { action: 'Go to Settings: Notifications', keys: ['G', 'S', 'N'] },
      { action: 'Go to Settings: Gift cards', keys: ['G', 'S', 'K'] },
      { action: 'Go to Content: Files', keys: ['G', 'C', 'F'] },
      { action: 'Go to Settings: Account', keys: ['G', 'S', 'A', 'C'] },
      { action: 'Go to Settings: Online Store', keys: ['G', 'S', 'W'] },
      { action: 'Go to Settings: Point of Sale', keys: ['G', 'S', 'T'] },
      { action: 'Go to Settings: Billing', keys: ['G', 'S', 'B'] },
      { action: 'Go to Settings: Plan', keys: ['G', 'S', 'L'] },
      { action: 'Go to Settings: Metafields', keys: ['G', 'S', 'M'] },
    ],
  },
];

const KEYBOARD_SHORTCUT_COLUMNS: KeyboardShortcutSection[][] = [
  [KEYBOARD_SHORTCUT_SECTIONS[0], KEYBOARD_SHORTCUT_SECTIONS[1]],
  [KEYBOARD_SHORTCUT_SECTIONS[2]],
  [KEYBOARD_SHORTCUT_SECTIONS[3]],
];


interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Keyboard Shortcuts"
      maxWidth="lg"
    >
      <div className="bg-gray-50 -mx-6 -my-4 px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {KEYBOARD_SHORTCUT_COLUMNS.map((column, columnIndex) => (
            <div
              key={`column-${columnIndex}`}
              className={`flex flex-col gap-6 ${
                columnIndex > 0 ? 'md:border-l md:border-gray-200 md:pl-6' : ''
              }`}
            >
              {column.map((section) => (
                <div key={section.title} className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{section.title}</h3>
                  <div className="flex flex-col gap-2 bg-white rounded-lg border border-gray-200 p-4">
                    {section.shortcuts.map((shortcut) => (
                      <ShortcutRow key={`${section.title}-${shortcut.action}`} {...shortcut} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

