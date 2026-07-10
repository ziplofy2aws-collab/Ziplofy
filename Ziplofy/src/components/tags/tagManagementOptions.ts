import {
  ArrowPathIcon,
  CubeIcon,
  DocumentTextIcon,
  TagIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import type { ComponentType, SVGProps } from 'react';

export type TagManagementOption = {
  name: string;
  route: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  description: string;
};

export const TAG_MANAGEMENT_OPTIONS: TagManagementOption[] = [
  {
    name: 'Customer Tags',
    route: 'customer-tags',
    icon: UserIcon,
    description: 'Segment and filter customers with shared labels.',
  },
  {
    name: 'Product Tags',
    route: 'product-tags',
    icon: TagIcon,
    description: 'Group products for collections, search, and merchandising.',
  },
  {
    name: 'Product Types',
    route: 'product-types',
    icon: CubeIcon,
    description: 'Define type labels used when organizing your catalog.',
  },
  {
    name: 'Transfer Tags',
    route: 'transfer-tags',
    icon: ArrowPathIcon,
    description: 'Track and filter inventory transfers with consistent tags.',
  },
  {
    name: 'Purchase Order Tags',
    route: 'purchase-order-tags',
    icon: DocumentTextIcon,
    description: 'Label purchase orders for procurement workflows.',
  },
];
