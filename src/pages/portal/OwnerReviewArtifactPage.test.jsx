import React from 'react';
import { TextDecoder } from 'util';
// This suite also runs in the repository's general Jest/jsdom configuration.
if (typeof globalThis.TextDecoder === 'undefined') globalThis.TextDecoder = TextDecoder;
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { OwnerReviewContent } from './OwnerReviewArtifactPage.jsx';
test('review renders limitations and escapes active HTML',()=>{
 const source='# Owner review\n<script>alert("unsafe")</script>';
 const base64=btoa(source);
 const markup=renderToStaticMarkup(<MemoryRouter initialEntries={['/portal/hq/review']}><OwnerReviewContent artifact={{
 filename:'review.md',assignmentId:'1219397649342143',sha256:'a'.repeat(64),
 contentBase64:base64,reviewStatus:'REVIEW_ONLY',recipientEligibility:'NOT_CLEARED',outboundStatus:'NOT_SENT'
 }}/></MemoryRouter>);
 expect(markup).toContain('REVIEW_ONLY');expect(markup).toContain('NOT_CLEARED');
 expect(markup).toContain('NOT_SENT');expect(markup).toContain('&lt;script&gt;');
 expect(markup).not.toContain('<script>');
});
