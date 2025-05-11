// app/Policyholder/page.tsx

"use client";

import Link from "next/link";
import LoginForm from "../components/LoginForm";

const LoginPage = () => {
  return (
    <div className="policy-container">
      <div className="login-form-container">
        <h1 className="policy-heading">Login</h1>
        <p className="description">Please enter your credentials to log in.</p>

        {/* Render the streamlined LoginForm */}
        <LoginForm />

        <div className="button-group">
          <Link href="/policyholder/signup">
            <button className="cta-button cta-button-login">Sign Up</button>
          </Link>

          <Link href="/">
            <button className="cta-button cta-button-back-home">Back Home</button>
          </Link>
        </div>

        <p className="login-bottom-text">
          <Link href="/policyholder/resetpassword">
            <>Forgot your password? Click here</>
          </Link>{" "}
          to reset it.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
