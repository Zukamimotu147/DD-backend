import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let users = [
  {
    username: 'hello',
    password: 'world',
    photo: 'https://randomuser.me/api/portraits/men/6.jpg',
  },
];

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.post('/add-user', (req, res) => {
  const { username, password, photo } = req.body;

  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  if (!username || !password || !photo) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const newUser = {
    username,
    password,
    photo,
  };

  users.push(newUser);
  res.status(201).json({ message: 'User added successfully', user: newUser });
});

app.put('/update-photo', (req, res) => {
  const { username, photo } = req.body;
  const user = users.find((u) => u.username === username);

  if (user) {
    user.photo = photo;
    res.status(200).json({ message: 'Photo updated successfully', user });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.get('/users', (req, res) => {
  res.status(200).json(users);
});

app.get('/', (req, res) => {
  res.send('I love sir dd');
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
