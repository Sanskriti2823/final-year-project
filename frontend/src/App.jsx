import React, { useEffect, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Bookmark, BrainCircuit, Check, ChartNoAxesCombined, Clock3, GraduationCap, LogOut, Moon, Search, Sparkles, Sun, Trophy } from "lucide-react";
import api from "./services/api";
import Quiz from "./pages/Quiz.jsx";
import StudyAssistant from "./pages/StudyAssistant.jsx";
import Progress from "./pages/Progress.jsx";

function Navbar({ user, onLogout, theme, onToggleTheme }) {
  return <header className="navbar">
    <Link to="/" className="brand"><BrainCircuit size={27}/> LearnSmart <span>AI</span></Link>
    {user && <nav>
      <NavLink to="/" end>Dashboard</NavLink><NavLink to="/courses">Courses</NavLink>
      <NavLink to="/recommendations">For You</NavLink><NavLink to="/progress">Progress</NavLink>
      <NavLink to="/quiz">Quiz</NavLink><NavLink to="/study-assistant">AI Tutor</NavLink>
    </nav>}
    {user && <div className="nav-actions">
      <button className="icon-button" onClick={onToggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`} title="Toggle theme">
        {theme === "light" ? <Moon size={18}/> : <Sun size={18}/>}
      </button>
      <button className="button button-light" onClick={onLogout}><LogOut size={16}/> Logout</button>
    </div>}
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

function CourseGrid({ courses, savedIds = [], onToggleSaved }) {
  if (!courses?.length) return <p className="muted">No courses to display yet.</p>;
  return <div className="course-grid">{courses.map(course => <article className="course-card" key={course._id}>
    <div className="course-art"><BookOpen size={31}/>{onToggleSaved&&<button className={`save-button ${savedIds.includes(course._id)?"is-saved":""}`} aria-label={savedIds.includes(course._id)?"Remove saved course":"Save course"} title={savedIds.includes(course._id)?"Remove saved course":"Save course"} onClick={()=>onToggleSaved(course._id)}><Bookmark size={18} fill={savedIds.includes(course._id)?"currentColor":"none"}/></button>}</div><div className="course-content">
      <div className="course-meta"><span className="tag">{course.category}</span><span className="muted">{course.level}</span></div>
      <h3>{course.title}</h3><p>{course.description}</p>
      <div className="course-footer"><span>{course.durationHours} hours</span><Link to={`/courses/${course._id}`}>Explore →</Link></div>
      {course.recommendationReason && <p className="reason"><Sparkles size={14}/>{course.recommendationReason}</p>}
    </div></article>)}</div>;
}

function Dashboard({ user, savedIds, onToggleSaved }) {
  const [courses, setCourses] = useState([]); const [recommendations, setRecommendations] = useState([]);
  const [progress, setProgress] = useState(null);
  const [courseError, setCourseError] = useState(""); const [recommendationError, setRecommendationError] = useState(""); const [progressError, setProgressError] = useState("");
  useEffect(() => {
    api.get("/courses").then(({ data }) => setCourses(data.courses)).catch(() => setCourseError("Unable to load courses."));
    api.get("/recommendations").then(({ data }) => setRecommendations(data.recommendations)).catch(() => setRecommendationError("Recommendations are temporarily unavailable."));
    api.get("/progress").then(({ data }) => setProgress(data)).catch(() => setProgressError("Your learning progress is temporarily unavailable."));
  }, []);
  const activeCourses = progress?.enrollments?.filter(enrollment => enrollment.status !== "completed") || [];
  return <main className="page">
    <section className="welcome-banner"><div><div className="eyebrow"><Sparkles size={15}/> YOUR LEARNING SPACE</div><h1>Good to see you, {user.name.split(" ")[0]}.</h1><p>Small steps every day add up to remarkable progress. What will you learn today?</p><Link className="button button-primary banner-cta" to="/courses">Find your next course <ArrowRight size={17}/></Link></div><div className="banner-art"><div className="banner-orbit orbit-one"/><div className="banner-orbit orbit-two"/><div className="banner-emblem"><BrainCircuit size={47}/></div><span className="floating-badge badge-spark"><Sparkles size={17}/></span><span className="floating-badge badge-check"><Check size={17}/></span></div></section>
    {courseError && <p className="error">{courseError}</p>}
    {recommendationError && <p className="notice">{recommendationError} You can still browse all available courses.</p>}
    {progressError && <p className="notice">{progressError}</p>}
    <section className="stats-grid">
      <Stat icon={<BookOpen/>} label="Courses to explore" value={courses.length}/>
      <Stat icon={<Trophy/>} label="Courses completed" value={progress?.summary?.completedCourses ?? "—"}/>
      <Stat icon={<ChartNoAxesCombined/>} label="Learning progress" value={progress?`${progress.summary.averageProgress}%`:"—"}/>
    </section>
    <div className="dashboard-columns">
      <section className="dashboard-main">
        <section className="section-heading"><div><div className="eyebrow"><Sparkles size={15}/> PICKED FOR YOU</div><h2>Made for your next chapter</h2><p>Recommendations based on your interests and skill level.</p></div><Link to="/recommendations">All picks <ArrowRight size={15}/></Link></section>
        <CourseGrid courses={recommendations.slice(0,3).map(item=>({...item.course,recommendationReason:item.reason}))} savedIds={savedIds} onToggleSaved={onToggleSaved}/>
        <section className="section-heading explore-heading"><div><div className="eyebrow">KEEP GROWING</div><h2>Explore something new</h2><p>Fresh skills are just around the corner.</p></div><Link to="/courses">Browse all <ArrowRight size={15}/></Link></section>
        <CourseGrid courses={courses.slice(0,3)} savedIds={savedIds} onToggleSaved={onToggleSaved}/>
      </section>
      <aside className="dashboard-side">
        <section className="side-panel">
          <div className="side-panel-heading"><span className="side-icon"><Clock3 size={18}/></span><span><strong>Pick up where you left off</strong><small>Your learning journey</small></span></div>
          {activeCourses.length ? <div className="continue-list">{activeCourses.slice(0,3).map(enrollment=><Link className="continue-item" key={enrollment._id} to="/progress"><span className="continue-course">{enrollment.courseId?.title || "Your course"}<small>{enrollment.progress}% complete</small></span><span className="mini-progress"><span style={{width:`${enrollment.progress}%`}}/></span></Link>)}</div> : <div className="empty-learning"><BookOpen size={25}/><p>{progress?"Your learning path is ready when you are.":"Loading your learning progress..."}</p>{progress&&<Link to="/courses">Browse courses <ArrowRight size={14}/></Link>}</div>}
          {activeCourses.length>0&&<Link className="side-link" to="/progress">View my progress <ArrowRight size={15}/></Link>}
        </section>
        <section className="study-promo"><div className="promo-icon"><BrainCircuit size={21}/></div><span className="eyebrow">A LITTLE HELP?</span><h3>Curious minds go further.</h3><p>Ask your AI study assistant to untangle a tricky topic.</p><Link to="/study-assistant">Meet your AI tutor <ArrowRight size={15}/></Link></section>
      </aside>
    </div>
  </main>;
}

function CoursesPage({ savedIds, onToggleSaved }) {
  const [courses,setCourses]=useState([]); const [search,setSearch]=useState(""); const [category,setCategory]=useState("All topics"); const [level,setLevel]=useState("All levels"); const [savedOnly,setSavedOnly]=useState(false); const [enrolledIds,setEnrolledIds]=useState([]); const [message,setMessage]=useState(""); const [error,setError]=useState("");
  useEffect(()=>{api.get("/courses").then(r=>setCourses(r.data.courses)).catch(()=>setError("Unable to load courses. Please try again."));api.get("/progress").then(({data})=>setEnrolledIds(data.enrollments.map(item=>String(item.courseId?._id||item.courseId)))).catch(()=>{});},[]);
  const categories=["All topics",...new Set(courses.map(course=>course.category).filter(Boolean))];
  const filtered=courses.filter(c=>`${c.title} ${c.category} ${c.description} ${(c.tags||[]).join(" ")}`.toLowerCase().includes(search.trim().toLowerCase())&&(category==="All topics"||c.category===category)&&(level==="All levels"||c.level===level)&&(!savedOnly||savedIds.includes(c._id)));
  async function enroll(id){try{await api.post(`/courses/${id}/enroll`);setEnrolledIds(prev=>prev.includes(id)?prev:[...prev,id]);setMessage("You're enrolled! Find your course in My Progress.");}catch(e){setMessage(e.response?.data?.message||"Enrollment failed.");}}
  return <main className="page">
    <section className="catalog-hero"><div className="eyebrow"><BookOpen size={15}/> THE COURSE LIBRARY</div><h1>Make room for a new skill.</h1><p>Expert-curated paths to help you learn what matters, at your own pace.</p><div className="catalog-count"><strong>{courses.length}</strong><span>courses to explore</span><i/><span>From first steps to advanced skills</span></div></section>
    <div className="catalog-toolbar">
      <div className="search-box"><Search size={19}/><input aria-label="Search courses" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search topics, skills, courses..."/>{search&&<button className="clear-search" onClick={()=>setSearch("")} aria-label="Clear search">×</button>}</div>
      <label className="filter-select"><span>Level</span><select value={level} onChange={e=>setLevel(e.target.value)}><option>All levels</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
      <button className={`saved-filter ${savedOnly?"selected":""}`} onClick={()=>setSavedOnly(value=>!value)}><Bookmark size={16} fill={savedOnly?"currentColor":"none"}/>{savedOnly?"Saved":"My saved"}<span>{savedIds.length}</span></button>
    </div>
    <div className="category-row" aria-label="Filter by topic">{categories.map(item=><button key={item} className={`category-chip ${category===item?"active":""}`} onClick={()=>setCategory(item)}>{item}</button>)}</div>
    {message&&<p className="notice">{message}</p>}
    {error&&<p className="error">{error}</p>}
    <div className="catalog-results"><span><strong>{filtered.length}</strong> {filtered.length===1?"course":"courses"} {search||category!=="All topics"||level!=="All levels"||savedOnly?"match your filters":"ready for you"}</span><button className="text-button" onClick={()=>{setSearch("");setCategory("All topics");setLevel("All levels");setSavedOnly(false);}}>Reset filters</button></div>
    <div className="course-grid">{filtered.map(course=><article className="course-card" key={course._id}>
      <div className={`course-art course-art-${course.category.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`}><BookOpen size={31}/><button className={`save-button ${savedIds.includes(course._id)?"is-saved":""}`} aria-label={savedIds.includes(course._id)?"Remove saved course":"Save course"} title={savedIds.includes(course._id)?"Remove saved course":"Save course"} onClick={()=>onToggleSaved(course._id)}><Bookmark size={18} fill={savedIds.includes(course._id)?"currentColor":"none"}/></button><span className="course-art-label">{course.category}</span></div>
      <div className="course-content"><div className="course-meta"><span className="tag">{course.level}</span><span className="course-duration"><Clock3 size={14}/>{course.durationHours} hours</span></div><h3>{course.title}</h3><p>{course.description}</p><div className="course-footer"><Link to={`/courses/${course._id}`} className="course-detail-link">Course details <ArrowRight size={15}/></Link><button className={`button ${enrolledIds.includes(course._id)?"button-enrolled":"button-enroll"}`} disabled={enrolledIds.includes(course._id)} onClick={()=>enroll(course._id)}>{enrolledIds.includes(course._id)?<><Check size={15}/> Enrolled</>:"Enroll"}</button></div></div>
    </article>)}</div>
    {!filtered.length&&<div className="empty-catalog"><Search size={28}/><h3>No courses found</h3><p>Try a different search or clear your filters.</p><button className="button button-primary" onClick={()=>{setSearch("");setCategory("All topics");setLevel("All levels");setSavedOnly(false);}}>Show all courses</button></div>}
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
  const [theme,setTheme]=useState(()=>localStorage.getItem("learnsmart_theme")==="dark"?"dark":"light");
  const [savedIds,setSavedIds]=useState(()=>{try{const saved=JSON.parse(localStorage.getItem("learnsmart_saved_courses")||"[]");return Array.isArray(saved)?saved.filter(id=>typeof id==="string"):[];}catch{return [];}});
  useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem("learnsmart_theme",theme);},[theme]);
  function toggleSaved(id){setSavedIds(current=>{const next=current.includes(id)?current.filter(savedId=>savedId!==id):[...current,id];localStorage.setItem("learnsmart_saved_courses",JSON.stringify(next));return next;});}
  useEffect(()=>{const token=localStorage.getItem("learnsmart_token");if(!token){setChecking(false);return;}api.get("/auth/me").then(({data})=>setUser(data.user)).catch(()=>localStorage.removeItem("learnsmart_token")).finally(()=>setChecking(false));},[]);
  function login(data){localStorage.setItem("learnsmart_token",data.token);setUser(data.user);navigate("/");}
  function logout(){localStorage.removeItem("learnsmart_token");setUser(null);navigate("/login");}
  if(checking)return <main className="loading">Loading your learning space...</main>;
  return <div className="app-shell"><Navbar user={user} onLogout={logout} theme={theme} onToggleTheme={()=>setTheme(current=>current==="light"?"dark":"light")}/><Routes>
    <Route path="/login" element={user?<Navigate to="/"/>:<AuthPage onLogin={login}/>}/>
    <Route path="/" element={user?<Dashboard user={user} savedIds={savedIds} onToggleSaved={toggleSaved}/>:<Navigate to="/login"/>}/>
    <Route path="/courses" element={user?<CoursesPage savedIds={savedIds} onToggleSaved={toggleSaved}/>:<Navigate to="/login"/>}/>
    <Route path="/courses/:id" element={user?<CourseDetail/>:<Navigate to="/login"/>}/>
    <Route path="/recommendations" element={user?<RecommendationsPage/>:<Navigate to="/login"/>}/>
    <Route path="/quiz" element={user?<Quiz/>:<Navigate to="/login"/>}/>
    <Route path="/progress" element={user?<Progress/>:<Navigate to="/login"/>}/>
    <Route path="/study-assistant" element={user?<StudyAssistant/>:<Navigate to="/login"/>}/>
    <Route path="*" element={<Navigate to={user?"/":"/login"}/>}/>
  </Routes><footer className="footer">LearnSmart AI · Personalized learning for everyone</footer></div>;
}
