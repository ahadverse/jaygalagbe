import { BulletList, InfoPage, Paragraph, Section } from './legal-layout';

export function AboutScreen() {
  return (
    <InfoPage
      eyebrow="About"
      title="About Jayga Lagbe"
      intro="A property classifieds app for Bangladesh, built around one idea: a listing you can trust is worth more than a hundred you cannot."
    >
      <Section title="What you will find here">
        <Paragraph>
          Jayga Lagbe covers two things, and only two things, so that both are
          done properly:
        </Paragraph>
        <BulletList
          items={[
            'Jayga Jomi - land for sale, whether residential, commercial or agricultural.',
            'Basha Bhara - houses, flats, rooms and sublets for rent.',
          ]}
        />
        <Paragraph>
          Every listing is posted by the person behind it - an owner, a family
          member handling the sale, or a manager acting for them. There is no
          shadow inventory and no listings copied in from elsewhere.
        </Paragraph>
      </Section>

      <Section title="A person reads every ad">
        <Paragraph>
          Nothing goes live automatically. Every ad submitted to Jayga Lagbe
          waits in a queue until a moderator has read the title, the
          description, the price and the photos, and is satisfied that it
          describes a real property in the right section of the app.
        </Paragraph>
        <Paragraph>
          If something is wrong, the ad is rejected with a reason - not a silent
          disappearance. The advertiser sees exactly what needs fixing, corrects
          it and sends the ad back for another look. Most rejections are honest
          mistakes, and most of them are fixed in a few minutes.
        </Paragraph>
        <Paragraph>
          A published ad is not beyond reach either. If a listing turns out to
          be misleading after it has gone live, it can be taken down.
        </Paragraph>
      </Section>

      <Section title="Free to browse, free to post">
        <Paragraph>
          You do not need an account to browse Jayga Lagbe. Search, filters,
          photos, prices and locations are all open to anyone who opens the app.
        </Paragraph>
        <Paragraph>
          Posting an ad is free as well. The only thing we charge for is a
          boost, which lifts a listing higher for a few days. A boost changes
          nothing about how the ad is reviewed - a boosted ad goes through the
          same moderation as every other one, and paying does not make a
          rejected ad acceptable.
        </Paragraph>
      </Section>

      <Section title="Why contacting an advertiser needs an account">
        <Paragraph>
          Contact details sit behind a free account. That single step is what
          keeps phone numbers from being scraped off the site in bulk and sold
          on, and it is why advertisers here do not drown in automated calls the
          week after they post.
        </Paragraph>
        <Paragraph>
          Creating an account takes a name and either an email address or a
          phone number. Nothing more.
        </Paragraph>
      </Section>

      <Section title="Conversations stay in the app">
        <Paragraph>
          When you contact an advertiser, the conversation happens in Jayga
          Lagbe rather than moving straight to a phone call. That keeps the
          whole thread - what was promised, what price was quoted, what was said
          about the papers - in one place that both sides can open again later.
        </Paragraph>
        <Paragraph>
          It also means you can rate an advertiser afterwards. Only people who
          have actually spoken to an advertiser can review them, so the ratings
          you read come from real conversations.
        </Paragraph>
      </Section>

      <Section title="What we do not do">
        <Paragraph>
          We are not an agent, a broker or a party to your deal. We do not own
          property, we do not take a commission on a sale or a rental, and no
          money for a property ever passes through Jayga Lagbe. Visit the
          property, meet the owner and check the ownership papers before you
          part with anything.
        </Paragraph>
      </Section>
    </InfoPage>
  );
}
