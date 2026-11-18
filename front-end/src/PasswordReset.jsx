
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './App.css'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      setMessage(data.message)
    } catch {
      setMessage('Unable to connect to server.')
    }
  }

  return (
    <div className="page">
      <div className="form-box">
        <h1>MapMaker</h1>
        <h2>Forgot Password?</h2>
        <p>Enter your email to reset your password.</p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          <button type="submit">Reset Password</button>
        </form>

        {message && <p role="status">{message}</p>}

        <p><Link to="/login">Back to Sign In</Link></p>
      </div>
    </div>
  )
}

export function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [complete, setComplete] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (password !== confirm) {
      setMessage('Passwords do not match.')
      return
    }

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: password
        })
      })

      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        setComplete(true)
      }
    } catch {
      setMessage('Unable to connect to server.')
    }
  }

  return (
    <div className="page">
      <div className="form-box">
        <h1>MapMaker</h1>
        <h2>Create New Password</h2>

        {!token && <p>Invalid reset link.</p>}

        {token && !complete && (
          <form onSubmit={handleSubmit}>
            <label>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />

            <label>Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={8}
              required
            />

            <button type="submit">Update Password</button>
          </form>
        )}

        {message && <p role="status">{message}</p>}

        <p><Link to="/login">Back to Sign In</Link></p>
      </div>
    </div>
  )
}