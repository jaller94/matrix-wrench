# Changelog for Matrix Wrench

## Future
* Added: Act as other users when using AppService tokens
* Added: Validation of Matrix server responses using the zod library
* Changed: Moved "Register account (AppService API)" to an AppService API page.
* Fixed: An invalid room type resulted in `roomVersion` being reported as "!invalid" in the Room List
* Fixed: Pagination of querying children of a Space.

### Alpha Features
* Added: Space Management Page
* Added: Register accounts with an AppService token
* Added: Send messages to a room

## v0.14.3 (2024-09-16)
* Fixed: Live location sharing sent empty geo URIs

## v0.14.2 (2024-09-16)
* Added: Live Location Sharing
* Added: List many more pages on the overview
* Fixed: The buttons to edit identity were broken
* Fixed: Logging in with a password was broken

## v0.14.1 (2024-09-08)
* Fixed: Syntax error prevented builds

## v0.14.0 (2024-09-01)
*Workation Nation*

* Added: Settings to change the prefix of external Matrix links, hide the network log and choose a theme.
* Added: Customise theme colours
* Added: Persist settings to localStorage
* Added: Shortcut Shift + P for accessing an Overview page of account actions
* For developers: Migrated from htm to React
* For developers: Migrated all components from *.js to *.tsx

## v0.13.0 (2024-06-13)
*Happy birthday, April and Matrix Wrench!*

* Added: Green dark mode (based on browser preference)
* Changed: Moved "AppService API" to the Overview
* For developers: Use Bun.sh to bundle and minify the JavaScript

## v0.12.0 (2023-09-23)
* Added: The room "Summary" gives you a bit of an insight into a room's state.
* Added: The box "Room Upgrade" allows for a more fine-tuned upgrade.
* Fixed: Room table now works if the user has no account data for direct contacts.
* Fixed: Fix theoretical vulnerabilty in a room's Members list. An unvalidated server response was used as JavaScript object key. This is unlikely to be exploited.

## v0.11.0 (2023-03-24)
*#StandWithUkraine*

* Added: New input for identities: Masquerade As Matrix ID (for AppService tokens)
* Added: Network log shows timestamp when the server response was received and Matrix error codes
* Fixed: Improved error handling for "Am I a (room) member?" button
* Fixed: Knocking button didn't work ("Error: Content not JSON.")

## v0.10.1 (2023-03-15)
* Fixed: Update package-lock.json

## v0.10.0 (2023-03-15)
*Welcome to the world, Baby Christian!*

* Added: Urls and proper browser navigation for the identity editor
* Added: Room to JSON
* Added: Room table
* Added: Direct Contacts table
* Added: Experimental AppService Joiner page
* Fixed: Disallow identity names with a slash character

## v0.9.0 (2022-12-16)
* Added: Password login
* Added: Create and mutate users using the Synapse API.

## v0.8.1 (2022-08-15)
* Fixed: When creating or mutating a user, the deactivated status would not get applied, if it was changed last in the interface.

## v0.8.0 (2022-06-13)
*Happy birthday, Matrix Wrench!*

* Added: All pages have URLs to quickly navigate to.
* Added: Bulk actions to invite and kick users
* Added: The About page now shines some light on the application's features and security.
* Changed: The labels of input fields are no longer animated.
* Fixed: When editing an identity, "Remember login" wasn't set correctly.

## v0.7.0 (2022-05-06)
* Added: A "Am I a member?" button tells your membership state in a room.
* Changed: Changed design of text inputs to not be animated.
* Fixed: Unchanged identites got deleted from localStorage when editing identities twice.

## v0.6.2 (2022-04-29)
* Added: A "Remember login" checkbox lets the user decide whether to store an access token in localStorage.
* Added: The room lists now have external matrix.to links.
* Fixed: When getting truncated, rows in the Network Log keep their number.
* Changed: The About page was moved into the header.

## v0.6.1 (2022-03-18)
* Added: Progress indicator for recursively deleting a space

## v0.6.0 (2022-03-18)
*Putin started the war.*

* Added: Add Synapse Admin buttons to delete a room and recursively delete a space
* Added: Many room IDs are now clickable and open the respective room page
* Added: Add Knock button to knock on a room
* Changed: Use client version 3 for most API calls instead of `/r0/`
* Changed: Combined "Alias to Room ID" and "Room management"

## v0.5.2 (2022-02-15)
* Fixed: Don't allow two identities to have the same name.
* Internal: Added some integration tests using Cypress.

## v0.5.1 (2022-02-15)
* Changed: Redesigned the Identity Selector and App Header.
* Fixed: Editing an identity showed "Identity name taken!".
* Fixed: Clear validation errors after pressing Cancel in the Identity Editor.
* Fixed: The heading of the Network Log is no longer a level 1 heading.

## v0.5.0 (2022-02-05)
* Added: Make someone a room admin via the Synapse Admin API
* Added: List media in a room via the Synapse Admin API
* Changed: Changed the design of the Network Log some more 
* Fixed: Curl commands with `--data` value had it set to the HTTP method
* Fixed: Ordering flickering for pending network requests

## v0.4.1 (2022-02-04)
* Fixed: Pending requests showed as network errors

## v0.4.0 (2022-02-01)
* Changed: Design of all collapsible components 
* Changed: Network Log design
* Fixed: All errors showed up as network errors in the Network Log.

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
