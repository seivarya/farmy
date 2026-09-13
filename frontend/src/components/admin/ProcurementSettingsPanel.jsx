import { useEffect, useState } from "react";
import { getAdminProcurementSettings, updateAdminProcurementSettings } from "../../api/admin";

const formatSlot = (time) => {
  const [hourText, minute] = time.split(":");
  const hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${String(hour12).padStart(2, "0")}:${minute} ${suffix}`;
};

const createSlotLabel = (startTime, endTime) => `${formatSlot(startTime)} - ${formatSlot(endTime)}`;

function ProcurementSettingsPanel({ onError }) {
  const [timeSlots, setTimeSlots] = useState([]);
  const [capacity, setCapacity] = useState(5);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await getAdminProcurementSettings();
        setTimeSlots(response.settings.timeSlots);
        setCapacity(response.settings.capacityPerSlot);
      } catch (requestError) {
        onError(requestError.message);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [onError]);

  const addTimeSlot = () => {
    setMessage("");
    if (startTime >= endTime) {
      onError("A slot must end after it starts.");
      return;
    }

    const newSlot = createSlotLabel(startTime, endTime);
    if (timeSlots.includes(newSlot)) {
      onError(`${newSlot} already exists in this schedule.`);
      return;
    }

    if (timeSlots.length >= 12) {
      onError("A procurement schedule can contain up to 12 time slots.");
      return;
    }

    setTimeSlots((current) => [...current, newSlot]);
  };

  const removeTimeSlot = (slotToRemove) => {
    setMessage("");
    if (timeSlots.length === 1) {
      onError("A procurement schedule must keep at least one time slot.");
      return;
    }

    setTimeSlots((current) => current.filter((slot) => slot !== slotToRemove));
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    if (timeSlots.length === 0) {
      onError("Add at least one time slot before saving.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const response = await updateAdminProcurementSettings(timeSlots, Number(capacity));
      setTimeSlots(response.settings.timeSlots);
      setCapacity(response.settings.capacityPerSlot);
      setMessage("Future slot availability updated.");
    } catch (requestError) {
      onError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading procurement settings…</p>;

  return (
    <section className="admin-settings-panel">
      <div className="admin-settings-heading">
        <div>
          <p className="admin-eyebrow">OPERATIONS</p>
          <h2>Procurement schedule settings</h2>
        </div>
        <span className="admin-slot-count">{timeSlots.length} slots</span>
      </div>
      <p>These controls affect future availability only. Existing bookings remain unchanged.</p>

      <form className="admin-decision-form" onSubmit={saveSettings}>
        <fieldset className="admin-slot-fieldset">
          <legend>Configured time slots</legend>
          <div className="admin-slot-list" aria-live="polite">
            {timeSlots.map((slot) => (
              <span className="admin-time-slot" key={slot}>
                {slot}
                <button
                  type="button"
                  onClick={() => removeTimeSlot(slot)}
                  disabled={timeSlots.length === 1}
                  title={timeSlots.length === 1 ? "A procurement schedule needs at least one time slot." : undefined}
                  aria-label={`Remove ${slot}`}
                >
                  Remove
                </button>
              </span>
            ))}
          </div>
          {timeSlots.length === 1 && (
            <p className="admin-slot-protection-note">
              Keep at least one time slot in the schedule.
            </p>
          )}
        </fieldset>

        <fieldset className="admin-slot-fieldset">
          <legend>Add a time slot</legend>
          <div className="admin-slot-builder">
            <label>
              Starts
              <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} required />
            </label>
            <label>
              Ends
              <input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} required />
            </label>
            <button type="button" className="admin-outline-button" onClick={addTimeSlot}>Add slot</button>
          </div>
        </fieldset>

        <label>
          Capacity per slot
          <input type="number" min="1" max="100" value={capacity} onChange={(event) => setCapacity(event.target.value)} required />
        </label>
        <button type="submit" disabled={saving || timeSlots.length === 0}>
          {saving ? "Saving…" : "Save schedule settings"}
        </button>
      </form>
      {message && <p className="admin-success">{message}</p>}
    </section>
  );
}

export default ProcurementSettingsPanel;
