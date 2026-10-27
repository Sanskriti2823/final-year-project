import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Quiz() {
  const [questions,setQuestions]=useState([]);const [courses,setCourses]=useState([]);const [courseId,setCourseId]=useState("");const [answers,setAnswers]=useState({});const [result,setResult]=useState(null);const [error,setError]=useState("");
  useEffect(()=>{Promise.all([api.get("/quizzes"),api.get("/courses")]).then(([q,c])=>{setQuestions(q.data.questions);setCourses(c.data.courses);setCourseId(c.data.courses[0]?._id||"");}).catch(()=>setError("Quiz load nahi hua."));},[]);
  async function submit(e){e.preventDefault();setError("");try{const {data}=await api.post("/quizzes/submit",{courseId,answers});setResult(data);}catch(err){setError(err.response?.data?.message||"Quiz submit nahi hua.");}}
  return <main className="page"><div className="page-title"><h1>Knowledge check</h1><p>Test your understanding and discover topics to revise.</p></div>{error&&<p className="error">{error}</p>}
    {!result?<form className="quiz-form" onSubmit={submit}><label htmlFor="quiz-course">Save result under course</label><select id="quiz-course" value={courseId} onChange={e=>setCourseId(e.target.value)} required>{courses.map(c=><option key={c._id} value={c._id}>{c.title}</option>)}</select>
      {questions.map((q,i)=><section className="quiz-question" key={q.id}><p className="muted">Question {i+1} · {q.topic}</p><h3>{q.question}</h3>{q.options.map((option,index)=><label className="quiz-option" key={option}><input type="radio" name={q.id} checked={answers[q.id]===index} onChange={()=>setAnswers(prev=>({...prev,[q.id]:index}))}/>{option}</label>)}</section>)}
      <button className="button button-primary" disabled={!courseId}>Submit quiz</button></form>
    :<section className="auth-card quiz-result"><div className="icon-tile">✓</div><h2>Your score: {result.score}/{result.total}</h2><p>{result.percentage}% correct</p><p>{result.feedback}</p>{result.results.map((r,i)=><article className="lesson" key={i}><strong>{r.correct?"Correct":"Review"}: {r.question}</strong><p>Your answer: {r.selectedAnswer}</p><p>Correct answer: {r.correctAnswer}</p><p>{r.explanation}</p></article>)}<button className="button button-primary" onClick={()=>{setAnswers({});setResult(null);}}>Try again</button></section>}
  </main>;
}
