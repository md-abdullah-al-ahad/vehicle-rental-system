export interface AuthPayload {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "customer";
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "customer";
}

export interface UserWithPassword extends User {
  password: string;
}

export interface Vehicle {
  id: number;
  vehicle_name: string;
  type: "car" | "bike" | "van" | "SUV";
  registration_number: string;
  daily_rent_price: number;
  availability_status: "available" | "booked";
}

export interface Booking {
  id: number;
  customer_id: number;
  vehicle_id: number;
  rent_start_date: Date;
  rent_end_date: Date;
  total_price: number;
  status: "active" | "cancelled" | "returned";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginResponse {
  token: string;
  user: User;
}
