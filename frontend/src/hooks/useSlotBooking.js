/* eslint-disable react-hooks/set-state-in-effect -- api loaders update state after requests begin. */
import { useCallback, useEffect, useMemo, useState } from "react";
import { bookSlot, cancelSlot, getAvailableSlots, getMySlots } from "../api/slots";
import { getMyTickets } from "../api/tickets";

const today = new Date().toISOString().split("T")[0];

export function useSlotBooking() {
  const [selectedDate, setSelectedDate] = useState(today);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [myBookings, setMyBookings] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const loadAvailableSlots = useCallback(async (date) => {
    setLoadingSlots(true);
    try {
      const response = await getAvailableSlots(date);
      if (response.success && response.slots) {
        setAvailableSlots(response.slots);
        setSelectedSlot("");
      }
    } catch (error) {
      console.error("error loading availability:", error);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  const loadMyBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const response = await getMySlots();
      if (response.success && response.slots) setMyBookings(response.slots);
    } catch (error) {
      console.error("error loading bookings:", error);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  const loadMyTickets = useCallback(async () => {
    try {
      const response = await getMyTickets();
      if (response.success) setTickets(response.tickets);
    } catch (error) {
      console.error("error loading tickets:", error);
    }
  }, []);

  useEffect(() => { loadAvailableSlots(selectedDate); }, [loadAvailableSlots, selectedDate]);
  useEffect(() => { loadMyBookings(); }, [loadMyBookings]);
  useEffect(() => { loadMyTickets(); }, [loadMyTickets]);

  const submitBooking = useCallback(async (event) => {
    event.preventDefault();
    setFeedback({ type: "", message: "" });
    if (!selectedTicketId || !selectedSlot) {
      setFeedback({ type: "error", message: "Select an active procurement ticket and an available time slot." });
      return;
    }

    setIsBooking(true);
    try {
      await bookSlot({ date: selectedDate, timeSlot: selectedSlot, ticketId: selectedTicketId });
      setFeedback({ type: "success", message: `Slot booked successfully for ${selectedDate} (${selectedSlot}).` });
      setSelectedSlot("");
      setSelectedTicketId("");
      await Promise.all([loadAvailableSlots(selectedDate), loadMyBookings(), loadMyTickets()]);
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setIsBooking(false);
    }
  }, [loadAvailableSlots, loadMyBookings, loadMyTickets, selectedDate, selectedSlot, selectedTicketId]);

  const cancelBooking = useCallback(async (slotId) => {
    if (!window.confirm("Are you sure you want to cancel this procurement slot?")) return;
    try {
      await cancelSlot(slotId);
      setFeedback({ type: "success", message: "Procurement slot has been cancelled." });
      await Promise.all([loadMyBookings(), loadAvailableSlots(selectedDate)]);
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    }
  }, [loadAvailableSlots, loadMyBookings, selectedDate]);

  const bookableTickets = useMemo(() => tickets.filter((ticket) => ticket.status === "accepted"), [tickets]);
  const pendingTickets = useMemo(() => tickets.filter((ticket) => ["submitted", "under_review"].includes(ticket.status)), [tickets]);
  const activeBookingsCount = useMemo(() => myBookings.filter((booking) => booking.status === "booked").length, [myBookings]);
  const form = useMemo(() => ({
    availableSlots,
    bookableTickets,
    isBooking,
    loadingSlots,
    pendingTickets,
    selectedDate,
    selectedSlot,
    selectedTicketId,
    setSelectedDate,
    setSelectedSlot,
    setSelectedTicketId,
    submitBooking,
    today,
  }), [availableSlots, bookableTickets, isBooking, loadingSlots, pendingTickets, selectedDate, selectedSlot, selectedTicketId, submitBooking]);
  const history = useMemo(() => ({ bookings: myBookings, isLoading: loadingBookings, onCancel: cancelBooking }), [cancelBooking, loadingBookings, myBookings]);

  return { activeBookingsCount, feedback, form, history };
}
