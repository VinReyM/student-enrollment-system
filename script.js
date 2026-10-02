const form = document.getElementById("enrollForm");
const tableBody = document.getElementById("tableBody");
const successMsg = document.getElementById("successMsg");
const courseSelect = document.getElementById("course");
const majorField = document.getElementById("majorField");

const students = [];
const NAME_PATTERN = /^[A-Za-z][A-Za-z\s.'-]*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const get = (id) => document.getElementById(id);
const val = (id) => get(id).value.trim();

function setError(id, message) {
  get(id + "Error").textContent = message;
  get(id).classList.toggle("invalid", Boolean(message));
}

function clearError(id) { setError(id, ""); }

// Required name check; optional ones only validate when filled in
function checkText(id, label, min, required) {
  const v = val(id);
  if (!v) return required ? `${label} is required.` : "";
  if (v.length < min) return `${label} must be at least ${min} characters.`;
  if (!NAME_PATTERN.test(v)) return `${label} can only have letters, spaces, periods, hyphens, and apostrophes.`;
  return "";
}

function validate() {
  const errors = {};

  const id = val("studentId");
  if (!id) errors.studentId = "Student ID is required.";
  else if (!/^\d+$/.test(id)) errors.studentId = "Student ID can only have numbers.";
  else if (id.length < 5) errors.studentId = "Student ID must be at least 5 digits.";
  else if (students.some((s) => s.id === id)) errors.studentId = "This Student ID is already enrolled.";

  errors.prefix = checkText("prefix", "Prefix", 2, false);
  errors.firstName = checkText("firstName", "First name", 3, true);
  errors.middleName = checkText("middleName", "Middle name", 2, false);
  errors.lastName = checkText("lastName", "Last name", 2, true);
  errors.suffix = checkText("suffix", "Suffix", 2, false);

  const email = val("email");
  if (!email) errors.email = "Email is required.";
  else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email, like name@example.com.";

  if (!val("course")) errors.course = "Select a course.";
  if (val("course") === "BSIT" && !val("major")) errors.major = "Select a BSIT major.";
  if (!val("year")) errors.year = "Select a year level.";

  return errors;
}

const fields = ["studentId", "prefix", "firstName", "middleName", "lastName", "suffix", "email", "course", "major", "year"];

// Clear errors as the user types or changes a field
fields.forEach((id) => {
  const el = get(id);
  el.addEventListener("input", () => { clearError(id); successMsg.textContent = ""; });
  el.addEventListener("change", () => clearError(id));
});

// Show the major dropdown only for BSIT
courseSelect.addEventListener("change", () => {
  const isBSIT = courseSelect.value === "BSIT";
  majorField.hidden = !isBSIT;
  if (!isBSIT) { get("major").value = ""; clearError("major"); }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  successMsg.textContent = "";

  const errors = validate();
  fields.forEach((id) => setError(id, errors[id] || ""));
  if (Object.values(errors).some(Boolean)) return;

  const parts = [val("prefix"), val("firstName"), val("middleName"), val("lastName"), val("suffix")];
  const course = val("course");

  students.push({
    id: val("studentId"),
    name: parts.filter(Boolean).join(" "),
    email: val("email"),
    course: course === "BSIT" ? `BSIT - ${val("major")}` : course,
    year: val("year"),
  });

  render();
  successMsg.textContent = `${parts[1]} was enrolled successfully.`;
  form.reset();
  majorField.hidden = true;
});

function render() {
  tableBody.innerHTML = "";
  if (students.length === 0) {
    tableBody.innerHTML = '<tr class="empty"><td colspan="6">No students enrolled yet. Fill in the form above to add one.</td></tr>';
    return;
  }
  students.forEach((s, i) => {
    const tr = document.createElement("tr");
    [s.id, s.name, s.email, s.course, s.year].forEach((text) => {
      const td = document.createElement("td");
      td.textContent = text; // textContent keeps user input from running as HTML
      tr.appendChild(td);
    });
    const td = document.createElement("td");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "delete-btn";
    btn.textContent = "Delete";
    btn.setAttribute("aria-label", `Delete ${s.name}`);
    btn.addEventListener("click", () => { students.splice(i, 1); render(); });
    td.appendChild(btn);
    tr.appendChild(td);
    tableBody.appendChild(tr);
  });
}
