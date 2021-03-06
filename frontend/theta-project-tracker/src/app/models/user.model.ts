export interface User {
  id?: number;
  fullName?: string;
  firstName: string;
  lastName: string;
  role: Role;
  email: string;
  password: string;
  costToCompanyPerHour: number;
  projects?: ProjectAssigned[];
}
export interface ProjectAssigned {
  userId?: number;
  projectId?: number;
  projectName?: string;
  name?: string;
  costToClientPerHour?: number
}
export enum Role {
  USER = 'user',
  ADMIN = 'admin'
}
export interface UserCreate {
  user: User
  projects: ProjectAssigned[]
}
export interface PasswordEmailChange {
  newEmail?: string;
  newPassword?: string;
  password: string;
}
export interface UserUpdate {
  user: User
}
export interface UserProjectsUpdate {
  deleted: UserProjectsDel[];
  created: ProjectAssigned[];
}
export interface UserProjectsDel {
  userId: number;
  projectId: number
}