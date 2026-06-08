import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface AbandonedCartDetailsBreadcrumbsProps {
  customerFirstName: string;
  customerLastName: string;
}

const AbandonedCartDetailsBreadcrumbs: React.FC<AbandonedCartDetailsBreadcrumbsProps> = ({
  customerFirstName,
  customerLastName,
}) => {
  const navigate = useNavigate();

  const goToList = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      navigate('/orders/abandoned-carts');
    },
    [navigate]
  );

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        <li className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <HomeIcon className="h-3.5 w-3.5" aria-hidden />
            Orders
          </button>
        </li>
        <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-gray-300" aria-hidden />
        <li>
          <a
            href="/orders/abandoned-carts"
            onClick={goToList}
            className="rounded-lg px-2 py-1 font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Abandoned carts
          </a>
        </li>
        <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-gray-300" aria-hidden />
        <li>
          <span className="rounded-lg bg-gray-100/80 px-2 py-1 font-semibold text-gray-900" aria-current="page">
            {customerFirstName} {customerLastName}
          </span>
        </li>
      </ol>
    </nav>
  );
};

export default AbandonedCartDetailsBreadcrumbs;
