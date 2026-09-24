import { Link } from 'react-router-dom';
import LegalLayout, { Fill, PostalAddress, Section, SupportEmail, SupportPhone } from './LegalLayout';
import { LEGAL } from './legalConfig';

const SECTIONS = [
  ['about', 'About these terms'],
  ['accounts', 'Your account'],
  ['orders', 'Orders and pricing'],
  ['payment', 'Payment'],
  ['cancellations', 'Cancellations'],
  ['delivery', 'Delivery'],
  ['returns', 'Returns and refunds'],
  ['use', 'Acceptable use'],
  ['ip', 'Content and trademarks'],
  ['liability', 'Our responsibility to you'],
  ['law', 'Governing law and disputes'],
  ['changes', 'Changes to these terms'],
  ['contact', 'Contact us'],
];

const n = (id) => `${SECTIONS.findIndex(([s]) => s === id) + 1}. ${SECTIONS.find(([s]) => s === id)[1]}`;
const link = 'font-medium text-brand-700 underline underline-offset-2';

export default function TermsOfService() {
  return (
    <LegalLayout
      title="Terms of Service"
      intro={`These terms apply when you use the ${LEGAL.businessName} online store, create an account or place an order. By doing any of these you agree to them, so please read them carefully. Nothing in these terms limits the rights you have as a consumer under Nigerian law, including the Federal Competition and Consumer Protection Act 2018.`}
      sections={SECTIONS}
      other={{ to: '/privacy', label: 'Privacy Policy' }}
    >
      <Section id="about" title={n('about')}>
        <p>
          The store is operated by <strong><Fill value={LEGAL.legalEntity} label="registered business name and CAC number" /></strong>,{' '}
          <PostalAddress /> (&ldquo;we&rdquo;, &ldquo;us&rdquo;). How we handle your personal
          data is explained in our <Link to="/privacy" className={link}>Privacy Policy</Link>.
        </p>
      </Section>

      <Section id="accounts" title={n('accounts')}>
        <ul>
          <li>You need an account to place an order. You must be at least 18, or use the store with a parent&rsquo;s or guardian&rsquo;s consent.</li>
          <li>Give accurate details and keep them up to date, especially your email address and delivery information.</li>
          <li>Keep your password private. You are responsible for activity on your account; tell us straight away at <SupportEmail /> if you think someone else has used it.</li>
          <li>You can ask us to delete your account at any time. We may suspend or close an account that is used for fraud, abuse or to break these terms.</li>
        </ul>
      </Section>

      <Section id="orders" title={n('orders')}>
        <ul>
          <li>All prices are in Nigerian Naira (₦) and include any applicable taxes unless stated otherwise. The delivery fee is shown separately at checkout before you pay.</li>
          <li>The price you pay is the price shown at checkout. Prices and stock are checked again on our servers when you place your order, so if a price changed while an item sat in your cart, checkout shows the current price.</li>
          <li>Placing an order is an offer to buy. The contract between us is formed when your payment is confirmed and your order shows as <strong>Paid</strong>.</li>
          <li>Stock is not reserved for unpaid orders. If the last unit of an item is bought by someone else before your payment is confirmed, we cancel your order and <strong>refund the full amount automatically</strong> to your original payment method.</li>
          <li>We try to describe and photograph products accurately, but colours can look different on different screens. If we make an obvious pricing error, we will contact you before dispatch, and you can choose to continue at the correct price or cancel for a full refund.</li>
        </ul>
      </Section>

      <Section id="payment" title={n('payment')}>
        <ul>
          <li>Payments are processed by <strong>Paystack</strong> or <strong>Flutterwave</strong>, using the methods they offer (such as card, bank transfer or USSD). Their terms also apply to the payment.</li>
          <li>We never see or store your card details. We confirm every payment directly with the provider before treating an order as paid.</li>
          <li>If your payment fails or you leave the payment page, your order stays <strong>Awaiting payment</strong> and you can try again from <Link to="/account" className={link}>My account</Link>.</li>
        </ul>
      </Section>

      <Section id="cancellations" title={n('cancellations')}>
        <ul>
          <li><strong>Unpaid orders</strong> can be cancelled by you at any time from your order page. Unpaid orders are cancelled automatically after {LEGAL.unpaidOrderHours} hours.</li>
          <li><strong>Paid orders</strong> can be cancelled by contacting us at <SupportEmail /> before the order is shipped. We refund the full amount, including delivery, to your original payment method.</li>
          <li>Once an order has been shipped, please follow the returns process below.</li>
        </ul>
      </Section>

      <Section id="delivery" title={n('delivery')}>
        <ul>
          <li>We deliver to <Fill value={LEGAL.deliveryAreas} label="delivery areas" />. Delivery usually takes <Fill value={LEGAL.deliveryTimes} label="typical delivery times" />; these are estimates, not guarantees.</li>
          <li>You can follow your order&rsquo;s progress (Processing, Shipped, Delivered) in <Link to="/account" className={link}>My account</Link>.</li>
          <li>Please make sure the delivery address and phone number are correct and that someone can receive the order. If a delivery fails because of incorrect details, we will contact you to arrange redelivery, which may cost extra.</li>
          <li>Responsibility for the goods passes to you once they are delivered to the address you gave.</li>
        </ul>
      </Section>

      <Section id="returns" title={n('returns')}>
        <ul>
          <li>You can ask to return an item within <Fill value={LEGAL.returnWindowDays} label="number of" /> days of delivery by emailing <SupportEmail /> with your order number. Unless an item is faulty, it must be unused and in its original packaging.</li>
          <li><strong>Faulty, damaged or wrong items:</strong> tell us as soon as possible and we will repair, replace or refund them at no cost to you, as your consumer rights require.</li>
          <li>Once we have received and checked a return, we refund within <Fill value={LEGAL.refundDays} label="number of" /> days to your original payment method. How long the money takes to reach you then depends on your bank.</li>
        </ul>
      </Section>

      <Section id="use" title={n('use')}>
        <p>You agree not to:</p>
        <ul>
          <li>use the store for anything unlawful or fraudulent, including using a payment method you are not authorised to use;</li>
          <li>try to gain unauthorised access to the store, other people&rsquo;s accounts or our systems, or interfere with how they work;</li>
          <li>use bots, scrapers or other automated tools to place orders, create accounts or copy our content;</li>
          <li>buy products for resale in a way that breaks any purchase limits we set.</li>
        </ul>
      </Section>

      <Section id="ip" title={n('ip')}>
        <p>
          The {LEGAL.businessName} name, logo, website design, text and product photographs belong to us or our licensors. You may use the
          store for personal shopping, but not copy or reuse its content for commercial purposes without our written permission.
        </p>
      </Section>

      <Section id="liability" title={n('liability')}>
        <ul>
          <li>We supply products for personal and household use. We are responsible for loss or damage you suffer that is a foreseeable result of us breaking these terms or failing to use reasonable care.</li>
          <li>We are not responsible for losses we could not reasonably foresee, for business losses, or for delays caused by events beyond our reasonable control (such as strikes, severe weather or failures of payment or courier networks). If such an event affects your order, we will tell you and you can cancel for a full refund.</li>
          <li>Nothing in these terms excludes or limits our liability where it would be unlawful to do so, including for death or personal injury caused by our negligence, for fraud, or your statutory rights as a consumer.</li>
        </ul>
      </Section>

      <Section id="law" title={n('law')}>
        <p>
          These terms are governed by the laws of the Federal Republic of Nigeria. If something goes wrong, please contact us first. We will try
          to resolve it quickly and fairly. You can also contact the Federal Competition and Consumer Protection Commission (FCCPC), and you
          keep the right to bring a claim in the Nigerian courts.
        </p>
      </Section>

      <Section id="changes" title={n('changes')}>
        <p>
          We may update these terms from time to time. The terms that apply to an order are the ones shown on the site when you placed it. The
          date at the top shows when they last changed.
        </p>
      </Section>

      <Section id="contact" title={n('contact')}>
        <p>
          Questions, cancellations, returns or complaints: <SupportEmail />
          <SupportPhone />. Post: <PostalAddress />.
        </p>
      </Section>
    </LegalLayout>
  );
}
