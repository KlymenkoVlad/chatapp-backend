import { Request } from "express";

export type CustomRequest = Request & {
  userId?: string;
  username?: string;
};

export interface IUser {
  _id: string;
  name: string;
  lastname?: string;
  mainPicture?: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IChat {
  messagesWith: string;
  user: IUser;
  lastMessage?: string;
  date?: string;
}
