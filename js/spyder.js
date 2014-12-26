/**
 * Created by cosmin on 21.12.2014.
 */
function extend(child, tata) {
    child.prototype = Object.create(tata.prototype);
    child.prototype.constructor = child;
}

function log() {
    var args;
    args = [].slice.call(arguments, 0);
    console.log(args);
}

Element.prototype.remove = function () {
    this.parentElement.removeChild(this);
};

/*Element.prototype.w = function (w) {
 if (w == undefined) {
 return this.scrollWidth;
 }
 this.style.width = w + 'px';
 };
 Element.prototype.h = function (h) {
 if (h == undefined) {
 return this.clientHeight;
 }
 this.style.height = h + 'px';
 };

 NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
 for (var i = 0, len = this.length; i < len; i++) {
 if (this[i] && this[i].parentElement) {
 this[i].parentElement.removeChild(this[i]);
 }
 }
 };
 */
//-------PLAY multi------------------------------------
function Play() {
    if (arguments.callee.__inst) {
        return arguments.callee.__inst;
    }
    arguments.callee.__inst = this;

    var i;
    this.ch = new Array();
    for (i = 0; i < 10; i++) {
        this.ch[i] = new Array();
        this.ch[i]['channel'] = new Audio();
        this.ch[i]['end'] = -1;
    }
    this.MUTE = false;
}
Play.prototype.play = function (e) {
    if (this.MUTE)return;
    var i;
    for (i = 0; i < this.ch.length; i++) {
        var now = new Date().getTime();
        if (this.ch[i]['end'] < now) {
            this.ch[i]['end'] = now + e.duration * 1000;
            this.ch[i]['channel'].src = e.src;
            this.ch[i]['channel'].load();
            this.ch[i]['channel'].play();
            break;
        }
    }
};
Play.prototype.mute = function () {
    this.MUTE = !this.MUTE;
};
var player = new Play();
//-------------------------------------------------

function Sett() {
    if (arguments.callee.__inst) {
        return arguments.callee.__inst;
    }
    arguments.callee.__inst = this;
}

Sett.prototype.init = function () {
    this.nextID = 0;
};

Sett.prototype.nid = function () {
    return this.nextID++;
};


sett = new Sett();
sett.init();

window.nid = 0;
function nextId() {
    return window.nid++;
}

var cols = {
    'ros': '\u2665',
    'rom': '\u2666',
    'trf': '\u2663',
    'ngr': '\u2660'
};
var vals = {
    1: 'A',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    10: '10',
    11: 'J',
    12: 'Q',
    13: 'K'
};
//__________STIVA__________________________________________________
function Stiva() {
    this.sac = [];
}

Stiva.prototype.add = function (x) {
    this.sac.push(x);
};

Stiva.prototype.insert = function (pos, x) {
    var t = this.sac.splice(pos);
    this.sac.push(x);
    this.sac = this.sac.concat(t);
};

Stiva.prototype.len = function () {
    return this.sac.length;
};
Stiva.prototype.find_id = function (ix) {
    for (var i = 0; i < this.sac.length; i++) {
        if (this.sac[i].id === ix) {
            return this.sac[i];
        }
    }
};
Stiva.prototype.shuffle = function () {
    var arr = this.sac;
    this.sac = [];
    var l = arr.length;
    for (var i = 0; i < l; i++) {
        this.sac.push(arr.splice(Math.floor(Math.random() * arr.length), 1)[0]);
    }
};

//_______________________________________

function last(arr) {
    return arr[arr.length - 1];
}

//________________SPYDER_STOCK________________________________________

function msg(txt) {
    document.getElementById('msg').innerHTML = txt;
}

//_________________BOARD______________________________________________

function Board() {
    this.body = document.getElementById('board');
    this.stock = new Stiva();
    this.scor = document.getElementById('scor');
    this.nomv = 0;
    this.etalon = new Card(2, 'rom');
    this.etalon.x = -1000;
    this.body.appendChild(this.etalon.body);
    this.etalon.show();
    this.ebody = this.etalon.body;

    this.aclick = document.getElementById('clck');
    this.aclick2 = document.getElementById('clck2');
    this.aerr = document.getElementById('aerr');
    this.adeal = document.getElementById('adeal');
    this.adown = document.getElementById('adown');

    this.tout = null;
    this.tcount = 0;
    this.win_wh = {
        w: window.innerWidth,
        h: window.innerHeight
    };
    this.body.style.height = (this.win_wh.h - 20) + 'px';
    this.wh = {
        w: this.body.offsetWidth,
        h: this.body.offsetHeight
    };
    this.move = {
        x: 0,
        y: 0,
        dx: 0,
        dy: 0,
        obj: null
    };
    this.MOVE = false;
    this.xsz = this.wh.w / 10 / 5;
    this.body.style.fontSize = (this.xsz - 1) + 'px';

    this.gen_spyder_suit();
    this.lay();
    this.set_evt();
}
Board.prototype.gen_spyder_suit = function () {
    var crd, self = this;
    for (var v in vals) {
        for (var i = 0; i < 8; i++) {
            crd = new Card(parseInt(v), 'ngr');
            this.stock.add(crd);
        }
    }
    this.stock.shuffle();
    this.stock.sac.forEach(function (val, ix) {
        val.zix(ix);
        self.body.appendChild(val.body);
    });
};
Board.prototype.lay = function () {
    var i, pos, k, crd, sp, w;
    this.slots = [];
    this.pos = [];

    k = 0;
    w = this.ebody.offsetWidth;

    sp = (this.wh.w - w) / 9;
    for (i = 0; i < 10; i++) {
        pos = k++ * sp;
        this.pos.push(pos);
        this.slots.push([]);
    }
    this.slots.push([]);//[10]restul de cărți
    this.slots.push([]);//[11] cărțile luate de pe masă
    k = 0;
    for (i = 0; i < 54; i++) {
        crd = this.stock.sac[i];
        crd.slot = i % 10;
        crd.pos(this.pos[i % 10], Math.floor(i / 10) * 5);
        this.slots[i % 10].push(crd);
        if (i > 43)crd.up();
    }
    k = -10;
    for (i = 54; i < this.stock.len(); i++) {
        if ((i - 54) % 10 === 0)k += 10;
        crd = this.stock.sac[i];
        crd.slot = 10;
        this.slots[10].push(crd);
        crd.pos(this.wh.w - w - k, this.wh.h - this.ebody.offsetHeight);
    }
    msg('Start');
};

Board.prototype.lay_even = function (pos, old) {
    var i, arr = this.slots[pos], k = 0, z = 0;
    var self = this;
    var x = this.pos[pos];
    for (i = 0; i < arr.length; i++) {
        arr[i].x = x;
        arr[i].y = k;

        $(arr[i].body).animate({left: x + 'px', top: k + 'px'}, 400, function () {
            this.style.zIndex = ++z;
            if (old && self.slots[old].length) last(self.slots[old]).up();
        });
        k += (arr[i].down) ? 5 : 30;
    }
};
Board.prototype.is_suit = function (arr) {
    var i;
    if (arr[arr.length - 1].down)return false;
    for (i = 0; i < arr.length - 1; i++) {
        if (arr[i].val - arr[i + 1].val != 1 || arr[1].down) {
            return false;
        }
    }

    return true;
};
Board.prototype.end_suit = function (pos) {
    var i, k = 0;
    var arr = this.slots[pos];
    for (i = arr.length - 1; i > 0; i--) {
        if (arr[i - 1].val - arr[i].val === 1) {
            k++;
        } else {
            return k;
        }
    }
    return k;
};

Board.prototype.check = function (slot) {
    if (this.slots[slot].length < 13)return -1;
    var i, crd, k = null, slice;
    var arr = this.slots[slot];
    for (i = arr.length - 1; i > -1; i--) {
        if (arr[i].val === 13) {
            slice = arr.slice(i);
            if (this.is_suit(slice) && slice.length === 13) {
                k = i;
            }
        }
    }
    if (k != null) {
        player.play(this.adown);
        var x = this.slots[11].length / 13 * 10;
        for (i = 0; i < 13; i++) {
            crd = this.slots[slot][i + k];
            crd.pos(x, this.wh.h - this.ebody.offsetHeight);
            crd.zix(x);
            crd.slot = 11;
            this.slots[11].push(crd);
        }
        this.slots[slot] = this.slots[slot].splice(0, k);
        if (this.slots[slot].length) {
            last(this.slots[slot]).up();
        }
        k = 0;
        for (i = 0; i < 10; i++) {
            k += this.slots[i].length;
        }
        if (k === 0) {
            player.play(document.getElementById('awin'));
            msg('<h1>Win!</h1>');
        }
    }
};
Board.prototype.inc_mv = function () {
    this.scor.innerHTML = 'Mutări: ' + ++this.nomv;
};
Board.prototype.check_slot = function () {
    var crd = this.move.obj;
    var x = crd.x, pos, oldslot;
    var m = this.pos.map(function (arg) {
        return Math.abs(x - arg);
    });
    pos = m.indexOf(Math.min.apply(null, m));

    for (var i = 0; i < 10; i++) {
        last(this.slots[i]).body.classList.remove('over');
        last(this.slots[i]).body.classList.remove('overok');
    }

    if (this.slots[pos].length === 0 || last(this.slots[pos]).val - crd.val === 1) {
        oldslot = crd.slot;
        for (var i = 0; i < this.move.suit.length; i++) {
            this.slots[oldslot].pop();
            this.move.suit[i].slot = pos;
            this.slots[pos].push(this.move.suit[i]);
        }
        this.lay_even(pos);
        if (this.slots[oldslot].length)last(this.slots[oldslot]).up();
        this.check(crd.slot);
        this.inc_mv();
        player.play(this.aclick2);
    } else {
        this.lay_even(crd.slot);
        this.check(crd.slot);
        player.play(this.aerr);
    }
};
Board.prototype.mv = function (x, y) {
    var y0 = this.move.obj.y, i, v, m, xx;
    for (i = 0; i < this.move.suit.length; i++) {
        this.move.suit[i].xy(x - this.move.dx, y - this.move.dy + this.move.suit[i].y - y0);
    }
    xx = x - this.move.dx;

    m = Math.abs(xx - this.pos[0]);
    var p = 0;
    for (i = 0; i < 10; i++) {
        last(this.slots[i]).body.classList.remove('over');
        v = Math.abs(xx - this.pos[i]);
        if (v < m) {
            m = v;
            p = i
        }
    }
    var l = this.slots[p][this.slots[p].length - 1];
    if (l.val - this.move.obj.val === 1) {
        l.body.className += ' overok';
    } else {
        l.body.className += ' over';
    }
};

Board.prototype.qmove = function (x, y) {
    var self = this;
    var crd;
    clearTimeout(this.tout);
    crd = this.slots[10].pop();
    crd.up();
    crd.slot = this.tcount;
    this.slots[this.tcount].push(crd);
    crd.x = this.pos[this.tcount];
    crd.y = this.slots[this.tcount][this.slots[this.tcount].length - 2].y;
    $(crd.body).animate({
        left: crd.x + 'px',
        top: crd.y + 'px'
    }, 500, function () {
        player.play(self.adeal);
        self.lay_even(crd.slot);
        self.check(crd.slot);
    });
    this.check(this.tcount);
    if (++this.tcount < 10) {
        this.tout = setTimeout(function () {
            self.qmove();
        }, 200);
    } else {
        this.tcount = 0;
    }

};
Board.prototype.deal_new = function () {
    var self = this;
    var i, crd;
    if (this.slots[10].length < 10) {
        msg("<h2>ERR stiva rezerva</h2>");
    }
    for (i = 0; i < 10; i++) {
        if (this.slots[i].length < 1) {
            msg("Nu puteți trage cărți! Trebuie ca toate pozițiile să fie ocupate!");
            return;
        }
    }
    this.tout = setTimeout(function () {
        self.qmove();
    }, 10);
    /*for (i = 0; i < 10; i++) {
     crd = this.slots[10].pop();
     crd.up();
     crd.slot = i;
     this.slots[i].push(crd);
     //crd.poscb(this.pos[i], this.slots[i][this.slots[i].length - 2].y + 30, 600, this, i);

     //this.check(i);
     }*/
};
Board.prototype.find_place = function (c) {
    var i, ret = [], max = [-1, -1], slice, oldslot = c.slot, empty = null;
    if (!this.is_suit(this.slots[oldslot].slice(this.slots[oldslot].indexOf(c))))return;
    for (i = 0; i < 10; i++) {
        if (i === oldslot)continue;
        if (this.slots[i].length === 0) {
            empty = i;
            continue;
        }
        if (this.slots[i][this.slots[i].length - 1].val - c.val === 1) {
            ret.push([this.end_suit(i), i]);
        }
    }
    if (ret.length === 0) {
        if (empty == null)return;
        if (!this.is_suit(this.slots[oldslot].slice(this.slots[oldslot].indexOf(c))))return;
        //this.slots[empty] = [];
        slice = this.slots[oldslot].splice(this.slots[oldslot].indexOf(c));
        for (i = 0; i < slice.length; i++) {
            slice[i].slot = empty;
            this.slots[empty].push(slice[i]);
        }
        if (this.slots[oldslot].length > 0) last(this.slots[oldslot]).up();
        this.lay_even(empty);
        this.inc_mv();
        return;
    }
    for (i = 0; i < ret.length; i++) {
        if (ret[i][0] > max[0]) {
            max = ret[i];
        }
    }
    max = max[1];
    slice = this.slots[oldslot].splice(this.slots[oldslot].indexOf(c));
    for (i = 0; i < slice.length; i++) {
        slice[i].slot = max;
        slice[i].zix(100 + i);
        this.slots[max].push(slice[i]);
    }
    if (this.slots[oldslot].length > 0) last(this.slots[oldslot]).up();
    this.lay_even(max);
    player.play(this.aclick2);
    this.check(max);
    this.inc_mv();
};

Board.prototype.set_evt = function () {
    var self = this;
    this.body.addEventListener('contextmenu', function (evt) {
        evt.preventDefault();
        var c = self.stock.find_id(evt.target.id);
        if (c == null || c.down || c.slot > 9)return false;
        self.find_place(c);
        return false;
    }, false);
    this.body.addEventListener('mousedown', function (evt) {
        evt.preventDefault();
        player.play(self.aclick);
        if (evt.button != 0)return false;
        var c = self.stock.find_id(evt.target.id);
        if (c && c.slot === 10) {
            self.deal_new();
            return false;
        }
        if (c == null || c.down || c.slot > 9)return false;
        self.move.suit = self.slots[c.slot].slice(self.slots[c.slot].indexOf(c));
        if (!self.is_suit(self.move.suit))return false;
        self.move.x = c.x;
        self.move.y = c.y;
        self.move.obj = c;
        self.move.dx = evt.pageX - c.x;
        self.move.dy = evt.pageY - c.y;
        self.MOVE = true;
        for (var i = 0; i < self.move.suit.length; i++) {
            self.move.suit[i].zix(i + 105);
        }
    }, false);
    this.body.addEventListener('mousemove', function (evt) {
        evt.preventDefault();
        if (self.MOVE === false)return false;
        self.mv(evt.pageX, evt.pageY);
    }, false);
    this.body.addEventListener('mouseup', function (evt) {
        evt.preventDefault();
        if (!self.MOVE)return false;
        self.MOVE = false;
        self.check_slot();
    }, false);
};

//__________________CARD_______________________________________________

function gen_card(val, col) {
    var e, i, id;
    id = nextId();
    e = document.createElement('div');
    e.className = 'card ' + col;
    e.id = 'card' + id;

    i = document.createElement('i');
    i.innerHTML = cols[col];
    e.appendChild(i);

    i = document.createElement('div');
    i.className = 'vtop';
    i.innerHTML = '' + vals[val];
    e.appendChild(i);

    i = document.createElement('div');
    i.className = 'vbott';
    i.innerHTML = '' + vals[val];
    e.appendChild(i);

    i = document.createElement('div');
    i.className = 'cover down';
    i.id = id + '';

    e.appendChild(i);

    return [e, i, id];
}

function Card(val, col) {
    this.val = val;
    this.col = col;
    var e = gen_card(val, col);
    this.body = e[0];
    this.cover = e[1];
    this.id = '' + e[2];
    this.down = true;
    this.slot = 0;
    this.x = 0;
    this.y = 0;
    this.z = 1;
}

Card.prototype.is_down = function () {
    return this.cover.className.indexOf('down') > 0;
};
Card.prototype.up = function up() {
    this.cover.classList.remove('down');
    this.down = false;
};
Card.prototype.down = function () {
    this.down = true;
    if (this.is_down())return;
    this.cover.classList.add('down');
};
Card.prototype.flip = function () {
    if (this.is_down()) {
        this.up();
    } else {
        this.down();
    }
};

Card.prototype.show = function () {
    //this.body.style.left = this.x + 'px';
    //this.body.style.top = this.y + 'py';
    this.cover.classList.remove('down');
    this.body.style.zIndex = this.z;
    this.down = false;
    $(this.body).animate({left: this.x + 'px', top: this.y + 'px', zIndex: this.z}, 200);
};
Card.prototype.xy = function (x, y, z) {
    this.body.style.left = x + 'px';
    this.body.style.top = y + 'px';
    this.z = z || this.z;
    this.body.style.zIndex = this.z;
    this.x = x;
    this.y = y;

};
Card.prototype.pos = function (x, y, d) {
    this.x = x;
    this.y = (y == null) ? this.y : y;
    $(this.body).stop().animate({left: this.x + 'px', top: this.y + 'px'}, d || 300);
};
Card.prototype.poscb = function (x, y, d, cb, arg) {
    this.x = x;
    this.y = (y == null) ? this.y : y;
    $(this.body).stop().animate({left: this.x + 'px', top: this.y + 'px'}, d || 300, function () {
        cb.lay_even(arg);
    });
};
Card.prototype.zix = function (z) {
    this.z = z;
    this.body.style.zIndex = z;
};
//_______________________________________________________


//.appendChild(gen_card(14, 'trf')[0]);
var b = new Board();
