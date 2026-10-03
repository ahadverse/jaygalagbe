import { BOOST_TIERS } from '../../features/boost/types';
import { formatPrice } from '../../lib/format';
import {
  BulletList,
  Callout,
  InfoPage,
  Paragraph,
  Section,
} from './legal-layout';

// PLACEHOLDER: swap for the registered legal entity name before launch
const LEGAL_ENTITY = 'Jayga Lagbe';
// PLACEHOLDER: swap for real support address before launch
const SUPPORT_EMAIL = 'support@jaygalagbe.com';

// Derived from the same table the boost screen charges from, so the prices
// quoted here cannot drift away from the ones actually taken at checkout.
const boostPriceLines = BOOST_TIERS.map(
  (tier) => `${tier.label} - ${formatPrice(tier.priceBdt)}. ${tier.blurb}`,
);

export function TermsScreen() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Terms of Service"
      intro="These are the rules for using Jayga Lagbe. By creating an account or posting a listing you agree to them, so they are written to be read rather than skipped."
      lastUpdated="29 September 2026"
    >
      <Section title="Who can use Jayga Lagbe">
        <Paragraph>
          You must be at least 18 years old and able to enter into a contract
          under the laws of Bangladesh. The details on your account - your name,
          and your email address or phone number - must be your own and must be
          accurate, and you must keep them up to date.
        </Paragraph>
        <Paragraph>
          You are responsible for what happens under your account. Keep your
          password to yourself, and tell us if you think someone else has access
          to it.
        </Paragraph>
      </Section>

      <Section title="What you may list">
        <Paragraph>
          A listing must be for real property in Bangladesh that you are
          entitled to advertise - because you own it, or because the owner has
          asked you to. Every listing must go in the right section: land for
          sale under Jayga Jomi, rentals under Basha Bhara.
        </Paragraph>
        <Paragraph>
          The price, location and property details must be the ones you are
          actually offering, and the photos must be of that property and yours
          to use.
        </Paragraph>
      </Section>

      <Section title="What is not allowed">
        <BulletList
          items={[
            'Property that does not exist, is not for sale or rent, or that you have no right to advertise.',
            'The same property posted more than once, or reposted to push it back up the list.',
            'A listing filed under the wrong sector - a rental posted as land for sale, or the reverse.',
            'A price that is not the real asking price, including a low figure used to attract calls.',
            'Photos taken from another listing, another website or another property.',
            'Photos too poor or too generic to show what is actually being offered.',
            'Contact details, external links or promotional text hidden inside the title, description or photos.',
            'Anything unlawful, abusive, or aimed at collecting people’s details for use elsewhere.',
          ]}
        />
      </Section>

      <Section title="Review before publishing">
        <Paragraph>
          Every ad is read by a moderator before it appears. Until then it sits
          as pending and is not visible to anyone else.
        </Paragraph>
        <Paragraph>
          If your ad is rejected you are told the reason. Correct what was
          flagged and submit it again - a rejected ad can be fixed and
          resubmitted as many times as it takes. Repeatedly submitting the same
          rejected ad without changing it, however, is treated as misuse.
        </Paragraph>
        <Paragraph>
          Approval is not permanent. We may take a live listing down at any time
          if it turns out to break these rules, if it draws credible reports, or
          if we are required to remove it. We will normally tell you why.
        </Paragraph>
      </Section>

      <Section title="Boosts">
        <Paragraph>
          Posting is free. A boost is the one paid feature: it lifts your
          listing higher in its section for a fixed number of days. The tiers
          are:
        </Paragraph>
        <BulletList items={boostPriceLines} />
        <Paragraph>
          A boost is bought through the PayStation gateway and activates once
          the gateway confirms the payment - not at the moment you press pay. If
          a payment fails you are not charged and the boost does not start.
        </Paragraph>
        <Paragraph>
          Once a boost has started running it is not refundable, because the
          placement you paid for has been delivered. A boost does not buy
          approval: a boosted listing is reviewed exactly like any other, and if
          it is rejected or removed for breaking these rules, the boost is not
          refunded either. If a boost never ran because something went wrong on
          our side, write to {SUPPORT_EMAIL} and we will put it right.
        </Paragraph>
      </Section>

      <Section title="Messages and reports">
        <Paragraph>
          Messaging is for talking about the listing it belongs to. Do not use
          it to harass anyone, to advertise something else, to send links to
          other sites, or to press someone for money or personal documents.
        </Paragraph>
        <Paragraph>
          If a listing or a conversation looks wrong, report it - the Report
          button is on every live listing. Reports are anonymous to the person
          reported. Filing false reports to damage a competitor is itself a
          breach of these terms.
        </Paragraph>
        <Paragraph>
          You may review an advertiser you have messaged. A review must describe
          your own experience; it must not be paid for, traded or written about
          yourself.
        </Paragraph>
      </Section>

      <Section title="We are not part of your deal">
        <Callout title="Check the property and the papers before you pay anything">
          <Paragraph>
            {LEGAL_ENTITY} never handles money between a buyer or tenant and an
            advertiser. We are not an agent, a broker or a party to any
            agreement you reach. Visit the property in person, meet the owner,
            and have the ownership and mutation papers checked by your own
            lawyer before you pay an advance, a deposit or any other sum.
          </Paragraph>
        </Callout>
        <Paragraph>
          Moderation is a genuine check, but it is a check on what a listing
          says - not a survey of the property, a valuation, or a verification of
          title. We do not inspect properties and we cannot confirm that anyone
          is the lawful owner of what they advertise. No one should ever ask you
          to send money through Jayga Lagbe, because there is no way to do so.
        </Paragraph>
      </Section>

      <Section title="Limits on our responsibility">
        <Paragraph>
          Jayga Lagbe is provided as it is. We work to keep it accurate and
          available, but we do not promise that every listing is accurate, that
          any transaction will complete, or that the service will never be
          interrupted.
        </Paragraph>
        <Paragraph>
          To the extent the law allows, we are not liable for loss arising out
          of a dealing between you and another user, for a property that turns
          out to be other than described, or for indirect or consequential loss.
          Where we are held liable in connection with a paid feature, our
          liability is limited to the amount you paid for that feature.
        </Paragraph>
        <Paragraph>
          Nothing here limits any liability that cannot be limited under the law
          of Bangladesh.
        </Paragraph>
      </Section>

      <Section title="Suspension and closure">
        <Paragraph>
          We may suspend or close an account that breaks these terms, that posts
          fraudulent listings, or that is used to harass other people. In
          serious cases - fraud in particular - we may act without warning, and
          any boost still running is forfeited.
        </Paragraph>
        <Paragraph>
          You can stop using Jayga Lagbe whenever you like, and you can ask us
          to delete your account. How that works, and what we keep afterwards,
          is set out in the Privacy Policy.
        </Paragraph>
      </Section>

      <Section title="Changes to these terms">
        <Paragraph>
          We may update these terms as the app changes. The date at the top
          shows when they last changed, and for a material change we will tell
          you in the app before it takes effect. Continuing to use Jayga Lagbe
          after that means you accept the updated terms.
        </Paragraph>
      </Section>

      <Section title="Governing law">
        <Paragraph>
          These terms are governed by the laws of Bangladesh, and the courts of
          Bangladesh have jurisdiction over any dispute arising from them.
        </Paragraph>
      </Section>

      <Section title="Contact">
        <Paragraph>
          Questions about these terms go to {SUPPORT_EMAIL}.
        </Paragraph>
      </Section>
    </InfoPage>
  );
}
