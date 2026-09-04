/** Plain-text policy templates (mirrors Codiic PoliciesSettings insert-template handlers). */

export type PolicyTemplateContext = {
  storeName: string;
  email: string;
  phone: string;
  legalBusinessName: string;
  physicalAddress: string;
};

export function formatStorePhysicalAddress(parts: {
  legalBusinessName?: string;
  billingAddress?: string;
  billingApartment?: string;
  billingPinCode?: string;
  billingCity?: string;
  billingState?: string;
  billingCountry?: string;
}): string {
  const line = [
    parts.legalBusinessName,
    parts.billingAddress,
    parts.billingApartment,
    [parts.billingPinCode, parts.billingCity].filter(Boolean).join(' '),
    parts.billingState,
    parts.billingCountry,
  ]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean)
    .join(', ');
  return line || '[INSERT BUSINESS ADDRESS]';
}

export function buildReturnRefundTemplate(ctx: PolicyTemplateContext): string {
  const { email, physicalAddress } = ctx;
  return `We have a 30-day return policy, which means you have 30 days after receiving your item to request a return.

To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You'll also need the receipt or proof of purchase.

To start a return, you can contact us at ${email}. Please note that returns will need to be sent to the following address: ${physicalAddress}

If your return is accepted, we'll send you a return shipping label, as well as instructions on how and where to send your package. Items sent back to us without first requesting a return will not be accepted.

You can always contact us for any return question at ${email}.



Damages and issues
Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.



Exceptions / non-returnable items
Certain types of items cannot be returned, like perishable goods (such as food, flowers, or plants), custom products (such as special orders or personalized items), and personal care goods (such as beauty products). We also do not accept returns for hazardous materials, flammable liquids, or gases. Please get in touch if you have questions or concerns about your specific item.

Unfortunately, we cannot accept returns on sale items or gift cards.



Exchanges
The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.



European Union 14 day cooling off period
Notwithstanding the above, if the merchandise is being shipped into the European Union, you have the right to cancel or return your order within 14 days, for any reason and without a justification. As above, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You'll also need the receipt or proof of purchase.



Refunds
We will notify you once we've received and inspected your return, and let you know if the refund was approved or not. If approved, you'll be automatically refunded on your original payment method within 10 business days. Please remember it can take some time for your bank or credit card company to process and post the refund too.
If more than 15 business days have passed since we've approved your return, please contact us at ${email}.`;
}

export function buildContactTemplate(ctx: PolicyTemplateContext): string {
  const { storeName, email, phone, physicalAddress } = ctx;
  const phoneLine = phone === '[INSERT BUSINESS PHONE NUMBER]' ? '' : phone;
  const addressLine = physicalAddress === '[INSERT BUSINESS ADDRESS]' ? '' : physicalAddress;
  return `Trade name: ${storeName}

Phone number: ${phoneLine}

Email: ${email}

Physical address: ${addressLine}

VAT number:

Trade number:`;
}

export function buildPrivacyTemplate(ctx: PolicyTemplateContext): string {
  const { storeName, email } = ctx;
  return `Privacy policy

This Privacy Policy describes how ${storeName} ("we", "us", or "our") collects, uses, and shares your personal information when you visit or make a purchase from our store.

Personal information we collect
When you visit the store, we automatically collect certain information about your device, including your web browser, IP address, time zone, and some of the cookies installed on your device. We also collect information about the individual web pages or products you view, referring websites, and how you interact with the store.
When you make a purchase or attempt to make a purchase, we collect information you provide such as your name, billing and shipping addresses, payment information, email address, and phone number ("Order Information").

How we use your personal information
We use Order Information to fulfill orders (including processing payment, arranging shipping, and providing invoices/order confirmations), communicate with you, screen for fraud, and when aligned with your preferences, provide information or advertising about our products or services.
We use device information to help us screen for potential risk and fraud (in particular, your IP address), and more generally to improve and optimize our store.

Sharing your personal information
We share your personal information with service providers that help us operate our business and store—for example payment processors and hosting platforms—so they can provide services to us and you. We may also share information to comply with applicable laws and regulations, respond to a lawful request, or protect our rights.

Your rights
If you are a resident of certain regions (for example the EEA), you may have rights to access, correct, update, or delete your personal information. If you wish to exercise these rights, contact us at ${email}.

Data retention
We retain Order Information for our records unless and until you ask us to delete it, subject to legal retention requirements.

Changes
We may update this privacy policy from time to time to reflect changes to our practices or for other operational, legal, or regulatory reasons.

Contact
For more information about our privacy practices, or if you have questions, contact us at ${email}.`;
}

export function buildTermsTemplate(ctx: PolicyTemplateContext): string {
  const { storeName, email, phone, legalBusinessName, physicalAddress } = ctx;
  const welcomeText = `Welcome to ${storeName}! The terms "we", "us" and "our" refer to ${storeName}. ${storeName} operates this store and website, including all related information, content, features, tools, products and services in order to provide you, the customer, with a curated experience (the "Services").`;
  return `OVERVIEW
${welcomeText}
The below terms and conditions, together with any policies referenced herein (these "Terms of Service" or "Terms") describe your rights and responsibilities when you use the Services.
Please read these Terms of Service carefully, as they include important information about your legal rights and cover areas such as warranty disclaimers and limitations of liability.
By visiting, interacting with or using our Services, you agree to be bound by these Terms of Service and our Privacy Policy [LINK]. If you do not agree to these Terms of Service or Privacy Policy, you should not use or access our Services.

SECTION 1 - ACCESS AND ACCOUNT
By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence.
To use the Services, you may be asked to provide certain information, such as your email address, billing, payment, and shipping information. You represent and warrant that all the information you provide is correct, current and complete.

SECTION 2 - OUR PRODUCTS AND CONTENT
We have made every effort to provide an accurate representation of our products and services. However, please note that colors or product appearance may differ from how they may appear on your screen.
All descriptions are subject to change at any time without notice at our sole discretion.

SECTION 3 - ORDERS AND PURCHASES
When you place an order, you are making an offer to purchase. ${storeName} reserves the right to accept or decline your order for any reason at its discretion.
Your purchases are subject to return or exchange solely in accordance with our Refund Policy [LINK].

SECTION 4 - PRICES AND BILLING
Prices, discounts and promotions are subject to change without notice. Unless otherwise expressly stated, posted prices do not include taxes, shipping, handling, customs or import charges.

SECTION 5 - SHIPPING AND DELIVERY
We are not liable for shipping and delivery delays. All delivery times are estimates only and are not guaranteed.

SECTION 6 - INTELLECTUAL PROPERTY
Our Services, including but not limited to all trademarks, brands, text, displays, images, graphics, and the design, selection, and arrangement thereof, are owned by ${storeName} or its affiliates or licensors and are protected by applicable intellectual property laws.

SECTION 7 - OPTIONAL TOOLS AND THIRD-PARTY LINKS
You may be provided with access to tools offered by third parties as part of the Services. We provide access to such tools "as is" and "as available" without warranties or endorsement.
The Services may contain materials and hyperlinks to websites provided or operated by third parties. We are not responsible for examining or evaluating the content or accuracy of any third-party materials or websites.

SECTION 8 - FEEDBACK
If you submit any ideas, suggestions, feedback, or reviews, you grant us a perpetual, worldwide, royalty-free license to use such Feedback in connection with operating and improving the Services.

SECTION 9 - TERMINATION
We may terminate this agreement or your access to the Services in our sole discretion at any time without notice.

SECTION 10 - DISCLAIMER OF WARRANTIES
THE SERVICES AND ALL PRODUCTS OR CONTENT OFFERED THROUGH THE SERVICES ARE PROVIDED 'AS IS' AND 'AS AVAILABLE' WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.

SECTION 11 - LIMITATION OF LIABILITY
TO THE FULLEST EXTENT PROVIDED BY LAW, IN NO CASE SHALL ${storeName} BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICES.

SECTION 12 - INDEMNIFICATION
You agree to indemnify and hold harmless ${storeName} from any claims arising out of your breach of these Terms or your use of the Services.

SECTION 13 - GOVERNING LAW
These Terms shall be governed by and construed in accordance with the laws applicable in the jurisdiction where ${storeName} is headquartered.

SECTION 14 - CHANGES TO TERMS OF SERVICE
We reserve the right to update or replace any part of these Terms by posting updates on our website. Your continued use of the Services constitutes acceptance of those changes.

SECTION 15 - CONTACT INFORMATION
Questions about the Terms of Service should be sent to us at ${email}.
Our contact information is posted below:
${legalBusinessName}
${email}
${physicalAddress}
${phone}
[INSERT BUSINESS REGISTRATION NUMBER]
[INSERT VAT NUMBER]`;
}

export const POLICY_TEMPLATE_BUILDERS = {
  'return-refund': buildReturnRefundTemplate,
  privacy: buildPrivacyTemplate,
  terms: buildTermsTemplate,
  contact: buildContactTemplate,
} as const;
