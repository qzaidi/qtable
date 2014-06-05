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
  var colors = [ "#27a9e3" , "#f7931d", "#852b99", '#2daebf', '#ff0000' ];
  var len = colors.length;
  return colors[idx % len];
}

util.inherits(QTable,Table);

var mailflag = true;

if (tty.isatty(1) == false) {
  QTable.prototype.toString = function() {
    var options = this.options;
      var currDate = Date.now();
      var str = [], header = [], superHeader = [], boundary = "\n--" + currDate + "\n";
      if (this.mail && mailflag) {

    header = [ 
          'Subject: ' + this.mail.subject,
          'MIME-Version: 1.0',
          'From: ' + this.mail.from,
          'To:' + this.mail.to,
          'Content-Type: multipart/mixed;boundary=' + currDate,
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
          '<th style="padding:10px;" width="15%">',
          options.head.join('</th><th style="padding:10px;background-color:#eeeeee;">'),
          '</th>',
          '</thead>'
        ].join('\n');
      }
      var that = this;
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
          k = x[0] || '';
        }
        
        if (options.percentwidth) {
          sum = x.reduce(function(a,b) { return parseInt(a,10) +parseInt(b,10); });
          v = x.map(function(k) { return (parseInt(k,10)*85/sum)|0; });
          str += '</table><table width="100%" cellspacing="1" cellpadding="0">';
        }

        str += '<tr>' + 
               '<td style="padding:10px;background-color:#eeeeee;" width="15%">' + k + '</td>' + 
                x.map(function(k,idx) { 
                  if(idx!=0){
                    var width='',color='';
                    if (options.percentwidth) {
                      width = 'width="' + v[idx] + '%"';
                      color = 'color:#ffffff;background-color:' + getbgcolor(idx) +';';
                    }
                    return '<td ' + width + ' style="padding:10px;' + color + '">' + k + '</td>'; 
                  }
                }).join('') + 
                '</tr>\n';

        if (options.percentwidth) {
          str += '</table>';
        }
      });
      str += (options.percentwidth?'':'</table>') + '<br/>\n';

      var csv = "\n\n";
      if(this.mail.attachment){
       str += boundary;
       str += [ 
        'Content-Type: text/csv; name='+ currDate +'.csv',
        'Content-Disposition: attachment; filename='+ currDate +'.csv',
      ].join('\n');
      if (options.head && options.head.length) {
        csv += [
            options.head.join(','),
          ].join('\n');
      }
      csv += '\n';
      that.forEach(function(x) {
        // x is a row of the table, k is the first element
        var k,v,sum;
        
        csv += x.map(function(k) { 
                  return k; 
                }).join(',');
        csv += '\n';
      });
      }
      var subHeader = 'Content-Type: text/html\n\n';
      header = header.join('\n') ;
      str = header + boundary + subHeader + str;
      str += csv  + boundary;
      return str;
    };
  }

  module.exports = QTable;

