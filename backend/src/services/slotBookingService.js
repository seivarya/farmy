const { Slot } = require("../models/Slot");

const getSlotAvailability = async ({ date, timeSlots, capacityPerSlot }) => {
  const activeBookings = await Slot.aggregate([
    { $match: { date, status: "booked" } },
    { $group: { _id: "$timeSlot", count: { $sum: 1 } } },
  ]);

  const bookingsByTimeSlot = new Map();
  for (const booking of activeBookings) {
    bookingsByTimeSlot.set(booking._id, booking.count);
  }

  return timeSlots.map((timeSlot) => {
    const bookedCount = bookingsByTimeSlot.get(timeSlot) || 0;
    const remainingCapacity = Math.max(0, capacityPerSlot - bookedCount);
    return {
      timeSlot,
      totalCapacity: capacityPerSlot,
      bookedCount,
      available: remainingCapacity > 0,
      remainingCapacity,
    };
  });
};

const findOpenBookingSequence = (bookings, capacity) => {
  const usedSequences = new Set(
    bookings
      .map((booking) => booking.bookingSequence)
      .filter(Boolean),
  );

  for (let sequence = 1; sequence <= capacity; sequence += 1) {
    if (!usedSequences.has(sequence)) {
      return sequence;
    }
  }

  return null;
};

const reserveSlotWithinCapacity = async ({
  farmerId,
  ticketId,
  date,
  timeSlot,
  cropType,
  quantityQuintals,
  capacity,
}) => {
  for (let attempt = 0; attempt < capacity; attempt += 1) {
    const activeBookings = await Slot.find({
      date,
      timeSlot,
      status: "booked",
    })
      .select("bookingSequence")
      .lean();

    if (activeBookings.length >= capacity) {
      return null;
    }

    const bookingSequence = findOpenBookingSequence(activeBookings, capacity);
    if (!bookingSequence) {
      return null;
    }

    try {
      return await Slot.create({
        farmerId,
        ticketId,
        date,
        timeSlot,
        bookingSequence,
        cropType,
        quantityQuintals,
        status: "booked",
      });
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }
    }
  }

  return null;
};

const cancelReservedSlot = async (slot) => {
  slot.status = "cancelled";
  await slot.save();
  return slot;
};

module.exports = {
  cancelReservedSlot,
  getSlotAvailability,
  reserveSlotWithinCapacity,
};
