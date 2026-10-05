interface FormFields {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors extends Partial<FormFields> {}

// ── DOM refs ─────────────────────────────────────────────
const form = document.getElementById('register-form') as HTMLFormElement;
const btn = document.getElementById('register-btn') as HTMLButtonElement;
const btnText = document.getElementById('btn-text') as HTMLSpanElement;
const btnSpinner = document.getElementById('btn-spinner') as HTMLSpanElement;

const fields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'] as const;
type FieldName = typeof fields[number];

function getInput(name: FieldName): HTMLInputElement {
  return document.getElementById(name) as HTMLInputElement;
}

function getErrorEl(name: FieldName): HTMLSpanElement {
  return document.getElementById(`${name}-error`) as HTMLSpanElement;
}

// ── Validation ────────────────────────────────────────────
function validate(data: FormFields): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.firstName.trim()) errors.firstName = 'First name is required.';
  if (!data.lastName.trim())  errors.lastName  = 'Last name is required.';

  if (!data.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!data.password) {
    errors.password = 'Password is required.';
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

// ── Display helpers ───────────────────────────────────────
function setError(name: FieldName, message: string): void {
  const input = getInput(name);
  const errorEl = getErrorEl(name);
  input.classList.add('is-error');
  errorEl.textContent = message;
}

function clearError(name: FieldName): void {
  const input = getInput(name);
  const errorEl = getErrorEl(name);
  input.classList.remove('is-error');
  errorEl.textContent = '';
}

function clearAllErrors(): void {
  fields.forEach(clearError);
}

// Clear per-field error on input
fields.forEach((name) => {
  getInput(name).addEventListener('input', () => clearError(name));
});

// ── Loading state ─────────────────────────────────────────
function setLoading(loading: boolean): void {
  btn.disabled = loading;
  btnText.textContent = loading ? 'Creating account…' : 'Create account';
  btnSpinner.hidden = !loading;
}

// ── Submit ────────────────────────────────────────────────
form.addEventListener('submit', async (e: Event) => {
  e.preventDefault();

  const data: FormFields = {
    firstName:       getInput('firstName').value,
    lastName:        getInput('lastName').value,
    email:           getInput('email').value,
    password:        getInput('password').value,
    confirmPassword: getInput('confirmPassword').value,
  };

  clearAllErrors();

  const errors = validate(data);
  if (Object.keys(errors).length > 0) {
    (Object.entries(errors) as [FieldName, string][]).forEach(([name, msg]) => setError(name, msg));
    return;
  }

  setLoading(true);
  try {
    // TODO: replace with your real registration API call
    await new Promise<void>((resolve) => setTimeout(resolve, 900));
    window.location.href = '/login.html'; // redirect after successful registration
  } catch (err) {
    console.error('Registration failed:', err);
    // TODO: show a global error banner here
  } finally {
    setLoading(false);
  }
});
