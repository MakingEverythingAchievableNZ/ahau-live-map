This is the piece that actually enforces privacy across the whole system. Almost every
other piece — profiles, stories, artefacts, family-tree links — can be marked private
to a specific person or group, but marking something private only works if something
checks that marking on every single read and write. That's this package's one job: it
sits last in the chain both apps build when they start up, after everything else, so
nothing can slip past it.

If you ever change how a record's visibility works, this is the piece whose behaviour
you need to double-check hasn't quietly changed too.
