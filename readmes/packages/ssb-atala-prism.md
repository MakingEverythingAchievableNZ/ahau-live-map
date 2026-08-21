This wraps an outside "digital credentials" identity service called Atala PRISM. The
idea: a trusted person in a community — a kaitiaki — can issue someone a verifiable
digital credential, like proof of membership, that they can later present elsewhere to
prove who they are or what group they belong to.

It's Āhau-only (Pātaka doesn't use it). As of the August 2026 monorepo consolidation,
it's the source of a known, currently-open problem: a pinned dependency version fixed
an earlier crash where the GraphQL server wouldn't start at all, but the wallet SDK
integration itself is still broken, and the Āhau desktop app's own stale plugin
version means its dev server won't start until that's untangled.
