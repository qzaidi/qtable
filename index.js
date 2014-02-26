"use strict";

var tty = require('tty');
var Table = require('cli-table');
var util = require('util');

function QTable(options) {
  if (options && options.mail) {
    this.mail = options.mail;
    this.title = options.title;
  }
  Table.call(this,options);
}

util.inherits(QTable,Table);

var mailflag = true;

if (tty.isatty(1) == false) {
  QTable.prototype.toString = function() {
    var options = this.options;
    var str = [];
    if (this.mail && mailflag) {
      str = [ 
        'Subject: ' + this.mail.subject,
        'MIME-Version: 1.0',
        'From: ' + this.mail.from,
        'To:' + this.mail.to,
        'Content-Type: text/html',
        'Content-Disposition: inline',
        ''
      ];
      mailflag= false;
    }

    if (this.title) {
      str.push('<h2> ' + this.title + '</h2>');
    }

    str.push('<table style="border-width: 1px; border-style: solid;">');

    str = str.join('\n');

    if (options.head && options.head.length) {
      str += [
        '<thead style="background-color: #dedede;" >',
        '<td>',
        options.head.join('</td><td>'),
        '</td>',
        '</thead>'
      ].join('\n');
    }

    this.forEach(function(x) {
      var k,v;
      if (!util.isArray(x)) {
        k = Object.keys(x)[0];
        v = x[k];
        if (util.isArray(v)) {
          v = v.join('</td><td>');
        }
        x = [ k, v ];
      }
      str += '<tr><td>' + x.join('</td><td>') + '</td></tr>\n';
    });
    return str + '</table><br/>';
  };
}

module.exports = QTable;
