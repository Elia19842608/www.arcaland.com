import { describe, it, expect } from 'vitest';
import { jsonPerScript } from '../../src/lib/json-ld';

describe('jsonPerScript', () => {
  it('neutralizza la chiusura dello script', () => {
    const s = jsonPerScript({ description: 'ciao </script><script>alert(1)</script>' });
    expect(s).not.toContain('</script>');
    expect(JSON.parse(s).description).toBe('ciao </script><script>alert(1)</script>');
  });
});
