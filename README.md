# Matrix Wrench
Matrix Wrench is a fast, convenient way to manage Matrix rooms. It's a user interface for tasks where one would have used the terminal application CURL.

A common task is to read and edit a room state, e.g. to change the power levels. It works with access tokens of regular users and appservices (bridges and complex bots). If you give it an appservice token you can access any room the appservice has access to, allowing to easily debug and administrate bridges.

Furthermore, a few tasks around homeserver administration are supported, like listing media files in unencrypted rooms. The majority of features uses the standardized Matrix protocol. If a feature makes use of the Synapse Admin API, this is noted.

![](./docs/screenshot.png)

Maturity: Alpha

## Project goals
* Replace `curl` as the best tool for Matrix operations tasks.
* Make it easy to mutate rooms and their states.
* No unintentional API calls.
* Design for both mobile and (touch) desktop devices.
* Exceptional accessibility for users using a keyboard and screen readers.
* Static web app (cacheable and no need for PHP, a database or whatever)
* [Keep it small and simple](https://en.wikipedia.org/wiki/KISS_principle)
  * Minimal dependencies
  * 100 kb zip bundle limit

## Roadmap
* Hire someone for UI/Layout design (idea)
* Improve API call history (idea)
* Dry-run mode (idea)
* Validation of state events before sending them (idea)
* Perform bulk actions in rooms (idea)

## Disclaimer

This is a hobby project without security guarantees. It is neither backed nor endorsed by my employer.
Use it at your own risk!
