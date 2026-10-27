import React, { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { BookOpen, BrainCircuit, GraduationCap, LogOut, Search, Sparkles, ChartNoAxesCombined } from "lucide-react";
import api from "./services/api";
import Quiz from "./pages/Quiz.jsx";
import StudyAssistant from "./pages/StudyAssistant.jsx";
import Progress from "./pages/Progress.jsx";

function Navbar({ user, onLogout }) {
  return <header className="navbar">
    <Link to="/" className="brand"><BrainCircuit size={27}/> LearnSmart <span>AI</span></Link>
    {user && <nav>
      <Link to="/">Dashboard</Link><Link to="/courses">Courses</Link>
      <Link to="/recommendations">For You</Link><Link to="/progress">Progress</Link>
      <Link to="/quiz">Quiz</Link><Link to="/study-assistant">AI Tutor</Link>
    </nav>}
    {user && <button className="button button-light" onClick={onLogout}><LogOut size={16}/> Logout</button>}
  </header>;
}

function AuthPage({ onLogin }) {
  const [registerMode, setRegisterMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", interests: "Python, Artificial Intelligence", skillLevel: "beginner" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const endpoint = registerMode ? "/auth/register" : "/auth/login";
      const payload = { ...form, interests: form.interests.split(",").map(s => s.trim()).filter(Boolean), goals: [] };
      const { data } = await api.post(endpoint, payload); onLogin(data);
    } catch (err) { setError(err.response?.data?.message || "Could not connect to the server."); }
    finally { setBusy(false); }
  }
  return <main className="auth-layout">
    <section className="hero"><div className="eyebrow"><Sparkles size={16}/> YOUR PERSONAL AI LEARNING GUIDE</div>
      <h1>Learn smarter.<br/><span>Grow faster.</span></h1>
      <p>Discover courses tailored to your interests, goals and skill level.</p>
      <div className="hero-stats"><div><strong>AI</strong><small>Course matching</small></div><div><strong>24/7</strong><small>Self-paced learning</small></div><div><strong>1:1</strong><small>Personalized paths</small></div></div>
    </section>
    <form className="auth-card" onSubmit={submit}>
      <div className="icon-tile"><GraduationCap size={27}/></div>
      <h2>{registerMode ? "Create your account" : "Welcome back"}</h2><p className="muted">Your next learning journey starts here.</p>
      {registerMode && <>
        <label>Full name</label><input name="name" value={form.name} onChange={update} placeholder="Enter your name" required/>
        <label>Learning interests (comma separated)</label><input name="interests" value={form.interests} onChange={update}/>
        <label>Current skill level</label><select name="skillLevel" value={form.skillLevel} onChange={update}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select>
      </>}
      <label>Email address</label><input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" required/>
      <label>Password</label><input name="password" type="password" value={form.password} onChange={update} minLength={8} autoComplete={registerMode ? "new-password" : "current-password"} placeholder="At least 8 characters" required/>
      {error && <p className="error">{error}</p>}
      <button className="button button-primary full" disabled={busy}>{busy ? "Please wait..." : registerMode ? "Create account" : "Sign in"}</button>
      <p className="switch-auth">{registerMode ? "Already registered?" : "New to LearnSmart?"} <button type="button" onClick={() => {setRegisterMode(!registerMode);setError("");}}>{registerMode ? "Sign in" : "Create an account"}</button></p>
    </form>
  </main>;
}

function Stat({ icon, label, value }) {
  return <article className="stat-card"><div className="stat-icon">{icon}</div><p>{label}</p><strong>{value}</strong></article>;
}

function CourseGrid({ courses }) {
  if (!courses?.length) return <p className="muted">No courses to display yet.</p>;
  return <div className="course-grid">{courses.map(course => <article className="course-card" key={course._id}>
    <div className="course-art"><BookOpen size={31}/></div><div className="course-content">
      <div className="course-meta"><span className="tag">{course.category}</span><span className="muted">{course.level}</span></div>
      <h3>{course.title}</h3><p>{course.description}</p>
      <div className="course-footer"><span>{course.durationHours} hours</span><Link to={`/courses/${course._id}`}>Explore →</Link></div>
      {course.recommendationReason && <p className="reason"><Sparkles size={14}/>{course.recommendationReason}</p>}
    </div></article>)}</div>;
}

function Dashboard({ user }) {
  const [courses, setCourses] = useState([]); const [recommendations, setRecommendations] = useState([]); const [error, setError] = useState("");
  useEffect(() => { Promise.all([api.get("/courses"),api.get("/recommendations")]).then(([a,r])=>{setCourses(a.data.courses);setRecommendations(r.data.recommendations);}).catch(()=>setError("Dashboard load nahi hua. Backend, database aur AI service check karein.")); }, []);
  return <main className="page">
    <section className="welcome-banner"><div><div className="eyebrow"><Sparkles size={15}/> PERSONALIZED LEARNING</div><h1>Welcome back, {user.name}!</h1><p>Your next skill is one course away. Let's keep learning.</p></div><div className="banner-icon"><BrainCircuit size={72}/></div></section>
    {error && <p className="error">{error}</p>}
    <section className="stats-grid"><Stat icon={<BookOpen/>} label="Available courses" value={courses.length}/><Stat icon={<Sparkles/>} label="AI suggestions" value={recommendations.length}/><Stat icon={<GraduationCap/>} label="Skill level" value={user.skillLevel}/></section>
    <section className="section-heading"><div><h2>Recommended for you</h2><p>Matched to your interests and learning level.</p></div><Link to="/recommendations">View all →</Link></section>
    <CourseGrid courses={recommendations.map(item=>({...item.course,recommendationReason:item.reason}))}/>
    <section className="section-heading"><div><h2>Explore courses</h2><p>Find your next topic to master.</p></div><Link to="/courses">Browse all →</Link></section>
    <CourseGrid courses={courses.slice(0,3)}/>
  </main>;
}

function CoursesPage() {
  const [courses,setCourses]=useState([]); const [search,setSearch]=useState(""); const [message,setMessage]=useState("");
  useEffect(()=>{api.get("/courses").then(r=>setCourses(r.data.courses)).catch(()=>setMessage("Unable to load courses."));},[]);
  const filtered=courses.filter(c=>`${c.title} ${c.category} ${c.description} ${(c.tags||[]).join(" ")}`.toLowerCase().includes(search.toLowerCase()));
  async function enroll(id){try{await api.post(`/courses/${id}/enroll`);setMessage("Enrollment successful!");}catch(e){setMessage(e.response?.data?.message||"Enrollment failed.");}}
  return <main className="page"><div className="page-title"><h1>Explore courses</h1><p>Build practical skills, one lesson at a time.</p></div>
    <div className="search-box"><Search size={20}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search programming, AI, cybersecurity..."/></div>
    {message&&<p className="notice">{message}</p>}
    <div className="course-grid">{filtered.map(course=><article className="course-card" key={course._id}><div className="course-art"><BookOpen size={31}/></div><div className="course-content"><span className="tag">{course.category}</span><h3>{course.title}</h3><p>{course.description}</p><div className="course-footer"><span>{course.level} · {course.durationHours} hours</span><button className="text-button" onClick={()=>enroll(course._id)}>Enroll →</button></div></div></article>)}</div>
    {!filtered.length&&<p className="muted">No matching courses found.</p>}
  </main>;
}

function CourseDetail() {
  const id=window.location.pathname.split("/").pop(); const [course,setCourse]=useState(null); const [message,setMessage]=useState("");
  useEffect(()=>{api.get(`/courses/${id}`).then(r=>setCourse(r.data.course)).catch(()=>setMessage("Course not found."));},[id]);
  async function enroll(){try{await api.post(`/courses/${id}/enroll`);setMessage("Enrollment successful!");}catch(e){setMessage(e.response?.data?.message||"Unable to enroll.");}}
  if(!course)return <main className="page">{message||"Loading course..."}</main>;
  return <main className="page detail-page"><span className="tag">{course.category}</span><h1>{course.title}</h1><p>{course.description}</p><p>{course.level} · {course.durationHours} hours</p><h2>Skills you'll explore</h2><div className="tag-list">{course.skills.map(s=><span className="tag" key={s}>{s}</span>)}</div><button className="button button-primary" onClick={enroll}>Enroll in this course</button>{message&&<p className="notice">{message}</p>}{course.lessons?.length>0&&<section><h2>Lessons</h2>{course.lessons.map((l,i)=><article className="lesson" key={i}><h3>{l.order}. {l.title}</h3><p>{l.content}</p></article>)}</section>}</main>;
}

function RecommendationsPage() {
  const [items,setItems]=useState([]);const [basedOn,setBasedOn]=useState(null);const [error,setError]=useState("");
  useEffect(()=>{api.get("/recommendations").then(({data})=>{setItems(data.recommendations);setBasedOn(data.basedOn);}).catch(()=>setError("AI service start karein aur dobara try karein."));},[]);
  return <main className="page"><div className="page-title"><div className="eyebrow"><BrainCircuit size={16}/> MACHINE LEARNING</div><h1>Your AI learning plan</h1><p>Recommendations are ranked against your interests and skill level.</p></div>
    {basedOn&&<div className="profile-strip"><strong>Personalized using:</strong> {[...basedOn.interests,basedOn.skillLevel].join(" · ")}</div>}{error&&<p className="error">{error}</p>}
    <div className="recommendation-list">{items.map(item=><article className="recommendation-card" key={item.course._id}><div className="rec-icon"><Sparkles size={25}/></div><div className="rec-info"><span className="tag">{item.course.category}</span><h3>{item.course.title}</h3><p>{item.course.description}</p><p className="reason">{item.reason}</p></div><div className="rec-score"><strong>{Math.round(item.score*100)}%</strong><small>Match score</small></div></article>)}</div>
    {!items.length&&!error&&<p className="muted">No recommendations yet. Add interests during registration and make sure the AI service is running.</p>}
  </main>;
}

export default function App() {
  const [user,setUser]=useState(null);const [checking,setChecking]=useState(true);const navigate=useNavigate();
  useEffect(()=>{const token=localStorage.getItem("learnsmart_token");if(!token){setChecking(false);return;}api.get("/auth/me").then(({data})=>setUser(data.user)).catch(()=>localStorage.removeItem("learnsmart_token")).finally(()=>setChecking(false));},[]);
  function login(data){localStorage.setItem("learnsmart_token",data.token);setUser(data.user);navigate("/");}
  function logout(){localStorage.removeItem("learnsmart_token");setUser(null);navigate("/login");}
  if(checking)return <main className="loading">Loading your learning space...</main>;
  return <><Navbar user={user} onLogout={logout}/><Routes>
    <Route path="/login" element={user?<Navigate to="/"/>:<AuthPage onLogin={login}/>}/>
    <Route path="/" element={user?<Dashboard user={user}/>:<Navigate to="/login"/>}/>
    <Route path="/courses" element={user?<CoursesPage/>:<Navigate to="/login"/>}/>
    <Route path="/courses/:id" element={user?<CourseDetail/>:<Navigate to="/login"/>}/>
    <Route path="/recommendations" element={user?<RecommendationsPage/>:<Navigate to="/login"/>}/>
    <Route path="/quiz" element={user?<Quiz/>:<Navigate to="/login"/>}/>
    <Route path="/progress" element={user?<Progress/>:<Navigate to="/login"/>}/>
    <Route path="/study-assistant" element={user?<StudyAssistant/>:<Navigate to="/login"/>}/>
    <Route path="*" element={<Navigate to={user?"/":"/login"}/>}/>
  </Routes><footer className="footer">LearnSmart AI · Personalized learning for everyone</footer></>;
}
