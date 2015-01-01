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

function shuffle(arr) {
    var ret = arr.splice(0);
    var l = ret.length;
    for (var i = 0; i < l; i++) {
        arr.push(ret.splice(Math.floor(Math.random() * ret.length), 1)[0]);
    }
}

function last(arr) {
    return arr[arr.length - 1];
}

function setId(arr) {
    for (var i = 0; i < arr.length; i++) {
        arr[i].id = arr[i].cover.id = 'q' + i;
    }
}
//------------------------------------

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

//________________SPYDER_STOCK________________________________________

function msg(txt) {
    document.getElementById('msg').innerHTML = txt;
}

//__________________CARD_______________________________________________

function gen_card(val, col) {
    var e, i, id;
    e = document.createElement('div');
    e.className = 'card ' + col;

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

    e.appendChild(i);

    return [e, i];
}

function card(val, col) {
    var e = gen_card(val, col);
    var elm = e[0];
    elm.val = val;
    elm.cover = e[1];
    elm.down = true;
    elm.slot = -1;
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
                elm.style.left = prop['left'] + 'px';
                elm.style.top = prop['top'] + 'px';
                elm.x = prop['left'];
                elm.y = prop['top'];
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
//new Board();

function Board() {
    this.body = document.getElementById('board');
    this.stock = [];
    this.scor = document.getElementById('scor');
    this.nomv = 0;

    this.aclick = document.getElementById('clck');
    this.aclick2 = document.getElementById('clck2');
    this.aerr = document.getElementById('aerr');
    this.adeal = document.getElementById('adeal');
    this.adown = document.getElementById('adown');

    this.body.style.height = (window.innerHeight - 20) + 'px';

    this.move = {};
    this.MOVE = false;
    this.body.style.fontSize = (this.body.offsetWidth / 10 / 5 - 1) + 'px';

    this.lay();
    this.set_evt();
}

Board.prototype.lay_even = function (pos) {
    var i, k = 0, z = 0;
    var self = this, arr = this.slots[pos];
    for (i = 0; i < arr.length; i++) {
        arr[i].anim({left: this.pos[pos], top: k}, 300, function () {
            self.slots[pos][z].zix(++z);
        });
        k += (this.slots[pos][i].down) ? 5 : 30;
    }
};

Board.prototype.inc_mv = function () {
    this.scor.innerHTML = 'Mutări: ' + ++this.nomv;
};

Board.prototype.check = function (pos) {
    var arr = this.slots[pos];
    if (arr.length < 13) {
        this.lay_even(pos);
        return;
    }
    var i, k = 0, z = 0, self = this;
    for (i = 0; i < arr.length - 1; i++) {
        if (arr[i].val - arr[i + 1].val != 1 || arr[i].down) {
            this.lay_even(pos);
            return false;
        }
        arr[i].anim({left: this.pos[pos], top: k}, 400, function () {
            self.slots[pos][z].zix(++z);
        });
        k += (this.slots[pos][i].down) ? 5 : 30;
    }
    player.play(this.adown);

    last(this.slots[pos]).anim({left: this.pos[pos], top: k}, 450, function () {
        var x = self.slots[11].length / 13 * 10;
        var a = self.slots[pos].splice(self.slots[pos].length - 13);
        if (self.slots[pos].length > 0) {
            last(self.slots[pos]).up();
        }
        for (i = 0; i < a.length; i++) {
            a[i].slot = 11;
            a[i].anim({left: x, top: self.body.offsetHeight - self.stock[0].offsetHeight}, 600);
        }
        self.slots[11] = self.slots[11].concat(a);
    });
    for (i = 0; i < 10; i++) {
        if (this.slots[i].length) return;
    }
    player.play(document.getElementById('awin'));
    msg('<h1>Win!</h1>');
};

Board.prototype.find_place = function (arr) {
    var i, ret = [], max = [-1, -1], oldslot = arr[0].slot, empty = null;
    var self = this;

    function end_suit(pos) {
        var i, k = 0;
        for (i = self.slots[pos].length - 1; i > 0; i--) {
            if (self.slots[pos][i - 1].val - self.slots[pos][i].val === 1) {
                k++;
            } else {
                return k;
            }
        }
        return k;
    }

    for (i = 0; i < 10; i++) {
        if (i === oldslot) continue;
        if (this.slots[i].length === 0) {
            empty = i;
            continue;
        }
        if (last(this.slots[i]).val - arr[0].val === 1) {
            ret.push([end_suit(i), i]);
        }
    }
    if (ret.length === 0) {
        if (empty == null){
            this.slots[oldslot] = this.slots[oldslot].concat(arr);
            return;
        }
        for (i = 0; i < arr.length; i++) {
            arr[i].slot = empty;
            arr[i].style.zIndex = 106;
        }
        this.slots[empty] = this.slots[empty].concat(arr);
        if (this.slots[oldslot].length > 0) last(this.slots[oldslot]).up();
        this.lay_even(empty);
        player.play(this.aclick2);
        this.inc_mv();
        return;
    }
    for (i = 0; i < ret.length; i++) {
        if (ret[i][0] > max[0]) {
            max = ret[i];
        }
    }
    max = max[1];
    for (i = 0; i < arr.length; i++) {
        arr[i].slot = max;
        arr[i].style.zIndex = 106;
    }
    this.slots[max] = this.slots[max].concat(arr);
    if (this.slots[oldslot].length > 0) last(this.slots[oldslot]).up();
    player.play(this.aclick2);
    this.check(max);
    this.inc_mv();
};


Board.prototype.set_evt = function () {
    var self = this, c, i, arr;

    this.body.addEventListener('contextmenu', function (evt) {
        evt.preventDefault();
        player.play(self.aclick);
        var c = self.stock[parseInt(evt.target.id.substr(1))];
        if (c == null || c.down || c.slot > 9)return false;
        arr = self.slots[c.slot].splice(self.slots[c.slot].indexOf(c));
        for (i = 0; i < arr.length - 1; i++) {
            if (arr[i].val - arr[i + 1].val != 1 || arr[i].down) {
                self.slots[c.slot] = self.slots[c.slot].concat(arr);
                return;
            }
        }
        self.find_place(arr);
    }, false);

    this.body.addEventListener('dblclick', function (evt) {
        evt.preventDefault();
    }, false);

    this.body.addEventListener('mousedown', function (evt) {
        evt.preventDefault();
        if (evt.button != 0)return;
        c = self.stock[parseInt(evt.target.id.substr(1))];
        if (!c)return;
        player.play(self.aclick);
        if (c.slot === 10) {
            var i, z = 0;

            for (i = 0; i < 10; i++) {
                if (self.slots[i].length < 1) {
                    msg("Nu puteți trage cărți! Trebuie ca toate pozițiile să fie ocupate!");
                    return;
                }
            }
            for (i = 0; i < 10; i++) {
                self.slots[i].push(self.slots[10].pop());
                last(self.slots[i]).up();
                last(self.slots[i]).slot = i;
                last(self.slots[i]).anim({
                    left: self.pos[i],
                    top: 0,
                    delay: i * 200
                }, 400, function () {
                    self.lay_even(z++);
                    player.play(self.adeal);
                });
            }
            return;
        }
        if (c.down || c.slot > 9)return;
        arr = self.slots[c.slot].splice(self.slots[c.slot].indexOf(c));
        for (i = 0; i < arr.length - 1; i++) {
            if (arr[i].val - arr[i + 1].val != 1 || arr[i].down) {
                self.slots[c.slot] = self.slots[c.slot].concat(arr);
                self.MOVE = false;
                return;
            }
            arr[i].style.zIndex = arr[i].z = (i + 105);
        }
        self.move = {
            suit: arr,
            x: c.x,
            y: c.y,
            dx: evt.pageX - c.x,
            dy: evt.pageY - c.y,
            alt: (last(arr).offsetTop - arr[0].offsetTop) / (arr.length - 1) || 0,
            slot: c.slot
        };

        last(arr).style.zIndex = last(arr).z = arr.length + 105;
        self.MOVE = true;
        evt.preventDefault();
    }, false);

    this.body.addEventListener('mousemove', function (evt) {
        if (!self.MOVE) return;
        var i, l = self.move.suit.length;
        for (i = 0; i < l; i++) {
            self.move.suit[i].xy(
                evt.pageX - self.move.dx,
                evt.pageY - self.move.dy + self.move.alt * i
            );
        }
        evt.preventDefault();
    }, false);

    this.body.addEventListener('mouseup', function (evt) {
        if (!self.MOVE) return;
        self.MOVE = false;
        var m, v;
        //var crd = this.move.obj;
        var x = self.move.suit[0].x, pos = 0, oldslot, i;
        m = self.body.offsetWidth;
        for (i = 0; i < 10; i++) {
            if (i === self.move.slot) continue;
            v = Math.abs(x - self.pos[i]);
            if (v < m) {
                m = v;
                pos = i;
            }
        }

        if (self.slots[pos].length === 0 || last(self.slots[pos]).val - self.move.suit[0].val === 1) {
            self.slots[pos] = self.slots[pos].concat(self.move.suit);
            for (i = 0; i < self.slots[pos].length; i++) {
                self.slots[pos][i].slot = pos;
            }
            if (self.slots[self.move.slot].length > 0) last(self.slots[self.move.slot]).up();
            self.check(pos);
            self.inc_mv();
            player.play(self.aclick2);
        } else {
            self.slots[self.move.slot] = self.slots[self.move.slot].concat(self.move.suit);
            player.play(self.aerr);
            self.lay_even(self.move.slot);
        }
        evt.preventDefault();
    }, false);
};

Board.prototype.lay = function () {
    var i, pos, k, crd, sp;
    for (var v in vals) {
        for (i = 0; i < 8; i++) {
            crd = card(parseInt(v), 'ngr');
            this.body.appendChild(crd);
            this.stock.push(crd);
        }
    }
    shuffle(this.stock);
    setId(this.stock);
    this.slots = [];
    this.pos = [];
    k = 0;
    sp = (this.body.offsetWidth - crd.offsetWidth) / 9;
    for (i = 0; i < 10; i++) {
        pos = k++ * sp;
        this.pos.push(pos);
        this.slots.push([]);
    }
    this.slots.push([]);//[10]restul de cărți
    this.slots.push([]);//[11] cărțile luate de pe masă

    for (i = 0; i < 54; i++) {
        this.stock[i].slot = i % 10;
        this.stock[i].xy(this.pos[i % 10], Math.floor(i / 10) * 5, i);
        this.slots[i % 10].push(this.stock[i]);
        if (i > 43)this.stock[i].up();
    }
    k = -10;
    for (i = 54; i < this.stock.length; i++) {
        if ((i - 54) % 10 === 0)k += 10;
        this.stock[i].slot = 10;
        this.slots[10].push(this.stock[i]);
        this.stock[i].xy(this.body.offsetWidth - crd.offsetWidth - k, this.body.offsetHeight - crd.offsetHeight, i);
    }
    msg('Start');
};

new Board();