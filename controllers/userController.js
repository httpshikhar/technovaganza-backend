const User = require('../models/User');
const Event = require('../models/Event');

// Get User Dashboard
const getUserDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('registeredEvents.eventId');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all active events
    const events = await Event.find({ isActive: true });

    res.json({
      success: true,
      user: {
        pid: user.pid,
        name: user.name,
        email: user.email,
        rollno: user.rollno,
        college: user.college,
        branch: user.branch,
        batch: user.batch,
        registeredEvents: user.registeredEvents,
        eventsCount: user.registeredEvents.length
      },
      events: events
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Register for Solo Event
const registerForSoloEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.userId;

    // Check event limit (max 3)
    const user = await User.findById(userId);
    if (user.registeredEvents.length >= 3) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for maximum 3 events'
      });
    }

    // Check if already registered for this EXACT event
    const alreadyRegistered = user.registeredEvents.some(
      event => event.eventId.toString() === eventId
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Check event capacity and existence
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    // Register for event
    user.registeredEvents.push({
      eventId: eventId,
      eventType: 'solo',
      registrationDate: new Date()
    });

    await user.save();

    // Update event participants count
    event.currentParticipants += 1;
    await event.save();

    // Get updated user with event details
    const updatedUser = await User.findById(userId)
      .populate('registeredEvents.eventId');

    res.json({
      success: true,
      message: 'Successfully registered for solo event',
      registeredEvents: updatedUser.registeredEvents
    });

  } catch (error) {
    console.error('Solo registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

module.exports = { getUserDashboard, registerForSoloEvent };