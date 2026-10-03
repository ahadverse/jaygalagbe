import {
  BulletList,
  Callout,
  InfoPage,
  Paragraph,
  Section,
} from './legal-layout';

// PLACEHOLDER: swap for real support address before launch
const SUPPORT_EMAIL = 'support@jaygalagbe.com';
// PLACEHOLDER: swap for the registered legal entity name before launch
const LEGAL_ENTITY = 'Jayga Lagbe';

export function PrivacyScreen() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro={`This policy explains what ${LEGAL_ENTITY} collects when you use the Jayga Lagbe app, why we collect it, who else sees it and what you can do about it. It describes what the app actually does today.`}
      lastUpdated="29 September 2026"
    >
      <Section title="The short version">
        <BulletList
          items={[
            'You can browse the whole app without an account and without telling us anything about yourself.',
            'An account needs your name and either an email address or a phone number.',
            'Anything you put in a listing is public once the listing goes live. Everything else is not.',
            'We never see your card, bKash or Nagad credentials - boost payments happen on the payment gateway’s own page.',
            'Your saved listings and recently viewed listings never leave your phone.',
            'We do not sell your information to anyone, and we do not run third-party advertising in the app.',
          ]}
        />
      </Section>

      <Section title="Your account">
        <Paragraph>
          When you create an account we store your name, the email address
          and/or phone number you signed up with, and your password. The
          password is stored only as a cryptographic hash - we cannot read it,
          and neither can anyone who might get hold of our database.
        </Paragraph>
        <Paragraph>
          We also keep a small amount of status information on your account:
          whether it has been verified, whether it has been suspended, and when
          it was created and last updated. You can change your name, email and
          phone at any time from Settings.
        </Paragraph>
      </Section>

      <Section title="Listings and photos">
        <Paragraph>
          When you post an ad we store what you type into it: the title,
          description, price, division, district and area, an optional street
          address, optional map coordinates, the property details for that
          sector, and the photos you upload. If the ad is rejected we also store
          the reason, so you can see it and fix the ad.
        </Paragraph>
        <Paragraph>
          Photos are uploaded to our cloud storage provider and served from a
          content delivery network. That means a photo has a public web address
          - anyone who has that address can open the image, whether or not the
          listing is still live. Do not include documents, identity papers or
          anything else private in a listing photo.
        </Paragraph>
        <Paragraph>
          Once a listing is approved, everything in it is visible to everyone,
          including people who are not logged in. Your name appears on your
          listings.
        </Paragraph>
      </Section>

      <Section title="Messages">
        <Paragraph>
          Messages between you and an advertiser are stored on our servers so
          that the thread is still there the next time either of you opens the
          app. We record who sent each message, the text, and when it was
          delivered and read.
        </Paragraph>
        <Paragraph>
          Messages are not published anywhere and are not used to build an
          advertising profile of you. Our moderators do not browse message
          threads; they may need to look at one when investigating a report or a
          dispute involving it.
        </Paragraph>
      </Section>

      <Section title="Reviews and reports">
        <Paragraph>
          A review you leave for an advertiser - the rating and any comment - is
          shown publicly under that advertiser along with your name. You can
          only review an advertiser you have actually messaged.
        </Paragraph>
        <Paragraph>
          If you report a listing we store which listing it was, the reason you
          chose, your note, and which account filed the report. The report is
          anonymous to the advertiser: they are never shown who reported them,
          and the reason is not published on the listing.
        </Paragraph>
      </Section>

      <Section title="How listings perform">
        <Paragraph>
          So that advertisers can see whether their ad is working, we count
          three things against each listing: how often it appeared in a list or
          search result, how often someone opened it, and how often someone went
          on to message the advertiser. If you are logged in, the count records
          which account it came from; if you are not, it does not.
        </Paragraph>
        <Paragraph>
          What an advertiser sees is only the totals - impressions, visits,
          leads and the rate between them, by day. They are never shown who
          looked at their listing or when a particular person looked at it.
        </Paragraph>
        <Paragraph>
          The app stores a random session identifier on your device so that
          reloading the same listing twice is not counted as two separate
          visits. It is not linked to your identity and is not used for tracking
          you across other apps or websites.
        </Paragraph>
      </Section>

      <Section title="Boost payments">
        <Paragraph>
          Boosts are paid for through PayStation, a payment gateway in
          Bangladesh. When you buy a boost, the app opens PayStation&apos;s own
          checkout page in a browser and you enter your card or mobile wallet
          details there.
        </Paragraph>
        <Callout title="Your payment credentials never reach us">
          <Paragraph>
            Card numbers, PINs, OTPs and wallet passwords are entered on the
            gateway&apos;s page, not in the Jayga Lagbe app, and are never sent
            to or stored on our servers.
          </Paragraph>
        </Callout>
        <Paragraph>
          What we do store for each boost purchase is which account and listing
          it was for, the amount, the payment method you chose, the
          gateway&apos;s own transaction reference, and whether the payment
          succeeded or failed. To start a checkout we pass your name, and your
          email address or phone number, to PayStation - the gateway requires
          them to raise an invoice. PayStation handles that information under
          its own privacy policy.
        </Paragraph>
      </Section>

      <Section title="Notifications">
        <Paragraph>
          If you allow notifications, the app registers this device&apos;s push
          token with Firebase Cloud Messaging and stores that token against your
          account. It is what lets us alert you about a new message or a
          decision on one of your ads. The token identifies the app on this
          device, not you personally.
        </Paragraph>
        <Paragraph>
          The token is removed from your account when you log out, and you can
          turn notifications off at any time in your phone&apos;s settings.
        </Paragraph>
      </Section>

      <Section title="What stays on your phone only">
        <Paragraph>
          Some things the app remembers are never sent to us at all:
        </Paragraph>
        <BulletList
          items={[
            'Your saved listings. The list is stored on this device and is not attached to your account - which is why it does not follow you to another phone.',
            'Your recently viewed listings, the last twelve of them, kept the same way.',
            'Your login token, which is held in the device keystore (the Android Keystore or the iOS Keychain) rather than in ordinary app storage.',
          ]}
        />
        <Paragraph>Uninstalling the app clears all three.</Paragraph>
      </Section>

      <Section title="What an advertiser can see about you">
        <Paragraph>
          When you message an advertiser, they see your name and what you write.
          That is all. They are not given your email address, your phone number,
          your other conversations, the other listings you looked at, or
          anything else on your account.
        </Paragraph>
        <Paragraph>
          If you want an advertiser to have your phone number, you have to give
          it to them in a message. That is your choice to make, not something
          the app does for you.
        </Paragraph>
      </Section>

      <Section title="Permissions the app asks for">
        <Paragraph>
          The app asks for a permission only at the moment it needs it, and
          declining one does not lock you out of the rest of the app:
        </Paragraph>
        <BulletList
          items={[
            'Photos - so you can pick images from your gallery when you post or edit a listing. The app reads only the images you select, and they are resized on your device before upload.',
            'Notifications - so we can tell you about new messages and about approval or rejection of your ads.',
          ]}
        />
        <Paragraph>
          The app does not ask for your location, your contacts, your microphone
          or your call history, and it has no background access to anything on
          your phone.
        </Paragraph>
      </Section>

      <Section title="Who else handles your information">
        <Paragraph>
          We use a small number of service providers to run the app, and they
          only receive what they need to do their part:
        </Paragraph>
        <BulletList
          items={[
            'Our cloud hosting and database provider, which stores everything described above.',
            'Our cloud storage and content delivery provider, which stores and serves listing photos.',
            'PayStation, which processes boost payments.',
            'Firebase Cloud Messaging (Google), which delivers push notifications.',
            'Our email provider, which delivers notification and account emails.',
          ]}
        />
        <Paragraph>
          We do not sell your information, and we do not share it for anyone
          else&apos;s advertising. We will disclose information if we are
          legally required to by a competent authority in Bangladesh, or where
          it is necessary to investigate fraud or protect someone&apos;s safety.
        </Paragraph>
      </Section>

      <Section title="How long we keep things">
        <BulletList
          items={[
            'Account details are kept while your account exists.',
            'Listings are kept while they are live and for a period afterwards, so that a sold or removed listing can still be referred to in a dispute.',
            'Messages are kept so that both sides keep the thread; they are not deleted when one side deletes the listing.',
            'Payment records are kept for as long as accounting and tax rules in Bangladesh require.',
            'Reports and moderation decisions are kept so that repeat behaviour can be recognised.',
          ]}
        />
      </Section>

      <Section title="Deleting your account">
        <Paragraph>
          You can ask us to delete your account at any time by writing to{' '}
          {SUPPORT_EMAIL} from the email address on the account, or by telling
          us the phone number it uses. Deleting the account removes your profile
          and the personal details attached to it.
        </Paragraph>
        <Paragraph>
          Where an account has listings, message threads or payment history
          attached, some of that has to be dealt with first or kept for the
          periods described above - we will tell you exactly what happens to
          each part before we act. You can also simply delete your listings
          yourself and stop using the app.
        </Paragraph>
      </Section>

      <Section title="Keeping information safe">
        <Paragraph>
          Traffic between the app and our servers is encrypted. Passwords are
          stored only as hashes, your login token is held in the device
          keystore, and access to our systems is limited to the people who need
          it. No system is perfect, so please use a password you do not use
          anywhere else, and tell us straight away if you think someone else has
          got into your account.
        </Paragraph>
      </Section>

      <Section title="Children">
        <Paragraph>
          Jayga Lagbe is not intended for children. You must be at least 18 to
          create an account, which is also the age at which you can enter into a
          contract in Bangladesh. We do not knowingly collect information from
          anyone under 18; if we learn that we have, we will delete the account.
        </Paragraph>
      </Section>

      <Section title="Changes to this policy">
        <Paragraph>
          If we change how the app handles your information, we will update this
          page and change the date at the top. For a change that materially
          affects you - a new kind of data, or a new reason for using it - we
          will tell you in the app or by email before it takes effect, so that
          you can decide whether to carry on using Jayga Lagbe.
        </Paragraph>
      </Section>

      <Section title="Questions or requests">
        <Paragraph>
          For a copy of what we hold about you, a correction, a deletion or
          anything else in this policy, write to {SUPPORT_EMAIL}. We answer
          within two working days.
        </Paragraph>
      </Section>
    </InfoPage>
  );
}
