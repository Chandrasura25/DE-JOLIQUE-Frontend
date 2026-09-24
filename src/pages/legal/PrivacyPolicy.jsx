import { Link } from 'react-router-dom';
import LegalLayout, { Fill, PostalAddress, Section, SupportEmail, SupportPhone } from './LegalLayout';
import { LEGAL } from './legalConfig';

const SECTIONS = [
  ['who-we-are', 'Who we are'],
  ['what-we-collect', 'What we collect'],
  ['how-we-use', 'How we use it and why'],
  ['sharing', 'Who we share it with'],
  ['cookies', 'Cookies and browser storage'],
  ['retention', 'How long we keep it'],
  ['security', 'How we protect it'],
  ['transfers', 'Where your data is stored'],
  ['rights', 'Your rights'],
  ['children', 'Children'],
  ['changes', 'Changes to this policy'],
  ['contact', 'Contact us'],
];

const n = (id) => `${SECTIONS.findIndex(([s]) => s === id) + 1}. ${SECTIONS.find(([s]) => s === id)[1]}`;

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro={`This policy explains what personal data ${LEGAL.businessName} collects when you use our online store, why we collect it, who we share it with and the choices you have. We process personal data in line with the Nigeria Data Protection Act 2023 (NDPA) and the regulations of the Nigeria Data Protection Commission (NDPC).`}
      sections={SECTIONS}
      other={{ to: '/terms', label: 'Terms of Service' }}
    >
      <Section id="who-we-are" title={n('who-we-are')}>
        <p>
          The store is operated by <strong><Fill value={LEGAL.legalEntity} label="registered business name and CAC number" /></strong>,{' '}
          <PostalAddress /> (&ldquo;we&rdquo;, &ldquo;us&rdquo;). We are the data controller
          for the personal data described here. You can reach us about anything in this policy at <SupportEmail />.
        </p>
      </Section>

      <Section id="what-we-collect" title={n('what-we-collect')}>
        <p><strong>Information you give us</strong></p>
        <ul>
          <li><strong>Account details:</strong> your name, email address, optional phone number and password. Your password is stored only as a secure hash by our authentication provider; we can never see it.</li>
          <li><strong>Google sign-in:</strong> if you sign in with Google (including Google One Tap), Google shares your name, email address and profile picture with us. We never receive your Google password.</li>
          <li><strong>Delivery details:</strong> the full name, email, phone number and address you enter at checkout.</li>
          <li><strong>Messages:</strong> anything you send us when you contact support.</li>
        </ul>
        <p><strong>Information created when you shop</strong></p>
        <ul>
          <li><strong>Orders:</strong> the products, quantities, prices, delivery fee, totals and order status history.</li>
          <li><strong>Payments:</strong> the payment provider used, transaction reference, amount paid, currency, status and payment channel (for example card or bank transfer), as reported to us by the provider.</li>
          <li><strong>Account activity:</strong> when your account was created and when you last signed in.</li>
        </ul>
        <p><strong>Information collected automatically</strong></p>
        <ul>
          <li><strong>Technical data:</strong> your IP address, browser type and the pages or services you request, recorded in our server logs.</li>
          <li><strong>Failed sign-in attempts:</strong> the email address and IP address of failed password logins, used to protect accounts from password guessing.</li>
        </ul>
        <p>
          <strong>What we do not collect:</strong> your card number, card security code, PIN, OTPs or bank login details. Payments are entered
          directly on Paystack&rsquo;s or Flutterwave&rsquo;s secure pages, and those details never reach our servers. We do not use advertising
          or analytics trackers.
        </p>
      </Section>

      <Section id="how-we-use" title={n('how-we-use')}>
        <ul>
          <li><strong>To create and run your account and sign you in</strong> (performance of our contract with you).</li>
          <li><strong>To process, deliver and support your orders</strong>, including confirming payments, handling cancellations, refunds and returns (performance of contract).</li>
          <li><strong>To send service emails</strong>, such as account confirmation and password-reset links (performance of contract). We do not send marketing emails unless you have separately agreed to receive them.</li>
          <li><strong>To keep the store and your account secure</strong>, for example limiting repeated failed sign-ins, preventing fraud and investigating misuse (our legitimate interests in running a safe service).</li>
          <li><strong>To keep financial and tax records</strong> of orders and payments (compliance with legal obligations).</li>
        </ul>
        <p>We do not sell your personal data, and we do not use it for automated decisions that have legal or similarly significant effects on you.</p>
      </Section>

      <Section id="sharing" title={n('sharing')}>
        <p>We share personal data only with service providers that help us run the store, and only what each one needs:</p>
        <ul>
          <li><strong>Paystack and Flutterwave</strong>: to take payments. They receive your name, email and phone number, the order amount, order number and a payment reference, and handle your payment details under their own privacy policies.</li>
          <li><strong>Supabase</strong>: hosts our database, user accounts and product images, and sends our account emails.</li>
          <li><strong>Vercel</strong>: hosts the website and our servers.</li>
          <li><strong>Google</strong>: only if you choose to sign in with Google.</li>
          <li><strong>Delivery partners</strong>: your name, phone number and delivery address, to deliver your order.</li>
        </ul>
        <p>
          We may also disclose information where the law requires it, for example to comply with a court order or a lawful request from a
          regulator or law-enforcement agency, or to protect our rights and our customers against fraud.
        </p>
      </Section>

      <Section id="cookies" title={n('cookies')}>
        <p>We use only the cookies and browser storage needed for the store to work. There are no advertising or analytics cookies.</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-ink-900">
                <th className="py-2 pr-4 font-semibold">Name</th>
                <th className="py-2 pr-4 font-semibold">Purpose</th>
                <th className="py-2 font-semibold">Lasts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              <tr><td className="py-2 pr-4 font-mono text-xs">jq_access</td><td className="py-2 pr-4">Keeps you signed in</td><td className="py-2">Up to 1 hour</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-xs">jq_refresh</td><td className="py-2 pr-4">Renews your sign-in without asking for your password again</td><td className="py-2">Up to 30 days, or until you log out</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-xs">jq_auth_flow</td><td className="py-2 pr-4">Completes Google sign-in and email links securely in the browser that started them</td><td className="py-2">Up to 24 hours</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-xs">jq_onetap_nonce</td><td className="py-2 pr-4">Protects Google One Tap sign-in against replay</td><td className="py-2">10 minutes</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-xs">Cart (local storage)</td><td className="py-2 pr-4">Remembers the items in your cart on this device</td><td className="py-2">Until your order is paid or you empty the cart</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-xs">Pending payment (session storage)</td><td className="py-2 pr-4">Lets us confirm your payment when you return from the payment page</td><td className="py-2">Until you close the tab</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Our sign-in cookies are <em>httpOnly</em>: scripts on the page cannot read them. If you use Google sign-in, Google may set its own
          cookies under{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="font-medium text-brand-700 underline underline-offset-2">
            Google&rsquo;s Privacy Policy
          </a>
          . You can block cookies in your browser, but you will not be able to sign in or check out.
        </p>
      </Section>

      <Section id="retention" title={n('retention')}>
        <ul>
          <li><strong>Account details:</strong> for as long as your account exists. When your account is deleted, your profile and sign-in details are deleted.</li>
          <li><strong>Orders and payment records:</strong> kept after an account is deleted, detached from the account, for as long as Nigerian tax and accounting law requires.</li>
          <li><strong>Unpaid orders:</strong> cancelled automatically after {LEGAL.unpaidOrderHours} hours; the cancelled record is kept with your order history.</li>
          <li><strong>Failed sign-in records:</strong> deleted after about one day.</li>
          <li><strong>Server logs:</strong> kept for a short period by our hosting provider for security and troubleshooting.</li>
        </ul>
      </Section>

      <Section id="security" title={n('security')}>
        <p>
          All traffic to the store is encrypted with HTTPS. Sign-in tokens are kept in secure, httpOnly cookies rather than in the page.
          Prices and payments are always verified on our servers with the payment provider. Access to customer data is restricted to our
          servers and one administrator account. Repeated failed sign-ins are automatically slowed down.
        </p>
        <p>
          No system is perfectly secure. If a data breach affects your personal data and is likely to put you at risk, we will notify you and
          the Nigeria Data Protection Commission as the NDPA requires.
        </p>
      </Section>

      <Section id="transfers" title={n('transfers')}>
        <p>
          Our database is hosted by Supabase in the European Union (Frankfurt, Germany), and our website and servers are run by Vercel, including
          in the EU. Paystack, Flutterwave and Google may process data in Nigeria and other countries. Where personal data leaves Nigeria, we rely
          on providers that offer protection consistent with the NDPA, such as contractual data-protection commitments.
        </p>
      </Section>

      <Section id="rights" title={n('rights')}>
        <p>Under the NDPA you have the right to:</p>
        <ul>
          <li><strong>Access</strong> the personal data we hold about you and get a copy of it.</li>
          <li><strong>Correct</strong> it. You can update your name and phone number yourself in <Link to="/account" className="font-medium text-brand-700 underline underline-offset-2">My account</Link>.</li>
          <li><strong>Delete</strong> your account and personal data, except records we must keep by law.</li>
          <li><strong>Object to or restrict</strong> certain processing, and <strong>withdraw consent</strong> where we rely on it.</li>
          <li><strong>Data portability</strong>: receive your data in a commonly used electronic format.</li>
        </ul>
        <p>
          To use any of these rights, email <SupportEmail /> from the address on your account. We will respond within 30 days. If you are not
          satisfied with our response, you can complain to the{' '}
          <a href="https://ndpc.gov.ng" target="_blank" rel="noreferrer" className="font-medium text-brand-700 underline underline-offset-2">
            Nigeria Data Protection Commission
          </a>
          .
        </p>
      </Section>

      <Section id="children" title={n('children')}>
        <p>
          The store is intended for adults. You must be at least 18 years old to create an account or place an order, or be using it with the
          consent and supervision of a parent or guardian. We do not knowingly collect data from children; if you believe a child has given us
          personal data, contact us and we will delete it.
        </p>
      </Section>

      <Section id="changes" title={n('changes')}>
        <p>
          We may update this policy when our store or the law changes. The date at the top shows when it last changed. If a change is
          significant, we will tell you by email or on the site before it takes effect.
        </p>
      </Section>

      <Section id="contact" title={n('contact')}>
        <p>
          Questions or requests about your personal data: <SupportEmail />
          <SupportPhone />. Post: <PostalAddress />.
        </p>
      </Section>
    </LegalLayout>
  );
}
