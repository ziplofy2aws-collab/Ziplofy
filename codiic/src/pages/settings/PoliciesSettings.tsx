import {
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  IdentificationIcon,
  LockClosedIcon,
  ScaleIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/Modal';
import PoliciesRow from '../../components/PoliciesRow';
import ProductDescriptionInput from '../../components/products/ProductDescriptionInput';
import { useReturnRules } from '../../contexts/return-rules.context';
import { useGeneralSettings } from '../../contexts/general-settings.context';
import { useStoreContactInfo } from '../../contexts/store-contact-info.context';
import { useStorePrivacyPolicy } from '../../contexts/store-privacy-policy.context';
import { useStoreReturnRefundPolicy } from '../../contexts/store-return-refund-policy.context';
import { useStoreShippingPolicy } from '../../contexts/store-shipping-policy.context';
import { useStoreTermsPolicy } from '../../contexts/store-terms-policy.context';
import { useStore } from '../../contexts/store.context';
import { useUserContext } from '../../contexts/user.context';
import {
  adminListCardClass,
  adminListFooterLinkClass,
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from '../../components/admin-list-ui';
import { SettingsHero } from '../../components/settings/SettingsPageScaffold';
import {
  isRichTextContentEmpty,
  isRichTextEditorContentEqual,
  normalizePolicyContentForSave,
  normalizeRichTextForEditor,
} from '../../utils/theme-editor-rich-text.util';

/** Shared modal chrome — policies editors (admin tokens) */
const modalNoticeBox = 'mb-4 rounded-xl border border-admin-border bg-admin-surface p-4';
const modalDisclaimerBox =
  'mt-3 rounded-lg border border-admin-border bg-admin-fill p-3 text-admin-text-secondary';
const btnGhost = adminListSecondaryButtonClass;
const btnPrimary = adminListPrimaryButtonClass;
const btnPrimaryMuted =
  'inline-flex cursor-not-allowed items-center justify-center rounded-lg bg-admin-fill px-3 py-1.5 text-[13px] font-semibold text-admin-text-subdued';
const btnTemplate = `${adminListSecondaryButtonClass} px-3 py-2 text-xs`;
const modalLinkClass = `${adminListFooterLinkClass} font-medium underline decoration-[#005bd3]/30 underline-offset-2`;
const policyStatusInactive =
  'inline-flex items-center rounded-md bg-admin-fill px-2 py-0.5 text-xs font-medium text-admin-text-secondary';
const policyStatusActive =
  'inline-flex items-center rounded-md bg-admin-secondary px-2 py-0.5 text-xs font-medium text-admin-text';

const isPolicyDirty = (current: string, stored: string | undefined) =>
  !isRichTextEditorContentEqual(current, stored ?? '');

type PolicyTemplateContext = {
  storeName: string;
  email: string;
  phone: string;
  legalBusinessName: string;
  physicalAddress: string;
};

function formatStorePhysicalAddress(parts: {
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

function PolicyModalEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <ProductDescriptionInput
      value={value}
      onChange={onChange}
      hideLabel
      placeholder={placeholder}
      enableTemplates={false}
    />
  );
}

const PoliciesSettings: React.FC = () => {
  const navigate = useNavigate();
  const { rules, getByStoreId, loading } = useReturnRules();
  const { stores, activeStoreId } = useStore();
  const { loggedInUser } = useUserContext();
  const { settings: generalSettings, getByStoreId: getGeneralSettingsByStoreId } = useGeneralSettings();
  const { info, getByStoreId: getContactByStoreId, createInfo, updateInfo } = useStoreContactInfo();
  const { policy, getByStoreId: getShippingByStoreId, createPolicy, updatePolicy } = useStoreShippingPolicy();
  const {
    policy: termsPolicy,
    getByStoreId: getTermsByStoreId,
    createPolicy: createTermsPolicy,
    updatePolicy: updateTermsPolicy,
  } = useStoreTermsPolicy();
  const {
    policy: privacyPolicy,
    getByStoreId: getPrivacyByStoreId,
    createPolicy: createPrivacyPolicy,
    updatePolicy: updatePrivacyPolicy,
  } = useStorePrivacyPolicy();
  const {
    policy: returnRefundPolicy,
    getByStoreId: getReturnRefundByStoreId,
    createPolicy: createReturnRefundPolicy,
    updatePolicy: updateReturnRefundPolicy,
  } = useStoreReturnRefundPolicy();
  const [contactOpen, setContactOpen] = useState(false);
  const [contactContent, setContactContent] = useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [shippingContent, setShippingContent] = useState('');
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsContent, setTermsContent] = useState('');
  const [showTermsDisclaimer, setShowTermsDisclaimer] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [privacyContent, setPrivacyContent] = useState('');
  const [privacyAutomated, setPrivacyAutomated] = useState(false);
  const [showPrivacyDisclaimer, setShowPrivacyDisclaimer] = useState(false);
  const [showShippingDisclaimer, setShowShippingDisclaimer] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnContent, setReturnContent] = useState('');
  const [showReturnDisclaimer, setShowReturnDisclaimer] = useState(false);

  useEffect(() => {
    if (!activeStoreId) return;
    void Promise.all([
      getByStoreId(activeStoreId),
      getContactByStoreId(activeStoreId),
      getShippingByStoreId(activeStoreId),
      getTermsByStoreId(activeStoreId),
      getPrivacyByStoreId(activeStoreId),
      getReturnRefundByStoreId(activeStoreId),
      getGeneralSettingsByStoreId(activeStoreId),
    ]).catch(() => {
      // Individual contexts surface loading/error state; avoid unhandled rejections.
    });
  }, [
    activeStoreId,
    getByStoreId,
    getContactByStoreId,
    getShippingByStoreId,
    getTermsByStoreId,
    getPrivacyByStoreId,
    getReturnRefundByStoreId,
    getGeneralSettingsByStoreId,
  ]);

  const getPolicyTemplateContext = useCallback((): PolicyTemplateContext => {
    const activeStore = stores.find((s) => s._id === activeStoreId);
    const storeName =
      generalSettings?.storeName?.trim() ||
      activeStore?.storeName?.trim() ||
      'My Store';
    const email =
      generalSettings?.storeEmail?.trim() ||
      loggedInUser?.email?.trim() ||
      'support@example.com';
    const phone = generalSettings?.storePhone?.trim() || '[INSERT BUSINESS PHONE NUMBER]';
    const legalBusinessName =
      generalSettings?.legalBusinessName?.trim() || storeName;
    const physicalAddress = formatStorePhysicalAddress({
      legalBusinessName: generalSettings?.legalBusinessName,
      billingAddress: generalSettings?.billingAddress,
      billingApartment: generalSettings?.billingApartment,
      billingPinCode: generalSettings?.billingPinCode,
      billingCity: generalSettings?.billingCity,
      billingState: generalSettings?.billingState,
      billingCountry: generalSettings?.billingCountry,
    });

    return { storeName, email, phone, legalBusinessName, physicalAddress };
  }, [stores, activeStoreId, generalSettings, loggedInUser]);

  const handleReturnTemplate = useCallback(() => {
    const { email, physicalAddress } = getPolicyTemplateContext();
    const template = `We have a 30-day return policy, which means you have 30 days after receiving your item to request a return.\n\nTo be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You'll also need the receipt or proof of purchase.\n\nTo start a return, you can contact us at ${email}. Please note that returns will need to be sent to the following address: ${physicalAddress}\n\nIf your return is accepted, we'll send you a return shipping label, as well as instructions on how and where to send your package. Items sent back to us without first requesting a return will not be accepted.\n\nYou can always contact us for any return question at ${email}.\n\n\n\n\nDamages and issues\nPlease inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.\n\n\n\n\nExceptions / non-returnable items\nCertain types of items cannot be returned, like perishable goods (such as food, flowers, or plants), custom products (such as special orders or personalized items), and personal care goods (such as beauty products). We also do not accept returns for hazardous materials, flammable liquids, or gases. Please get in touch if you have questions or concerns about your specific item.\n\nUnfortunately, we cannot accept returns on sale items or gift cards.\n\n\n\n\nExchanges\nThe fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.\n\n\n\n\nEuropean Union 14 day cooling off period\nNotwithstanding the above, if the merchandise is being shipped into the European Union, you have the right to cancel or return your order within 14 days, for any reason and without a justification. As above, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You'll also need the receipt or proof of purchase.\n\n\n\n\nRefunds\nWe will notify you once we've received and inspected your return, and let you know if the refund was approved or not. If approved, you'll be automatically refunded on your original payment method within 10 business days. Please remember it can take some time for your bank or credit card company to process and post the refund too.\nIf more than 15 business days have passed since we've approved your return, please contact us at ${email}.`;
    setReturnContent(normalizeRichTextForEditor(template));
  }, [getPolicyTemplateContext]);

  const handleContactTemplate = useCallback(() => {
    const { storeName, email, phone, physicalAddress } = getPolicyTemplateContext();
    const phoneLine = phone === '[INSERT BUSINESS PHONE NUMBER]' ? '' : phone;
    const addressLine = physicalAddress === '[INSERT BUSINESS ADDRESS]' ? '' : physicalAddress;
    const template = `Trade name: ${storeName}\n\nPhone number: ${phoneLine}\n\nEmail: ${email}\n\nPhysical address: ${addressLine}\n\nVAT number:\n\nTrade number:`;
    setContactContent(normalizeRichTextForEditor(template));
  }, [getPolicyTemplateContext]);

  const handleTermsTemplate = useCallback(() => {
    const { storeName, email, phone, legalBusinessName, physicalAddress } =
      getPolicyTemplateContext();
    const welcomeText = `Welcome to ${storeName}! The terms "we", "us" and "our" refer to ${storeName}. ${storeName} operates this store and website, including all related information, content, features, tools, products and services in order to provide you, the customer, with a curated shopping experience (the "Services"). ${storeName} is powered by codiic, which enables us to provide the Services to you.`;
    const template = `OVERVIEW\n${welcomeText}\nThe below terms and conditions, together with any policies referenced herein (these "Terms of Service" or "Terms") describe your rights and responsibilities when you use the Services.\nPlease read these Terms of Service carefully, as they include important information about your legal rights and cover areas such as warranty disclaimers and limitations of liability.\nBy visiting, interacting with or using our Services, you agree to be bound by these Terms of Service and our Privacy Policy [LINK]. If you do not agree to these Terms of Service or Privacy Policy, you should not use or access our Services.\n\nSECTION 1 - ACCESS AND ACCOUNT\nBy agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, and you have given us your consent to allow any of your minor dependents to use the Services on devices you own, purchase or manage.\nTo use the Services, including accessing or browsing our online stores or purchasing any of the products or services we offer, you may be asked to provide certain information, such as your email address, billing, payment, and shipping information. You represent and warrant that all the information you provide in our stores is correct, current and complete and that you have all rights necessary to provide this information.\nYou are solely responsible for maintaining the security of your account credentials and for all of your account activity. You may not transfer, sell, assign, or license your account to any other person.\n\nSECTION 2 - OUR PRODUCTS\nWe have made every effort to provide an accurate representation of our products and services in our online stores. However, please note that colors or product appearance may differ from how they may appear on your screen due to the type of device you use to access the store and your device settings and configuration.\nWe do not warrant that the appearance or quality of any products or services purchased by you will meet your expectations or be the same as depicted or rendered in our online stores.\nAll descriptions of products are subject to change at any time without notice at our sole discretion. We reserve the right to discontinue any product at any time and may limit the quantities of any products that we offer to any person, geographic region or jurisdiction, on a case-by-case basis.\n\nSECTION 3 - ORDERS\nWhen you place an order, you are making an offer to purchase. ${storeName} reserves the right to accept or decline your order for any reason at its discretion. Your order is not accepted until ${storeName} confirms acceptance. We must receive and process your payment before your order is accepted. Please review your order carefully before submitting, as ${storeName} may be unable to accommodate cancellation requests after an order is accepted. In the event that we do not accept, make a change to, or cancel an order, we will attempt to notify you by contacting the e‑mail, billing address, and/or phone number provided at the time the order was made.\nYour purchases are subject to return or exchange solely in accordance with our Refund Policy [LINK].\nYou represent and warrant that your purchases are for your own personal or household use and not for commercial resale or export.\n\nSECTION 4 - PRICES AND BILLING\nPrices, discounts and promotions are subject to change without notice. The price charged for a product or service will be the price in effect at the time the order is placed and will be set out in your order confirmation email. Unless otherwise expressly stated, posted prices do not include taxes, shipping, handling, customs or import charges.\nPrices posted in our online stores may be different from prices offered in physical stores or in online or other stores operated by third parties. We may offer, from time to time, promotions on the Services that may affect pricing and that are governed by terms and conditions separate from these Terms. If there is a conflict between the terms for a promotion and these Terms, the promotion terms will govern.\nYou agree to provide current, complete and accurate purchase, payment and account information for all purchases made at our stores. You agree to promptly update your account and other information, including your email address, credit card numbers and expiration dates, so that we can complete your transactions and contact you as needed.\nYou represent and warrant that (i) the credit card information you provide is true, correct, and complete, (ii) you are duly authorized to use such credit card for the purchase, (iii) charges incurred by you will be honored by your credit card company, and (iv) you will pay charges incurred by you at the posted prices, including shipping and handling charges and all applicable taxes, if any.\n\nSECTION 5 - SHIPPING AND DELIVERY\nWe are not liable for shipping and delivery delays. All delivery times are estimates only and are not guaranteed. We are not responsible for delays caused by shipping carriers, customs processing, or events outside our control. Once we transfer products to the carrier, title and risk of loss passes to you.\n\nSECTION 6 - INTELLECTUAL PROPERTY\nOur Services, including but not limited to all trademarks, brands, text, displays, images, graphics, product reviews, video, and audio, and the design, selection, and arrangement thereof, are owned by ${storeName}, its affiliates or licensors and are protected by U.S. and foreign patent, copyright and other intellectual property laws.\nThese Terms permit you to use the Services for your personal, non-commercial use only. You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on the Services without our prior written consent. Except as expressly provided herein, nothing in these Terms grants or shall be construed as granting a license or other rights to you under any patent, trademark, copyright, or other intellectual property of ${storeName}, codiic or any third party. Unauthorized use of the Services may be a violation of federal and state intellectual property laws. All rights not expressly granted herein are reserved by ${storeName}.\n${storeName}'s names, logos, product and service names, designs, and slogans are trademarks of ${storeName} or its affiliates or licensors. You must not use such trademarks without the prior written permission of ${storeName}. codiic's name, logo, product and service names, designs and slogans are trademarks of codiic. All other names, logos, product and service names, designs, and slogans on the Services are the trademarks of their respective owners.\n\nSECTION 7 - OPTIONAL TOOLS\nYou may be provided with access to customer tools offered by third parties as part of the Services, which we neither monitor nor have any control nor input.\nYou acknowledge and agree that we provide access to such tools "as is" and "as available" without any warranties, representations or conditions of any kind and without any endorsement. We shall have no liability whatsoever arising from or relating to your use of optional third-party tools.\nAny use by you of the optional tools offered through the site is entirely at your own risk and discretion and you should ensure that you are familiar with and approve of the terms on which tools are provided by the relevant third-party provider(s).\nWe may also, in the future, offer new features through the Services (including the release of new tools and resources). Such new features shall also be deemed part of the Services and are subject to these Terms of Service.\n\nSECTION 8 - THIRD-PARTY LINKS\nThe Services may contain materials and hyperlinks to websites provided or operated by third parties (including any embedded third party functionality). We are not responsible for examining or evaluating the content or accuracy of any third-party materials or websites you choose to access. If you decide to leave the Services to access these materials or third party sites, you do so at your own risk.\nWe are not liable for any harm or damages related to your access of any third-party websites, or your purchase or use of any products, services, resources, or content on any third-party websites. Please review carefully the third-party's policies and practices and make sure you understand them before you engage in any transaction. Complaints, claims, concerns, or questions regarding third-party products and services should be directed to the third-party.\n\nSECTION 9 - RELATIONSHIP WITH codiic\n[NOTE TO MERCHANT: This section accurately characterizes codiic's relationship with your store and should not be removed or modified.]\n${storeName} is powered by codiic, which enables us to provide the Services to you. However, any sales and purchases you make in our Store are made directly with ${storeName}. By using the Services, you acknowledge and agree that codiic is not responsible for any aspect of any sales between you and ${storeName}, including any injury, damage, or loss resulting from purchased products and services. You hereby expressly release codiic and its affiliates from all claims, damages, and liabilities arising from or related to your purchases and transactions with ${storeName}.\n\nSECTION 10 - PRIVACY POLICY\nAll personal information we collect through the Services is subject to our Privacy Policy, which can be viewed here [LINK], and certain personal information may be subject to codiic's Privacy Policy, which can be viewed here. By using the Services, you acknowledge that you have read these privacy policies.\nBecause the Services are hosted by codiic, codiic collects and processes personal information about your access to and use of the Services in order to provide and improve the Services for you. Information you submit to the Services will be transmitted to and shared with codiic as well as third parties that may be located in other countries than where you reside, in order to provide services to you. Review our privacy policy [LINK] for more details on how we, codiic, and our partners use your personal information.\n\nSECTION 11 - FEEDBACK\nIf you submit, upload, post, email, or otherwise transmit any ideas, suggestions, feedback, reviews, proposals, plans, or other content (collectively, "Feedback"), you grant us a perpetual, worldwide, sublicensable, royalty-free license to use, reproduce, modify, publish, distribute and display such Feedback in any medium for any purpose, including for commercial use. We may, for example, use our rights under this license to operate, provide, evaluate, enhance, improve and promote the Services and to perform our obligations and exercise our rights under the Terms of Service.\nYou also represent and warrant that: (i) you own or have all necessary rights to all Feedback; (ii) you have disclosed any compensation or incentives received in connection with your submission of Feedback; and (iii) your Feedback will comply with these Terms. We are and shall be under no obligation (1) to maintain your Feedback in confidence; (2) to pay compensation for your Feedback; or (3) to respond to your Feedback.\nWe may, but have no obligation to, monitor, edit or remove Feedback that we determine in our sole discretion to be unlawful, offensive, threatening, libelous, defamatory, pornographic, obscene or otherwise objectionable or violates any party's intellectual property or these Terms of Service.\nYou agree that your Feedback will not violate any right of any third-party, including copyright, trademark, privacy, personality or other personal or proprietary right. You further agree that your Feedback will not contain libelous or otherwise unlawful, abusive or obscene Feedback, or contain any computer virus or other malware that could in any way affect the operation of the Services or any related website. You may not use a false email address, pretend to be someone other than yourself, or otherwise mislead us or third-parties as to the origin of any Feedback. You are solely responsible for any Feedback you make and its accuracy. We take no responsibility and assume no liability for any Feedback posted by you or any third-party.\n\nSECTION 12 - ERRORS, INACCURACIES AND OMISSIONS\nOccasionally there may be information on or in the Services that contain typographical errors, inaccuracies or omissions that may relate to product descriptions, pricing, promotions, offers, product shipping charges, transit times and availability. We reserve the right to correct any errors, inaccuracies or omissions, and to change or update information or cancel orders if any information is inaccurate at any time without prior notice (including after you have submitted your order).\n\nSECTION 13 - PROHIBITED USES\nYou may access and use the Services for lawful purposes only. You may not access or use the Services, directly or indirectly: (a) for any unlawful or malicious purpose; (b) to violate any international, federal, provincial or state regulations, rules, laws, or local ordinances; (c) to infringe upon or violate our intellectual property rights or the intellectual property rights of others; (d) to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or harm any of our employees or any other person; (e) to transmit false or misleading information; (f) to send, knowingly receive, upload, download, use, or re-use any material that does not comply with the these Terms; (g) to transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation; (h) to impersonate or attempt to impersonate any other person or entity; or (i) to engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Services, or which, as determined by us, may harm ${storeName}, codiic or users of the Services, or expose them to liability.\nIn addition, you agree not to: (a) upload or transmit viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the Services; (b) reproduce, duplicate, copy, sell, resell or exploit any portion of the Services; (c) collect or track the personal information of others; (d) spam, phish, pharm, pretext, spider, crawl, or scrape; or (e) interfere with or circumvent the security features of the Services or any related website, other websites, or the Internet. We reserve the right to suspend, disable, or terminate your account at any time, without notice, if we determine that you have violated any part of these Terms.\n\nSECTION 14 - TERMINATION\nWe may terminate this agreement or your access to the Services (or any part thereof) in our sole discretion at any time without notice, and you will remain liable for all amounts due up to and including the date of termination.\nThe following sections will continue to apply following any termination: Intellectual Property, Feedback, Termination, Disclaimer of Warranties, Limitation of Liability, Indemnification, Severability, Waiver; Entire Agreement, Assignment, Governing Law, Privacy Policy, and any other provisions that by their nature should survive termination.\n\nSECTION 15 - DISCLAIMER OF WARRANTIES\nThe information presented on or through the Services is made available solely for general information purposes. We do not warrant the accuracy, completeness, or usefulness of this information. Any reliance you place on such information is strictly at your own risk. We disclaim all liability and responsibility arising from any reliance placed on such materials by you or any other visitor to the Services, or by anyone who may be informed of any of its contents.\nEXCEPT AS EXPRESSLY STATED BY ${storeName}, THE SERVICES AND ALL PRODUCTS OFFERED THROUGH THE SERVICES ARE PROVIDED 'AS IS' AND 'AS AVAILABLE' FOR YOUR USE, WITHOUT ANY REPRESENTATION, WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ALL IMPLIED WARRANTIES OR CONDITIONS OF MERCHANTABILITY, MERCHANTABLE QUALITY, FITNESS FOR A PARTICULAR PURPOSE, DURABILITY, TITLE, AND NON-INFRINGEMENT. WE DO NOT GUARANTEE, REPRESENT OR WARRANT THAT YOUR USE OF THE SERVICES WILL BE UNINTERRUPTED, TIMELY, SECURE OR ERROR-FREE. SOME JURISDICTIONS LIMIT OR DO NOT ALLOW THE DISCLAIMER OF IMPLIED OR OTHER WARRANTIES SO THE ABOVE DISCLAIMER MAY NOT APPLY TO YOU.\n\nSECTION 16 - LIMITATION OF LIABILITY\nTO THE FULLEST EXTENT PROVIDED BY LAW, IN NO CASE SHALL ${storeName}, OUR PARTNERS, DIRECTORS, OFFICERS, EMPLOYEES, AFFILIATES, AGENTS, CONTRACTORS, SERVICE PROVIDERS OR LICENSORS, OR THOSE OF codiic AND ITS AFFILIATES, BE LIABLE FOR ANY INJURY, LOSS, CLAIM, OR ANY DIRECT, INDIRECT, INCIDENTAL, PUNITIVE, SPECIAL, OR CONSEQUENTIAL DAMAGES OF ANY KIND, INCLUDING, WITHOUT LIMITATION, LOST PROFITS, LOST REVENUE, LOST SAVINGS, LOSS OF DATA, REPLACEMENT COSTS, OR ANY SIMILAR DAMAGES, WHETHER BASED IN CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY OR OTHERWISE, ARISING FROM YOUR USE OF ANY OF THE SERVICES OR ANY PRODUCTS PROCURED USING THE SERVICES, OR FOR ANY OTHER CLAIM RELATED IN ANY WAY TO YOUR USE OF THE SERVICES OR ANY PRODUCT, INCLUDING, BUT NOT LIMITED TO, ANY ERRORS OR OMISSIONS IN ANY CONTENT, OR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF THE SERVICES OR ANY CONTENT (OR PRODUCT) POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SERVICES, EVEN IF ADVISED OF THEIR POSSIBILITY.\n\nSECTION 17 - INDEMNIFICATION\nYou agree to indemnify, defend and hold harmless ${storeName}, codiic, and our affiliates, partners, officers, directors, employees, agents, contractors, licensors, and service providers from any losses, damages, liabilities or claims, including reasonable attorneys' fees, payable to any third party due to or arising out of (1) your breach of these Terms of Service or the documents they incorporate by reference, (2) your violation of any law or the rights of a third party, or (3) your access to and use of the Services.\nWe will notify you of any indemnifiable claim, provided that a failure to promptly notify will not relieve you of your obligations unless you are materially prejudiced. We may control the defense and settlement of such claim at your expense, including choice of counsel, but will not settle any claim requiring non-monetary obligations from you without your consent (not to be unreasonably withheld). You will cooperate in the defense of indemnified claims, including by providing relevant documents.\n\nSECTION 18 - SEVERABILITY\nIn the event that any provision of these Terms of Service is determined to be unlawful, void or unenforceable, such provision shall nonetheless be enforceable to the fullest extent permitted by applicable law, and the unenforceable portion shall be deemed to be severed from these Terms of Service, such determination shall not affect the validity and enforceability of any other remaining provisions.\n\nSECTION 19 - WAIVER; ENTIRE AGREEMENT\nThe failure of us to exercise or enforce any right or provision of these Terms of Service shall not constitute a waiver of such right or provision.\nThese Terms of Service and any policies or operating rules posted by us on this site or in respect to the Service constitutes the entire agreement and understanding between you and us and governs your use of the Service, superseding any prior or contemporaneous agreements, communications and proposals, whether oral or written, between you and us (including, but not limited to, any prior versions of the Terms of Service).\nAny ambiguities in the interpretation of these Terms of Service shall not be construed against the drafting party.\n\nSECTION 20 - ASSIGNMENT\nYou may not delegate, transfer or assign this Agreement or any of your rights or obligations under these Terms without our prior written consent, and any such attempt will be null and void. We may transfer, assign, or delegate these Terms and our rights and obligations without consent or notice to you.\n\nSECTION 21 - GOVERNING LAW\nThese Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the federal and state or territorial courts in the jurisdiction where ${storeName} is headquartered. You and ${storeName} consent to venue and personal jurisdiction in such courts.\n\nSECTION 22 - HEADINGS\nThe headings used in this agreement are included for convenience only and will not limit or otherwise affect these Terms.\n\nSECTION 23 - CHANGES TO TERMS OF SERVICE\nYou can review the most current version of the Terms of Service at any time on this page.\nWe reserve the right, in our sole discretion, to update, change, or replace any part of these Terms of Service by posting updates and changes to our website. It is your responsibility to check our website periodically for changes. We will notify you of any material changes to these Terms in accordance with applicable law, and such changes will be effective on the date specified in the notice. Your continued use of or access to the Services following the posting of any changes to these Terms of Service constitutes acceptance of those changes.\n\nSECTION 24 - CONTACT INFORMATION\nQuestions about the Terms of Service should be sent to us at ${email}.\nOur contact information is posted below:\n${legalBusinessName}\n${email}\n${physicalAddress}\n${phone}\n[INSERT BUSINESS REGISTRATION NUMBER]\n[INSERT VAT NUMBER]`;
    setTermsContent(normalizeRichTextForEditor(template));
  }, [getPolicyTemplateContext]);

  const handleShippingTemplate = useCallback(() => {
    const { storeName, email } = getPolicyTemplateContext();
    const template = `Shipping policy\n\n${storeName} ships to [INSERT COUNTRIES / REGIONS].\n\nProcessing time\nOrders are typically processed within 1–3 business days after payment is confirmed (excluding weekends and holidays). During peak seasons, processing may take longer. You will receive a confirmation email when your order ships.\n\nShipping methods and delivery estimates\nWe offer the following shipping options:\n• Standard shipping: [INSERT ESTIMATED DAYS]\n• Express shipping: [INSERT ESTIMATED DAYS]\nDelivery times are estimates only and begin from the ship date, not the order date. We are not responsible for delays caused by carriers, customs, weather, or events outside our control.\n\nShipping rates\nShipping costs are calculated at checkout based on destination, package weight/size, and the method you select. Any duties, taxes, or import fees for international orders are the customer's responsibility unless otherwise stated.\n\nOrder tracking\nOnce your order ships, we will email tracking information (when available from the carrier). You can use that tracking number on the carrier's website to follow your package.\n\nDamaged or lost shipments\nIf your package arrives damaged, please contact us within [INSERT DAYS] days at ${email} with photos of the damage and packaging. If a shipment is lost in transit, contact us and we will work with the carrier to investigate and help resolve the issue.\n\nUndeliverable packages\nIf a package is returned to us as undeliverable (incorrect address, refusal, unclaimed), we may contact you to arrange reshipment (additional shipping charges may apply) or issue a refund minus outbound shipping costs, at our discretion.\n\nQuestions\nFor shipping questions, email us at ${email}.`;
    setShippingContent(normalizeRichTextForEditor(template));
  }, [getPolicyTemplateContext]);

  const handlePrivacyTemplate = useCallback(() => {
    const { storeName, email } = getPolicyTemplateContext();
    const template = `Privacy policy\n\nThis Privacy Policy describes how ${storeName} ("we", "us", or "our") collects, uses, and shares your personal information when you visit or make a purchase from our store.\n\nPersonal information we collect\nWhen you visit the store, we automatically collect certain information about your device, including your web browser, IP address, time zone, and some of the cookies installed on your device. We also collect information about the individual web pages or products you view, referring websites, and how you interact with the store.\nWhen you make a purchase or attempt to make a purchase, we collect information you provide such as your name, billing and shipping addresses, payment information, email address, and phone number ("Order Information").\n\nHow we use your personal information\nWe use Order Information to fulfill orders (including processing payment, arranging shipping, and providing invoices/order confirmations), communicate with you, screen for fraud, and when aligned with your preferences, provide information or advertising about our products or services.\nWe use device information to help us screen for potential risk and fraud (in particular, your IP address), and more generally to improve and optimize our store.\n\nSharing your personal information\nWe share your personal information with service providers that help us operate our business and store—for example payment processors and hosting platforms such as codiic—so they can provide services to us and you. We may also share information to comply with applicable laws and regulations, respond to a lawful request, or protect our rights.\n\nYour rights\nIf you are a resident of certain regions (for example the EEA), you may have rights to access, correct, update, or delete your personal information. If you wish to exercise these rights, contact us at ${email}.\n\nData retention\nWe retain Order Information for our records unless and until you ask us to delete it, subject to legal retention requirements.\n\nChanges\nWe may update this privacy policy from time to time to reflect changes to our practices or for other operational, legal, or regulatory reasons.\n\nContact\nFor more information about our privacy practices, or if you have questions, contact us at ${email}.`;
    setPrivacyContent(normalizeRichTextForEditor(template));
  }, [getPolicyTemplateContext]);

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title="Policies"
          description="Manage return rules and the policies shown in checkout and your store footer."
        />

      {/* Return rules */}
      <div className={`${adminListCardClass} mb-6 p-5`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mb-1 text-base font-semibold text-admin-text">Return rules</h2>
            {rules && (
              <>
                <span
                  className={`mr-2 inline-block rounded-md px-2.5 py-1 text-xs font-medium ${
                    rules.enabled
                      ? 'bg-admin-secondary text-admin-text'
                      : 'bg-admin-fill text-admin-text-secondary'
                  }`}
                >
                  {rules.enabled ? 'On' : 'Off'}
                </span>
                <p className="mt-2 text-sm text-admin-text-subdued">
                  Enable return rules to simplify return management, set up return fees, return shipping and define final sale items
                </p>
              </>
            )}
          </div>
          <button
            type="button"
            className={adminListPrimaryButtonClass}
            disabled={loading}
            onClick={() => navigate(rules ? '/settings/policies/manage-return-rules' : '/settings/policies/manage-return-rules/new')}
          >
            {rules ? 'Manage' : 'Create rule'}
          </button>
        </div>
      </div>

      {/* Written policies */}
      <div className={`${adminListCardClass} mb-6`}>
        <div className="flex items-start justify-between gap-4 p-5 pb-4">
          <div>
            <h2 className="text-base font-semibold text-admin-text">Written policies</h2>
            <p className="mt-1 text-sm text-admin-text-subdued">
              Policies are linked in the footer of checkout and can be added to your online store menu
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-admin-border bg-admin-surface p-2 text-admin-text-subdued transition-colors hover:bg-admin-row-hover hover:text-admin-text"
            aria-label="More actions"
          >
            <EllipsisHorizontalIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="border-t border-admin-divider">
          <PoliciesRow
            icon={<ArrowPathIcon className="h-4 w-4" />}
            label="Return and refund policy"
            right={
              returnRefundPolicy ? (
                <span className={policyStatusActive}>Active</span>
              ) : (
                <span className={policyStatusInactive}>No policy set</span>
              )
            }
            onClick={() => {
              setReturnContent(normalizeRichTextForEditor(returnRefundPolicy?.returnRefundPolicy || ''));
              setReturnOpen(true);
            }}
          />
          <div className="border-t border-admin-divider" />
          <PoliciesRow
            icon={<LockClosedIcon className="h-4 w-4" />}
            label="Privacy policy"
            right={
              privacyPolicy ? (
                <span className={policyStatusActive}>Active</span>
              ) : (
                <span className={policyStatusInactive}>No policy set</span>
              )
            }
            onClick={() => {
              setPrivacyContent(normalizeRichTextForEditor(privacyPolicy?.privacyPolicy || ''));
              setPrivacyOpen(true);
            }}
          />
          <div className="border-t border-admin-divider" />
          <PoliciesRow
            icon={<ScaleIcon className="h-4 w-4" />}
            label="Terms of service"
            right={
              termsPolicy ? (
                <span className={policyStatusActive}>Active</span>
              ) : (
                <span className={policyStatusInactive}>No policy set</span>
              )
            }
            onClick={() => {
              setTermsContent(normalizeRichTextForEditor(termsPolicy?.termsPolicy || ''));
              setTermsOpen(true);
            }}
          />
          <div className="border-t border-admin-divider" />
          <PoliciesRow
            icon={<TruckIcon className="h-4 w-4" />}
            label="Shipping policy"
            right={
              policy ? (
                <span className={policyStatusActive}>Active</span>
              ) : (
                <span className={policyStatusInactive}>No policy set</span>
              )
            }
            onClick={() => {
              setShippingContent(normalizeRichTextForEditor(policy?.shippingPolicy || ''));
              setShippingOpen(true);
            }}
          />
          <div className="border-t border-admin-divider" />
          <PoliciesRow
            icon={<IdentificationIcon className="h-4 w-4" />}
            label="Contact information"
            right={
              info ? (
                <span className={policyStatusActive}>Active</span>
              ) : (
                <span className={policyStatusInactive}>Required</span>
              )
            }
            onClick={() => {
              setContactContent(normalizeRichTextForEditor(info?.contactInfo || ''));
              setContactOpen(true);
            }}
          />
        </div>
      </div>

      {/* Return and refund policy modal */}
      <Modal
        open={returnOpen}
        onClose={() => setReturnOpen(false)}
        title="Return and refund policy"
        maxWidth="lg"
        actions={
          <>
            <button type="button" onClick={() => setReturnOpen(false)} className={btnGhost}>
              Cancel
            </button>
            {returnRefundPolicy ? (
              <button
                type="button"
                className={
                  !isPolicyDirty(returnContent, returnRefundPolicy?.returnRefundPolicy)
                    ? btnPrimaryMuted
                    : btnPrimary
                }
                disabled={!isPolicyDirty(returnContent, returnRefundPolicy?.returnRefundPolicy)}
                onClick={async () => {
                  if (!returnRefundPolicy?._id) return;
                  await updateReturnRefundPolicy(returnRefundPolicy._id, {
                    returnRefundPolicy: normalizePolicyContentForSave(returnContent),
                  });
                  setReturnOpen(false);
                }}
              >
                Update
              </button>
            ) : (
              <button
                type="button"
                className={isRichTextContentEmpty(returnContent) || !activeStoreId ? btnPrimaryMuted : btnPrimary}
                disabled={isRichTextContentEmpty(returnContent) || !activeStoreId}
                onClick={async () => {
                  if (!activeStoreId) return;
                  await createReturnRefundPolicy({
                    storeId: activeStoreId,
                    returnRefundPolicy: normalizePolicyContentForSave(returnContent),
                  });
                  setReturnOpen(false);
                }}
              >
                Publish
              </button>
            )}
          </>
        }
      >
        <div className={modalNoticeBox}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <p className="text-sm leading-relaxed text-admin-text-secondary">
              Templates aren&apos;t legal advice. By using policy templates, you agree that you&apos;ve read and agree to the{' '}
              <button
                type="button"
                className={modalLinkClass}
                onClick={() => setShowReturnDisclaimer((v) => !v)}
              >
                disclaimer {showReturnDisclaimer ? '▾' : '▸'}
              </button>
            </p>
            <button type="button" className={`${btnTemplate} shrink-0`} onClick={handleReturnTemplate}>
              Insert template
            </button>
          </div>
          {showReturnDisclaimer && (
            <div className={modalDisclaimerBox}>
              <h3 className="mb-2 text-xs font-semibold text-admin-text">Generated policies disclaimer</h3>
              <p className="text-xs leading-relaxed">
                The materials below are for informational purposes only and do not constitute advertising, a solicitation or legal advice. Automated translations from the original English versions are available for convenience only.
              </p>
            </div>
          )}
        </div>
        <PolicyModalEditor
          value={returnContent}
          onChange={setReturnContent}
          placeholder="Add your return and refund policy..."
        />
      </Modal>

      {/* Contact information modal */}
      <Modal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title="Contact information"
        maxWidth="lg"
        actions={
          <>
            <button type="button" onClick={() => setContactOpen(false)} className={btnGhost}>
              Cancel
            </button>
            {info ? (
              <button
                type="button"
                className={
                  !isPolicyDirty(contactContent, info?.contactInfo) ? btnPrimaryMuted : btnPrimary
                }
                disabled={!isPolicyDirty(contactContent, info?.contactInfo)}
                onClick={async () => {
                  if (!info?._id) return;
                  await updateInfo(info._id, { contactInfo: normalizePolicyContentForSave(contactContent) });
                  setContactOpen(false);
                }}
              >
                Update
              </button>
            ) : (
              <button
                type="button"
                className={isRichTextContentEmpty(contactContent) || !activeStoreId ? btnPrimaryMuted : btnPrimary}
                disabled={isRichTextContentEmpty(contactContent) || !activeStoreId}
                onClick={async () => {
                  if (!activeStoreId) return;
                  await createInfo({
                    storeId: activeStoreId,
                    contactInfo: normalizePolicyContentForSave(contactContent),
                  });
                  setContactOpen(false);
                }}
              >
                Publish
              </button>
            )}
          </>
        }
      >
        <p className="mb-4 rounded-lg border border-admin-border bg-admin-fill px-3 py-2 text-sm text-admin-text-secondary">
          Contact information is required on your website if you are selling into the European Union.
        </p>
        <div className={modalNoticeBox}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <p className="text-sm leading-relaxed text-admin-text-secondary">
              Templates aren&apos;t legal advice. By using policy templates, you agree that you&apos;ve read and agree to the{' '}
              <button
                type="button"
                className={modalLinkClass}
                onClick={() => setShowDisclaimer((v) => !v)}
              >
                disclaimer {showDisclaimer ? '▾' : '▸'}
              </button>
            </p>
            <button type="button" className={`${btnTemplate} shrink-0`} onClick={handleContactTemplate}>
              Insert template
            </button>
          </div>
          {showDisclaimer && (
            <div className={modalDisclaimerBox}>
              <h3 className="mb-2 text-xs font-semibold text-admin-text">Generated policies disclaimer</h3>
              <p className="mb-2 text-xs leading-relaxed">
                The materials below are for informational purposes only and do not constitute advertising, a solicitation or legal advice. Automated translations from the original English versions are available for convenience only.
              </p>
              <p className="mb-2 text-xs leading-relaxed">
                You should consult independent legal advice in all regions where these materials will be used before publishing them. You are solely responsible for verifying the accuracy of all content, including any translated content, and should read the generated information with care and modify, delete or add all and any areas as necessary. Use of, access to or transmission of such materials and information or any of the links contained herein is not intended to create, and receipt thereof does not constitute formation of, an attorney-client relationship between codiic and the user or browser.
              </p>
              <p className="mb-2 text-xs leading-relaxed">
                You should not rely upon this information for any purpose without seeking legal advice from a licensed attorney in the relevant regions. The information contained is provided only as general information and may or may not reflect the most current legal developments or an accurate translation; accordingly, information is not promised or guaranteed to be correct or complete. codiic expressly disclaims all liability in respect of any actions taken or not taken based on any or all of the contents of this website, or any inaccuracies in any of the content.
              </p>
              <p className="text-xs leading-relaxed">
                Further, codiic does not necessarily endorse and is not responsible for any third‑party content that may be accessed through this information.
              </p>
            </div>
          )}
        </div>
        <PolicyModalEditor
          value={contactContent}
          onChange={setContactContent}
          placeholder="Add your contact information..."
        />
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-admin-border bg-admin-surface p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-admin-text text-sm font-semibold text-white">
            S
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-admin-text">codiic Inbox</p>
            <p className="text-xs text-admin-text-subdued">4.7 ★</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-admin-text-subdued transition-colors hover:bg-admin-row-hover hover:text-admin-text"
            aria-label="More"
          >
            <EllipsisHorizontalIcon className="h-4 w-4" />
          </button>
        </div>
      </Modal>

      {/* Terms of service modal */}
      <Modal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        title="Terms of service"
        maxWidth="lg"
        actions={
          <>
            <button type="button" onClick={() => setTermsOpen(false)} className={btnGhost}>
              Cancel
            </button>
            {termsPolicy ? (
              <button
                type="button"
                className={
                  !isPolicyDirty(termsContent, termsPolicy?.termsPolicy) ? btnPrimaryMuted : btnPrimary
                }
                disabled={!isPolicyDirty(termsContent, termsPolicy?.termsPolicy)}
                onClick={async () => {
                  if (!termsPolicy?._id) return;
                  await updateTermsPolicy(termsPolicy._id, {
                    termsPolicy: normalizePolicyContentForSave(termsContent),
                  });
                  setTermsOpen(false);
                }}
              >
                Update
              </button>
            ) : (
              <button
                type="button"
                className={isRichTextContentEmpty(termsContent) || !activeStoreId ? btnPrimaryMuted : btnPrimary}
                disabled={isRichTextContentEmpty(termsContent) || !activeStoreId}
                onClick={async () => {
                  if (!activeStoreId) return;
                  await createTermsPolicy({
                    storeId: activeStoreId,
                    termsPolicy: normalizePolicyContentForSave(termsContent),
                  });
                  setTermsOpen(false);
                }}
              >
                Publish
              </button>
            )}
          </>
        }
      >
        <div className={modalNoticeBox}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <p className="text-sm leading-relaxed text-admin-text-secondary">
              Templates aren&apos;t legal advice. By using policy templates, you agree that you&apos;ve read and agree to the{' '}
              <button
                type="button"
                className={modalLinkClass}
                onClick={() => setShowTermsDisclaimer((v) => !v)}
              >
                disclaimer {showTermsDisclaimer ? '▾' : '▸'}
              </button>
            </p>
            <button type="button" className={`${btnTemplate} shrink-0`} onClick={handleTermsTemplate}>
              Insert template
            </button>
          </div>
          {showTermsDisclaimer && (
            <div className={modalDisclaimerBox}>
              <h3 className="mb-2 text-xs font-semibold text-admin-text">Generated policies disclaimer</h3>
              <p className="mb-2 text-xs leading-relaxed">
                The materials below are for informational purposes only and do not constitute advertising, a solicitation or legal advice. Automated translations from the original English versions are available for convenience only.
              </p>
              <p className="mb-2 text-xs leading-relaxed">
                You should consult independent legal advice in all regions where these materials will be used before publishing them. You are solely responsible for verifying the accuracy of all content, including any translated content, and should read the generated information with care and modify, delete or add all and any areas as necessary. Use of, access to or transmission of such materials and information or any of the links contained herein is not intended to create, and receipt thereof does not constitute formation of, an attorney-client relationship between codiic and the user or browser.
              </p>
              <p className="text-xs leading-relaxed">
                Further, codiic does not necessarily endorse and is not responsible for any third‑party content that may be accessed through this information.
              </p>
            </div>
          )}
        </div>
        <PolicyModalEditor
          value={termsContent}
          onChange={setTermsContent}
          placeholder="Add your terms of service..."
        />
      </Modal>

      {/* Shipping policy modal */}
      <Modal
        open={shippingOpen}
        onClose={() => setShippingOpen(false)}
        title="Shipping policy"
        maxWidth="lg"
        actions={
          <>
            <button type="button" onClick={() => setShippingOpen(false)} className={btnGhost}>
              Cancel
            </button>
            {policy ? (
              <button
                type="button"
                className={
                  !isPolicyDirty(shippingContent, policy?.shippingPolicy) ? btnPrimaryMuted : btnPrimary
                }
                disabled={!isPolicyDirty(shippingContent, policy?.shippingPolicy)}
                onClick={async () => {
                  if (!policy?._id) return;
                  await updatePolicy(policy._id, {
                    shippingPolicy: normalizePolicyContentForSave(shippingContent),
                  });
                  setShippingOpen(false);
                }}
              >
                Update
              </button>
            ) : (
              <button
                type="button"
                className={isRichTextContentEmpty(shippingContent) || !activeStoreId ? btnPrimaryMuted : btnPrimary}
                disabled={isRichTextContentEmpty(shippingContent) || !activeStoreId}
                onClick={async () => {
                  if (!activeStoreId) return;
                  await createPolicy({
                    storeId: activeStoreId,
                    shippingPolicy: normalizePolicyContentForSave(shippingContent),
                  });
                  setShippingOpen(false);
                }}
              >
                Publish
              </button>
            )}
          </>
        }
      >
        <div className={modalNoticeBox}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <p className="text-sm leading-relaxed text-admin-text-secondary">
              Templates aren&apos;t legal advice. By using policy templates, you agree that you&apos;ve read and agree to the{' '}
              <button
                type="button"
                className={modalLinkClass}
                onClick={() => setShowShippingDisclaimer((v) => !v)}
              >
                disclaimer {showShippingDisclaimer ? '▾' : '▸'}
              </button>
            </p>
            <button type="button" className={`${btnTemplate} shrink-0`} onClick={handleShippingTemplate}>
              Insert template
            </button>
          </div>
          {showShippingDisclaimer && (
            <div className={modalDisclaimerBox}>
              <h3 className="mb-2 text-xs font-semibold text-admin-text">Generated policies disclaimer</h3>
              <p className="text-xs leading-relaxed">
                The materials below are for informational purposes only and do not constitute advertising, a solicitation or legal advice. Automated translations from the original English versions are available for convenience only.
              </p>
            </div>
          )}
        </div>
        <p className="mb-4 text-sm leading-relaxed text-admin-text-secondary">
          Describe processing times, carriers, and regions you ship to. Customers see this in your store footer and checkout.
        </p>
        <PolicyModalEditor
          value={shippingContent}
          onChange={setShippingContent}
          placeholder="Add your shipping policy..."
        />
      </Modal>

      {/* Privacy policy modal */}
      <Modal
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        title="Privacy policy"
        maxWidth="lg"
        actions={
          <>
            <button type="button" onClick={() => setPrivacyOpen(false)} className={btnGhost}>
              Cancel
            </button>
            {privacyPolicy ? (
              <button
                type="button"
                className={
                  !isPolicyDirty(privacyContent, privacyPolicy?.privacyPolicy) ? btnPrimaryMuted : btnPrimary
                }
                disabled={!isPolicyDirty(privacyContent, privacyPolicy?.privacyPolicy)}
                onClick={async () => {
                  if (!privacyPolicy?._id) return;
                  await updatePrivacyPolicy(privacyPolicy._id, {
                    privacyPolicy: normalizePolicyContentForSave(privacyContent),
                  });
                  setPrivacyOpen(false);
                }}
              >
                Update
              </button>
            ) : (
              <button
                type="button"
                className={isRichTextContentEmpty(privacyContent) || !activeStoreId ? btnPrimaryMuted : btnPrimary}
                disabled={isRichTextContentEmpty(privacyContent) || !activeStoreId}
                onClick={async () => {
                  if (!activeStoreId) return;
                  await createPrivacyPolicy({
                    storeId: activeStoreId,
                    privacyPolicy: normalizePolicyContentForSave(privacyContent),
                  });
                  setPrivacyOpen(false);
                }}
              >
                Publish
              </button>
            )}
          </>
        }
      >
        <div className={modalNoticeBox}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <p className="text-sm leading-relaxed text-admin-text-secondary">
              Templates aren&apos;t legal advice. By using policy templates, you agree that you&apos;ve read and agree to the{' '}
              <button
                type="button"
                className={modalLinkClass}
                onClick={() => setShowPrivacyDisclaimer((v) => !v)}
              >
                disclaimer {showPrivacyDisclaimer ? '▾' : '▸'}
              </button>
            </p>
            <button type="button" className={`${btnTemplate} shrink-0`} onClick={handlePrivacyTemplate}>
              Insert template
            </button>
          </div>
          {showPrivacyDisclaimer && (
            <div className={modalDisclaimerBox}>
              <h3 className="mb-2 text-xs font-semibold text-admin-text">Generated policies disclaimer</h3>
              <p className="mb-2 text-xs leading-relaxed">
                The materials below are for informational purposes only and do not constitute advertising, a solicitation or legal advice. Automated translations from the original English versions are available for convenience only.
              </p>
              <p className="text-xs leading-relaxed">
                You should consult independent legal advice in all regions where these materials will be used before publishing them. You are solely responsible for verifying the accuracy of all content, including any translated content, and should read the generated information with care and modify, delete or add all and any areas as necessary.
              </p>
            </div>
          )}
        </div>
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-admin-border bg-admin-surface p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-admin-text">Use automated policy</p>
            <p className="mt-0.5 text-xs leading-relaxed text-admin-text-secondary">
              Keep policy content in sync with store settings and latest templates.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={privacyAutomated}
            className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30 ${
              privacyAutomated ? 'bg-admin-text' : 'bg-admin-fill'
            }`}
            onClick={() => setPrivacyAutomated(!privacyAutomated)}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                privacyAutomated ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        <div className="mb-4">
          <PolicyModalEditor
            value={privacyContent}
            onChange={setPrivacyContent}
            placeholder="Add your privacy policy..."
          />
        </div>
      </Modal>
      </div>
    </div>
  );
};

export default PoliciesSettings;