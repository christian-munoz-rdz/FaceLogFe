import { UserCodeCategoryType, UserLogTimeActionType, UserRoleIdType } from "../../types/user/user.type";
import { AreaModel } from "../area/area.model";

export interface UserPayloadModel {
  name: string;
  email: string;
  role_id: number;
  codes: UserCodePayloadModel[];
  areas: AreaModel[];
}

export interface UserModel {
  id: number;
  name: string;
  email: string | null;
  role_id: UserRoleIdType;
  codes: UserCodeModel[];
  areas: AreaModel[];
  created_at: string;
}

export interface UserWithPhotoModel extends UserModel{
  photos: UserPhotoModel[];
}

export interface UserPhotoModel {
  id: number | null;
  user_id: number;
  photo: Array<Array<number>>;
  type: string;
  created_at: string;
}

export interface UserCodeModel {
  id: number | null;
  user_id: number | null;
  code: string | null;
  category: UserCodeCategoryType;
}

export interface UserCodePayloadModel {
  code: string;
  category: UserCodeCategoryType;
}

export interface UserCodeCategoryOptionsModel {
  type: UserCodeCategoryType;
  name: string;
}

export interface UserLogTimePayloadModel {
  area_id: number;
  action: UserLogTimeActionType;
  photo: Array<Array<number>>;
}