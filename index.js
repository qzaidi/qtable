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

function getbgcolor(idx) {
  var colors = [ "#27a9e3" , "#f7931d", "#852b99" ];
  var len = colors.length;
  return colors[idx % len];
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

    str.push('<table cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid;">');

    str = str.join('\n');

    if (options.head && options.head.length) {
      str += [
        '<thead>',
        '<th style="padding:10px;">',
        options.head.join('</th><th style="padding:10px;background-color:#eeeeee;">'),
        '</th>',
        '</thead>'
      ].join('\n');
    }

    this.forEach(function(x) {
      // x is a row of the table, k is the first element
      var k,v,sum;
      // cross tables
      if (!util.isArray(x)) {
        k = Object.keys(x)[0];
        v = x[k];
        if (util.isArray(v)) {
          v = v.join('</td><td>');
        }
        x = [v];
      } else {
        k = x.shift() || '';
      }
      
      if (options.percentwidth) {
        sum = x.reduce(function(a,b) { return a+b; });
        v = x.map(function(k) { return (k*90/sum)|0; });
        str += '</table><table width="100%" cellspacing="1" cellpadding="0">';
      }

      str += '<tr>' + 
             '<td style="padding:10px;background-color:#eeeeee;" width="10%">' + k + '</td>' + 
              x.map(function(k,idx) { 
                var width='',color='';
                if (options.percentwidth) {
                  width = 'width="' + v[idx] + '%"';
                  color = 'color:#ffffff;background-color:' + getbgcolor(idx) +';';
                }
                return '<td ' + width + ' style="padding:10px;' + color + '">' + k + '</td>'; 
              }).join('') + 
              '</tr>\n';

      if (options.percentwidth) {
        str += '</table>';
      }
    });
    return str + (options.percentwidth?'':'</table>') + '<br/>';
  };
}

module.exports = QTable;
