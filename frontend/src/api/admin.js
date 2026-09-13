import adminClient from "./adminClient";

export const loginAdmin = (officialEmail, password) =>
  adminClient.post("/admin/auth/login", { officialEmail, password });

export const signupAdmin = (data) => adminClient.post("/admin/auth/signup", data);

export const getCurrentAdmin = () => adminClient.get("/admin/auth/me");

export const getAdminTickets = (status = "", search = "") =>
  adminClient.get("/admin/tickets", { params: { ...(status && { status }), ...(search && { search }) } });

export const getAdminTicket = (ticketId) => adminClient.get(`/admin/tickets/${encodeURIComponent(ticketId)}`);

export const updateAdminTicketStatus = (ticketId, status, note) =>
  adminClient.patch(`/admin/tickets/${encodeURIComponent(ticketId)}/status`, { status, note });

export const updateFarmerProfileByAdmin = (farmerId, data) =>
  adminClient.patch(`/admin/farmers/${encodeURIComponent(farmerId)}/profile`, data);

export const sendFarmerNotification = (farmerId, data) =>
  adminClient.post(`/admin/farmers/${encodeURIComponent(farmerId)}/notifications`, data);

export const getAdminProcurementSettings = () => adminClient.get("/admin/settings/procurement");

export const updateAdminProcurementSettings = (timeSlots, capacityPerSlot) =>
  adminClient.patch("/admin/settings/procurement", { timeSlots, capacityPerSlot });
