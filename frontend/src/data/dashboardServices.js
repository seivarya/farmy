import {
  CalendarIcon,
  TargetIcon,
  ClipboardIcon,
  ActivityIcon,
  CreditCardIcon,
  FileTextIcon,
} from "../components/common/Icons";

export const dashboardServices = [
  { number: "01", icon: CalendarIcon, iconClass: "gold", title: "PROCUREMENT SCHEDULE", description: "View crop-wise MSP calendars, procurement operational schedules, daily intake quotas, and purchase limits.", action: "View Schedule", destination: "schedule" },
  { number: "02", icon: TargetIcon, iconClass: "yellow", badge: "HIGH DEMAND", title: "CROP IN DEMAND", description: "View high-demand crops required in large volumes by the government, national procurement quotas, and priority intake.", action: "View High Demand Crops", destination: "demand" },
  { number: "03", icon: ClipboardIcon, iconClass: "peach", title: "PROCUREMENT CENTER & SLOT BOOKING", description: "Choose your designated cooperative center, select a preferred intake date, and reserve real-time weighbridge slots.", action: "Book Center Slot", destination: "slots" },
  { number: "04", icon: ActivityIcon, iconClass: "blue", title: "PROCUREMENT TICKET STATUS", description: "Use your unique procurement ticket to track review, slot booking, scheduling, and completion status.", action: "Check Ticket Status", destination: "tickets" },
  { number: "05", icon: CreditCardIcon, iconClass: "green", title: "FINALIZE PROCUREMENT & PAYMENT", description: "Inspect verified gross weights, view certified moisture assay grades, and confirm direct bank DBT transfer.", action: "Authorize DBT Payment" },
  { number: "06", icon: FileTextIcon, iconClass: "cream", title: "TRANSACTION & PAYMENT HISTORY", description: "Access Direct Benefit Transfer (DBT) bank logs, government payment vouchers, and transaction reference numbers.", action: "View Statements" },
];
