package main

// Portfolio content — mirrors data/profile.ts + data/games.json from the website.

var sections = []string{"Home", "About", "Experience", "Projects", "Skills", "Signals", "Games", "Contact"}

const (
	pRole = "Senior Software Engineer · Systems, HPC & ML"
	pLoc  = "Ontario, Canada"
	pNow  = "Developing GPU drivers for machine learning and data-center workloads on AMD's ROCm open-source platform."
	pBio  = "Senior Software Engineer at AMD developing GPU drivers for the ROCm platform. Specializing in HPC systems, embedded architecture, and performance optimization. Experienced with OpenMP, performance profiling, and real-time systems. Research background in formal methods, verification & validation, and applications of LLMs in system design."
)

var quickFacts = [][2]string{
	{"Role", "Sr. Software Engineer @ AMD"},
	{"Location", "Ontario, Canada"},
	{"Education", "MASc ECE, Queen's University (4.3/4.3)"},
	{"Focus", "GPU Drivers · HPC · ML Systems"},
}

var links = [][2]string{
	{"Website", "https://amirshetaia.com"},
	{"GitHub", "github.com/NightBaRron1412"},
	{"GitHub (AMD)", "github.com/ashetaia-amd"},
	{"LinkedIn", "linkedin.com/in/ashetaia"},
	{"Email", "ashetaia01@gmail.com"},
}

type expItem struct {
	role, company, dates, location, summary string
	bullets                                 []string
	tech                                    []string
}

var experience = []expItem{
	{
		role: "Senior Software Engineer", company: "AMD",
		dates: "Jan 2026 — Present", location: "Toronto, ON · On-site",
		summary: "Developing GPU drivers for machine learning and data-center workloads on the ROCm open-source platform.",
		bullets: []string{
			"Contributing to high-impact projects supporting current and next-gen AMD GPUs.",
			"Debugging and resolving complex Linux kernel and driver issues from customers and QA.",
			"Designing new driver features and engaging the open-source community via upstream reviews.",
		},
		tech: []string{"Embedded Linux", "C++", "GPU Drivers", "ROCm", "Linux Kernel"},
	},
	{
		role: "R&D Software Engineer", company: "Huawei",
		dates: "Dec 2024 — Jan 2026", location: "Vancouver, BC · Remote",
		summary: "Built deterministic sparse linear solvers in C++ for large-scale optimization, focused on HPC and reproducibility.",
		bullets: []string{
			"Made the OptVerse Cholesky solver bit-for-bit reproducible across runs in C++.",
			"Applied OpenMP and HPC techniques; profiled hot paths to recover throughput.",
			"Tamed non-determinism from parallel execution and floating-point order.",
		},
		tech: []string{"C++", "OpenMP", "HPC", "Python", "Linear Programming"},
	},
	{
		role: "Graduate Research Assistant", company: "CritLab · Queen's University",
		dates: "Sep 2024 — Dec 2025", location: "Kingston, ON",
		summary: "Research on integrating LLMs and NLP into formal verification and anomaly-detection systems.",
		bullets: []string{
			"Built DeepParse, a hybrid LLM-enhanced log-parsing framework.",
			"Applied LLM/NLP methods to model checking, trace analysis, and automated reasoning.",
		},
		tech: []string{"Model Checking", "ISO 26262", "Formal Verification", "LLM", "Machine Learning"},
	},
	{
		role: "Graduate Teaching Assistant", company: "Queen's University",
		dates: "Sep 2024 — Dec 2025", location: "Kingston, ON",
		summary: "TA for ELEC 471 (Safety-Critical Software Engineering) and APSC 142 (Intro to Programming).",
		bullets: []string{
			"Delivered tutorials on hazard analysis, HARA, FMEA, STPA, and model checking.",
			"Taught C programming and computational thinking to first-year engineers.",
		},
		tech: []string{"C", "Model Checking", "Teaching", "V&V"},
	},
	{
		role: "Cloud Engineer", company: "Huawei",
		dates: "Dec 2023 — Aug 2024", location: "Cairo, Egypt",
		summary: "Cloud infrastructure and networking within the Packet Switching team.",
		bullets: []string{
			"Deployed and optimized high-availability, scalable cloud systems.",
			"Configured virtualized network functions (VNFs) and cloud-native workloads.",
		},
		tech: []string{"Cloud Infrastructure", "Packet Switching", "Cloud Services"},
	},
	{
		role: "Embedded Software Engineer", company: "Valeo",
		dates: "Jul 2023 — Nov 2023", location: "Cairo, Egypt",
		summary: "Embedded software for automotive systems: protocol integration, testing, and CI automation.",
		bullets: []string{
			"Added Saleae and PicoScope analyzer support to the global integration test tool.",
			"Built a UI tool for the Baby-LIN-II to record and analyze LIN signals; ensured MISRA C compliance.",
		},
		tech: []string{"Embedded Software", "C#", "Python", "CAN/LIN", "WPF"},
	},
	{
		role: "Software Engineer", company: "Tekomoro",
		dates: "Sep 2022 — Nov 2023", location: "Cairo, Egypt",
		summary: "Autonomous-driving software for Low-Speed Autonomous Vehicles using LiDAR, cameras, and IMUs.",
		bullets: []string{
			"Contributed to perception, localization, and path-planning modules.",
			"Built a LiDAR-based obstacle detection/tracking system; improved nav in GPS-denied areas via sensor fusion.",
		},
		tech: []string{"Autonomous Vehicles", "LiDAR", "Python", "Sensor Fusion"},
	},
	{
		role: "Embedded Software Engineer", company: "Siemens EDA",
		dates: "Jul 2022 — Nov 2022", location: "Cairo, Egypt",
		summary: "Deep dive into MCU fundamentals, RTOS, AUTOSAR, functional safety, and embedded Linux.",
		bullets: []string{
			"Studied CPU architecture, startup/linker flow, interrupts, and bootloaders.",
			"Practiced embedded Linux board bring-up with Buildroot; functional safety (ISO 26262).",
		},
		tech: []string{"Embedded Linux", "RTOS", "AUTOSAR", "C++"},
	},
	{
		role: "Co-Founder", company: "Mansoura Robotics Club",
		dates: "Feb 2021 — Oct 2022", location: "El Mansoura, Egypt",
		summary: "Co-founded a student robotics club focused on innovation and hands-on learning.",
		bullets: []string{
			"Organized 4 hackathons with 4,000+ combined participants.",
			"Partnered with MathWorks and Dassault Systèmes; led workshops and competitions.",
		},
		tech: []string{"Leadership", "Event Planning", "Embedded Software"},
	},
}

type projItem struct {
	title, role, desc, outcomes, link string
	tech                              []string
}

var projects = []projItem{
	{
		title: "OptVerse: Deterministic Sparse Linear Solver",
		role:  "R&D Software Engineer · Huawei",
		desc:  "Made Huawei's OptVerse Cholesky solver bit-for-bit reproducible across runs in C++/OpenMP without giving up HPC throughput.",
		outcomes: "Reproducible run-to-run output for a parallel sparse Cholesky solver, validated on Hans Mittelmann's optimization benchmarks.",
		tech: []string{"C++", "OpenMP", "HPC", "Sparse Linear Algebra", "Profiling"},
	},
	{
		title: "DeepParse: LLM-Enhanced Log Parsing",
		role:  "Project Lead · CritLab",
		desc:  "Hybrid log-parsing system combining DeepSeek-R1:8B with the Drain algorithm.",
		outcomes: "97.6% accuracy across 16 datasets; improved anomaly detection via LLM-driven template generation.",
		tech: []string{"LLMs", "DeepSeek-R1", "NLP", "Python"},
		link: "github.com/NightBaRron1412/DeepParse",
	},
	{
		title: "VehiPlus: Embedded Telematics & Driver Assistance",
		role:  "Developer",
		desc:  "Raspberry Pi 4 real-time diagnostics platform: OBD-II telemetry, MQTT, YOLO detection, and on-device ML.",
		outcomes: "Lane-departure and collision-avoidance alerts at sub-100ms latency, plus an OTA update framework.",
		tech: []string{"Raspberry Pi", "OBD-II", "MQTT", "YOLO", "TensorFlow"},
		link: "github.com/NightBaRron1412/VehiPlus",
	},
}

type skillCat struct {
	name  string
	items []string
}

var skillCats = []skillCat{
	{"Languages", []string{"C/C++", "Python", "C#", "Java", "Rust", "Go", "SQL", "JavaScript", "Assembly", "MATLAB"}},
	{"Firmware & Embedded", []string{"Zephyr", "AUTOSAR OS", "Embedded Linux", "MCU Debugging", "Buildroot"}},
	{"Protocols & Standards", []string{"MCTP", "PLDM", "SPDM", "FRU", "CAN", "LIN", "I2C", "SPI", "SMBus", "I3C"}},
	{"Cloud & DevOps", []string{"AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"}},
	{"System Design", []string{"Distributed Systems", "Multithreading", "OpenMP", "HPC", "Computer Architecture"}},
	{"Debug & Tools", []string{"GDB", "WinDbg", "Wireshark", "Oscilloscope / Logic Analyzer"}},
	{"AI & ML", []string{"TensorFlow", "PyTorch", "Hugging Face", "Scikit-Learn", "YOLO", "NLP", "LLMs"}},
}

type eduItem struct {
	school, degree, year, gpa, details string
}

var education = []eduItem{
	{"Queen's University", "MASc. Electrical & Computer Engineering", "2024–2025", "4.3/4.3",
		"Research: Formal Methods, V&V, LLMs, System Modeling, Real-Time Systems."},
	{"Mansoura University", "BEng. Mechatronics Engineering", "2019–2024", "3.80/4.0",
		"Excellence with Honours · Top 10 of class · Academic Excellence Scholarship."},
}

var awards = []string{
	"HUAWEI ICT Competition 2024 — First Prize Global (Shenzhen) & Grand Prize North Africa, Cloud Track.",
	"Ideal Student Award 2022 — Mansoura University, for academic performance and leadership.",
}

var community = []string{
	"Co-Founder, Mansoura Robotics Club — 4 hackathons, 4,000+ participants (2022–2024).",
	"HUAWEI ICT Academy Ambassador — promoting ICT education in emerging markets (2024–present).",
}

type gameItem struct {
	title, status, note string
	platforms           []string
}

var games = []gameItem{
	{"The Witcher 3: Wild Hunt", "all-time fave", "The RPG yardstick — even the side quests are full-blown stories.", []string{"PC", "PS", "Xbox", "Switch"}},
	{"God of War Ragnarök", "favorite", "Norse myth, brutal and tender — the best-feeling combat I've played.", []string{"PS5", "PC"}},
	{"The Last of Us Part II", "favorite", "The benchmark for storytelling in games — it wrecked me, in the best way.", []string{"PS5", "PC"}},
	{"Detroit: Become Human", "favorite", "Branching android futures where every choice actually mattered.", []string{"PS4", "PC"}},
	{"Pragmata", "currently playing", "Capcom's lunar sci-fi mystery — and it absolutely delivered.", []string{"PS5", "Xbox", "PC"}},
	{"Battlefield 6", "in rotation", "All-out warfare, back to its loud, chaotic best.", []string{"PC", "PS5", "Xbox"}},
	{"Rainbow Six Siege", "FPS go-to", "The squad-based tac-shooter I keep coming back to.", []string{"PC", "PS5", "Xbox"}},
	{"EA SPORTS FC 26", "in rotation", "The daily fix — Ultimate Team and Weekend League grind.", []string{"PS5", "PC", "Xbox"}},
}

// Player tag shown on the Games view.
const playerTag = "NightBaRron1412"
