# Āhau — under the hood

Āhau is a family-tree (whakapapa) app that works peer-to-peer — it doesn't
depend on a central company's server to keep working.

Think of the Āhau app as a single screen on your phone or computer. Behind
that screen, it talks to about three dozen smaller building blocks, often
called plugins or packages, all living together in one shared codebase. Each
time you do something, like open a family tree or save a photo, the app
passes the request through a chain of these pieces to get it done. That's
why there's so much behind one app — even though, as of August 2026, it's
all one codebase instead of dozens of separate ones.

This page explains, without jargon or a wall of package names, what those
groups of pieces do. For a browsable, searchable card for every individual
piece, see `index.html` — including a step-by-step walk through what
actually happens when you tap something in the app. For the full technical
picture, see `ARCHITECTURE.md` and the interactive `graph.html`.

## What is Scuttlebutt, and why was Āhau built with it?

Most apps store your information on a company's server somewhere else in
the world. If that company disappears, changes its rules, or gets hacked,
your information can disappear or leak with it.

Āhau is built on a different kind of technology called **Secure
Scuttlebutt**, or SSB for short. Instead of one central server, each
person's copy of Āhau keeps its own record of what it knows, and devices
share updates directly with each other, peer to peer, whenever they
connect — over the internet, or even just over local wifi at a gathering
with no internet at all.

This matters for whakapapa specifically. Family and cultural knowledge is
often sensitive, and whanau want to decide for themselves who gets to see
it, not hand that decision to a company. Building on SSB means:

- **No single company holds everyone's whakapapa.** There's no central
  database to be sold, shut down, or broken into all at once.
- **Whanau control who sees what**, using encryption, down to a single
  private group of people.
- **The app still works without reliable internet.** Devices catch up with
  each other whenever they're next in range, which suits communities and
  places where internet access isn't guaranteed.

The trade-off is the one covered above: building this way means writing
more of the underlying plumbing yourself, rather than relying on a
company's ready-made server tools, which is why there are so many small
pieces behind one app.

## The apps people actually use (Apps)

The family-tree app that whanau use on a phone or computer (**Āhau**), plus
an always-on helper (**Pātaka**) that keeps backups running even when
you're offline.

## The parts that know what a family tree is (Domain SSB plugins)

The parts of the system that know what a family tree, a person's profile, or
a story actually is, including the piece that records who's related to whom
and turns those links into a family tree you can explore.

## The foundational plumbing (Core data & storage layer)

The foundational plumbing that makes any kind of record-keeping possible on
this peer-to-peer network — storing files, managing edit history, handling
encryption keys, and enforcing who's allowed to see what.

## The translation layer (GraphQL layer)

The translation layer that lets the app's screens ask questions like "show
me this person's family tree" and get an answer back.

## What changed in August 2026

Until 19 August 2026, all of the above lived in 61 separate repositories.
They've since been consolidated into a single shared codebase (a
"monorepo") — same pieces, same boundaries between them, just no longer
scattered across dozens of places to check out and version separately. The
old buckets for **unfinished experiments** and **written-only specs** that
used to sit alongside the working code didn't come along for that move —
what's mapped here is all live, imported code.

One rough edge from the move is still open: the Āhau desktop app is pinned
to an older version of its own core plugin because there isn't yet a test
suite to safely verify a bump, and that's currently why the app's dev
server won't start. That's a known, tracked issue, not something hidden.
