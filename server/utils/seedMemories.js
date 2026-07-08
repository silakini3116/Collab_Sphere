/**
 * seedMemories.js — Seeds ECE Department Photo Memories with demo data
 * Run: node utils/seedMemories.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const MemoryEvent = require('../models/MemoryEvent');
const MemoryPhoto = require('../models/MemoryPhoto');
const User = require('../models/User');

const SEED_DATA = {
  2024: [
    { month: 1, title: 'New Year Celebration', description: 'Welcoming 2024 with joy and enthusiasm. The department hosted a special gathering with games, music, and cultural activities for all students and faculty.', venue: 'College Auditorium', facultyCoordinator: 'Dr. R. Meenakshi', tags: ['celebration', 'new-year', 'cultural'], photos: ['students cheering and celebrating new year', 'faculty addressing the gathering', 'cultural performance on stage', 'group photo of ECE students'] },
    { month: 1, title: 'Guest Lecture on IoT', description: 'Industry expert from Bosch India spoke about Internet of Things, Industry 4.0, and career opportunities in embedded systems.', venue: 'Seminar Hall A', facultyCoordinator: 'Prof. K. Srinivasan', tags: ['technical', 'iot', 'guest-lecture'], photos: ['speaker presenting on IoT architecture', 'students attentively listening', 'Q&A session with the expert'] },
    { month: 2, title: 'Circuit Design Workshop', description: 'Hands-on two-day workshop on PCB design and embedded systems for 2nd and 3rd year students. Participants designed their own boards.', venue: 'Electronics Lab', facultyCoordinator: 'Dr. M. Venkatesan', tags: ['workshop', 'electronics', 'pcb'], photos: ['students working on PCB layouts', 'completed circuit boards', 'faculty demonstrating soldering', 'group testing circuits'] },
    { month: 2, title: 'Alumni Meet 2024', description: 'Annual alumni gathering bringing together graduates from 2015 to 2023. Mentorship sessions, networking, and panel discussions on industry trends.', venue: 'Main Block Terrace', facultyCoordinator: 'Dr. S. Rajalakshmi', tags: ['alumni', 'networking', 'mentorship'], photos: ['alumni group photo', 'panel discussion session', 'mentorship interaction', 'department head addressing alumni'] },
    { month: 3, title: 'Mini Project Expo', description: 'Students from 3rd year showcased their mini projects. Over 30 projects displayed covering AI, IoT, Robotics, and Communication systems. Industry judges evaluated the work.', venue: 'Ground Floor Corridor', facultyCoordinator: 'Prof. P. Annamalai', tags: ['projects', 'expo', 'innovation'], photos: ['students presenting their projects', 'judges evaluating IoT project', 'robotics demonstration', 'award ceremony', 'crowd viewing the exhibition'] },
    { month: 3, title: 'Industrial Visit – BSNL', description: 'Industrial visit to BSNL Telecom Tower to understand real-world communication infrastructure and network management systems.', venue: 'BSNL Regional Office, Chennai', facultyCoordinator: 'Dr. N. Krishnakumar', tags: ['industrial-visit', 'telecom', 'bsnl'], photos: ['students at BSNL telecom tower', 'visiting the control room', 'group photo outside BSNL building', 'engineer explaining systems'] },
    { month: 4, title: 'Antenna Design Competition', description: 'Intercollegiate antenna design competition. 15 teams from 8 colleges participated in designing and testing custom antenna systems.', venue: 'RF Lab', facultyCoordinator: 'Dr. T. Vijayalakshmi', tags: ['competition', 'antenna', 'rf'], photos: ['teams setting up antenna rigs', 'measurement and testing phase', 'winners receiving trophies', 'competition overview'] },
    { month: 5, title: 'Robotics Workshop', description: 'Two-day intensive workshop on Arduino-based robotics. Students built line-following and obstacle-avoiding robots from scratch.', venue: 'Robotics Lab', facultyCoordinator: 'Prof. G. Murugesan', tags: ['robotics', 'arduino', 'workshop'], photos: ['students assembling robots', 'line-following robot demo', 'programming the Arduino boards', 'final robot competition'] },
    { month: 6, title: 'End Semester Celebration', description: 'End of semester get-together featuring cultural programs, an awards ceremony, and a heartfelt farewell to outgoing students.', venue: 'Open Air Theatre', facultyCoordinator: 'Dr. R. Meenakshi', tags: ['celebration', 'cultural', 'farewell'], photos: ['cultural dance performance', 'comedy skit on stage', 'awards distribution', 'batch farewell group photo'] },
    { month: 7, title: 'Internship Experience Sharing', description: 'Students shared their summer internship experiences from companies like Infosys, TCS, DRDO, ISRO, and various startups.', venue: 'Seminar Hall B', facultyCoordinator: 'Prof. K. Srinivasan', tags: ['internship', 'sharing', 'career'], photos: ['student presenting internship work', 'panel of internship speakers', 'interactive Q&A', 'group discussion on career paths'] },
    { month: 8, title: 'National Science Day', description: 'Celebration of National Science Day with science quiz competitions, poster presentations, and innovative model demonstrations.', venue: 'Science Park', facultyCoordinator: 'Dr. M. Venkatesan', tags: ['science-day', 'quiz', 'national'], photos: ['science quiz competition', 'student poster presentations', 'model demonstrations', 'prize distribution ceremony'] },
    { month: 9, title: 'IEEE Chapter Meet', description: 'Monthly IEEE student chapter meeting featuring technical paper presentations, workshop announcements, and networking.', venue: 'Conference Room', facultyCoordinator: 'Prof. P. Annamalai', tags: ['ieee', 'technical', 'presentations'], photos: ['IEEE chapter meeting overview', 'paper presentation session', 'student presenting research', 'chapter executives group photo'] },
    { month: 10, title: 'Hackathon 2024', description: '24-hour department hackathon on the theme "Technology for Rural India". 20 teams competed building real solutions for rural problems.', venue: 'Computer Lab Complex', facultyCoordinator: 'Dr. T. Vijayalakshmi', tags: ['hackathon', 'coding', 'competition'], photos: ['teams coding through the night', 'hackathon opening ceremony', 'final presentations to judges', 'winning team celebration', 'participants at their workstations'] },
    { month: 11, title: 'Final Year Project Expo', description: 'Final year project demonstration to industry panels and faculty. 25 capstone projects presented across domains of VLSI, Signal Processing, IoT, and Embedded Systems.', venue: 'Seminar Hall A & B', facultyCoordinator: 'Dr. N. Krishnakumar', tags: ['final-year', 'projects', 'expo'], photos: ['student presenting final project', 'judges reviewing project', 'VLSI project demonstration', 'signal processing project walkthrough', 'all final year students group photo'] },
    { month: 12, title: 'Farewell & Annual Day', description: 'Grand annual day celebration with cultural programs, departmental awards, and a heartfelt farewell to the graduating batch of 2024.', venue: 'College Auditorium', facultyCoordinator: 'Dr. S. Rajalakshmi', tags: ['farewell', 'annual-day', 'cultural'], photos: ['graduating batch group photo', 'farewell cultural performance', 'HOD addressing the batch', 'award ceremony', 'emotional farewell moments'] },
    { month: 12, title: 'Christmas Celebration', description: 'Department Christmas celebration with Secret Santa, carol singing, cake cutting, and year-end party.', venue: 'Department Common Room', facultyCoordinator: 'Prof. G. Murugesan', tags: ['christmas', 'celebration', 'fun'], photos: ['secret santa exchange', 'carol singing', 'christmas cake cutting', 'students in festive mood'] },
  ],
  2023: [
    { month: 2, title: 'Circuit Debugging Contest', description: 'Students competed to find and fix bugs in complex circuit boards. Tests analytical thinking and hands-on electronics knowledge.', venue: 'Electronics Lab', facultyCoordinator: 'Dr. M. Venkatesan', tags: ['competition', 'circuits', 'electronics'], photos: ['students analyzing circuits', 'debugging session', 'winners announced'] },
    { month: 4, title: 'Spectrum 2023 – Tech Fest', description: 'Annual departmental technical festival featuring paper presentations, project expos, coding contests, and workshops.', venue: 'ECE Department Complex', facultyCoordinator: 'Dr. T. Vijayalakshmi', tags: ['tech-fest', 'spectrum', 'competition'], photos: ['tech fest inauguration', 'paper presentation arena', 'project expo stalls', 'coding competition', 'prize ceremony', 'closing ceremony'] },
    { month: 6, title: 'Signal Processing Workshop', description: 'MATLAB-based workshop covering digital signal processing, filtering, and FFT analysis. Hands-on practice with real signals.', venue: 'Signal Processing Lab', facultyCoordinator: 'Prof. P. Annamalai', tags: ['workshop', 'signal-processing', 'matlab'], photos: ['MATLAB workshop session', 'students working on signal analysis', 'faculty explaining FFT'] },
    { month: 8, title: 'Smart India Hackathon Prep', description: 'Internal hackathon to prepare teams for Smart India Hackathon 2023. Teams solved real government problem statements.', venue: 'Innovation Lab', facultyCoordinator: 'Dr. N. Krishnakumar', tags: ['hackathon', 'sih', 'innovation'], photos: ['team presentations', 'judges evaluating prototypes', 'winning team photo'] },
    { month: 11, title: 'Alumni Mentorship Day', description: 'One-day mentorship event with alumni from IITs, IIMs, and top companies guiding students on career and higher studies.', venue: 'Seminar Hall A', facultyCoordinator: 'Dr. S. Rajalakshmi', tags: ['alumni', 'mentorship', 'career'], photos: ['mentorship sessions', 'alumni panel discussion', 'one-on-one guidance sessions'] },
  ],
  2025: [
    { month: 1, title: 'New Year Tech Talk', description: 'Department kick-off for 2025 with talks on emerging technologies: 5G, AI chips, and quantum computing roadmap.', venue: 'Auditorium', facultyCoordinator: 'Prof. K. Srinivasan', tags: ['tech-talk', 'new-year', '5g'], photos: ['speaker presenting 5G future', 'students engaged in discussion', 'group photo'] },
    { month: 3, title: 'VLSI Design Workshop', description: 'Comprehensive workshop on VLSI design flow using Cadence tools. Students designed and simulated CMOS circuits.', venue: 'VLSI Lab', facultyCoordinator: 'Dr. T. Vijayalakshmi', tags: ['vlsi', 'workshop', 'cadence'], photos: ['VLSI lab session', 'circuit simulation on screen', 'students at workstations', 'completed CMOS designs'] },
    { month: 4, title: 'National Level Paper Presentation', description: 'National level technical paper presentation competition. Teams from 20+ colleges participated in topics across ECE domains.', venue: 'Seminar Hall Complex', facultyCoordinator: 'Dr. R. Meenakshi', tags: ['paper-presentation', 'national', 'competition'], photos: ['presentation stage setup', 'team presenting paper', 'judges evaluating', 'winners group photo'] },
    { month: 6, title: 'Industry Collaboration Day', description: 'Companies like Texas Instruments, Qualcomm, and HCL visited the department for collaboration talks and student interaction.', venue: 'Board Room', facultyCoordinator: 'Dr. M. Venkatesan', tags: ['industry', 'collaboration', 'placement'], photos: ['industry reps meeting faculty', 'student interaction session', 'MoU signing ceremony', 'campus tour for industry visitors'] },
    { month: 9, title: 'Spectrum 2025 – Annual Tech Fest', description: 'Bigger and better edition of the annual tech festival with 15 events, 500+ participants, and ₹1 lakh prize pool.', venue: 'ECE Department & Auditorium', facultyCoordinator: 'Dr. N. Krishnakumar', tags: ['tech-fest', 'spectrum', 'annual'], photos: ['grand inauguration', 'robotics arena', 'hackathon hall', 'cultural night', 'prize distribution', 'closing ceremony'] },
  ],
  2026: [
    { month: 1, title: 'Orientation & Welcome 2026', description: 'Welcome program for new batch of students. Introduction to department, labs, clubs, and opportunities.', venue: 'Auditorium', facultyCoordinator: 'Dr. S. Rajalakshmi', tags: ['orientation', 'welcome', 'freshers'], photos: ['new batch orientation', 'HOD addressing freshers', 'lab tour', 'group photo'] },
    { month: 2, title: 'AI in Electronics Workshop', description: 'Workshop exploring the intersection of Artificial Intelligence and Electronic systems — edge AI, TinyML, and neural processors.', venue: 'Innovation Lab', facultyCoordinator: 'Prof. G. Murugesan', tags: ['ai', 'workshop', 'tinyml'], photos: ['AI workshop session', 'students working on AI models', 'edge device demonstration'] },
    { month: 3, title: 'Research Paper Writing Boot Camp', description: 'Two-day boot camp on academic writing, IEEE paper format, literature review, and research methodology for 4th year students.', venue: 'Seminar Hall B', facultyCoordinator: 'Prof. K. Srinivasan', tags: ['research', 'paper-writing', 'academic'], photos: ['writing workshop session', 'faculty reviewing drafts', 'student presentations'] },
  ],
};

async function seedMemories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create a seed user (admin)
    let seedUser = await User.findOne({ role: 'admin' });
    if (!seedUser) {
      seedUser = await User.findOne({ role: 'teacher' });
    }
    if (!seedUser) {
      seedUser = await User.findOne();
    }
    if (!seedUser) {
      console.log('❌ No users found. Please register at least one user first.');
      process.exit(1);
    }

    console.log(`📧 Using user: ${seedUser.name} (${seedUser.role}) as event creator`);

    let totalEvents = 0;
    let totalPhotos = 0;

    for (const [yearStr, events] of Object.entries(SEED_DATA)) {
      const year = parseInt(yearStr);
      const existingCount = await MemoryEvent.countDocuments({ academicYear: year });
      if (existingCount > 0) {
        console.log(`⏩ Skipping ${year} — ${existingCount} events already exist`);
        continue;
      }

      console.log(`\n📅 Seeding ${year}...`);

      for (const evt of events) {
        // Create event
        const eventDate = new Date(year, evt.month - 1, Math.floor(Math.random() * 20) + 5);
        const event = new MemoryEvent({
          title: evt.title,
          description: evt.description,
          date: eventDate,
          venue: evt.venue,
          academicYear: year,
          month: evt.month,
          facultyCoordinator: evt.facultyCoordinator,
          tags: evt.tags,
          coverImage: `https://picsum.photos/seed/${evt.title.replace(/\s/g, '').toLowerCase()}${year}/800/500`,
          createdBy: seedUser._id,
          isApproved: true,
        });
        await event.save();
        totalEvents++;

        // Create demo photos for this event
        const photoCaptions = evt.photos || [];
        for (let i = 0; i < photoCaptions.length; i++) {
          const seed = `${event._id.toString().slice(-4)}${i}`;
          const photo = new MemoryPhoto({
            eventId: event._id,
            userId: seedUser._id,
            imageUrl: `https://picsum.photos/seed/${seed}/800/600`,
            caption: photoCaptions[i],
            tags: evt.tags,
            location: evt.venue,
            visibility: 'public',
            isApproved: true,
            likes: Math.random() > 0.3 ? [seedUser._id] : [],
          });
          await photo.save();
          totalPhotos++;
        }

        process.stdout.write(`  ✓ ${evt.title} (${photoCaptions.length} photos)\n`);
      }
    }

    console.log(`\n🎉 Seeding complete!`);
    console.log(`   📅 Events created: ${totalEvents}`);
    console.log(`   📸 Photos created: ${totalPhotos}`);
    console.log('\nYou can now browse the Memories module in the app.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seedMemories();
