import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { track } from '../../analytics.js';
import { CATS, MESSAGES, ARRIVALS, count } from './data.js';

// The prototype is a redraw made for this page. It is not WhatsApp's interface and uses none of its marks.
export const PHONE_W = 360, PHONE_H = 740;

export function useMedia(query) {
  const [match, setMatch] = useState(() => typeof matchMedia === 'function' ? matchMedia(query).matches : false);
  useEffect(() => {
    const list = matchMedia(query), on = () => setMatch(list.matches);
    on(); list.addEventListener('change', on);
    return () => list.removeEventListener('change', on);
  }, [query]);
  return match;
}

// Scales a fixed-size drawing to the room it has. With fitHeight it also respects the host's height.
export function FitBox({ width, height, fitHeight = false, maxScale = 1, children, className = '' }) {
  const hostRef = useRef(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () => {
      const box = host.getBoundingClientRect();
      const byWidth = box.width / width;
      const byHeight = fitHeight && box.height > 0 ? box.height / height : Infinity;
      setScale(Math.max(.34, Math.min(maxScale, byWidth, byHeight)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, [width, height, fitHeight, maxScale]);
  return <div ref={hostRef} className={`wi-fit ${className}`} style={fitHeight ? { height: '100%' } : undefined}>
    <div className="wi-fit-size" style={{ width: width * scale, height: height * scale }}>
      <div className="wi-fit-inner" style={{ width, height, transform: `scale(${scale})` }}>{children}</div>
    </div>
  </div>;
}

function Icon({ name }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  if (name === 'back') return <svg {...common}><path d="M15 5l-7 7 7 7"/></svg>;
  if (name === 'bag') return <svg {...common}><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>;
  if (name === 'lock') return <svg {...common}><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>;
  if (name === 'plus') return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
  if (name === 'dots') return <svg {...common}><circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/></svg>;
  if (name === 'copy') return <svg {...common} width="18" height="18"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 012-2h9"/></svg>;
  return null;
}

const visibleScreenForHint = screen => screen === 'chats';
const initials = name => name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase();

function Avatar({ msg, tinted }) {
  const cat = CATS[msg.cat];
  return <span className="wi-avatar" style={tinted ? { background: cat.tint, color: cat.deep } : undefined} data-group={msg.group || undefined}>{initials(msg.name)}</span>;
}

function ChatRow({ msg, hidden, tinted, fresh }) {
  return <div className="wi-row" data-hidden={hidden || undefined} data-fresh={fresh || undefined} aria-hidden={hidden || undefined}>
    <div className="wi-row-clip">
      <button type="button" className="wi-chat" tabIndex={hidden ? -1 : 0}>
        <Avatar msg={msg} tinted={tinted}/>
        <span className="wi-chat-body">
          <span className="wi-chat-top"><strong>{msg.name}</strong><time>{msg.time}</time></span>
          <span className="wi-chat-bottom"><span className="wi-preview">{msg.text}</span>{msg.unread ? <i className="wi-badge">{msg.unread}</i> : null}</span>
        </span>
      </button>
    </div>
  </div>;
}

function PinnedRow({ kind, hidden, countLabel, preview, badge, onOpen }) {
  const bag = kind === 'business';
  return <div className="wi-row" data-hidden={hidden || undefined} aria-hidden={hidden || undefined}>
    <div className="wi-row-clip">
      <button type="button" className="wi-chat wi-pinned" data-kind={kind} tabIndex={hidden ? -1 : 0} onClick={onOpen}>
        <span className="wi-avatar wi-avatar-icon" data-kind={kind}><Icon name={bag ? 'bag' : 'lock'}/></span>
        <span className="wi-chat-body">
          <span className="wi-chat-top"><strong>{bag ? 'Business' : 'Verification'}</strong><time>{countLabel}</time></span>
          <span className="wi-chat-bottom"><span className="wi-preview">{preview}</span>{badge ? <i className="wi-badge" data-kind={kind}>{badge}</i> : null}</span>
        </span>
      </button>
    </div>
  </div>;
}

function ChatsScreen({ mode, list, onOpen, bizCount, codeCount, latestBiz, reveal }) {
  const sorted = mode === 'sorted';
  return <div className="wi-chats">
    <header className="wi-bar">
      <h3>Chats</h3>
      <span className="wi-bar-icons"><Icon name="dots"/></span>
    </header>
    <div className="wi-chips" aria-hidden="true"><span data-on="true">All</span><span>Unread</span><span>Groups</span></div>
    <div className="wi-list">
      <PinnedRow kind="business" hidden={!sorted} countLabel="now" preview={latestBiz} badge={bizCount} onOpen={() => onOpen('business')}/>
      <PinnedRow kind="verify" hidden={!sorted || codeCount === 0} countLabel="now" preview={`${codeCount} ${codeCount === 1 ? 'code' : 'codes'}, they expire soon`} badge={codeCount} onOpen={() => onOpen('verify')}/>
      {list.map(msg => <ChatRow key={msg.id} msg={msg} hidden={sorted && msg.cat !== 'people'} fresh={msg.fresh} tinted={reveal}/>)}
    </div>
    <span className="wi-fab" aria-hidden="true"><Icon name="plus"/></span>
  </div>;
}

function BusinessScreen({ list, onBack, initialTab = 'utility' }) {
  const [tab, setTab] = useState(initialTab);
  const shown = list.filter(msg => msg.cat === tab);
  const updates = count(list, 'utility'), offers = count(list, 'marketing');
  return <div className="wi-sub">
    <header className="wi-bar"><button type="button" className="wi-back" onClick={onBack} aria-label="Back to chats"><Icon name="back"/></button><h3>Business</h3></header>
    <div className="wi-tabs" role="tablist" aria-label="Business messages">
      <button type="button" role="tab" aria-selected={tab === 'utility'} onClick={() => setTab('utility')}>Updates <i>{updates}</i></button>
      <button type="button" role="tab" aria-selected={tab === 'marketing'} onClick={() => setTab('marketing')}>Offers <i>{offers}</i></button>
    </div>
    <p className="wi-note">{tab === 'utility' ? 'Delivery, tickets and receipts. These still notify you.' : 'Sales and reminders. No sound, no badge in your chat list.'}</p>
    <div className="wi-list" key={tab}>
      {shown.map(msg => <ChatRow key={msg.id} msg={msg} tinted/>)}
    </div>
    <p className="wi-foot">Sorted by the category each business declared when it sent the message.</p>
  </div>;
}

function CodeCard({ msg, onExpire, frozen }) {
  const [left, setLeft] = useState(frozen ? Math.round(msg.ttl * .8) : msg.ttl);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (frozen) return;
    const timer = setInterval(() => setLeft(value => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [frozen]);
  useEffect(() => { if (left === 0) { const wait = setTimeout(() => onExpire(msg.id), 900); return () => clearTimeout(wait); } }, [left]);
  const mm = String(Math.floor(left / 60)), ss = String(left % 60).padStart(2, '0');
  return <article className="wi-code" data-expired={left === 0 || undefined}>
    <div className="wi-code-top"><strong>{msg.name}</strong><span>{left === 0 ? 'Expired' : `Expires in ${mm}:${ss}`}</span></div>
    <p className="wi-code-digits" aria-label={`Code ${msg.code}`}>{msg.code}</p>
    <div className="wi-code-meter" aria-hidden="true"><b style={{ width: `${(left / msg.ttl) * 100}%` }}/></div>
    <button type="button" className="wi-copy" onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1400); }} disabled={left === 0}><Icon name="copy"/>{copied ? 'Copied' : 'Copy code'}</button>
  </article>;
}

function VerifyScreen({ list, onBack, onExpire, frozen }) {
  const codes = list.filter(msg => msg.cat === 'auth');
  return <div className="wi-sub">
    <header className="wi-bar"><button type="button" className="wi-back" onClick={onBack} aria-label="Back to chats"><Icon name="back"/></button><h3>Verification</h3></header>
    <p className="wi-warn"><strong>Never share a code.</strong> No bank, college or delivery service will ask you to read one out.</p>
    <div className="wi-codes">
      {codes.length === 0 && <p className="wi-empty">No codes right now. New codes arrive here the moment they are sent, and disappear when they expire.</p>}
      {codes.map(msg => <CodeCard key={msg.id} msg={msg} onExpire={onExpire} frozen={frozen}/>)}
    </div>
    <p className="wi-foot">Codes arrive instantly, cannot be replied to, and are deleted when they expire. The expiry time is a design setting that PRD 2 tests.</p>
  </div>;
}

// mode: 'asis' | 'sorted'. When showSend is on, the visitor can make messages arrive and see how each is treated.
export function InboxPhone({ mode, fitHeight = false, showSend = false, onArrival, initialScreen = 'chats', initialTab, frozen = false, hint = false, sendIds, reveal = false }) {
  const sorted = mode === 'sorted';
  const [screen, setScreen] = useState(initialScreen);
  const [messages, setMessages] = useState(MESSAGES);
  const [banner, setBanner] = useState(null);
  const serial = useRef(0), bannerTimer = useRef(0);

  const prevMode = useRef(mode);
  useEffect(() => { if (prevMode.current !== mode) { prevMode.current = mode; setScreen('chats'); } }, [mode]);
  useEffect(() => () => clearTimeout(bannerTimer.current), []);

  const arrive = useCallback(item => {
    serial.current += 1;
    const id = `n${serial.current}`;
    setMessages(current => [{ ...item, id, time: 'now', fresh: true, unread: item.cat === 'people' ? 1 : undefined }, ...current]);
    const silent = sorted && item.cat === 'marketing';
    clearTimeout(bannerTimer.current);
    if (!silent) {
      setBanner({ key: id, name: item.cat === 'auth' && sorted ? 'Verification' : item.name, text: item.cat === 'auth' && sorted ? 'A new code is ready' : item.text });
      bannerTimer.current = setTimeout(() => setBanner(null), 2600);
    } else setBanner(null);
    track('message_sent_to_prototype', { kind: item.cat, mode, silent });
    onArrival?.(item, sorted ? item.sorted : item.asIs, silent);
  }, [sorted, mode, onArrival]);

  const removeCode = useCallback(id => setMessages(current => current.filter(msg => msg.id !== id)), []);

  const bizList = messages.filter(msg => msg.cat === 'marketing' || msg.cat === 'utility');
  const codeList = messages.filter(msg => msg.cat === 'auth');
  const latestBiz = bizList[0] ? `${bizList[0].name}: ${bizList[0].text}` : 'Nothing new';
  // In the sorted inbox a code or a business row appears only in its own place.
  const visibleScreen = sorted ? screen : 'chats';

  return <div className="wi-device" data-stage={frozen ? undefined : 'ready'} data-mode={mode} data-hint={(hint && sorted && visibleScreenForHint(screen)) || undefined} inert={frozen || undefined} aria-hidden={frozen || undefined}>
    <FitBox width={PHONE_W} height={PHONE_H} fitHeight={fitHeight}>
      <div className="wi-phone" data-ui role="group" aria-label={sorted ? 'Illustrative inbox, sorted by category' : 'Illustrative inbox, as it is today'}>
        <div className="wi-glass">
        <div className="wi-status" aria-hidden="true"><span>9:41</span><span className="wi-status-dots"><i/><i/><i/></span></div>
        <div className="wi-screen" key={visibleScreen}>
          {visibleScreen === 'chats' && <ChatsScreen mode={mode} list={messages} onOpen={setScreen} bizCount={bizList.length} codeCount={codeList.length} latestBiz={latestBiz} reveal={reveal}/>}
          {visibleScreen === 'business' && <BusinessScreen list={bizList} onBack={() => setScreen('chats')} initialTab={initialTab}/>}
          {visibleScreen === 'verify' && <VerifyScreen list={codeList} onBack={() => setScreen('chats')} onExpire={removeCode} frozen={frozen}/>}
        </div>
        {banner && <div className="wi-banner" key={banner.key} role="status"><strong>{banner.name}</strong><span>{banner.text}</span></div>}
        </div>
      </div>
    </FitBox>
    {showSend && <div className="wi-send" role="group" aria-label="Make a message arrive">
      {ARRIVALS.filter(item => !sendIds || sendIds.includes(item.id)).map(item => <button key={item.id} type="button" className="case-chip" onClick={() => arrive(item)} style={{ '--cat': CATS[item.cat].color }}><i aria-hidden="true"/>{item.label}</button>)}
    </div>}
  </div>;
}
