import { InfoPage, LegalSections, type LegalSectionData } from './legal-layout';

const sections: LegalSectionData[] = [
  {
    title: 'Scope of This Policy',
    blocks: [
      {
        p: 'This Privacy Policy applies to information collected through JaygaLagbe.com, including property advertisements, account registration, contact forms, inquiries, and other website features.',
      },
    ],
  },
  {
    title: 'Information We May Collect',
    blocks: [
      {
        p: 'Depending on the features you use, we may collect the following categories of information:',
      },
      { h: 'A. Personal Information' },
      {
        list: [
          'Name.',
          'Phone number and email address.',
          'Account details and login-related information.',
          'Information you provide through contact forms or inquiries.',
        ],
      },
      { h: 'B. Property Information' },
      {
        list: [
          'Property location, address, and district.',
          'Asking price, rent, size, and property description.',
          'Photographs, videos, and other listing materials.',
          'Information about your authority to advertise a property, where provided.',
        ],
      },
      { h: 'C. Technical Information' },
      {
        p: "When you visit the website, certain technical information may be collected, such as IP address, browser type, device information, pages visited, referral information, and access times, depending on the website's configuration.",
      },
      { h: 'D. Communications' },
      {
        p: 'We may retain messages, support requests, complaints, and other communications you send to us, where reasonably necessary to respond, maintain records, or protect our services.',
      },
      {
        p: 'Please do not submit unnecessary sensitive personal information or confidential documents through public listing fields.',
      },
    ],
  },
  {
    title: 'How We Use Your Information',
    blocks: [
      { p: 'We may use information for the following purposes:' },
      {
        list: [
          'To publish and manage property advertisements.',
          'To help buyers, sellers, landlords, and tenants contact one another.',
          'To create and administer user accounts.',
          'To respond to questions, inquiries, and support requests.',
          'To moderate advertisements and help prevent fraud, spam, and misuse.',
          'To maintain website security and improve performance.',
          'To understand website usage and improve our services.',
          'To communicate important service updates.',
          'To comply with applicable legal obligations and respond to lawful requests.',
        ],
      },
      {
        p: 'We will use personal information for purposes that are consistent with the reason it was collected, subject to applicable law and any required consent.',
      },
    ],
  },
  {
    title: 'Publicly Visible Information',
    blocks: [
      {
        p: 'Information included in a public property advertisement may be visible to visitors of the website and may be copied, indexed, or shared by third parties.',
      },
      {
        p: 'Before publishing a listing, carefully consider whether to include your phone number, exact address, personal photographs, ownership documents, or other identifying details.',
      },
      {
        p: 'Do not publish information about another person unless you have the necessary authority or lawful basis to do so.',
      },
    ],
  },
  {
    title: 'Cookies and Similar Technologies',
    blocks: [
      {
        p: 'JaygaLagbe.com may use cookies or similar technologies to support essential website functions, remember preferences, maintain sessions, understand website traffic, and improve the user experience.',
      },
      {
        p: 'Where required by applicable law, consent will be obtained before using non-essential cookies or tracking technologies.',
      },
      {
        p: 'You can manage cookies through your browser settings. Disabling certain cookies may affect some website features.',
      },
    ],
  },
  {
    title: 'Sharing of Information',
    blocks: [
      { p: 'We may share information in the following circumstances:' },
      {
        list: [
          {
            lead: 'With other users:',
            text: 'Information included in public listings or voluntarily provided during contact between users.',
          },
          {
            lead: 'With service providers:',
            text: 'Hosting, security, analytics, communication, and technical service providers that help operate the website.',
          },
          {
            lead: 'For legal reasons:',
            text: 'Where disclosure is required or permitted by applicable law or a lawful order.',
          },
          {
            lead: 'For security:',
            text: 'Where reasonably necessary to investigate suspected fraud, abuse, or threats to users or the website.',
          },
          {
            lead: 'With your direction or consent:',
            text: 'When you ask us to share information or otherwise authorize disclosure.',
          },
        ],
      },
      {
        p: 'We do not promise that publicly posted information will remain private after publication.',
      },
      {
        p: 'We do not sell personal information to third parties as a standalone data-selling business. Any sharing or processing will remain subject to applicable law and the terms of relevant services.',
      },
    ],
  },
  {
    title: 'Data Security',
    blocks: [
      {
        p: 'We use reasonable technical and organizational measures intended to protect personal information against unauthorized access, loss, misuse, alteration, or disclosure.',
      },
      {
        p: 'However, no website or internet transmission can be guaranteed to be completely secure. Users should protect their passwords and avoid sharing confidential information unnecessarily.',
      },
    ],
  },
  {
    title: 'Data Retention',
    blocks: [
      {
        p: 'We retain personal information for as long as reasonably necessary to provide our services, manage advertisements and accounts, resolve disputes, maintain security, and meet legal obligations.',
      },
      {
        p: 'Retention periods may vary depending on the type of information and the purpose for which it was collected.',
      },
      {
        p: 'Where appropriate and legally permissible, information may be deleted, anonymized, or otherwise disposed of when it is no longer needed.',
      },
    ],
  },
  {
    title: 'Your Privacy Choices and Rights',
    blocks: [
      { p: 'Subject to applicable law, you may request to:' },
      {
        list: [
          'Access personal information we hold about you.',
          'Correct inaccurate or incomplete information.',
          'Delete information or close your account where applicable.',
          'Withdraw consent where processing is based on consent.',
          'Raise a concern about how your information is handled.',
        ],
      },
      {
        p: 'Some information may need to be retained where legally required or necessary for legitimate and lawful purposes.',
      },
      {
        contact:
          "To submit a privacy request, contact us through the website's available contact channels. We may need to verify your identity before responding.",
      },
    ],
  },
  {
    title: "Children's Privacy",
    blocks: [
      {
        p: 'JaygaLagbe.com is not intended to encourage children to enter property transactions or submit unnecessary personal information. Users must comply with applicable age and legal-capacity requirements.',
      },
      {
        p: 'If you believe a child has provided personal information inappropriately, contact us so we can assess the request and take appropriate action.',
      },
    ],
  },
  {
    title: 'Third-Party Websites',
    blocks: [
      {
        p: 'Our website may link to external websites or services. Their privacy practices are governed by their own policies, and we are not responsible for how they collect or use information.',
      },
    ],
  },
  {
    title: 'Changes to This Privacy Policy',
    blocks: [
      {
        p: 'We may update this Privacy Policy as our services, technology, or legal obligations change. The revised policy will be published on this page with an updated effective date.',
      },
    ],
  },
  {
    title: 'Contact Us',
    blocks: [
      {
        p: 'For privacy questions, requests, or complaints, please contact us through the contact information or contact form available on our website.',
      },
      { website: true },
    ],
  },
];

export function PrivacyScreen() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Privacy Policy"
      effectiveDate="October 8, 2026"
      intro="JaygaLagbe.com respects your privacy and is committed to handling personal information responsibly. This Privacy Policy explains what information we may collect, how we use it, when we may share it, and the choices available to you when using our website."
    >
      <LegalSections sections={sections} />
    </InfoPage>
  );
}
