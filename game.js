/* ═══════════════════════════════════════════════
   CROSSCONNECT — game.js (stable rewrite)
   Version: clean architecture build
   Compatible with your current index.html
═══════════════════════════════════════════════ */

(function(){

/* ─────────────────────────────────────────────
   GLOBAL EXPORTS
───────────────────────────────────────────── */

const exports = [
"goAvatar","goSetup","hostGame","joinGame","copyCode",
"goVote","castVote","submitAnswer","usePowerup",
"switchTab","rematch","goChat","quickEmoji","sendChat",
"askQuit","cancelQuit","confirmQuit",
"toggleGifPanel","searchGifs",
"triggerImagePick","sendImage","sendLocation","closeLightbox"
];

exports.forEach(fn=>{
  window[fn]=function(){
    return Game[fn].apply(Game,arguments)
  }
});

/* ─────────────────────────────────────────────
   CORE GAME OBJECT
───────────────────────────────────────────── */

const Game = {

peer:null,
conn:null,

roomCode:"",
isHost:false,

timer:null,
timeLeft:30,

myVote:null,
theirVote:null,

myScore:0,
theirScore:0,

myCount:0,
theirCount:0,

myAnswers:[],
theirAnswers:[],

questions:[],
currentQ:0,

me:{},

/* ─────────────────────────────────────────────
   UTILS
───────────────────────────────────────────── */

g(id){
  return document.getElementById(id)
},

show(id){

  document.querySelectorAll(".screen")
  .forEach(s=>s.classList.remove("active"))

  const el=this.g(id)
  if(el) el.classList.add("active")
},

toast(msg){

  const old=document.querySelector(".toast")
  if(old) old.remove()

  const t=document.createElement("div")
  t.className="toast"
  t.textContent=msg

  document.body.appendChild(t)

  setTimeout(()=>t.remove(),2500)
},

randCode(){
  return Math.random().toString(36).substring(2,8).toUpperCase()
},

esc(str){
  const d=document.createElement("div")
  d.textContent=str
  return d.innerHTML
},

/* ─────────────────────────────────────────────
   START FLOW
───────────────────────────────────────────── */

goAvatar(){

  const name=this.g("inp-name").value.trim().toUpperCase()
  const state=this.g("inp-state").value
  const city=this.g("inp-city").value.trim()

  if(!name||!state||!city){
    this.toast("ENTER NAME, STATE AND CITY")
    return
  }

  this.me={name,state,city}

  this.buildAvatarUI()

  this.show("s-avatar")
},

goSetup(){

  this.me.avatar=this.selectedAvatar||"🧑"
  this.me.color=this.selectedColor||"#FF6B35"

  this.g("lobby-avatar").textContent=this.me.avatar
  this.g("lobby-name").textContent=this.me.name
  this.g("lobby-region").textContent=this.me.city+", "+this.me.state

  this.show("s-setup")
},

/* ─────────────────────────────────────────────
   AVATAR
───────────────────────────────────────────── */

selectedAvatar:"🧑",
selectedColor:"#FF6B35",

buildAvatarUI(){

const avatars=["🧑","🧕","🧔","👩","🦸","🧙","🥷","🤴","👸"]
const colors=["#FF6B35","#FFD700","#00FF88","#00E5FF","#BB44FF","#FF3399"]

const grid=this.g("avatar-grid")
const row=this.g("color-row")

grid.innerHTML=""
row.innerHTML=""

avatars.forEach(a=>{
  const d=document.createElement("div")
  d.className="avatar-opt"
  d.innerHTML=`<span class="av-preview">${a}</span>`
  d.onclick=()=>{
    this.selectedAvatar=a
    document.querySelectorAll(".avatar-opt").forEach(x=>x.classList.remove("sel"))
    d.classList.add("sel")
    this.refreshAvatar()
  }
  grid.appendChild(d)
})

colors.forEach(c=>{
  const s=document.createElement("div")
  s.style.cssText="width:28px;height:28px;background:"+c+";cursor:pointer"
  s.onclick=()=>{
    this.selectedColor=c
    this.refreshAvatar()
  }
  row.appendChild(s)
})

this.refreshAvatar()

},

refreshAvatar(){

this.g("avatar-preview").textContent=this.selectedAvatar

},

/* ─────────────────────────────────────────────
   NETWORK
───────────────────────────────────────────── */

hostGame(){

if(this.peer){
try{this.peer.destroy()}catch(e){}
}

this.roomCode=this.randCode()
this.isHost=true

this.g("room-code-display").textContent=this.roomCode

this.show("s-wait")

this.initPeer(this.roomCode)

},

joinGame(){

const code=this.g("inp-join-code").value.trim().toUpperCase()

if(code.length<4){
this.toast("INVALID CODE")
return
}

this.roomCode=code
this.isHost=false

this.show("s-wait")

this.initPeer(null,code)

},

initPeer(hostId,connectTo){

this.peer=new Peer(hostId||undefined,{
config:{
iceServers:[
{urls:"stun:stun.l.google.com:19302"},
{urls:"stun:stun1.l.google.com:19302"},
{
urls:"turn:openrelay.metered.ca:80",
username:"openrelayproject",
credential:"openrelayproject"
}
]
}
})

this.peer.on("connection",(c)=>{
this.conn=c
this.setupConn()
})

this.peer.on("open",id=>{
if(connectTo){
this.conn=this.peer.connect(connectTo)
this.setupConn()
}
})

},

setupConn(){

this.conn.on("open",()=>{

this.g("conn-status").textContent="CONNECTED"

this.g("btn-go-vote").style.display="block"

this.conn.send({
type:"hello",
name:this.me.name,
state:this.me.state,
city:this.me.city
})

})

this.conn.on("data",d=>this.handleData(d))

},

handleData(d){

switch(d.type){

case "hello":

this.peerName=d.name

this.g("peer-name-display").textContent=d.name
this.g("peer-state-display").textContent=d.state

break

case "vote":

this.theirVote=d.cat

if(this.isHost) this.resolveVote()

break

case "start":

this.startGame(d.cat)

break

}

},

/* ─────────────────────────────────────────────
   VOTING
───────────────────────────────────────────── */

goVote(){

this.myVote=null
this.theirVote=null

this.show("s-vote")

},

castVote(cat){

if(this.myVote) return

this.myVote=cat

if(this.conn) this.conn.send({type:"vote",cat})

if(this.isHost) this.resolveVote()

},

resolveVote(){

if(!this.myVote||!this.theirVote) return

const winner=this.myVote

if(this.conn) this.conn.send({type:"start",cat:winner})

this.startGame(winner)

},

/* ─────────────────────────────────────────────
   QUESTIONS
───────────────────────────────────────────── */

startGame(cat){

this.questions=window.QUESTIONS?window.QUESTIONS[cat]:[]

this.currentQ=0
this.myScore=0
this.theirScore=0

this.show("s-questions")

this.loadQuestion()

},

loadQuestion(){

const q=this.questions[this.currentQ]

this.g("q-text").textContent=q.text

this.startTimer(30)

},

startTimer(sec){

clearInterval(this.timer)

this.timeLeft=sec

this.g("q-timer").textContent=sec

this.timer=setInterval(()=>{

this.timeLeft--

this.g("q-timer").textContent=this.timeLeft

if(this.timeLeft<=0){
clearInterval(this.timer)
this.submitAnswer()
}

},1000)

},

submitAnswer(){

clearInterval(this.timer)

const val=this.g("q-answer").value||"(skip)"

this.myAnswers[this.currentQ]=val
this.myCount++

if(this.conn){
this.conn.send({
type:"answer",
answer:val,
count:this.myCount
})
}

this.nextQ()

},

nextQ(){

this.currentQ++

if(this.currentQ>=this.questions.length){

this.showResult()

}else{

this.loadQuestion()

}

},

/* ─────────────────────────────────────────────
   RESULT
───────────────────────────────────────────── */

showResult(){

this.show("s-result")

this.g("final-my-score").textContent=this.myScore
this.g("final-their-score").textContent=this.theirScore

},

switchTab(which,el){

document.querySelectorAll(".ans-tab").forEach(x=>x.classList.remove("active"))

el.classList.add("active")

this.g("tab-me").style.display=which==="me"?"block":"none"
this.g("tab-them").style.display=which==="them"?"block":"none"

},

/* ─────────────────────────────────────────────
   REMATCH
───────────────────────────────────────────── */

rematch(){

if(this.peer){
try{this.peer.destroy()}catch(e){}
}

this.peer=null
this.conn=null
this.roomCode=""

this.myScore=0
this.theirScore=0
this.myAnswers=[]
this.theirAnswers=[]

this.show("s-setup")

},

/* ─────────────────────────────────────────────
   CHAT
───────────────────────────────────────────── */

goChat(){

this.show("s-chat")

},

quickEmoji(e){

const i=this.g("chat-inp")
i.value+=e

},

sendChat(){

const msg=this.g("chat-inp").value.trim()

if(!msg) return

this.addChatMsg(msg,true)

if(this.conn) this.conn.send({type:"chat",msg})

this.g("chat-inp").value=""

},

addChatMsg(msg,isMe){

const box=this.g("chat-messages")

const d=document.createElement("div")

d.className="msg "+(isMe?"me":"them")

d.innerHTML=this.esc(msg)

box.appendChild(d)

box.scrollTop=box.scrollHeight

},

/* ─────────────────────────────────────────────
   QUIT CHAT
───────────────────────────────────────────── */

askQuit(){
this.g("quit-overlay").classList.add("open")
},

cancelQuit(){
this.g("quit-overlay").classList.remove("open")
},

confirmQuit(){

if(this.conn){
try{this.conn.send({type:"chat-quit"})}catch(e){}
}

if(this.peer){
try{this.peer.destroy()}catch(e){}
}

this.peer=null
this.conn=null

this.g("quit-overlay").classList.remove("open")

this.show("s-result")

},

/* ─────────────────────────────────────────────
   MEDIA HELPERS
───────────────────────────────────────────── */

toggleGifPanel(){

const p=this.g("gif-panel")

p.classList.toggle("open")

},

searchGifs(){},

triggerImagePick(){

this.g("img-file-inp").click()

},

sendImage(){},

sendLocation(){},

closeLightbox(){

this.g("lightbox").classList.remove("open")

}

}

/* ─────────────────────────────────────────────
   CLEANUP
───────────────────────────────────────────── */

window.addEventListener("beforeunload",()=>{

try{
if(Game.peer) Game.peer.destroy()
}catch(e){}

})

})();
