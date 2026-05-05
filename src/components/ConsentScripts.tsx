'use client';

import { useEffect } from 'react';
import { getStoredConsent, CONSENT_EVENT, type ConsentStatus } from '@/components/CookieBanner';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-KV3PNKPG';
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-7863265866651285';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

function initDataLayer() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
}

function setConsentDefaults() {
  initDataLayer();
  // Consent Mode v2 — deny all by default before user decides
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 2000,
  });
}

function grantConsent() {
  initDataLayer();
  window.gtag('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
  });
}

function loadGtm() {
  if (document.getElementById('gtm-script')) return;
  const script = document.createElement('script');
  script.id = 'gtm-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);

  // GTM noscript iframe
  const ns = document.createElement('noscript');
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
  iframe.height = '0';
  iframe.width = '0';
  iframe.style.display = 'none';
  iframe.style.visibility = 'hidden';
  ns.appendChild(iframe);
  document.body.insertBefore(ns, document.body.firstChild);
}

function loadAdSense() {
  if (document.getElementById('adsense-script')) return;
  const script = document.createElement('script');
  script.id = 'adsense-script';
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`;
  document.head.appendChild(script);
}

function applyConsent(status: ConsentStatus) {
  if (status === 'accepted') {
    grantConsent();
    loadGtm();
    loadAdSense();
  } else {
    // Denied — GTM still loads for server-side pings but with denied consent
    loadGtm();
  }
}

export default function ConsentScripts() {
  useEffect(() => {
    // Set Consent Mode v2 defaults before any scripts fire
    setConsentDefaults();

    const stored = getStoredConsent();
    if (stored) {
      applyConsent(stored);
    }

    function onConsentUpdate(e: Event) {
      const status = (e as CustomEvent<{ status: ConsentStatus }>).detail.status;
      applyConsent(status);
    }

    window.addEventListener(CONSENT_EVENT, onConsentUpdate);
    return () => window.removeEventListener(CONSENT_EVENT, onConsentUpdate);
  }, []);

  return null;
}
