import express from 'express';
import { registerUser, activateUser, logoutUser, loginUser, updateAccessToken, getUserInfo, socialAuth, updateUserInfo, updateUserPassword, updateProfilePicture, getAllUsers, updateUserRole, deleteUser    } from '../controllers/user.controller';
import { isAuthenticated, authorizeRoles, updateAccessToken as updateAccessTokenMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/register', registerUser);
router.post('/activate-user', activateUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/logout', isAuthenticated, logoutUser); // Also support GET for logout
router.post('/refresh', updateAccessTokenMiddleware, updateAccessToken); // Refresh access token
router.get('/refresh', updateAccessTokenMiddleware, updateAccessToken); // Also support GET for refresh
router.get('/me', isAuthenticated, getUserInfo); // Get user info
router.post('/social-auth', socialAuth); // Social auth
router.put('/update-user-info', isAuthenticated, updateUserInfo); // Update user info
router.put('/update-user-password', isAuthenticated, updateUserPassword); // Update user password
router.put('/update-avatar', isAuthenticated, updateProfilePicture); // Update profile picture
router.get('/get-all-users', isAuthenticated, authorizeRoles("admin"), getAllUsers);
router.put('/update-user-role', isAuthenticated, authorizeRoles("admin"), updateUserRole);
router.delete('/delete-user/:userId', isAuthenticated, authorizeRoles("admin"), deleteUser);
export default router;


