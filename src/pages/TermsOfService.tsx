import { LegalPage, LegalSection } from '../components/LegalPage';

export function TermsOfService() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of BrightBridge&apos;s websites,
        applications, APIs, voice and messaging integrations, and related offerings (collectively, the
        &quot;Service&quot;). By accessing or using the Service, you agree to these Terms. If you are using the Service on
        behalf of an organization, you represent that you have authority to bind that organization and &quot;you&quot;
        refers to both you and that organization.
      </p>

      <LegalSection title="The Service">
        <p>
          BrightBridge provides tools for childcare and early-education operators to manage inbound communications,
          capture inquiries, integrate calendars, and related enrollment workflows. Features may evolve; we may add,
          modify, suspend, or discontinue functionality with reasonable notice where practicable.
        </p>
      </LegalSection>

      <LegalSection title="Accounts and eligibility">
        <ul className="list-disc pl-5 space-y-2">
          <li>You must provide accurate registration information and keep credentials confidential.</li>
          <li>
            You are responsible for activity under your account and for configuring integrations (for example calendars
            or phone systems) in accordance with vendor terms and laws that apply to you.
          </li>
          <li>We may suspend or terminate accounts that materially breach these Terms or pose security or abuse risk.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Violate applicable law or third-party rights;</li>
          <li>Use the Service to transmit unlawful, deceptive, discriminatory, or harmful content;</li>
          <li>
            Attempt to interfere with or disrupt the Service, circumvent security controls, scrape at scale without
            permission, or misuse trial or sandbox environments;
          </li>
          <li>Reverse engineer the Service except where applicable law forbids such a restriction;</li>
          <li>Use the Service in a manner that materially degrades BrightBridge networks or upstream carrier partners.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Customer content and authorization">
        <p>
          You retain rights in data you submit to the Service (&quot;Customer Content&quot;). You grant BrightBridge a
          non-exclusive license to host, process, transmit, display, and create derivative summaries or analytics as
          needed to operate, secure, troubleshoot, improve, and support the Service—the same scope ordinarily required for
          a cloud communications platform. You confirm you have all rights and consents needed for BrightBridge and
          subcontractors to process Customer Content, including parental or guardian communications your organization
          routes through the Service under your policies.
        </p>
      </LegalSection>

      <LegalSection title="Fees and taxes">
        <p>
          Paid subscriptions are billed according to your order form or checkout. Unless stated otherwise, fees are
          non-refundable except where required by law. You are responsible for applicable taxes excluding taxes on our
          net income.
        </p>
      </LegalSection>

      <LegalSection title="Third-party services">
        <p>
          The Service may integrate with calendars, telecom providers, CRMs, and other third-party platforms. Such
          services are governed solely by their own terms and privacy notices; BrightBridge is not responsible for their
          availability or behavior.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimer of warranties">
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE.&quot; TO THE MAXIMUM EXTENT PERMITTED BY LAW,
          BRIGHTBRIDGE DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE—INCLUDING IMPLIED
          WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT—RELATING TO THE
          SERVICE AND ANY INTEGRATION.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER BRIGHTBRIDGE NOR ITS SUPPLIERS WILL BE LIABLE FOR ANY INDIRECT,
          INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR LOSS OF PROFITS, REVENUE, GOODWILL, OR DATA ARISING
          FROM THESE TERMS OR THE SERVICE. OUR AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF RELATED TO THE SERVICE IN
          ANY TWELVE-MONTH PERIOD WILL NOT EXCEED THE AMOUNTS YOU PAID BRIGHTBRIDGE FOR THE SERVICE IN THAT PERIOD OR ONE
          HUNDRED DOLLARS (USD $100), WHICHEVER IS GREATER. SOME JURISDICTIONS DO NOT ALLOW CERTAIN LIMITATIONS; IN SUCH
          CASES, OUR LIABILITY IS LIMITED TO THE FULLEST EXTENT PERMITTED BY LAW.
        </p>
      </LegalSection>

      <LegalSection title="Indemnity">
        <p>
          You will defend and indemnify BrightBridge and its affiliates, officers, and employees against third-party
          claims arising from Customer Content or your misuse of the Service or violation of these Terms, excluding
          claims caused by our intentional misconduct.
        </p>
      </LegalSection>

      <LegalSection title="Term and termination">
        <p>
          These Terms commence when you first use the Service and continue until terminated. You may stop using the Service
          anytime. We may suspend or terminate access upon written notice where required by law or for material breach
          uncured after reasonable cure period where applicable. Provisions intended to survive (including disclaimers,
          limitations of liability, indemnity, and governing law) survive termination.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may revise these Terms; we will post updates on this page and update the &quot;Last updated&quot; date. If
          changes are material, we will provide additional notice within the Service or by email where appropriate.
          Continued use after updates become effective constitutes acceptance of the revised Terms.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>
          These Terms are governed by the laws of the United States State of Delaware, excluding conflicts-of-law rules,
          unless mandatory local law dictates otherwise with respect to consumers. Courts in Delaware shall have exclusive
          jurisdiction unless law requires otherwise.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about these Terms:{' '}
          <a href="mailto:info@brightbridge.ai" className="text-blue-600 hover:underline font-medium">
            info@brightbridge.ai
          </a>
          .
        </p>
      </LegalSection>

      <p className="text-sm text-slate-500 italic pt-2">
        BrightBridge supplies these Terms for informational and operational clarity. They are not a substitute for counsel
        familiar with your organization&apos;s jurisdiction and regulated industry obligations.
      </p>
    </LegalPage>
  );
}
