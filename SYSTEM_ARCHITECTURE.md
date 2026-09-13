# Farmy system architecture

## layers

```text
frontend feature
  -> api route
  -> middleware
  -> controller
  -> service
  -> mongoose model and indexes
  -> mongodb
```

- routes declare the URL, authorization requirement, and controller.
- middleware handles cross-cutting concerns: authentication, roles, rate limits, database health, errors, and metadata-only logs.
- controllers validate request inputs and choose HTTP responses.
- services contain reusable domain operations and external-provider calls.
- models own document validation and indexes.

## request flows

### farmer authentication

```text
/api/auth/send-otp
  -> auth controller
  -> otp service
  -> otp collection + sms provider

/api/auth/verify-otp
  -> auth controller
  -> otp service
  -> otp collection or twilio verify

/api/auth/register
  -> auth controller
  -> identity registry reservation
  -> farmer collection
  -> jwt token service
```

The identity registry has the only cross-collection uniqueness constraint for Aadhaar fingerprints. If farmer creation fails, its registry reservation is released.

### produce intake and ticket

```text
/api/procurements
  -> procurement controller
  -> active ticket check
  -> procurement service
  -> submission + unique ticket
```

The active-ticket partial unique index prevents duplicate active tickets for the same farmer and crop. If ticket creation loses a race, the service deletes the just-created submission.

### slot booking

```text
/api/slots/book
  -> slot controller
  -> procurement settings
  -> slot booking service
  -> slot reservation
  -> ticket status transition
```

The slot sequence index prevents capacity oversubscription. The active-ticket-booking index prevents two active slots for one ticket. If the ticket status changes after a slot is reserved, the reservation is cancelled as compensation.

### administrator operations

```text
/api/admin/*
  -> admin authentication and role middleware
  -> admin controller
  -> ticket/settings/notification services
  -> farmer, ticket, submission, settings, notification collections
```

## database design

| collection | responsibility | primary access indexes |
| --- | --- | --- |
| `farmers` | farmer account and encrypted identity fields | unique mobile number, Aadhaar fingerprint |
| `admins` | administrator account and role | unique official email, employee id, partial Aadhaar fingerprint |
| `identityregistries` | Aadhaar ownership across account types | unique Aadhaar fingerprint, owner lookup |
| `otps` | short-lived verification state | mobile number + purpose, five-minute ttl |
| `procurementsubmissions` | intake form | unique ticket id, farmer history |
| `procurementtickets` | ticket lifecycle | unique ticket id, farmer/status history, active farmer/crop constraint, status history |
| `slots` | booking and capacity | date/time occupancy, booking sequence, active ticket, farmer/date lookup |
| `procurementsettings` | the singleton slot configuration | unique `default` key |
| `farmernotifications` | in-app notifications | farmer/read state/history |

## scaling path

This is intentionally a modular monolith: it is easy to demo and deploy, but boundaries already exist for later extraction. When traffic warrants it, move SMS dispatch to an outbox worker, add cursor pagination for admin lists, and enable MongoDB transactions on a replica set for multi-document workflows. Keep the existing database constraints even after adding transactions; the constraints are the final protection against concurrent requests.
