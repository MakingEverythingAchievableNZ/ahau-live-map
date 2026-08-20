# Āhau - under the hood 

Āhau is a family-tree (whakapapa) app that works peer-to-peer — it doesn't
depend on a central company's server to keep working.

Think of the Āhau app as a single screen on your phone or computer. Behind
that screen, it talks to dozens of smaller building blocks, often called
plugins or packages. Each time you do something, like open a family tree or
save a photo, the app passes the request through a chain of these pieces to
get it done. That's why there are 61 separate pieces of code behind one app.

This page explains, without jargon or a wall of repo names, what those
groups of pieces do. For a browsable, searchable card for every individual
piece, see `index.html`. For the full technical picture, see
`ARCHITECTURE.md` and the interactive `graph.html`.

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
you're offline, and the public website.

## The foundational plumbing (Core SSB plumbing)

The foundational plumbing that makes any kind of record-keeping possible on
this peer-to-peer network — storing files, managing edit history, handling
encryption keys.

## The parts that know what a family tree is (Domain SSB plugins)

The parts of the system that know what a family tree, a person's profile, or
a story actually is, including the piece that records who's related to whom
and turns those links into a family tree you can explore.

## The translation layer (GraphQL layer)

The translation layer that lets the app's screens ask questions like "show
me this person's family tree" and get an answer back.

## Behind-the-scenes developer tools (CLI / tooling utilities)

Behind-the-scenes tools developers use to run test instances, move data
around, or build desktop icons — not something an end user ever touches
directly.

## Unfinished experiments (Prototypes / dead code)

Unfinished experiments the team tried and set aside — safe to ignore unless
you're specifically picking up one of those threads again.

## Written explanations (Specs / docs)

Written explanations of how the system is meant to work, for humans to read
rather than code to run.

## How active is development, overall?

Every piece falls into one of three states, not just "on" or "off":

- **In development** — being actively worked on right now. Only a handful of
  pieces are here: the main app, its documentation site, the backup helper,
  and the two plugins that connect them to the rest of the system.
- **Maintained** — has a real history of past work, but is stable and not
  currently being changed. This is most of the system, and it's expected,
  not a warning sign.
- **Unmaintained** — no recorded development work at all. About a third of
  the 61 pieces fall here.

This reflects a deliberate shift from active building to steady maintenance,
not a system that's been abandoned.
