// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// const app = express();
// app.use(express.json());
// app.use(cors({
//   origin: 'http://localhost:4200', // Ensure CORS allows frontend requests
//   credentials: true
// }));

// // 🔹 Database Connection with Improved Debugging
// mongoose.connect('mongodb://127.0.0.1:27017/auth_db', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => console.log('✅ MongoDB Connected'))
//   .catch(err => console.error('❌ MongoDB Connection Error:', err));

// // ✅ Define User Schema
// const UserSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true }
// });
// const User = mongoose.model('User', UserSchema);

// // ✅ Register Endpoint with Debugging
// app.post('/register', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({ name, email, password: hashedPassword });
//     await newUser.save();

//     console.log('✅ User Registered:', newUser);
//     res.json({ message: 'Registration successful' });

//   } catch (error) {
//     console.error('❌ Registration Error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // ✅ Login Endpoint with Debugging
// app.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'User not found' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });

//     console.log('✅ User Logged In:', user);
//     res.json({ message: 'Login successful', token });

//   } catch (error) {
//     console.error('❌ Login Error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // ✅ Start Server
// const PORT = 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
 
const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
 
// 🔹 Connect to MongoDB Atlas
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://surya:surya2409@cluster0.9ilu5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
 
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Atlas Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));
 
// ✅ Define User Schema with Validations
const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    maxlength: 35,
    match: /^[A-Za-z][A-Za-z\s]*$/
  },
  last_name: {
    type: String,
    required: true,
    maxlength: 35,
    match: /^[A-Za-z][A-Za-z\s]*$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: function(value) {
        return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value);
      },
      message: 'Password must contain at least one uppercase letter, one number, and one special character'
    }
  },
  createdDate: {
    type: Date,
    default: () => new Date().toISOString()
  },
  updatedDate: {
    type: Date,
    default: () => new Date().toISOString()
  }
});
const User = mongoose.model('User', UserSchema);
 
// ✅ Register Endpoint
app.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
   
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
 
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
 
    const hashedPassword = await bcrypt.hash(password, 10);
   
    const newUser = new User({
      first_name,
      last_name,
      email: email.toLowerCase(),
      password: hashedPassword
    });
 
    await newUser.save();
    console.log('✅ User Registered:', newUser);
 
    res.status(201).json({ message: 'Registration successful' });
 
  } catch (error) {
    console.error('❌ Registration Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
 
// ✅ Login Endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
   
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
 
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
 
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
 
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1h' });
 
    console.log('✅ User Logged In:', user);
    res.json({ message: 'Login successful', token });
 
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
 
// ✅ Update User
app.put('/update-user/:id', async (req, res) => {
  try {
    const { first_name, last_name } = req.body;
    const { id } = req.params;
 
    if (!first_name || !last_name) {
      return res.status(400).json({ message: 'First name and last name are required' });
    }
 
    const updatedUser = await User.findByIdAndUpdate(id,
      { first_name, last_name, updatedDate: new Date().toISOString() },
      { new: true }
    );
 
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
 
    console.log('✅ User Updated:', updatedUser);
    res.json({ message: 'User updated successfully' });
 
  } catch (error) {
    console.error('❌ Update Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
 
// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));