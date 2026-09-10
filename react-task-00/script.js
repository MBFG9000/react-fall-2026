// Helper function to output to specific task section
function output(taskId, content) {
    const element = document.getElementById(`${taskId}-output`);
    element.innerHTML += content;
}

// Helper function to create output line
function line(text) {
    return `<div class="output-line">${text}</div>`;
}

// Helper function to create section
function section(title, content) {
    return `<div class="output-section"><h4>${title}</h4>${content}</div>`;
}

// =============================================================================
// TASK 1: Variables and Data Types
// =============================================================================

function task1() {
    let result = '';

    // Create variables for a student
    let name = "Alice Johnson";
    let age = 21;
    let isActive = true;
    let courses = ["Math", "Physics", "Computer Science"];
    let address = {
        city: "Almaty",
        street: "Abay Avenue",
        zipCode: 50000
    };

    // Examples of null and undefined
    let grade = null;  // Intentionally empty
    let middleName;    // Undefined

    result += line(`<strong>Student Data:</strong>`);
    result += line(`name: "${name}" (${typeof name})`);
    result += line(`age: ${age} (${typeof age})`);
    result += line(`isActive: ${isActive} (${typeof isActive})`);
    result += line(`courses: [${courses.join(', ')}] (${typeof courses})`);
    result += line(`address: ${JSON.stringify(address)} (${typeof address})`);
    result += line(`grade: ${grade} (${typeof grade})`);
    result += line(`middleName: ${middleName} (${typeof middleName})`);

    result += line(`<br><strong>Primitive vs Reference:</strong>`);
    result += line(`Primitives: name, age, isActive, grade, middleName`);
    result += line(`Reference values: courses (array), address (object)`);

    // Template literal
    const sentence = `${name} is ${age} years old and is ${isActive ? 'currently' : 'not'} active in ${courses.length} courses.`;
    result += line(`<br><strong>Template Literal:</strong>`);
    result += line(`"${sentence}"`);

    output('task1', result);
}

// =============================================================================
// TASK 2: Arrays
// =============================================================================

function task2() {
    let result = '';
    const numbers = [3, 7, 2, 10, 5];

    result += line(`<strong>Original Array:</strong> [${numbers.join(', ')}]`);

    // Multiply every number by 2
    const doubled = numbers.map(n => n * 2);
    result += line(`<br><strong>Multiply by 2 (map):</strong> [${doubled.join(', ')}]`);

    // Get numbers greater than 5
    const greaterThan5 = numbers.filter(n => n > 5);
    result += line(`<strong>Numbers > 5 (filter):</strong> [${greaterThan5.join(', ')}]`);

    // Find first number greater than 5
    const firstGreater = numbers.find(n => n > 5);
    result += line(`<strong>First number > 5 (find):</strong> ${firstGreater}`);

    // Calculate sum
    const sum = numbers.reduce((acc, n) => acc + n, 0);
    result += line(`<strong>Sum (reduce):</strong> ${sum}`);

    // Check if 10 exists
    const has10 = numbers.includes(10);
    result += line(`<strong>Includes 10 (includes):</strong> ${has10}`);

    // Verify original array is unchanged
    result += line(`<br><strong>Original Array (unchanged):</strong> [${numbers.join(', ')}]`);

    output('task2', result);
}

// =============================================================================
// TASK 3: Arrays of Objects
// =============================================================================

function task3() {
    let result = '';

    const students = [
        { name: "Anna", id: 1, grade: 85 },
        { name: "John", id: 2, grade: 62 },
        { name: "Sara", id: 3, grade: 91 },
        { name: "Mike", id: 4, grade: 55 }
    ];

    result += line(`<strong>Students:</strong> ${JSON.stringify(students, null, 2)}`);

    // Students with grade >= 70
    const passing = students.filter(s => s.grade >= 70);
    result += line(`<br><strong>Students with grade ≥ 70:</strong> ${JSON.stringify(passing)}`);

    // Array of student names
    const names = students.map(s => s.name);
    result += line(`<strong>Student names:</strong> [${names.join(', ')}]`);

    // Student with id = 3
    const student3 = students.find(s => s.id === 3);
    result += line(`<strong>Student with id=3:</strong> ${JSON.stringify(student3)}`);

    // Student with highest grade
    const topStudent = students.reduce((max, student) =>
        student.grade > max.grade ? student : max
    );
    result += line(`<strong>Highest grade:</strong> ${topStudent.name} (${topStudent.grade})`);

    // Average grade
    const avgGrade = students.reduce((sum, s) => sum + s.grade, 0) / students.length;
    result += line(`<strong>Average grade:</strong> ${avgGrade.toFixed(2)}`);

    // Add passed property
    const withPassedStatus = students.map(s => ({
        ...s,
        passed: s.grade >= 70
    }));
    result += line(`<strong>With passed status:</strong> ${JSON.stringify(withPassedStatus, null, 2)}`);

    // Verify originals unchanged
    result += line(`<br><strong>Original objects unchanged:</strong> ${!students[0].hasOwnProperty('passed')}`);

    output('task3', result);
}

// =============================================================================
// TASK 4: Objects
// =============================================================================

function task4() {
    let result = '';

    const user = {
        id: 101,
        name: "Alex",
        age: 25,
        address: {
            city: "Almaty",
            street: "Dostyk Avenue"
        }
    };

    result += line(`<strong>Original user:</strong> ${JSON.stringify(user, null, 2)}`);

    // Read name and city
    result += line(`<br><strong>Name:</strong> ${user.name}`);
    result += line(`<strong>City:</strong> ${user.address.city}`);

    // Change age
    user.age = 26;
    result += line(`<br><strong>After changing age:</strong> ${user.age}`);

    // Add email
    user.email = "alex@example.com";
    result += line(`<strong>After adding email:</strong> ${user.email}`);

    // Remove street
    delete user.address.street;
    result += line(`<strong>After removing street:</strong> ${JSON.stringify(user.address)}`);

    // Destructuring
    const { name, age } = user;
    result += line(`<br><strong>Destructured name and age:</strong> ${name}, ${age}`);

    // Nested destructuring
    const { address: { city } } = user;
    result += line(`<strong>Nested destructuring (city):</strong> ${city}`);

    // Rename during destructuring
    const { name: userName } = user;
    result += line(`<strong>Renamed (name → userName):</strong> ${userName}`);

    output('task4', result);
}

// =============================================================================
// TASK 5: Values and References
// =============================================================================

function task5() {
    let result = '';

    // Part 1: Basic reference
    let original = { name: "Alice", score: 10 };
    let copy = original;

    result += line(`<strong>Original before:</strong> ${JSON.stringify(original)}`);
    result += line(`<strong>Copy before:</strong> ${JSON.stringify(copy)}`);

    copy.score = 20;

    result += line(`<br><strong>After changing copy.score to 20:</strong>`);
    result += line(`Original: ${JSON.stringify(original)} ← Changed!`);
    result += line(`Copy: ${JSON.stringify(copy)}`);
    result += line(`<strong>Why?</strong> Both variables reference the same object in memory.`);

    // Using spread operator
    original = { name: "Alice", score: 10 };
    let spreadCopy = { ...original };
    spreadCopy.score = 30;

    result += line(`<br><strong>Using spread operator:</strong>`);
    result += line(`Original: ${JSON.stringify(original)} ← Unchanged!`);
    result += line(`Spread copy: ${JSON.stringify(spreadCopy)}`);

    // Part 2: Nested objects (shallow copy problem)
    let user = { name: "Alice", address: { city: "Almaty" } };
    let userCopy = { ...user };

    result += line(`<br><strong>Nested object with spread:</strong>`);
    result += line(`User before: ${JSON.stringify(user)}`);

    userCopy.address.city = "Astana";

    result += line(`After changing userCopy.address.city:`);
    result += line(`User: ${JSON.stringify(user)} ← Changed!`);
    result += line(`UserCopy: ${JSON.stringify(userCopy)}`);
    result += line(`<strong>Why?</strong> Spread creates shallow copy - nested objects are still referenced.`);

    // Deep copy solution
    user = { name: "Alice", address: { city: "Almaty" } };
    let deepCopy = JSON.parse(JSON.stringify(user));
    deepCopy.address.city = "Shymkent";

    result += line(`<br><strong>Deep copy using JSON:</strong>`);
    result += line(`User: ${JSON.stringify(user)} ← Unchanged!`);
    result += line(`Deep copy: ${JSON.stringify(deepCopy)}`);

    output('task5', result);
}

// =============================================================================
// TASK 6: Functions
// =============================================================================

function task6() {
    let result = '';

    // Regular function
    function isEven(number) {
        return number % 2 === 0;
    }

    // Arrow function version
    const isEvenArrow = (number) => number % 2 === 0;

    function getFullName(firstName, lastName) {
        return `${firstName} ${lastName}`;
    }

    const calculatePrice = (price, quantity) => price * quantity;

    const calculateDiscount = (price, percent) => price - (price * percent / 100);

    const getMax = (a, b) => a > b ? a : b;

    result += line(`<strong>isEven(4):</strong> ${isEven(4)}`);
    result += line(`<strong>isEvenArrow(7):</strong> ${isEvenArrow(7)}`);
    result += line(`<strong>getFullName("John", "Doe"):</strong> ${getFullName("John", "Doe")}`);
    result += line(`<strong>calculatePrice(50, 3):</strong> ${calculatePrice(50, 3)}`);
    result += line(`<strong>calculateDiscount(100, 20):</strong> ${calculateDiscount(100, 20)}`);
    result += line(`<strong>getMax(15, 23):</strong> ${getMax(15, 23)}`);

    output('task6', result);
}

// =============================================================================
// TASK 7: Functions as Values
// =============================================================================

function task7() {
    let result = '';

    const add = (a, b) => a + b;
    const multiply = (a, b) => a * b;

    const calculate = (a, b, operation) => operation(a, b);

    result += line(`<strong>calculate(5, 3, add):</strong> ${calculate(5, 3, add)}`);
    result += line(`<strong>calculate(5, 3, multiply):</strong> ${calculate(5, 3, multiply)}`);

    // Demonstrating function as value
    const myFunc = add;
    result += line(`<br><strong>Storing function in variable:</strong>`);
    result += line(`myFunc = add`);
    result += line(`myFunc(10, 5) = ${myFunc(10, 5)}`);

    output('task7', result);
}

// =============================================================================
// TASK 8: Scope
// =============================================================================

function task8() {
    let result = '';
    const message = "global";

    result += line(`<strong>Global scope:</strong> message = "${message}"`);

    function testScope() {
        const message = "function";
        result += line(`<strong>Function scope:</strong> message = "${message}"`);

        if (true) {
            const message = "block";
            result += line(`<strong>Block scope:</strong> message = "${message}"`);
        }

        result += line(`<strong>After block (function scope):</strong> message = "${message}"`);
    }

    testScope();
    result += line(`<strong>After function (global scope):</strong> message = "${message}"`);

    // Demonstrating var vs let vs const
    result += line(`<br><strong>Demonstrating var, let, const:</strong>`);

    if (true) {
        var varVariable = "var is function-scoped";
        let letVariable = "let is block-scoped";
        const constVariable = "const is block-scoped";
    }

    result += line(`var outside block: "${varVariable}" ← Accessible!`);
    result += line(`let outside block: Error (not accessible)`);
    result += line(`const outside block: Error (not accessible)`);

    output('task8', result);
}

// =============================================================================
// TASK 9: Closure
// =============================================================================

function task9() {
    let result = '';

    // createCounter
    function createCounter() {
        let count = 0;
        return function() {
            count++;
            return count;
        };
    }

    const counter1 = createCounter();
    const counter2 = createCounter();

    result += line(`<strong>Counter 1:</strong>`);
    result += line(`counter1() = ${counter1()}`);
    result += line(`counter1() = ${counter1()}`);
    result += line(`counter1() = ${counter1()}`);

    result += line(`<br><strong>Counter 2 (independent):</strong>`);
    result += line(`counter2() = ${counter2()}`);
    result += line(`counter2() = ${counter2()}`);

    result += line(`<br><strong>Back to Counter 1:</strong>`);
    result += line(`counter1() = ${counter1()}`);

    // createAdder
    function createAdder(value) {
        return function(num) {
            return num + value;
        };
    }

    const addFive = createAdder(5);
    const addTen = createAdder(10);

    result += line(`<br><strong>createAdder demonstration:</strong>`);
    result += line(`addFive(10) = ${addFive(10)}`);
    result += line(`addFive(20) = ${addFive(20)}`);
    result += line(`addTen(10) = ${addTen(10)}`);
    result += line(`addTen(20) = ${addTen(20)}`);

    output('task9', result);
}

// =============================================================================
// TASK 10: Destructuring, Spread and Rest
// =============================================================================

function task10() {
    let result = '';

    // Array destructuring
    const numbers = [10, 20, 30, 40];
    const [first, second] = numbers;

    result += line(`<strong>Array destructuring:</strong>`);
    result += line(`numbers = [${numbers.join(', ')}]`);
    result += line(`[first, second] = [${first}, ${second}]`);

    // Object destructuring
    const user = { id: 1, name: "Anna", age: 21 };
    const { name, age } = user;

    result += line(`<br><strong>Object destructuring:</strong>`);
    result += line(`user = ${JSON.stringify(user)}`);
    result += line(`{name, age} = {${name}, ${age}}`);

    // Spread with arrays
    const newNumbers = [...numbers, 50];
    result += line(`<br><strong>Add 50 to array using spread:</strong>`);
    result += line(`[...numbers, 50] = [${newNumbers.join(', ')}]`);

    // Spread with objects
    const newUser = { ...user, age: 22 };
    result += line(`<br><strong>Create user with age 22:</strong>`);
    result += line(`{...user, age: 22} = ${JSON.stringify(newUser)}`);

    const userWithEmail = { ...user, email: "anna@example.com" };
    result += line(`<strong>Add email without modifying original:</strong>`);
    result += line(`New user: ${JSON.stringify(userWithEmail)}`);
    result += line(`Original unchanged: ${JSON.stringify(user)}`);

    // Combine arrays
    const arr1 = [1, 2, 3];
    const arr2 = [4, 5, 6];
    const combined = [...arr1, ...arr2];
    result += line(`<br><strong>Combine arrays:</strong>`);
    result += line(`[...arr1, ...arr2] = [${combined.join(', ')}]`);

    // Rest operator in function
    const sum = (...numbers) => numbers.reduce((acc, n) => acc + n, 0);

    result += line(`<br><strong>Rest operator in function:</strong>`);
    result += line(`sum(1, 2) = ${sum(1, 2)}`);
    result += line(`sum(1, 2, 3, 4) = ${sum(1, 2, 3, 4)}`);
    result += line(`sum(5, 10, 15, 20, 25) = ${sum(5, 10, 15, 20, 25)}`);

    output('task10', result);
}

// =============================================================================
// TASK 11: Optional Chaining and Default Values
// =============================================================================

function task11() {
    let result = '';

    const user1 = {
        name: "Alice",
        address: {
            city: "Almaty"
        }
    };

    const user2 = {
        name: "Bob"
        // No address
    };

    result += line(`<strong>User 1:</strong> ${JSON.stringify(user1)}`);
    result += line(`<strong>User 2:</strong> ${JSON.stringify(user2)}`);

    // Without optional chaining (would cause error)
    result += line(`<br><strong>Without optional chaining:</strong>`);
    result += line(`user1.address.city = "${user1.address.city}" ✓`);
    result += line(`user2.address.city = Error! (Cannot read 'city' of undefined)`);

    // With optional chaining
    result += line(`<br><strong>With optional chaining (?.):</strong>`);
    result += line(`user1.address?.city = "${user1.address?.city}" ✓`);
    result += line(`user2.address?.city = "${user2.address?.city}" (undefined, no error!)`);

    // With nullish coalescing
    result += line(`<br><strong>With nullish coalescing (??):</strong>`);
    result += line(`user1.address?.city ?? "City not specified" = "${user1.address?.city ?? "City not specified"}"`);
    result += line(`user2.address?.city ?? "City not specified" = "${user2.address?.city ?? "City not specified"}"`);

    // Comparing || vs ??
    result += line(`<br><strong>Comparing || vs ??:</strong>`);

    const testValues = [0, "", false, null, undefined];

    testValues.forEach(val => {
        const orResult = val || "default";
        const nullishResult = val ?? "default";
        result += line(`${JSON.stringify(val)}: || = "${orResult}", ?? = "${nullishResult}"`);
    });

    result += line(`<br><strong>Key difference:</strong> ?? only treats null/undefined as "missing", while || treats all falsy values (0, "", false) as "missing".`);

    output('task11', result);
}

// =============================================================================
// FINAL TASK: Student Management System
// =============================================================================

function finalTask() {
    let result = '';

    // Create students array
    const students = [
        { id: 1, name: "Emma Wilson", age: 20, grades: [85, 92, 78, 88, 90] },
        { id: 2, name: "Liam Brown", age: 21, grades: [65, 70, 68, 72, 67] },
        { id: 3, name: "Olivia Davis", age: 19, grades: [95, 98, 92, 96, 94] },
        { id: 4, name: "Noah Miller", age: 22, grades: [55, 60, 58, 52, 56] },
        { id: 5, name: "Ava Garcia", age: 20, grades: [88, 85, 90, 87, 89] },
        { id: 6, name: "Sophia Martinez", age: 21, grades: [75, 78, 80, 76, 77] }
    ];

    // Function: getAverage
    const getAverage = (grades) => {
        return grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    };

    // Function: getStudentAverage
    const getStudentAverage = (student) => {
        return getAverage(student.grades);
    };

    // Function: getPassedStudents (average >= 70)
    const getPassedStudents = (students) => {
        return students.filter(student => getStudentAverage(student) >= 70);
    };

    // Function: getStudentNames
    const getStudentNames = (students) => {
        return students.map(student => student.name);
    };

    // Function: findStudent
    const findStudent = (students, id) => {
        return students.find(student => student.id === id);
    };

    // Function: getTopStudent
    const getTopStudent = (students) => {
        return students.reduce((top, student) => {
            return getStudentAverage(student) > getStudentAverage(top) ? student : top;
        });
    };

    // Display results
    result += line(`<strong>Students Database:</strong>`);
    students.forEach(s => {
        result += line(`${s.name} (id: ${s.id}, age: ${s.age}) - grades: [${s.grades.join(', ')}]`);
    });

    result += line(`<br><strong>Function: getAverage([85, 92, 78, 88, 90])</strong>`);
    result += line(`Result: ${getAverage([85, 92, 78, 88, 90]).toFixed(2)}`);

    result += line(`<br><strong>Function: getStudentAverage(Emma Wilson)</strong>`);
    result += line(`Result: ${getStudentAverage(students[0]).toFixed(2)}`);

    const passedStudents = getPassedStudents(students);
    result += line(`<br><strong>Function: getPassedStudents(students)</strong>`);
    result += line(`Result: ${passedStudents.length} students passed`);
    passedStudents.forEach(s => {
        result += line(`  - ${s.name} (avg: ${getStudentAverage(s).toFixed(2)})`);
    });

    const studentNames = getStudentNames(students);
    result += line(`<br><strong>Function: getStudentNames(students)</strong>`);
    result += line(`Result: [${studentNames.join(', ')}]`);

    const foundStudent = findStudent(students, 3);
    result += line(`<br><strong>Function: findStudent(students, 3)</strong>`);
    result += line(`Result: ${foundStudent.name} (avg: ${getStudentAverage(foundStudent).toFixed(2)})`);

    const topStudent = getTopStudent(students);
    result += line(`<br><strong>Function: getTopStudent(students)</strong>`);
    result += line(`Result: ${topStudent.name} with average ${getStudentAverage(topStudent).toFixed(2)}`);

    // Final transformation
    const studentSummaries = students.map(student => ({
        id: student.id,
        name: student.name,
        average: parseFloat(getStudentAverage(student).toFixed(2)),
        passed: getStudentAverage(student) >= 70
    }));

    result += line(`<br><strong>Final Transformation: Student Summaries</strong>`);
    result += line(`<pre>${JSON.stringify(studentSummaries, null, 2)}</pre>`);

    // Verify originals unchanged
    result += line(`<br><strong>Original data unchanged:</strong> ${!students[0].hasOwnProperty('average')} ✓`);

    output('final-task', result);
}

// =============================================================================
// Execute all tasks when page loads
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    task1();
    task2();
    task3();
    task4();
    task5();
    task6();
    task7();
    task8();
    task9();
    task10();
    task11();
    finalTask();
});
