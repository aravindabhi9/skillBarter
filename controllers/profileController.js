const { User, Skill } = require('../models');

// Get logged-in user's profile
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'bio', 'contactNumber', 'whatsappNumber'],
      include: [
        {
          model: Skill,
          as: 'Skills',
          attributes: ['id', 'title', 'type', 'description', 'price', 'barterWith']
        }
      ]
    });

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update logged-in user's profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio, contactNumber, whatsappNumber } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.contactNumber = contactNumber || user.contactNumber;
    user.whatsappNumber = whatsappNumber || user.whatsappNumber;

    await user.save();

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add a newly learned skill after a successful booking
exports.addLearnedSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skillTitle, skillType, description } = req.body;

    const newSkill = await Skill.create({
      title: skillTitle,
      type: skillType,
      description,
      userId
    });

    res.status(201).json({ message: 'Learned skill added to profile', skill: newSkill });
  } catch (error) {
    console.error('Error adding learned skill:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Optional: Get another user's public profile (for viewing from search)
exports.getUserProfileById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email'],
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
