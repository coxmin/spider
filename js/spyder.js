/**
 * Created by cosmin on 21.12.2014.
 */

function log() {
    var args;
    args = [].slice.call(arguments, 0);
    console.log(args);
}

Element.prototype.remove = function () {
    this.parentElement.removeChild(this);
};

function easeInOutQuad(t) {
    return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

//-------PLAY multi------------------------------------
function Play() {
    if (arguments.callee.__inst) {
        return arguments.callee.__inst;
    }
    arguments.callee.__inst = this;

    var i;
    this.ch = [];
    for (i = 0; i < 10; i++) {
        this.ch[i] = [];
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

function Arr() {
    var arr = [];
    arr.push.apply(arr, arguments);
    Object.defineProperty(arr, 'last', {
        get: function () {
            return arr[arr.length - 1];
        },
        set: function (val) {
            arr[arr.length - 1] = val;
        },
        enumerable: false,
        configurable: true
    });
    arr.shuffle = function () {
        var t = this.splice(0);
        var l = t.length;
        for (var i = 0; i < l; i++) {
            this.push(t.splice(Math.floor(Math.random() * t.length), 1)[0]);
        }
    };
    arr.find_id = function (ix) {
        for (var i = 0; i < this.length; i++) {
            if (this[i].id === ix) {
                return this[i];
                //return [this[i],i];
            }
        }
    };
    arr.add = function (x) {
        this.push(x);
    };

    return arr;
}

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

//_______________________________________


//________________SPYDER_STOCK________________________________________

function msg(txt) {
    document.getElementById('msg').innerHTML = txt;
}

//_________________BOARD______________________________________________

function Board() {
    this.body = document.getElementById('board');
    this.stock = Arr();
    this.scor = document.getElementById('scor');
    this.nomv = 0;

    this.aclick = document.getElementById('clck');
    this.aclick2 = document.getElementById('clck2');
    this.aerr = document.getElementById('aerr');
    this.adeal = document.getElementById('adeal');
    this.adown = document.getElementById('adown');

    var etalon = card(2, 'rom');
    etalon.x = -1000;
    this.body.appendChild(etalon);
    etalon.cover.classList.remove('down');
    etalon.style.zIndex = this.z;
    etalon.style.left = etalon.x;

    this.win_wh = {
        w: window.innerWidth,
        h: window.innerHeight
    };
    this.body.style.height = (this.win_wh.h - 20) + 'px';
    this.wh = {
        w: this.body.offsetWidth,
        h: this.body.offsetHeight,
        ew: etalon.offsetWidth,
        eh: etalon.offsetHeight
    };
    etalon.remove();
    delete (etalon);
    this.move = {
        x: 0,
        y: 0,
        dx: 0,
        dy: 0,
        obj: null
    };
    this.MOVE = false;
    this.body.style.fontSize = (this.wh.w / 10 / 5 - 1) + 'px';

    this.lay();
    this.set_evt();
}

Board.prototype.lay = function () {
    var i, pos, k, crd, sp;

    for (var v in vals) {
        for (i = 0; i < 8; i++) {
            //crd = new Card(parseInt(v), 'ngr');
            crd = card(parseInt(v), 'ngr');
            this.body.appendChild(crd);
            this.stock.push(crd);
        }
    }
    this.stock.shuffle();

    this.slots = Arr();
    this.pos = [];

    k = 0;

    sp = (this.wh.w - this.wh.ew) / 9;
    for (i = 0; i < 10; i++) {
        pos = k++ * sp;
        this.pos.push(pos);
        this.slots.push(Arr());
    }
    this.slots.push(Arr());//[10]restul de cărți
    this.slots.push(Arr());//[11] cărțile luate de pe masă

    for (i = 0; i < 54; i++) {
        crd = this.stock[i];
        crd.slot = i % 10;
        crd.xy(this.pos[i % 10], Math.floor(i / 10) * 5, i);
        this.slots[i % 10].push(crd);
        if (i > 43)crd.up();
    }
    k = -10;
    for (i = 54; i < this.stock.length; i++) {
        if ((i - 54) % 10 === 0)k += 10;
        crd = this.stock[i];
        crd.slot = 10;
        this.slots[10].push(crd);
        crd.xy(this.wh.w - this.wh.ew - k, this.wh.h - this.wh.eh, i);
    }
    msg('Start');
};

Board.prototype.lay_even = function (pos, old) {
    var i, k = 0, z = 0;
    var self = this;
    for (i = 0; i < this.slots[pos].length; i++) {
        this.slots[pos][i].x = this.pos[pos];
        this.slots[pos][i].y = k;
        //$(this.slots[pos][i].body).animate({left: this.pos[pos] + 'px', top: k + 'px'}, 200);
        this.slots[pos][i].anim({left: this.pos[pos], top: k}, 300, function () {
            if (self.slots[pos][z]) self.slots[pos][z].zix(++z);
        });
        k += (this.slots[pos][i].down) ? 5 : 30;
    }

    if (old)this.slots[old].last.up();
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

Board.prototype.is_suit_slot = function (slot, pos) {
    var i;
    if (this.slots[slot].last.down)return false;
    for (i = pos; i < this.slots[slot].length - 1; i++) {
        if (this.slots[slot][i].val - this.slots[slot][i + 1].val != 1 || this.slots[slot][i].down) {
            return false;
        }
    }
    return true;
};

Board.prototype.end_suit = function (pos) {
    var i, k = 0;
    for (i = this.slots[pos].length - 1; i > 0; i--) {
        if (this.slots[pos][i - 1].val - this.slots[pos][i].val === 1) {
            k++;
        } else {
            return k;
        }
    }
    return k;
};

Board.prototype.check = function (slot) {
    if (this.slots[slot].length < 13 || !this.is_suit_slot(slot, this.slots[slot].length - 13)) {
        this.lay_even(slot);
        return;
    }
    var i;
    player.play(this.adown);

    var k = 0, z = 0;
    var self = this;
    for (i = 0; i < this.slots[slot].length - 1; i++) {
        this.slots[slot][i].anim({left: this.pos[slot], top: k}, 400, function () {
            if (self.slots[slot][z]) self.slots[slot][z].zix(++z);
        });
        k += (this.slots[slot][i].down) ? 5 : 30;
    }
    this.slots[slot].last.anim({left: this.pos[slot], top: k}, 450, function () {
        var x = self.slots[11].length / 13 * 10;
        var a = self.slots[slot].splice(self.slots[slot].length - 13);
        if (self.slots[slot].length)self.slots[slot].last.up();
        for (i = 0; i < a.length; i++) {
            a[i].slot = 11;
            self.slots[11].push(a[i]);
            a[i].anim({left: x, top: self.wh.h - self.wh.eh}, 800);
        }
    });
    for (i = 0; i < 10; i++) {
        if (this.slots[i].length) return;
    }
    player.play(document.getElementById('awin'));
    msg('<h1>Win!</h1>');
};

Board.prototype.inc_mv = function () {
    this.scor.innerHTML = 'Mutări: ' + ++this.nomv;
};

Board.prototype.check_slot = function () {
    var crd = this.move.obj;
    var x = crd.x, pos = 0, oldslot, i;
    var m = Math.abs(x - this.pos[0]);
    var v;
    for (i = 0; i < 10; i++) {
        v = Math.abs(x - this.pos[i]);
        if (v <= m) {
            m = v;
            pos = i;
        }
    }

    log("POS", x, pos);
    for (i = 0; i < 10; i++) {
        if (this.slots[i].length) {
            this.slots[i].last.classList.remove('over');
            this.slots[i].last.classList.remove('overok');
        }
    }

    if (this.slots[pos].length === 0 || this.slots[pos].last.val - crd.val === 1) {
        oldslot = crd.slot;
        for (i = 0; i < this.move.suit.length; i++) {
            //this.slots[pos][i].slot=pos;
            this.slots[pos].push(this.move.suit[i]);
            this.slots[pos].last.slot = pos;
        }
        log(this.slots[pos].last.x);
        if (this.slots[oldslot].length) this.slots[oldslot].last.up();
        this.check(crd.slot);
        this.inc_mv();
        player.play(this.aclick2);
    } else {
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
        if (this.slots[i].length)this.slots[i].last.classList.remove('over');
        v = Math.abs(xx - this.pos[i]);
        if (v < m) {
            m = v;
            p = i
        }
    }
    if (this.slots[p].length) {
        var l = this.slots[p].last;
        if (l.val - this.move.obj.val === 1) {
            l.className += ' overok';
        } else {
            l.className += ' over';
        }
    }
};

Board.prototype.deal_new = function () {
    var self = this;
    var i, z = 0;
    if (this.slots[10].length < 10) {
        msg("<h2>ERR stiva rezerva</h2>");
    }
    for (i = 0; i < 10; i++) {
        if (this.slots[i].length < 1) {
            msg("Nu puteți trage cărți! Trebuie ca toate pozițiile să fie ocupate!");
            return;
        }
        this.slots[i].push(this.slots[10].pop());
        this.slots[i].last.up();
        this.slots[i].last.slot = i;
        this.slots[i].last.anim({
                left: this.pos[i],
                top: 0,
                delay: i * 200
            }, 400,
            function () {
                self.lay_even(z++);
                player.play(self.adeal);
            });
    }
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
        if (this.slots[oldslot].length > 0) this.slots[oldslot].last.up();
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
    if (this.slots[oldslot].length > 0) this.slots[oldslot].last.up();
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

function card(val, col) {
    var e = gen_card(val, col);
    var elm = e[0];
    elm.val = val;
    elm.col = col;
    elm.cover = e[1];
    elm.id = '' + e[2];
    elm.down = true;
    elm.slot = 0;
    elm.x = 0;
    elm.y = 0;
    elm.z = 1;
    elm.up = function () {
        elm.down = false;
        elm.cover.classList.remove('down');
    };
    elm.down = function () {
        elm.down = true;
        elm.cover.classList.add('down');
    };
    elm.xy = function (x, y, z) {
        elm.x = x;
        elm.y = (y == null) ? elm.y : y;
        elm.z = (z == null) ? elm.z : z;
        elm.style.left = x + 'px';
        elm.style.top = y + 'px';
        elm.style.zIndex = elm.z;
    };
    elm.zix = function (z) {
        elm.style.zIndex = elm.z = z;
    };
    elm.anim = function (prop, t, end) {
        if (prop['delay'] != null) {
            setTimeout(function () {
                elm.anim({left: prop['left'], top: prop['top']}, t, end);
            }, prop['delay']);
            return;
        }
        t = t || 400;
        elm.y = elm.offsetTop;
        elm.x = elm.offsetLeft;
        elm.dx = prop['left'] - elm.x;
        elm.dy = prop['top'] - elm.y;
        elm.start = new Date;
        elm.sin = setInterval(function () {
            var i;
            var dt = new Date - elm.start;
            if (dt >= t) {
                clearInterval(elm.sin);
                elm.style.left = elm.x = prop['left'] + 'px';
                elm.style.top = elm.y = prop['top'] + 'px';
                if (end) end();
                return;
            }
            for (i in prop) {
                switch (i) {
                    case 'left':
                        elm.style.left = (easeInOutQuad(dt / t) * elm.dx + elm.x) + 'px';
                        break;
                    case 'top':
                        elm.style.top = (easeInOutQuad(dt / t) * elm.dy + elm.y) + 'px';
                        break;
                }
            }
        }, 15);
    };
    elm.stop = function () {
        clearInterval(elm.sin);
        return elm;
    };
    return elm;
}

//.appendChild(gen_card(14, 'trf')[0]);
new Board();
