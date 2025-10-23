// src/types/User.ts
export interface ContactInfo {
  phone?: string;
  website?: string;
  address?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
}

export interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  bio?: string;
  profession?: string;
  experience?: string;
  contact?: ContactInfo;
  profileImage?: string;
  followers?: string[];
  following?: string[];
  role?: "user" | "admin";
  createdAt?: string;
  updatedAt?: string;
}