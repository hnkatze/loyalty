import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config";
import type { Appointment, AppointmentStatus, EmployeeAvailability, BusinessHours } from "@/types";

const COLLECTION = "appointments";

const checkDb = () => {
  if (!db) {
    throw new Error("Firebase no está configurado. Verifica las variables de entorno.");
  }
  return db;
};

// Crear cita
export const createAppointment = async (data: {
  establishmentId: string;
  clientId: string;
  serviceId: string;
  employeeId: string;
  date: Date;
  duration: number;
  notes?: string;
}): Promise<string> => {
  const firestore = checkDb();

  // Construir objeto sin campos undefined (Firestore no los acepta)
  const appointmentData: Record<string, unknown> = {
    establishmentId: data.establishmentId,
    clientId: data.clientId,
    serviceId: data.serviceId,
    employeeId: data.employeeId,
    date: Timestamp.fromDate(data.date),
    duration: data.duration,
    status: "pending" as AppointmentStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Solo agregar notes si tiene valor
  if (data.notes) {
    appointmentData.notes = data.notes;
  }

  const docRef = await addDoc(collection(firestore, COLLECTION), appointmentData);
  return docRef.id;
};

// Obtener cita por ID
export const getAppointment = async (appointmentId: string): Promise<Appointment | null> => {
  const firestore = checkDb();
  const docRef = doc(firestore, COLLECTION, appointmentId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    date: data.date?.toDate() || new Date(),
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Appointment;
};

// Obtener citas por establecimiento en un rango de fechas
export const getAppointmentsByEstablishment = async (
  establishmentId: string,
  startDate: Date,
  endDate: Date
): Promise<Appointment[]> => {
  const firestore = checkDb();
  const q = query(
    collection(firestore, COLLECTION),
    where("establishmentId", "==", establishmentId),
    where("date", ">=", Timestamp.fromDate(startDate)),
    where("date", "<=", Timestamp.fromDate(endDate)),
    orderBy("date", "asc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Appointment;
  });
};

// Obtener citas de un empleado en una fecha específica
export const getAppointmentsByEmployee = async (
  employeeId: string,
  date: Date
): Promise<Appointment[]> => {
  const firestore = checkDb();

  // Inicio y fin del día
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const q = query(
    collection(firestore, COLLECTION),
    where("employeeId", "==", employeeId),
    where("date", ">=", Timestamp.fromDate(startOfDay)),
    where("date", "<=", Timestamp.fromDate(endOfDay)),
    orderBy("date", "asc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Appointment;
  });
};

// Obtener citas de un cliente
export const getAppointmentsByClient = async (
  clientId: string
): Promise<Appointment[]> => {
  const firestore = checkDb();
  const q = query(
    collection(firestore, COLLECTION),
    where("clientId", "==", clientId),
    orderBy("date", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Appointment;
  });
};

// Actualizar cita
export const updateAppointment = async (
  appointmentId: string,
  data: Partial<Omit<Appointment, "id" | "createdAt" | "establishmentId">>
): Promise<void> => {
  const firestore = checkDb();
  const docRef = doc(firestore, COLLECTION, appointmentId);

  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  if (data.date) {
    updateData.date = Timestamp.fromDate(data.date);
  }

  await updateDoc(docRef, updateData);
};

// Actualizar solo el estado de la cita
export const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus
): Promise<void> => {
  const firestore = checkDb();
  const docRef = doc(firestore, COLLECTION, appointmentId);
  await updateDoc(docRef, {
    status,
    updatedAt: serverTimestamp(),
  });
};

// Eliminar cita
export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  const firestore = checkDb();
  const docRef = doc(firestore, COLLECTION, appointmentId);
  await deleteDoc(docRef);
};

// Obtener slots disponibles para un empleado en una fecha
export const getAvailableSlots = async (
  employeeId: string,
  employeeAvailability: EmployeeAvailability,
  serviceDuration: number,
  date: Date,
  establishmentHours?: BusinessHours
): Promise<string[]> => {
  // Obtener el día de la semana
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayOfWeek = days[date.getDay()] as keyof BusinessHours;

  // Verificar si el empleado trabaja ese día, usar horario del establecimiento como fallback
  let daySchedule = employeeAvailability[dayOfWeek];

  // Si el empleado no tiene horario configurado, usar el del establecimiento
  if (!daySchedule && establishmentHours) {
    const estHours = establishmentHours[dayOfWeek];
    if (estHours && !estHours.closed) {
      daySchedule = { start: estHours.open, end: estHours.close };
    }
  }

  if (!daySchedule) return [];

  const { start, end } = daySchedule;

  // Obtener citas existentes del empleado ese día
  const existingAppointments = await getAppointmentsByEmployee(employeeId, date);

  // Filtrar solo citas activas (no canceladas)
  const activeAppointments = existingAppointments.filter(
    (apt) => apt.status !== "cancelled"
  );

  // Generar slots de 30 minutos
  const slots: string[] = [];
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  for (let time = startMinutes; time + serviceDuration <= endMinutes; time += 30) {
    const hour = Math.floor(time / 60);
    const min = time % 60;
    const slotStart = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;

    // Verificar si el slot colisiona con alguna cita existente
    const slotDate = new Date(date);
    slotDate.setHours(hour, min, 0, 0);
    const slotEnd = new Date(slotDate.getTime() + serviceDuration * 60 * 1000);

    const hasConflict = activeAppointments.some((apt) => {
      const aptStart = apt.date;
      const aptEnd = new Date(aptStart.getTime() + apt.duration * 60 * 1000);

      // Verificar solapamiento
      return slotDate < aptEnd && slotEnd > aptStart;
    });

    if (!hasConflict) {
      slots.push(slotStart);
    }
  }

  return slots;
};

// Obtener estadísticas de citas para el dashboard
export const getAppointmentsStats = async (
  establishmentId: string,
  date: Date
): Promise<{ total: number; pending: number; confirmed: number; completed: number }> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await getAppointmentsByEstablishment(
    establishmentId,
    startOfDay,
    endOfDay
  );

  return {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  };
};
