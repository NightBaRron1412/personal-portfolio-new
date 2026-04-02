// Place your portrait at: public/images/portrait.webp (or portrait.jpg)
export const profile = {
  name: "Amir Shetaia",
  title: "Software Engineer | Systems, HPC, and ML",
  location: "Ontario, Canada",
  headline: "Senior Software Engineer at AMD | MASc. in Computer and Electrical Engineering",
  portrait: "/images/portrait.jpg", // Fallback to initials if not present
  portraitBadges: ["Systems", "HPC", "ML"],
  summary:
    "Senior Software Engineer at AMD working on GPU drivers for machine learning and data center workloads on the ROCm open-source platform. Background in deterministic optimization solvers, high-performance computing, and embedded systems with a strong focus on formal methods, verification, and machine learning systems.",
  bio: `Senior Software Engineer at AMD developing GPU drivers for the ROCm platform. Specializing in HPC systems, embedded systems architecture, and performance optimization. Experienced with OpenMP, performance profiling, and real-time systems. Research background in formal methods, verification & validation, and applications of LLMs in system design.`,
  social: {
    github: "https://github.com/NightBaRron1412",
    linkedin: "https://www.linkedin.com/in/ashetaia/",
    email: "mailto:ashetaia01@gmail.com"
  },
  resumeUrl: "/Amir-Shetaia-Resume.pdf",
  hero: {
    name: "Amir Shetaia",
    subtitle: "Software Engineer | Systems, HPC, and ML",
    bio: "Developing GPU drivers for ML and data center workloads at AMD on the ROCm platform. Background in HPC optimization, formal methods, and verification systems.",
    commands: [
      "GPU drivers @ AMD ROCm",
      "HPC optimization with OpenMP",
      "Formal methods & verification research",
      "Real-time systems & embedded design"
    ],
    now: "Developing GPU drivers for machine learning and data center workloads on the ROCm open-source platform at AMD."
  },
  quickFacts: [
    { label: "Current Role", value: "Sr. Software Engineer @ AMD" },
    { label: "Location", value: "Ontario, Canada" },
    { label: "Education", value: "MASc ECE, Queen's University (GPA 4.3/4.3)" },
    { label: "Focus", value: "Deterministic Solvers, HPC, ML Systems" }
  ],
  nowCard: {
    title: "Now",
    body: "Currently developing GPU drivers for machine learning and data center workloads on the ROCm open-source platform at AMD."
  },
  skills: {
    "Languages": [
      { name: "C/C++" },
      { name: "Python" },
      { name: "C#" },
      { name: "Java" },
      { name: "Rust" },
      { name: "Go" },
      { name: "SQL" },
      { name: "JavaScript" },
      { name: "Assembly" },
      { name: "MATLAB" }
    ],
    "Firmware and Embedded": [
      { name: "Zephyr" },
      { name: "AUTOSAR OS" },
      { name: "Embedded Linux" },
      { name: "MCU Debugging" },
      { name: "Buildroot" }
    ],
    "Protocols and Standards": [
      { name: "MCTP" },
      { name: "PLDM" },
      { name: "SPDM" },
      { name: "FRU" },
      { name: "CAN" },
      { name: "LIN" },
      { name: "I2C" },
      { name: "SPI" },
      { name: "SMBus" },
      { name: "I3C" },
      { name: "Sensor Management" }
    ],
    "Cloud and DevOps": [
      { name: "AWS" },
      { name: "Docker" },
      { name: "Kubernetes" },
      { name: "Terraform" },
      { name: "CI/CD" }
    ],
    "System Design": [
      { name: "Distributed Systems" },
      { name: "Multithreading" },
      { name: "OpenMP" },
      { name: "HPC" },
      { name: "Computer Architecture" }
    ],
    "Debug and Tools": [
      { name: "GDB" },
      { name: "WinDbg" },
      { name: "Wireshark" },
      { name: "Oscilloscope/Logic Analyzer" }
    ],
    "AI and ML": [
      { name: "TensorFlow" },
      { name: "PyTorch" },
      { name: "Hugging Face" },
      { name: "Scikit-Learn" },
      { name: "YOLO" },
      { name: "NLP" },
      { name: "LLMs" }
    ]
  },
  experience: [
    {
      company: "AMD",
      companyUrl: "https://www.amd.com",
      logo: "/images/logos/amd.svg",
      role: "Senior Software Engineer",
      type: "Permanent Full-time",
      dates: "Jan 2026 — Present",
      location: "Markham, Ontario, Canada · On-site",
      summary:
        "Developing GPU drivers for machine learning and data center workloads on the ROCm open-source platform.",
      bullets: [
        "Developing GPU drivers for machine learning and data center workloads on the ROCm open-source platform.",
        "Contributing to high-impact software projects supporting current and next-generation AMD GPUs.",
        "Debugging and resolving complex Linux kernel and driver issues reported by customers and QA.",
        "Designing and implementing new driver features, documenting technical decisions and trade-offs.",
        "Collaborating with compute, machine learning, and hardware teams across AMD.",
        "Engaging with the open-source community through upstream contributions and reviews."
      ],
      tech: ["Embedded Linux", "C++", "GPU Drivers", "ROCm", "Linux Kernel"]
    },
    {
      company: "HUAWEI",
      companyUrl: "https://www.huawei.com",
      logo: "/images/logos/Huawei_Standard_logo.svg.png",
      role: "R&D Software Engineer",
      dates: "Dec 2024 — Jan 2026",
      location: "Vancouver, BC (Remote)",
      summary:
        "Developed deterministic sparse linear solvers in C++ for large-scale optimization problems with focus on HPC and reproducibility.",
      bullets: [
        "Developed a deterministic version of the OptVerse Cholesky solver in C++, ensuring reproducibility across runs.",
        "Optimizing sparse linear solvers in C++ for large-scale optimization problems.",
        "Applying parallel programming (OpenMP) and HPC techniques to accelerate solver modules.",
        "Performing profiling and performance analysis to identify bottlenecks and guide optimizations.",
        "Investigating sources of non-determinism (parallel execution, floating-point operations) and contributing efficient solutions.",
        "Analyzing solver performance on Hans Mittelmann's benchmarks, providing insights to improve OptVerse competitiveness."
      ],
      tech: ["C++", "OpenMP", "HPC", "Python", "Linear Programming"]
    },
    {
      company: "Critlab at Queen's University",
      companyUrl: "https://critlab.smithengineering.queensu.ca/",
      logo: "/images/logos/critlab-logo.svg",
      role: "Laboratory Manager",
      dates: "Sep 2025 — Dec 2025",
      location: "Kingston, ON",
      summary:
        "Managed equipment and physical environment of the Safety Critical Software Engineering research lab.",
      bullets: [
        "Monitored and maintained equipment and physical environment of the research lab.",
        "Kept an up-to-date inventory of desks, workstation equipment, development hardware, test tools, and simulation devices.",
        "Tracked equipment location and assignments, coordinating access for lab members and ensuring proper usage.",
        "Identified high-use and low-use equipment to support purchasing decisions and resource planning.",
        "Maintained a safe and organized lab space, addressing safety and usability concerns as they arise."
      ],
      tech: ["Team Leadership", "Engineering"]
    },
    {
      company: "Critlab at Queen's University",
      companyUrl: "https://critlab.smithengineering.queensu.ca/",
      logo: "/images/logos/critlab-logo.svg",
      role: "Graduate Research Assistant",
      dates: "Sep 2024 — Dec 2025",
      location: "Kingston, ON",
      summary:
        "Research on integrating Large Language Models (LLMs) and NLP techniques into formal verification and anomaly detection systems.",
      bullets: [
        "Member of CritLab, conducting research on integrating LLMs and NLP techniques into formal verification and anomaly detection systems.",
        "Developed DeepParse, a hybrid LLM-enhanced log parsing framework that integrates large language models with rule-based parsers to improve accuracy and reduce manual configuration.",
        "Conducted research on applying LLMs and NLP methods to support formal verification, anomaly detection, and safety-critical system analysis.",
        "Investigated novel AI-assisted workflows for model checking, trace analysis, and automated reasoning in high-assurance software."
      ],
      tech: ["Embedded Devices", "Model Checking", "ISO 26262", "Formal Verification", "LLM", "Machine Learning"]
    },
    {
      company: "Queen's University",
      companyUrl: "https://www.queensu.ca",
      logo: "/images/logos/QueensLogo_colour.png",
      role: "Graduate Teaching Assistant",
      dates: "Sep 2024 — Dec 2025",
      location: "Kingston, ON",
      summary:
        "Teaching assistant for ELEC 471 (Safety Critical Software Engineering) and APSC 142 (Intro to Computer Programming).",
      bullets: [
        "ELEC 471: Delivered tutorials on safety-critical development, requirements engineering, hazard analysis, HARA, FMEA, STPA.",
        "Supported students in using model checking tools and formal verification techniques to analyze system behaviour.",
        "APSC 142: Supported weekly labs, grading, and mentoring for first-year engineering students learning C programming.",
        "Taught C programming, problem-solving patterns, and computational thinking."
      ],
      tech: ["C", "Model Checking", "Teaching", "Verification and Validation"]
    },
    {
      company: "Packt",
      companyUrl: "https://www.packtpub.com",
      logo: "/images/logos/Packt-Logo.png",
      role: "Technical Reviewer & Editor",
      dates: "Jan 2023 — Oct 2024",
      location: "London, UK (Remote)",
      summary:
        "Technical reviewer for published books, ensuring accuracy, clarity, and relevance of technical content.",
      bullets: [
        "Served as a technical reviewer for multiple published books, ensuring accuracy, clarity, and relevance of technical content.",
        "Created certification-style question banks and practice exams aligned with industry standards and learning objectives.",
        "Reviewed and validated hands-on exercises, code samples, and explanations for emerging technologies.",
        "Collaborated with authors and editors to improve structure, technical depth, and reader engagement across publications."
      ],
      tech: ["Technical Writing", "Information Technology"]
    },
    {
      company: "HUAWEI",
      companyUrl: "https://www.huawei.com",
      logo: "/images/logos/Huawei_Standard_logo.svg.png",
      role: "Cloud Engineer",
      dates: "Dec 2023 — Aug 2024",
      location: "Cairo, Egypt",
      summary:
        "Worked on cloud infrastructure and networking solutions within the Packet Switching team.",
      bullets: [
        "Worked on cloud infrastructure and networking solutions within the Packet Switching team.",
        "Contributed to the deployment and optimization of high-availability, scalable cloud systems.",
        "Assisted in configuring virtualized network functions (VNFs) and managing cloud-native workloads.",
        "Gained hands-on experience with telecom-grade systems, cloud orchestration, and Huawei's proprietary platforms."
      ],
      tech: ["Cloud Services", "Cloud Infrastructure", "Packet Switching"]
    },
    {
      company: "Valeo",
      companyUrl: "https://www.valeo.com",
      logo: "/images/logos/Valeo_Logo.svg.png",
      role: "Embedded Software Engineer",
      dates: "Jul 2023 — Nov 2023",
      location: "Cairo, Egypt",
      summary:
        "Developed embedded software for automotive systems with focus on protocol integration, testing, and CI automation.",
      bullets: [
        "Added support for Saleae and PicoScope analyzers in the global integration testing tool.",
        "Built a UI tool for Baby-LIN-II (LIN-bus simulation device) to view, record, and analyze LIN signals.",
        "Developed CI automation tools and scripts with WPF, C#, and Python.",
        "Improved performance and reliability of GUI tools for automotive testing.",
        "Worked with CAN/LIN protocols, conducted validation, and ensured MISRA C compliance."
      ],
      tech: ["Embedded Devices", "Python", "Embedded Software", "WPF"]
    },
    {
      company: "Tekomoro",
      companyUrl: "https://www.linkedin.com/company/tekomoro/",
      logo: "/images/logos/Tekomoro.png",
      role: "Software Engineer",
      dates: "Sep 2022 — Nov 2023",
      location: "Cairo, Egypt",
      summary:
        "Developed autonomous driving software for Low-Speed Autonomous Vehicles using LiDARs, cameras, and IMUs.",
      bullets: [
        "Developed autonomous driving software for Low-Speed Autonomous Vehicles (LSAVs) using LiDARs (mechanical and solid-state), cameras, and IMUs.",
        "Contributed to perception, localization, and path planning modules.",
        "Built and tested a LiDAR-based obstacle detection and tracking system.",
        "Improved navigation accuracy in GPS-denied environments through sensor fusion."
      ],
      tech: ["Embedded Devices", "Autonomous Vehicles", "Embedded Software", "Python", "Cloud Infrastructure"]
    },
    {
      company: "UCCD Mansoura Engineering",
      companyUrl: "https://www.linkedin.com/company/uccd-mansoura-engineering/",
      logo: "/images/logos/UCCD.png",
      role: "Embedded Systems Instructor",
      dates: "Feb 2022 — Feb 2023",
      location: "El Mansoura, Egypt",
      summary:
        "Delivered hands-on training in embedded systems, covering microcontrollers, sensors, and real-time applications.",
      bullets: [
        "Delivered hands-on training in embedded systems, covering microcontrollers, sensors, and real-time applications.",
        "Designed and taught project-based curricula using platforms like Arduino and STM32.",
        "Guided students through practical labs and final projects to build industry-relevant skills.",
        "Helped over 100+ students gain foundational and advanced knowledge in embedded systems."
      ],
      tech: ["Presentation Skills", "Arduino", "C", "Embedded Systems", "Embedded Software"]
    },
    {
      company: "Siemens EDA",
      companyUrl: "https://eda.sw.siemens.com",
      logo: "/images/logos/siemens-ag-logo.svg",
      role: "Embedded Software Engineer",
      dates: "Jul 2022 — Nov 2022",
      location: "Cairo, Egypt",
      summary:
        "Gained hands-on experience with MCU fundamentals, RTOS, AUTOSAR, functional safety, and embedded Linux development.",
      bullets: [
        "Gained hands-on experience with MCU fundamentals, including CPU architecture, memory management, startup processes, linker scripts, compilation flow, and interrupt handling.",
        "Worked with debugging tools to analyze and troubleshoot embedded software.",
        "Explored DevOps practices in embedded systems development, contributing to workflow automation and build processes.",
        "Conducted a deep dive into bootloaders, RTOS fundamentals, and AUTOSAR OS/layered architecture.",
        "Developed understanding of functional safety standards (ISO 26262) and their application in embedded software.",
        "Practiced Embedded Linux development using Buildroot and related tools, gaining exposure to kernel, drivers, and board bring-up workflows."
      ],
      tech: ["Embedded Software", "Embedded Linux", "RTOS", "C++", "AUTOSAR"]
    },
    {
      company: "Mansoura Robotics Club",
      companyUrl: "https://www.mansourarobotics.org/",
      logo: "/images/logos/Mansoura Robotics.png",
      role: "Co-Founder",
      dates: "Feb 2021 — Oct 2022",
      location: "El Mansoura, Egypt",
      summary:
        "Co-founded a student-run robotics club focused on innovation, hands-on learning, and community building.",
      bullets: [
        "Co-founded a student-run robotics club at Mansoura University focused on innovation, hands-on learning, and community building.",
        "Organized 4 major hackathons with a combined attendance of over 4,000 participants.",
        "Established partnerships with multinational companies including MathWorks and Dassault Systèmes.",
        "Led workshops, training sessions, and robotics competitions to promote STEM and practical engineering skills among students."
      ],
      tech: ["Project Management", "Team Leadership", "Presentation Skills", "Event Planning", "Embedded Software"]
    }
  ],
  projects: [
    {
      title: "DeepParse: LLM-Enhanced Log Parsing Framework",
      role: "Project Lead",
      description: "Hybrid log parsing system combining DeepSeek-R1:8B and Drain algorithm achieving 97.6% accuracy across 16 datasets.",
      tech: ["LLMs", "DeepSeek-R1", "NLP", "Python", "Log Parsing"],
      outcomes: "97.6% accuracy across 16 datasets, improved anomaly detection and debugging pipelines through LLM-driven template generation.",
      repo: "",
      demo: "",
      featured: true,
      images: ["/images/projects/deepparse-1.svg", "/images/projects/deepparse-2.svg"],
      details: {
        problem: "Log parsing is critical for debugging but traditional deterministic methods struggle with variable formats and new log types.",
        approach: "Hybrid approach combining deterministic Drain parsing with LLM-driven template generation using DeepSeek-R1:8B for improved accuracy and adaptability.",
        results: "Achieved 97.6% parsing accuracy on 16 diverse datasets, enabling more effective anomaly detection and faster root cause analysis."
      }
    },
    {
      title: "VehiPlus: Embedded Telematics & Driver Assistance Platform",
      role: "Developer",
      description: "Raspberry Pi 4 based real-time diagnostics platform combining OBD-II telemetry, MQTT messaging, YOLO object detection, and ML for driver assistance.",
      tech: ["Raspberry Pi", "OBD-II", "MQTT", "YOLO", "TensorFlow", "MobileNet"],
      outcomes: "Real-time lane departure warnings, collision avoidance alerts, live telemetry monitoring, and OTA update framework for software-defined vehicle platform.",
      repo: "",
      demo: "",
      featured: true,
      images: ["/images/projects/vehicleplus-1.svg", "/images/projects/vehicleplus-2.svg"],
      details: {
        problem: "Vehicle diagnostics and driver assistance systems require real-time processing with edge compute constraints and reliable connectivity.",
        approach: "Built edge ML platform on Raspberry Pi with OBD-II integration for vehicle state, MQTT for cloud connectivity, YOLO for visual perception, and TensorFlow MobileNet for efficient inference.",
        results: "Implemented lane departure detection and collision avoidance alerts with sub-100ms latency, designed OTA update mechanism as proof-of-concept for SDV platform evolution."
      }
    }
  ],
  education: {
    degrees: [
      {
        school: "Queen's University",
        schoolUrl: "https://www.queensu.ca",
        logo: "/images/logos/QueensLogo_colour.png",
        degree: "MASc. Electrical & Computer Engineering",
        year: "2024 – 2025",
        gpa: "4.3/4.3",
        details: "Research focus: Formal Methods, Verification & Validation, Large Language Models, System Modeling, Real-Time Systems"
      },
      {
        school: "Mansoura University",
        schoolUrl: "https://www.mans.edu.eg/en",
        logo: "/images/logos/Mansoura University.png",
        degree: "BEng. Mechatronics Engineering",
        year: "2019 – 2024",
        gpa: "3.80/4.0",
        details: "Excellence with Honours, Top 10 of class, Academic Excellence Scholarship"
      }
    ],
    certifications: [],
    awards: [
      {
        title: "HUAWEI ICT Competition (2024)",
        issuer: "HUAWEI",
        issuerUrl: "https://www.huawei.com",
        details: "First Prize Global (Shenzhen, China) and Grand Prize North Africa Regional (Tunisia) in Cloud Track",
        year: "2024"
      },
      {
        title: "Ideal Student Award",
        issuer: "Mansoura University",
        issuerUrl: "https://www.mans.edu.eg/en",
        details: "Recognition for academic performance and leadership",
        year: "2022"
      }
    ]
  },
  testimonials: [
    {
      quote:
        "During our volunteering activities at the Faculty of Engineering, I witnessed Amir's unwavering work ethic and dedication to excellence. He's an exceptional team player and proficient communicator who readily shares expertise and collaborates toward team objectives. A true tech enthusiast with contagious enthusiasm, and I wholeheartedly recommend him for any role.",
      name: "Hoda Saleh",
      title: "Volunteer Colleague, Faculty of Engineering MU",
      avatar: "/images/avatars/Huda Saleh.png"
    },
    {
      quote:
        "It's difficult to recommend Amir because he has so many outstanding aspects. To sum it up: he's one of the top engineers I've met. Excellent leader, technical skills continuously exceed expectations, eager to learn, and delivers tasks on time without effort. Each point deserves its own recommendation.",
      name: "Khaled Zoheir",
      title: "Former Manager",
      avatar: "/images/avatars/Khaled Zohier.jpg"
    },
    {
      quote:
        "Amir is a highly motivated and hardworking individual, one of the brightest students I've worked with. He consistently delivered tasks on time, solved problems smartly, and performed exceptionally well in technical internships.",
      name: "Abdelrhman Mosad",
      title: "Instructor & Embedded Software Engineer II",
      avatar: "/images/avatars/Abdulrahman Mosad.jpg"
    },
    {
      quote:
        "Amir is the perfect person for the perfect job. As a leader, his priority is always the team. As an instructor, he brings people from nothing to deep knowledge, laying solid foundations and creating well-educated individuals who can solve real-world problems.",
      name: "Mohamed Khalil",
      title: "M.Sc. Mechatronics, Team Colleague",
      avatar: "/images/avatars/Mohamed Khalil.jpg"
    },
    {
      quote:
        "Amir is an excellent team leader with outstanding knowledge. He genuinely supports his team and provides every possible way for them to succeed. A natural mentor and leader who elevates those around him.",
      name: "Mahmoud Ebrahim",
      title: "Former Direct Report, Robotics & Embedded Systems Engineer",
      avatar: "/images/avatars/Mahmoud Ibrahim.jpg"
    },
    {
      quote:
        "Amir is a hardworking team leader with exceptional leadership skills and deep knowledge of embedded systems. He actively shares his expertise with others and creates an environment where team members grow and succeed.",
      name: "Mahmoud Labib",
      title: "Team Colleague, Process Development Engineer",
      avatar: "/images/avatars/Mahmoud Labib.jpg"
    }
  ],
  community: [
    {
      role: "Co-Founder",
      organization: "Mansoura Robotics Club",
      organizationUrl: "https://www.linkedin.com/company/mansoura-robotics-club/",
      details: "Organized 4 hackathons engaging 4,000+ participants in robotics and embedded systems.",
      year: "2022 – 2024"
    },
    {
      role: "HUAWEI ICT Academy Ambassador",
      organization: "HUAWEI",
      organizationUrl: "https://www.huawei.com",
      details: "Promoted ICT education and professional development in emerging markets.",
      year: "2024 – Present"
    }
  ],
  contact: {
    email: "ashetaia01@gmail.com",
    phone: ""
  }
};

export type Profile = typeof profile;
