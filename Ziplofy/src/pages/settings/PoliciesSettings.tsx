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
import TextEditorToolbar from '../../components/TextEditorToolbar';
import { useReturnRules } from '../../contexts/return-rules.context';
import { useStoreContactInfo } from '../../contexts/store-contact-info.context';
import { useStorePrivacyPolicy } from '../../contexts/store-privacy-policy.context';
import { useStoreReturnRefundPolicy } from '../../contexts/store-return-refund-policy.context';
import { useStoreShippingPolicy } from '../../contexts/store-shipping-policy.context';
import { useStoreTermsPolicy } from '../../contexts/store-terms-policy.context';
import { useStore } from '../../contexts/store.context';
import { useUserContext } from '../../contexts/user.context';
import { SettingsHero } from '../../components/settings/SettingsPageScaffold';

/** Shared modal chrome — policies editors */
const modalNoticeBox = 'mb-4 rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm';
const modalDisclaimerBox =
  'mt-3 rounded-lg border border-slate-200/80 bg-slate-50/90 p-3 text-slate-600';
const modalEditorShell = 'overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm';
const modalTextarea =
  'w-full min-h-[200px] resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';
const modalTextareaTall =
  'w-full min-h-[280px] resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';
const btnGhost =
  'inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50';
const btnPrimary =
  'inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600';
const btnPrimaryMuted =
  'inline-flex cursor-not-allowed items-center justify-center rounded-lg bg-slate-300 px-4 py-2 text-sm font-semibold text-white';
const btnTemplate =
  'inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50';

const PoliciesSettings: React.FC = () => {
  const navigate = useNavigate();
  const { rules, getByStoreId, loading } = useReturnRules();
  const { stores, activeStoreId } = useStore();
  const { loggedInUser } = useUserContext();
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
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnContent, setReturnContent] = useState('');
  const [showReturnDisclaimer, setShowReturnDisclaimer] = useState(false);

  useEffect(() => {
    if (activeStoreId) getByStoreId(activeStoreId);
    if (activeStoreId) getContactByStoreId(activeStoreId);
    if (activeStoreId) getShippingByStoreId(activeStoreId);
    if (activeStoreId) getTermsByStoreId(activeStoreId);
    if (activeStoreId) getPrivacyByStoreId(activeStoreId);
    if (activeStoreId) getReturnRefundByStoreId(activeStoreId);
  }, [
    activeStoreId,
    getByStoreId,
    getContactByStoreId,
    getShippingByStoreId,
    getTermsByStoreId,
    getPrivacyByStoreId,
    getReturnRefundByStoreId,
  ]);

  const handleReturnTemplate = useCallback(() => {
    const template = `We have a 30-day return policy, which means you have 30 days after receiving your item to request a return.\n\nTo be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You'll also need the receipt or proof of purchase.\n\nTo start a return, you can contact us at developer200419@gmail.com. Please note that returns will need to be sent to the following address: [INSERT RETURN ADDRESS]\n\nIf your return is accepted, we'll send you a return shipping label, as well as instructions on how and where to send your package. Items sent back to us without first requesting a return will not be accepted.\n\nYou can always contact us for any return question at developer200419@gmail.com.\n\n\n\n\nDamages and issues\nPlease inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.\n\n\n\n\nExceptions / non-returnable items\nCertain types of items cannot be returned, like perishable goods (such as food, flowers, or plants), custom products (such as special orders or personalized items), and personal care goods (such as beauty products). We also do not accept returns for hazardous materials, flammable liquids, or gases. Please get in touch if you have questions or concerns about your specific item.\n\nUnfortunately, we cannot accept returns on sale items or gift cards.\n\n\n\n\nExchanges\nThe fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.\n\n\n\n\nEuropean Union 14 day cooling off period\nNotwithstanding the above, if the merchandise is being shipped into the European Union, you have the right to cancel or return your order within 14 days, for any reason and without a justification. As above, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You'll also need the receipt or proof of purchase.\n\n\n\n\nRefunds\nWe will notify you once we've received and inspected your return, and let you know if the refund was approved or not. If approved, you'll be automatically refunded on your original payment method within 10 business days. Please remember it can take some time for your bank or credit card company to process and post the refund too.\nIf more than 15 business days have passed since we've approved your return, please contact us at developer200419@gmail.com.`;
    setReturnContent(template);
  }, []);

  const handleContactTemplate = useCallback(() => {
    const storeName = stores.find((s) => s._id === activeStoreId)?.storeName || 'My Store';
    const email = loggedInUser?.email || '';
    const template = `Trade name: ${storeName}\n\nPhone number:\n\nEmail: ${email}\n\nPhysical address: legal name man, demo address, demo apartment, 201012 helo world city UP, India\n\nVAT number:\n\nTrade number:`;
    setContactContent(template);
  }, [stores, activeStoreId, loggedInUser]);

  const handleTermsTemplate = useCallback(() => {
    const storeName = stores.find((s) => s._id === activeStoreId)?.storeName || 'My Store';
    const email = loggedInUser?.email || 'support@example.com';
    const welcomeText = `Welcome to ${storeName}! The terms "we", "us" and "our" refer to ${storeName}. ${storeName} operates this store and website, including all related information, content, features, tools, products and services in order to provide you, the customer, with a curated shopping experience (the "Services"). ${storeName} is powered by Ziplofy, which enables us to provide the Services to you.`;
    const template = `OVERVIEW\n${welcomeText}\nThe below terms and conditions, together with any policies referenced herein (these "Terms of Service" or "Terms") describe your rights and responsibilities when you use the Services.\nPlease read these Terms of Service carefully, as they include important information about your legal rights and cover areas such as warranty disclaimers and limitations of liability.\nBy visiting, interacting with or using our Services, you agree to be bound by these Terms of Service and our Privacy Policy [LINK]. If you do not agree to these Terms of Service or Privacy Policy, you should not use or access our Services.\n\nSECTION 1 - ACCESS AND ACCOUNT\nBy agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, and you have given us your consent to allow any of your minor dependents to use the Services on devices you own, purchase or manage.\nTo use the Services, including accessing or browsing our online stores or purchasing any of the products or services we offer, you may be asked to provide certain information, such as your email address, billing, payment, and shipping information. You represent and warrant that all the information you provide in our stores is correct, current and complete and that you have all rights necessary to provide this information.\nYou are solely responsible for maintaining the security of your account credentials and for all of your account activity. You may not transfer, sell, assign, or license your account to any other person.\n\nSECTION 2 - OUR PRODUCTS\nWe have made every effort to provide an accurate representation of our products and services in our online stores. However, please note that colors or product appearance may differ from how they may appear on your screen due to the type of device you use to access the store and your device settings and configuration.\nWe do not warrant that the appearance or quality of any products or services purchased by you will meet your expectations or be the same as depicted or rendered in our online stores.\nAll descriptions of products are subject to change at any time without notice at our sole discretion. We reserve the right to discontinue any product at any time and may limit the quantities of any products that we offer to any person, geographic region or jurisdiction, on a case-by-case basis.\n\nSECTION 3 - ORDERS\nWhen you place an order, you are making an offer to purchase. ${storeName} reserves the right to accept or decline your order for any reason at its discretion. Your order is not accepted until ${storeName} confirms acceptance. We must receive and process your payment before your order is accepted. Please review your order carefully before submitting, as ${storeName} may be unable to accommodate cancellation requests after an order is accepted. In the event that we do not accept, make a change to, or cancel an order, we will attempt to notify you by contacting the e‑mail, billing address, and/or phone number provided at the time the order was made.\nYour purchases are subject to return or exchange solely in accordance with our Refund Policy [LINK].\nYou represent and warrant that your purchases are for your own personal or household use and not for commercial resale or export.\n\nSECTION 4 - PRICES AND BILLING\nPrices, discounts and promotions are subject to change without notice. The price charged for a product or service will be the price in effect at the time the order is placed and will be set out in your order confirmation email. Unless otherwise expressly stated, posted prices do not include taxes, shipping, handling, customs or import charges.\nPrices posted in our online stores may be different from prices offered in physical stores or in online or other stores operated by third parties. We may offer, from time to time, promotions on the Services that may affect pricing and that are governed by terms and conditions separate from these Terms. If there is a conflict between the terms for a promotion and these Terms, the promotion terms will govern.\nYou agree to provide current, complete and accurate purchase, payment and account information for all purchases made at our stores. You agree to promptly update your account and other information, including your email address, credit card numbers and expiration dates, so that we can complete your transactions and contact you as needed.\nYou represent and warrant that (i) the credit card information you provide is true, correct, and complete, (ii) you are duly authorized to use such credit card for the purchase, (iii) charges incurred by you will be honored by your credit card company, and (iv) you will pay charges incurred by you at the posted prices, including shipping and handling charges and all applicable taxes, if any.\n\nSECTION 5 - SHIPPING AND DELIVERY\nWe are not liable for shipping and delivery delays. All delivery times are estimates only and are not guaranteed. We are not responsible for delays caused by shipping carriers, customs processing, or events outside our control. Once we transfer products to the carrier, title and risk of loss passes to you.\n\nSECTION 6 - INTELLECTUAL PROPERTY\nOur Services, including but not limited to all trademarks, brands, text, displays, images, graphics, product reviews, video, and audio, and the design, selection, and arrangement thereof, are owned by ${storeName}, its affiliates or licensors and are protected by U.S. and foreign patent, copyright and other intellectual property laws.\nThese Terms permit you to use the Services for your personal, non-commercial use only. You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on the Services without our prior written consent. Except as expressly provided herein, nothing in these Terms grants or shall be construed as granting a license or other rights to you under any patent, trademark, copyright, or other intellectual property of ${storeName}, Ziplofy or any third party. Unauthorized use of the Services may be a violation of federal and state intellectual property laws. All rights not expressly granted herein are reserved by ${storeName}.\n${storeName}'s names, logos, product and service names, designs, and slogans are trademarks of ${storeName} or its affiliates or licensors. You must not use such trademarks without the prior written permission of ${storeName}. Ziplofy's name, logo, product and service names, designs and slogans are trademarks of Ziplofy. All other names, logos, product and service names, designs, and slogans on the Services are the trademarks of their respective owners.\n\nSECTION 7 - OPTIONAL TOOLS\nYou may be provided with access to customer tools offered by third parties as part of the Services, which we neither monitor nor have any control nor input.\nYou acknowledge and agree that we provide access to such tools "as is" and "as available" without any warranties, representations or conditions of any kind and without any endorsement. We shall have no liability whatsoever arising from or relating to your use of optional third-party tools.\nAny use by you of the optional tools offered through the site is entirely at your own risk and discretion and you should ensure that you are familiar with and approve of the terms on which tools are provided by the relevant third-party provider(s).\nWe may also, in the future, offer new features through the Services (including the release of new tools and resources). Such new features shall also be deemed part of the Services and are subject to these Terms of Service.\n\nSECTION 8 - THIRD-PARTY LINKS\nThe Services may contain materials and hyperlinks to websites provided or operated by third parties (including any embedded third party functionality). We are not responsible for examining or evaluating the content or accuracy of any third-party materials or websites you choose to access. If you decide to leave the Services to access these materials or third party sites, you do so at your own risk.\nWe are not liable for any harm or damages related to your access of any third-party websites, or your purchase or use of any products, services, resources, or content on any third-party websites. Please review carefully the third-party's policies and practices and make sure you understand them before you engage in any transaction. Complaints, claims, concerns, or questions regarding third-party products and services should be directed to the third-party.\n\nSECTION 9 - RELATIONSHIP WITH ZIPLOFY\n[NOTE TO MERCHANT: This section accurately characterizes Ziplofy's relationship with your store and should not be removed or modified.]\n${storeName} is powered by Ziplofy, which enables us to provide the Services to you. However, any sales and purchases you make in our Store are made directly with ${storeName}. By using the Services, you acknowledge and agree that Ziplofy is not responsible for any aspect of any sales between you and ${storeName}, including any injury, damage, or loss resulting from purchased products and services. You hereby expressly release Ziplofy and its affiliates from all claims, damages, and liabilities arising from or related to your purchases and transactions with ${storeName}.\n\nSECTION 10 - PRIVACY POLICY\nAll personal information we collect through the Services is subject to our Privacy Policy, which can be viewed here [LINK], and certain personal information may be subject to Ziplofy's Privacy Policy, which can be viewed here. By using the Services, you acknowledge that you have read these privacy policies.\nBecause the Services are hosted by Ziplofy, Ziplofy collects and processes personal information about your access to and use of the Services in order to provide and improve the Services for you. Information you submit to the Services will be transmitted to and shared with Ziplofy as well as third parties that may be located in other countries than where you reside, in order to provide services to you. Review our privacy policy [LINK] for more details on how we, Ziplofy, and our partners use your personal information.\n\nSECTION 11 - FEEDBACK\nIf you submit, upload, post, email, or otherwise transmit any ideas, suggestions, feedback, reviews, proposals, plans, or other content (collectively, "Feedback"), you grant us a perpetual, worldwide, sublicensable, royalty-free license to use, reproduce, modify, publish, distribute and display such Feedback in any medium for any purpose, including for commercial use. We may, for example, use our rights under this license to operate, provide, evaluate, enhance, improve and promote the Services and to perform our obligations and exercise our rights under the Terms of Service.\nYou also represent and warrant that: (i) you own or have all necessary rights to all Feedback; (ii) you have disclosed any compensation or incentives received in connection with your submission of Feedback; and (iii) your Feedback will comply with these Terms. We are and shall be under no obligation (1) to maintain your Feedback in confidence; (2) to pay compensation for your Feedback; or (3) to respond to your Feedback.\nWe may, but have no obligation to, monitor, edit or remove Feedback that we determine in our sole discretion to be unlawful, offensive, threatening, libelous, defamatory, pornographic, obscene or otherwise objectionable or violates any party's intellectual property or these Terms of Service.\nYou agree that your Feedback will not violate any right of any third-party, including copyright, trademark, privacy, personality or other personal or proprietary right. You further agree that your Feedback will not contain libelous or otherwise unlawful, abusive or obscene Feedback, or contain any computer virus or other malware that could in any way affect the operation of the Services or any related website. You may not use a false email address, pretend to be someone other than yourself, or otherwise mislead us or third-parties as to the origin of any Feedback. You are solely responsible for any Feedback you make and its accuracy. We take no responsibility and assume no liability for any Feedback posted by you or any third-party.\n\nSECTION 12 - ERRORS, INACCURACIES AND OMISSIONS\nOccasionally there may be information on or in the Services that contain typographical errors, inaccuracies or omissions that may relate to product descriptions, pricing, promotions, offers, product shipping charges, transit times and availability. We reserve the right to correct any errors, inaccuracies or omissions, and to change or update information or cancel orders if any information is inaccurate at any time without prior notice (including after you have submitted your order).\n\nSECTION 13 - PROHIBITED USES\nYou may access and use the Services for lawful purposes only. You may not access or use the Services, directly or indirectly: (a) for any unlawful or malicious purpose; (b) to violate any international, federal, provincial or state regulations, rules, laws, or local ordinances; (c) to infringe upon or violate our intellectual property rights or the intellectual property rights of others; (d) to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or harm any of our employees or any other person; (e) to transmit false or misleading information; (f) to send, knowingly receive, upload, download, use, or re-use any material that does not comply with the these Terms; (g) to transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation; (h) to impersonate or attempt to impersonate any other person or entity; or (i) to engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Services, or which, as determined by us, may harm ${storeName}, Ziplofy or users of the Services, or expose them to liability.\nIn addition, you agree not to: (a) upload or transmit viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the Services; (b) reproduce, duplicate, copy, sell, resell or exploit any portion of the Services; (c) collect or track the personal information of others; (d) spam, phish, pharm, pretext, spider, crawl, or scrape; or (e) interfere with or circumvent the security features of the Services or any related website, other websites, or the Internet. We reserve the right to suspend, disable, or terminate your account at any time, without notice, if we determine that you have violated any part of these Terms.\n\nSECTION 14 - TERMINATION\nWe may terminate this agreement or your access to the Services (or any part thereof) in our sole discretion at any time without notice, and you will remain liable for all amounts due up to and including the date of termination.\nThe following sections will continue to apply following any termination: Intellectual Property, Feedback, Termination, Disclaimer of Warranties, Limitation of Liability, Indemnification, Severability, Waiver; Entire Agreement, Assignment, Governing Law, Privacy Policy, and any other provisions that by their nature should survive termination.\n\nSECTION 15 - DISCLAIMER OF WARRANTIES\nThe information presented on or through the Services is made available solely for general information purposes. We do not warrant the accuracy, completeness, or usefulness of this information. Any reliance you place on such information is strictly at your own risk. We disclaim all liability and responsibility arising from any reliance placed on such materials by you or any other visitor to the Services, or by anyone who may be informed of any of its contents.\nEXCEPT AS EXPRESSLY STATED BY ${storeName}, THE SERVICES AND ALL PRODUCTS OFFERED THROUGH THE SERVICES ARE PROVIDED 'AS IS' AND 'AS AVAILABLE' FOR YOUR USE, WITHOUT ANY REPRESENTATION, WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ALL IMPLIED WARRANTIES OR CONDITIONS OF MERCHANTABILITY, MERCHANTABLE QUALITY, FITNESS FOR A PARTICULAR PURPOSE, DURABILITY, TITLE, AND NON-INFRINGEMENT. WE DO NOT GUARANTEE, REPRESENT OR WARRANT THAT YOUR USE OF THE SERVICES WILL BE UNINTERRUPTED, TIMELY, SECURE OR ERROR-FREE. SOME JURISDICTIONS LIMIT OR DO NOT ALLOW THE DISCLAIMER OF IMPLIED OR OTHER WARRANTIES SO THE ABOVE DISCLAIMER MAY NOT APPLY TO YOU.\n\nSECTION 16 - LIMITATION OF LIABILITY\nTO THE FULLEST EXTENT PROVIDED BY LAW, IN NO CASE SHALL ${storeName}, OUR PARTNERS, DIRECTORS, OFFICERS, EMPLOYEES, AFFILIATES, AGENTS, CONTRACTORS, SERVICE PROVIDERS OR LICENSORS, OR THOSE OF ZIPLOFY AND ITS AFFILIATES, BE LIABLE FOR ANY INJURY, LOSS, CLAIM, OR ANY DIRECT, INDIRECT, INCIDENTAL, PUNITIVE, SPECIAL, OR CONSEQUENTIAL DAMAGES OF ANY KIND, INCLUDING, WITHOUT LIMITATION, LOST PROFITS, LOST REVENUE, LOST SAVINGS, LOSS OF DATA, REPLACEMENT COSTS, OR ANY SIMILAR DAMAGES, WHETHER BASED IN CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY OR OTHERWISE, ARISING FROM YOUR USE OF ANY OF THE SERVICES OR ANY PRODUCTS PROCURED USING THE SERVICES, OR FOR ANY OTHER CLAIM RELATED IN ANY WAY TO YOUR USE OF THE SERVICES OR ANY PRODUCT, INCLUDING, BUT NOT LIMITED TO, ANY ERRORS OR OMISSIONS IN ANY CONTENT, OR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF THE SERVICES OR ANY CONTENT (OR PRODUCT) POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SERVICES, EVEN IF ADVISED OF THEIR POSSIBILITY.\n\nSECTION 17 - INDEMNIFICATION\nYou agree to indemnify, defend and hold harmless ${storeName}, Ziplofy, and our affiliates, partners, officers, directors, employees, agents, contractors, licensors, and service providers from any losses, damages, liabilities or claims, including reasonable attorneys' fees, payable to any third party due to or arising out of (1) your breach of these Terms of Service or the documents they incorporate by reference, (2) your violation of any law or the rights of a third party, or (3) your access to and use of the Services.\nWe will notify you of any indemnifiable claim, provided that a failure to promptly notify will not relieve you of your obligations unless you are materially prejudiced. We may control the defense and settlement of such claim at your expense, including choice of counsel, but will not settle any claim requiring non-monetary obligations from you without your consent (not to be unreasonably withheld). You will cooperate in the defense of indemnified claims, including by providing relevant documents.\n\nSECTION 18 - SEVERABILITY\nIn the event that any provision of these Terms of Service is determined to be unlawful, void or unenforceable, such provision shall nonetheless be enforceable to the fullest extent permitted by applicable law, and the unenforceable portion shall be deemed to be severed from these Terms of Service, such determination shall not affect the validity and enforceability of any other remaining provisions.\n\nSECTION 19 - WAIVER; ENTIRE AGREEMENT\nThe failure of us to exercise or enforce any right or provision of these Terms of Service shall not constitute a waiver of such right or provision.\nThese Terms of Service and any policies or operating rules posted by us on this site or in respect to the Service constitutes the entire agreement and understanding between you and us and governs your use of the Service, superseding any prior or contemporaneous agreements, communications and proposals, whether oral or written, between you and us (including, but not limited to, any prior versions of the Terms of Service).\nAny ambiguities in the interpretation of these Terms of Service shall not be construed against the drafting party.\n\nSECTION 20 - ASSIGNMENT\nYou may not delegate, transfer or assign this Agreement or any of your rights or obligations under these Terms without our prior written consent, and any such attempt will be null and void. We may transfer, assign, or delegate these Terms and our rights and obligations without consent or notice to you.\n\nSECTION 21 - GOVERNING LAW\nThese Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the federal and state or territorial courts in the jurisdiction where ${storeName} is headquartered. You and ${storeName} consent to venue and personal jurisdiction in such courts.\n\nSECTION 22 - HEADINGS\nThe headings used in this agreement are included for convenience only and will not limit or otherwise affect these Terms.\n\nSECTION 23 - CHANGES TO TERMS OF SERVICE\nYou can review the most current version of the Terms of Service at any time on this page.\nWe reserve the right, in our sole discretion, to update, change, or replace any part of these Terms of Service by posting updates and changes to our website. It is your responsibility to check our website periodically for changes. We will notify you of any material changes to these Terms in accordance with applicable law, and such changes will be effective on the date specified in the notice. Your continued use of or access to the Services following the posting of any changes to these Terms of Service constitutes acceptance of those changes.\n\nSECTION 24 - CONTACT INFORMATION\nQuestions about the Terms of Service should be sent to us at ${email}.\nOur contact information is posted below:\n[INSERT TRADING NAME]\n${email}\n[INSERT BUSINESS ADDRESS]\n[INSERT BUSINESS PHONE NUMBER]\n[INSERT BUSINESS REGISTRATION NUMBER]\n[INSERT VAT NUMBER]`;
    setTermsContent(template);
  }, [stores, activeStoreId, loggedInUser]);

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title="Policies"
          description="Manage return rules and the policies shown in checkout and your store footer."
        />

      {/* Return rules */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">Return rules</h2>
            {rules && (
              <>
                <span
                  className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium mr-2 ${
                    rules.enabled
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {rules.enabled ? 'On' : 'Off'}
                </span>
                <p className="text-sm text-gray-500 mt-2">
                  Enable return rules to simplify return management, set up return fees, return shipping and define final sale items
                </p>
              </>
            )}
          </div>
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
            onClick={() => navigate(rules ? '/settings/policies/manage-return-rules' : '/settings/policies/manage-return-rules/new')}
          >
            {rules ? 'Manage' : 'Create rule'}
          </button>
        </div>
      </div>

      {/* Written policies */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm mb-6 overflow-hidden">
        <div className="p-5 pb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Written policies</h2>
            <p className="text-sm text-gray-500 mt-1">
              Policies are linked in the footer of checkout and can be added to your online store menu
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors border border-gray-200 bg-white"
            aria-label="More actions"
          >
            <EllipsisHorizontalIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="border-t border-gray-200">
          <PoliciesRow
            icon={<ArrowPathIcon className="w-4 h-4" />}
            label="Return and refund policy"
            right={
              !returnRefundPolicy ? (
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">No policy set</span>
              ) : undefined
            }
            onClick={() => {
              setReturnContent(returnRefundPolicy?.returnRefundPolicy || '');
              setReturnOpen(true);
            }}
          />
          <div className="border-t border-gray-200" />
          <PoliciesRow
            icon={<LockClosedIcon className="w-4 h-4" />}
            label="Privacy policy"
            right={
              !privacyPolicy ? (
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">No policy set</span>
              ) : undefined
            }
            onClick={() => {
              setPrivacyContent(privacyPolicy?.privacyPolicy || '');
              setPrivacyOpen(true);
            }}
          />
          <div className="border-t border-gray-200" />
          <PoliciesRow
            icon={<ScaleIcon className="w-4 h-4" />}
            label="Terms of service"
            right={
              !termsPolicy ? (
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">No policy set</span>
              ) : undefined
            }
            onClick={() => {
              setTermsContent(termsPolicy?.termsPolicy || '');
              setTermsOpen(true);
            }}
          />
          <div className="border-t border-gray-200" />
          <PoliciesRow
            icon={<TruckIcon className="w-4 h-4" />}
            label="Shipping policy"
            right={
              !policy ? (
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">No policy set</span>
              ) : undefined
            }
            onClick={() => {
              setShippingContent(policy?.shippingPolicy || '');
              setShippingOpen(true);
            }}
          />
          <div className="border-t border-gray-200" />
          <PoliciesRow
            icon={<IdentificationIcon className="w-4 h-4" />}
            label="Contact information"
            right={
              !info ? (
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">Required</span>
              ) : undefined
            }
            onClick={() => {
              setContactContent(info?.contactInfo || '');
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
                  !returnContent.trim() || returnContent === (returnRefundPolicy?.returnRefundPolicy || '')
                    ? btnPrimaryMuted
                    : btnPrimary
                }
                disabled={!returnContent.trim() || returnContent === (returnRefundPolicy?.returnRefundPolicy || '')}
                onClick={async () => {
                  if (!returnRefundPolicy?._id) return;
                  await updateReturnRefundPolicy(returnRefundPolicy._id, { returnRefundPolicy: returnContent });
                  setReturnOpen(false);
                }}
              >
                Update
              </button>
            ) : (
              <button
                type="button"
                className={!returnContent.trim() || !activeStoreId ? btnPrimaryMuted : btnPrimary}
                disabled={!returnContent.trim() || !activeStoreId}
                onClick={async () => {
                  if (!activeStoreId) return;
                  await createReturnRefundPolicy({ storeId: activeStoreId, returnRefundPolicy: returnContent });
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
            <p className="text-sm leading-relaxed text-slate-600">
              Templates aren&apos;t legal advice. By using policy templates, you agree that you&apos;ve read and agree to the{' '}
              <button
                type="button"
                className="font-medium text-blue-600 underline decoration-blue-600/30 underline-offset-2 hover:text-blue-700"
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
              <h3 className="mb-2 text-xs font-semibold text-slate-900">Generated policies disclaimer</h3>
              <p className="text-xs leading-relaxed">
                The materials below are for informational purposes only and do not constitute advertising, a solicitation or legal advice. Automated translations from the original English versions are available for convenience only.
              </p>
            </div>
          )}
        </div>
        <div className={modalEditorShell}>
          <TextEditorToolbar />
          <div className="border-t border-slate-100 p-4">
            <textarea
              className={modalTextarea}
              placeholder="Add your return and refund policy..."
              value={returnContent}
              onChange={(e) => setReturnContent(e.target.value)}
              rows={8}
            />
          </div>
        </div>
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
                  !contactContent.trim() || contactContent === (info?.contactInfo || '')
                    ? btnPrimaryMuted
                    : btnPrimary
                }
                disabled={!contactContent.trim() || contactContent === (info?.contactInfo || '')}
                onClick={async () => {
                  if (!info?._id) return;
                  await updateInfo(info._id, { contactInfo: contactContent });
                  setContactOpen(false);
                }}
              >
                Update
              </button>
            ) : (
              <button
                type="button"
                className={!contactContent.trim() || !activeStoreId ? btnPrimaryMuted : btnPrimary}
                disabled={!contactContent.trim() || !activeStoreId}
                onClick={async () => {
                  if (!activeStoreId) return;
                  await createInfo({ storeId: activeStoreId, contactInfo: contactContent });
                  setContactOpen(false);
                }}
              >
                Publish
              </button>
            )}
          </>
        }
      >
        <p className="mb-4 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-sm text-slate-600">
          Contact information is required on your website if you are selling into the European Union.
        </p>
        <div className={modalNoticeBox}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <p className="text-sm leading-relaxed text-slate-600">
              Templates aren&apos;t legal advice. By using policy templates, you agree that you&apos;ve read and agree to the{' '}
              <button
                type="button"
                className="font-medium text-blue-600 underline decoration-blue-600/30 underline-offset-2 hover:text-blue-700"
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
              <h3 className="mb-2 text-xs font-semibold text-slate-900">Generated policies disclaimer</h3>
              <p className="mb-2 text-xs leading-relaxed">
                The materials below are for informational purposes only and do not constitute advertising, a solicitation or legal advice. Automated translations from the original English versions are available for convenience only.
              </p>
              <p className="mb-2 text-xs leading-relaxed">
                You should consult independent legal advice in all regions where these materials will be used before publishing them. You are solely responsible for verifying the accuracy of all content, including any translated content, and should read the generated information with care and modify, delete or add all and any areas as necessary. Use of, access to or transmission of such materials and information or any of the links contained herein is not intended to create, and receipt thereof does not constitute formation of, an attorney-client relationship between Ziplofy and the user or browser.
              </p>
              <p className="mb-2 text-xs leading-relaxed">
                You should not rely upon this information for any purpose without seeking legal advice from a licensed attorney in the relevant regions. The information contained is provided only as general information and may or may not reflect the most current legal developments or an accurate translation; accordingly, information is not promised or guaranteed to be correct or complete. Ziplofy expressly disclaims all liability in respect of any actions taken or not taken based on any or all of the contents of this website, or any inaccuracies in any of the content.
              </p>
              <p className="text-xs leading-relaxed">
                Further, Ziplofy does not necessarily endorse and is not responsible for any third‑party content that may be accessed through this information.
              </p>
            </div>
          )}
        </div>
        <div className={`${modalEditorShell} mb-4`}>
          <TextEditorToolbar />
          <div className="border-t border-slate-100 p-4">
            <textarea
              className={modalTextarea}
              placeholder="Add your contact information..."
              value={contactContent}
              onChange={(e) => setContactContent(e.target.value)}
              rows={8}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
            S
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-900">Ziplofy Inbox</p>
            <p className="text-xs text-slate-500">4.7 ★</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
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
                  !termsContent.trim() || termsContent === (termsPolicy?.termsPolicy || '')
                    ? btnPrimaryMuted
                    : btnPrimary
                }
                disabled={!termsContent.trim() || termsContent === (termsPolicy?.termsPolicy || '')}
                onClick={async () => {
                  if (!termsPolicy?._id) return;
                  await updateTermsPolicy(termsPolicy._id, { termsPolicy: termsContent });
                  setTermsOpen(false);
                }}
              >
                Update
              </button>
            ) : (
              <button
                type="button"
                className={!termsContent.trim() || !activeStoreId ? btnPrimaryMuted : btnPrimary}
                disabled={!termsContent.trim() || !activeStoreId}
                onClick={async () => {
                  if (!activeStoreId) return;
                  await createTermsPolicy({ storeId: activeStoreId, termsPolicy: termsContent });
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
            <p className="text-sm leading-relaxed text-slate-600">
              Templates aren&apos;t legal advice. By using policy templates, you agree that you&apos;ve read and agree to the{' '}
              <button
                type="button"
                className="font-medium text-blue-600 underline decoration-blue-600/30 underline-offset-2 hover:text-blue-700"
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
              <h3 className="mb-2 text-xs font-semibold text-slate-900">Generated policies disclaimer</h3>
              <p className="mb-2 text-xs leading-relaxed">
                The materials below are for informational purposes only and do not constitute advertising, a solicitation or legal advice. Automated translations from the original English versions are available for convenience only.
              </p>
              <p className="mb-2 text-xs leading-relaxed">
                You should consult independent legal advice in all regions where these materials will be used before publishing them. You are solely responsible for verifying the accuracy of all content, including any translated content, and should read the generated information with care and modify, delete or add all and any areas as necessary. Use of, access to or transmission of such materials and information or any of the links contained herein is not intended to create, and receipt thereof does not constitute formation of, an attorney-client relationship between Ziplofy and the user or browser.
              </p>
              <p className="text-xs leading-relaxed">
                Further, Ziplofy does not necessarily endorse and is not responsible for any third‑party content that may be accessed through this information.
              </p>
            </div>
          )}
        </div>
        <div className={modalEditorShell}>
          <TextEditorToolbar />
          <div className="border-t border-slate-100 p-4">
            <textarea
              className={modalTextarea}
              placeholder="Add your terms of service..."
              value={termsContent}
              onChange={(e) => setTermsContent(e.target.value)}
              rows={8}
            />
          </div>
        </div>
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
                  !shippingContent.trim() || shippingContent === (policy?.shippingPolicy || '')
                    ? btnPrimaryMuted
                    : btnPrimary
                }
                disabled={!shippingContent.trim() || shippingContent === (policy?.shippingPolicy || '')}
                onClick={async () => {
                  if (!policy?._id) return;
                  await updatePolicy(policy._id, { shippingPolicy: shippingContent });
                  setShippingOpen(false);
                }}
              >
                Update
              </button>
            ) : (
              <button
                type="button"
                className={!shippingContent.trim() || !activeStoreId ? btnPrimaryMuted : btnPrimary}
                disabled={!shippingContent.trim() || !activeStoreId}
                onClick={async () => {
                  if (!activeStoreId) return;
                  await createPolicy({ storeId: activeStoreId, shippingPolicy: shippingContent });
                  setShippingOpen(false);
                }}
              >
                Publish
              </button>
            )}
          </>
        }
      >
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          Describe processing times, carriers, and regions you ship to. Customers see this in your store footer and checkout.
        </p>
        <div className={modalEditorShell}>
          <TextEditorToolbar />
          <div className="border-t border-slate-100 p-4">
            <textarea
              className={modalTextarea}
              placeholder="Add your shipping policy..."
              value={shippingContent}
              onChange={(e) => setShippingContent(e.target.value)}
              rows={8}
            />
          </div>
        </div>
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
                  !privacyContent.trim() || privacyContent === (privacyPolicy?.privacyPolicy || '')
                    ? btnPrimaryMuted
                    : btnPrimary
                }
                disabled={!privacyContent.trim() || privacyContent === (privacyPolicy?.privacyPolicy || '')}
                onClick={async () => {
                  if (!privacyPolicy?._id) return;
                  await updatePrivacyPolicy(privacyPolicy._id, { privacyPolicy: privacyContent });
                  setPrivacyOpen(false);
                }}
              >
                Update
              </button>
            ) : (
              <button
                type="button"
                className={!privacyContent.trim() || !activeStoreId ? btnPrimaryMuted : btnPrimary}
                disabled={!privacyContent.trim() || !activeStoreId}
                onClick={async () => {
                  if (!activeStoreId) return;
                  await createPrivacyPolicy({ storeId: activeStoreId, privacyPolicy: privacyContent });
                  setPrivacyOpen(false);
                }}
              >
                Publish
              </button>
            )}
          </>
        }
      >
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Use automated policy</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
              Keep policy content in sync with store settings and latest templates.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={privacyAutomated}
            className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
              privacyAutomated ? 'bg-blue-600' : 'bg-slate-300'
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
        <div className={`${modalEditorShell} mb-4`}>
          <TextEditorToolbar variant="privacy" />
          <div className="border-t border-slate-100 p-4">
            <textarea
              className={modalTextareaTall}
              placeholder="Add your privacy policy..."
              value={privacyContent}
              onChange={(e) => setPrivacyContent(e.target.value)}
              rows={12}
            />
          </div>
        </div>
        <p className="mb-3 text-xs leading-relaxed text-slate-600">
          This privacy policy is not legal advice, and you are responsible for ensuring its accuracy and complying with applicable laws. By using this policy you agree that you&apos;ve read and agree to the{' '}
          <button
            type="button"
            className="font-medium text-blue-600 underline decoration-blue-600/30 underline-offset-2 hover:text-blue-700"
            onClick={() => setShowPrivacyDisclaimer((v) => !v)}
          >
            disclaimer {showPrivacyDisclaimer ? '▾' : '▸'}
          </button>
        </p>
        {showPrivacyDisclaimer && (
          <div className={modalDisclaimerBox}>
            <h3 className="mb-2 text-xs font-semibold text-slate-900">Generated policies disclaimer</h3>
            <p className="mb-2 text-xs leading-relaxed">
              The materials below are for informational purposes only and do not constitute advertising, a solicitation or legal advice. Automated translations from the original English versions are available for convenience only.
            </p>
            <p className="text-xs leading-relaxed">
              You should consult independent legal advice in all regions where these materials will be used before publishing them. You are solely responsible for verifying the accuracy of all content, including any translated content, and should read the generated information with care and modify, delete or add all and any areas as necessary.
            </p>
          </div>
        )}
      </Modal>
      </div>
    </div>
  );
};

export default PoliciesSettings;