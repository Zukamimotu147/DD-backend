import express from 'express';
import cors from 'cors';
import multer from 'multer';
import cloudinary from 'cloudinary';

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

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.post('/add-user', upload.single('photo'), async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || !req.file) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  try {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      { folder: 'sir-dd/users_profilepic' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ message: 'Photo upload failed' });
        }

        const newUser = {
          username,
          password,
          photo: result.secure_url,
        };

        users.push(newUser);
        res.status(201).json({ message: 'User added successfully', user: newUser });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error('Error during user creation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/update-profile', upload.single('photo'), async (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  let updatedPhoto = user.photo;

  if (req.file) {
    try {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        { folder: 'sir-dd/users_profilepic' },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return res.status(500).json({ message: 'Photo upload failed' });
          }

          updatedPhoto = result.secure_url;
          user.photo = updatedPhoto;
          user.username = username;
          user.password = password;
          res.status(200).json({ message: 'Profile updated successfully', user });
        }
      );

      uploadStream.end(req.file.buffer);
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      return res.status(500).json({ message: 'Photo upload failed', error });
    }
  } else {
    user.username = username;
    user.password = password;
    res.status(200).json({ message: 'Profile updated successfully', user });
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
