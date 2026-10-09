import { InfoPage, LegalSections, type LegalSectionData } from './legal-layout';

const sections: LegalSectionData[] = [
  {
    title: 'About Our Services',
    blocks: [
      {
        p: 'JaygaLagbe.com is an online property listing platform designed to help individuals, property owners, buyers, tenants, landlords, and real estate agents connect across Bangladesh.',
      },
      {
        p: 'The platform may allow users to post, browse, and respond to advertisements related to:',
      },
      {
        list: [
          'Land and plots for sale.',
          'Houses, apartments, and commercial properties for sale.',
          'Houses, apartments, rooms, and commercial spaces for rent.',
          'Other property-related advertisements permitted by the website.',
        ],
      },
      {
        p: 'Unless expressly stated otherwise, JaygaLagbe.com acts as a platform connecting users and is not itself the owner, seller, buyer, landlord, tenant, or legal representative of the parties involved.',
      },
    ],
  },
  {
    title: 'User Eligibility',
    blocks: [
      {
        p: 'By using this website, you confirm that you are legally capable of entering into an agreement under applicable law.',
      },
      {
        p: 'Users must provide accurate information when creating an account, submitting advertisements, or contacting other users. Anyone acting on behalf of a property owner must have appropriate authorization.',
      },
    ],
  },
  {
    title: 'User Accounts and Information',
    blocks: [
      {
        p: 'If registration is required to use any feature, you agree to provide accurate, complete, and up-to-date information.',
      },
      {
        p: 'You are responsible for maintaining the confidentiality of your account credentials and for activities conducted through your account. Please notify us if you suspect unauthorized access to your account.',
      },
      {
        p: 'JaygaLagbe.com reserves the right to restrict, suspend, or terminate accounts that violate these Terms or applicable law.',
      },
    ],
  },
  {
    title: 'Property Advertisements',
    blocks: [
      {
        p: 'Users are responsible for the accuracy, legality, and completeness of their advertisements.',
      },
      {
        p: 'Property advertisements should include truthful information about the location, price, size, ownership or authority to advertise, property condition, and other material details where applicable.',
      },
      { p: 'You must not:' },
      {
        list: [
          'Publish false, misleading, fraudulent, or deceptive advertisements.',
          "Advertise property without the owner's permission or other lawful authority.",
          'Upload forged ownership documents or misleading property images.',
          'Misrepresent property prices, boundaries, measurements, or legal status.',
          'Post duplicate advertisements excessively or manipulate listings.',
          "Publish another person's confidential information without proper authorization.",
          'Use the platform for unlawful activities, scams, or harassment.',
        ],
      },
      {
        p: 'JaygaLagbe.com may review, reject, edit, remove, or restrict advertisements that violate these Terms or create a risk to users.',
      },
    ],
  },
  {
    title: 'Free and Paid Services',
    blocks: [
      {
        p: 'Some website features may be available free of charge. Other services, including featured listings, promotional placements, or premium advertising options, may require payment if offered.',
      },
      {
        p: 'Any applicable fee, service description, duration, and payment conditions will be communicated before purchase.',
      },
      {
        p: 'Unless a separate refund policy or written agreement provides otherwise, fees for completed advertising or promotional services are non-refundable to the extent permitted by applicable law.',
      },
    ],
  },
  {
    title: 'Property Verification and Due Diligence',
    blocks: [
      {
        p: 'JaygaLagbe.com does not guarantee the ownership, title, authenticity, legal status, physical condition, market value, availability, or suitability of any listed property unless a specific verification service is expressly described and completed.',
      },
      {
        p: 'Users must independently verify relevant documents and information before paying money, signing agreements, or completing a transaction.',
      },
      {
        p: 'Buyers and tenants should conduct appropriate checks, including verification of ownership documents, land records, approvals, possession, outstanding claims, and applicable legal requirements.',
      },
      {
        p: 'Users are encouraged to consult qualified legal professionals and relevant authorities before completing significant property transactions.',
      },
    ],
  },
  {
    title: 'Transactions Between Users',
    blocks: [
      {
        p: 'Any negotiation, viewing, booking, advance payment, deposit, sale, purchase, or rental agreement between users is undertaken at their own discretion and risk.',
      },
      {
        p: 'JaygaLagbe.com is not a party to transactions between users unless a separate written agreement explicitly states otherwise.',
      },
      {
        p: 'Users should confirm all material terms in writing and use lawful, traceable payment methods where appropriate. Do not send money solely because an advertisement or profile appears on our website.',
      },
    ],
  },
  {
    title: 'User Content and Intellectual Property',
    blocks: [
      {
        p: 'You retain ownership of the content you lawfully submit, subject to any rights belonging to third parties.',
      },
      {
        p: 'By submitting advertisements, photographs, descriptions, or other content, you grant JaygaLagbe.com a non-exclusive permission to host, display, reproduce, and promote that content as reasonably necessary to operate and market the relevant listing and website, subject to our Privacy Policy and applicable law.',
      },
      {
        p: 'You must have the necessary rights or permissions to submit any content.',
      },
      {
        p: 'The JaygaLagbe.com name, branding, website design, and original website materials may not be copied, misused, or commercially exploited without authorization.',
      },
    ],
  },
  {
    title: 'Prohibited Activities',
    blocks: [
      { p: 'Users must not:' },
      {
        list: [
          'Attempt unauthorized access to the website or its systems.',
          'Introduce malware, harmful code, or disruptive activity.',
          'Scrape, copy, or commercially reuse website data without authorization.',
          'Use false identities or impersonate other people.',
          'Spam users or misuse contact details.',
          'Interfere with the operation, security, or availability of the website.',
        ],
      },
    ],
  },
  {
    title: 'Third-Party Services and Links',
    blocks: [
      {
        p: 'The website may contain links to third-party websites, payment services, communication tools, or external resources.',
      },
      {
        p: 'JaygaLagbe.com does not control and is not responsible for the content, policies, availability, or practices of third-party services. Users should review the relevant third-party terms and privacy policies.',
      },
    ],
  },
  {
    title: 'Limitation of Liability',
    blocks: [
      {
        p: 'To the extent permitted by applicable law, JaygaLagbe.com shall not be responsible for losses arising from inaccurate user advertisements, fraudulent conduct by other users, disputed property ownership, failed negotiations, or transactions conducted independently between users.',
      },
      {
        p: 'We do not guarantee uninterrupted website availability, error-free operation, or a successful sale, purchase, or rental.',
      },
      {
        p: 'Nothing in these Terms excludes or limits liability where such exclusion or limitation is prohibited by applicable law.',
      },
    ],
  },
  {
    title: 'Indemnity',
    blocks: [
      {
        p: 'To the extent permitted by applicable law, users are responsible for claims, losses, or expenses arising from their unlawful conduct, material misrepresentations, infringement of third-party rights, or breach of these Terms.',
      },
    ],
  },
  {
    title: 'Suspension and Termination',
    blocks: [
      {
        p: 'We may suspend or remove advertisements, restrict accounts, or discontinue access where reasonably necessary to enforce these Terms, protect users, address security concerns, or comply with legal obligations.',
      },
      {
        p: 'Users may stop using the website at any time. Any outstanding obligations or provisions that are intended to survive termination will remain effective as applicable.',
      },
    ],
  },
  {
    title: 'Changes to These Terms',
    blocks: [
      {
        p: 'We may update these Terms from time to time. Updated versions will be published on this page with a revised effective date.',
      },
      {
        p: 'Your continued use of the website after an update becomes effective constitutes acceptance of the revised Terms, to the extent permitted by applicable law.',
      },
    ],
  },
  {
    title: 'Governing Law',
    blocks: [
      {
        p: 'These Terms are subject to the applicable laws of Bangladesh. Any dispute shall be handled by a court or authority with appropriate jurisdiction under applicable law.',
      },
    ],
  },
  {
    title: 'Contact Us',
    blocks: [
      {
        contact:
          'If you have questions about these Terms and Conditions, please contact us through the contact details or contact form available on JaygaLagbe.com.',
      },
      { website: true },
    ],
  },
];

export function TermsScreen() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Terms and Conditions"
      effectiveDate="October 8, 2026"
      intro="Welcome to JaygaLagbe.com. These Terms and Conditions govern your access to and use of our website and services. By accessing or using JaygaLagbe.com, you agree to comply with these Terms and Conditions. If you do not agree, please discontinue using the website."
    >
      <LegalSections sections={sections} />
    </InfoPage>
  );
}
