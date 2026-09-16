// 🧩 PROBLEM–01: buildSchoolSystem()

// Logic: This function builds a school management system using ES6 classes.
// It implements a class hierarchy with Person as base, Student and Teacher
// as subclasses. The school API manages students and teachers.


function buildSchoolSystem(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.schoolName !== 'string' ||
        typeof config.maxStudents !== 'number' ||
        typeof config.passMark !== 'number'
    ) {
        return "Invalid Input";
    }
    if (config.maxStudents <= 0) {
        return "Invalid Input";
    }

    // --- STEP 2: DEFINE PERSON CLASS ---
    class Person {
        constructor(name, age) {
            this.name = name;
            this.age = age;
        }

        getInfo() {
            return `Name: ${this.name}, Age: ${this.age}`;
        }
    }

    // --- STEP 3: DEFINE STUDENT CLASS ---
    class Student extends Person {
        constructor(name, age, studentId, marks) {
            super(name, age);
            this.studentId = studentId;
            this.marks = marks || [];
        }

        getAverage() {
            if (this.marks.length === 0) return 0;
            const sum = this.marks.reduce((a, b) => a + b, 0);
            return Math.round(sum / this.marks.length);
        }

        getStatus() {
            return this.getAverage() >= config.passMark ? "Pass" : "Fail";
        }

        getInfo() {
            return `Student: ${this.name}, Age: ${this.age}, ID: ${this.studentId}, Avg: ${this.getAverage()}`;
        }
    }

    // --- STEP 4: DEFINE TEACHER CLASS ---
    class Teacher extends Person {
        constructor(name, age, subject, salary) {
            super(name, age);
            this.subject = subject;
            this.salary = salary;
        }

        getSalaryInfo() {
            return `Teacher: ${this.name}, Subject: ${this.subject}, Salary: ${this.salary}`;
        }

        getInfo() {
            return `Teacher: ${this.name}, Age: ${this.age}, Subject: ${this.subject}`;
        }
    }

    // --- STEP 5: INITIALIZE SCHOOL STATE ---
    const students = new Map(); // studentId -> Student
    const teachers = []; // Array of Teacher

    // --- STEP 6: DEFINE ADDSTUDENT ---
    function addStudent(name, age, studentId, marks) {
        if (students.size >= config.maxStudents) {
            return "Max Students Reached";
        }
        if (typeof name !== 'string' || typeof age !== 'number' ||
            typeof studentId !== 'string' || !Array.isArray(marks)) {
            return "Invalid Input";
        }
        if (students.has(studentId)) {
            return "Student ID Exists";
        }
        const student = new Student(name, age, studentId, marks);
        students.set(studentId, student);
        return student;
    }

    // --- STEP 7: DEFINE ADTEACHER ---
    function addTeacher(name, age, subject, salary) {
        if (typeof name !== 'string' || typeof age !== 'number' ||
            typeof subject !== 'string' || typeof salary !== 'number') {
            return "Invalid Input";
        }
        const teacher = new Teacher(name, age, subject, salary);
        teachers.push(teacher);
        return teacher;
    }

    // --- STEP 8: DEFINE GETSTUDENT ---
    function getStudent(studentId) {
        return students.get(studentId) || null;
    }

    // --- STEP 9: DEFINE GETREPORT ---
    function getReport() {
        let passCount = 0;
        let failCount = 0;
        for (const student of students.values()) {
            if (student.getStatus() === "Pass") passCount++;
            else failCount++;
        }
        return {
            totalStudents: students.size,
            totalTeachers: teachers.length,
            passCount,
            failCount
        };
    }

    // --- STEP 10: RETURN API ---
    return {
        addStudent,
        addTeacher,
        getStudent,
        getReport
    };
}


// --- EXAMPLE USAGE ---
const school = buildSchoolSystem({ schoolName: "ProtoSchool", maxStudents: 100, passMark: 50 });

school.addStudent("Rahim", 16, "S001", [80, 70, 90]);
school.addStudent("Karim", 15, "S002", [40, 35, 45]);
school.addTeacher("Mr. Hasan", 35, "Math", 50000);

console.log(school.getStudent("S001").getInfo());
console.log(school.getStudent("S002").getStatus());
console.log(school.getReport());

// --- Invalid Input ---
console.log(buildSchoolSystem("invalid")); // "Invalid Input"