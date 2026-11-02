import { useState } from "react";
import "./App.css";

const initialValues = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  terms: false,
};

// Ek field ke liye validation rules
function validateField(name, value, allValues) {
  switch (name) {
    case "fullName":
      if (!value.trim()) return "Full name is required.";
      if (value.trim().length < 3) return "Name must be at least 3 characters.";
      if (!/^[A-Za-z ]+$/.test(value.trim()))
        return "Name can contain only letters and spaces.";
      return "";

    case "email":
      if (!value.trim()) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()))
        return "Enter a valid email, like name@example.com.";
      return "";

    case "phone":
      if (!value.trim()) return "Phone number is required.";
      if (!/^[6-9]\d{9}$/.test(value))
        return "Enter a 10-digit mobile number starting with 6, 7, 8 or 9.";
      return "";

    case "password":
      if (!value) return "Password is required.";
      if (value.length < 8) return "Password must be at least 8 characters.";
      if (!/[A-Z]/.test(value)) return "Add at least one uppercase letter.";
      if (!/[a-z]/.test(value)) return "Add at least one lowercase letter.";
      if (!/\d/.test(value)) return "Add at least one number.";
      if (!/[^A-Za-z0-9]/.test(value))
        return "Add at least one special character, like @ or #.";
      return "";

    case "confirmPassword":
      if (!value) return "Please confirm your password.";
      if (value !== allValues.password) return "Passwords do not match.";
      return "";

    case "terms":
      return value ? "" : "You must accept the terms to continue.";

    default:
      return "";
  }
}

function validateAll(values) {
  const errors = {};
  Object.keys(values).forEach((key) => {
    const message = validateField(key, values[key], values);
    if (message) errors[key] = message;
  });
  return errors;
}

export default function App() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    const updated = { ...values, [name]: newValue };
    setValues(updated);

    // Typing ke time hi error update karo (live validation)
    if (touched[name] || touched.__submit) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, newValue, updated),
        // password badalne par confirm password dobara check ho
        ...(name === "password" && touched.confirmPassword
          ? {
              confirmPassword: validateField(
                "confirmPassword",
                updated.confirmPassword,
                updated
              ),
            }
          : {}),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, values[name], values),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allErrors = validateAll(values);
    setErrors(allErrors);
    setTouched({ ...Object.fromEntries(Object.keys(values).map((k) => [k, true])), __submit: true });

    if (Object.keys(allErrors).length === 0) {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitted(false);
    setShowPassword(false);
  };

  const fieldClass = (name) =>
    errors[name] ? "field has-error" : touched[name] && !errors[name] ? "field is-valid" : "field";

  if (submitted) {
    return (
      <main className="page">
        <section className="card success" role="status">
          <h1>Registration complete</h1>
          <p>
            Thanks, <strong>{values.fullName.trim()}</strong>. We have saved
            your details and sent a confirmation to{" "}
            <strong>{values.email.trim()}</strong>.
          </p>
          <button className="btn" onClick={handleReset}>
            Register another student
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="card">
        <header>
          <h1>Create your student account</h1>
          <p className="sub">
            Fill in the details below. Every field is checked as you type.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className={fieldClass("fullName")}>
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="Rahul Sharma"
              value={values.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={!!errors.fullName}
              aria-describedby="fullName-error"
            />
            <p id="fullName-error" className="error">{errors.fullName}</p>
          </div>

          <div className={fieldClass("email")}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="rahul@example.com"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={!!errors.email}
              aria-describedby="email-error"
            />
            <p id="email-error" className="error">{errors.email}</p>
          </div>

          <div className={fieldClass("phone")}>
            <label htmlFor="phone">Mobile number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel"
              placeholder="9876543210"
              value={values.phone}
              onChange={(e) => {
                // sirf digits allow karo
                e.target.value = e.target.value.replace(/\D/g, "");
                handleChange(e);
              }}
              onBlur={handleBlur}
              aria-invalid={!!errors.phone}
              aria-describedby="phone-error"
            />
            <p id="phone-error" className="error">{errors.phone}</p>
          </div>

          <div className={fieldClass("password")}>
            <label htmlFor="password">Password</label>
            <div className="password-row">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={!!errors.password}
                aria-describedby="password-error"
              />
              <button
                type="button"
                className="toggle"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p id="password-error" className="error">{errors.password}</p>
          </div>

          <div className={fieldClass("confirmPassword")}>
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby="confirmPassword-error"
            />
            <p id="confirmPassword-error" className="error">{errors.confirmPassword}</p>
          </div>

          <div className={`${fieldClass("terms")} checkbox`}>
            <label htmlFor="terms">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={values.terms}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-describedby="terms-error"
              />
              I accept the terms and conditions
            </label>
            <p id="terms-error" className="error">{errors.terms}</p>
          </div>

          <button type="submit" className="btn">
            Create account
          </button>
        </form>
      </section>
    </main>
  );
}