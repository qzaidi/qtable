"use strict";

var tty = require('tty');
var Table = require('cli-table');
var util = require('util');

function QTable(options) {
  if (options) {
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
    var str = [];
    var colsum = options.count;
    var length = this.length;
    var wfirst,sum;
    
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


    // if width is specified for all columns, normalize to 100%
    if (options.cols && options.cols.length == options.head.length) {
      sum = options.cols.reduce(function(a,b) { return a+b; });
      options.cols = options.cols.map(function(c) { return ((c*100)/sum)|0; });
    }

    str.push('<table cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid;">');

    if (this.title) {
      str.push('<caption> ' + this.title + '</caption>');
    }
    wfirst = options.cols?(options.cols[0]|0):15;

    str = str.join('\n');

    if (options.head && options.head.length) {
      str += [
        '<thead>',
        '<th style="padding:10px;" width="' + wfirst + '%">',
        options.head.join('</th><th style="padding:10px;background-color:#eeeeee;">'),
        '</th>',
        '</thead>'
      ].join('\n');
    }

    this.forEach(function(x,i) {
      // x is a row of the table, k is the first element
      var k,v,sum,wtotal = wfirst;
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

      if (options.stacked) {
        sum = x.reduce(function(a,b) { return parseInt(a,10) +parseInt(b,10); },0);
        v = x.map(function(k) { return (parseInt(k,10)*(100-wtotal)/sum)|0; });
        str += '</table><table style="table-layout:fixed;" width="100%" cellspacing="1" cellpadding="0">';
      } else if (options.bar) {
        v = x.map(function(k) { var x = ((parseInt(k,10)*(100-wtotal))/colsum)|0; return x; });
        str += '</table><table width="100%" cellspacing="1" cellpadding="0" style="font-size:.8em;">';
      }

      str += '<tr>' + 
             '<td style="padding:10px;background-color:#eeeeee;" width="' + wtotal + '%">' + k + '</td>' + 
              x.map(function(k,idx) { 
                var width; 
                var color='';

                if (options.stacked || options.bar) {
                  width = v[idx] || 1;
                  wtotal += width;
                  width = 'width="' + width + '%"';
                  color = 'color:#ffffff;background-color:' + getbgcolor(idx) +';';
                }
                return '<td ' + width + ' style="padding:10px;' + color + '">' + k + '</td>'; 
              }).join('');


      if (options.bar && wtotal < 100) {
        str += '<td width="' + (100-wtotal) + '%" style="padding:10px;background-color:#ffffff"></td>';
      }

      str += '</tr>\n';

      if ( (options.stacked || options.bar) && (i == length - 1)) {
        str += '</table>';
      }
    });
    return str + '</table><br/>';
  };
}

module.exports = QTable;
