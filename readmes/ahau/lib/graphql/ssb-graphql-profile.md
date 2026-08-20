This turns questions about a person's, community's, or Pātaka's profile into answers for the app to display, and handles saving changes back. It's the translation layer sitting between an app screen and the profile record-keeper itself.

Saving a profile is more involved than it sounds: depending on who's editing and what kind of profile it is, some details (like a phone number) might need to go into a separate, more restricted admin-only copy of the profile rather than the version everyone can see — this piece works out which fields go where.
