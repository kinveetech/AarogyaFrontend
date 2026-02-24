export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const dns = await import('dns')
    // Force IPv4 DNS resolution — the cluster has no IPv6 internet connectivity,
    // causing Node.js built-in fetch (undici) to hang on AAAA records.
    dns.setDefaultResultOrder('ipv4first')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const origLookup = dns.lookup as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dns.lookup = ((...args: any[]) => {
      const [hostname, optionsOrCb, maybeCallback] = args
      if (typeof optionsOrCb === 'function') {
        return origLookup(hostname, { family: 4 }, optionsOrCb)
      }
      const opts =
        typeof optionsOrCb === 'number' ? { family: 4 } : { ...optionsOrCb, family: 4 }
      return origLookup(hostname, opts, maybeCallback)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any
  }
}
