// app/policy-holder/login.tsx

"use client";

import Link from "next/link";
import LoginForm from "../components/LoginForm";

const LoginPage = () => {
  return (
    <div className="policy-container">
      <div className="form-container">
        <h1 className="policy-heading">Login to Your Account</h1>
        <p className="description">Please enter your credentials to log in.</p>

        <div className="form-content">
          {/* LoginForm Component */}
          <LoginForm />

          <div className="button-group">
            <Link href="/policyholder/signup">
              <button className="cta-button signup small-button">Sign Up</button>
            </Link>

            <Link href="/">
              <button className="cta-button back-home small-button">Back Home</button>
            </Link>
          </div>
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
