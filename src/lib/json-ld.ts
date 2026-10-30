/** JSON sicuro da inserire dentro <script type="application/ld+json">. */
export function jsonPerScript(dati: unknown): string {
  return JSON.stringify(dati).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}
