interface UserModel {
  id: string; //
  name: string;
  deleted_id: string;
  email: string; //
  password: string;
  role: string;
  created_at: string; //
  updated_at: string;
  deleted_at: string;
  state_id: string;
}

// export type User = Omit<UserModel, 'id' | 'name' | 'password' | 'userSessionToken' | 'created_at' | 'updated_at' | 'deleted_id' | 'deleted_at'>;
export type UserLogin = Pick<UserModel, 'email' | 'password'>;
export type UserRegister = Pick<UserModel, 'name' | 'email' | 'password'>;
export type UserSession = Pick<UserModel, 'email' | 'role' | 'name'>;
export type UserRole = Pick<UserModel, 'role'>;
export type UserProfile = Pick<UserModel, 'name' | 'email' | 'role' | 'state_id'>;

export type UserCreated = Omit<UserModel, 'deleted_at' | 'deleted_id'>; //API UpdateByTimestamp
export type UserModified = Pick<UserModel, 'name'>; //API UpdateByTimestamp //FIXME: no se que trae
export type UserDeleted = Pick<UserModel, 'id' | 'deleted_id' | 'created_at' | 'state_id'>; //API UpdateByTimestamp
