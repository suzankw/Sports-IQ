import { useState } from 'react';

/** Shares the current page: the phone's share sheet (WhatsApp, email…), or copies the link on desktop. */
export function useShare() {
  const [status, setStatus] = useState('');

  const share = async (title) => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setStatus('Link copied');
    } catch (error) {
      // Closing the share sheet isn't a failure worth reporting.
      if (error.name !== 'AbortError') setStatus("Couldn't share — copy the address bar instead");
    }
  };

  return { share, status };
}
