import React from 'react';

// An open book; on hover of its link the top page turns over (see .book-icon in styles.css).
export default function BookIcon() {
  return <svg className="book-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5"/>
    <path d="M12 6.5c2-1.5 5-2 8.5-1.5v13c-3.5-.5-6.5 0-8.5 1.5"/>
    <path className="book-icon-page" d="M12 6.5c1.8-1.2 4.2-1.6 6.6-1.4v12.6c-2.4-.2-4.8.2-6.6 1.4z" fill="var(--book-page, #fff)"/>
    <path d="M12 6.5v13"/>
  </svg>;
}
