const User = require('../models/User')

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' })
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ error: 'Email already in use' })
    const user = new User({ name, email })
    await user.setPassword(password)
    await user.save()
    return res.status(201).json({ user: { id: user._id, name: user.name, email: user.email } })
  } catch (err) {
    return next(err)
  }
}

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' })
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ error: 'Invalid credentials' })
    const ok = await user.comparePassword(password)
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' })
    return res.json({ user: { id: user._id, name: user.name, email: user.email } })
  } catch (err) {
    return next(err)
  }
}
