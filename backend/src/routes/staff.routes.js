const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const staffCtrl = require('../controllers/staff.controller');

// Owner: list all registered staff (browse directory)
router.get('/directory', auth, checkRole('salonowner', 'superadmin'), staffCtrl.listAllStaff);

// Owner: send invite
router.post('/invites', auth, checkRole('salonowner', 'superadmin'), staffCtrl.sendInvite);

// Owner: list invites for my salons
router.get('/invites', auth, checkRole('salonowner', 'superadmin'), staffCtrl.listSalonInvites);

// Owner: revoke invite
router.post('/invites/:id/revoke', auth, checkRole('salonowner', 'superadmin'), staffCtrl.revokeInvite);

// Staff: list my invites
router.get('/my/invites', auth, checkRole('staff'), staffCtrl.listMyInvites);

// Staff: respond to invite (accept/decline)
router.post('/invites/:id/respond', auth, checkRole('staff'), staffCtrl.respondInvite);

// Owner: approve accepted invite
router.post('/invites/:id/approve', auth, checkRole('salonowner', 'superadmin'), staffCtrl.approveInvite);

module.exports = router;