import React, { ReactNode } from 'react';
import { discountCardBodyClass, discountCardClass, discountSectionTitleClass } from './discount-ui.util';

type DiscountDetailsSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

const DiscountDetailsSection: React.FC<DiscountDetailsSectionProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <section className={discountCardClass}>
      <div className={`border-b border-gray-100 ${discountCardBodyClass} pb-3`}>
        <h2 className={discountSectionTitleClass}>{title}</h2>
        {description ? (
          <p className="mt-0.5 text-[12px] font-normal text-gray-500">{description}</p>
        ) : null}
      </div>
      <div className={discountCardBodyClass}>{children}</div>
    </section>
  );
};

export default DiscountDetailsSection;
