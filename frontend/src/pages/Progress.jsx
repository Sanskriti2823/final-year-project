import React, { useEffect, useState } from "react";
import api from "../services/api";

function Stat({label,value}){return <article className="stat-card"><p>{label}</p><strong>{value}</strong></article>;}

export default function Progress() {
  const [data,setData]=useState(null);const [error,setError]=useState("");
  async function load(){try{const r=await api.get("/progress");setData(r.data);setError("");}catch{setError("Unable to load learning progress.");}}
  useEffect(()=>{load();},[]);
  async function updateProgress(enrollment,value){try{await api.patch(`/progress/${enrollment._id}`,{progress:Number(value)});await load();}catch{setError("Unable to update progress.");}}
  return <main className="page"><div className="page-title"><h1>My learning progress</h1><p>Track courses and quiz performance.</p></div>{error&&<p className="error">{error}</p>}{!data&&!error&&<p>Loading progress...</p>}
    {data&&<><section className="stats-grid"><Stat label="Enrolled courses" value={data.summary.totalCourses}/><Stat label="Completed courses" value={data.summary.completedCourses}/><Stat label="Average progress" value={`${data.summary.averageProgress}%`}/></section>
      <section className="section-heading"><div><h2>Enrolled courses</h2></div></section>
      {data.enrollments.map(e=><article className="progress-card" key={e._id}><h3>{e.courseId.title}</h3><p>{e.courseId.category}</p><div className="progress-track"><div style={{width:`${e.progress}%`}}/></div><p>{e.progress}% complete</p><label>Update progress <select value={e.progress} onChange={ev=>updateProgress(e,ev.target.value)}>{[0,25,50,75,100].map(v=><option key={v} value={v}>{v===0?"Not started":v===100?"Completed":`${v}%`}</option>)}</select></label></article>)}
      <section className="section-heading"><div><h2>Quiz performance</h2><p>Overall accuracy: {data.summary.quizAccuracy}%</p></div></section>
      {data.quizResults.map(r=><article className="lesson" key={r._id}><strong>{r.topic}</strong><p>{r.score}/{r.total} correct</p><p>{new Date(r.attemptedAt).toLocaleDateString()}</p></article>)}
    </>}</main>;
}
