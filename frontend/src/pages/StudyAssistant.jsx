import React, { useState } from "react";
import api from "../services/api";

export default function StudyAssistant() {
  const [message,setMessage]=useState("");const [courseTitle,setCourseTitle]=useState("");const [busy,setBusy]=useState(false);
  const [messages,setMessages]=useState([{role:"assistant",text:"Hi! Ask me to explain a concept, give an example, or help you revise."}]);
  async function send(e){e.preventDefault();const question=message.trim();if(!question||busy)return;setMessages(prev=>[...prev,{role:"user",text:question}]);setMessage("");setBusy(true);
    try{const {data}=await api.post("/chat",{message:question,courseTitle});setMessages(prev=>[...prev,{role:"assistant",text:data.answer}]);}
    catch(err){setMessages(prev=>[...prev,{role:"assistant",text:err.response?.data?.message||"AI assistant se connect nahi ho paaya."}]);}
    finally{setBusy(false);}}
  return <main className="page"><div className="page-title"><h1>AI study assistant</h1><p>Ask questions and get step-by-step explanations.</p></div>
    <section className="chat-panel"><label htmlFor="course-context">Learning context (optional)</label><input id="course-context" value={courseTitle} onChange={e=>setCourseTitle(e.target.value)} placeholder="e.g. Machine Learning Basics"/>
      <div className="chat-messages" aria-live="polite">{messages.map((item,index)=><article className={`chat-message ${item.role}`} key={index}><strong>{item.role==="user"?"You":"LearnSmart AI"}</strong><p>{item.text}</p></article>)}{busy&&<p className="muted">Preparing your answer...</p>}</div>
      <form className="chat-input" onSubmit={send}><input value={message} onChange={e=>setMessage(e.target.value)} placeholder="Ask a learning question..." maxLength={4000}/><button className="button button-primary" disabled={busy||!message.trim()}>Send</button></form>
    </section></main>;
}
