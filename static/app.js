const talkBtn=document.getElementById("talkBtn");
const stopBtn=document.getElementById("stopBtn");
const sendBtn=document.getElementById("sendBtn");
const question=document.getElementById("question");
const responseEl=document.getElementById("response");
const statusEl=document.getElementById("status");
const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
let recognition=null;

function status(t){statusEl.textContent=t}
function speak(t){
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(t);
  u.onend=()=>status("Ready");
  speechSynthesis.speak(u);
}
async function askAI(text){
  if(!text.trim())return;
  status("Thinking...");
  const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:text})});
  const d=await r.json();
  if(!r.ok){responseEl.textContent=d.error||"Request failed";status("Error");return}
  responseEl.textContent=d.reply;
  status("Speaking response");
  speak(d.reply);
}
if(SpeechRecognition){
  recognition=new SpeechRecognition();
  recognition.lang="en-US";
  recognition.onstart=()=>status("Listening...");
  recognition.onresult=e=>{
    const text=e.results[0][0].transcript;
    question.value=text;
    askAI(text);
  };
  recognition.onerror=e=>status("Voice error: "+e.error);
  talkBtn.onclick=()=>recognition.start();
}else{
  talkBtn.disabled=true;
  talkBtn.textContent="Voice input unsupported";
}
stopBtn.onclick=()=>{speechSynthesis.cancel(); if(recognition){try{recognition.stop()}catch(e){}} status("Ready")};
sendBtn.onclick=()=>askAI(question.value);
