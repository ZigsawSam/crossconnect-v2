// ═══════════════════════════════════════════════════════════════
// CROSSCONNECT — game.js
// § EXPORTS — placed at TOP so onclick= works even if a later
//   runtime error occurs. Function declarations are hoisted.
// ═══════════════════════════════════════════════════════════════
window.goAvatar       = goAvatar;
window.goSetup        = goSetup;
window.hostGame       = hostGame;
window.joinGame       = joinGame;
window.copyCode       = copyCode;
window.goVote         = goVote;
window.castVote       = castVote;
window.submitAnswer   = submitAnswer;
window.usePowerup     = usePowerup;
window.switchTab      = switchTab;
window.rematch        = rematch;
window.goChat         = goChat;
window.quickEmoji     = quickEmoji;
window.sendChat       = sendChat;
// Chat extras
window.askQuit        = askQuit;
window.cancelQuit     = cancelQuit;
window.confirmQuit    = confirmQuit;
window.toggleGifPanel = toggleGifPanel;
window.searchGifs     = searchGifs;
window.triggerImagePick = triggerImagePick;
window.sendImage      = sendImage;
window.sendLocation   = sendLocation;
window.closeLightbox  = closeLightbox;

// ─────────────────────────────────────────────────────
// § DATA
// ─────────────────────────────────────────────────────
var QUESTIONS = {
  food: [
    { text: 'Most famous street food in your city?',           cat: 'food'    },
    { text: 'A sweet dish your state is known for?',           cat: 'food'    },
    { text: 'What do people eat for breakfast in your area?',  cat: 'food'    },
    { text: 'Which festival food do you love most?',           cat: 'food'    },
    { text: 'One dish outsiders must try in your state?',      cat: 'food'    },
    { text: 'Your go-to comfort food?',                        cat: 'food'    },
    { text: 'A local ingredient unique to your region?',       cat: 'food'    },
    { text: 'Which biryani style do you prefer and why?',      cat: 'food'    },
    { text: 'Popular drink in your state (chai, lassi...)?',   cat: 'food'    },
    { text: 'A snack you can only find in your hometown?',     cat: 'food'    },
  ],
  culture: [
    { text: 'Biggest festival in your state?',                 cat: 'culture' },
    { text: 'A folk dance or art form from your region?',      cat: 'culture' },
    { text: 'Language most people speak at home in your city?',cat: 'culture' },
    { text: 'A unique tradition in your family or community?', cat: 'culture' },
    { text: 'Most famous historical place in your state?',     cat: 'culture' },
    { text: 'A famous personality from your state?',           cat: 'culture' },
    { text: 'A common greeting in your regional language?',    cat: 'culture' },
    { text: 'Traditional clothing style in your state?',       cat: 'culture' },
    { text: 'Famous temple, mosque or shrine near you?',       cat: 'culture' },
    { text: 'One thing outsiders misunderstand about your state?', cat: 'culture' },
  ],
  sports: [
    { text: 'Most popular sport in your area?',                cat: 'sports'  },
    { text: 'A famous sportsperson from your state?',          cat: 'sports'  },
    { text: 'Do you play cricket? Which team do you support?', cat: 'sports'  },
    { text: 'A traditional sport or game from your state?',    cat: 'sports'  },
    { text: 'Which IPL team does your city cheer for?',        cat: 'sports'  },
    { text: 'Have you played kabaddi or kho-kho? Tell us!',   cat: 'sports'  },
    { text: 'Outdoor activity popular in your region?',        cat: 'sports'  },
    { text: 'A sports event or tournament held in your state?',cat: 'sports'  },
    { text: 'Indian athlete you admire most?',                 cat: 'sports'  },
    { text: 'Sport you would love to learn?',                  cat: 'sports'  },
  ],
  mixed: [
    { text: 'What is your name?',                              cat: 'demo'    },
    { text: 'How old are you?',                                cat: 'demo'    },
    { text: 'What do you do — work or study?',                 cat: 'demo'    },
    { text: 'What is your hometown famous for?',               cat: 'food'    },
    { text: 'Best street food in your city?',                  cat: 'food'    },
    { text: 'Favourite Bollywood or regional film?',           cat: 'culture' },
    { text: 'Favourite sport or game?',                        cat: 'sports'  },
    { text: 'A hobby you love?',                               cat: 'demo'    },
    { text: 'Dream travel destination in India?',              cat: 'culture' },
    { text: 'One thing you love about your state?',            cat: 'culture' },
  ],
};

var CAT_META = {
  food:    { label: '🍛 FOOD',    color: '#F59E0B' },
  culture: { label: '🎭 CULTURE', color: '#BB44FF' },
  sports:  { label: '🏏 SPORTS',  color: '#00FF88' },
  demo:    { label: '👤 ABOUT',   color: '#00E5FF' },
  mixed:   { label: '🌈 MIXED',   color: '#FF3399' },
};

var AVATARS = [
  { sprite: '🧑', name: 'WARRIOR'  },
  { sprite: '🧕', name: 'SAGE'     },
  { sprite: '🧔', name: 'ELDER'    },
  { sprite: '👩', name: 'HERO'     },
  { sprite: '🦸', name: 'CHAMPION' },
  { sprite: '🧙', name: 'WIZARD'   },
  { sprite: '🥷', name: 'NINJA'    },
  { sprite: '🤴', name: 'KING'     },
  { sprite: '👸', name: 'QUEEN'    },
];

var COLORS  = ['#FF6B35','#FFD700','#00FF88','#00E5FF','#BB44FF','#FF3399','#FF4444','#FFFFFF'];
var VULGAR  = /fuck|sex|nude|dick|pussy|boob|shit|bitch|asshole/i;

// ─────────────────────────────────────────────────────
// § AUDIO
// ─────────────────────────────────────────────────────
var _ac = null;
function getAC() {
  if (!_ac) { try { _ac = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {} }
  return _ac;
}
function beep(freq, dur, vol, wave) {
  try {
    var ac = getAC(); if (!ac) return;
    if (ac.state === 'suspended') ac.resume();
    var o = ac.createOscillator(), g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.frequency.value = freq; o.type = wave || 'square';
    g.gain.setValueAtTime(vol || 0.25, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    o.start(); o.stop(ac.currentTime + dur);
  } catch(e) {}
}
var SFX = {
  click:   function(){ beep(440,0.06); },
  submit:  function(){ beep(523,0.07); setTimeout(function(){ beep(659,0.1);  },70); setTimeout(function(){ beep(784,0.12); },140); },
  tick:    function(){ beep(880,0.04,0.1); },
  urgent:  function(){ beep(220,0.12,0.2); },
  powerup: function(){ beep(784,0.08); setTimeout(function(){ beep(1047,0.12); },80); },
  freeze:  function(){ [400,350,300].forEach(function(f,i){ setTimeout(function(){ beep(f,0.15,0.3,'sine'); },i*80); }); },
  win:     function(){ [523,659,784,1047,1319].forEach(function(f,i){ setTimeout(function(){ beep(f,0.18,0.3,'sine'); },i*90); }); },
  lose:    function(){ [400,350,300,250].forEach(function(f,i){ setTimeout(function(){ beep(f,0.2,0.2,'sawtooth'); },i*80); }); },
  connect: function(){ beep(523,0.1,0.2,'sine'); setTimeout(function(){ beep(784,0.15,0.2,'sine'); },120); },
  vote:    function(){ beep(660,0.08,0.2); setTimeout(function(){ beep(880,0.1,0.2); },80); },
  bonus:   function(){ [523,659,784,659,523,784,1047].forEach(function(f,i){ setTimeout(function(){ beep(f,0.1,0.25); },i*60); }); },
};
function sfx(name){ try { SFX[name](); } catch(e) {} }

// ─────────────────────────────────────────────────────
// § STATE
// ─────────────────────────────────────────────────────
var me = {};                          // local player profile + peer data
var peer = null, conn = null;
var roomCode = '', isHost = false;
var myAnswers = [], theirAnswers = [];
var myCount = 0, theirCount = 0;
var myScore = 0, theirScore = 0;
var currentQ = 0, timerInterval = null, timeLeft = 30;
var activeQuestions = [];
var myVote = null, theirVote = null;
var selectedAvatar = AVATARS[0], selectedColor = COLORS[0];
var powerups = { skip:1, freeze:1, bonus:1 };
var isBonusActive = false, isFrozen = false;

// ─────────────────────────────────────────────────────
// § UI
// ─────────────────────────────────────────────────────
function g(id) { return document.getElementById(id); }

function show(id) {
  try {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) screens[i].classList.remove('active');
    var el = g(id); if (el) el.classList.add('active');
  } catch(e) {}
}

function toast(msg) {
  try {
    var old = document.querySelector('.toast');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function(){ if (t.parentNode) t.parentNode.removeChild(t); }, 2800);
  } catch(e) {}
}

function esc(s) {
  var d = document.createElement('div');
  d.textContent = String(s || '');
  return d.innerHTML;
}

function randCode() { return Math.random().toString(36).slice(2,8).toUpperCase(); }

// ─────────────────────────────────────────────────────
// § VISUAL
// ─────────────────────────────────────────────────────
function buildStars() {
  try {
    var wrap = g('stars'); if (!wrap) return;
    // Guard against duplicates on re-render
    if (wrap.querySelector('.star')) return;
    for (var i = 0; i < 80; i++) {
      var s = document.createElement('div');
      s.className = 'star';
      var sz = Math.random() < 0.7 ? 1 : 2;
      s.style.width             = sz + 'px';
      s.style.height            = sz + 'px';
      s.style.left              = (Math.random() * 100) + '%';
      s.style.top               = (Math.random() * 100) + '%';
      s.style.background        = '#fff';
      s.style.animationDuration = (2 + Math.random() * 4) + 's';
      s.style.animationDelay    = (Math.random() * 4) + 's';
      wrap.appendChild(s);
    }
  } catch(e) {}
}
window.addEventListener('load', buildStars);

function launchConfetti() {
  try {
    var palette = ['#FF6B35','#FFD700','#00FF88','#00E5FF','#BB44FF','#FF3399'];
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:500;overflow:hidden';
    document.body.appendChild(wrap);
    for (var i = 0; i < 70; i++) {
      var p = document.createElement('div');
      var sz = 4 + Math.floor(Math.random() * 3) * 4;
      p.style.cssText = 'position:absolute'
        + ';width:'  + sz + 'px;height:' + sz + 'px'
        + ';left:'   + (Math.random() * 100) + '%'
        + ';background:' + palette[Math.floor(Math.random() * palette.length)]
        + ';animation:fall ' + (1.5 + Math.random() * 2) + 's linear ' + (Math.random() * 0.8) + 's forwards'
        + ';transform:rotate(' + (Math.random() * 360) + 'deg)';
      wrap.appendChild(p);
    }
    setTimeout(function(){ if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 4000);
  } catch(e) {}
}

// ─────────────────────────────────────────────────────
// § AVATAR
// ─────────────────────────────────────────────────────
function buildAvatarUI() {
  try {
    var grid = g('avatar-grid'); if (!grid) return;
    grid.innerHTML = '';
    AVATARS.forEach(function(av, i) {
      var d = document.createElement('div');
      d.className = 'avatar-opt' + (i === 0 ? ' sel' : '');
      d.innerHTML = '<span class="av-preview">' + av.sprite + '</span>'
        + '<div style="font-family:var(--font);font-size:0.4rem;margin-top:4px;color:var(--muted)">' + av.name + '</div>';
      // IIFE to capture av by value, not by reference
      (function(avatar, el) {
        el.onclick = function() {
          document.querySelectorAll('.avatar-opt').forEach(function(x){ x.classList.remove('sel'); });
          el.classList.add('sel');
          selectedAvatar = avatar;
          refreshAvatarPreview();
          sfx('click');
        };
      })(av, d);
      grid.appendChild(d);
    });

    var row = g('color-row'); if (!row) return;
    row.innerHTML = '';
    COLORS.forEach(function(c, i) {
      var s = document.createElement('div');
      s.className = 'color-swatch' + (i === 0 ? ' sel' : '');
      s.style.background = c;
      s.style.width = '28px'; s.style.height = '28px';
      s.style.cursor = 'pointer'; s.style.display = 'inline-block';
      // Use outline so it can't be overridden by a border inline style
      s.style.outline = i === 0 ? '2px solid #fff' : '2px solid transparent';
      (function(color, el) {
        el.onclick = function() {
          document.querySelectorAll('.color-swatch').forEach(function(x){
            x.classList.remove('sel'); x.style.outline = '2px solid transparent';
          });
          el.classList.add('sel'); el.style.outline = '2px solid #fff';
          selectedColor = color;
          sfx('click');
        };
      })(c, s);
      row.appendChild(s);
    });
    refreshAvatarPreview();
  } catch(e) { console.error('buildAvatarUI:', e); }
}

function refreshAvatarPreview() {
  var p = g('avatar-preview'),     n = g('avatar-name-preview');
  if (p) p.textContent = selectedAvatar.sprite;
  if (n) n.textContent = selectedAvatar.name;
}

// ─────────────────────────────────────────────────────
// § NAV
// ─────────────────────────────────────────────────────
function goAvatar() {
  var name  = g('inp-name').value.trim().toUpperCase();
  var state = g('inp-state').value;
  var city  = g('inp-city').value.trim().toUpperCase();

  if (!name || !state || !city) {
    toast('ENTER NAME, STATE AND CITY');
    return;
  }

  me = { name, state, city };
  buildAvatarUI();
  show('s-avatar');
}

function goSetup() {
  me.avatar = selectedAvatar ? selectedAvatar.sprite : '🧑';
  me.color  = selectedColor  || '#FF6B35';
  var la = g('lobby-avatar'), ln = g('lobby-name'), lr = g('lobby-region');
  if (la) { la.textContent = me.avatar; la.style.filter = 'drop-shadow(0 0 8px ' + me.color + ')'; }
  if (ln) ln.textContent = me.name;
  if (lr) lr.textContent = me.city + ', ' + me.state;
  show('s-setup');
  sfx('click');
}

function hostGame() {
  // Guard: if PeerJS CDN failed to load, show a clear error
  if (typeof Peer === 'undefined') {
    toast('PEERJS NOT LOADED — CHECK YOUR CONNECTION');
    return;
  }
  // Destroy stale peer to avoid ID conflicts on retry
  if (peer) { try { peer.destroy(); } catch(e) {} peer = null; conn = null; }
  roomCode = randCode(); isHost = true;
  var rc = g('room-code-display'), wt = g('wait-title'), bgv = g('btn-go-vote');
  if (rc)  rc.textContent = roomCode;
  if (wt)  wt.innerHTML = 'WAITING<span class="dots"><span>.</span><span>.</span><span>.</span></span>';
  if (bgv) bgv.style.display = 'none';
  show('s-wait');
  initPeer(roomCode, null);
  sfx('click');
}

function joinGame() {
  if (typeof Peer === 'undefined') {
    toast('PEERJS NOT LOADED — CHECK YOUR CONNECTION');
    return;
  }
  var code = g('inp-join-code') ? g('inp-join-code').value.trim().toUpperCase() : '';
  if (code.length < 4) { toast('ENTER A VALID CODE!'); return; }
  if (peer) { try { peer.destroy(); } catch(e) {} peer = null; conn = null; }
  roomCode = code; isHost = false;
  var rc = g('room-code-display'), wt = g('wait-title'), bgv = g('btn-go-vote');
  if (rc)  rc.textContent = roomCode;
  if (wt)  wt.innerHTML = 'CONNECTING<span class="dots"><span>.</span><span>.</span><span>.</span></span>';
  if (bgv) bgv.style.display = 'none';
  show('s-wait');
  initPeer(null, roomCode);
  sfx('click');
}

function copyCode() {
  try {
    navigator.clipboard.writeText(roomCode)
      .then(function(){ toast('CODE COPIED! 📋'); })
      .catch(function(){ toast('CODE: ' + roomCode); });
  } catch(e) { toast('CODE: ' + roomCode); }
}

function goVote() {
  myVote = null; theirVote = null;
  document.querySelectorAll('.cat-card').forEach(function(c){
    c.classList.remove('voted','opponent-voted','both-voted');
  });
  var vs = g('vote-status');
  if (vs) vs.innerHTML = 'WAITING FOR VOTES<span class="dots"><span>.</span><span>.</span><span>.</span></span>';
  show('s-vote');
  sfx('click');
}

// ─────────────────────────────────────────────────────
// § NETWORK
// ─────────────────────────────────────────────────────

// onConnOpen — called once the data channel is confirmed open.
// Extracted as a named function so both the event handler AND
// the race-guard can call it without duplicating logic.
function onConnOpen(c) {
  var led = g('conn-led'), cs = g('conn-status'), bgv = g('btn-go-vote');
  if (led) led.className = 'status-led on';
  if (cs)  cs.textContent = 'CONNECTED!';
  if (bgv) bgv.style.display = 'block';    // both players see the vote button
  sfx('connect');
  // Delay 50ms so the remote peer has attached its data handler before we send
  setTimeout(function(){
    c.send({ type:'hello', name:me.name, state:me.state, city:me.city,
             avatar:me.avatar || '🧑', color:me.color || '#FF6B35' });
  }, 50);
}

function setupConn(c) {
  c.on('open', function(){
    console.log('[CC] data channel open');
    onConnOpen(c);
  });
  c.on('data',  handleData);
  c.on('error', function(e){
    console.error('[CC] conn error:', e);
    toast('CONNECTION ERROR — try refreshing');
  });
  c.on('close', function(){
    toast('OPPONENT DISCONNECTED!');
    // Auto-finish game if mid-round so player isn't stuck forever
    if (activeQuestions.length > 0 && myCount > 0) {
      var sq = g('s-questions');
      if (sq && sq.classList.contains('active')) {
        theirCount = activeQuestions.length;
        checkFinish();
      }
    }
  });
}

function initPeer(hostId, connectTo) {
  try {
    var id = hostId || Math.random().toString(36).slice(2, 10);
    // Explicit config so PeerJS works on both localhost AND Vercel HTTPS
    peer = new Peer(id, {
      debug: 0,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      }
    });

    peer.on('open', function(myId) {
      console.log('[CC] peer open:', myId);
      if (connectTo) {
        // JOINER: connect to host room code
        conn = peer.connect(connectTo, { reliable: true });
        setupConn(conn);
        // RACE GUARD: 'open' may fire before setupConn registers the listener
        if (conn.open) {
          console.log('[CC] conn already open — firing onConnOpen manually');
          onConnOpen(conn);
        }
      }
    });

    peer.on('connection', function(c) {
      // HOST: incoming joiner connection
      conn = c;
      setupConn(conn);
      // RACE GUARD: same protection on host side
      if (conn.open) {
        console.log('[CC] host conn already open — firing onConnOpen manually');
        onConnOpen(conn);
      }
    });

    peer.on('disconnected', function() {
      console.warn('[CC] peer disconnected from signalling server — reconnecting');
      try { peer.reconnect(); } catch(e) {}
    });

    peer.on('error', function(e) {
      console.error('[CC] peer error:', e.type);
      // Room code collision — silently regenerate and retry
      if (e.type === 'unavailable-id') {
        try { peer.destroy(); } catch(err) {}
        roomCode = randCode();
        var rc = g('room-code-display'); if (rc) rc.textContent = roomCode;
        initPeer(roomCode, null);
        return;
      }
      var msg = {
        'peer-unavailable' : 'ROOM NOT FOUND — CHECK CODE',
        'network'          : 'NETWORK ERROR — CHECK CONNECTION',
        'server-error'     : 'SERVER ERROR — RETRY IN A MOMENT',
      }[e.type] || ('ERROR: ' + (e.type || '').toUpperCase());
      toast(msg);
      var cs = g('conn-status'); if (cs) cs.textContent = msg;
    });

    // 20-second soft timeout — remind user to share code
    setTimeout(function(){
      if (!conn || !conn.open) {
        var sw = g('s-wait');
        if (sw && sw.classList.contains('active')) {
          toast('STILL WAITING... share the code with your opponent');
        }
      }
    }, 20000);

  } catch(e) { console.error('initPeer:', e); }
}

// ─────────────────────────────────────────────────────
// § MESSAGING
// ─────────────────────────────────────────────────────
function handleData(data) {
  try {
    switch (data.type) {

      case 'hello':
        me.peerName  = data.name;
        me.peerState = data.state;
        me.peerCity  = data.city;
        me.peerAvatar = data.avatar || '🧑';
        me.peerColor  = data.color  || '#00E5FF';
        var pi  = g('peer-info'),         pnd = g('peer-name-display');
        var psd = g('peer-state-display'),stn = g('sp-their-name');
        var htn = g('hud-their-name');
        if (pi)  pi.style.display  = 'block';
        if (pnd) pnd.textContent   = data.name;
        if (psd) psd.textContent   = data.state + (data.city ? ', ' + data.city : '');
        if (stn) stn.textContent   = data.name;
        if (htn) htn.textContent   = data.name;
        break;

      case 'vote': {
        theirVote = data.cat;
        var tc = g('cat-' + data.cat); if (tc) tc.classList.add('opponent-voted');
        sfx('vote');
        // Only host resolves — joiner just records the vote
        if (isHost) resolveVote();
        break;
      }

      case 'start':
        // HOST already called beginQuestions in resolveVote.
        // JOINER only starts here, from the host's authoritative message.
        if (!isHost) beginQuestions(data.cat);
        break;

      case 'answer':
        theirAnswers[data.qIndex] = data.answer;
        theirCount = data.count;
        theirScore = data.score;
        updateHUD();
        break;

      case 'done':
        theirAnswers = data.answers;
        theirCount   = activeQuestions.length;
        theirScore   = data.score;
        updateHUD();
        checkFinish();
        break;

      case 'powerup':
        handleOpponentPowerup(data.pu);
        break;

      case 'chat':
        if (!VULGAR.test(data.msg)) addChatMsg(data.msg, false, me.peerName);
        break;

      case 'chat-image':
        addImageMsg(data.dataUrl, false, me.peerName);
        break;

      case 'chat-gif':
        addGifMsg(data.url, false, me.peerName);
        break;

      case 'chat-location':
        addLocationMsg(data.lat, data.lng, data.label, false, me.peerName);
        break;

      case 'chat-quit':
        addSystemMsg(me.peerName + ' HAS LEFT THE CHAT');
        // Disable their ability to receive messages
        var ci = g('chat-inp'), cs2 = g('chat-send');
        if (ci) ci.disabled = true;
        if (cs2) cs2.disabled = true;
        addSystemMsg('CONNECTION CLOSED');
        break;
    }
  } catch(e) { console.error('handleData:', e); }
}

// ─────────────────────────────────────────────────────
// § VOTING
// ─────────────────────────────────────────────────────
function castVote(cat) {
  if (myVote) return;   // already voted
  myVote = cat;
  var card = g('cat-' + cat); if (card) card.classList.add('voted');
  if (conn) conn.send({ type:'vote', cat:cat });
  sfx('vote');
  var vs = g('vote-status');
  if (vs) vs.textContent = 'VOTED: ' + cat.toUpperCase() + ' — WAITING...';
  // Only host calls resolveVote locally; joiner waits for host to broadcast 'start'
  if (isHost) resolveVote();
}

function resolveVote() {
  // HOST IS AUTHORITATIVE.
  // Called on host only — when host has both votes (its own + received from joiner).
  if (!myVote || !theirVote) return;

  // Host vote wins on tie — no packet-order ambiguity
  var winner = myVote;
  var bothAgree = (myVote === theirVote);

  var card = g('cat-' + winner); if (card) card.classList.add('both-voted');
  var vs = g('vote-status');
  if (vs) vs.textContent = bothAgree
    ? 'BOTH VOTED ' + winner.toUpperCase() + '! STARTING...'
    : 'TIE BROKEN: '  + winner.toUpperCase() + '!';

  setTimeout(function(){
    if (conn) conn.send({ type:'start', cat:winner });
    beginQuestions(winner);
  }, 1200);
}

// ─────────────────────────────────────────────────────
// § GAME
// ─────────────────────────────────────────────────────
function beginQuestions(cat) {
  try {
    activeQuestions = QUESTIONS[cat] || QUESTIONS.mixed;
    myAnswers    = [];
    theirAnswers = [];
    for (var i = 0; i < activeQuestions.length; i++) { myAnswers.push(''); theirAnswers.push(''); }
    myCount = 0; theirCount = 0; myScore = 0; theirScore = 0;
    isBonusActive = false; isFrozen = false;
    powerups = { skip:1, freeze:1, bonus:1 };
    updatePowerupUI();

    var hmn = g('hud-my-name'),  htn = g('hud-their-name');
    var smn = g('sp-my-name'),   stn = g('sp-their-name');
    var hms = g('hud-my-score'), hts = g('hud-their-score');
    if (hmn) hmn.textContent = me.name     || 'YOU';
    if (htn) htn.textContent = me.peerName || 'THEM';
    if (smn) smn.textContent = me.name     || 'YOU';
    if (stn) stn.textContent = me.peerName || 'THEM';
    if (hms) hms.textContent = '0';
    if (hts) hts.textContent = '0';

    buildProgressBar();
    show('s-questions');
    loadQuestion(0);
  } catch(e) { console.error('beginQuestions:', e); }
}

function buildProgressBar() {
  var p = g('q-progress'); if (!p) return;
  p.innerHTML = '';
  for (var i = 0; i < activeQuestions.length; i++) {
    var d = document.createElement('div');
    d.className = 'q-pip'; d.id = 'pip-' + i;
    p.appendChild(d);
  }
}

function loadQuestion(idx) {
  try {
    currentQ = idx;
    var q       = activeQuestions[idx];
    var isBonus = (idx === 4 || idx === 9);
    var meta    = CAT_META[q.cat] || CAT_META.demo;

    var qn = g('q-num'), qt = g('q-text'), qcb = g('q-cat-badge');
    var bb = g('bonus-banner'), qa = g('q-answer'), bsa = g('btn-submit-ans');

    if (qn)  qn.textContent = 'Q ' + (idx + 1) + '/' + activeQuestions.length;
    if (qt)  qt.textContent = q.text;
    if (qcb) qcb.innerHTML  = '<span style="font-family:var(--font);font-size:0.48rem;'
                            + 'color:' + meta.color + ';border:1px solid ' + meta.color
                            + ';padding:2px 8px;display:inline-block">' + meta.label + '</span>';

    if (isBonus) {
      if (bb) bb.style.display = 'block';
      isBonusActive = true;
      sfx('bonus');
    } else {
      // Hide banner unless a powerup activated it this question
      if (!isBonusActive && bb) bb.style.display = 'none';
    }

    if (qa)  { qa.value = ''; qa.disabled = false; try { qa.focus(); } catch(e) {} }
    if (bsa) { bsa.disabled = false; bsa.textContent = 'SUBMIT ⚡'; }

    var pips = document.querySelectorAll('.q-pip');
    for (var i = 0; i < pips.length; i++) {
      pips[i].className = 'q-pip' + (i < idx ? ' done' : i === idx ? ' current' : '');
    }
    startTimer(isBonus ? 20 : 30);
  } catch(e) { console.error('loadQuestion:', e); }
}

function startTimer(secs) {
  secs = secs || 30;
  clearInterval(timerInterval);
  timeLeft = secs;
  var el = g('q-timer');
  if (el) { el.textContent = timeLeft; el.className = 'timer-display'; }

  timerInterval = setInterval(function(){
    // Timer ALWAYS counts down — freeze disables input but not the clock
    timeLeft--;
    if (el) {
      el.textContent = timeLeft;
      if (isFrozen) {
        el.className = 'timer-display';       // no urgent flash while frozen
      } else if (timeLeft <= 5) {
        el.className = 'timer-display urgent';
        sfx('urgent');
      } else if (timeLeft % 10 === 0) {
        sfx('tick');
      }
    }
    if (timeLeft <= 0) { clearInterval(timerInterval); autoSubmit(); }
  }, 1000);
}

function submitAnswer() {
  clearInterval(timerInterval);
  sfx('submit');
  var qa = g('q-answer');
  saveAnswer((qa ? qa.value.trim() : '') || '(skipped)');
}

function autoSubmit() {
  var qa = g('q-answer');
  saveAnswer((qa ? qa.value.trim() : '') || '(skipped)');
}

function saveAnswer(ans) {
  try {
    var qa  = g('q-answer'), bsa = g('btn-submit-ans');
    if (qa)  qa.disabled = true;
    if (bsa) { bsa.disabled = true; bsa.textContent = '✓ SAVED'; }

    var pts = isBonusActive ? 2 : 1;
    myAnswers[currentQ] = ans;
    myCount  = currentQ + 1;
    myScore += pts;
    isBonusActive = false;

    if (conn) conn.send({ type:'answer', qIndex:currentQ, answer:ans, count:myCount, score:myScore });
    updateHUD();

    if (currentQ + 1 < activeQuestions.length) {
      setTimeout(function(){ loadQuestion(currentQ + 1); }, 600);
    } else {
      if (conn) conn.send({ type:'done', answers:myAnswers, score:myScore });
      if (bsa) bsa.textContent = '⏳ WAITING...';
      checkFinish();
    }
  } catch(e) { console.error('saveAnswer:', e); }
}

function updateHUD() {
  try {
    var total = activeQuestions.length;
    var hms = g('hud-my-score'), hts = g('hud-their-score');
    if (hms) { hms.textContent = myScore;    hms.className = 'score-pval' + (myScore > theirScore ? ' leading' : ''); }
    if (hts) { hts.textContent = theirScore; hts.className = 'score-pval' + (theirScore > myScore  ? ' leading' : ''); }

    var myPct = Math.round(myCount    / total * 100);
    var thPct = Math.round(theirCount / total * 100);

    var hpMe = g('hp-me'),    hpTh  = g('hp-them');
    var sy   = g('speed-you'), st   = g('speed-them');
    var syn  = g('speed-you-n'), stn = g('speed-them-n');

    if (hpMe) { hpMe.style.width = myPct+'%'; hpMe.className = 'hp-bar' + (myPct>60?'':myPct>30?' med':' low'); }
    if (hpTh) { hpTh.style.width = thPct+'%'; hpTh.className = 'hp-bar' + (thPct>60?'':thPct>30?' med':' low'); }
    if (sy)   sy.style.width   = myPct + '%';
    if (st)   st.style.width   = thPct + '%';
    if (syn)  syn.textContent  = myCount;
    if (stn)  stn.textContent  = theirCount;
  } catch(e) {}
}

function checkFinish() {
  if (myCount >= activeQuestions.length && theirCount >= activeQuestions.length) {
    showResult();
  }
}

// ─────────────────────────────────────────────────────
// § POWERUPS
// ─────────────────────────────────────────────────────
function usePowerup(type) {
  try {
    if (powerups[type] <= 0) { toast('NO ' + type.toUpperCase() + ' LEFT!'); return; }
    powerups[type]--;
    updatePowerupUI();
    sfx('powerup');

    if (type === 'skip') {
      toast('⏭ QUESTION SKIPPED!');
      clearInterval(timerInterval);
      saveAnswer('(skipped)');

    } else if (type === 'freeze') {
      toast('❄ OPPONENT FROZEN FOR 5s!');
      if (conn) conn.send({ type:'powerup', pu:'freeze' });
      sfx('freeze');

    } else if (type === 'bonus') {
      isBonusActive = true;
      var bb = g('bonus-banner'); if (bb) bb.style.display = 'block';
      toast('⭐ NEXT ANSWER = 2X POINTS!');
      sfx('bonus');
    }
  } catch(e) {}
}

function handleOpponentPowerup(pu) {
  if (pu !== 'freeze') return;
  try {
    isFrozen = true;
    var fo = g('freeze-overlay'), qa = g('q-answer');
    if (fo) fo.classList.add('active');
    if (qa) qa.disabled = true;

    var ft = document.createElement('div');
    ft.className = 'freeze-text'; ft.textContent = '❄️ FROZEN! ❄️';
    document.body.appendChild(ft);
    sfx('freeze');
    toast('YOU HAVE BEEN FROZEN FOR 5s!');

    setTimeout(function(){
      isFrozen = false;
      if (fo) fo.classList.remove('active');
      if (qa) { qa.disabled = false; try { qa.focus(); } catch(e) {} }
      if (ft.parentNode) ft.parentNode.removeChild(ft);
      toast('UNFROZEN!');
    }, 5000);
  } catch(e) {}
}

function updatePowerupUI() {
  ['skip','freeze','bonus'].forEach(function(type){
    var btn = g('pu-' + type), cnt = g('pu-' + type + '-count');
    if (!btn || !cnt) return;
    cnt.textContent = powerups[type];
    btn.disabled    = powerups[type] <= 0;
  });
}

// ─────────────────────────────────────────────────────
// § RESULT
// ─────────────────────────────────────────────────────
function showResult() {
  try {
    clearInterval(timerInterval);
    var iWon = myScore > theirScore || (myScore === theirScore && isHost);

    var rh  = g('result-hero'),      rt  = g('result-title');
    var rs  = g('result-sub'),       rb  = g('result-box');
    var fms = g('final-my-score'),   fts = g('final-their-score');
    var ftl = g('final-their-label');

    if (rh)  rh.textContent  = iWon ? '🏆' : '💀';
    if (rt)  rt.textContent  = iWon ? 'VICTORY!' : 'GAME OVER';
    if (rs)  rs.textContent  = iWon
      ? 'You scored higher! Chat unlocked 🗝️'
      : (me.peerName || 'OPPONENT') + ' wins this round!';
    if (rb)  rb.className    = 'pbox ' + (iWon ? 'pbox-gold' : 'pbox-pink');
    if (fms) fms.textContent = myScore;
    if (fts) fts.textContent = theirScore;
    if (ftl) ftl.textContent = (me.peerName || 'THEIR') + ' SCORE';

    if (iWon) { launchConfetti(); sfx('win'); }
    else      { sfx('lose'); }

    function fillAnswerTab(arr, tabId) {
      var el = g(tabId); if (!el) return; el.innerHTML = '';
      for (var i = 0; i < activeQuestions.length; i++) {
        var q    = activeQuestions[i];
        var meta = CAT_META[q.cat] || CAT_META.demo;
        var d    = document.createElement('div');
        d.className = 'ans-item'; d.style.borderLeftColor = meta.color;
        d.innerHTML = '<div class="ans-q">' + esc(q.text) + '</div>'
                    + '<div class="ans-a">' + esc(arr[i] || '(no answer)') + '</div>';
        el.appendChild(d);
      }
    }
    fillAnswerTab(myAnswers,    'tab-me');
    fillAnswerTab(theirAnswers, 'tab-them');
    show('s-result');
  } catch(e) { console.error('showResult:', e); }
}

function switchTab(which, el) {
  try {
    document.querySelectorAll('.ans-tab').forEach(function(t){ t.classList.remove('active'); });
    el.classList.add('active');
    var tm = g('tab-me'), tt = g('tab-them');
    if (tm) tm.style.display = which === 'me'   ? 'block' : 'none';
    if (tt) tt.style.display = which === 'them' ? 'block' : 'none';
  } catch(e) {}
}

function rematch() {
  // Full state reset before next round
  myScore = 0; theirScore = 0;
  myCount = 0; theirCount = 0;
  myAnswers = []; theirAnswers = [];
  myVote = null; theirVote = null;
  isBonusActive = false; isFrozen = false;
  powerups = { skip:1, freeze:1, bonus:1 };
  clearInterval(timerInterval);
  var hms = g('hud-my-score'), hts = g('hud-their-score');
  if (hms) hms.textContent = '0';
  if (hts) hts.textContent = '0';
  sfx('click');
  goVote();
}

// ─────────────────────────────────────────────────────
// § CHAT
// ─────────────────────────────────────────────────────

// ── Core chat setup ───────────────────────────────────
function goChat() {
  try {
    var pn  = me.peerName || 'PLAYER 2';
    var ca  = g('chat-avatar'), cn = g('chat-name');
    var cr  = g('chat-region'), box = g('chat-messages');
    if (ca) { ca.textContent = me.peerAvatar || '🧑'; ca.style.filter = 'drop-shadow(0 0 8px ' + (me.peerColor || '#00E5FF') + ')'; }
    if (cn) cn.textContent = pn;
    if (cr) cr.textContent = (me.peerCity || '') + (me.peerState ? ', ' + me.peerState : '');
    if (box) box.innerHTML = '';
    addSystemMsg('CHAT UNLOCKED — SAY NAMASTE!');
    addChatMsg('Namaste! 🙏 GG!', false, pn);
    show('s-chat');
    sfx('connect');
  } catch(e) {}
}

function quickEmoji(e) {
  var inp = g('chat-inp');
  if (inp) { inp.value += e; try { inp.focus(); } catch(err) {} }
}

function sendChat() {
  try {
    var inp = g('chat-inp');
    var msg = inp ? inp.value.trim() : '';
    if (!msg) return;
    if (VULGAR.test(msg)) { toast('MESSAGE BLOCKED!'); if (inp) inp.value = ''; return; }
    if (msg.length > 300) { toast('MESSAGE TOO LONG!'); return; }
    addChatMsg(msg, true, me.name);
    if (conn) conn.send({ type:'chat', msg:msg });
    if (inp) inp.value = '';
    sfx('click');
  } catch(e) {}
}

// ── Quit chat ────────────────────────────────────────
function askQuit() {
  var o = g('quit-overlay');
  if (o) o.classList.add('open');
}

function cancelQuit() {
  var o = g('quit-overlay');
  if (o) o.classList.remove('open');
}

function confirmQuit() {
  // Notify opponent then go back to result screen
  try {
    if (conn) conn.send({ type:'chat-quit' });
  } catch(e) {}
  var o = g('quit-overlay');
  if (o) o.classList.remove('open');
  addSystemMsg('YOU LEFT THE CHAT');
  // Go back to result screen after short delay
  setTimeout(function(){ show('s-result'); }, 800);
  sfx('click');
}

// ── GIF search (Giphy public beta — free, no key needed) ──
function toggleGifPanel() {
  var panel = g('gif-panel');
  if (!panel) return;
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) {
    var inp = g('gif-search-inp');
    if (inp) setTimeout(function(){ inp.focus(); }, 50);
    // Load trending GIFs on first open
    var grid = g('gif-grid');
    if (grid && grid.children.length <= 1) searchGifs('trending');
  }
}

function searchGifs(query) {
  var inp = g('gif-search-inp');
  var q = query || (inp ? inp.value.trim() : '') || 'india';
  var grid = g('gif-grid');
  if (!grid) return;
  grid.innerHTML = '<p style="font-size:.85rem;color:var(--muted);grid-column:1/-1;text-align:center;padding:.5rem">SEARCHING...</p>';

  // Giphy public beta endpoint — free, no API key required for low volume
  var url = 'https://api.giphy.com/v1/gifs/' + (query === 'trending' ? 'trending' : 'search')
    + '?api_key=dc6zaTOxFJmzC&limit=9&rating=g'
    + (query !== 'trending' ? '&q=' + encodeURIComponent(q) : '');

  fetch(url)
    .then(function(r){ return r.json(); })
    .then(function(data) {
      grid.innerHTML = '';
      if (!data.data || data.data.length === 0) {
        grid.innerHTML = '<p style="font-size:.85rem;color:var(--muted);grid-column:1/-1;text-align:center;padding:.5rem">NO RESULTS</p>';
        return;
      }
      data.data.forEach(function(gif) {
        var img = document.createElement('img');
        img.className = 'gif-item';
        img.src = gif.images.fixed_height_small.url;
        img.alt = gif.title;
        // Store the original URL for sending (smaller preview)
        var sendUrl = gif.images.fixed_height.url;
        img.onclick = function() {
          addGifMsg(sendUrl, true, me.name);
          if (conn) conn.send({ type:'chat-gif', url: sendUrl });
          // Close panel
          var panel = g('gif-panel');
          if (panel) panel.classList.remove('open');
          sfx('click');
        };
        grid.appendChild(img);
      });
    })
    .catch(function() {
      grid.innerHTML = '<p style="font-size:.85rem;color:var(--red);grid-column:1/-1;text-align:center;padding:.5rem">GIF LOAD FAILED — CHECK CONNECTION</p>';
    });
}

// ── Image sharing (base64 over P2P) ──────────────────
function triggerImagePick() {
  var inp = g('img-file-inp');
  if (inp) inp.click();
}

function sendImage(event) {
  try {
    var file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast('ONLY IMAGE FILES!'); return; }
    // Limit to 800KB to stay within P2P data channel limits
    if (file.size > 800 * 1024) { toast('IMAGE TOO LARGE! MAX 800KB'); return; }

    var reader = new FileReader();
    reader.onload = function(e) {
      var dataUrl = e.target.result;
      addImageMsg(dataUrl, true, me.name);
      if (conn) conn.send({ type:'chat-image', dataUrl: dataUrl });
      sfx('click');
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be sent again
    event.target.value = '';
  } catch(e) { toast('IMAGE SEND FAILED'); }
}

// ── Location sharing ──────────────────────────────────
function sendLocation() {
  if (!navigator.geolocation) { toast('LOCATION NOT SUPPORTED'); return; }
  toast('GETTING YOUR LOCATION...');
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      var lat = pos.coords.latitude.toFixed(5);
      var lng = pos.coords.longitude.toFixed(5);
      var label = me.city ? me.city + ', ' + me.state : 'My Location';
      addLocationMsg(lat, lng, label, true, me.name);
      if (conn) conn.send({ type:'chat-location', lat:lat, lng:lng, label:label });
      sfx('click');
    },
    function(err) {
      var msg = err.code === 1 ? 'LOCATION PERMISSION DENIED'
              : err.code === 2 ? 'LOCATION UNAVAILABLE'
              : 'LOCATION TIMEOUT';
      toast(msg);
    },
    { timeout: 8000 }
  );
}

// ── Message renderers ────────────────────────────────
function addChatMsg(msg, isMe, name) {
  try {
    var box = g('chat-messages'); if (!box) return;
    var d = document.createElement('div');
    d.className = 'msg ' + (isMe ? 'me' : 'them');
    d.innerHTML = '<div class="mname">' + esc(isMe ? 'YOU' : (name || '').toUpperCase()) + '</div>' + esc(msg);
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
  } catch(e) {}
}

function addImageMsg(dataUrl, isMe, name) {
  try {
    var box = g('chat-messages'); if (!box) return;
    var d = document.createElement('div');
    d.className = 'msg ' + (isMe ? 'me' : 'them');
    var img = document.createElement('img');
    img.className = 'msg-img';
    img.src = dataUrl;
    img.alt = 'shared image';
    img.onclick = function(){ openLightbox(dataUrl); };
    d.innerHTML = '<div class="mname">' + esc(isMe ? 'YOU' : (name || '').toUpperCase()) + '</div>';
    d.appendChild(img);
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
  } catch(e) {}
}

function addGifMsg(url, isMe, name) {
  try {
    var box = g('chat-messages'); if (!box) return;
    var d = document.createElement('div');
    d.className = 'msg ' + (isMe ? 'me' : 'them');
    var img = document.createElement('img');
    img.className = 'msg-img';
    img.src = url;
    img.alt = 'GIF';
    img.onclick = function(){ openLightbox(url); };
    d.innerHTML = '<div class="mname">' + esc(isMe ? 'YOU' : (name || '').toUpperCase()) + '</div>';
    d.appendChild(img);
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
  } catch(e) {}
}

function addLocationMsg(lat, lng, label, isMe, name) {
  try {
    var box = g('chat-messages'); if (!box) return;
    var d = document.createElement('div');
    d.className = 'msg ' + (isMe ? 'me' : 'them');
    var mapsUrl = 'https://www.google.com/maps?q=' + lat + ',' + lng;
    d.innerHTML = '<div class="mname">' + esc(isMe ? 'YOU' : (name || '').toUpperCase()) + '</div>'
      + '<a class="msg-location" href="' + mapsUrl + '" target="_blank" rel="noopener">'
      + '📍 ' + esc(label) + '<span style="font-size:.75rem;opacity:.7;margin-left:4px">↗ Open map</span>'
      + '</a>';
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
  } catch(e) {}
}

function addSystemMsg(msg) {
  try {
    var box = g('chat-messages'); if (!box) return;
    var d = document.createElement('div');
    d.className = 'msg system'; d.textContent = '» ' + msg + ' «';
    box.appendChild(d); box.scrollTop = box.scrollHeight;
  } catch(e) {}
}

// ── Lightbox ──────────────────────────────────────────
function openLightbox(src) {
  var lb = g('lightbox'), img = g('lightbox-img');
  if (lb && img) { img.src = src; lb.classList.add('open'); }
}

function closeLightbox() {
  var lb = g('lightbox');
  if (lb) lb.classList.remove('open');
}

// § EXPORTS moved to top of file — see line 1
