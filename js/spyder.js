/**
 * Created by cosmin on 21.12.2014.
 * mod: 06.01.2015.
 */
function log() {
    console.log(arguments);
}

function easeInOutQuad(t) {
    return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

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
        arr[i].id = 'q' + i;
    }
}
//Element.prototype.remove = function () {
//    this.parentElement.removeChild(this);
//};
function _(e) {
    var elm = (typeof e === "string") ? document.querySelector(e) : e;
    elm.arr = [];
    elm.k = 0;
    elm.hide = function (t) {
        t = t || 500;
        clearInterval(elm.hin);
        elm.hstart = new Date;
        elm.hin = setInterval(function () {
            var dt = new Date - elm.hstart;
            if (dt > t) {
                clearInterval(elm.hin);
                elm.style.display = 'none';
                elm.down = true;
            }
            elm.style.opacity = 1 - dt / t;
        }, 15);
    };
    elm.show = function (t) {
        t = t || 500;
        clearInterval(elm.hin);
        elm.style.display = 'block';
        elm.style.opacity = 0;
        elm.hstart = new Date;
        elm.hin = setInterval(function () {
            var dt = new Date - elm.hstart;
            if (dt > t) {
                clearInterval(elm.hin);
                elm.style.display = 'block';
                elm.down = false;
            }
            elm.style.opacity = dt / t;
        }, 15);
    };
    elm.anim = function (prop, t, end) {
        prop['left'] = (prop['left'] == null) ? elm.x : prop['left'];
        prop['top'] = (prop['top'] == null) ? elm.y : prop['top'];
        t = t || 400;
        elm.arr.push({
            start: (prop.delay == null) ? new Date : new Date().getTime() + prop.delay,
            t: t,
            prop: prop,
            end: end,
            x: elm.offsetLeft,
            y: elm.offsetTop,
            dx: prop['left'] - elm.offsetLeft,
            dy: prop['top'] - elm.offsetTop
        });

        if (elm.arr.length > 1)return elm;
        elm.sin = setInterval(function () {
            var o = elm.arr[0];
            var dt = new Date - o.start;
            if (o.prop.delay != null) {
                if (dt < 0) {
                    return elm;
                }
            }
            if (dt >= o.t) {
                elm.style.left = o.prop['left'] + 'px';
                elm.style.top = o.prop['top'] + 'px';
                elm.x = o.prop['left'];
                elm.y = o.prop['top'];
                if (o.prop.z != null) {
                    elm.z = elm.style.zIndex = o.prop.z;
                }
                elm.arr.shift();
                if (elm.arr.length > 0) {
                    o = elm.arr[0];
                    o.start = (o.prop.delay == null) ? new Date : new Date().getTime() + o.prop.delay;
                    o.x = elm.offsetLeft;
                    o.y = elm.offsetTop;
                    o.dy = o.prop.top - elm.offsetTop;
                    o.dx = o.prop.left - elm.offsetLeft;
                } else {
                    clearInterval(elm.sin);
                    if (o.end != null) {
                        try {
                            end();
                        } catch (err) {
                            log('end err:', err);
                        }
                    }
                }
            } else {
                elm.style.left = (easeInOutQuad(dt / o.t) * o.dx + o.x) + 'px';
                elm.style.top = (easeInOutQuad(dt / o.t) * o.dy + o.y) + 'px';
            }
        }, 15);
        return elm;
    };
    elm.stop = function () {
        clearInterval(elm.sin);
        elm.arr = [];
    };
    elm.xy = function (x, y, z) {
        elm.x = x;
        elm.y = y;
        elm.z = (z == null) ? elm.z : z;
        elm.style.left = x + 'px';
        elm.style.top = y + 'px';
        elm.style.zIndex = elm.z;
    };
    elm.zix = function (z) {
        elm.style.zIndex = elm.z = z;
    };
    return elm;
}

function Message() {
    this.msg = _('#message');
    this.ttl = document.getElementById('mttl');
    this.txt = document.getElementById('mtxt');
    var e = document.getElementById('close');
    this.msgt = -1;
    var self = this;
    e.addEventListener('click', function () {
        self.msg.hide(200);
    }, false);
    this.message = function (txt, ttl) {
        clearTimeout(self.msgt);
        self.ttl.innerHTML = ttl;
        self.txt.innerHTML = txt;
        self.msg.show();
        self.msgt = setTimeout(function () {
            self.msg.hide();
        }, 4000);
    }
}

function Player() {
    var i;
    this.ch = [];
    for (i = 0; i < 10; i++) {
        this.ch[i] = [];
        this.ch[i]['channel'] = new Audio();
        this.ch[i]['end'] = -1;
    }
    this.MUTE = false;
    var self = this;
    this.play = function (e) {
        var now, i;
        if (self.MUTE)return;
        for (i = 0; i < self.ch.length; i++) {
            now = new Date().getTime();
            if (self.ch[i]['end'] < now) {
                self.ch[i]['channel'].src = e.src;
                //self.ch[i]['channel'].load();
                self.ch[i]['channel'].play();
                self.ch[i]['end'] = now + e.duration * 1000;
                break;
            }
        }
    };
    this.mute = function () {
        self.MUTE = !self.MUTE;
    }
}

var player = new Player();


function spyder() {
    function card(val) {
        var e = document.createElement('div');
        e.className = 'icard down';
        e.style.backgroundPosition = (-(val - 1) * 5) + 'em 0';
        var elm = _(e);
        elm.val = val;
        elm.down = true;
        elm.slot = -1;
        elm.x = 0;
        elm.y = 0;
        elm.z = 1;
        elm.up = function () {
            elm.down = false;
            elm.classList.remove('down');
        };
        elm.back = function () {
            elm.down = true;
            elm.classList.add('down');
        };
        return elm;
    }


    this.body = document.getElementById('board');
    this.scor = document.getElementById('scor');
    this.nomv = 0;

    this.body.style.height = (window.innerHeight - 10) + 'px';

    this.msg = new Message();
    this.move = {};
    this.MOVE = false;
    this.body.style.fontSize = (this.body.offsetWidth / 10 / 5 - 1) + 'px';
    this.aclick = document.getElementById('aclick');
    this.ystep = this.body.offsetHeight / 25;
    var self = this;

    function lay() {
        var i, v, crd;
        self.stock = [];
        for (v = 1; v < 14; v++) {
            for (i = 0; i < 8; i++) {
                crd = card(parseInt(v), 'ngr');
                self.body.appendChild(crd);
                self.stock.push(crd);
            }
        }
        shuffle(self.stock);
        setId(self.stock);
        relay();
    }

    function relay() {
        var k, pos, sp, i;
        self.slots = [];
        self.pos = [];
        self.nomv = -1;
        self.buff = [];
        self.rbuff = [];
        self.crs = -1;
        inc_mv();
        k = 0;
        sp = (self.body.offsetWidth - self.stock[0].offsetWidth) / 9;
        for (i = 0; i < 10; i++) {
            pos = k++ * sp;
            self.pos.push(pos);
            self.slots.push([]);
        }
        self.slots.push([]);
        self.slots.push([]);
        for (i = 0; i < 54; i++) {
            self.stock[i].slot = i % 10;
            self.stock[i].xy(self.pos[i % 10], Math.floor(i / 10) * 5, i);
            self.slots[i % 10].push(self.stock[i]);
            if (i > 43) {
                self.stock[i].up();
            } else {
                self.stock[i].back();
            }
        }
        k = -10;
        for (i = 54; i < self.stock.length; i++) {
            if ((i - 54) % 10 === 0)k += 10;
            self.stock[i].slot = 10;
            self.stock[i].back();
            self.slots[10].push(self.stock[i]);
            self.stock[i].xy(self.body.offsetWidth - self.stock[0].offsetWidth - k, self.body.offsetHeight - self.stock[0].offsetHeight, k / 10 + 1);
        }
        for (i = 0; i < 10; i++) {
            lay_even(i);
        }
        self.TIME = new Date;
        self.timee = document.getElementById('time');
        self.time = setInterval(function () {
            self.timee.innerHTML = parseInt((new Date - self.TIME) / 1000) + ' s';
        }, 1000);
    }

    function lay_even(pos, t, end) {
        var i, k = 0, z = 0;
        var arr = self.slots[pos];
        for (i = 0; i < arr.length; ++i) {
            arr[i].anim({left: self.pos[pos], top: k}, t || 300, function () {
                try {
                    self.slots[pos][z].zix(++z);
                    if (end)end();
                } catch (err) {
                    log(err);
                }

            });
            k += (self.slots[pos][i].down) ? self.ystep / 5 : self.ystep;
        }
    }

    function inc_mv() {
        self.scor.innerHTML = 'Mutări: ' + ++self.nomv;
    }

    function check(pos) {
        var arr = self.slots[pos];
        if (arr.length < 13) {
            lay_even(pos);
            return;
        }
        var i, k = 4, yy;
        var x = self.slots[11].length / 13 * 10;
        var y = self.body.offsetHeight - self.stock[0].offsetHeight;
        for (i = arr.length - 13; i < arr.length - 1; i++) {
            if (arr[i].val - arr[i + 1].val != 1 || arr[i].down) {
                lay_even(pos);
                return;
            }
        }

        self.buff.push({
            op: 2,
            arr: self.slots[pos].slice(self.slots[pos].length - 13)
        });
        player.play(document.getElementById('adown'));
        yy = self.slots[pos][self.slots[pos].length - 13].offsetTop + 20;
        for (i = arr.length - 1; i >= arr.length - 13; --i) {
            arr[i].slot = 11;
            arr[i].anim({
                left: self.pos[pos], top: yy, z: 106 + i
            }, 500).anim({
                left: x, top: y, delay: k++ * 100, z: x / 10 + 2
            }, 400);
        }

        self.slots[11] = self.slots[11].concat(self.slots[pos].splice(self.slots[pos].length - 13));
        if (self.slots[pos].length) last(self.slots[pos]).up();
        for (i = 0; i < 10; i++) {
            if (self.slots[i].length > 0) {
                return;
            }
        }
        x = self.stock[0].x;
        y = self.stock[0].y;
        player.play(document.getElementById('awin'));
        self.stock[0].anim({left: x, top: y, delay: 400}, 400, function () {
            player.play(document.getElementById('awin'));
        });
        self.msg.message('Ai câștigat!', 'Felicitări');
    }

    function find_place(arr) {
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
            if (self.slots[i].length === 0) {
                empty = i;
                continue;
            }
            if (last(self.slots[i]).val - arr[0].val === 1) {
                ret.push([end_suit(i), i]);
            }
        }
        if (ret.length === 0) {
            if (empty == null) {
                self.slots[oldslot] = self.slots[oldslot].concat(arr);
                player.play(self.aclick);
                return;
            }
            self.buff.push({
                old: oldslot,
                op: 1,
                arr: arr
            });
            for (i = 0; i < arr.length; i++) {
                arr[i].slot = empty;
                arr[i].style.zIndex = 106;
            }
            self.slots[empty] = self.slots[empty].concat(arr);
            if (self.slots[oldslot].length > 0) last(self.slots[oldslot]).up();
            lay_even(empty);
            player.play(document.getElementById('aoven'));
            inc_mv();
            return;
        }
        self.buff.push({
            old: oldslot,
            op: 1,
            arr: arr
        });
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
        self.slots[max] = self.slots[max].concat(arr);
        if (self.slots[oldslot].length > 0) last(self.slots[oldslot]).up();
        player.play(document.getElementById('aoven'));
        check(max);
        inc_mv();
    }

    this.body.addEventListener('contextmenu', function (evt) {
        var c, i, arr;
        evt.preventDefault();
        c = self.stock[parseInt(evt.target.id.substr(1))];
        if (c == null || c.down || c.slot > 9)return false;
        arr = self.slots[c.slot].splice(self.slots[c.slot].indexOf(c));
        for (i = 0; i < arr.length - 1; i++) {
            if (arr[i].val - arr[i + 1].val != 1 || arr[i].down) {
                self.slots[c.slot] = self.slots[c.slot].concat(arr);
                return;
            }
        }
        find_place(arr);
    }, false);

    this.body.addEventListener('mousedown', function (evt) {
        var c, arr;
        evt.preventDefault();
        if (evt.button != 0)return;
        c = self.stock[parseInt(evt.target.id.substr(1))];
        if (!c)return;
        if (c.slot === 10) {
            var i;
            for (i = 0; i < 10; i++) {
                if (self.slots[i].length < 1) {
                    player.play(document.getElementById('aerr'));
                    self.msg.message('Nu puteți trage cărți dacă nu sunt ocupate toate pozițiile!', 'Incorect!');
                    return;
                }
            }
            var crd, z = 0;
            player.play(document.getElementById('aoven'));
            arr = [];
            for (i = 0; i < 10; i++) {
                crd = self.slots[10].pop();
                crd.up();
                crd.slot = i;
                crd.style.zIndex = 105;
                crd.anim({left: self.pos[i], top: last(self.slots[i]).offsetTop, delay: i * 100}, 400, function () {
                    lay_even(z++);
                });
                self.slots[i].push(crd);
                arr.push(crd);
            }
            self.buff.push({
                old: 10,
                op: 3,
                arr: arr
            });
            return;
        }
        player.play(self.aclick);
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
        var x = self.move.suit[0].x, pos = 0, i;
        m = self.body.offsetWidth;
        for (i = 0; i < 10; i++) {
            if (i === self.move.slot) continue;
            v = Math.abs(x - self.pos[i]);
            if (v < m) {
                m = v;
                pos = i;
            }
        }
        self.buff.push({
            old: self.move.suit[0].slot,
            op: 1,
            arr: self.move.suit
        });
        if (self.slots[pos].length === 0 || last(self.slots[pos]).val - self.move.suit[0].val === 1) {
            self.slots[pos] = self.slots[pos].concat(self.move.suit);
            for (i = 0; i < self.slots[pos].length; i++) {
                self.slots[pos][i].slot = pos;
            }
            if (self.slots[self.move.slot].length > 0) last(self.slots[self.move.slot]).up();
            player.play(document.getElementById('aoven'));
            check(pos);
            inc_mv();

        } else {
            self.slots[self.move.slot] = self.slots[self.move.slot].concat(self.move.suit);
            lay_even(self.move.slot);
            player.play(document.getElementById('aerr'));
        }
        evt.preventDefault();
    }, false);
    document.getElementById('res').addEventListener('click', function () {
        relay();
    }, false);
    document.getElementById('mute').addEventListener('click', function () {
        player.mute();
        document.getElementById('imute').className = (player.MUTE) ? 'unmute' : 'mute';
    }, false);
    document.getElementById('undo').addEventListener('click', function () {
        self.crs--;
        var i;
        if (self.crs < 0) {
            self.crs = self.buff.length - 1;
        }
        if (self.buff.length === 0)return;
        var o = self.buff[self.crs];
        player.play(document.getElementById('aundo'));
        if (o.op === 1) {
            var n = o.arr[0].slot;
            var arr = self.slots[n].splice(self.slots[n].indexOf(o.arr[0]));
            for (i = 0; i < arr.length; i++) {
                arr[i].slot = o.old;
                self.slots[o.old].push(arr[i]);
            }
            lay_even(o.old);
            lay_even(n);
            self.rbuff.push(self.buff.pop());
        } else if (o.op === 3) {
            var c, k = parseInt(self.slots[10].length / 10) * 10;
            for (i = 9; i > -1; --i) {
                c = self.slots[i].pop();
                c.back();
                c.slot = 10;
                c.zix();
                self.slots[10].push(c);
                c.anim({
                    left: self.body.offsetWidth - self.stock[0].offsetWidth - k,
                    top: self.body.offsetHeight - self.stock[0].offsetHeight,
                    z: k / 10 + 1
                });
                lay_even(i);
            }
            self.rbuff.push(self.buff.pop());
        }
    }, false);
    document.getElementById('redo').addEventListener('click', function () {

    }, false);
    lay();
}
spyder();
