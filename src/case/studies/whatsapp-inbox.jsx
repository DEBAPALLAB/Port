import React from 'react';
import '../styles/whatsapp-inbox.css';
import { CasePage, CaseHero, Chapter, Prose, Statement, Numbers, Timeline } from '../kit.jsx';
import HeroStage from '../whatsapp/Hero.jsx';
import PrdHub from '../whatsapp/PrdHub.jsx';
import { LoopDiagram, LaneChart, UsersChart } from '../whatsapp/charts.jsx';
import { PriceBars, BreakEven } from '../whatsapp/Economics.jsx';
import DelayDemo from '../whatsapp/DelayDemo.jsx';
import { ProposalStage, ScreenSet } from '../whatsapp/Proposal.jsx';
import { SourceTable, TO_VERIFY } from '../whatsapp/Sources.jsx';

// Sources and caveats sit behind a quiet disclosure so the story reads cleanly.
function More({ children, label = 'Sources and caveats' }) {
  return <details className="wi-more" data-reveal><summary>{label}</summary><div>{children}</div></details>;
}

export default function WhatsappInbox() {
  return <CasePage slug="whatsapp-inbox">
    <CaseHero
      name="WhatsApp, in India"
      title="The inbox became a billboard."
      lede="Open WhatsApp and count how many of your first ten chats are people. This study is about why that number keeps shrinking, and how I would sort the rest."
      facts={[
        { label: 'Kind', value: 'Independent product study' },
        { label: 'Market', value: 'India, 2015 to 2026' },
        { label: 'Includes', value: 'Six PRDs and seven working prototypes' },
        { label: 'Evidence', value: 'Public sources, each rated for trust' },
        { label: 'Affiliation', value: 'None with Meta or WhatsApp' },
      ]}
      links={[{ href: '#prds', label: 'Read the six PRDs' }, { href: '#the-line', label: 'Start with the story' }]}
      stage={<HeroStage/>}
    />

    <Chapter id="prds" title="Six PRDs" heading="Six problems. Six PRDs." tone="paper">
      <div className="wi-intro">
        <Prose>
          <p>Sorting the inbox is one of six problems I looked at. Each has its own <strong>product requirements document</strong>, with a prototype you can try, the options I weighed, and how I would test it. Start with the one you care about.</p>
        </Prose>
      </div>
      <PrdHub/>
    </Chapter>

    <Chapter id="the-line" title="The line" heading="The oldest story in messaging." className="wi-line">
      <div className="wi-two">
        <div>
          <Statement cite="Aishwarya Rao, a WhatsApp user, quoted by Rest of World, October 2022">First it was email, then SMS. Now it's WhatsApp - can't escape the spam.</Statement>
          <Prose>
            <p>She said it after the first ten chats in her WhatsApp that day turned out to be company promotions. It sounds like a complaint. It is really a theory: a channel feels personal until businesses arrive, and then it stops being yours.</p>
          </Prose>
        </div>
        <div data-reveal><LoopDiagram/></div>
      </div>
      <h3 className="wi-figure-title" data-reveal style={{ marginTop: 'clamp(72px, 11vh, 128px)' }}>Every defence came late.</h3>
      <p className="case-caption" data-reveal style={{ marginBottom: 28 }}>When each channel got a structural answer to promotion. Most only sorted the mess.</p>
      <div data-reveal><LaneChart/></div>
      <More>Rest of World (Oct 2022), Storyboard18 (Feb 2026), Mailjet and OpenView on Gmail tabs, Wikipedia and MessageCentral on India's SMS rules, and Inc42, TechCrunch and Android Headlines on WhatsApp's controls. Some SMS and email dates come from search snippets; the last chapter rates each source.</More>
    </Chapter>

    <Chapter id="calling" title="Calling" heading="Calling began as a price hack." tone="paper">
      <div className="wi-intro">
        <Prose>
          <p>In January 2015 WhatsApp added calls. Indian phone companies still earned most of their money from voice, so a free call over data was a threat, not a feature. When Jio made domestic calls free in 2016, the price hack lost its point, and calling had to earn its place on <strong>video, weak signal and habit</strong>.</p>
        </Prose>
      </div>
      <div data-reveal><UsersChart/></div>
      <More>Straight lines join reported figures; they are not measurements between the dates, and definitions differ (users in 2015 and 2022, monthly users in 2016 and 2017). Sources: Business Today, Light Reading, Digit, Rest of World, MediaNama, Moneylife and Inc42. There is no public India calling figure after May 2017.</More>
    </Chapter>

    <Chapter id="jobs" title="Three jobs" heading="One number, three jobs.">
      <div className="wi-intro">
        <Prose>
          <p>The app is now a phone line, a business inbox and a login, all hanging from <strong>one phone number</strong>. A weakness in one job spills into the others.</p>
        </Prose>
      </div>
      <div className="wi-number" data-reveal><span>Your phone number</span><p>Your identity, your contacts and your account at once.</p></div>
      <div className="wi-jobs">
        <article className="wi-job" data-cat="people" data-reveal><h3>A phone line</h3><dl><div><dt>Replaced</dt><dd>Per-minute calls</dd></div><div><dt>The risk</dt><dd>Strangers and impersonators can ring any number</dd></div></dl></article>
        <article className="wi-job" data-cat="marketing" data-reveal><h3>A business inbox</h3><dl><div><dt>Replaced</dt><dd>SMS alerts and email</dd></div><div><dt>The risk</dt><dd>Unwanted promotion at scale</dd></div></dl></article>
        <article className="wi-job" data-cat="auth" data-reveal><h3>A login</h3><dl><div><dt>Replaced</dt><dd>SMS one-time codes</dd></div><div><dt>The risk</dt><dd>Account takeover through shared codes and linked devices</dd></div></dl></article>
      </div>
    </Chapter>

    <Chapter id="voices" title="What people say" heading="What people say." tone="paper">
      <div className="wi-intro">
        <Prose>
          <p>Nearly everyone in one big survey gets unwanted business messages every day. Here is how that sounds, and then my own week.</p>
        </Prose>
      </div>
      <Numbers items={[
        { label: 'get unwanted commercial messages every day', value: '96%', note: 'LocalCircles, 42,000+ people, Feb 2026. An online sample.' },
        { label: 'get eight or more a day', value: '19%', note: 'Up from 11% in 2023.' },
        { label: 'block senders, who return', value: '59%', note: 'From new numbers.' },
      ]}/>
      <div className="wi-quotes wi-quotes-row">
        <blockquote className="wi-quote" data-reveal><p>WhatsApp doesn't really feel very personal anymore.</p><footer>Aishwarya Rao, Rest of World, 2022</footer></blockquote>
        <blockquote className="wi-quote" data-reveal><p>Every 2nd message is from a random corporate account.</p><footer>Deepak Mehta, Rest of World, 2022</footer></blockquote>
        <blockquote className="wi-quote" data-reveal><p>I feel WhatsApp is a private mode of communication.</p><footer>Balvinder Singh, Rest of World, 2022</footer></blockquote>
      </div>
      <h3 className="wi-figure-title" data-reveal style={{ marginTop: 'clamp(64px, 10vh, 120px)' }}>And one student's week.</h3>
      <div className="wi-week">
        <article className="wi-week-col" data-tone="paper" data-reveal>
          <h3>What I value</h3>
          <ul><li>Order confirmations and tracking arrive in WhatsApp, and I can search them.</li><li>My functions sit in one app.</li><li>One-time codes on WhatsApp have worked well for me.</li></ul>
        </article>
        <article className="wi-week-col" data-tone="blush" data-reveal>
          <h3>What hurts</h3>
          <ul><li>Every shop that has my number now messages my WhatsApp.</li><li>I rarely used SMS, so SMS promotions never bothered me. WhatsApp is my main app, so promotions in it do.</li><li>If every company sent codes on WhatsApp, my chats would be flooded.</li></ul>
        </article>
      </div>
      <More>One student is a case, not a sample. The survey is online and self-selected. The three quotes are as reported by Rest of World in October 2022; the wording is to be checked against the page. Brands users named then: Tata Neu, Flipkart, Ajio, Croma and Zepto.</More>
    </Chapter>

    <Chapter id="economics" title="Why it happens" heading="Spam is cheap to send.">
      <div className="wi-intro">
        <Prose>
          <p>A promotion costs a sender <strong>less than a rupee</strong>, and being unwelcome costs almost nothing: block a sender and it comes back from a new number. Try the sums.</p>
        </Prose>
      </div>
      <PriceBars/>
      <h3 className="wi-figure-title" data-reveal style={{ marginTop: 'clamp(64px, 10vh, 120px)' }}>Would the sender still send it?</h3>
      <p className="case-caption" data-reveal style={{ marginBottom: 28 }}>At today's price a cart reminder pays for itself about eleven times over and a cold offer does not. Raise the price and the weakest senders stop first.</p>
      <BreakEven/>
      <More>Rates: vendor guides for January 2026. Pricing model and dates: Meta's developer documentation. The calculator's conversion rates, order size and margin are my assumptions, not data.</More>
    </Chapter>

    <Chapter id="already" title="What WhatsApp is doing" heading="WhatsApp is already moving." tone="paper">
      <div className="wi-intro">
        <Prose>
          <p>Since 2024 WhatsApp has added controls one by one. The newest is a folder for offers and updates, in testing. It helps, and it has two gaps: it <strong>waits up to 24 hours</strong>, and it sorts by how big the sender is, not by what the message is.</p>
        </Prose>
      </div>
      <Timeline label="WhatsApp's controls on business messages" items={[
        { date: 'Jul 2020', title: 'Opt-in relaxed', body: 'WhatsApp loosened its explicit opt-in rule, so consent for business messages became increasingly passive. Source: Rest of World, 2022.' },
        { date: 'Feb 2024', title: 'A cap on marketing messages', body: 'Meta limited how many marketing templates a person with an Indian number can receive from all businesses together. The numbers are not public. Both details come from vendor guides, not from Meta.' },
        { date: 'Nov 2024', title: 'Not interested, stop, resume', body: 'Controls to tell a business a message was unwanted entered testing with no release date. Source: TechCrunch.' },
        { date: 'Apr 2025', title: 'Preferences and broadcast limits', body: 'Message preferences, limits on broadcasts, template approval, and quality checks. Source: Business Today.' },
        { date: 'Oct 2025', title: 'A limit on unanswered messages', body: 'A monthly cap on messages sent to people who do not reply. Thresholds were not disclosed. Source: TechCrunch.' },
        { date: 'Jul 2026', title: 'The Offers and Updates folder', body: 'Messages from large businesses move into a folder after up to 24 hours, and you can switch it off. Small businesses are excluded and it is testing with selected partners. Sources: Android Headlines; ETV Bharat spotted it in an April beta.' },
      ]}/>
      <h3 className="wi-figure-title" data-reveal style={{ marginTop: 'clamp(64px, 10vh, 120px)' }}>What a 24-hour wait looks like.</h3>
      <DelayDemo/>
    </Chapter>

    <Chapter id="proposal" title="The proposal" heading="Sort by what the sender said.">
      <div className="wi-intro">
        <Prose>
          <p>Meta already asks every business to declare a category for each message. WhatsApp can sort on that label <strong>the moment a message arrives</strong>, with no guesswork and no wait. This is my proposal, not something WhatsApp has built. Make a message arrive and watch.</p>
        </Prose>
      </div>
      <ProposalStage/>
      <h3 className="wi-figure-title" data-reveal style={{ marginTop: 'clamp(72px, 11vh, 128px)' }}>Four screens.</h3>
      <p className="case-caption" data-reveal style={{ marginBottom: 28 }}>The same prototype, frozen on each screen. The code expiry is a design setting that PRD 2 tests.</p>
      <ScreenSet/>
      <p className="wi-next-prd" data-reveal>Business tab is PRD 1 and Verification inbox is PRD 2. <a href="#prds">See all six</a>.</p>
    </Chapter>

    <Chapter id="limits" title="Limits and sources" heading="What I could not verify." tone="paper">
      <div className="wi-two wi-limits">
        <div>
          <Prose>
            <p>This study is built from public sources. Where a source is a vendor, a press report or a search snippet, I say so. Every target, score and sample size in the PRDs is my own placeholder. Check these before sharing any of it:</p>
          </Prose>
          <ul className="wi-verify" data-reveal>
            {TO_VERIFY.map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div><SourceTable/></div>
      </div>
    </Chapter>

    <Chapter id="next-steps" title="What next" heading="What I would do next." tone="ink">
      <Statement>The sorting rule is a hypothesis. The cheapest way to test it is on real inboxes.</Statement>
      <Prose>
        <p>Ask ten volunteers to share, with names removed, a week of the business messages they received. Sort each by the category the sender would have declared and count where it lands. That shows how often the rule would put a time-sensitive message in the wrong place.</p>
        <p>Then ask five people (a parent, a grandparent, a hostel friend, a shopkeeper and someone abroad) three questions about calls, business messages and codes, and keep their words exactly.</p>
      </Prose>
    </Chapter>
  </CasePage>;
}
