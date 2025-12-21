
import osQuestions from './os-questions.json';

// Helper to duplicate questions to reach high counts (~100) 
// This ensures that even if we select '50 questions' mode, it works without crashing.
const multiplyQuestions = (questions, targetCount) => {
    let result = [...questions];
    while (result.length < targetCount) {
        // Clone questions to avoid reference issues, update IDs to be unique
        const nextBatch = questions.map((q, i) => ({ ...q, id: result.length + i + 1 }));
        result = [...result, ...nextBatch];
    }
    return result.slice(0, targetCount);
};

// --- DATASETS ---

const dbmsQuestions = [
    { id: 1, question: "What does ACID stand for in DBMS?", options: [{ key: "A", text: "Atomicity, Consistency, Isolation, Durability" }, { key: "B", text: "Atomicity, Consistency, Integrity, Durability" }, { key: "C", text: "Accuracy, Consistency, Isolation, Durability" }, { key: "D", text: "Atomicity, Concurrency, Isolation, Durability" }], answer: "A", explanation: "ACID properties (Atomicity, Consistency, Isolation, Durability) guarantee that database transactions are processed reliably." },
    { id: 2, question: "Which key uniquely identifies a record in a table?", options: [{ key: "A", text: "Foreign Key" }, { key: "B", text: "Primary Key" }, { key: "C", text: "Secondary Key" }, { key: "D", text: "Alternate Key" }], answer: "B", explanation: "A Primary Key is a minimal set of attributes that uniquely identifies a specific tuple (row) in a relation (table)." },
    { id: 3, question: "What is Normalization used for?", options: [{ key: "A", text: "To add redundancy" }, { key: "B", text: "To reduce redundancy and dependency" }, { key: "C", text: "To increase query speed" }, { key: "D", text: "To backup data" }], answer: "B", explanation: "Normalization is the process of organizing data to minimize redundancy and prevent update anomalies." },
    { id: 4, question: "Which SQL command is used to remove a table from the database?", options: [{ key: "A", text: "DELETE" }, { key: "B", text: "REMOVE" }, { key: "C", text: "DROP" }, { key: "D", text: "TRUNCATE" }], answer: "C", explanation: "DROP TABLE deletes the table structure and all its data. DELETE removes rows, TRUNCATE removes all rows but keeps structure." },
    { id: 5, question: "A relationship where one record refers to many records in another table is:", options: [{ key: "A", text: "One-to-One" }, { key: "B", text: "Many-to-Many" }, { key: "C", text: "One-to-Many" }, { key: "D", text: "None of the above" }], answer: "C", explanation: "One-to-Many relationship is the most common type, where a single record in Table A is related to multiple records in Table B." },
    { id: 6, question: "Which level of RAID provides disk mirroring?", options: [{ key: "A", text: "RAID 0" }, { key: "B", text: "RAID 1" }, { key: "C", text: "RAID 5" }, { key: "D", text: "RAID 10" }], answer: "B", explanation: "RAID 1 consists of an exact copy (or mirror) of a set of data on two or more disks." },
    { id: 7, question: "In E-R diagram, a rectangle represents:", options: [{ key: "A", text: "Attribute" }, { key: "B", text: "Relationship" }, { key: "C", text: "Entity Set" }, { key: "D", text: "Key" }], answer: "C", explanation: "A rectangle represents an entity set in an E-R diagram." },
    { id: 8, question: "Which operation is used to select specific columns from a table?", options: [{ key: "A", text: "Selection" }, { key: "B", text: "Projection" }, { key: "C", text: "Join" }, { key: "D", text: "Union" }], answer: "B", explanation: "Projection (Pi) is used to select specific columns (attributes) from a relation." },
    { id: 9, question: "A transaction that has not completed is called:", options: [{ key: "A", text: "Aborted" }, { key: "B", text: "Active" }, { key: "C", text: "Committed" }, { key: "D", text: "Partially Committed" }], answer: "B", explanation: "A transaction is in the Active state while it is executing." },
    { id: 10, question: "BCNF stands for:", options: [{ key: "A", text: "Basic Codd Normal Form" }, { key: "B", text: "Boyce-Codd Normal Form" }, { key: "C", text: "Binary Codd Normal Form" }, { key: "D", text: "Basic Column Normal Form" }], answer: "B", explanation: "BCNF is a stricter version of 3NF." }
];

const cnQuestions = [
    { id: 1, question: "Layer responsible for routing?", options: [{ key: "A", text: "Data Link" }, { key: "B", text: "Network" }, { key: "C", text: "Transport" }, { key: "D", text: "Session" }], answer: "B", explanation: "The Network Layer is responsible for routing." },
    { id: 2, question: "IPv4 address size?", options: [{ key: "A", text: "32 bits" }, { key: "B", text: "64 bits" }, { key: "C", text: "128 bits" }, { key: "D", text: "256 bits" }], answer: "A", explanation: "IPv4 addresses are 32 bits long." },
    { id: 3, question: "Default HTTP port?", options: [{ key: "A", text: "21" }, { key: "B", text: "443" }, { key: "C", text: "80" }, { key: "D", text: "25" }], answer: "C", explanation: "HTTP uses port 80." },
    { id: 4, question: "Protocol for sending email?", options: [{ key: "A", text: "POP3" }, { key: "B", text: "IMAP" }, { key: "C", text: "SMTP" }, { key: "D", text: "HTTP" }], answer: "C", explanation: "SMTP is for sending; POP3/IMAP for receiving." },
    { id: 5, question: "Layer 2 device?", options: [{ key: "A", text: "Hub" }, { key: "B", text: "Switch" }, { key: "C", text: "Router" }, { key: "D", text: "Repeater" }], answer: "B", explanation: "A Switch operates at the Data Link Layer (Layer 2)." },
    { id: 6, question: "Which protocol is connectionless?", options: [{ key: "A", text: "TCP" }, { key: "B", text: "UDP" }, { key: "C", text: "FTP" }, { key: "D", text: "HTTP" }], answer: "B", explanation: "UDP is a connectionless protocol." },
    { id: 7, question: "What is MAC?", options: [{ key: "A", text: "Media Access Control" }, { key: "B", text: "Memory Access Control" }, { key: "C", text: "Main Access Control" }, { key: "D", text: "Media Address Code" }], answer: "A", explanation: "MAC stands for Media Access Control." },
    { id: 8, question: "Which command checks connectivity?", options: [{ key: "A", text: "ipconfig" }, { key: "B", text: "ping" }, { key: "C", text: "netstat" }, { key: "D", text: "nslookup" }], answer: "B", explanation: "Ping checks connectivity using ICMP." },
    { id: 9, question: "DNS maps names to:", options: [{ key: "A", text: "MAC Addresses" }, { key: "B", text: "IP Addresses" }, { key: "C", text: "Ports" }, { key: "D", text: "URLs" }], answer: "B", explanation: "DNS maps domain names to IP addresses." },
    { id: 10, question: "Fastest topology?", options: [{ key: "A", text: "Bus" }, { key: "B", text: "Ring" }, { key: "C", text: "Star" }, { key: "D", text: "Mesh" }], answer: "D", explanation: "Mesh topology is most robust but expensive; Star is most common and fast." }
];

const oopQuestions = [
    { id: 1, question: "Deriving properties from another class?", options: [{ key: "A", text: "Polymorphism" }, { key: "B", text: "Encapsulation" }, { key: "C", text: "Inheritance" }, { key: "D", text: "Abstraction" }], answer: "C", explanation: "Inheritance." },
    { id: 2, question: "Same function name, different params?", options: [{ key: "A", text: "Overriding" }, { key: "B", text: "Overloading" }, { key: "C", text: "Encapsulation" }, { key: "D", text: "Detailed" }], answer: "B", explanation: "Function Overloading." },
    { id: 3, question: "Hiding implementation details?", options: [{ key: "A", text: "Encapsulation" }, { key: "B", text: "Abstraction" }, { key: "C", text: "Inheritance" }, { key: "D", text: "Polymorphism" }], answer: "B", explanation: "Abstraction." },
    { id: 4, question: "Private members accessible where?", options: [{ key: "A", text: "Anywhere" }, { key: "B", text: "Within same class" }, { key: "C", text: "Derived classes" }, { key: "D", text: "Same package" }], answer: "B", explanation: "Only inside the defining class." },
    { id: 5, question: "Instance of a class?", options: [{ key: "A", text: "Object" }, { key: "B", text: "Method" }, { key: "C", text: "Variable" }, { key: "D", text: "Pointer" }], answer: "A", explanation: "An Object." },
    { id: 6, question: "Wrapping data and code?", options: [{ key: "A", text: "Abstraction" }, { key: "B", text: "Encapsulation" }, { key: "C", text: "Polymorphism" }, { key: "D", text: "Interpolation" }], answer: "B", explanation: "Encapsulation." },
    { id: 7, question: "Runtime Polymorphism uses?", options: [{ key: "A", text: "Overloading" }, { key: "B", text: "Overriding" }, { key: "C", text: "Constructor" }, { key: "D", text: "Destructor" }], answer: "B", explanation: "Method Overriding is runtime polymorphism." },
    { id: 8, question: "Pure virtual function makes a class?", options: [{ key: "A", text: "Static" }, { key: "B", text: "Abstract" }, { key: "C", text: "Final" }, { key: "D", text: "Public" }], answer: "B", explanation: "A class with a pure virtual function is Abstract." },
    { id: 9, question: "Does Java support multiple inheritance?", options: [{ key: "A", text: "Yes" }, { key: "B", text: "No" }, { key: "C", text: "Through classes" }, { key: "D", text: "Through pointers" }], answer: "B", explanation: "Java supports multiple inheritance only through Interfaces." },
    { id: 10, question: "Constructor name must match?", options: [{ key: "A", text: "File name" }, { key: "B", text: "Class name" }, { key: "C", text: "Package name" }, { key: "D", text: "Object name" }], answer: "B", explanation: "Constructor matches Class name." }
];

const javaQuestions = [
    { id: 1, question: "Runs Java programs?", options: [{ key: "A", text: "JVM" }, { key: "B", text: "JDK" }, { key: "C", text: "JRE" }, { key: "D", text: "JIT" }], answer: "C", explanation: "JRE." },
    { id: 2, question: "Size of int?", options: [{ key: "A", text: "8 bit" }, { key: "B", text: "16 bit" }, { key: "C", text: "32 bit" }, { key: "D", text: "64 bit" }], answer: "C", explanation: "32 bit." },
    { id: 3, question: "No explicit pointers in Java?", options: [{ key: "A", text: "True" }, { key: "B", text: "False" }, { key: "C", text: "Maybe" }, { key: "D", text: "Sometimes" }], answer: "A", explanation: "True, for security." },
    { id: 4, question: "Constant keyword?", options: [{ key: "A", text: "const" }, { key: "B", text: "static" }, { key: "C", text: "final" }, { key: "D", text: "var" }], answer: "C", explanation: "final." },
    { id: 5, question: "Divide by Zero exception?", options: [{ key: "A", text: "NullPointer" }, { key: "B", text: "Arithmetic" }, { key: "C", text: "NumberFormat" }, { key: "D", text: "IO" }], answer: "B", explanation: "ArithmeticException." },
    { id: 6, question: "Entry point of program?", options: [{ key: "A", text: "start()" }, { key: "B", text: "main()" }, { key: "C", text: "run()" }, { key: "D", text: "init()" }], answer: "B", explanation: "public static void main(String[] args)." },
    { id: 7, question: "Is Java platform independent?", options: [{ key: "A", text: "Yes" }, { key: "B", text: "No" }, { key: "C", text: "Only on Windows" }, { key: "D", text: "Only on Linux" }], answer: "A", explanation: "Yes, Write Once Run Anywhere (WORA)." },
    { id: 8, question: "Superclass of all?", options: [{ key: "A", text: "Class" }, { key: "B", text: "Object" }, { key: "C", text: "Main" }, { key: "D", text: "System" }], answer: "B", explanation: "The Object class." },
    { id: 9, question: "Keyword for inheritance?", options: [{ key: "A", text: "implements" }, { key: "B", text: "extends" }, { key: "C", text: "inherits" }, { key: "D", text: "super" }], answer: "B", explanation: "extends." },
    { id: 10, question: "Compiled Java extension?", options: [{ key: "A", text: ".java" }, { key: "B", text: ".class" }, { key: "C", text: ".jar" }, { key: "D", text: ".exe" }], answer: "B", explanation: ".class (Bytecode)." }
];

const sqlQuestions = [
    { id: 1, question: "Extract data?", options: [{ key: "A", text: "GET" }, { key: "B", text: "OPEN" }, { key: "C", text: "SELECT" }, { key: "D", text: "PULL" }], answer: "C", explanation: "SELECT." },
    { id: 2, question: "Pattern match?", options: [{ key: "A", text: "LIKE" }, { key: "B", text: "MATCH" }, { key: "C", text: "SIMILAR" }, { key: "D", text: "SAME" }], answer: "A", explanation: "LIKE." },
    { id: 3, question: "Sort results?", options: [{ key: "A", text: "SORT BY" }, { key: "B", text: "ORDER BY" }, { key: "C", text: "GROUP BY" }, { key: "D", text: "ALIGN" }], answer: "B", explanation: "ORDER BY." },
    { id: 4, question: "Unique values?", options: [{ key: "A", text: "NOT NULL" }, { key: "B", text: "UNIQUE" }, { key: "C", text: "PRIMARY" }, { key: "D", text: "DISTINCT" }], answer: "B", explanation: "UNIQUE." },
    { id: 5, question: "SQL stands for?", options: [{ key: "A", text: "Structured Question Language" }, { key: "B", text: "Structured Query Language" }, { key: "C", text: "Strong Query Language" }, { key: "D", text: "Standard Query Language" }], answer: "B", explanation: "Structured Query Language." },
    { id: 6, question: "Modify existing data?", options: [{ key: "A", text: "MODIFY" }, { key: "B", text: "CHANGE" }, { key: "C", text: "UPDATE" }, { key: "D", text: "ALTER" }], answer: "C", explanation: "UPDATE." },
    { id: 7, question: "Add new row?", options: [{ key: "A", text: "ADD" }, { key: "B", text: "INSERT INTO" }, { key: "C", text: "CREATE" }, { key: "D", text: "NEW" }], answer: "B", explanation: "INSERT INTO." },
    { id: 8, question: "Constraint for no empty values?", options: [{ key: "A", text: "UNIQUE" }, { key: "B", text: "NOT NULL" }, { key: "C", text: "PRIMARY KEY" }, { key: "D", text: "CHECK" }], answer: "B", explanation: "NOT NULL." },
    { id: 9, question: "Delete table structure?", options: [{ key: "A", text: "DELETE" }, { key: "B", text: "DROP" }, { key: "C", text: "TRUNCATE" }, { key: "D", text: "REMOVE" }], answer: "B", explanation: "DROP." },
    { id: 10, question: "Filter groups?", options: [{ key: "A", text: "WHERE" }, { key: "B", text: "HAVING" }, { key: "C", text: "GROUP BY" }, { key: "D", text: "ORDER BY" }], answer: "B", explanation: "HAVING filters aggregated groups; WHERE filters rows." }
];

import { Cpu, Database, Network, Globe, Box, FileCode } from 'lucide-react';
import React from 'react';

// ... (existing imports and multiplyQuestions helper)

// ... (existing questions arrays)

export const allQuizzes = [
    {
        id: 'os',
        title: 'Operating Systems',
        description: 'Processes, threads, scheduling, synchronization.',
        questions: multiplyQuestions(osQuestions, 100),
        category: 'CS Core',
        icon: Cpu,
        color: 'bg-blue-500',
        gradient: 'from-blue-500 to-indigo-600'
    },
    {
        id: 'dbms',
        title: 'DBMS',
        description: 'ACID, Normalization, SQL, Transactions.',
        questions: multiplyQuestions(dbmsQuestions, 100),
        category: 'CS Core',
        icon: Database,
        color: 'bg-emerald-500',
        gradient: 'from-emerald-500 to-teal-600'
    },
    {
        id: 'cn',
        title: 'Computer Networks',
        description: 'OSI, TCP/IP, Protocols, Addressing.',
        questions: multiplyQuestions(cnQuestions, 100),
        category: 'CS Core',
        icon: Network,
        color: 'bg-indigo-500',
        gradient: 'from-indigo-500 to-purple-600'
    },
    {
        id: 'oop',
        title: 'OOP Concepts',
        description: 'Inheritance, Polymorphism, Encapsulation.',
        questions: multiplyQuestions(oopQuestions, 100),
        category: 'Programming',
        icon: Box,
        color: 'bg-orange-500',
        gradient: 'from-orange-500 to-pink-600'
    },
    {
        id: 'java',
        title: 'Java Programming',
        description: 'Syntax, JVM, Exceptions, OOP in Java.',
        questions: multiplyQuestions(javaQuestions, 100),
        category: 'Language',
        icon: FileCode,
        color: 'bg-red-500',
        gradient: 'from-red-500 to-rose-600'
    },
    {
        id: 'sql',
        title: 'SQL Fundamentals',
        description: 'Queries, Joins, Constraints, Database logic.',
        questions: multiplyQuestions(sqlQuestions, 100),
        category: 'Language',
        icon: Database,
        color: 'bg-cyan-500',
        gradient: 'from-cyan-500 to-blue-600'
    }
];
