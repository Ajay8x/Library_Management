require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('../models/Book');

const books = [
    {
        serial: 'SN001',
        bookname: 'Introduction to Algorithms',
        bookaudor: 'Thomas H. Cormen',
        bookpub: 'MIT Press',
        branch: 'CS',
        bookprice: 850,
        bookquantity: 10,
        bookava: 8,
        bookrent: 2,
        bookpic: 'https://images.unsplash.com/photo-1515879218367-8466d910auj7?w=400',
        bookdetail: 'A comprehensive textbook covering a broad range of algorithms in depth. It is widely used as a textbook for algorithms courses at universities worldwide.'
    },
    {
        serial: 'SN002',
        bookname: 'Clean Code',
        bookaudor: 'Robert C. Martin',
        bookpub: 'Pearson Education',
        branch: 'CS',
        bookprice: 550,
        bookquantity: 8,
        bookava: 5,
        bookrent: 3,
        bookpic: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
        bookdetail: 'A handbook of agile software craftsmanship. Learn to write clean, maintainable code that is easy to understand and modify.'
    },
    {
        serial: 'SN003',
        bookname: 'Data Structures Using C',
        bookaudor: 'Reema Thareja',
        bookpub: 'Oxford University Press',
        branch: 'CS',
        bookprice: 420,
        bookquantity: 12,
        bookava: 10,
        bookrent: 2,
        bookpic: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
        bookdetail: 'Covers all fundamental data structures like arrays, linked lists, stacks, queues, trees, and graphs with C programming implementations.'
    },
    {
        serial: 'SN004',
        bookname: 'Computer Networks',
        bookaudor: 'Andrew S. Tanenbaum',
        bookpub: 'Pearson Education',
        branch: 'IT',
        bookprice: 700,
        bookquantity: 6,
        bookava: 4,
        bookrent: 2,
        bookpic: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
        bookdetail: 'A classic textbook on computer networking covering the OSI model, TCP/IP protocols, network security, and modern networking concepts.'
    },
    {
        serial: 'SN005',
        bookname: 'Operating System Concepts',
        bookaudor: 'Abraham Silberschatz',
        bookpub: 'Wiley Publications',
        branch: 'CS',
        bookprice: 650,
        bookquantity: 7,
        bookava: 5,
        bookrent: 2,
        bookpic: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400',
        bookdetail: 'Covers process management, memory management, file systems, and I/O systems. Essential for understanding how modern operating systems work.'
    },
    {
        serial: 'SN006',
        bookname: 'Database Management Systems',
        bookaudor: 'Raghu Ramakrishnan',
        bookpub: 'McGraw Hill',
        branch: 'IT',
        bookprice: 580,
        bookquantity: 9,
        bookava: 7,
        bookrent: 2,
        bookpic: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400',
        bookdetail: 'A comprehensive guide to database systems including relational algebra, SQL, normalization, transaction management, and query optimization.'
    },
    {
        serial: 'SN007',
        bookname: 'Artificial Intelligence: A Modern Approach',
        bookaudor: 'Stuart Russell & Peter Norvig',
        bookpub: 'Pearson Education',
        branch: 'CS',
        bookprice: 950,
        bookquantity: 5,
        bookava: 3,
        bookrent: 2,
        bookpic: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
        bookdetail: 'The leading textbook in Artificial Intelligence covering intelligent agents, search algorithms, machine learning, natural language processing, and robotics.'
    },
    {
        serial: 'SN008',
        bookname: 'Engineering Mathematics',
        bookaudor: 'B.S. Grewal',
        bookpub: 'Khanna Publishers',
        branch: 'Maths',
        bookprice: 480,
        bookquantity: 15,
        bookava: 12,
        bookrent: 3,
        bookpic: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
        bookdetail: 'Covers differential calculus, integral calculus, differential equations, linear algebra, probability and statistics for engineering students.'
    },
    {
        serial: 'SN009',
        bookname: 'Digital Electronics',
        bookaudor: 'Morris Mano',
        bookpub: 'Pearson Education',
        branch: 'ECE',
        bookprice: 520,
        bookquantity: 8,
        bookava: 6,
        bookrent: 2,
        bookpic: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
        bookdetail: 'Fundamentals of digital logic design including Boolean algebra, combinational and sequential circuits, registers, counters, and memory units.'
    },
    {
        serial: 'SN010',
        bookname: 'Signals and Systems',
        bookaudor: 'Alan V. Oppenheim',
        bookpub: 'PHI Learning',
        branch: 'ECE',
        bookprice: 600,
        bookquantity: 6,
        bookava: 4,
        bookrent: 2,
        bookpic: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400',
        bookdetail: 'Covers continuous-time and discrete-time signals, Fourier series, Fourier transform, Laplace transform, and Z-transform with practical applications.'
    },
    {
        serial: 'SN011',
        bookname: 'Theory of Machines',
        bookaudor: 'S.S. Rattan',
        bookpub: 'Tata McGraw Hill',
        branch: 'ME',
        bookprice: 475,
        bookquantity: 7,
        bookava: 5,
        bookrent: 2,
        bookpic: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=400',
        bookdetail: 'A thorough study of mechanisms, kinematics, dynamics of machines, governors, gyroscopes, and balancing of rotating and reciprocating masses.'
    },
    {
        serial: 'SN012',
        bookname: 'Fluid Mechanics',
        bookaudor: 'R.K. Bansal',
        bookpub: 'Laxmi Publications',
        branch: 'ME',
        bookprice: 510,
        bookquantity: 6,
        bookava: 4,
        bookrent: 2,
        bookpic: 'https://images.unsplash.com/photo-1505685296765-3a2736de412f?w=400',
        bookdetail: 'Covers fluid properties, fluid statics, fluid kinematics, dynamics of fluid flow, dimensional analysis, boundary layer theory, and turbomachinery.'
    },
    {
        serial: 'SN013',
        bookname: 'Strength of Materials',
        bookaudor: 'R.K. Rajput',
        bookpub: 'S. Chand Publishing',
        branch: 'CE',
        bookprice: 440,
        bookquantity: 9,
        bookava: 7,
        bookrent: 2,
        bookpic: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
        bookdetail: 'Comprehensive coverage of stress, strain, bending moments, shear force diagrams, torsion, columns, and deflection of beams for civil engineering students.'
    },
    {
        serial: 'SN014',
        bookname: 'Web Development with Node.js',
        bookaudor: 'Ethan Brown',
        bookpub: "O'Reilly Media",
        branch: 'IT',
        bookprice: 680,
        bookquantity: 5,
        bookava: 3,
        bookrent: 2,
        bookpic: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400',
        bookdetail: 'A practical guide to building web applications using Node.js, Express, MongoDB, and modern JavaScript. Covers RESTful APIs, authentication, and deployment.'
    },
    {
        serial: 'SN015',
        bookname: 'Python Programming',
        bookaudor: 'Mark Lutz',
        bookpub: "O'Reilly Media",
        branch: 'CS',
        bookprice: 720,
        bookquantity: 10,
        bookava: 7,
        bookrent: 3,
        bookpic: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400',
        bookdetail: 'An in-depth introduction to the Python programming language covering core types, functions, modules, classes, exceptions, and advanced topics like decorators and generators.'
    },
    {
        serial: 'SN016',
        bookname: 'Machine Learning',
        bookaudor: 'Tom M. Mitchell',
        bookpub: 'McGraw Hill',
        branch: 'CS',
        bookprice: 800,
        bookquantity: 4,
        bookava: 2,
        bookrent: 2,
        bookpic: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400',
        bookdetail: 'Foundational text on machine learning covering decision trees, neural networks, Bayesian learning, genetic algorithms, and reinforcement learning techniques.'
    },
    {
        serial: 'SN017',
        bookname: 'Discrete Mathematics',
        bookaudor: 'Kenneth H. Rosen',
        bookpub: 'McGraw Hill',
        branch: 'Maths',
        bookprice: 560,
        bookquantity: 8,
        bookava: 6,
        bookrent: 2,
        bookpic: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
        bookdetail: 'Covers logic, sets, relations, functions, graph theory, combinatorics, recurrence relations, and number theory essential for computer science students.'
    },
    {
        serial: 'SN018',
        bookname: 'Control Systems Engineering',
        bookaudor: 'Norman S. Nise',
        bookpub: 'Wiley Publications',
        branch: 'ECE',
        bookprice: 690,
        bookquantity: 5,
        bookava: 3,
        bookrent: 2,
        bookpic: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
        bookdetail: 'Comprehensive coverage of control system analysis and design including transfer functions, state-space representation, stability analysis, and frequency response methods.'
    },
    {
        serial: 'SN019',
        bookname: 'Engineering Physics',
        bookaudor: 'H.K. Malik & A.K. Singh',
        bookpub: 'Tata McGraw Hill',
        branch: 'Physics',
        bookprice: 380,
        bookquantity: 11,
        bookava: 9,
        bookrent: 2,
        bookpic: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400',
        bookdetail: 'Covers interference, diffraction, polarization, laser, fiber optics, quantum mechanics, semiconductor physics, and superconductivity for first-year engineering students.'
    },
    {
        serial: 'SN020',
        bookname: 'Software Engineering',
        bookaudor: 'Roger S. Pressman',
        bookpub: 'McGraw Hill',
        branch: 'IT',
        bookprice: 620,
        bookquantity: 7,
        bookava: 5,
        bookrent: 2,
        bookpic: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
        bookdetail: 'A practitioner\'s approach to software engineering covering SDLC models, requirement analysis, software design, testing, project management, and agile methodologies.'
    }
];

async function seedBooks() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if books already exist
        const count = await Book.countDocuments();
        if (count >= 20) {
            console.log(`Already ${count} books in database. Skipping seed.`);
            process.exit(0);
        }

        const result = await Book.insertMany(books);
        console.log(`✅ Successfully added ${result.length} books!`);
        
        result.forEach((b, i) => {
            console.log(`  ${i + 1}. ${b.bookname} (${b.serial}) - ${b.branch}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
}

seedBooks();
