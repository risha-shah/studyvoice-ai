const talkBtn=document.getElementById("talkBtn");
const stopBtn=document.getElementById("stopBtn");
const sendBtn=document.getElementById("sendBtn");
const demoBtn=document.getElementById("demoBtn");
const question=document.getElementById("question");
const responseEl=document.getElementById("response");
const responseTag=document.getElementById("responseTag");
const statusEl=document.getElementById("status");
const orb=document.getElementById("orb");
const wave=document.getElementById("wave");
const voiceHint=document.getElementById("voiceHint");
const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
let recognition=null;
let demoRunning=false;

function setStatus(text,state="ready"){
  statusEl.innerHTML=`<span></span> ${text}`;
  orb.classList.toggle("listening",state==="listening");
  wave.classList.toggle("active",state==="listening"||state==="speaking");
}

function typeInto(el,text,speed=24){
  return new Promise(resolve=>{
    el.value="";
    let i=0;
    const timer=setInterval(()=>{
      el.value+=text[i]||"";
      i++;
      if(i>=text.length){clearInterval(timer);resolve();}
    },speed);
  });
}

function typeText(el,text,speed=15){
  return new Promise(resolve=>{
    el.textContent="";
    let i=0;
    const timer=setInterval(()=>{
      el.textContent+=text[i]||"";
      i++;
      if(i>=text.length){clearInterval(timer);resolve();}
    },speed);
  });
}

function speak(text){
  if(!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.rate=1.03;
  u.pitch=1;
  u.onstart=()=>setStatus("Speaking","speaking");
  u.onend=()=>setStatus("Ready");
  speechSynthesis.speak(u);
}

async function askAI(text,{speakResult=true}={}){
  if(!text.trim()) return;
  setStatus("Thinking","thinking");
  responseTag.textContent="processing";
  responseEl.textContent="Generating a concise explanation…";
  try{
    const r=await fetch("/api/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({message:text})
    });
    const d=await r.json();
    if(!r.ok) throw new Error(d.error||"Request failed");
    responseTag.textContent="ready";
    responseEl.textContent=d.reply;
    if(speakResult) speak(d.reply); else setStatus("Ready");
  }catch(err){
    responseTag.textContent="error";
    responseEl.textContent=`I couldn't reach the model service: ${err.message}`;
    setStatus("Error");
  }
}

async function runDemo(){
  if(demoRunning) return;
  demoRunning=true;
  demoBtn.disabled=true;
  demoBtn.textContent="Demo running…";
  document.getElementById("assistant").scrollIntoView({behavior:"smooth",block:"center"});
  await new Promise(r=>setTimeout(r,650));

  const prompt="Explain generating functions like I'm learning them for the first time";
  setStatus("Listening","listening");
  voiceHint.textContent="Listening to your question…";
  await new Promise(r=>setTimeout(r,900));
  await typeInto(question,prompt,18);
  await new Promise(r=>setTimeout(r,300));
  setStatus("Thinking","thinking");
  voiceHint.textContent="Question captured";
  responseTag.textContent="processing";
  responseEl.textContent="Generating a concise explanation…";
  await new Promise(r=>setTimeout(r,900));

  const demoReply="A generating function packages a sequence into a power series. Think of the exponent as the label for a case, and the coefficient as how many ways that case can happen. It turns counting problems into algebra you can manipulate.";
  responseTag.textContent="ready";
  await typeText(responseEl,demoReply,12);
  setStatus("Speaking","speaking");
  voiceHint.textContent="Reading the explanation aloud";
  speak(demoReply);

  demoBtn.disabled=false;
  demoBtn.textContent="↻ Replay demo";
  demoRunning=false;
}

if(SpeechRecognition){
  recognition=new SpeechRecognition();
  recognition.lang="en-US";
  recognition.interimResults=false;
  recognition.continuous=false;
  recognition.onstart=()=>{setStatus("Listening","listening");voiceHint.textContent="Listening to your question…";};
  recognition.onresult=e=>{
    const text=e.results[0][0].transcript;
    question.value=text;
    voiceHint.textContent="Question captured";
    askAI(text);
  };
  recognition.onerror=e=>{setStatus("Voice unavailable");voiceHint.textContent=`Voice error: ${e.error}`;};
  recognition.onend=()=>{if(statusEl.textContent.includes("Listening"))setStatus("Ready");};
  talkBtn.onclick=()=>recognition.start();
}else{
  talkBtn.disabled=true;
  talkBtn.textContent="Voice input unavailable";
  voiceHint.textContent="Type a question below — voice input is not supported in this browser";
}

stopBtn.onclick=()=>{
  if("speechSynthesis" in window) speechSynthesis.cancel();
  if(recognition){try{recognition.stop()}catch(e){}}
  setStatus("Ready");
  voiceHint.textContent="Tap the microphone and ask a question";
};

sendBtn.onclick=()=>askAI(question.value);
question.addEventListener("keydown",e=>{
  if((e.metaKey||e.ctrlKey)&&e.key==="Enter") askAI(question.value);
});

demoBtn.onclick=runDemo;
document.querySelectorAll(".prompt-chip").forEach(btn=>{
  btn.onclick=()=>{
    question.value=btn.dataset.prompt;
    askAI(question.value);
  };
});
