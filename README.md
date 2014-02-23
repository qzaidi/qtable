QTable
======

This utility extends [cli-table](https://github.com/visionmedia/cli-table) , allowing you to render 
- unicode-aided tables on the command line from your node.js scripts.
- html tables when those scripts are piped to a program like sendmail

## How to use

If you intend to send the output to sendmail, make sure you pass mail options

```js

var Table = new QTable({ mail: { from: 'test@example.com', to: 'recipient@example.com', subject: 'Daily performance summary' },...});

```

Then run the program as usual, piping the output to sendmail

e.g.

```bash
 $ node revs.js | sendmail -f 'test@example.com' 'recipient@example.com' 
```
