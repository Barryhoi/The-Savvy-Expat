// Accept provider messages only from this calendar, including its nested frames.
export function isOwnCalendarMessage(event: MessageEvent, frame: HTMLIFrameElement | null) {
  if (!/^https:\/\/([a-z0-9-]+\.)*calendly\.com$/.test(event.origin) || !frame?.contentWindow) return false;
  try {
    let source = event.source as Window | null;
    for (let depth = 0; source && depth < 10; depth++) {
      if (source === frame.contentWindow) return true;
      if (source === source.parent) break;
      source = source.parent;
    }
  } catch { return false; }
  return false;
}

