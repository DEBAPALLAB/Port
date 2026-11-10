import React from 'react';
import { createRoot } from 'react-dom/client';
import '../case/case.css';
import '../case/styles/whatsapp-inbox.css';
import './social.css';
import { InboxPhone } from '../case/whatsapp/Phone.jsx';

function Card() {
  return <main className="sx" id="card">
    <header className="sx-head">
      <p className="sx-kicker">A WhatsApp product study</p>
      <h1><span className="sx-big">11<i>/</i>16</span></h1>
      <p className="sx-line">chats in my WhatsApp <u>aren't people.</u></p>
    </header>
    <section className="sx-panels">
      <figure data-side="before"><figcaption><b>Today</b><span>Every sender gets the same inbox</span></figcaption><div className="sx-screen"><InboxPhone mode="asis" frozen reveal/></div></figure>
      <figure data-side="after"><figcaption><b>Sorted</b><span>People stay. The rest get a place.</span></figcaption><div className="sx-screen"><InboxPhone mode="sorted" frozen/></div></figure>
    </section>
    <p className="sx-foot">Independent study, not affiliated with Meta · fictional chats · dev.lucide.in/work/whatsapp-inbox</p>
  </main>;
}
createRoot(document.getElementById('root')).render(<Card/>);
