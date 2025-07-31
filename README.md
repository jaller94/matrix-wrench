# Matrix Wrench
Matrix Wrench is a fast, convenient way to manage Matrix rooms.

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
    * Currently:
      * React to build components and manage the application state
      * zod to validate API responses

## Build it

You'll need [Bun](https://bun.sh) to build Matrix Wrench.

```sh
bun install
bun run build
```

Now host the contents of the `static` folder on an HTTP(S) server.

## Disclaimer

This is a hobby project without security guarantees.
Use it at your own risk!
