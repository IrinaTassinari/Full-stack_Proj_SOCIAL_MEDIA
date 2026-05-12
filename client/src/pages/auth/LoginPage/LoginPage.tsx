import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../../../features/auth/authThunks";
import { resetAuthState } from "../../../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import styles from "./LoginPage.module.css";

function LoginPage() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const isLoading = status === "loading";

  useEffect(() => {
    dispatch(resetAuthState());
  }, [dispatch]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    dispatch(
      loginUser({
        identifier: identifier.trim(),
        password,
      }),
    );
  };

  return (
    <main className={styles.page}>
      <section className={styles.preview} aria-hidden="true">
        <img
          className={styles.previewImage}
          src="/images/Background.png"
          alt=""
        />
      </section>

      <section className={styles.authColumn}>
        <div className={styles.card}>
          <img
            className={styles.logo}
            src="/images/ICHGRAM_logo.png"
            alt="ICHGRAM"
          />

          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              className={styles.input}
              type="text"
              name="identifier"
              placeholder="Username, or email"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              autoComplete="username"
              required
            />

            <input
              className={styles.input}
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            {error && <p className={styles.error}>{error}</p>}

            <button
              className={styles.submitButton}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className={styles.divider}>
            <span />
            <p>OR</p>
            <span />
          </div>

          <Link className={styles.forgotLink} to="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <div className={styles.signupCard}>
          <p>
            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
