Needs mysql, [wkhtmltopdf](https://wkhtmltopdf.org/downloads.html), `.env` file values.

 * `node bin/adduser` adds users (works like the unix command)
 * `node bin/www` starts the server

steps:

 * install [wkhtmltopdf](https://wkhtmltopdf.org/downloads.html) dependency into path somewhere.
 * install package deps: `npm i` (or `yarn install`)
 * install db schema: `mysql -uroot -p${password} < sql/tables.sql`
 * fill in `.env` values from `template.env` (`cat template.env | tee .env`)
 * make a user `node bin/adduser`
 * start the server `npm start`

TODO

 * security
 * url flexibility
 * lib/db/refactor
 * bugs?
