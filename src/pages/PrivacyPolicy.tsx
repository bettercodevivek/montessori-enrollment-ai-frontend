import { LegalPage, LegalSection } from '../components/LegalPage';

export function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        BrightBridge (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the BrightBridge platform and related
        websites and services for childcare and early-education operators. This Privacy Policy describes how we collect,
        use, and share information when you use our services.
      </p>

      <LegalSection title="Information we collect">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-slate-800">Account and school information.</strong> Name, email, organization name,
            billing details, and other details you provide when you register or manage your subscription.
          </li>
          <li>
            <strong className="text-slate-800">Communications metadata.</strong> Information related to voice,
            messaging, or scheduling integrations you connect (for example call timestamps, duration, summaries, or
            transcripts processed to deliver the Service), consistent with how you configure the product.
          </li>
          <li>
            <strong className="text-slate-800">Usage and technical data.</strong> Log data, device and browser type,
            IP address (which may approximate location), and diagnostic information to operate and secure the platform.
          </li>
          <li>
            <strong className="text-slate-800">Information you submit via forms.</strong> Data parents or staff submit
            through inbound flows (for example inquiries or tour requests) becomes available to your organization as part
            of the Service.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="How we use information">
        <ul className="list-disc pl-5 space-y-2">
          <li>Provide, operate, maintain, support, and improve BrightBridge;</li>
          <li>Process billing, authenticate users, communicate about the Service, and send service-related notices;</li>
          <li>Monitor and protect the security and integrity of our systems;</li>
          <li>
            Comply with law, enforce our agreements, and protect the rights and safety of users and the public, where
            permitted.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="How we share information">
        <p>We may share information in these situations:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-slate-800">With your school or organization,</strong> as needed to operate the
            product you&apos;ve subscribed to (for example dashboards, summaries, or integrations).
          </li>
          <li>
            <strong className="text-slate-800">With service providers</strong> who process data on our behalf under
            contractual safeguards (for example hosting, analytics, telecommunications, or payment processors).
          </li>
          <li>
            <strong className="text-slate-800">For legal reasons</strong> if we believe disclosure is required by law,
            regulation, or legal process.
          </li>
          <li>
            <strong className="text-slate-800">Business transfers</strong> in connection with a merger, acquisition,
            financing, or sale of assets, subject to customary protections.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Retention">
        <p>
          We retain information for as long as needed to provide the Service, comply with legal obligations, resolve
          disputes, and enforce agreements. Retention varies by record type and your organization&apos;s configuration.
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          We implement technical and organizational measures designed to protect information. No method of transmission or
          storage is completely secure; we encourage you to use strong credentials and safeguard access to integrated
          systems.
        </p>
      </LegalSection>

      <LegalSection title="Your choices and rights">
        <p>
          Depending on your location, you may have rights to access, correct, delete, or restrict certain processing of
          your personal information, or to object to processing. To exercise applicable rights, contact us using the email
          below. Authorized school administrators generally control roster and inquiry data for their institution.
        </p>
      </LegalSection>

      <LegalSection title="International transfers">
        <p>
          If you access the Service from outside the region where BrightBridge operates primary infrastructure, your
          information may be transferred to and processed in other countries where we or our providers maintain facilities,
          consistent with applicable law.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          BrightBridge is a tool for childcare operators and educators. Our Service is not directed to children under 13 as
          consumers for their own signup. Organizations are responsible for appropriate consent when collecting minor
          information through their workflows.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update this Privacy Policy from time to time. We will post the revised policy on this page with an
          updated &quot;Last updated&quot; date. Material changes may be communicated through the Service or by email where
          appropriate.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about this Privacy Policy:{' '}
          <a href="mailto:info@brightbridge.ai" className="text-blue-600 hover:underline font-medium">
            info@brightbridge.ai
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
