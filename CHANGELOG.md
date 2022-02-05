# Changelog for Matrix Wrench

## Next release

## v0.5.0 (2022-02-05)
* Added: Make someone a room admin via the Synapse Admin API
* Added: List media in a room via the Synapse Admin API
* Changed: Redesined the 
* Fixed: Curl commands with `--data` value had it set to the HTTP method
* Fixed: Ordering flickering for pending network requests

## v0.4.1 (2022-02-04)
* Fixed: Pending requests showed as network errors

## v0.4.0 (2022-02-01)
* Changed: Design of all collapsible components 
* Changed: Network Log design
* Fixed: All errors showed up as network errors in the Network Log

## v0.3.0 (2022-01-18)
* Added: The network log now shows the HTTP response status.
* Changed: The network log is limited to 500 entries.
* Fixed: Don't allow two identities to have the same name. 
* Fixed: Removed "Bearer undefined" for curl commands without authentication.

## v0.2.0 (2021-12-31)
* Added: Allow to add and remove room aliases.
* Added: Add "Who am I?" button to check access tokens.
* Added: Basic network log shows curl commands.
* Changed: Change name from Matrix Navigator to Matrix Wrench.
* Changed: New input field design with a floating label.

## v0.1.2
* A global error catcher informs you of program failures.
* Allows to forget rooms.
* Allows to kick, ban and unban users.
* The member list now also shows kocking and banned members, as well as a count for each membership type.
* Added a button for a quick authless connection to matrix.org.
* Added "About Matrix Wrench" section to the front-page.

## v0.1.1
* Allows to join and leave rooms.
* Allows to invite users.
* Added a wide-screen layout for the room management.

## v0.1.0
* Join rooms, leave rooms, invite to rooms. Separate page for room management.
