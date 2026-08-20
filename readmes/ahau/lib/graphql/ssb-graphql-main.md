This is the shared groundwork almost every other piece in the "questions and answers" (GraphQL) layer relies on. It works out who's currently asking (your public identity, plus your own private notes-to-self), and provides consistent, shared handling for things like dates and uploaded files so every other piece doesn't have to solve those problems on its own.

On first use it can also quietly set up a couple of basic records for you — a public profile and a private personal space — if they don't already exist.
