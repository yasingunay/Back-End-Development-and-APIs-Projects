const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded bodies
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});




const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('MongoDB URI is not defined in the environment variables.');
} else {
  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));
  db.once('open', () => {
    console.log('Connected to MongoDB');
  });
}

const { Schema } = mongoose; // Import the mongoose Schema object

// Create a new schema that describes a user
const userSchema = new Schema({
    username: { type: String, required: true },
    });

// Create a new model using the schema
const User = mongoose.model('User', userSchema);


// Create a new schema that describes an exercise
const exerciseSchema = new Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: Number,
  date: Date,
});

// Create a new model using the schema
const Exercise = mongoose.model('Exercise', exerciseSchema);



app.post('/api/users', async (req, res) => {
    console.log(req.body);
    const { username } = req.body;
  
    try {
      const user = new User({ username });
      const savedUser = await user.save();
      
      res.json({
        username: savedUser.username,
        _id: savedUser._id,
      });
    } catch (err) {
      res.json({ error: err.message });
    }
  });

// Get all users with only username and _id fields
app.get('/api/users', async (req, res) => {
    try {
      const users = await User.find({}, '_id username');
      
      // Map the array to include only username and _id fields
      const simplifiedUsers = users.map(user => ({
        _id: user._id,
        username: user.username,
      }));
  
      res.json(simplifiedUsers);
    } catch (err) {
      res.json({ error: err.message });
    }
  });


  // Add exercise for a specific user
app.post('/api/users/:_id/exercises', async (req, res) => {
    const { _id } = req.params;
    const { description, duration, date } = req.body;
  
    try {
      const user = await User.findById(_id);
  
      if (!user) {
        return res.json({ error: 'User not found' });
      }
  
      const exercise = new Exercise({
        userId: _id,
        description,
        duration,
        date: date ? new Date(date) : new Date(),
      });
  
      const savedExercise = await exercise.save();
  
      res.json({
        username: user.username,
        description: savedExercise.description,
        duration: savedExercise.duration,
        date: savedExercise.date.toDateString(),
        _id: user._id,
      });
    } catch (err) {
      res.json({ error: err.message });
    }
  });

  // Get full exercise log for a specific user
app.get('/api/users/:_id/logs', async (req, res) => {
    const { _id } = req.params;
    const { from, to, limit } = req.query;
  
    try {
      const user = await User.findById(_id);
  
      if (!user) {
        return res.json({ error: 'User not found' });
      }
  
      const query = { userId: _id };
  
      if (from || to) {
        query.date = {};
  
        if (from) {
          query.date.$gte = new Date(from);
        }
  
        if (to) {
          query.date.$lte = new Date(to);
        }
      }
  
      let exercises;
      if (limit) {
        exercises = await Exercise.find(query).limit(parseInt(limit));
      } else {
        exercises = await Exercise.find(query);
      }
  
      res.json({
        _id: user._id,
        username: user.username,
        count: exercises.length,
        log: exercises.map(exercise => ({
          description: exercise.description,
          duration: exercise.duration,
          date: exercise.date.toDateString(),
        })),
      });
    } catch (err) {
      res.json({ error: err.message });
    }
  });
  
  



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
