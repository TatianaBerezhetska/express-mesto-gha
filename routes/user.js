const router = require('express').Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateAvatar,
} = require('../controllers/user');

router.get('/', getUsers);
router.get('/:userId', getUser);
router.post('/', createUser);
router.patch('/me', updateUser);
router.patch('/me/avatar', updateAvatar);

module.exports = router;
